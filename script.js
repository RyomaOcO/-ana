(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Starfield ---------- */
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.floor((window.innerWidth * window.innerHeight) / 4000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.3 + 0.2,
      a: Math.random(),
      s: Math.random() * 0.015 + 0.003,
      v: Math.random() * 0.15 + 0.02,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const st of stars) {
      st.a += st.s;
      st.x -= st.v;
      if (st.x < 0) st.x = window.innerWidth;
      const alpha = 0.4 + Math.abs(Math.sin(st.a)) * 0.6;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) draw();
  });

  /* ---------- Header ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("global-nav");
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  };
  toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNav(false)));

  /* ---------- Count-up stats ---------- */
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const start = performance.now();
    const duration = 1600;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    ".section-head, .card, .product, .timeline li, .news-list li, .about-message, .profile, .job-list li"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => io.observe(el));

  const statIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        statIo.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll(".stat-num").forEach((el) => statIo.observe(el));

  /* ---------- Product filter ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const products = document.querySelectorAll(".product");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      products.forEach((p) => {
        p.classList.toggle("is-hidden", f !== "all" && p.dataset.cat !== f);
      });
    });
  });

  /* ---------- Contact form (demo only) ---------- */
  const form = document.querySelector(".contact-form");
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const ok = field.value.trim() !== "" && field.checkValidity();
      field.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      status.textContent = "未入力または形式が正しくない項目があります。";
      status.className = "form-status ng";
      return;
    }
    status.textContent = "お問い合わせを受け付けました。担当者よりフォン・ブラウン本社からご連絡いたします。（デモのため実際には送信されません）";
    status.className = "form-status ok";
    form.reset();
  });
})();
