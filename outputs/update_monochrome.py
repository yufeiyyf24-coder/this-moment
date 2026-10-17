from pathlib import Path
from docx import Document
from docx.shared import Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
src=Path('outputs/此刻_一周模拟记录_天数与程度均分.docx');d=Document(src)
before=[p.text for p in d.paragraphs];detail=before[before.index('2026年10月9日 星期五'):]
t=d.tables[0]
# Black horizontal rules only. No shaded cells or vertical rules.
pr=t._tbl.tblPr
for old in list(pr.findall(qn('w:tblBorders'))):pr.remove(old)
borders=OxmlElement('w:tblBorders')
for edge in ['top','bottom','insideH','left','right','insideV']:
 el=OxmlElement('w:'+edge);el.set(qn('w:val'),'single' if edge in ['top','bottom','insideH'] else 'nil');el.set(qn('w:sz'),'8' if edge in ['top','bottom'] else '4');el.set(qn('w:color'),'000000');borders.append(el)
pr.append(borders)
for i,row in enumerate(t.rows):
 for j,cell in enumerate(row.cells):
  cp=cell._tc.get_or_add_tcPr()
  for sh in list(cp.findall(qn('w:shd'))):cp.remove(sh)
  sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'FFFFFF');sh.set(qn('w:val'),'clear');cp.append(sh)
  if i and j==2:
   text=cell.text
   if '/ 5' in text:
    score=float(text.split('/')[0]);whole=int(score);half=score-whole>=.25
    blocks='■'*whole+('◧' if half and whole<5 else '')+'□'*(5-whole-(1 if half and whole<5 else 0))
    cell.paragraphs[0].runs[0].text=f'{blocks}  {score:.1f}'
  for p in cell.paragraphs:
   for run in p.runs:
    run.font.color.rgb=RGBColor(0,0,0);run.font.size=Pt(11);run.bold=i==0 or j==2
    if i and j==2:
     run.font.name='Segoe UI Symbol';run._element.get_or_add_rPr().rFonts.set(qn('w:eastAsia'),'Microsoft YaHei')
for p in d.paragraphs:
 if p.text.startswith('出现天数：'):
  p.text='出现天数：当天记录过该症状即计1天。程度均分：只计算已评分记录，保留1位小数，未评分不计为0。每格代表1级，■为整格，◧为半格，□为空格；方块按最近的半级示意，数字为实际均分。胸闷2天中仅1条有评分。未记录不代表未发生。'
  for r in p.runs:r.font.size=Pt(9)
assert [p.text for p in d.paragraphs][before.index('2026年10月9日 星期五'):]==detail
out=Path('outputs/此刻_一周模拟记录_黑白方块版.docx');d.save(out)
check=Document(out)
assert check.tables[0].rows[1].cells[2].text=='■■◧□□  2.5'
assert all(r.font.color.rgb==RGBColor(0,0,0) for row in check.tables[0].rows for cell in row.cells for p in cell.paragraphs for r in p.runs)
print('PASS: monochrome rules, square averages, exact numeric values, unchanged daily details.')
