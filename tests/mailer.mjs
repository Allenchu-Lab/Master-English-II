import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const databaseUrl = "postgresql://chitouen_local@127.0.0.1:55432/chitouen_local";
const schema = `mail_test_${randomUUID().replaceAll("-", "")}`;
const admin = new pg.Client({ connectionString: databaseUrl });
const pool = new pg.Pool({ connectionString: databaseUrl, max: 8, options: `-c search_path=${schema}` });
const envKeys = ["NODE_ENV", "DATABASE_URL", "LOCAL_AUTH_MAIL", "EMAIL_LOGIN_ENABLED", "OTP_SECRET",
  "SES_SECRET_ID", "SES_SECRET_KEY", "SES_FROM_EMAIL", "SES_REGION", "SES_TEMPLATE_ID",
  "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];
const previous = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
const moduleUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
function compile(path, imports = {}) {
  let source = readFileSync(`${root}${path}`, "utf8").replace('import "server-only";', "");
  for (const [name, url] of Object.entries(imports)) source = source.replaceAll(`"${name}"`, `"${url}"`);
  return moduleUrl(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
}

const calls = [];
const localMail = [];
let providerError = false;
let dbError = false;
let created = false;
const migration = readFileSync(`${root}deploy/postgres/011-email-send-budget.sql`, "utf8");
const budget = async () => (await pool.query("select * from email_send_budget where id = 1")).rows[0];
const send = async (channel, message, options) => {
  calls.push({ channel, message, options });
  if (providerError) throw new Error("Simulated provider timeout");
  return { MessageId: "mock-only" };
};

await admin.connect();
try {
  assert.equal((await admin.query("show data_directory")).rows[0].data_directory, `${root}.local-db/data`);
  await admin.query(`create schema ${schema}`);
  created = true;
  // SDK and SMTP are replaced before module import: no real providers or secrets are loaded.
  globalThis.__mailerTest = {
    query: (...args) => { if (dbError) throw new Error("Simulated database failure"); return pool.query(...args); },
    ses: { v20201002: { Client: class {
      constructor(options) { this.options = options; }
      SendEmail(message) { return send("ses", message, this.options); }
    } } },
    smtp: { createTransport: (options) => ({ sendMail: (message) => send("smtp", message, options) }) },
    mkdir: async () => {},
    appendFile: async (...args) => { localMail.push(args); },
  };
  const configUrl = compile("src/lib/auth/config.ts");
  const imports = {
    "@/lib/auth/config": configUrl,
    "@/lib/db": moduleUrl("export const query = (...args) => globalThis.__mailerTest.query(...args);"),
    "tencentcloud-sdk-nodejs-ses": moduleUrl("export const ses = globalThis.__mailerTest.ses;"),
    "nodemailer": moduleUrl("export default globalThis.__mailerTest.smtp;"),
    "node:fs/promises": moduleUrl("export const { mkdir, appendFile } = globalThis.__mailerTest;"),
  };
  const { emailLoginEnabled } = await import(configUrl);
  const { sendLoginCode } = await import(compile("src/lib/auth/mailer.ts", imports));
  Object.assign(process.env, {
    NODE_ENV: "production", DATABASE_URL: databaseUrl, LOCAL_AUTH_MAIL: "", EMAIL_LOGIN_ENABLED: "true",
    OTP_SECRET: "mock-secret", SES_SECRET_ID: "mock-id", SES_SECRET_KEY: "mock-key",
    SES_FROM_EMAIL: "ChiTouEN II <noreply@mail.chitouen.cn>", SES_REGION: "ap-hongkong", SES_TEMPLATE_ID: "215390",
    SMTP_HOST: "smtp.example.invalid", SMTP_USER: "mock", SMTP_PASS: "mock", SMTP_FROM: "test@example.invalid",
  });
  const sendCode = () => sendLoginCode("mail-test@example.invalid", "012345");
  assert.equal(emailLoginEnabled(), true);
  await assert.rejects(sendCode, /does not exist/);
  assert.equal(calls.length, 0, "Missing migration must fail closed");
  await pool.query(migration);
  await assert.rejects(sendCode, /budget/);
  await pool.query("update email_send_budget set send_limit = 5 where id = 1");
  for (const key of ["SES_SECRET_ID", "SES_SECRET_KEY", "SES_FROM_EMAIL", "SES_REGION", "SES_TEMPLATE_ID"]) {
    const value = process.env[key];
    process.env[key] = "";
    assert.equal(emailLoginEnabled(), false, `Partial SES config must not fall back to SMTP: ${key}`);
    await assert.rejects(sendCode, /disabled or not configured/);
    process.env[key] = value;
  }
  for (const id of ["0", "-1", "1.5", "NaN", "1e2", " 215390", "9007199254740992"]) {
    process.env.SES_TEMPLATE_ID = id;
    assert.equal(emailLoginEnabled(), false);
    await assert.rejects(sendCode);
  }
  process.env.SES_TEMPLATE_ID = "215390";
  process.env.EMAIL_LOGIN_ENABLED = "false";
  await assert.rejects(sendCode);
  process.env.EMAIL_LOGIN_ENABLED = "true";
  assert.equal((await budget()).reserved_count, 0);
  assert.equal(calls.length, 0);

  const results = await Promise.allSettled(Array.from({ length: 20 }, sendCode));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 5);
  assert.equal(calls.length, 5, "20 parallel requests must consume only 5 available sends");
  assert.equal((await budget()).reserved_count, 5);
  for (const call of calls) {
    assert.equal(call.channel, "ses");
    assert.equal(call.options.region, "ap-hongkong");
    assert.equal(call.options.profile.httpProfile.reqTimeout, 15);
    assert.deepEqual(call.message, {
      FromEmailAddress: process.env.SES_FROM_EMAIL, Destination: ["mail-test@example.invalid"],
      Subject: "ChiTouEN II 登录验证码", TriggerType: 1,
      Template: { TemplateID: 215390, TemplateData: '{"code":"012345"}' },
    });
  }
  await pool.query(migration);
  assert.equal((await budget()).reserved_count, 5, "Repeated migration must not reset usage");
  assert.equal((await budget()).send_limit, 5);
  const reloaded = await import(`${compile("src/lib/auth/mailer.ts", imports)}#restart`);
  await assert.rejects(() => reloaded.sendLoginCode("mail-test@example.invalid", "012345"), /budget/);
  assert.equal(calls.length, 5, "Reloaded module must keep the persistent budget");

  await pool.query("update email_send_budget set send_limit = 7 where id = 1");
  providerError = true;
  await assert.rejects(sendCode, /timeout/);
  assert.equal(calls.length, 6, "Provider failure must not retry or fall back to SMTP");
  assert.equal((await budget()).reserved_count, 6, "Ambiguous delivery keeps its reservation");
  providerError = false;
  dbError = true;
  await assert.rejects(sendCode, /database failure/);
  assert.equal(calls.length, 6);
  dbError = false;
  for (const key of ["SES_SECRET_ID", "SES_SECRET_KEY", "SES_FROM_EMAIL"]) process.env[key] = "";
  assert.equal(emailLoginEnabled(), true);
  await sendCode();
  assert.equal(calls.at(-1).channel, "smtp");
  await assert.rejects(sendCode, /budget/);
  assert.equal(calls.length, 7, "SMTP shares the same lifetime budget");
  await assert.rejects(() => pool.query("update email_send_budget set send_limit = 1001"), /check constraint/);
  await pool.query("update email_send_budget set send_limit = 0 where id = 1");
  await assert.rejects(sendCode, /budget/);
  await pool.query("delete from email_send_budget where id = 1");
  await assert.rejects(sendCode, /budget/);

  process.env.LOCAL_AUTH_MAIL = "1";
  assert.equal(emailLoginEnabled(), false);
  await assert.rejects(sendCode);
  process.env.NODE_ENV = "development";
  process.env.DATABASE_URL = "postgresql://example.invalid/other";
  await assert.rejects(sendCode);
  process.env.DATABASE_URL = databaseUrl;
  dbError = true;
  await sendCode();
  assert.equal(localMail.length, 1);
  assert.equal(JSON.parse(localMail[0][1]).code, "012345");
  assert.equal(calls.length, 7, "Isolated local mail never calls a provider or spends quota");
  console.log("Mailer tests passed: templates, fail-closed configuration, atomic persistent quota, failure handling and local isolation; no real email sent.");
} finally {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  delete globalThis.__mailerTest;
  await pool.end();
  if (created) await admin.query(`drop schema ${schema} cascade`);
  await admin.end();
}
