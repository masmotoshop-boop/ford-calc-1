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
  passwordInput: $('passwordInput'),
};
// 👁 toggle show/hide password (kèm đổi icon)
const toggle = document.querySelector('.toggle-pass');

if (toggle) {
  toggle.onclick = () => {
    const input = el.passwordInput;

    if (input.type === 'password') {
      input.type = 'text';
      toggle.textContent = '🙈';
    } else {
      input.type = 'password';
      toggle.textContent = '👁';
    }
  };
}
// ===== LOCK UI BAN ĐẦU =====
el.car.disabled = true;
el.version.disabled = true;
el.area.disabled = true;
// SERVICE
el.serviceFee.oninput = () => {
  el.serviceFeeValue.textContent = formatMoney(el.serviceFee.value);
  calculate();
};

// ===== CHECK PASSWORD REALTIME =====
el.passwordInput.oninput = () => {

  const pass = el.passwordInput.value.trim().toUpperCase();

  // ❌ sai password → khóa
  if (pass !== SYSTEM_PASSWORD) {
    el.car.disabled = true;
    el.version.disabled = true;
    el.area.disabled = true;
    return;
  }

  // ✅ đúng password → mở khóa
  el.car.disabled = false;

  // ===== FADE INPUT =====
  el.passwordInput.classList.add('password-hidden');

  setTimeout(() => {

    // ẩn input
    el.passwordInput.style.display = 'none';

    // ẩn label nếu có
    const label = el.passwordInput.previousElementSibling;
    if (label) label.style.display = 'none';

    // ===== HIỆN "ĐÃ XÁC THỰC" (CHỈ 1 LẦN) =====
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

// ===== CHANGE CAR =====
el.car.onchange = () => {

  const carName = el.car.value;

  // ❌ sai password
  if (!checkPassword()) {

    alert("Sai mật khẩu");

    el.car.value = '';
    el.version.innerHTML = '';
    el.area.innerHTML = '';

    el.version.disabled = true;
    el.area.disabled = true;

    return;
  }

  const car = data[carName];
  if (!car) return;

  // ✅ mở khóa
  el.version.disabled = false;
  el.area.disabled = false;

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

// ===== AUTO =====
el.version.onchange = calculate;
el.area.onchange = calculate;
el.colorFee.onchange = calculate;

// ===== CALCULATE =====
function calculate() {

  const car = el.car.value;

  // ❌ chỉ chặn nếu chưa chọn xe
  if (!car) return;
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

  const raw = el.promoInput.value.replace(/\./g, '').trim();

  if (!raw || isNaN(raw)) {
    promo = 0;
  } else {
    promo = Number(raw);
  }

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
// ===== PASSWORD =====
function checkPassword() {
  const input = (el.passwordInput.value || '').trim().toUpperCase();
  return input === SYSTEM_PASSWORD;
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
  const raw = (el.promoInput.value || '').replace(/\./g, '').trim();

  if (!raw || isNaN(raw)) {
    promo = 0;
  } else {
    promo = Number(raw);
  }
} // 👈 BẮT BUỘC PHẢI CÓ

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
// ===== PROMO MODE =====
el.promoMode.onchange = () => {

  if (el.promoMode.value === 'manual') {
    el.promoInput.style.display = 'block';
  } else {
    el.promoInput.style.display = 'none';
  }

  calculate();
  updateLoan();
};
el.loanRange.onchange = updateLoan;

// 👉 QUAN TRỌNG: khi nhập promo → phải update loan luôn
el.promoInput.oninput = () => {

  // chỉ giữ số
  let raw = el.promoInput.value.replace(/\D/g, '');

  // format lại
  el.promoInput.value = formatInputNumber(raw);

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
    const service = Number(el.serviceFee.value || 0);

    const price = v.price + color;
    let promo = v.promo;

if (el.promoMode.value === 'manual') {

  const raw = el.promoInput.value.replace(/\./g, '').trim();

  if (!raw || isNaN(raw)) {
    promo = 0;
  } else {
    promo = Number(raw);
  }

}

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

// ===== BACK =====
const backBtn = $('backBtn');

if (backBtn) {
  backBtn.onclick = () => {
    $('pdfUI').style.display = 'none';
    $('appUI').style.display = 'block';
    window.scrollTo(0, 0);
  };
}
