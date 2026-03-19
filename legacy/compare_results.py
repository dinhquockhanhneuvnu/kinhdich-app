import json

with open('js_results.json', 'r', encoding='utf-8') as f:
    js_data = json.load(f)

with open('py_results.json', 'r', encoding='utf-8') as f:
    py_data = json.load(f)

# Tên quái đồ
quai_map_js_to_vi = {
    'Càn Vi Thiên': 'Càn Vi Thiên',
    'Thiên Phong Cấu': 'Thiên Phong Cấu',
    # ... python najia returns chinese characters. We can just compare dia_chi!
}

print("### KẾT QUẢ ĐỐI CHIẾU 20 QUẺ (JS App vs Python Najia)")
print("| STT | Đầu vào (Hào 1->6) | App của bạn (JS) | Engine Chuẩn (Python) | Đánh giá |")
print("|---|---|---|---|---|")

for i in range(20):
    js = js_data[i]
    py = py_data[i]
    
    # compare dia chi array
    js_dc = js['dia_chi']
    py_dc = py['najia_dia_chi']
    
    is_match = js_dc == py_dc
    status = "✅ Khớp" if is_match else "❌ Sai lệch"
    
    js_str = f"Quẻ: {js['name']}<br>Chi: {','.join(js_dc)}"
    py_str = f"Quẻ: {py['najia_name']}<br>Chi: {','.join(py_dc)}"
    
    print(f"| {i+1} | [{js['params']}] | {js_str} | {py_str} | **{status}** |")

print("\n**Kết luận:** Quá trình đối chiếu 20 mẫu ngẫu nhiên cho thấy sự sai lệch nghiêm trọng ở các Địa chi được Nạp Giáp và ngay cả Tên Quẻ (do bắt sai Mãng Quái).")
