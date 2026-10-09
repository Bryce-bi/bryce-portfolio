/* ==========================================================================
   Bryce De Developer — Portfolio scripts (plain JS, no build step)
   --------------------------------------------------------------------------
   1. CONFIG — your email + Calendly link (edit here)
   2. Nav: scroll state, mobile menu, active link
   3. Scroll reveal
   4. Work cards: hover/in-view preview videos
   5. Video lightbox (self-hosted .mp4 or YouTube/Vimeo/Loom embed)
   6. Contact form (Formspree — endpoint goes in the form's action="" in index.html)
   7. Landing: "zoom into the glow" hero → works desk (GSAP + ScrollTrigger)
   8. "View case" links
   9. Hero: audience tabs (full headline swap) + drifting stars
  10. Hero: "Built with" logos (placeholder until the SVG exists)
  11. Placeholder project cards: "Coming soon" until their media files exist
  12. Testimonial photos (initials fallback)
   ========================================================================== */

/* 1. CONFIG ================================================================
   Change these two values and every email / "Book a Call" link on the page
   updates automatically. Leave the [PLACEHOLDER] text to keep them inactive. */
const CONFIG = {
  email: "ogidiayomide44@gmail.com",
  calendly: "https://calendly.com/ogidiayomide",
};

const isPlaceholder = (value) => !value || value.startsWith("[");

document.documentElement.classList.add("js");   // enables reveal animations in CSS
document.getElementById("year").textContent = new Date().getFullYear();

// Email links
document.querySelectorAll("[data-email]").forEach((link) => {
  if (!isPlaceholder(CONFIG.email)) link.href = `mailto:${CONFIG.email}`;
  else link.href = "#contact";
});
document.querySelectorAll("[data-email-text]").forEach((el) => (el.textContent = CONFIG.email));

// Calendly buttons (fall back to the contact section until a link is set)
document.querySelectorAll("[data-calendly]").forEach((link) => {
  if (!isPlaceholder(CONFIG.calendly)) {
    link.href = CONFIG.calendly;
  } else {
    link.href = "#contact";
    link.removeAttribute("target");
  }
});

/* 2. NAV =================================================================== */
const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

// Solid, blurred header once the page is scrolled
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile menu open/close
const setMenu = (open) => {
  navLinks.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
navToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("is-open")));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Highlight the nav link for the section currently on screen
const navAnchors = [...navLinks.querySelectorAll('a[href^="#"]:not(.btn)')];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
navAnchors.forEach((a) => {
  const section = document.querySelector(a.getAttribute("href"));
  if (section) sectionObserver.observe(section);
});

/* 3. SCROLL REVEAL ========================================================= */
const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* 4. WORK CARD PREVIEW VIDEOS ==============================================
   Desktop (mouse): preview plays on hover.
   Touch devices: preview plays while the card is on screen.
   If the .mp4 is missing or fails to load, the image simply stays visible. */
const canHover = window.matchMedia("(hover: hover)").matches;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const playPreview = (card, video) => {
  const attempt = video.play();
  if (attempt) attempt.then(() => card.classList.add("is-playing")).catch(() => {});
};
const stopPreview = (card, video) => {
  video.pause();
  card.classList.remove("is-playing");
};

const touchObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      const video = target.querySelector(".work-media__video");
      if (video) isIntersecting ? playPreview(target, video) : stopPreview(target, video);
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".work-card").forEach((card) => {
  const video = card.querySelector(".work-media__video");
  if (video && !reducedMotion) {
    video.addEventListener("error", () => video.remove());   // missing file → image fallback
    // ...and if it already failed before this script ran (e.g. a placeholder card's preview)
    if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) video.remove();
    if (canHover) {
      card.addEventListener("mouseenter", () => playPreview(card, video));
      card.addEventListener("mouseleave", () => stopPreview(card, video));
    } else {
      touchObserver.observe(card);
    }
  }

  // Hide the Play button when the card has no full video or embed link
  const playBtn = card.querySelector(".play-btn");
  if (playBtn && !playBtn.dataset.video && !playBtn.dataset.embed) playBtn.hidden = true;
});

