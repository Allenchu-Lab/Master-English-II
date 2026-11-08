import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Explicit imports keep route tests isolated from production services/secrets.
export function loadTs(path, modules = {}) {
  const exports = {};
  const js = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  const errors = js.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, {
    getCurrentDirectory: () => process.cwd(), getCanonicalFileName: file => file, getNewLine: () => '\n',
  }));
  new Function('require', 'exports', js.outputText)(name => {
    if (!Object.hasOwn(modules, name)) throw new Error(`Unmocked module: ${name}`);
    return modules[name];
  }, exports);
  return exports;
}
