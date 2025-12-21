(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  // year
  $("#year").textContent = new Date().getFullYear();

  // mobile nav
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    $$(".navLink", navLinks).forEach(a => a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }));
  }

  // reveal
  const revealObs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add("in");
    }
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => revealObs.observe(el));

  // scrollspy
  const ids = ["skills","projects","future","seminars","arcade","contact"];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  const links = $$(".navLink").filter(a => a.getAttribute("href")?.startsWith("#"));

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
  };

  const spy = new IntersectionObserver((entries) => {
    const v = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (v?.target?.id) setActive(v.target.id);
  }, { threshold: [0.2, 0.35, 0.55] });

  sections.forEach(s => spy.observe(s));

  // skill dots (5 max)
  $$(".dots").forEach(d => {
    const level = Math.max(0, Math.min(5, Number(d.dataset.level || 0)));
    d.innerHTML = "";
    for (let i=1;i<=5;i++){
      const dot = document.createElement("i");
      if (i <= level) dot.classList.add("on");
      d.appendChild(dot);
    }
  });

  // gentle pseudo-3D depth on scroll (VERY subtle)
  const depthEls = $$(".depth");
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));

  let px = 0, py = 0;
  window.addEventListener("pointermove", (e) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    px = (e.clientX / w) * 2 - 1;
    py = (e.clientY / h) * 2 - 1;
  }, { passive:true });

  const animateDepth = () => {
    const vh = window.innerHeight || 1;
    for (const el of depthEls) {
      const d = Number(el.dataset.depth || 8);
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;

      // local scroll position (-1..1)
      const local = ((r.top + r.height/2) / vh) * 2 - 1;

      // tiny transform
      const tx = clamp(px * d * 0.35, -8, 8);
      const ty = clamp(py * d * 0.25, -6, 6);
      const rz = clamp(local * -0.4, -0.6, 0.6);

      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotateZ(${rz.toFixed(2)}deg)`;
    }
    requestAnimationFrame(animateDepth);
  };
  requestAnimationFrame(animateDepth);

  // contact form -> mailto
  const form = $("#contactForm");
  const hint = $("#formHint");
  const copyBtn = $("#copyEmail");
  const emailTo = "stratosav1999@gmail.com";

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailTo);
        hint.textContent = "Email copied.";
      } catch {
        hint.textContent = `Could not copy. Email: ${emailTo}`;
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#cName").value.trim();
      const email = $("#cEmail").value.trim();
      const msg = $("#cMsg").value.trim();

      if (!name || !email || !msg) {
        hint.textContent = "Please fill in all fields.";
        return;
      }

      const subject = encodeURIComponent(`Portfolio contact — ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}\n\n— Sent from GitHub Pages`);
      window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
      hint.textContent = "Opening your email client…";
    });
  }

  // Arcade: Orbit Dots (quiet, tactile)
  const canvas = $("#orbit");
  const reset = $("#orbitReset");

  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const fit = () => {
      const cssW = canvas.clientWidth || 900;
      const cssH = canvas.clientHeight || 320;
      canvas.width = Math.floor(cssW * DPR);
      canvas.height = Math.floor(cssH * DPR);
    };
    fit();
    window.addEventListener("resize", fit, { passive:true });

    const rand = (a,b) => a + Math.random()*(b-a);

    let dots = [];
    const makeDots = (n=60) => {
      dots = Array.from({length:n}, () => ({
        a: rand(0, Math.PI*2),
        r: rand(20, 140) * DPR,
        s: rand(0.006, 0.02),
        x: rand(0, canvas.width),
        y: rand(0, canvas.height),
        vx: 0, vy: 0
      }));
    };
    makeDots();

    let mx = canvas.width/2, my = canvas.height/2;
    const setPointer = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / (rect.width || 1);
      const y = (ev.clientY - rect.top) / (rect.height || 1);
      mx = x * canvas.width;
      my = y * canvas.height;
    };
    canvas.addEventListener("pointermove", setPointer, { passive:true });
    canvas.addEventListener("pointerdown", setPointer, { passive:true });

    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);

      // background haze (very subtle)
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.arc(mx, my, 180*DPR, 0, Math.PI*2);
      ctx.fillStyle = "#7cc7ff";
      ctx.fill();

      ctx.globalAlpha = 1;

      for (const d of dots) {
        d.a += d.s;

        const tx = mx + Math.cos(d.a) * d.r;
        const ty = my + Math.sin(d.a) * d.r;

        // soft spring
        const dx = tx - d.x;
        const dy = ty - d.y;
        d.vx = (d.vx + dx * 0.002) * 0.92;
        d.vy = (d.vy + dy * 0.002) * 0.92;
        d.x += d.vx;
        d.y += d.vy;

        // dot
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2.2*DPR, 0, Math.PI*2);
        ctx.fillStyle = "rgba(231,237,247,0.85)";
        ctx.fill();

        // tiny line (close)
        const lx = mx - d.x;
        const ly = my - d.y;
        const dist = Math.hypot(lx,ly);
        if (dist < 160*DPR) {
          const a = (1 - dist/(160*DPR)) * 0.22;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = "rgba(124,199,255,0.9)";
          ctx.lineWidth = 1*DPR;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    if (reset) reset.addEventListener("click", () => makeDots());
  }
})();
// =========================
// SKILLS: DOTS LOAD ON SCROLL
// =========================

const skillSections = document.querySelectorAll("#skills .card");

const skillObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const dotsContainers = entry.target.querySelectorAll(".dots");

dotsContainers.forEach((dots, index) => {
      const level = Math.max(0, Math.min(5, Number(dots.dataset.level || 0)));
      dots.innerHTML = "";

      for (let i = 1; i <= 5; i++) {
        const dot = document.createElement("i");

        if (i <= level) {
          // staggered "loading" effect
          dot.style.transitionDelay = `${(i + index) * 120}ms`;

          setTimeout(() => dot.classList.add("on"), i * 160);
        }

        dots.appendChild(dot);
      }
    });

    // Run only once per card
    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.35   // activates when ~35% visible (feels natural)
});

// observe each skill card
skillSections.forEach(card => skillObserver.observe(card));
