import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CircleCheck } from 'lucide-react';
import ts from 'typescript';

const source = readFileSync(new URL('../src/components/library-comparison.tsx', import.meta.url), 'utf8');
const aside = source.match(/<aside className="year-list"[\s\S]*?<\/aside>/)?.[0];
assert.ok(aside);
const javascript = ts.transpileModule(`return (${aside});`, {
  compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
}).outputText;
const render = new Function('React', 'CircleCheck', 'years', 'yearStats', 'year', 'selectYear', 'isEnglish', javascript);
for (const [stats, completed] of [[null,false], [{done:0,total:0},false], [{done:0,total:1},false], [{done:1,total:2},false], [{done:1,total:1},true], [{done:2,total:2},true], [{done:4,total:4},true]]) {
  for (const selected of [2025, 2026]) {
    for (const english of [false, true]) {
      const html = renderToStaticMarkup(render(React, CircleCheck, [2025], () => stats, selected, () => {}, english));
      assert.equal(html.includes('<svg'), completed);
      assert.equal(html.includes('is-complete'), completed);
      if (stats) assert.ok(html.includes(`${stats.done}/${stats.total}`));
      if (completed) assert.ok(html.includes(english ? 'All completed' : '全部完成'));
      assert.ok(html.includes(`aria-pressed="${selected === 2025}"`));
    }
  }
}
console.log('Year completion: loading, empty, partial, all-complete, selected and both languages passed.');