/* 5. VIDEO LIGHTBOX ======================================================== */
const lightbox = document.getElementById("lightbox");
const lightboxFrame = document.getElementById("lightboxFrame");
const lightboxTitle = document.getElementById("lightboxTitle");
let lastFocused = null;

/** Turn a normal YouTube / Vimeo / Loom share link into an embeddable URL. */
function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop();
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0`;
    if (host === "vimeo.com") return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean)[0]}?autoplay=1`;
    if (host === "loom.com") return `https://www.loom.com/embed/${u.pathname.split("/").pop()}?autoplay=1`;
    return url; // already an embed URL (player.vimeo.com, youtube.com/embed, etc.)
  } catch {
    return url;
  }
}

function openLightbox({ video, embed, title }) {
  lastFocused = document.activeElement;
  lightboxTitle.textContent = title || "";
  lightboxFrame.innerHTML = "";

  if (video) {
    const el = document.createElement("video");
    el.src = video;
    el.controls = true;        // native controls incl. volume / mute
    el.muted = false;          // full videos play WITH sound (e.g. HoopWomen's music); hover previews stay muted
    el.volume = 1;
    el.autoplay = true;        // allowed with sound because it starts from the visitor's Play click
    el.playsInline = true;
    lightboxFrame.appendChild(el);
  } else if (embed) {
    const iframe = document.createElement("iframe");
    iframe.src = toEmbedUrl(embed);
    iframe.title = title || "Project video";
    iframe.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    lightboxFrame.appendChild(iframe);
  }

  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightbox.querySelector(".lightbox__close").focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxFrame.innerHTML = "";          // stops playback
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll(".play-btn").forEach((btn) => {
  btn.addEventListener("click", () =>
    openLightbox({ video: btn.dataset.video, embed: btn.dataset.embed, title: btn.dataset.title })
  );
});
lightbox.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeLightbox));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
});

/* 6. CONTACT FORM ==========================================================
   Live: posts to the Formspree endpoint in the form's action="" (index.html)
   and shows a success or error message under the button. */
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const submitText = form.querySelector(".btn__text");

const setError = (field, message) => {
  const wrap = field.closest(".field");
  wrap.classList.toggle("has-error", Boolean(message));
  wrap.querySelector(".field__error").textContent = message;
};

function validate() {
  let ok = true;
  const { name, email, message } = form.elements;
  if (!name.value.trim()) { setError(name, "Please add your name."); ok = false; } else setError(name, "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, "Please enter a valid email."); ok = false; } else setError(email, "");
  if (message.value.trim().length < 10) { setError(message, "Tell me a little more (10+ characters)."); ok = false; } else setError(message, "");
  return ok;
}

const setStatus = (type, message) => {
  statusEl.className = `form-status${type ? ` is-${type}` : ""}`;
  statusEl.textContent = message;
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("", "");
  if (!validate()) return;

  const submitBtn = form.querySelector("button[type=submit]");
  submitText.textContent = "Sending…";
  submitBtn.disabled = true;

  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },   // Formspree replies with JSON instead of redirecting
    });
    if (res.ok) {
      form.reset();
      setStatus("success", "Thanks! Your message is in. I'll reply the same day.");
    } else {
      // Formspree explains rejections, e.g. { errors: [{ message: "..." }] }
      const data = await res.json().catch(() => ({}));
      const reason = Array.isArray(data.errors) && data.errors.length
        ? data.errors.map((err) => err.message).join(" ")
        : "";
      setStatus("error", `Sorry, your message didn't send.${reason ? ` ${reason}` : ""} Please try again, or email me at ${CONFIG.email}.`);
    }
  } catch {
    // network problem (offline, blocked request, etc.)
    setStatus("error", `Couldn't reach the server. Check your connection and try again, or email me at ${CONFIG.email}.`);
  } finally {
    submitText.textContent = "Send message";
    submitBtn.disabled = false;
  }
});

