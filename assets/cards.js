// The card row at the top of every page, and the effect around the chosen card.
//
//   <div class="cards" data-active="player"></div>                  → the site's pages; picking a
//                                                                      side card slides to it and opens its page
//   <div class="cards" data-active="torrio" data-mode="swap"></div> → home page: picking a card swaps the
//                                                                      content below (#panel) for that page's
//   <div class="cards" data-active="support" data-mode="solo"></div>→ one card on its own (Support, Privacy)
//
// The canvas for the effect is put into the .hero the cards sit in.
(() => {
  const ROOT = new URL("../", document.currentScript.src); // the site's top folder
  const CARDS = [
    { id: "torrio", name: "Torrio", sub: "Downloads · speed", url: "", fx: "rings", c: "139 61 255",
      icon: '<path d="M12 3v12M6 10l6 6 6-6M4 21h16"/>' },
    { id: "player", name: "Player", sub: "Video · 4K", url: "player/", fx: "ice", c: "25 190 255",
      icon: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>' },
    { id: "music", name: "Music", sub: "Library · EQ", url: "music/", fx: "bars", c: "255 79 216",
      icon: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>' },
    { id: "converter", name: "Converter", sub: "GPU · fast", url: "converter/", fx: "flames", c: "255 110 40",
      icon: '<path d="M4 7h13l-3-3M20 17H7l3 3"/>' },
    { id: "google-drive", name: "Drive", sub: "Coming soon", url: "google-drive/", fx: "orbit", c: "40 210 150",
      icon: '<path d="M12 4.5l8.5 14.5h-17z"/><path d="M6.4 14h11.2"/>' },
    { id: "onedrive", name: "OneDrive", sub: "Microsoft", url: "onedrive/", fx: "clouds", c: "70 150 255",
      icon: '<path d="M7 18.5h10.5a4 4 0 00.4-7.98A6 6 0 006.3 9.6 4.5 4.5 0 007 18.5z"/>' },
  ];
  const SOLO = {
    support: { id: "support", name: "Support", sub: "Buy a coffee", url: "support/", fx: "hearts", c: "255 170 60",
      icon: '<path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 010 5H17M8 3v3M12 3v3"/>' },
    privacy: { id: "privacy", name: "Privacy", sub: "Your data", url: "privacy/", fx: "rings", c: "150 120 255",
      icon: '<path d="M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z"/><path d="M9 12l2 2 4-4"/>' },
  };

  const box = document.querySelector(".cards[data-active]");
  if (!box) return;
  const mode = box.dataset.mode || "nav";
  const list = mode === "solo" ? [SOLO[box.dataset.active]] : CARDS;
  const N = list.length;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = Math.max(0, list.findIndex(c => c.id === box.dataset.active));
  if (mode === "swap") {
    const h = list.findIndex(c => "#" + c.id === location.hash);
    if (h >= 0) active = h;
  }

  // ---- the cards
  const track = document.createElement("div");
  track.className = "track";
  track.setAttribute("role", mode === "swap" ? "tablist" : "navigation");
  track.setAttribute("aria-label", "Torrio's pages");
  box.appendChild(track);
  const els = list.map((c, i) => {
    const el = document.createElement(mode === "nav" ? "a" : "button");
    if (mode === "nav") el.href = new URL(c.url, ROOT).href; else el.type = "button";
    el.className = "ecard";
    el.style.setProperty("--c", c.c);
    el.innerHTML = `<span class="num">0${(CARDS.indexOf(c) + 1) || ""}</span><svg viewBox="0 0 24 24" aria-hidden="true">${c.icon}</svg><b>${c.name}</b><small>${c.sub}</small>`;
    if (mode === "solo") el.querySelector(".num").remove();
    el.addEventListener("click", e => { e.preventDefault(); if (i !== active) go(i); });
    track.appendChild(el);
    return el;
  });
  if (N > 1) {
    for (const [cls, label, d] of [["prev", "Previous", -1], ["next", "Next", 1]]) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "arrow " + cls; b.setAttribute("aria-label", label); b.textContent = d < 0 ? "‹" : "›";
      b.onclick = () => go(active + d);
      box.appendChild(b);
    }
  }
  const spacing = () => Math.min(285, Math.max(128, innerWidth * 0.22));
  function place() {
    const s = spacing();
    els.forEach((el, i) => {
      let off = ((i - active) % N + N) % N;
      if (off > N / 2) off -= N;
      const on = off === 0;
      el.classList.toggle("on", on);
      el.classList.toggle("far", Math.abs(off) > 1);
      if (mode === "swap") el.setAttribute("aria-selected", on); else if (on) el.setAttribute("aria-current", "page"); else el.removeAttribute("aria-current");
      el.tabIndex = Math.abs(off) > 1 ? -1 : 0;
      el.style.transform = `translateX(${off * s}px) scale(${on ? 1.14 : 0.9})`;
      el.style.zIndex = on ? 3 : 2 - Math.abs(off);
    });
  }

  // ---- the menu highlight: one glowing pill that slides to the item of the chosen card
  const nav = document.querySelector("header nav");
  const navLinks = nav ? [...nav.querySelectorAll("a:not(.nav-cta)")] : [];
  const glow = document.createElement("span");
  glow.className = "nav-glow";
  if (nav) nav.prepend(glow);
  function navTo(c) {
    if (!nav) return;
    const href = new URL(c.url, ROOT).href;
    const a = navLinks.find(l => l.href === href);
    if (!a) { nav.classList.remove("glowing"); return; }
    navLinks.forEach(l => l === a ? l.setAttribute("aria-current", "page") : l.removeAttribute("aria-current"));
    glow.style.width = a.offsetWidth + "px";
    glow.style.transform = "translateX(" + a.offsetLeft + "px)";
    nav.classList.add("glowing");
    // on phones the menu scrolls sideways: bring the item into view
    if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2, behavior: "smooth" });
  }
  addEventListener("resize", () => { if (!nav) return; nav.classList.add("still"); navTo(list[active]); requestAnimationFrame(() => nav.classList.remove("still")); });
  if (document.fonts) document.fonts.ready.then(() => { if (nav) { nav.classList.add("still"); navTo(list[active]); requestAnimationFrame(() => nav.classList.remove("still")); } });

  // ---- choosing a card
  function go(i, first) {
    active = ((i % N) + N) % N;
    const c = list[active];
    place();
    navTo(c);
    document.body.style.setProperty("--tint", c.c);
    fx.set(c.fx, c.c);
    if (first) return;
    if (mode === "nav") {
      // let the row slide, then open the page (it opens with the same row, already in place)
      setTimeout(() => { location.href = els[active].href; }, reduce ? 0 : 420);
    } else if (mode === "swap") {
      history.replaceState(null, "", c.id === "torrio" ? location.pathname : "#" + c.id);
      swap(c);
    }
  }
  addEventListener("keydown", e => {
    if (N < 2 || e.target.closest("input,textarea,select,[contenteditable]")) return;
    if (e.key === "ArrowLeft") go(active - 1);
    if (e.key === "ArrowRight") go(active + 1);
  });
  let x0 = null;
  box.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", e => {
    if (x0 === null || N < 2) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  addEventListener("resize", place);
  // open the next page early when a card is pointed at
  if (mode === "nav") els.forEach(el => el.addEventListener("pointerenter", () => {
    if (el.dataset.pre) return; el.dataset.pre = 1;
    const l = document.createElement("link"); l.rel = "prefetch"; l.href = el.href; document.head.appendChild(l);
  }));

  // ---- home page: swap the content below for the chosen card's page
  const hero = box.closest(".hero");
  const panel = document.getElementById("panel");
  const h1 = hero && hero.querySelector("h1"), lead = hero && hero.querySelector(".lead");
  const shot = hero && hero.querySelector(".shot");
  const home = mode === "swap" && panel ? { h1: h1.innerHTML, lead: lead.textContent, nodes: [...panel.childNodes], shot } : null;
  const cache = {};
  function load(c) {
    return cache[c.id] || (cache[c.id] = (async () => {
      const base = new URL(c.url, ROOT);
      const doc = new DOMParser().parseFromString(await (await fetch(base)).text(), "text/html");
      const main = doc.querySelector("main");
      const frag = document.createDocumentFragment();
      const top = main.querySelector(".hero");
      // its pills and screenshot are shown in the hero, where the home page has its own screenshot
      const extra = document.createElement("div");
      extra.className = "swapped-top";
      top && top.querySelectorAll(".pills, .shot").forEach(n => extra.appendChild(document.importNode(n, true)));
      main.querySelectorAll(":scope > section, :scope > .strip, :scope > .final").forEach(s => frag.appendChild(document.importNode(s, true)));
      // links and pictures were written for the page they came from
      frag.querySelectorAll("[src],[href]").forEach(el => {
        for (const a of ["src", "href"]) {
          const v = el.getAttribute(a);
          if (v && !v.startsWith("#") && !/^[a-z]+:/i.test(v)) el.setAttribute(a, new URL(v, base).href);
        }
      });
      const th1 = top && top.querySelector("h1"), tlead = top && top.querySelector(".lead");
      extra.querySelectorAll("[src]").forEach(el => el.setAttribute("src", new URL(el.getAttribute("src"), base).href));
      return { frag, extra, h1: th1 ? th1.innerHTML : c.name, lead: tlead ? tlead.textContent : "", url: base.href };
    })());
  }
  let seq = 0;
  async function swap(c) {
    const my = ++seq;
    panel.style.transition = "opacity .3s ease, transform .3s ease";
    panel.style.opacity = 0; panel.style.transform = "translateY(12px)";
    for (const el of [h1, lead]) el.classList.add("swap", "out");
    const wait = new Promise(r => setTimeout(r, reduce ? 0 : 300));
    let got = null;
    if (c.id !== "torrio") { try { got = await load(c); } catch (e) { got = null; } }
    await wait;
    if (my !== seq) return;
    const old = hero.querySelector(".swapped-top");
    if (old) old.remove();
    if (c.id === "torrio") {
      h1.innerHTML = home.h1; lead.textContent = home.lead;
      panel.replaceChildren(...home.nodes);
      if (shot) shot.hidden = false;
    } else if (got) {
      if (shot) shot.after(got.extra.cloneNode(true)); else hero.querySelector(".wrap").appendChild(got.extra.cloneNode(true));
      h1.innerHTML = got.h1; lead.textContent = got.lead;
      const more = document.createElement("p");
      more.className = "center"; more.style.margin = "0 0 20px";
      more.innerHTML = `<a class="btn btn-ghost" href="${got.url}">Open the ${c.name === "Drive" ? "Google Drive" : c.name} page ›</a>`;
      panel.replaceChildren(got.frag.cloneNode(true), more);
      if (shot) shot.hidden = true;
    } else {
      location.href = new URL(c.url, ROOT).href;
      return;
    }
    for (const el of [h1, lead]) el.classList.remove("out");
    panel.style.opacity = 1; panel.style.transform = "none";
    window.torrioLinks && window.torrioLinks();
  }

  // ---- the effect around the chosen card
  const fx = (() => {
    const cv = document.createElement("canvas");
    cv.className = "hero-fx"; cv.setAttribute("aria-hidden", "true");
    (hero || box).prepend(cv);
    const g = cv.getContext("2d");
    let kind = "rings", rgb = [139, 61, 255], parts = [], t0 = performance.now(), W = 0, H = 0;
    function size() { const d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); }
    // measured again whenever the canvas changes size (the hero grows when its screenshot
    // loads and shrinks when the home page hides it), or the drawing gets stretched off the card
    size(); new ResizeObserver(size).observe(cv);
    const col = (a, k = 1) => `rgba(${Math.min(255, rgb[0] * k) | 0},${Math.min(255, rgb[1] * k) | 0},${Math.min(255, rgb[2] * k) | 0},${a})`;
    function card() {
      const r = els[active].getBoundingClientRect(), s = cv.getBoundingClientRect();
      return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, w: r.width, h: r.height };
    }
    let fireSprites = null;
    function fire() {
      if (fireSprites) return fireSprites;
      const sprite = (r, gC, bC, core) => {
        const cv2 = document.createElement("canvas"); cv2.width = cv2.height = 64;
        const x = cv2.getContext("2d"), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, "rgba(" + r + "," + gC + "," + bC + "," + core + ")");
        gr.addColorStop(0.35, "rgba(" + r + "," + gC + "," + bC + "," + (core * 0.55) + ")");
        gr.addColorStop(1, "rgba(" + r + "," + gC + "," + bC + ",0)");
        x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
        return cv2;
      };
      // hottest (youngest) to coolest: white-yellow, yellow, orange, red, deep red
      const stops = [[255, 250, 210], [255, 225, 120], [255, 180, 60], [255, 130, 30], [240, 85, 15], [200, 45, 10], [140, 20, 8], [70, 10, 5]];
      const ramp = [];
      for (let i = 0; i < 16; i++) {
        const fi = i / 15 * (stops.length - 1), lo = stops[Math.floor(fi)], hi = stops[Math.min(stops.length - 1, Math.floor(fi) + 1)], m = fi % 1;
        ramp.push(sprite(...lo.map((v, j) => Math.round(v + (hi[j] - v) * m)), 0.5 - i * 0.02));
      }
      fireSprites = { ramp, spark: sprite(255, 220, 140, 1) };
      return fireSprites;
    }
    let frostFor = "", frostSet = null;
    function frost(w, h) {
      const key = Math.round(w) + "x" + Math.round(h);
      if (frostFor === key) return frostSet;
      let seed = 7;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      const R = w / 2, L = h - w, P = 2 * L + 2 * Math.PI * R;
      // a point on the card's edge (u from 0 to 1 around it) and the direction straight out
      const edge = u => {
        let d = u * P;
        if (d < L) return { x: R, y: -L / 2 + d, nx: 1, ny: 0 };
        d -= L;
        if (d < Math.PI * R) { const a = d / R; return { x: R * Math.cos(a), y: L / 2 + R * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) }; }
        d -= Math.PI * R;
        if (d < L) return { x: -R, y: L / 2 - d, nx: -1, ny: 0 };
        d -= L;
        const a = Math.PI + d / R;
        return { x: R * Math.cos(a), y: -L / 2 + R * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
      };
      const segs = [], tips = [];
      const branch = (x, y, ang, len, depth, d) => {
        const x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
        segs.push({ x0: x, y0: y, x1, y1, d0: d, d1: d + len });
        if (depth === 0) { tips.push({ x: x1, y: y1, d: d + len, ph: rnd() * 40 }); return; }
        // ice branches at about 60 degrees, like real frost
        branch(x1, y1, ang + (rnd() - 0.5) * 0.25, len * (0.72 + rnd() * 0.15), depth - 1, d + len);
        if (rnd() < 0.85) branch(x1, y1, ang + 1.05 + (rnd() - 0.5) * 0.2, len * 0.55, depth - 1, d + len);
        if (rnd() < 0.85) branch(x1, y1, ang - 1.05 + (rnd() - 0.5) * 0.2, len * 0.55, depth - 1, d + len);
      };
      const n = Math.round(P / 11);
      for (let i = 0; i < n; i++) {
        const e = edge((i + rnd() * 0.6) / n);
        // more frost on the top half, where the cold "settles" in the picture
        const big = e.ny < 0 ? 1 : 0.6;
        branch(e.x, e.y, Math.atan2(e.ny, e.nx) + (rnd() - 0.5) * 0.7, (12 + rnd() * 18) * big, 2 + (rnd() < 0.65 * big ? 1 : 0), rnd() * 30);
      }
      frostFor = key; frostSet = { segs, tips };
      return frostSet;
    }
    function pill(cx, cy, w, h) { g.beginPath(); g.roundRect(cx - w / 2, cy - h / 2, w, h, w / 2); }
    const draw = {
      rings(c, t) {
        g.lineWidth = 1.4;
        for (let k = 0; k < 5; k++) {
          const p = ((t / 2600) + k / 5) % 1, grow = p * 120;
          g.strokeStyle = col(0.55 * (1 - p), 1.3);
          pill(c.x, c.y, c.w + grow, c.h + grow); g.stroke();
        }
      },
      ice(c, t, dt) {
        // Frost that grows out from the card's edge when it's chosen and then glints, a cold mist
        // sinking around its foot, and a little snow. The frost is worked out once per card size.
        const S = frost(c.w, c.h);
        const k = dt / 16;
        // ---- snow, across the whole top of the page
        while (parts.length < 70) parts.push({ x: Math.random() * W, y: Math.random() * H * 0.9 - (t < 50 ? 0 : H * 0.1), r: 0.8 + Math.random() * 1.8, sp: 0.25 + Math.random() * 0.55, ph: Math.random() * 9 });
        g.globalCompositeOperation = "lighter";
        for (const p of parts) {
          p.y += p.sp * k; p.x += Math.sin(t / 1300 + p.ph) * 0.25 * k;
          if (p.y > H * 0.95) { p.y = -6; p.x = Math.random() * W; }
          g.fillStyle = "rgba(225,245,255," + (0.35 + 0.35 * Math.sin(t / 500 + p.ph) ** 2) + ")";
          g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
        }
        // ---- cold mist: it sinks from the card and spreads along the floor
        for (let i = 0; i < 10; i++) {
          const ph = (t / 7000 + i / 10) % 1;
          const side = i % 2 ? 1 : -1;
          const x = c.x + side * (c.w * 0.25 + ph * c.w * (0.9 + (i % 3) * 0.3)) + Math.sin(t / 2100 + i) * 10;
          const y = c.y + c.h * 0.32 + ph * c.h * 0.32;
          const r = 34 + ph * 70;
          const a = 0.14 * Math.sin(ph * Math.PI);
          const gr = g.createRadialGradient(x, y, 0, x, y, r);
          gr.addColorStop(0, "rgba(190,235,255," + a + ")"); gr.addColorStop(1, "rgba(190,235,255,0)");
          g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        }
        // ---- a cold glow behind the card
        const glow = g.createRadialGradient(c.x, c.y, c.w * 0.3, c.x, c.y, c.h * 0.95);
        glow.addColorStop(0, "rgba(120,215,255,.22)"); glow.addColorStop(1, "rgba(120,215,255,0)");
        g.fillStyle = glow; g.beginPath(); g.arc(c.x, c.y, c.h * 0.95, 0, Math.PI * 2); g.fill();
        // ---- frost: each crystal grows out along its branches, then stays and glints
        const grown = t * 0.2;               // how far along its branches the frost has grown (px): fully formed in about half a second
        g.lineCap = "round";
        for (const pass of [0, 1]) {         // a soft wide stroke, then the sharp one on top
          g.lineWidth = pass ? 1.2 : 4;
          g.strokeStyle = pass ? "rgba(220,247,255,.85)" : "rgba(130,215,255,.22)";
          g.beginPath();
          for (const sg of S.segs) {
            if (sg.d0 > grown) continue;
            const f2 = Math.min(1, (grown - sg.d0) / (sg.d1 - sg.d0));
            g.moveTo(c.x + sg.x0, c.y + sg.y0);
            g.lineTo(c.x + sg.x0 + (sg.x1 - sg.x0) * f2, c.y + sg.y0 + (sg.y1 - sg.y0) * f2);
          }
          g.stroke();
        }
        // glints at the tips of the crystals
        for (const tip of S.tips) {
          if (tip.d > grown) continue;
          const tw = Math.max(0, Math.sin(t / 380 + tip.ph)) ** 6;
          if (tw < 0.05) continue;
          const x = c.x + tip.x, y = c.y + tip.y, r = 2 + tw * 6;
          g.strokeStyle = "rgba(240,252,255," + tw + ")"; g.lineWidth = 1;
          g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke();
          g.fillStyle = "rgba(255,255,255," + tw + ")"; g.beginPath(); g.arc(x, y, 1.4, 0, Math.PI * 2); g.fill();
        }
      },
      bars(c, t) {
        const n = 56; g.lineCap = "round"; g.lineWidth = 3.2;
        for (let k = 0; k < n; k++) {
          const a = k / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
          const rx = c.w / 2 + 10, ry = c.h / 2 + 10;
          const e = 1 / Math.sqrt((ca * ca) / (rx * rx) + (sa * sa) / (ry * ry));
          const v = 0.5 + 0.5 * Math.sin(t / 260 + k * 0.9) * Math.sin(t / 610 + k * 0.37);
          g.strokeStyle = col(0.35 + v * 0.55, 1.15);
          g.beginPath(); g.moveTo(c.x + ca * e, c.y + sa * e); g.lineTo(c.x + ca * (e + 6 + v * 34), c.y + sa * (e + 6 + v * 34)); g.stroke();
        }
      },
      flames(c, t, dt) {
        // Many small flame particles rising from behind the card's top edge: they start white-hot
        // and cool through yellow and orange to deep red, stretch as they rise, curl in a moving
        // draft, flicker, and throw off sparks. Drawn from ready-made soft sprites, so hundreds are cheap.
        const S = fire();
        const k = dt / 16;
        const capR = c.w / 2, capY = c.y - c.h / 2 + capR;
        const spawn = (n, ember) => {
          for (let i = 0; i < n; i++) {
            let x, y, nx, ny;
            if (Math.random() < 0.8) {        // the round top of the card
              const ang = Math.PI + Math.random() * Math.PI;
              nx = Math.cos(ang); ny = Math.sin(ang);
              x = c.x + nx * (capR - 5); y = capY + ny * (capR - 5);
            } else {                          // the upper sides
              const side = Math.random() < 0.5 ? -1 : 1;
              nx = side; ny = 0;
              x = c.x + side * (capR - 5); y = capY + Math.random() * c.h * 0.32;
            }
            if (ember) {
              parts.push({ e: 1, x, y, vx: nx * 0.6 + (Math.random() - 0.5) * 0.8, vy: -(2.2 + Math.random() * 2.2), life: 1, decay: 0.35 + Math.random() * 0.4, s: 1 + Math.random() * 1.4, ph: Math.random() * 9 });
            } else {
              const top = Math.max(0, -ny);   // flames are tallest over the top
              parts.push({ x, y, vx: nx * (0.35 + Math.random() * 0.5), vy: -(1.0 + Math.random() * 1.4) * (0.5 + top), life: 1, decay: 0.62 + Math.random() * 0.5, r: (7 + Math.random() * 9) * (0.7 + top * 0.7), seed: Math.random() * 100 });
            }
          }
        };
        spawn(Math.round(24 * k), false);
        if (Math.random() < 0.35 * k) spawn(1, true);
        // firelight: a warm glow that flickers with the flames
        const flick = 0.75 + 0.15 * Math.sin(t / 61) + 0.1 * Math.sin(t / 23 + 1.3);
        const lg = g.createRadialGradient(c.x, capY, capR * 0.4, c.x, capY - 20, c.h * 1.15);
        lg.addColorStop(0, "rgba(255,120,30," + (0.32 * flick) + ")"); lg.addColorStop(1, "rgba(255,60,0,0)");
        g.fillStyle = lg; g.beginPath(); g.arc(c.x, capY - 20, c.h * 1.15, 0, Math.PI * 2); g.fill();
        g.globalCompositeOperation = "lighter";
        const out = [];
        for (const p of parts) {
          p.life -= p.decay * dt / 1000;
          if (p.life <= 0) continue;
          out.push(p);
          if (p.e) {                          // a spark
            p.x += (p.vx + Math.sin(t / 180 + p.ph) * 0.5) * k; p.y += p.vy * k; p.vy *= 0.995;
            const tw = 0.6 + 0.4 * Math.sin(t / 40 + p.ph);
            g.globalAlpha = Math.min(1, p.life * 1.4) * tw;
            g.drawImage(S.spark, p.x - 4 * p.s, p.y - 4 * p.s, 8 * p.s, 8 * p.s);
            continue;
          }
          const age = 1 - p.life;
          // a draft that moves and curls the flames
          const draft = Math.sin(p.y * 0.045 + t * 0.006 + p.seed) * 0.55 + Math.sin(p.y * 0.11 - t * 0.011 + p.seed * 2) * 0.3;
          p.vx = p.vx * 0.94 + draft * 0.12 + (c.x - p.x) * 0.0016; // and lean in over the card
          p.vy -= 0.06 * k;                  // hot air speeds up as it rises
          p.x += p.vx * k; p.y += p.vy * k;
          const r = p.r * (1 - age * 0.75);
          const idx = Math.min(S.ramp.length - 1, (Math.pow(age, 1.35) * S.ramp.length) | 0);
          g.globalAlpha = 0.68 * Math.min(1, p.life * 1.6) * Math.sqrt(0.55 + 0.45 * Math.sin(t / 30 + p.seed));
          // taller than wide: a tongue of flame, not a ball
          g.drawImage(S.ramp[idx], p.x - r * 0.7, p.y - r * 1.6, r * 1.4, r * 3.2);
        }
        parts = out.length > 1400 ? out.slice(-1400) : out;
        g.globalAlpha = 1;
      },
      orbit(c, t) {
        g.globalCompositeOperation = "lighter";
        for (let k = 0; k < 3; k++) {
          const rx = c.w * 0.9 + k * 26, ry = c.h * 0.62 + k * 18;
          g.save(); g.translate(c.x, c.y); g.rotate((k - 1) * 0.5);
          g.strokeStyle = col(0.18); g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.stroke();
          for (let d = 0; d < 3; d++) {
            const a = t / (1400 + k * 500) + d * 2.1 + k, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
            const gr = g.createRadialGradient(x, y, 0, x, y, 9); gr.addColorStop(0, col(0.95, 1.4)); gr.addColorStop(1, col(0));
            g.fillStyle = gr; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill();
          }
          g.restore();
        }
      },
      clouds(c, t) {
        for (let k = 0; k < 9; k++) {
          const sp = 0.012 + (k % 3) * 0.006, span = W + 400;
          const x = ((t * sp + k * 190) % span) - 200, y = c.y - 60 + (k % 4) * 46 + Math.sin(t / 1800 + k) * 8, r = 50 + (k % 3) * 26;
          const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col(0.22, 1.35)); gr.addColorStop(1, col(0));
          g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        }
        g.lineWidth = 1.2; g.strokeStyle = col(0.35, 1.3); pill(c.x, c.y, c.w + 22, c.h + 22); g.stroke();
      },
      hearts(c, t, dt) { // little warm hearts floating up
        if (Math.random() < dt / 160) parts.push({ x: c.x + (Math.random() - 0.5) * c.w * 1.6, y: c.y + c.h / 2, s: 6 + Math.random() * 8, sp: 0.5 + Math.random() * 0.6, ph: Math.random() * 6, life: 1 });
        parts = parts.filter(p => (p.life -= dt / 4200) > 0);
        g.globalCompositeOperation = "lighter";
        for (const p of parts) {
          p.y -= p.sp * dt / 16;
          const x = p.x + Math.sin(t / 700 + p.ph) * 10, s = p.s;
          g.fillStyle = col(0.75 * Math.min(1, p.life * 1.6), 1.25);
          g.beginPath(); g.moveTo(x, p.y + s * 0.35);
          g.bezierCurveTo(x - s, p.y - s * 0.4, x - s * 0.45, p.y - s * 1.1, x, p.y - s * 0.45);
          g.bezierCurveTo(x + s * 0.45, p.y - s * 1.1, x + s, p.y - s * 0.4, x, p.y + s * 0.35); g.fill();
        }
        g.globalCompositeOperation = "source-over";
        const glow = g.createRadialGradient(c.x, c.y, c.w * 0.4, c.x, c.y, c.h);
        glow.addColorStop(0, col(0.2 + 0.08 * Math.sin(t / 500), 1.2)); glow.addColorStop(1, col(0));
        g.fillStyle = glow; g.beginPath(); g.arc(c.x, c.y, c.h, 0, Math.PI * 2); g.fill();
      },
    };
    let last = performance.now(), running = true;
    function frame(now) {
      const dt = Math.min(50, now - last); last = now;
      g.globalCompositeOperation = "source-over"; g.clearRect(0, 0, W, H);
      if (running) draw[kind](card(), now - t0, dt);
      g.globalCompositeOperation = "source-over";
      if (!reduce) requestAnimationFrame(frame);
    }
    new IntersectionObserver(es => { running = es[0].isIntersecting; }).observe(cv);
    if (!reduce) requestAnimationFrame(frame);
    return { set(k, c) { kind = k; rgb = c.split(" ").map(Number); parts = []; t0 = performance.now(); if (reduce) requestAnimationFrame(frame); } };
  })();

  box.classList.add("still");
  if (nav) nav.classList.add("still");
  go(active, true);
  requestAnimationFrame(() => requestAnimationFrame(() => nav && nav.classList.remove("still")));
  if (mode === "swap" && list[active].id !== "torrio") swap(list[active]);
  requestAnimationFrame(() => requestAnimationFrame(() => box.classList.remove("still")));
})();
