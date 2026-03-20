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

  // animation effect
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

  // UI
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

  const fees = tax + a.registration + 60000 + a.roadFee + a.insurance + service;
  const equity = final - loan;

  animateValue(el.loanAmount, 0, loan);
  animateValue(el.costs, 0, fees);
  animateValue(el.equity, 0, equity);
  animateValue(el.payment, 0, fees + equity);
}

el.loanRange.oninput = updateLoan;

// ===== PDF =====
function updatePDF(car, ver, price, promo, final, tax, a, service, total) {

  $('pdfCar').textContent = `FORD ${car} - ${ver}`;
  $('pdfPrice').textContent = format(price);
  $('pdfPromo').textContent = format(promo);
  $('pdfFinal').textContent = format(final);

  $('pdfTax').textContent = format(tax);
  $('pdfPlate').textContent = format(a.registration);

  const other = a.roadFee + a.insurance + service + 60000;
  $('pdfOther').textContent = format(other);

  $('pdfTotal').textContent = format(total);
  $('pdfPayment').textContent = $('totalPayment').textContent;
}

// ===== EXPORT PDF =====
$('pdfBtn').onclick = async () => {

  const app = $('appUI');
  const pdf = $('pdfUI');

  app.style.display = 'none';
  pdf.style.display = 'block';

  await new Promise(r => setTimeout(r, 300));

  const canvas = await html2canvas(pdf);
  const img = canvas.toDataURL('image/png');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const width = 210;
  const height = canvas.height * width / canvas.width;

  doc.addImage(img, 'PNG', 0, 0, width, height);
  doc.save('ford-bao-gia.pdf');

  pdf.style.display = 'none';
  app.style.display = 'block';
};
