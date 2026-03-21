// ===== HELPER =====
const $ = id => document.getElementById(id);
// ===== FIX UI INIT =====
$('appUI').style.display = 'block';
$('pdfUI').style.display = 'none';
const format = n => (n || 0).toLocaleString('vi-VN');

// ===== ANIMATE =====
function animateValue(el, start, end, duration = 500, instant = false) {

  if (instant) {
    el.textContent = format(end);
    return;
  }

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
  service: $('service'),

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

el.serviceFeeValue.textContent = formatMoney(el.serviceFee.value);

el.serviceFee.oninput = () => {
  el.serviceFeeValue.textContent = formatMoney(el.serviceFee.value);
  calculate(); // ✅
};

// ===== LOAD =====
el.car.innerHTML = '<option value="">Chọn xe</option>';
Object.keys(data).forEach(c => el.car.add(new Option(c, c)));

// ===== CHANGE CAR (LOAD VERSION + AREA) =====
el.car.onchange = () => {

  const car = data[el.car.value];
  if (!car) return;

  // load version
  el.version.innerHTML = '<option value="">Chọn phiên bản</option>';
  Object.keys(car.versions).forEach(v => {
    el.version.add(new Option(v, v));
  });

  // load area
  el.area.innerHTML = '<option value="">Chọn khu vực</option>';
  Object.keys(car.areas).forEach(a => {
    el.area.add(new Option(a, a));
  });

};

// ===== AUTO CALCULATE =====
el.version.onchange = calculate;
el.area.onchange = calculate;
el.colorFee.onchange = calculate;
el.serviceFee.oninput = calculate;
// ===== CHANGE CAR =====
function calculate() {

  const car = el.car.value;
  const ver = el.version.value;
  const area = el.area.value;

  if (!car || !ver || !area) return;

  const v = data[car].versions[ver];
  const a = data[car].areas[area];

  const color = el.colorFee.checked ? 8000000 : 0;
  const service = Number(el.serviceFee.value);

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

  const final = (v.price + color) - v.promo;
  const loan = Math.round(final * percent / 100);
  const tax = Math.round((v.price + color) * a.tax);
  const serviceFee = Number(el.serviceFee.value);

  // ✅ FIX CHUẨN
  const fees =
    tax +
    a.registration +
    60000 +
    a.roadFee +
    a.insurance +
    serviceFee;

  const equity = final - loan;

const instant = window.__EXPORTING_PDF__ === true;

animateValue(el.loanAmount, 0, loan, 500, instant);
animateValue(el.costs, 0, fees, 500, instant);
animateValue(el.equity, 0, equity, 500, instant);
animateValue(el.payment, 0, fees + equity, 500, instant);
}

el.loanRange.oninput = updateLoan;
el.loanRange.onchange = updateLoan;

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

  // ✅ FIX PDF KHÔNG FORMAT LẠI
  $('pdfPercent').textContent = el.loanPercent.textContent;
  $('pdfLoan').textContent = el.loanAmount.textContent;
  $('pdfOwn').textContent = el.equity.textContent;
  $('pdfCost').textContent = el.costs.textContent;
  $('pdfPay').textContent = el.payment.textContent;
}

// ===== EXPORT PDF =====
$('pdfBtn').onclick = async () => {

  const app = $('appUI');
  const pdf = $('pdfUI');

  try {

    window.__EXPORTING_PDF__ = true;

    updateLoan();

    const car = el.car.value;
    const ver = el.version.value;
    const area = el.area.value;

    if (!car || !ver || !area) {
      alert("Chọn đủ thông tin");
      return;
    }

    const v = data[car].versions[ver];
    const a = data[car].areas[area];

    const color = el.colorFee.checked ? 8000000 : 0;
    const service = Number(el.serviceFee.value);

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

    updatePDF(car, ver, price, v.promo, final, tax, a, service, total);

    $('pdfDate').textContent = "Ngày: .... / .... / 2026";

    // 👉 HIỆN PDF UI
    app.style.display = 'none';
    pdf.style.display = 'block';

    await new Promise(r => setTimeout(r, 200));

    const clone = pdf.cloneNode(true);

    clone.style.position = 'fixed';
    clone.style.left = '-9999px';

    const btn = clone.querySelector('#backBtn');
    if (btn) btn.remove();

    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, { scale: 2 });

    document.body.removeChild(clone);

    const img = canvas.toDataURL('image/jpeg', 0.8);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const ratio = Math.min(210 / canvas.width, 297 / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;

    doc.addImage(img, 'JPEG', (210 - w) / 2, 0, w, h);

    const blob = doc.output('blob');

    const file = new File([blob], 'bao-gia-xe-ford.pdf', {
      type: 'application/pdf'
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Báo giá xe Ford',
        files: [file]
      });
    } else {
      doc.save('bao-gia-xe-ford.pdf');
    }

  } catch (e) {
  console.log("Share cancelled hoặc lỗi:", e);

  // 👉 nếu user cancel → KHÔNG làm gì
  if (e.name === 'AbortError') {
    return;
  }

  // 👉 chỉ fallback khi lỗi thật
  $('appUI').style.display = 'block';
  $('pdfUI').style.display = 'none';
  } finally {
    window.__EXPORTING_PDF__ = false;
  }
};
// ===== BACK BUTTON =====
const backBtn = $('backBtn');

if (backBtn) {
  backBtn.onclick = () => {
    $('pdfUI').style.display = 'none';
    $('appUI').style.display = 'block';
    window.scrollTo(0, 0);
  };
}
