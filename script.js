(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    $$(".navLink", navLinks).forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const revealItems = $$(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in");
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));

  const navSectionIds = ["projects", "systems", "experience", "skills", "learning", "contact"];
  const sections = navSectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  const navAnchors = $$(".navLink");

  const setActiveLink = (id) => {
    navAnchors.forEach((anchor) => {
      anchor.classList.toggle("active", anchor.getAttribute("href") === `#${id}`);
    });
  };

  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) setActiveLink(visible.target.id);
  }, { threshold: [0.24, 0.45, 0.7] });

  sections.forEach((section) => navObserver.observe(section));

  $$(".dots").forEach((dots, groupIndex) => {
    const level = Math.max(0, Math.min(5, Number(dots.dataset.level || 0)));
    dots.innerHTML = "";

    for (let i = 1; i <= 5; i += 1) {
      const dot = document.createElement("i");
      dots.appendChild(dot);

      if (i <= level) {
        const delay = (groupIndex * 50) + (i * 110);
        setTimeout(() => dot.classList.add("on"), delay);
      }
    }
  });

  const depthElements = $$(".depth");
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let px = 0;
  let py = 0;

  window.addEventListener("pointermove", (event) => {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    px = (event.clientX / width) * 2 - 1;
    py = (event.clientY / height) * 2 - 1;
  }, { passive: true });

  const animateDepth = () => {
    const viewportHeight = window.innerHeight || 1;

    depthElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportHeight) return;

      const strength = Number(element.dataset.depth || 8);
      const localOffset = ((rect.top + (rect.height / 2)) / viewportHeight) * 2 - 1;
      const translateX = clamp(px * strength * 0.2, -7, 7);
      const translateY = clamp(py * strength * 0.16, -5, 5);
      const rotate = clamp(localOffset * -0.8, -0.8, 0.8);

      element.style.transform =
        `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg)`;
    });

    requestAnimationFrame(animateDepth);
  };
  requestAnimationFrame(animateDepth);

  const form = $("#contactForm");
  const formHint = $("#formHint");
  const copyButton = $("#copyEmail");
  const emailAddress = "stratosav1999@gmail.com";

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailAddress);
        if (formHint) formHint.textContent = "Email copied to clipboard.";
      } catch {
        if (formHint) formHint.textContent = `Could not copy automatically. Email: ${emailAddress}`;
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = $("#cName")?.value.trim() || "";
      const email = $("#cEmail")?.value.trim() || "";
      const message = $("#cMsg")?.value.trim() || "";

      if (!name || !email || !message) {
        if (formHint) formHint.textContent = "Please fill in all fields first.";
        return;
      }

      const subject = encodeURIComponent(`Portfolio contact - ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}\n\n- Sent from portfolio site`);
      window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;

      if (formHint) formHint.textContent = "Opening your email client.";
    });
  }

  const boardStatus = $("#boardStatus");
  const tempValue = $("#tempValue");
  const humidityValue = $("#humidityValue");
  const soilValue = $("#soilValue");
  const latencyValue = $("#latencyValue");
  const eventLog = $("#eventLog");
  const boardActions = $$(".boardAction");

  if (boardStatus && tempValue && humidityValue && soilValue && latencyValue && eventLog && boardActions.length) {
    let mode = "normal";

    const setMode = (nextMode) => {
      mode = nextMode;
      boardStatus.className = "boardState";

      if (mode === "alert") {
        boardStatus.classList.add("is-alert");
        boardStatus.textContent = "Alert";
      } else if (mode === "sleep") {
        boardStatus.classList.add("is-sleep");
        boardStatus.textContent = "Sleep";
      } else {
        boardStatus.classList.add("is-online");
        boardStatus.textContent = "Online";
      }

      boardActions.forEach((button) => {
        button.classList.toggle("active", button.dataset.mode === mode);
      });
    };

    const pushLog = (message) => {
      const now = new Date();
      const stamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const row = document.createElement("div");
      row.innerHTML = `<span>${stamp}</span><p>${message}</p>`;
      eventLog.prepend(row);

      while (eventLog.children.length > 4) {
        eventLog.removeChild(eventLog.lastElementChild);
      }
    };

    const renderTelemetry = () => {
      const temp = mode === "alert" ? 31 + Math.random() * 4 : mode === "sleep" ? 18 + Math.random() * 2 : 23 + Math.random() * 3;
      const humidity = mode === "alert" ? 34 + Math.random() * 8 : mode === "sleep" ? 49 + Math.random() * 4 : 55 + Math.random() * 7;
      const soil = mode === "alert" ? 29 + Math.random() * 10 : mode === "sleep" ? 63 + Math.random() * 5 : 68 + Math.random() * 8;
      const latency = mode === "alert" ? 80 + Math.random() * 35 : mode === "sleep" ? 26 + Math.random() * 12 : 38 + Math.random() * 18;

      tempValue.textContent = `${temp.toFixed(1)}\u00B0C`;
      humidityValue.textContent = `${Math.round(humidity)}%`;
      soilValue.textContent = `${Math.round(soil)}%`;
      latencyValue.textContent = `${Math.round(latency)} ms`;
    };

    boardActions.forEach((button) => {
      button.addEventListener("click", () => {
        setMode(button.dataset.mode || "normal");

        if (mode === "alert") {
          pushLog("Moisture dropped below target. Alert state broadcast over MQTT.");
        } else if (mode === "sleep") {
          pushLog("Board switched to low-power mode. Telemetry cadence reduced.");
        } else {
          pushLog("System back to normal mode. Sync cadence restored.");
        }

        renderTelemetry();
      });
    });

    setMode("normal");
    renderTelemetry();

    window.setInterval(() => {
      renderTelemetry();

      const messages = {
        normal: [
          "Sensor packet received and written to dashboard state.",
          "MQTT broker heartbeat OK. No retries needed.",
          "Telemetry values remain inside expected range."
        ],
        alert: [
          "Alert payload forwarded to UI and notification service.",
          "Threshold breach detected. Waiting for acknowledgement.",
          "High temperature trend persists. Monitoring continues."
        ],
        sleep: [
          "Low-power mode active. Next sensor wake cycle scheduled.",
          "Telemetry snapshot stored before standby interval.",
          "Board is sleeping to preserve battery."
        ]
      };

      const pool = messages[mode];
      pushLog(pool[Math.floor(Math.random() * pool.length)]);
    }, 3200);
  }
})();
