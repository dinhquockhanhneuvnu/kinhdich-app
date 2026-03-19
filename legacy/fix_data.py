import re
import sys
sys.path.append('./clone-liuyao')
from najia.najia import Najia

# Trigram to binary mapping (from bottom to top line) 1=Yang, 2=Yin
# 111 = [1,1,1]
quai_to_params = {
    'Càn': [1, 1, 1],
    'Đoài': [1, 1, 2],
    'Ly': [1, 2, 1],
    'Chấn': [1, 2, 2],
    'Tốn': [2, 1, 1],
    'Khảm': [2, 1, 2],
    'Cấn': [2, 2, 1],
    'Khôn': [2, 2, 2]
}

zhi_map = {'子':'Tý','丑':'Sửu','寅':'Dần','卯':'Mão','辰':'Thìn','巳':'Tị','午':'Ngọ','未':'Mùi','申':'Thân','酉':'Dậu','戌':'Tuất','亥':'Hợi'}

with open('data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# We want to replace the QUE_64 block.
# Let's parse each line of QUE_64 block.
import re
lines = text.split('\n')
new_lines = []
for line in lines:
    if "{id:" in line and "ten:" in line and "dia_chi:" in line:
        m_noi = re.search(r"noi_quat:'(.*?)'", line)
        m_ngoai = re.search(r"ngoai_quat:'(.*?)'", line)
        if m_noi and m_ngoai:
            noi = m_noi.group(1)
            ngoai = m_ngoai.group(1)
            params = quai_to_params[noi] + quai_to_params[ngoai]
            nj = Najia(2).compile(params=params, date='2024-01-01 12:00')
            qinx = [zhi_map.get(z[1], z) for z in nj.data['qinx']]
            
            # replace the dia_chi array at the end
            # find original dia_chi: \['.*?'\]
            dia_chi_str = f"['{qinx[0]}','{qinx[1]}','{qinx[2]}','{qinx[3]}','{qinx[4]}','{qinx[5]}']"
            line = re.sub(r"dia_chi:\[.*?\]", f"dia_chi:{dia_chi_str}", line)
    new_lines.append(line)

with open('data.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print("data.js QUE_64 updated successfully!")