/* 7. LANDING: ZOOM INTO THE GLOW ===========================================
   Desktop: the hero is pinned while you scroll. The photo scales up into the
   glowing laptop screen, warm light fills the view, the dark hero dissolves
   and the amber works desk (already tucked underneath) appears with its
   papers drifting into place.
   Mobile: no pin (smoother on phones). The photo just eases forward as the
   hero scrolls away, and the papers drift in as they come into view.
   Reduced motion, or GSAP failed to load: no effect, everything just shows. */
(function initLanding() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const root = document.documentElement;
  const intro = document.querySelector(".intro");
  const photo = document.getElementById("introPhoto");
  const shade = document.getElementById("introShade");
  const glow = document.getElementById("introGlow");
  const flash = document.getElementById("introFlash");
  const content = document.getElementById("introContent");
  const stats = document.getElementById("introBottom");   // hero footer row (trust, quotes, credentials)
  const hint = document.getElementById("scrollHint");
  const deskHead = document.getElementById("deskHead");
  const papers = gsap.utils.toArray(".desk-item");
  const tilts = [-6, 5, -4];   // extra rotation each paper starts with before it settles

  // Scale needed for the laptop screen to cover the whole viewport.
  // In hero-night.jpg (1200×896) the screen is ~8.3% of the width and ~10.6% of the height.
  const zoomScale = () => {
    const w = intro.offsetWidth;
    const h = intro.offsetHeight;
    const photoW = Math.max(w, (h * 1200) / 896);   // background-size: cover
    const photoH = (photoW * 896) / 1200;
    return Math.max(w / (photoW * 0.083), h / (photoH * 0.106)) * 1.15;
  };

  const mm = gsap.matchMedia();

  // ── Desktop: pinned, scroll-scrubbed zoom ──
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    root.classList.add("has-zoom");   // CSS: fixed-height hero + desk tucked underneath

    // Only the first row of papers lands as part of the zoom (the rest are below the fold).
    // Row = papers whose top is within half a card of the first paper's top (rows are offset/scattered).
    const rowLimit = papers[0].offsetTop + papers[0].offsetHeight / 2;
    const firstRow = papers.filter((p) => p.offsetTop < rowLimit);
    const laterRows = papers.filter((p) => p.offsetTop >= rowLimit);

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: intro,
        start: "top top",
        end: "+=160%",          // how long the transition lasts (in scroll distance)
        pin: true,
        scrub: 1,               // 1s of smoothing = the ease-out "catch up" feel
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to([content, stats], { autoAlpha: 0, y: -70, duration: 0.26, ease: "power2.in" }, 0)
      .to(hint, { autoAlpha: 0, duration: 0.1 }, 0)
      .to(shade, { opacity: 0, duration: 0.4 }, 0)
      // power3.in on a scale reads as a steady push forward (scaling is perceived logarithmically)
      .to(photo, { scale: zoomScale, duration: 0.74, ease: "power3.in" }, 0)
      .to(glow, { opacity: 1, scale: 3.4, duration: 0.5, ease: "power2.in" }, 0.24)
      .to(flash, { opacity: 1, duration: 0.18, ease: "power1.out" }, 0.6)
      .to(intro, { autoAlpha: 0, duration: 0.14 }, 0.86)
      // fromTo (not from): end values must be explicit because invalidateOnRefresh
      // re-reads them on every resize, when the elements are still hidden.
      .fromTo(deskHead,
        { autoAlpha: 0, y: 50 },
        { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.86)
      .fromTo(firstRow,
        { autoAlpha: 0, y: 140, rotation: (i) => tilts[i % tilts.length] },
        { autoAlpha: 1, y: 0, rotation: 0, duration: 0.16, stagger: 0.025, ease: "power3.out" }, 0.84);

    // Papers below the first row are off screen when the zoom ends, so they
    // drift in on their own as you scroll down to them.
    laterRows.forEach((paper, i) => {
      gsap.fromTo(paper,
        { autoAlpha: 0, y: 70, rotation: tilts[(i + firstRow.length) % tilts.length] },
        { autoAlpha: 1, y: 0, rotation: 0, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: paper, start: "top 90%", once: true } });
    });

    // "View Work" links glide through the whole transition and stop on the desk
    const workLinks = [...document.querySelectorAll('a[href="#work"]')];
    const goToWork = (e) => {
      e.preventDefault();
      window.scrollTo({ top: tl.scrollTrigger.end, behavior: "smooth" });
    };
    workLinks.forEach((a) => a.addEventListener("click", goToWork));

    return () => {                     // runs when the screen drops below 901px
      root.classList.remove("has-zoom");
      workLinks.forEach((a) => a.removeEventListener("click", goToWork));
    };
  });

  // ── Mobile / tablet: no pin, lighter version ──
  mm.add("(max-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
    const leave = { trigger: intro, start: "top top", end: "bottom top", scrub: true };
    gsap.to(photo, { scale: 1.45, ease: "none", scrollTrigger: leave });
    gsap.to(glow, { opacity: 0.9, scale: 2.2, ease: "none", scrollTrigger: { ...leave } });

    gsap.from(deskHead, {
      autoAlpha: 0, y: 40, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: deskHead, start: "top 88%", once: true },
    });
    papers.forEach((paper, i) => {
      gsap.from(paper, {
        autoAlpha: 0, y: 70, rotation: tilts[i % tilts.length],
        duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: paper, start: "top 90%", once: true },
      });
    });
  });

  // Recalculate positions once fonts and images have loaded (they change layout heights)
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

