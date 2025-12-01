// ===== Tabs switching =====
const tabs = document.querySelectorAll(".tab");
const cards = document.querySelectorAll(".card");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const target = tab.getAttribute("data-target");

    cards.forEach(card => {
      const visible = card.id === target;
      card.classList.toggle("visible", visible);
      card.setAttribute("aria-hidden", visible ? "false" : "true");
    });

    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  });
});

// ===== Language toggle =====
const langEnBtn = document.getElementById("lang-en");
const langFaBtn = document.getElementById("lang-fa");

const texts = {
  en: {
    title: "Physics Console",
    subtitle: "Compute speed, velocity, and acceleration...",
    tabSpeed: "Speed",
    tabVelocity: "Velocity",
    tabAcceleration: "Acceleration",
    speedTitle: "Speed",
    velocityTitle: "Velocity",
    accelerationTitle: "Acceleration",
    distance: "Distance",
    time: "Time",
    displacement: "Displacement",
    deltaV: "Velocity change",
    deltaT: "Time change",
    output: "Output unit",
    compute: "Compute",
    footer: "Physics Console — crafted by Arad"
  },
  fa: {
    title: "کنسول فیزیک",
    subtitle: "محاسبه تندی، سرعت و شتاب...",
    tabSpeed: "تندی",
    tabVelocity: "سرعت",
    tabAcceleration: "شتاب",
    speedTitle: "تندی",
    velocityTitle: "سرعت",
    accelerationTitle: "شتاب",
    distance: "مسافت",
    time: "زمان",
    displacement: "جابجایی",
    deltaV: "تغییر سرعت",
    deltaT: "تغییر زمان",
    output: "واحد خروجی",
    compute: "محاسبه",
    footer: "کنسول فیزیک — ساخته شده توسط آراد "
  }
};

function setLanguage(lang) {
  const t = texts[lang];
  document.getElementById("title-text").textContent = t.title;
  document.getElementById("subtitle-text").textContent = t.subtitle;
  document.getElementById("tab-speed").textContent = t.tabSpeed;
  document.getElementById("tab-velocity").textContent = t.tabVelocity;
  document.getElementById("tab-acceleration").textContent = t.tabAcceleration;
  document.getElementById("speed-title").textContent = t.speedTitle;
  document.getElementById("velocity-title").textContent = t.velocityTitle;
  document.getElementById("acceleration-title").textContent = t.accelerationTitle;
  document.getElementById("label-distance").textContent = t.distance;
  document.getElementById("label-time").textContent = t.time;
  document.getElementById("label-displacement").textContent = t.displacement;
  document.getElementById("label-time-vel").textContent = t.time;
  document.getElementById("label-delta-v").textContent = t.deltaV;
  document.getElementById("label-delta-t").textContent = t.deltaT;
  document.getElementById("label-output").textContent = t.output;
  document.getElementById("label-output-vel").textContent = t.output;
  document.getElementById("label-output-acc").textContent = t.output;
  document.getElementById("btn-compute-speed").textContent = t.compute;
  document.getElementById("btn-compute-velocity").textContent = t.compute;
  document.getElementById("btn-compute-acc").textContent = t.compute;
  document.getElementById("footer-text").textContent = t.footer;

  // تغییر جهت و فونت
  if (lang === "fa") {
    document.documentElement.setAttribute("dir", "rtl");
    document.body.style.fontFamily = '"Vazirmatn", sans-serif';
  } else {
    document.documentElement.setAttribute("dir", "ltr");
    document.body.style.fontFamily = '"Inter", sans-serif';
  }

  // تغییر حالت دکمه‌ها
  langEnBtn.classList.toggle("active", lang === "en");
  langFaBtn.classList.toggle("active", lang === "fa");
}

langEnBtn.addEventListener("click", () => setLanguage("en"));
langFaBtn.addEventListener("click", () => setLanguage("fa"));

// ===== Unit conversion maps =====
const lengthToMeters = { m: 1, km: 1000, mi: 1609.344, ft: 0.3048 };
const timeToSeconds = { s: 1, min: 60, h: 3600 };
const velocityToMS = { "m/s": 1, "km/h": 1000/3600, mph: 1609.344/3600, "ft/s": 0.3048 };
const msToVelocityOut = { "m/s": 1, "km/h": 3600/1000, mph: 3600/1609.344, "ft/s": 1/0.3048 };
const accelToMS2 = { "m/s²": 1, "ft/s²": 0.3048 };
const ms2ToAccelOut = { "m/s²": 1, "ft/s²": 1/0.3048 };

// Utility
const fmt = (n, digits = 6) => new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
const isFiniteNumber = (x) => typeof x === "number" && isFinite(x);
const renderResult = (el, latex) => {
  el.innerHTML = latex;
  if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([el]).catch(() => {});
};

// ===== Speed form =====
const distanceInput = document.getElementById("distance");
const timeInput = document.getElementById("time");

// پیام خطا بر اساس زبان انتخابی
function attachValidation(input, faMsg, enMsg) {
  input.addEventListener("invalid", () => {
    if (currentLang === "fa") {
      input.setCustomValidity(faMsg);
    } else {
      input.setCustomValidity(enMsg);
    }
  });
  input.addEventListener("input", () => {
    input.setCustomValidity(""); // وقتی کاربر چیزی وارد کرد، پیام پاک بشه
  });
}

