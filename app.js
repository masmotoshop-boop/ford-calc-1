document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

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
    totalPay: $('totalPayment'),

    serviceRange: $('serviceRange'),
    serviceValue: $('serviceValue'),

    colorFee: $('colorFee'),
    selectedCar: $('selectedCar'),

    result: document.querySelector('.result')
  };

  const format = n => (n || 0).toLocaleString('vi-VN') + ' đ';

  const data = typeof FORD_DATA !== "undefined" ? FORD_DATA : {};

  if (!Object.keys(data).length) {
    alert("Thiếu data.js");
    return;
  }

  // LOAD CAR
  el.car.innerHTML = '<option value="">Chọn xe</option>';
  Object.keys(data).forEach(c => el.car.add(new Option(c, c)));

  // CHANGE CAR
  el.car.onchange = () => {
    el.version.innerHTML = '';
    el.area.innerHTML = '';

    const car = data[el.car.value];
    if (!car) return;

    Object.keys(car.versions).forEach(v => el.version.add(new Option(v, v)));
    Object.keys(car.areas).forEach(a => el.area.add(new Option(a, a)));
  };

  // SERVICE
  const updateService = () => {
    el.serviceValue.textContent = format(el.serviceRange.value);
  };
  el.serviceRange.oninput = updateService;
  updateService();

  // CALC
  el.calc.onclick = () => {

    const car = el.car.value;
    const ver = el.version.value;
    const area = el.area.value;

    if (!car || !ver || !area) return alert("Chọn đủ");

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

    el.total.textContent = format(total);

    el.selectedCar.textContent = `FORD ${car} - ${ver}`;
    el.result.classList.add('show');

    updateLoan();
  };

  // LOAN
  const updateLoan = () => {

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

    el.totalPay.textContent = format(fees + equity);

    autoScale(el.totalPay);
  };

  el.loanRange.oninput = updateLoan;

  // AUTO SCALE
  function autoScale(elm) {
    let size = 22;
    elm.style.fontSize = size + "px";

    while (elm.scrollWidth > elm.clientWidth && size > 14) {
      size--;
      elm.style.fontSize = size + "px";
    }
  }

});