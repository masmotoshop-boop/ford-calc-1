// ===== HELPER =====
const $ = id => document.getElementById(id);
const format = n => (n || 0).toLocaleString('vi-VN');

// ===== ANIMATE =====
function animateValue(el, start, end, duration = 500) {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    el.textContent = format(value);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ===== DATA =====
const data = typeof FORD_DATA !== "undefined" ? FORD_DATA : {};

// ===== ELEMENT =====
const el = {
  car: $('car'),
  version: $('version'),
  area: $('area'),
  serviceFee: $('serviceFee'),
  serviceFeeValue: $('serviceFeeValue'),
  calc: $('calcBtn'),

  price: $('price'),
  promo: $('promo'),
  final: $('finalPrice'),

  tax: $('tax'),
  plate: $('plate'),
  reg: $('registration'),
  road: $('roadFee'),
  ins: $('insurance'),
  service: $('serviceFee'),
  total: $('total'),

  loanRange: $('loanRange'),
  loanPercent: $('loanPercent'),
  loanAmount: $('loanAmount'),
  costs: $('costs'),
  equity: $('equity'),
  payment: $('totalPayment'),

  serviceRange: $('serviceRange'),
  colorFee: $('colorFee'),
  selectedCar: $('selectedCar')
};

/* ===== SERVICE FEE ===== */
function formatMoney(x) {
  return Number(x).toLocaleString('vi-VN');
}

// hiển thị mặc định
el.serviceFeeValue.textContent = formatMoney(el.serviceFee.value);

// khi kéo slider
el.serviceFee.oninput = () => {
  el.serviceFeeValue.textContent = formatMoney(el.serviceFee.value);
  calc(); // 👈 QUAN TRỌNG (update lại kết quả)
};
// ===== LOAD =====
el.car.innerHTML = '<option value="">Chọn xe</option>';
Object.keys(data).forEach(c => el.car.add(new Option(c, c)));

// ===== CHANGE CAR =====
el.car.onchange = () => {
  el.version.innerHTML = '';
  el.area.innerHTML = '';

  const car = data[el.car.value];
  if (!car) return;

  Object.keys(car.versions).forEach(v => el.version.add(new Option(v, v)));
  Object.keys(car.areas).forEach(a => el.area.add(new Option(a, a)));
};

// ===== CALCULATE =====
el.calc.onclick = () => {

  document.querySelectorAll('.card').forEach(c => {
    c.classList.add('active');
    setTimeout(() => c.classList.remove('active'), 300);
  });

  const car = el.car.value;
  const ver = el.version.value;
  const area = el.area.value;

  if (!car || !ver || !area) return alert("Chọn đủ thông tin");

  const v = data[car].versions[ver];
  const a = data[car].areas[area];

  const color = el.colorFee.checked ? 8000000 : 0;
  const service = +el.serviceRange.value;

  const price = v.price + color;
  const final = price - v.promo;
  const tax = Math.round(price * a.tax);

  const total = final + tax + a.registration + 60000 + a.roadFee + a.insurance + service;

  el.price.textContent = format(price);
  el.promo.textContent = format(v.promo);
  el.final.textContent = format(final);

  el.tax.textContent = format(tax);
  el.plate.textContent = format(a.registration);
  el.reg.textContent = format(60000);
  el.road.textContent = format(a.roadFee);
  el.ins.textContent = format(a.insurance);
  el.service.textContent = format(service);

  animateValue(el.total, 0, total);

  el.selectedCar.textContent = `FORD ${car} - ${ver}`;

  updateLoan();
  updatePDF(car, ver, price, v.promo, final, tax, a, service, total);
};

// ===== LOAN =====
function updateLoan() {

  const percent = +el.loanRange.value;
  el.loanPercent.textContent = percent + '%';

  const car = el.car.value;
  const ver = el.version.value;
  const area = el.area.value;
  if (!car || !ver || !area) return;

  const v = data[car].versions[ver];
  const a = data[car].areas[area];

  const color = el.colorFee.checked ? 8000000 : 0;
  const service = +el.serviceRange.value;

  const final = (v.price + color) - v.promo;
  const loan = Math.round(final * percent / 100);
  const tax = Math.round((v.price + color) * a.tax);
  const serviceFee = Number(el.serviceFee.value);
  const fees = tax + a.registration + 60000 + serviceFee;
  const equity = final - loan;

  animateValue(el.loanAmount, 0, loan);
  animateValue(el.costs, 0, fees);
  animateValue(el.equity, 0, equity);
  animateValue(el.payment, 0, fees + equity);
}

el.loanRange.oninput = updateLoan;

// ===== PDF DATA =====
function updatePDF(car, ver, price, promo, final, tax, a, service, total) {

  $('pdfCar').textContent = `FORD ${car} - ${ver}`;
  $('pdfPrice').textContent = format(price);
  $('pdfPromo').textContent = format(promo);
  $('pdfFinal').textContent = format(final);

  $('pdfTax').textContent = format(tax);
  $('pdfPlate').textContent = format(a.registration);
  $('pdfReg').textContent = format(60000);
  $('pdfRoad').textContent = format(a.roadFee);
  $('pdfIns').textContent = format(a.insurance);
  $('pdfService').textContent = format(service);

  $('pdfTotal').textContent = format(total);

  // 🔥 FIX: tính trực tiếp
  const percent = +el.loanRange.value;
  const loan = Math.round(final * percent / 100);
  const fees = tax + a.registration + 60000 + Number(el.serviceFee.value);
  const equity = final - loan;
  const pay = equity + fees;

  $('pdfPercent').textContent = percent + '%';
  $('pdfLoan').textContent = format(loan);
  $('pdfOwn').textContent = format(equity);
  $('pdfCost').textContent = format(fees);
  $('pdfPay').textContent = format(pay);
}

// ===== QUÀ TẶNG =====
let gifts = [
  "Bảo hiểm thân xe",
  "Camera hành trình",
  "Phim cách nhiệt",
  "Thảm sàn",
  "Gối cổ",
  "Bọc vô lăng",
  "Dán kính",
  "Túi cứu hộ",
  "Bình xịt lốp",
  "Bảo dưỡng"
];

function renderGifts() {
  const box = $('giftList');
  if (!box) return;

  box.innerHTML = '';

  gifts.slice(0, 10).forEach((g, i) => {
    box.innerHTML += `
      <div class="gift-item" onclick="editGift(${i})">
        ✔ ${g}
      </div>
    `;
  });
}

// 🔥 BONUS: sửa trực tiếp
window.editGift = function(i){
  const newGift = prompt("Sửa quà", gifts[i]);
  if(newGift) gifts[i] = newGift;
  renderGifts();
}

renderGifts();

// ===== EXPORT + SHARE PDF =====
$('pdfBtn').onclick = async () => {

  $('pdfDate').textContent = "Ngày: .... / .... / 2026";

  const app = $('appUI');
  const pdf = $('pdfUI');

  app.style.display = 'none';
  pdf.style.display = 'block';

  await new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 500);
    });
  });

 // 👉 thêm class capture (ẩn nút)
pdf.classList.add('capture');

const canvas = await html2canvas(pdf, {
  scale: 2,
  scrollY: -window.scrollY
});

// 👉 bỏ class sau khi chụp xong
pdf.classList.remove('capture');

  const img = canvas.toDataURL('image/jpeg', 0.7);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const pageWidth = 210;
  const pageHeight = 297;

// kích thước canvas
const imgWidth = canvas.width;
const imgHeight = canvas.height;

// tính tỷ lệ scale để fit vừa A4
const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

const finalWidth = imgWidth * ratio;
const finalHeight = imgHeight * ratio;

// canh giữa ngang (optional)
const x = (pageWidth - finalWidth) / 2;
const y = 0;

doc.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);

  const blob = doc.output('blob');
  const file = new File([blob], "bao-gia-xe-ford.pdf", {
    type: "application/pdf"
  });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: "Báo giá xe Ford",
      text: "Chi tiết giá xe",
      files: [file]
    });
  } else {
    doc.save('bao-gia-xe-ford.pdf');
  }
};

// ===== BACK BUTTON =====
const backBtn = $('backBtn');
if(backBtn){
  backBtn.onclick = () => {
    $('pdfUI').style.display = 'none';
    $('appUI').style.display = 'block';
  };
}
