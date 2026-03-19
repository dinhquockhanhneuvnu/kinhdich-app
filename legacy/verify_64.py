import json
import re
import sys
import copy
sys.path.append('./clone-liuyao')
from najia.najia import Najia

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

quai_to_ngu_hanh = {
    'Càn': 'Kim', 'Đoài': 'Kim', 'Ly': 'Hỏa', 'Chấn': 'Mộc',
    'Tốn': 'Mộc', 'Khảm': 'Thủy', 'Cấn': 'Thổ', 'Khôn': 'Thổ'
}

cung_map = {
    '乾': 'Càn', '兑': 'Đoài', '离': 'Ly', '震': 'Chấn',
    '巽': 'Tốn', '坎': 'Khảm', '艮': 'Cấn', '坤': 'Khôn'
}

zhi_map = {'子':'Tý','丑':'Sửu','寅':'Dần','卯':'Mão','辰':'Thìn','巳':'Tị','午':'Ngọ','未':'Mùi','申':'Thân','酉':'Dậu','戌':'Tuất','亥':'Hợi'}

with open('data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract QUE_64 block
que_64 = []
for line in text.split('\n'):
    if "{id:" in line and "ten:" in line and "dia_chi:" in line:
        # Regex to parse the fields
        m_id = re.search(r"id:(\d+)", line)
        m_ten = re.search(r"ten:'(.*?)'", line)
        m_noi = re.search(r"noi_quat:'(.*?)'", line)
        m_ngoai = re.search(r"ngoai_quat:'(.*?)'", line)
        m_cung = re.search(r"cung:'(.*?)'", line)
        m_thu_tu = re.search(r"thu_tu:(\d+)", line)
        m_the = re.search(r"the_hao:(\d+)", line)
        m_ung = re.search(r"ung_hao:(\d+)", line)
        m_dc = re.search(r"dia_chi:\[(.*?)\]", line)
        
        if m_id and m_ten and m_noi and m_ngoai:
            que_64.append({
                'id': int(m_id.group(1)),
                'ten': m_ten.group(1),
                'noi_quat': m_noi.group(1),
                'ngoai_quat': m_ngoai.group(1),
                'cung': m_cung.group(1),
                'thu_tu': int(m_thu_tu.group(1)),
                'the_hao': int(m_the.group(1)),
                'ung_hao': int(m_ung.group(1)),
                'dia_chi': [x.strip("'") for x in m_dc.group(1).split(',')]
            })

errors = []
for q in que_64:
    params = quai_to_params[q['noi_quat']] + quai_to_params[q['ngoai_quat']]
    try:
        nj = Najia(2).compile(params=params, date='2024-01-01 12:00')
        data = nj.data
        
        py_cung = cung_map.get(data['gong'], data['gong'])
        py_the = data['shiy'][0]
        py_ung = data['shiy'][1]
        py_dc = [zhi_map.get(z[1], z) for z in data['qinx']]
        
        # Check cung
        if q['cung'] != py_cung:
            errors.append(f"Quẻ {q['id']} ({q['ten']}): Sai CUNG. JS: {q['cung']}, Python: {py_cung}")
            
        # Check the
        if q['the_hao'] != py_the:
            errors.append(f"Quẻ {q['id']} ({q['ten']}): Sai Thế hào. JS: {q['the_hao']}, Python: {py_the}")
            
        # Check ung
        if q['ung_hao'] != py_ung:
            errors.append(f"Quẻ {q['id']} ({q['ten']}): Sai Ứng hào. JS: {q['ung_hao']}, Python: {py_ung}")
            
        # Check dia chi
        if q['dia_chi'] != py_dc:
            errors.append(f"Quẻ {q['id']} ({q['ten']}): Sai Địa chi. JS: {q['dia_chi']}, Python: {py_dc}")
            
        # Check name
        if q['ten'] != data['name']:
            # Handle unicode translations if necessary but they should match
            # Actually, Najia outputs Chinese names like 乾为天
            pass
        
        # wait, let's use a translation map
        name_map = {
            '乾为天': 'Càn Vi Thiên', '天风姤': 'Thiên Phong Cấu', '天山遁': 'Thiên Sơn Độn', '天地否': 'Thiên Địa Bĩ', '风地观': 'Phong Địa Quan', '山地剥': 'Sơn Địa Bác', '火地晋': 'Hỏa Địa Tấn', '火天大有': 'Hỏa Thiên Đại Hữu',
            '兑为泽': 'Đoài Vi Trạch', '泽水困': 'Trạch Thủy Khốn', '泽地萃': 'Trạch Địa Tụy', '泽山咸': 'Trạch Sơn Hàm', '水山蹇': 'Thủy Sơn Kiển', '地山谦': 'Địa Sơn Khiêm', '雷山小过': 'Lôi Sơn Tiểu Quá', '雷泽归妹': 'Lôi Trạch Quy Muội',
            '离为火': 'Ly Vi Hỏa', '火山旅': 'Hỏa Sơn Lữ', '火风鼎': 'Hỏa Phong Đỉnh', '火水未济': 'Hỏa Thủy Vị Tế', '山水蒙': 'Sơn Thủy Mông', '风水涣': 'Phong Thủy Hoán', '天水讼': 'Thiên Thủy Tụng', '天火同人': 'Thiên Hỏa Đồng Nhân',
            '震为雷': 'Chấn Vi Lôi', '雷地豫': 'Lôi Địa Dự', '雷水解': 'Lôi Thủy Giải', '雷风恒': 'Lôi Phong Hằng', '地风升': 'Địa Phong Thăng', '水风井': 'Thủy Phong Tỉnh', '泽风大过': 'Trạch Phong Đại Quá', '泽雷随': 'Trạch Lôi Tùy',
            '巽为风': 'Tốn Vi Phong', '风天小畜': 'Phong Thiên Tiểu Súc', '风火家人': 'Phong Hỏa Gia Nhân', '风雷益': 'Phong Lôi Ích', '天雷无妄': 'Thiên Lôi Vô Vọng', '火雷噬嗑': 'Hỏa Lôi Phệ Hạp', '山雷颐': 'Sơn Lôi Di', '山风蛊': 'Sơn Phong Cổ',
            '坎为水': 'Khảm Vi Thủy', '水泽节': 'Thủy Trạch Tiết', '水雷屯': 'Thủy Lôi Truân', '水火既济': 'Thủy Hỏa Ký Tế', '泽火革': 'Trạch Hỏa Cách', '雷火丰': 'Lôi Hỏa Phong', '地火明夷': 'Địa Hỏa Minh Di', '地水师': 'Địa Thủy Sư',
            '艮为山': 'Cấn Vi Sơn', '山火贲': 'Sơn Hỏa Bí', '山天大畜': 'Sơn Thiên Đại Súc', '山泽损': 'Sơn Trạch Tổn', '火泽睽': 'Hỏa Trạch Khuê', '天泽履': 'Thiên Trạch Lý', '风泽中孚': 'Phong Trạch Trung Phu', '风山渐': 'Phong Sơn Tiệm',
            '坤为地': 'Khôn Vi Địa', '地雷复': 'Địa Lôi Phục', '地泽临': 'Địa Trạch Lâm', '地天泰': 'Địa Thiên Thái', '雷天大壮': 'Lôi Thiên Đại Tráng', '泽天夬': 'Trạch Thiên Quyết', '水天需': 'Thủy Thiên Nhu', '水地比': 'Thủy Địa Tỉ'
        }
        py_name = name_map.get(data['name'], data['name'])
        if q['ten'] != py_name:
            errors.append(f"Quẻ {q['id']} ({q['ten']}): Tên quẻ (hoặc Nội/Ngoại) sai. Python ra: {py_name}")
            
    except Exception as e:
        errors.append(f"Quẻ {q['id']} error processing with Najia: {e}")

if errors:
    print(f"Phát hiện {len(errors)} lỗi trong QUE_64:")
    for e in errors:
        print(e)
else:
    print("HOÀN HẢO! Cả 64 quẻ (Tên, Cung, Thế, Ứng, Địa Chi) đều khớp 100% với Python Najia.")
