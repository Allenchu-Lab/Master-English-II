import re
import subprocess
from pathlib import Path
from pypdf import PdfReader

statements = ['begin;']
for year in range(2010, 2027):
    reader = PdfReader(f'content/source-pdfs/{year}年考研英语二.pdf')
    found = None
    for index, page in enumerate(reader.pages):
        text = page.extract_text(extraction_mode='layout') or ''
        match = re.search(r'Section\s*III\s*Translation', text, re.I)
        if not match:
            continue
        section = re.split(r'Section\s*IV', text[match.end():], flags=re.I)[0]
        start = re.search(r'\(15\s*points\)', section, re.I)
        if not start:
            raise ValueError(f'{year}: missing instructions')
        lines = [line for line in section[start.end():].splitlines()
                 if line.strip() and not re.match(r'^\s*\d+\s+https?://', line)]
        # The source papers indent paragraph starts; ordinary PDF line wraps do not.
        baseline = min(len(line) - len(line.lstrip()) for line in lines)
        paragraphs = []
        for line in lines:
            indent = len(line) - len(line.lstrip())
            if not paragraphs or indent >= baseline + 5:
                paragraphs.append([])
            paragraphs[-1].append(re.sub(r'\s+', ' ', line.strip()))
        passage = '\n\n'.join(' '.join(paragraph) for paragraph in paragraphs)
        if len(passage.split()) < 100:
            raise ValueError(f'{year}: incomplete passage')
        found = (index + 1, passage)
        break
    if not found:
        raise ValueError(f'{year}: translation not found')
    page, passage = found
    escaped = passage.replace("'", "''")
    statements.append(f"insert into translation_tasks(section_id, passage, source_page, status) select s.id, '{escaped}', {page}, 'published' from exam_sections s join exam_papers p on p.id=s.paper_id where p.year={year} and s.type='translation' on conflict(section_id) do update set passage=excluded.passage, source_page=excluded.source_page, status=excluded.status;")
    statements.append(f"update exam_sections s set status='published', item_count=1 from exam_papers p where p.id=s.paper_id and p.year={year} and s.type='translation';")
    print(f'{year}: {len(passage.split())} words, page {page}')
statements.append('commit;')
target = Path('deploy/postgres/017-translation-content.sql')
content = '\n'.join(statements) + '\n'
if target.exists():
    patch = '*** Begin Patch\n*** Update File: ' + str(target) + '\n@@\n' + ''.join('-' + line + '\n' for line in target.read_text().splitlines()) + ''.join('+' + line + '\n' for line in content.splitlines()) + '*** End Patch\n'
else:
    patch = '*** Begin Patch\n*** Add File: ' + str(target) + '\n' + ''.join('+' + line + '\n' for line in content.splitlines()) + '*** End Patch\n'
subprocess.run(['apply_patch'], input=patch, text=True, check=True)
