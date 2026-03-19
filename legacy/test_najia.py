import json
import sys
sys.path.append('./clone-liuyao')
from najia.najia import Najia

js_to_nj = {6: 4, 7: 1, 8: 2, 9: 3}
cases = [
  [8, 8, 8, 8, 8, 8],
  [7, 7, 7, 7, 7, 7],
  [7, 8, 7, 8, 7, 8],
  [8, 7, 8, 7, 8, 7],
  [8, 8, 8, 7, 7, 7],
  [7, 7, 7, 8, 8, 8],
  [8, 8, 7, 7, 8, 7],
  [7, 8, 8, 7, 7, 8],
  [6, 7, 8, 9, 7, 6],
  [6, 9, 6, 9, 6, 9],
  [9, 6, 9, 6, 9, 6],
  [6, 8, 7, 9, 8, 7],
  [7, 9, 8, 7, 6, 8],
  [8, 6, 9, 8, 7, 6],
  [9, 7, 6, 8, 9, 7],
  [7, 7, 8, 8, 7, 8],
  [8, 7, 7, 8, 8, 7],
  [6, 6, 9, 9, 6, 9],
  [9, 9, 6, 6, 9, 9],
  [7, 7, 7, 8, 8, 7]
]

zhi_map = {'子':'Tý','丑':'Sửu','寅':'Dần','卯':'Mão','辰':'Thìn','巳':'Tị','午':'Ngọ','未':'Mùi','申':'Thân','酉':'Dậu','戌':'Tuất','亥':'Hợi'}

def vietnamese_name(name):
    # Dịch thô tên quẻ Trung sang Việt nếu cần (nhưng tên quẻ thường giống nhau Hán Việt)
    # Ví dụ 乾为天 -> Càn Vi Thiên. Nhưng nay ta so sánh tên quái, ta chỉ cần so sánh các hào địa chi.
    return name

results = []
for i, c in enumerate(cases):
    params = [js_to_nj[v] for v in c]
    try:
        nj = Najia(2).compile(params=params, date='2024-01-01 12:00')
        qinx = [zhi_map.get(z[1], z) for z in nj.data['qinx']] # Can Chi Hành, char 1 là chi
        results.append({
            'index': i+1,
            'params': ",".join(map(str, c)),
            'najia_name': nj.data['name'],
            'najia_dia_chi': qinx
        })
    except Exception as e:
        print("Error on case", i, c, e)

with open('py_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Done generating Python results.")
