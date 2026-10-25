"""Extract original cloze text/options; fixed keys transcribed from answer photos."""
import json
import re
import subprocess
from pathlib import Path
from pypdf import PdfReader

ANSWERS = {
    2010: ('DCBAA BDCBA CDDAC BDCAB', '1139'),
    2011: ('ACBDD BACCB DBACA A DACD'.replace(' ', ''), '1140'),
    2012: ('ABDAC DBACB DCCAD ABCBD', '1141'),
    2013: ('AABDC BAABA DCBCD DBCDC', '1142'),
    2014: ('BACAD ACCDB ABCDB DADCB', '1144'),
    2015: ('CDCAC ABDBD AABDC DACBB', '1143'),
    2016: ('CBDCD BADAB ABADC DCCAB', '1127'),
    2017: ('CADAB BCADC CBADC DABDB', '1128'),
    2018: ('DBCBA BCDAC BCADD DABDC', '1129'),
    2019: ('CDAAC ADCBD ACBDB CBDAD', '1130'),
    2020: ('DBACA BACDC ACDBD CDBAB', '1131'),
    2021: ('BADCB ABCDB CBDBA CDCAD', '1132'),
    2022: ('BBADC ACCBB CDBAA DADCD', '1133'),
    2023: ('BCADD DABBC CDCAA BDBCA', '1134'),
    2024: ('CBADA CBBDA DABCC ACDBD', '1135'),
    2025: ('DACBD BACDA ABDDB ACCBC', '1136'),
    2026: ('CBACA DBDCA BDADC ADBCB', '1137'),
}

def clean(text):
    return re.sub(r'\s+', ' ', text).strip()

target = Path('content/cloze/tasks.json')
existing = {t['year']: t for t in json.loads(target.read_text())} if target.exists() else {}
tasks = []
for year, (answer, image) in ANSWERS.items():
    reader = PdfReader(f'content/source-pdfs/{year}年考研英语二.pdf')
    lines = []
    pages = []
    for index, page in enumerate(reader.pages[:3]):
        text = page.extract_text(extraction_mode='layout') or ''
        end = re.search(r'Section\s+II\b', text)
        if end:
            text = text[:end.start()]
        lines.extend(line for line in text.splitlines() if line.strip() and not re.match(r'^\s*\d+\s*(https?://.*)?$',line))
        pages.append(index+1)
        if end:
            break
    text = '\n'.join(lines)
    start = re.search(r'Directions\s*:', text)
    instruction_end = re.search(r'\(\s*10\s*points\s*\)',text,re.I)
    assert start and instruction_end, year
    directions = clean(text[start.end():instruction_end.end()])
    body = text[instruction_end.end():]
    first = re.search(r'^\s*1\.\s*A\.', body, re.M)
    assert first, year
    paragraphs = []
    raw = [l for l in body[:first.start()].splitlines() if l.strip()]
    baseline = min(len(l)-len(l.lstrip()) for l in raw)
    expected = 1
    for line in raw:
        def mark(match):
            global expected
            if int(match[1]) != expected:
                return match[0]
            expected += 1
            return '{{'+match[1]+'}}'
        line = re.sub(r'(?<!\w)(20|1[0-9]|[1-9])(?!\w)', mark, line)
        indent = len(line)-len(line.lstrip())
        if not paragraphs or indent >= baseline + 5:
            paragraphs.append(clean(line))
        else:
            paragraphs[-1] += ('' if paragraphs[-1].endswith('-') else ' ') + clean(line)
    questions = []
    for line in body[first.start():].splitlines():
        if not line.strip():
            continue
        m = re.match(r'\s*(\d+)\.\s*A\.\s*(.*?)\s+B\.\s*(.*?)\s+C\.\s*(.*?)\s+D\.\s*(.*?)\s*$', line)
        if not m:
            raise ValueError(f'{year}: invalid option row {line}')
        questions.append({'number':int(m[1]),'options':[clean(s) for s in m.groups()[1:]]})
    answer = answer.replace(' ', '')
    assert len(answer) == 20 and len(questions) == 20, year
    assert [int(n) for p in paragraphs for n in re.findall(r'\{\{(\d+)\}\}',p)] == list(range(1,21)), year
    previous = existing.get(year, {})
    tasks.append({'year':year,'directions':directions,'paragraphs':paragraphs,'questions':questions,'sourcePages':pages,
      'answerSource':f'用户提供参考答案照片 IMG_{image}.heic；解析由产品编写，非官方原文。',
      'keys':previous.get('keys',[{'number':n+1,'answer':letter,'explanation':''} for n,letter in enumerate(answer)])})
after = json.dumps(tasks, ensure_ascii=False, indent=2)+'\n'
before = target.read_text() if target.exists() else None
patch = '*** Begin Patch\n'+('*** Add File: '+str(target)+'\n' if before is None else '*** Update File: '+str(target)+'\n@@\n'+''.join('-'+l+'\n' for l in before.splitlines()))+''.join('+'+l+'\n' for l in after.splitlines())+'*** End Patch\n'
subprocess.run(['apply_patch'],input=patch,text=True,check=True,capture_output=True)
print('Imported 17 cloze papers, 340 questions, original paragraphs and fixed photo keys.')