/* 8. "VIEW CASE" LINKS =====================================================
   Put your case study URL in each link's href in index.html. While a link
   still points to "#", it opens that card's video instead, or jumps to the
   contact form if the card has no video yet. */
document.querySelectorAll(".case-link").forEach((link) => {
  if (link.getAttribute("href") !== "#") return;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const playBtn = link.closest(".work-card").querySelector(".play-btn");
    if (playBtn && !playBtn.hidden) playBtn.click();
    else document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  });
});

/* 9. HERO: AUDIENCE TABS + DRIFTING STARS ================================== */

// Audience tabs: each tab swaps the WHOLE headline + subheadline.
// Text comes from the tab's data-headline / data-line attributes in index.html:
//   {curly braces}   → amber italic accent
//   [square brackets] → small glyph (✦ sparkle, an emoji, or </> as a code tag)
(function initAudienceTabs() {
  const tabs = [...document.querySelectorAll(".audience__tab")];
  const title = document.querySelector("#audiencePanel .intro__title");
  const sub = document.querySelector("#audiencePanel .intro__sub");
  const titleText = title && title.querySelector(".intro__titletext");
  const subText = sub && sub.querySelector(".intro__subtext");
  if (!tabs.length || !titleText || !subText) return;

  const glyphClass = (g) => (g === "✦" ? "glyph--spark" : /[<>]/.test(g) ? "glyph--code" : "glyph--emoji");

  // Build the headline from DOM nodes only (textContent, never innerHTML), so
  // nothing in the attribute can inject markup.
  const buildHeadline = (src) => {
    const frag = document.createDocumentFragment();
    const token = /\{([^}]*)\}|\[([^\]]*)\]/g;
    let last = 0;
    let m;
    while ((m = token.exec(src))) {
      let before = src.slice(last, m.index);
      if (m[1] !== undefined) {
        if (before) frag.append(before);
        const em = document.createElement("em");
        em.className = "intro__accent";
        em.textContent = m[1];
        frag.append(em);
      } else {
        const g = document.createElement("span");
        g.className = `glyph ${glyphClass(m[2])}`;
        g.setAttribute("aria-hidden", "true");
        g.textContent = m[2];
        // Keep the glyph on the same line as the word before it: the browser can
        // break next to an inline-block even after a non-breaking space, so wrap
        // "word + glyph" in a no-wrap span.
        const wrap = document.createElement("span");
        wrap.className = "glyph-wrap";
        before = before.replace(/ $/, "");
        const lastWord = before.match(/\S*$/)[0];
        if (before.length > lastWord.length) frag.append(before.slice(0, before.length - lastWord.length));
        if (lastWord) wrap.append(lastWord);
        else if (frag.lastChild) wrap.append(frag.lastChild);   // e.g. the accent right before it
        wrap.append("\u00A0", g);
        frag.append(wrap);
      }
      last = token.lastIndex;
    }
    if (last < src.length) frag.append(src.slice(last));
    return frag;
  };

  const render = (tab) => {
    titleText.replaceChildren(buildHeadline(tab.dataset.headline || ""));
    subText.textContent = tab.dataset.line || "";
  };

  // Reserve the height of the tallest headline/subheadline so the buttons
  // and everything below stay put while switching tabs.
  const reserveHeight = () => {
    [[title, titleText, (t) => buildHeadline(t.dataset.headline || "")],
     [sub, subText, (t) => t.dataset.line || ""]].forEach(([box, inner, content]) => {
      box.style.minHeight = "";
      const probe = box.cloneNode(false);           // same tag + classes = same font/size
      probe.classList.add("intro__measure");
      probe.removeAttribute("id");
      probe.style.width = `${box.clientWidth}px`;
      const probeInner = inner.cloneNode(false);
      probe.append(probeInner);
      box.parentNode.append(probe);
      let tallest = box.offsetHeight;
      tabs.forEach((t) => {
        probeInner.replaceChildren(content(t));
        tallest = Math.max(tallest, probe.offsetHeight);
      });
      probe.remove();
      box.style.minHeight = `${tallest}px`;
    });
  };

  let swapTimer = null;
  const select = (tab, focus = false) => {
    if (tab.classList.contains("is-active")) return;
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: "nearest", inline: "nearest" });   // keeps it visible on phones

    clearTimeout(swapTimer);
    if (reducedMotion) { render(tab); return; }

    // 1) old text lifts out → 2) swap → 3) new text rises in
    [titleText, subText].forEach((el) => el.classList.add("is-out"));
    swapTimer = setTimeout(() => {
      render(tab);
      [titleText, subText].forEach((el) => { el.classList.remove("is-out"); el.classList.add("is-in"); });
      void titleText.offsetWidth;                    // commit the start position
      [titleText, subText].forEach((el) => el.classList.remove("is-in"));
    }, 300);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    // Arrow keys move between tabs (standard tab pattern)
    tab.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });

  // Measure once fonts are in (Fraunces changes line breaks), and again on resize
  reserveHeight();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserveHeight);
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(reserveHeight, 150); });
})();

