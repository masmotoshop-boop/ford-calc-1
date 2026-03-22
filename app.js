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

// 🔥 PROMO CLEAN FUNCTION
function getPromoValue() {
  const raw = (el.promoInput.value || '').replace(/\./g, '').trim();
  if (!raw || isNaN(raw)) return 0;
  return Number(raw);
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
const SYSTEM_PASSWORD = "140589";

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
    if (isPDF && !g.checked) return;

    if (isPDF) {
      box.innerHTML += `<div class="gift-item">✔ ${g.name}</div>`;
    } else {
      box.innerHTML += `
        <label class="gift-item">
          <input type="checkbox" ${g.checked ? 'checked' : ''}
            onchange="toggleGift(${index})">
          ${g.name}
        </label>`;
    }
  });
}

window.toggleGift = i => {
  gifts[i].checked = !gifts[i].checked;
  renderGifts(false);
};

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
  passwordInput: $('passwordInput'),
};

// 👁 PASSWORD TOGGLE
const toggle = document.querySelector('.toggle-pass');
if (toggle) {
  toggle.onclick = () => {
    const input = el.passwordInput;
    input.type = input.type === 'password' ? 'text' : 'password';
    toggle.textContent = input.type === 'text' ? '🙈' : '👁';
  };
}

// ===== LOCK =====
el.car.disabled = true;
el.version.disabled = true;
el.area.disabled = true;

// ===== SERVICE =====
el.serviceFee.oninput = () => {
  el.serviceFeeValue.textContent = formatMoney(el.serviceFee.value);
  calculate();
};

// ===== PASSWORD =====
el.passwordInput.oninput = () => {
  const pass = el.passwordInput.value.trim().toUpperCase();

  if (pass !== SYSTEM_PASSWORD) {
    el.car.disabled = true;
    el.version.disabled = true;
    el.area.disabled = true;
    return;
  }

  el.car.disabled = false;

  el.passwordInput.classList.add('password-hidden');

  setTimeout(() => {
    el.passwordInput.style.display = 'none';

    const label = el.passwordInput.previousElementSibling;
    if (label) label.style.display = 'none';

    if (!document.querySelector('.password-ok')) {
      const okText = document.createElement('div');
      okText.className = 'password-ok';
      okText.textContent = '✔ Đã xác thực';
      el.passwordInput.parentNode.appendChild(okText);
    }
  }, 300);
};

// ===== LOAD CAR =====
el.car.innerHTML = '<option value="">Chọn xe</option>';
Object.keys(data).forEach(c => el.car.add(new Option(c, c)));

el.car.onchange = () => {
  if (!checkPassword()) return alert("Sai mật khẩu");

  const car = data[el.car.value];
  if (!car) return;

  el.version.disabled = false;
  el.area.disabled = false;

  el.version.innerHTML = '<option value="">Chọn phiên bản</option>';
  Object.keys(car.versions).forEach(v => el.version.add(new Option(v, v)));

  el.area.innerHTML = '<option value="">Chọn khu vực</option>';
  Object.keys(car.areas).forEach(a => el.area.add(new Option(a, a)));
};

// ===== CALCULATE =====
function calculate() {
  const car = el.car.value;
  const ver = el.version.value;
  const area = el.area.value;
  if (!car || !ver || !area) return;

  const v = data[car].versions[ver];
  const a = data[car].areas[area];

  const color = el.colorFee.checked ? 8000000 : 0;
  const service = Number(el.serviceFee.value || 0);

  const price = v.price + color;
  let promo = el.promoMode.value === 'manual' ? getPromoValue() : v.promo;

  const final = Math.max(0, price - promo);
  const tax = Math.round(price * a.tax);

  const total = final + tax + a.registration + 60000 + a.roadFee + a.insurance + service;

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
  let promo = el.promoMode.value === 'manual' ? getPromoValue() : v.promo;

  const price = v.price + color;
  const final = Math.max(0, price - promo);

  const loan = Math.round(final * percent / 100);
  const tax = Math.round(price * a.tax);
  const serviceFee = Number(el.serviceFee.value || 0);

  const fees = tax + a.registration + 60000 + a.roadFee + a.insurance + serviceFee;
  const equity = final - loan;

  const instant = window.__EXPORTING_PDF__ === true;

  animateValue(el.loanAmount, 0, loan, 500, instant);
  animateValue(el.costs, 0, fees, 500, instant);
  animateValue(el.equity, 0, equity, 500, instant);
  animateValue(el.payment, 0, fees + equity, 500, instant);
}

// ===== EVENTS =====
el.version.onchange = calculate;
el.area.onchange = calculate;
el.colorFee.onchange = calculate;
el.loanRange.oninput = updateLoan;

el.promoMode.onchange = () => {
  el.promoInput.style.display = el.promoMode.value === 'manual' ? 'block' : 'none';
  calculate();
  updateLoan();
};

el.promoInput.oninput = () => {
  let raw = el.promoInput.value.replace(/\D/g, '');
  el.promoInput.value = formatInputNumber(raw);
  calculate();
  updateLoan();
};

el.promoInput.onfocus = () => {
  el.promoInput.value = el.promoInput.value.replace(/\./g, '');
};

// ===== PASSWORD CHECK =====
function checkPassword() {
  return (el.passwordInput.value || '').trim().toUpperCase() === SYSTEM_PASSWORD;
}
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
    const service = Number(el.serviceFee.value || 0);

    const price = v.price + color;
    let promo = el.promoMode.value === 'manual' ? getPromoValue() : v.promo;

    const final = Math.max(0, price - promo);
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
const backBtn = $('backBtn');

if (backBtn) {
  backBtn.onclick = () => {
    $('pdfUI').style.display = 'none';
    $('appUI').style.display = 'block';
    window.scrollTo(0, 0);
  };
}
