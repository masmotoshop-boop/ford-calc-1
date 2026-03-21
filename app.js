// ===== HELPER =====
const $ = id => document.getElementById(id);
const format = n => (n || 0).toLocaleString('vi-VN');

function formatMoney(x) {
  return Number(x).toLocaleString('vi-VN');
}
function formatInputNumber(value) {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
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
  { name: "Bao Tay Lái", checked: true },
  { name: "Nước Hoa Ô tô", checked: true },
  { name: "Gối Cổ", checked: true },
  { name: "Áo Trùm Xe", checked: true },
  { name: "Thảm Lót Sàn", checked: true },
  { name: "Chai Dưỡng Lốp", checked: true },
  { name: "Bao Da Hồ Sơ", checked: true },
  { name: "Cứu Hộ Ford 3 Năm", checked: true },
  { name: "Công Bảo Dưỡng 1000km", checked: true },
  { name: "Bảo Hiểm Thân Vỏ", checked: false },
  { name: "Phim Cách Nhiệt", checked: false },
  { name: "Camera Hành Trình", checked: false },
  { name: "Bảo Hành Mở Rộng", checked: false },
  { name: "Bọc Ghế Da", checked: false },
  { name: "Phũ Ceramic USA", checked: false },
  { name: "Phũ Gầm Chống Sét", checked: false },
  { name: "Thanh Thể Thao", checked: false },
  { name: "Android Box", checked: false },
  { name: "Camera NĐ 10", checked: false },
  { name: "Lót sàn Simily", checked: false },
  { name: "Lót Nhựa Thùng Sau", checked: false },
  { name: "Nắp Thùng Sau", checked: false }
];

function renderGifts(isPDF = false) {

  const box = isPDF ? $('giftListPDF') : $('giftListApp');
  if (!box) return;

  box.innerHTML = '';

  gifts.forEach((g, index) => {

    // 👉 nếu là PDF và chưa tick → bỏ qua
    if (isPDF && !g.checked) return;

    if (isPDF) {
      box.innerHTML += `
        <div class="gift-item">✔ ${g.name}</div>
      `;
    } else {
      box.innerHTML += `
        <label class="gift-item">
          <input type="checkbox"
                 ${g.checked ? 'checked' : ''}
                 onchange="toggleGift(${index})">
          ${g.name}
        </label>
      `;
    }

  });
}
window.toggleGift = function(i) {
  gifts[i].checked = !gifts[i].checked;
  renderGifts(false); // 👈 cập nhật UI ngay
};

window.editGift = function(i){
  const newGift = prompt("Sửa quà", gifts[i].name);
  if(newGift) {
    gifts[i].name = newGift; // 👈 sửa đúng field
    renderGifts(false);
  }
};

// render lần đầu
renderGifts(false);

// ===== ELEMENT =====
const el = {
  car: $('car'),
  version: $('version'),
  area: $('area'),

  serviceFee: $('serviceFee'),
  serviceFeeValue: $('serviceFeeValue'),

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
  selectedCar: $('selectedCar'),
  promoMode: $('promoMode'),
  promoInput: $('promoInput'),
};

// SERVICE
el.serviceFee.oninput = () => {
  el.serviceFeeValue.textContent = formatMoney(el.serviceFee.value);
  calculate();
};

// PROMO MODE
el.promoMode.onchange = () => {
  if (el.promoMode.value === 'manual') {
    el.promoInput.style.display = 'block';
  } else {
    el.promoInput.style.display = 'none';
  }
  calculate();
};
// ===== LOAD CAR =====
el.car.innerHTML = '<option value="">Chọn xe</option>';
Object.keys(data).forEach(c => el.car.add(new Option(c, c)));

// ===== CHANGE CAR =====
el.car.onchange = () => {
  const car = data[el.car.value];
  if (!car) return;

  el.version.innerHTML = '<option value="">Chọn phiên bản</option>';
  Object.keys(car.versions).forEach(v => {
    el.version.add(new Option(v, v));
  });

  el.area.innerHTML = '<option value="">Chọn khu vực</option>';
  Object.keys(car.areas).forEach(a => {
    el.area.add(new Option(a, a));
  });
};

// ===== AUTO =====
el.version.onchange = calculate;
el.area.onchange = calculate;
el.colorFee.onchange = calculate;

// ===== CALCULATE =====
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
  let promo = v.promo;

if (el.promoMode.value === 'manual') {
 promo = Number(el.promoInput.value.replace(/\./g, '')) || 0;
}

const final = price - promo;
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
  el.promo.textContent = format(promo);
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
  updatePDF(car, ver, price, promo, final, tax, a, service, total);
}

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

  // ===== PROMO (FIX CHUẨN) =====
  let promo = v.promo;

  if (el.promoMode && el.promoMode.value === 'manual') {
    promo = Number(
      (el.promoInput.value || '0').replace(/\./g, '')
    ) || 0;
  }

  // ===== FINAL =====
  const price = v.price + color;
  const final = price - promo;

  // ===== LOAN =====
  const loan = Math.round(final * percent / 100);

  // ===== FEES =====
  const tax = Math.round(price * a.tax);
  const serviceFee = Number(el.serviceFee.value);

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

// ===== EVENT =====
el.loanRange.oninput = updateLoan;
el.loanRange.onchange = updateLoan;

// 👉 QUAN TRỌNG: khi nhập promo → phải update loan luôn
el.promoInput.oninput = () => {

  // format hiển thị
  el.promoInput.value = formatInputNumber(el.promoInput.value);

  // tính lại
  calculate();
  updateLoan();
};
el.promoInput.onfocus = () => {
  el.promoInput.value = el.promoInput.value.replace(/\./g, '');
};
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
    let promo = v.promo;

if (el.promoMode.value === 'manual') {
  promo = Number(el.promoInput.value.replace(/\./g, '')) || 0;
}

const final = price - promo;
    const tax = Math.round(price * a.tax);

    const total =
      final +
      tax +
      a.registration +
      60000 +
      a.roadFee +
      a.insurance +
      service;

    updatePDF(car, ver, price, promo, final, tax, a, service, total);
    renderGifts(true);

    $('pdfDate').textContent = "Ngày: .... / .... / 2026";

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

    if (e.name !== 'AbortError') {
      console.error(e);
      app.style.display = 'block';
      pdf.style.display = 'none';
    }

  } finally {
    window.__EXPORTING_PDF__ = false;
  }

};

// ===== BACK =====
const backBtn = $('backBtn');

if (backBtn) {
  backBtn.onclick = () => {
    $('pdfUI').style.display = 'none';
    $('appUI').style.display = 'block';
    window.scrollTo(0, 0);
  };
}