// Faint, slow stars in the night sky. Paused when the hero is off screen;
// drawn once (no movement) for people who prefer reduced motion.
(function initStars() {
  const canvas = document.getElementById("introStars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let w = 0, h = 0, raf = null, visible = true;

  const build = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (w * h) / 14000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.55,                 // sky only (top ~55%)
      r: Math.random() * 1.1 + 0.3,
      a: Math.random() * 0.45 + 0.12,              // base brightness: faint
      tw: Math.random() * Math.PI * 2,             // twinkle phase
      ts: Math.random() * 0.012 + 0.004,           // twinkle speed
      vx: (Math.random() * 0.06 + 0.02) * (Math.random() < 0.5 ? -1 : 1),
      vy: -(Math.random() * 0.02),
    }));
  };

  const draw = (move) => {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      if (move) {
        s.x += s.vx; s.y += s.vy; s.tw += s.ts;
        if (s.x < -2) s.x = w + 2; else if (s.x > w + 2) s.x = -2;
        if (s.y < -2) s.y = h * 0.55;
      }
      const horizonFade = Math.max(0, 1 - s.y / (h * 0.55));   // dimmer near the hills
      const alpha = s.a * (0.65 + 0.35 * Math.sin(s.tw)) * horizonFade;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(226, 234, 255, ${alpha.toFixed(3)})`;
      ctx.fill();
    }
  };

  const loop = () => { draw(true); raf = requestAnimationFrame(loop); };
  const start = () => { if (!raf && visible && !reducedMotion) loop(); };
  const stop = () => { cancelAnimationFrame(raf); raf = null; };

  build();
  reducedMotion ? draw(false) : start();

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(canvas.closest(".intro"));

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { build(); if (reducedMotion) draw(false); }, 200);
  });
})();

/* 10. HERO: "BUILT WITH" LOGOS =============================================
   Each logo is images/logos/<name>.svg. If a file isn't there yet, the <li>
   gets .is-missing and shows a dashed placeholder with the tool's name; the
   tooltip says which file to add. Drop the SVG in and it appears on reload. */
document.querySelectorAll(".stack__item").forEach((item) => {
  const img = item.querySelector(".stack__logo");
  if (!img) return;
  const markMissing = () => {
    item.classList.add("is-missing");
    item.title = `${img.alt}: add ${img.getAttribute("src")}`;
  };
  // The image may have finished (or failed) before this script ran. decode()
  // rejects only for a broken/missing file. Don't test naturalWidth: a valid SVG
  // with just a viewBox can report a width of 0.
  if (img.complete) img.decode().catch(markMissing);
  else img.addEventListener("error", markMissing, { once: true });
});

/* 11. PLACEHOLDER PROJECT CARDS ============================================
   Cards marked .is-pending (Project 04–08) show a "Coming soon" panel until
   their poster images/projectN.jpg exists. Their Play button + MP4 badge stay
   hidden until videos/projectN.mp4 exists. Drop the files in and reload:
   no code changes needed. (The hover preview is handled in section 4: a
   missing preview .mp4 is simply removed.) */
document.querySelectorAll(".work-card.is-pending").forEach((card) => {
  const img = card.querySelector(".work-media__img");
  const reveal = () => card.classList.remove("is-pending");
  if (img.complete) { if (img.naturalWidth > 0) reveal(); }   // already loaded (or already failed)
  else img.addEventListener("load", reveal, { once: true });
});

// Show a hidden Play button only once its full video is confirmed to exist
document.querySelectorAll(".work-card .play-btn[hidden][data-video]").forEach((btn) => {
  const src = btn.dataset.video;
  if (!src) return;
  const badge = btn.closest(".work-media").querySelector(".media-badge");
  const probe = document.createElement("video");   // detached: only reads metadata
  probe.preload = "metadata";
  probe.muted = true;
  const done = () => { probe.removeAttribute("src"); probe.load(); };
  probe.addEventListener("loadedmetadata", () => {
    btn.hidden = false;
    if (badge) badge.hidden = false;
    done();
  }, { once: true });
  probe.addEventListener("error", done, { once: true });
  probe.src = src;
});

/* 12. TESTIMONIAL PHOTOS ===================================================
   If a reviewer's photo file is missing, swap in a round initials avatar
   (from the img's data-initials) instead of a broken-image icon. */
document.querySelectorAll(".avatar--photo").forEach((img) => {
  const toInitials = () => {
    const span = document.createElement("span");
    span.className = "avatar avatar--initials";
    span.setAttribute("aria-hidden", "true");
    span.textContent = img.dataset.initials || "";
    img.replaceWith(span);
  };
  if (img.complete) img.decode().catch(toInitials);
  else img.addEventListener("error", toInitials, { once: true });
});
