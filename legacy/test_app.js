const fs = require('fs');

const dataCode = fs.readFileSync('data.js', 'utf8');
const testCode = `
function scoreToYinYang(score) {
  return (score === 7 || score === 9) ? 1 : 0;
}

function xacDinhQuai(s1, s2, s3) {
  const key = '' + scoreToYinYang(s1) + scoreToYinYang(s2) + scoreToYinYang(s3);
  return QUAI_MAP[key];
}

function timQue(noi, ngoai) {
  return QUE_64.find(q => q.noi_quat === noi && q.ngoai_quat === ngoai);
}

const cases = [
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
];

const results = cases.map((c, i) => {
   const noi = xacDinhQuai(c[0], c[1], c[2]);
   const ngoai = xacDinhQuai(c[3], c[4], c[5]);
   const que = timQue(noi, ngoai);
   return { index: i+1, params: c.join(','), name: que ? que.ten : 'Lỗi Quẻ', dia_chi: que ? que.dia_chi : [] };
});

require('fs').writeFileSync('js_results.json', JSON.stringify(results, null, 2));
console.log('Done generating JS results.');
`;

fs.writeFileSync('test_wrapper.js', dataCode + testCode);
require('child_process').execSync('node test_wrapper.js');
