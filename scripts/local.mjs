import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = fileURLToPath(new URL("../", import.meta.url));
const directory = `${root}.local-db`;
const data = `${directory}/data`;
const databaseUrl = "postgresql://chitouen_local@127.0.0.1:55432/chitouen_local";
const action = process.argv[2];
if (!["db", "stop", "dev", "test"].includes(action)) throw new Error("Expected db, stop, dev, or test");

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})`);
}

if (action === "stop") {
  if (existsSync(`${data}/postmaster.pid`)) run("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"]);
  process.exit(0);
}

mkdirSync(directory, { recursive: true });
if (!existsSync(`${data}/PG_VERSION`)) {
  run("initdb", ["-D", data, "-U", "chitouen_local", "--auth=trust", "--encoding=UTF8", "--locale=C"]);
}
const status = spawnSync("pg_ctl", ["-D", data, "status"], { stdio: "ignore" });
if (status.error) throw status.error;
if (status.status !== 0) {
  // No network exposure or shared Unix socket; this cluster is for this checkout only.
  run("pg_ctl", ["-D", data, "-l", `${directory}/postgres.log`, "-o", "-h 127.0.0.1 -p 55432 -k ''", "-w", "start"]);
}

const admin = new pg.Client({ connectionString: databaseUrl.replace(/chitouen_local$/, "postgres") });
await admin.connect();
try {
  const actual = await admin.query("show data_directory");
  if (actual.rows[0].data_directory !== data) throw new Error("Port 55432 belongs to a different database; refusing to modify it.");
  const found = await admin.query("select 1 from pg_database where datname = 'chitouen_local'");
  if (!found.rowCount) await admin.query("create database chitouen_local");
} finally {
  await admin.end();
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  const schema = await client.query("select to_regclass('public.exam_papers') as existing");
  if (!schema.rows[0].existing) {
    // Schema already includes paragraphs; the historical add-column migration must not run again.
    // Strip seed transaction wrappers so initial setup is all-or-nothing.
    const sql = ["deploy/postgres/001-schema.sql", "supabase/seed.sql", "deploy/postgres/003-grading.sql"]
      .map((file) => readFileSync(`${root}${file}`, "utf8").replace(/^\s*(begin|commit);\s*$/gim, ""))
      .join("\n");
    await client.query(`BEGIN;\n${sql}\nCOMMIT;`);
  }
  await client.query(readFileSync(`${root}deploy/postgres/011-email-send-budget.sql`, "utf8"));
} finally {
  await client.end();
}
console.log("Local database ready: 127.0.0.1:55432/chitouen_local (no production data).");
if (action === "db") process.exit(0);

// Explicit process values take precedence over Next.js .env files, including empty credentials.
const env = {
  ...process.env,
  NODE_ENV: "development",
  DATABASE_URL: databaseUrl,
  COOKIE_SECURE: "false",
  OTP_SECRET: "local-only-not-a-production-secret",
  EMAIL_LOGIN_ENABLED: "true",
  LOCAL_AUTH_MAIL: "1",
  DEEPSEEK_API_KEY: "",
  SES_SECRET_ID: "", SES_SECRET_KEY: "", SES_FROM_EMAIL: "",
  SMTP_HOST: "", SMTP_USER: "", SMTP_PASS: "", SMTP_FROM: "",
};
const port = action === "test" ? "3101" : "3000";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", port],
  { cwd: root, env, stdio: action === "test" ? ["ignore", "pipe", "inherit"] : "inherit" });
let exited = false;
let announcedReady = false;
let output = "";
server.stdout?.on("data", (chunk) => {
  process.stdout.write(chunk);
  output = (output + chunk.toString()).slice(-4000);
  announcedReady ||= /Ready in/.test(output);
});
server.on("exit", (code) => { exited = true; if (action === "dev") process.exit(code ?? 1); });
server.on("error", (error) => { console.error(error); process.exit(1); });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));

if (action === "test") {
  try {
    // Readiness is checked against our child; an occupied port must never select another app.
    const base = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let attempt = 0; attempt < 60 && !exited; attempt++) {
      try {
        if (announcedReady) {
          const response = await fetch(`${base}/api/health`, { redirect: "error", signal: AbortSignal.timeout(2000) });
          if (response.ok) { ready = true; break; }
        }
      } catch { /* The child may still be compiling. */ }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (!ready || exited) throw new Error("Local test server did not start. Stop npm run dev before testing.");
    const testEnv = { ...env, TEST_BASE_URL: base, ALLOW_TEST_WRITES: "1", TEST_YEAR: "2026", TEST_TEXT: "1" };
    run(process.execPath, ["tests/smoke.mjs"], testEnv);
    run(process.execPath, ["tests/core-flow.mjs"], testEnv);
    run(process.execPath, ["tests/auth-flow.mjs"], testEnv);
    run(process.execPath, ["tests/mailer.mjs"], testEnv);
    run(process.execPath, ["tests/ai-request.mjs"], testEnv);
    run(process.execPath, ["tests/content.mjs"], testEnv);
    run(process.execPath, ["tests/local-preview.mjs"], testEnv);
  } finally {
    server.kill("SIGTERM");
  }
}
