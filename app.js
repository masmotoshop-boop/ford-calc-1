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
  service: $('serviceFee'), // 👈 FIX mapping

  total: $('total'),

  loanRange: $('loanRange'),
  loanPercent: $('loanPercent'),
  loanAmount: $('loanAmount'),
  costs: $('costs'),
  equity: $('equity'),
  payment: $('totalPayment'),

  colorFee: $('colorFee'),
  selectedCar: $('selectedCar')
};

// ===== SERVICE FEE =====
function formatMoney(x) {
  return Number(x).toLocaleString('vi-VN');
}

// hiển thị mặc định
el.serviceFeeValue.textContent = formatMoney(el.serviceFee.value);

// kéo slider → update + tính lại
el.serviceFee.oninput = () => {
  el.serviceFeeValue.textContent = formatMoney(el.serviceFee.value);
  el.calc.click(); // ✅ FIX chuẩn
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

  // animation card
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
  const service = Number(el.serviceFee.value); // ✅ FIX chuẩn

  const price = v.price + color;
  const final = price - v.promo;
  const tax = Math.round(price * a.tax);

  const total =
    final +
    tax +
    a.registration +
    60000 +
    a.roadFee +
    a.insurance +
    service;

  // ===== UI =====
  el.price.textContent = format(price);
  el.promo.textContent = format(v.promo);
  el.final.textContent = format(final);

  el.tax.textContent = format(tax);
  el.plate.textContent = format(a.registration);
  el.reg.textContent = format(60000);
  el.road.textContent = format(a.roadFee);
  el.ins.textContent = format(a.insurance);
  el.service.textContent = format(service); // ✅ FIX hiển thị

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

// ===== GIFTS =====
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

window.editGift = function(i){
  const newGift = prompt("Sửa quà", gifts[i]);
  if(newGift) gifts[i] = newGift;
  renderGifts();
}

renderGifts();

// ===== EXPORT PDF =====
$('pdfBtn').onclick = async () => {

  $('pdfDate').textContent = "Ngày: .... / .... / 2026";

  const app = $('appUI');
  const pdf = $('pdfUI');

  // 👉 hiện UI PDF (có nút back)
  app.style.display = 'none';
  pdf.style.display = 'block';

  await new Promise(r => setTimeout(r, 300));

  try {

    // ===== CLONE UI =====
    const clone = pdf.cloneNode(true);

    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';

    // 👉 ẩn nút back trong clone
    const btn = clone.querySelector('#backBtn');
    if (btn) btn.remove();

    document.body.appendChild(clone);

    // ===== CAPTURE =====
    const canvas = await html2canvas(clone, {
      scale: 2
    });

    document.body.removeChild(clone);

    const img = canvas.toDataURL('image/jpeg', 0.8);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;

    const ratio = Math.min(
      pageWidth / canvas.width,
      pageHeight / canvas.height
    );

    const w = canvas.width * ratio;
    const h = canvas.height * ratio;

    const x = (pageWidth - w) / 2;

    doc.addImage(img, 'JPEG', x, 0, w, h);

    doc.save('bao-gia-xe-ford.pdf');

  } catch (e) {
    console.error(e);
  }
};
// ===== BACK BUTTON =====
const backBtn = $('backBtn');

if (backBtn) {
  backBtn.onclick = () => {
    const pdf = $('pdfUI');
    const app = $('appUI');

    pdf.style.display = 'none';
    app.style.display = 'block';

    // 👉 reset scroll (tránh lỗi iPhone)
    window.scrollTo(0, 0);
  };
}
