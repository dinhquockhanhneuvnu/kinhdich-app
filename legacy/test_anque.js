const fs = require('fs');
eval(fs.readFileSync('data.js', 'utf8'));
const appJsCode = fs.readFileSync('app.js', 'utf8');

// Mock DOM
global.document = {
  getElementById: (id) => ({
    value: id === 'duong-lich' ? '2023-10-10' : id === 'ngay-can' ? 'Giáp' : id === 'ngay-chi' ? 'Tý' : id === 'thang-can' ? 'Giáp' : id === 'thang-chi' ? 'Tý' : '',
    innerHTML: '',
    textContent: '',
    classList: { add: ()=>{}, remove: ()=>{} },
    style: {},
    addEventListener: ()=>{}
  })
};
global.window = {};

eval(appJsCode);

// Mock get data
state.haoScores = [6, 7, 8, 9, 6, 7];
state.canNgay = 'Giáp';
state.chiNgay = 'Tý';
state.canThang = 'Giáp';
state.chiThang = 'Tý';

try {
  anQue();
  console.log("No error!");
} catch (e) {
  console.error(e);
}
