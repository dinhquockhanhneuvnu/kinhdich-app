import re

zhi_map = {'子':'Tý','丑':'Sửu','寅':'Dần','卯':'Mão','辰':'Thìn','巳':'Tị','午':'Ngọ','未':'Mùi','申':'Thân','酉':'Dậu','戌':'Tuất','亥':'Hợi'}

with open('data.js', 'r', encoding='utf-8') as f:
    text = f.read()

def replace_cn(match):
    val = match.group(1)
    if len(val) >= 2 and val[1] in zhi_map:
        return f"'{zhi_map[val[1]]}'"
    return match.group(0)

text = re.sub(r"'([\u4e00-\u9fa5]{2,3})'", replace_cn, text)

with open('data.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("data.js translated back to Vietnamese!")
