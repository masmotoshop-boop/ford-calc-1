// ===== HELPER =====
const $ = id => document.getElementById(id);

const format = n => (n || 0).toLocaleString('vi-VN') + ' đ';

// ===== DATA =====
const data = typeof FORD_DATA !== "undefined" ? FORD_DATA : {};

if (!Object.keys(data).length) {
  alert("Thiếu data.js");
}

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

// ===== LOAD CAR =====
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

  // ===== UPDATE UI =====
  el.price.textContent = format(price);
  el.promo.textContent = format(v.promo);
  el.final.textContent = format(final);

  el.tax.textContent = format(tax);
  el.plate.textContent = format(a.registration);
  el.reg.textContent = format(60000);
  el.road.textContent = format(a.roadFee);
  el.ins.textContent = format(a.insurance);
  el.service.textContent = format(service);

  el.total.textContent = format(total);

  el.selectedCar.textContent = `FORD ${car} - ${ver}`;

  // ===== LOAN =====
  updateLoan();

  // ===== PDF SYNC =====
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

  el.loanAmount.textContent = format(loan);
  el.costs.textContent = format(fees);
  el.equity.textContent = format(equity);

  el.payment.textContent = format(fees + equity);
}

el.loanRange.oninput = updateLoan;

// ===== PDF UPDATE =====
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

  const payment = $('totalPayment').textContent;
  $('pdfPayment').textContent = payment;
}
