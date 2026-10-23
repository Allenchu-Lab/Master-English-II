"""Extract older Part B papers; answer letters are from the user's answer photos.

New explanations must be reviewed before building the publication migration.
"""
import json
import re
import subprocess
from pathlib import Path
from pypdf import PdfReader

ANSWERS = {
    2010: 'FTFTF', 2011: 'EDCBG', 2012: 'AFGCE', 2013: 'DCEAB',
    2014: 'DEGCA', 2015: 'DEGAC', 2016: 'CEABD', 2017: 'EAGBF',
    2018: 'AFEBD', 2019: 'DGFCB', 2020: 'EFDAC', 2021: 'CFGAB',
    2022: 'CEAFB', 2023: 'DFBAG', 2024: 'CEAGB',
}

def clean(text):
    return re.sub(r'\s+', ' ', text).strip()

def paragraphs(lines):
    lines = [line for line in lines if line.strip()]
    baseline = min(len(line) - len(line.lstrip()) for line in lines)
    result = []
    pending = None
    for line in lines:
        marker = re.match(r'\s*(4[1-5])\.\s*_+', line)
        if marker:
            pending = int(marker[1])
            continue
        indent = len(line) - len(line.lstrip())
        if not result or indent >= baseline + 5 or pending:
            result.append({'text': clean(line), **({'number': pending} if pending else {})})
            pending = None
        else:
            result[-1]['text'] += ('' if result[-1]['text'].endswith('-') else ' ') + clean(line)
    return result

target = Path('content/reading-b/tasks.json')
existing = {task['year']: task for task in json.loads(target.read_text())}
for year in range(2010, 2025):
    if year in existing:
        continue
    section = []
    pages = []
    active = False
    for index, page in enumerate(PdfReader(f'content/source-pdfs/{year}年考研英语二.pdf').pages):
        text = page.extract_text(extraction_mode='layout') or ''
        start = re.search(r'Part\s*B', text)
        if start:
            active = True
            text = text[start.end():]
        if not active:
            continue
        end = re.search(r'Section\s*III', text)
        if end:
            text = text[:end.start()]
        lines = [line for line in text.splitlines() if line.strip() and not re.match(r'^\s*\d+\s+https?://', line)]
        if lines:
            pages.append(index + 1)
            section.extend(lines)
        if end:
            break
    text = '\n'.join(section)
    instruction_end = re.search(r'\(\s*10\s*points\s*\)', text, re.I)
    if not instruction_end:
        raise ValueError(f'{year}: missing directions')
    directions = clean(text[:instruction_end.start()]).removeprefix('Directions:').strip()
    lines = text[instruction_end.end():].splitlines()
    lines = [line for line in lines if line.strip()]
    title = ''
    if year == 2010:
        kind = 'true_false'
        first = next(i for i,line in enumerate(lines) if re.match(r'\s*41\.',line))
        body = lines[:first]
        questions = []
        for line in lines[first:]:
            match = re.match(r'\s*(4[1-5])\.\s*(.*)', line)
            if match:
                questions.append({'number':int(match[1]), 'label':clean(match[2])})
            else:
                questions[-1]['label'] += ' ' + clean(line)
        options = [{'letter':'T','text':'True'}, {'letter':'F','text':'False'}]
    elif 'subheading' in directions.lower() or 'subtitle' in directions.lower():
        kind = 'headings'
        options = []
        last = 0
        for i,line in enumerate(lines):
            match = re.match(r'\s*([A-G])\.\s*(.*)',line)
            if match:
                options.append({'letter':match[1], 'text':clean(match[2])})
                last = i
            if len(options) == 7:
                break
        body = lines[last+1:]
        questions = [{'number':n,'label':f'Paragraph {n}'} for n in range(41,46)]
    else:
        kind = 'matching'
        first = next(i for i,line in enumerate(lines) if re.search(r'\bA\.',line))
        body = lines[:first]
        table = lines[first:]
        starts = [re.search(r'\b[A-G]\.\s*(\S)',line).start(1) for line in table if re.search(r'\b[A-G]\.\s*(\S)',line)]
        boundary = min(starts)
        options = []
        questions = []
        for line in table:
            marker = re.search(r'\b([A-G])\.\s*',line)
            left = line[:marker.start()] if marker else line[:boundary]
            right = line[marker.end():] if marker else line[boundary:]
            if marker:
                options.append({'letter':marker[1],'text':clean(right)})
            elif right.strip():
                options[-1]['text'] += ' ' + clean(right)
            match = re.match(r'\s*(4[1-5])\.\s*(.*)',left)
            if match:
                questions.append({'number':int(match[1]),'label':clean(match[2])})
            elif left.strip() and questions:
                questions[-1]['label'] += ' ' + clean(left)
    paras = paragraphs(body)
    # A short introductory line set off from the body is a printed title, not a paragraph.
    if len(paras[0]['text'].split()) < 20 and len(paras) > 5 and not paras[0].get('number'):
        title = paras.pop(0)['text']
    if len(questions) != 5 or len(options) != (2 if kind == 'true_false' else 7):
        raise ValueError(f'{year}: incomplete choices/questions')
    if kind == 'headings' and [p.get('number') for p in paras if p.get('number')] != list(range(41,46)):
        raise ValueError(f'{year}: missing paragraph gaps')
    image = json.loads(Path(f'content/answer-keys-pending/{year}.json').read_text())['sourceImage']
    existing[year] = {'year':year,'kind':kind,'title':title,'directions':directions,'paragraphs':paras,'options':options,'questions':questions,'sourcePages':pages,
        'answerSource':f'User-provided reference answer photo: {image}; explanation text is product-authored, not an official quotation.',
        'keys':[{'number':41+i,'answer':letter,'evidence':'','explanation':''} for i,letter in enumerate(ANSWERS[year])]}
    print(year,kind,len(paras),'paragraphs', questions)
content = json.dumps(sorted(existing.values(),key=lambda task:task['year']),ensure_ascii=False,indent=2)+'\n'
patch = '*** Begin Patch\n*** Update File: '+str(target)+'\n@@\n'+''.join('-'+line+'\n' for line in target.read_text().splitlines())+''.join('+'+line+'\n' for line in content.splitlines())+'*** End Patch\n'
subprocess.run(['apply_patch'],input=patch,text=True,check=True)