// اضافه کردن پیام‌ها
attachValidation(distanceInput, "لطفاً مقدار مسافت را وارد کنید", "Please enter the distance");
attachValidation(timeInput, "لطفاً مقدار زمان را وارد کنید", "Please enter the time");

document.getElementById("speed-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const dVal = parseFloat(distanceInput.value);
  const dUnit = document.getElementById("distance-unit").value;
  const tVal = parseFloat(timeInput.value);
  const tUnit = document.getElementById("time-unit").value;
  const outUnit = document.getElementById("speed-out-unit").value;
  const out = document.getElementById("speed-result");

  try {
    if (!isFiniteNumber(dVal) || !isFiniteNumber(tVal)) throw new Error("Invalid input.");
    if (tVal === 0) throw new Error("Time cannot be zero.");

    const dMeters = dVal * lengthToMeters[dUnit];
    const tSeconds = tVal * timeToSeconds[tUnit];
    const vMS = dMeters / tSeconds;
    const vOut = vMS * msToVelocityOut[outUnit];

    const latex = `\\( v = \\dfrac{d}{t} = \\dfrac{${dVal}\\,${dUnit}}{${tVal}\\,${tUnit}} = ${vOut}\\,${outUnit} \\)`;
    renderResult(out, latex);
  } catch (err) {
    out.textContent = `Error: ${err.message}`;
    out.classList.add("error");
    setTimeout(() => out.classList.remove("error"), 1400);
  }
});


// ===== Velocity form =====
const displacementInput = document.getElementById("displacement");
const timeVelInput = document.getElementById("velocity-time");

// تابع برای اتصال پیام خطا بر اساس زبان
function attachValidation(input, faMsg, enMsg) {
  input.addEventListener("invalid", () => {
    if (currentLang === "fa") {
      input.setCustomValidity(faMsg);
    } else {
      input.setCustomValidity(enMsg);
    }
  });
  input.addEventListener("input", () => {
    input.setCustomValidity(""); // وقتی کاربر چیزی وارد کرد، پیام پاک بشه
  });
}

// پیام‌های سفارشی برای فیلدهای Velocity
attachValidation(displacementInput, "لطفاً مقدار جابجایی را وارد کنید", "Please enter the displacement");
attachValidation(timeVelInput, "لطفاً مقدار زمان را وارد کنید", "Please enter the time");

document.getElementById("velocity-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const dxVal = parseFloat(displacementInput.value);
  const dxUnit = document.getElementById("displacement-unit").value;
  const tVal = parseFloat(timeVelInput.value);
  const tUnit = document.getElementById("velocity-time-unit").value;
  const outUnit = document.getElementById("velocity-out-unit").value;
  const out = document.getElementById("velocity-result");

  try {
    if (!isFiniteNumber(dxVal) || !isFiniteNumber(tVal)) throw new Error("Invalid input.");
    if (tVal === 0) throw new Error("Time cannot be zero.");

    const dxMeters = dxVal * lengthToMeters[dxUnit];
    const tSeconds = tVal * timeToSeconds[tUnit];
    const vMS = dxMeters / tSeconds;
    const vOut = vMS * msToVelocityOut[outUnit];

    const latex = `\\( v = \\dfrac{\\Delta x}{t} = \\dfrac{${fmt(dxVal)}\\,${dxUnit}}{${fmt(tVal)}\\,${tUnit}} = ${fmt(vOut)}\\,${outUnit} \\)`;
    renderResult(out, latex);
  } catch (err) {
    out.textContent = `Error: ${err.message}`;
    out.classList.add("error");
    setTimeout(() => out.classList.remove("error"), 1400);
  }
});


// ===== Acceleration form =====
document.getElementById("acceleration-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const dvVal = parseFloat(document.getElementById("delta-v").value);
  const dvUnit = document.getElementById("delta-v-unit").value;
  const dtVal = parseFloat(document.getElementById("delta-t").value);
  const dtUnit = document.getElementById("delta-t-unit").value;
  const outUnit = document.getElementById("acc-out-unit").value;
  const out = document.getElementById("acceleration-result");

  try {
    if (!isFiniteNumber(dvVal) || !isFiniteNumber(dtVal)) throw new Error("Invalid input.");
    if (dtVal === 0) throw new Error("Time change cannot be zero.");

    const dvMS = dvVal * velocityToMS[dvUnit];
    const dtS = dtVal * timeToSeconds[dtUnit];
    const aMS2 = dvMS / dtS;
    const aOut = aMS2 * ms2ToAccelOut[outUnit];

    const latex = `\\( a = \\dfrac{\\Delta v}{\\Delta t} = \\dfrac{${fmt(dvVal)}\\,${dvUnit}}{${fmt(dtVal)}\\,${dtUnit}} = ${fmt(aOut)}\\,${outUnit} \\)`;
    renderResult(out, latex);
  } catch (err) {
    out.textContent = `Error: ${err.message}`;
    out.classList.add("error");
    setTimeout(() => out.classList.remove("error"), 1400);
  }
});
