import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const failures = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { scan(file); continue; }
    if (file.endsWith('.css') && file !== 'src/styles/tokens.css') {
      postcss.parse(fs.readFileSync(file, 'utf8')).walkDecls(d => {
        if (d.prop.startsWith('--')) {
          failures.push(`${file}:${d.source.start.line}: define tokens in src/styles/tokens.css`);
        } else if (/[\d#]/.test(d.value.replace(/var\(--[\w-]+\)/g, ''))) {
          failures.push(`${file}:${d.source.start.line}: ${d.prop} contains a literal visual value`);
        }
      });
    }
    if (/\.[jt]sx?$/.test(file) && file !== 'src/styles/runtime-tokens.ts') {
      const text = fs.readFileSync(file, 'utf8');
      if (/\b(?:duration|delay):\s*\d/.test(text)) failures.push(`${file}: literal animation timing; use runtimeTokens`);
      if (/\bease:\s*["']/.test(text)) failures.push(`${file}: literal animation easing; use runtimeTokens`);
      if (/["'`][^"'`\n]*\d+(?:px|rem|em|vh|vw)\b/.test(text)) failures.push(`${file}: literal visual dimension; use a design token`);

      if (/#[\da-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/.test(text)) failures.push(`${file}: raw paint value in component`);
      if (/\bsize=\{\d+\}/.test(text)) failures.push(`${file}: numeric icon size; use a token-backed icon variant`);
      if (/\b(?:fontSize|borderRadius|fontWeight|marginBottom):\s*\d+/.test(text)) failures.push(`${file}: static inline style; use a token-backed CSS class`);
    }
  }
}
scan('src');
// HeroUI owns these two public primitives; every other token dependency is local.
const externalTokens = new Set(['--font-sans', '--radius-3xl']);
const tokenSource = fs.readFileSync('src/styles/tokens.css', 'utf8');
const definitions = new Set();
postcss.parse(tokenSource).walkDecls(d => definitions.add(d.prop));
for (const match of tokenSource.matchAll(/var\((--[\w-]+)/g)) {
  if (!definitions.has(match[1]) && !externalTokens.has(match[1])) {
    failures.push(`src/styles/tokens.css: undefined token ${match[1]}`);
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('Design token checks passed.');
