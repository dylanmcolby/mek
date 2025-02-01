window.mekApp = (function () {
  const navId = "#nav";
  const navMenuId = "#nav-menu";
  const navContentSelector = ".nav_menu-content";
  const animationClass = "animate-content";
  let dataNavHideElements = [];

  // Variables to track scroll position for detecting scroll direction
  let lastScrollY = window.scrollY;
  let ticking = false; // To optimize scroll event handling

  function init() {
    setupNavListeners();
    setupScrollBehavior();
    setupCustomSelects();
    initializeScrollEffects();
    setupHomeScrollAnimation();
    setupSSAnimation();
    loadInAnimation();
    document.body.classList.add("loaded");
  }

  function loadInAnimation() {
    // Cache DOM elements and constants
    const loadingText = document.getElementById("loadingtext_num");
    const loadingEl = document.getElementById("loading");
    const ANIM_DURATION = 1750;
    const EXIT_DELAY = 300;
    const ANIMATION_START_DELAY = 300;
    const FINISH_DELAY = 300;

    // Use a single state object to reduce variables
    const state = {
      pageLoaded: false,
      progressComplete: false,
      startTime: null
    };

    // Easing function for smoother animation
    function easeOutQuad(t) {
      return t * (2 - t);
    }

    // Optimized animation function using timestamps
    function animateProgress(timestamp) {
      if (!loadingText) return;

      if (!state.startTime) {
        state.startTime = timestamp + ANIMATION_START_DELAY;
      }

      const elapsed = timestamp - state.startTime;
      
      if (elapsed < 0) {
        requestAnimationFrame(animateProgress);
        return;
      }

      const progress = Math.min(1, elapsed / ANIM_DURATION);
      const easedProgress = easeOutQuad(progress);
      const value = Math.min(100, Math.floor(easedProgress * 100));
      
      loadingText.textContent = value;

      if (value < 100) {
        requestAnimationFrame(animateProgress);
      } else {
        state.progressComplete = true;
        setTimeout(closeLoader, FINISH_DELAY);
      }
    }

    // Optimized loader closing function
    function closeLoader() {
      if (!loadingEl) return;
      
      loadingEl.style.transform = "translateY(-100%)";
      setTimeout(() => {
        loadingEl.style.display = "none";
        document.body.classList.add("loaded");
      }, EXIT_DELAY);
    }

    // Start animation
    requestAnimationFrame(animateProgress);
    setupLogoAnimation();
    setupTextAnimations();
  }

  function setupHomeScrollAnimation() {
    const scrollAnimElement = document.querySelector("#home-scroll-anim");
    if (!scrollAnimElement) return;
    const reel = document.querySelector("#home-scroll-anim-reel");
    if (!reel) return;
    const navLogo = document.querySelector(".nav_logo");
    if (!navLogo) return;

    const introText = document.querySelector(".intro-text");
    if (!introText) return;
    navLogo.style.transition = "none";

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollAnimElement,
        start: "top top",
        end: "+=2150",
        pin: true,
        scrub: 1,
        onEnter: () => {
          navLogo.style.transition = "none";
        },
        onLeave: () => {
          navLogo.style.transition = "";
        },
        onEnterBack: () => {
          navLogo.style.transition = "none";
        },
        onLeaveBack: () => {
          navLogo.style.transition = "";
        },
        invalidateOnRefresh: true, // Force refresh on resize
      },
    });

    // Add resize observer with rate limiting
    let lastRefreshTime = 0;
    const resizeObserver = new ResizeObserver(() => {
      const now = Date.now();
      if (now - lastRefreshTime >= 100) {
        ScrollTrigger.refresh();
        lastRefreshTime = now;
      }
    });

    resizeObserver.observe(document.body);

    tl.fromTo(
      reel,
      { scale: 0.25, marginTop: "-13.25rem" },
      { scale: 1, marginTop: "-13.25rem", duration: 0.7 },
      0
    )

      .to(reel, { duration: 1 }, 0)

      .fromTo(
        navLogo,
        { width: "100%", marginTop: "0rem" },
        { width: "8.8rem", marginTop: "1.0625rem", duration: 0.25 },
        0
      )

      .fromTo(
        introText,
        { opacity: 1, transform: "translateY(0rem)" },
        { opacity: 0, transform: "translateY(-5rem)", duration: 0.25 },
        0
      );
  }

  function setupSSAnimation() {
    const ssElement = document.querySelector("#ss-intro");
    if (!ssElement) return;

    const circle = ssElement.querySelector(".ss-intro_circle");
    if (!circle) return;

    const hugeText = ssElement.querySelector(".ss-intro_ss-huge-text");
    if (!hugeText) return;

    const heading = ssElement.querySelector(".ss-intro_heading");
    if (!heading) return;

    gsap.set(ssElement, {
      y: "-25vh", // Adjust this value to position it higher or lower
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ssElement,
        start: "top top",
        end: "+=4500px",
        pin: true,
        pinSpacing: false,
        scrub: 0.5,
        invalidateOnRefresh: true, // Force refresh on resize
      },
    });

    // Add resize observer with rate limiting
    let lastRefreshTime = 0;
    const resizeObserver = new ResizeObserver(() => {
      const now = Date.now();
      if (now - lastRefreshTime >= 100) {
        ScrollTrigger.refresh();
        lastRefreshTime = now;
      }
    });

    resizeObserver.observe(document.body);

    tl.set({}, { duration: 0.75 });

    tl.to(
      circle,
      {
        width: "150vmax",
        height: "150vmax",
        duration: 0.25,
        ease: "power2.in",
      },
      0
    );

    tl.to(
      circle,
      {
        width: "0vmax",
        height: "0vmax",
        duration: 0.175,
        ease: "linear",
      },
      0.45
    );

    tl.to(
      heading,
      {
        opacity: 0,
        duration: 0.01,
        ease: "linear",
      },
      0.4
    ).to(
      hugeText,
      {
        transform: "translateX(calc(-100% - 115vw))",
        duration: 0.65,
        ease: "slow",
      },
      0.1
    );
  }

  function setupTextAnimations() {
    // Handle text fade in animations
    document.querySelectorAll("[data-text-fadein]").forEach((element) => {
      const split = new SplitText(element, {
        type: "chars, words",
        charsClass: "char",
        wordsClass: "word",
      });

      // Check if element is in viewport on load
      const rect = element.getBoundingClientRect();
      const isInViewport = rect.top >= 0 && rect.top <= window.innerHeight;

      // Get delay from data attribute or use default
      const delay = element.dataset.textFadeinDelay
        ? element.dataset.textFadeinDelay
        : 0.2;

      // Create animation timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 95%", // adjust as needed
          end: "top 5%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        split.chars,
        {
          opacity: 0,
        },
        {
          duration: function () {
            // Faster duration on reverse
            return tl.reversed() ? 0.1 : 0.5;
          },
          opacity: 1,
          stagger: 0.01, // Keep stagger consistent for both directions
          delay: function () {
            // No delay on reverse
            return tl.reversed() ? 0 : delay;
          },
          ease: "power2.in",
        }
      );

      // Add CSS to prevent word breaks
      split.words.forEach((word) => {
        word.style.display = "inline-block";
        word.style.whiteSpace = "nowrap";
      });

      if (isInViewport) {
        // If element is in viewport on load, play animation immediately
        tl.play();
      } else {
        // If element is not in viewport, set initial state and enable scroll trigger
        split.chars.forEach((char) => gsap.set(char, { opacity: 0 }));
      }
    });
  }

  function setupLogoAnimation() {
    const logoContainer = document.querySelector(
      '[data-wf--menu--style="home"] .nav_logo svg'
    );
    if (!logoContainer || window.scrollY > 0) return;

    const paths = Array.from(logoContainer.querySelectorAll("path")).reverse();
    paths.forEach((path, index) => {
      gsap.fromTo(
        path,
        {
          opacity: 0,
          y: "100%",
        },
        {
          opacity: 1,
          y: "0%",
          duration: 0.5,
          ease: "power1.out",
          delay: index * 0.075,
        }
      );
    });
  }

  function initializeScrollEffects() {
    // Initialize ScrollSmoother
    const smoother = ScrollSmoother.create({
      smooth: 1.25,
      effects: true,
      normalizeScroll: true,
    });

    // Smooth load animations
    gsap.utils.toArray("[data-smooth-load]").forEach((element) => {
      const yOffset = element.dataset.smoothLoad || "4.5rem";
      gsap.fromTo(
        element,
        {
          y: yOffset,
          opacity: 1,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Background color scroll effects
    gsap.utils.toArray("[data-bg-scroll]").forEach((element) => {
      const bgColor = getComputedStyle(element).backgroundColor;
      const defaultColor = element.dataset.bgPreload || "#ffffff";

      // Find matching elements within this data-bg-scroll element
      const matchingElements = [...element.querySelectorAll("*")].filter(
        (el) => getComputedStyle(el).backgroundColor === bgColor
      );

      // Find child elements that should change text/bg color
      const textChildren = element.querySelectorAll(
        "[data-bg-scroll-child-text]"
      );
      const bgChildren = element.querySelectorAll("[data-bg-scroll-child-bg]");

      gsap.set([element, ...matchingElements], {
        backgroundColor: defaultColor,
      });
      gsap.set("body", { backgroundColor: defaultColor }); // Set initial body color

      // Single scroll trigger with reusable animation function
      const animateBackgrounds = (color, includeBody = false) => {
        const targets = [element, ...matchingElements];

        gsap.to(targets, {
          backgroundColor: color,
          duration: 0.6,
          ease: "power2.out",
        });

        // Always animate body separately to ensure proper color transition
        gsap.to("body", {
          backgroundColor: includeBody ? color : defaultColor,
          duration: 0.6,
          ease: "power2.out",
        });

        // Animate text color of child elements
        gsap.to(textChildren, {
          color: color,
          duration: 0.6,
          ease: "power2.out",
        });

        // Animate background color of child elements
        gsap.to(bgChildren, {
          backgroundColor: color,
          duration: 0.6,
          ease: "power2.out",
        });
      };

      ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom 30%",
        onEnter: () => animateBackgrounds(bgColor, true),
        onLeave: () => animateBackgrounds(defaultColor, true),
        onEnterBack: () => animateBackgrounds(bgColor, true),
        onLeaveBack: () => animateBackgrounds(defaultColor, true),
      });
    });
  }

  function setupNavListeners() {
    const openNavElements = document.querySelectorAll('[data-nav="open"]');
    openNavElements.forEach((element) => {
      element.addEventListener("click", openNav);
      element.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          openNav(e);
        }
      });
      element.setAttribute("aria-controls", "nav-menu");
      element.setAttribute("aria-expanded", "false");
      element.setAttribute("aria-label", "Open Navigation Menu");
    });

    const closeNavElements = document.querySelectorAll('[data-nav="close"]');
    closeNavElements.forEach((element) => {
      element.addEventListener("click", closeNav);
      element.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          closeNav(e);
        }
      });
      element.setAttribute("aria-controls", "nav-menu");
      element.setAttribute("aria-expanded", "true");
      element.setAttribute("aria-label", "Close Navigation Menu");
    });
  }

  function setupCustomSelects() {
    const customSelectWrappers = document.querySelectorAll(
      ".custom-select-wrapper"
    );

    customSelectWrappers.forEach((wrapper) => {
      const select = wrapper.querySelector("select");
      const customSelect = wrapper.querySelector(".custom-select");
      const trigger = wrapper.querySelector(".custom-select-trigger");
      const options = wrapper.querySelectorAll(".custom-option");

      // Get the inner span that contains the text
      const triggerTextSpan = trigger.querySelector("span");

      // Toggle dropdown
      customSelect.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAllCustomSelects(this);
        this.classList.toggle("open");
      });

      // Handle option selection
      options.forEach((option) => {
        option.addEventListener("click", function (e) {
          e.stopPropagation();
          const value = this.getAttribute("data-value");
          const text = this.textContent;

          // Update only the inner span text
          triggerTextSpan.textContent = text;
          select.value = value;
          customSelect.classList.remove("open");
          customSelect.style.transform = "rotate(0deg)";

          const event = new Event("change");
          select.dispatchEvent(event);
        });
      });

      // Set initial value
      const selectedOption = select.querySelector("option:checked");
      if (selectedOption) {
        triggerTextSpan.textContent = selectedOption.textContent;
      }

      // Update custom select when native select changes
      select.addEventListener("change", function () {
        const selected = select.querySelector("option:checked");
        triggerTextSpan.textContent = selected.textContent;
      });
    });

    // Close selects when clicking outside
    document.addEventListener("click", function () {
      closeAllCustomSelects();
    });
  }

  function closeAllCustomSelects(current = null) {
    const allCustomSelects = document.querySelectorAll(".custom-select");
    allCustomSelects.forEach((select) => {
      if (select !== current) {
        select.classList.remove("open");
      }
    });
  }

  function openNav(e) {
    e.preventDefault();
    const navMenu = document.querySelector(navMenuId);
    const nav = document.querySelector(navId);
    const navContent = navMenu.querySelector(navContentSelector);
    if (nav && navMenu && navContent) {
      // Add the 'is-opening' class
      navMenu.classList.add("is-opening");

      // Add the 'is-open' class to display the nav
      nav.classList.add("is-open");
      navMenu.classList.add("is-open");
      navMenu.setAttribute("aria-hidden", "false");

      // Remove the 'is-opening' class after 550ms
      setTimeout(() => {
        navMenu.classList.remove("is-opening");
      }, 550);

      // Add animation class to nav content
      setTimeout(() => navContent.classList.add(animationClass), 0);

      // Update ARIA attributes
      document
        .querySelectorAll('[data-nav="open"]')
        .forEach((btn) => btn.setAttribute("aria-expanded", "true"));
      document
        .querySelectorAll('[data-nav="close"]')
        .forEach((btn) => btn.setAttribute("aria-expanded", "false"));

      // Listen for Escape key to close nav
      document.addEventListener("keydown", handleEscape);
    }
  }

  function closeNav(e) {
    e.preventDefault();
    const nav = document.querySelector(navId);
    const navMenu = document.querySelector(navMenuId);
    const navContent = navMenu.querySelector(navContentSelector);
    if (nav && navMenu && navContent) {
      // Add the 'is-closing' class
      navMenu.classList.add("is-closing");

      // Remove the 'is-open' class to hide the nav
      navMenu.classList.remove("is-open");
      nav.classList.remove("is-open");
      navMenu.setAttribute("aria-hidden", "true");

      // Remove animation class from nav content
      navContent.classList.remove(animationClass);

      // Remove the 'is-closing' class after 550ms
      setTimeout(() => {
        navMenu.classList.remove("is-closing");
      }, 550);

      // Update ARIA attributes
      document
        .querySelectorAll('[data-nav="open"]')
        .forEach((btn) => btn.setAttribute("aria-expanded", "false"));
      document
        .querySelectorAll('[data-nav="close"]')
        .forEach((btn) => btn.setAttribute("aria-expanded", "true"));

      // Return focus to the open button
      const openButton = document.querySelector('[data-nav="open"]');
      if (openButton) openButton.focus();

      // Remove the Escape key listener
      document.removeEventListener("keydown", handleEscape);
    }
  }

  function handleEscape(e) {
    if (e.key === "Escape" || e.key === "Esc") closeNav(e);
  }

  function setupScrollBehavior() {
    dataNavHideElements = Array.from(
      document.querySelectorAll("[data-nav-hide]")
    );
    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }

  function handleScroll() {
    const currentScrollY = window.scrollY;

    // Handle page-scrolled class
    if (currentScrollY > 1) {
      document.body.classList.add("page-scrolled");
    } else {
      document.body.classList.remove("page-scrolled");
    }

    // Handle nav-hide class based on data-nav-hide elements
    if (!dataNavHideElements.length) {
      if (currentScrollY > 1) {
        document.body.classList.add("nav-hide");
      } else {
        document.body.classList.remove("nav-hide");
      }
    } else {
      let lastState = null;
      dataNavHideElements.forEach((el) => {
        if (el.offsetTop <= currentScrollY) {
          lastState = el.getAttribute("data-nav-hide");
        }
      });

      if (lastState === "true") {
        document.body.classList.add("nav-hide");
      } else {
        document.body.classList.remove("nav-hide");
      }
    }

    // --- New Scroll Direction Detection ---
    if (currentScrollY > lastScrollY) {
      // Scrolling Down
      document.body.classList.remove("scrolled-up");
    } else if (currentScrollY < lastScrollY) {
      // Scrolling Up
      document.body.classList.add("scrolled-up");
    }
    // Update lastScrollY
    lastScrollY = currentScrollY;
    // --- End of Scroll Direction Detection ---
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", function () {
  mekApp.init();
});

/*!
 * GSAP 3.12.7
 * https://gsap.com
 *
 * @license Copyright 2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */

!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? e(exports)
    : "function" == typeof define && define.amd
    ? define(["exports"], e)
    : e(((t = t || self).window = t.window || {}));
})(this, function (e) {
  "use strict";
  function _inheritsLoose(t, e) {
    (t.prototype = Object.create(e.prototype)),
      ((t.prototype.constructor = t).__proto__ = e);
  }
  function _assertThisInitialized(t) {
    if (void 0 === t)
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called"
      );
    return t;
  }
  function r(t) {
    return "string" == typeof t;
  }
  function s(t) {
    return "function" == typeof t;
  }
  function t(t) {
    return "number" == typeof t;
  }
  function u(t) {
    return void 0 === t;
  }
  function v(t) {
    return "object" == typeof t;
  }
  function w(t) {
    return !1 !== t;
  }
  function x() {
    return "undefined" != typeof window;
  }
  function y(t) {
    return s(t) || r(t);
  }
  function P(t) {
    return (i = yt(t, ot)) && ze;
  }
  function Q(t, e) {
    return console.warn(
      "Invalid property",
      t,
      "set to",
      e,
      "Missing plugin? gsap.registerPlugin()"
    );
  }
  function R(t, e) {
    return !e && console.warn(t);
  }
  function S(t, e) {
    return (t && (ot[t] = e) && i && (i[t] = e)) || ot;
  }
  function T() {
    return 0;
  }
  function ea(t) {
    var e,
      r,
      i = t[0];
    if ((v(i) || s(i) || (t = [t]), !(e = (i._gsap || {}).harness))) {
      for (r = gt.length; r-- && !gt[r].targetTest(i); );
      e = gt[r];
    }
    for (r = t.length; r--; )
      (t[r] && (t[r]._gsap || (t[r]._gsap = new Vt(t[r], e)))) ||
        t.splice(r, 1);
    return t;
  }
  function fa(t) {
    return t._gsap || ea(Mt(t))[0]._gsap;
  }
  function ga(t, e, r) {
    return (r = t[e]) && s(r)
      ? t[e]()
      : (u(r) && t.getAttribute && t.getAttribute(e)) || r;
  }
  function ha(t, e) {
    return (t = t.split(",")).forEach(e) || t;
  }
  function ia(t) {
    return Math.round(1e5 * t) / 1e5 || 0;
  }
  function ja(t) {
    return Math.round(1e7 * t) / 1e7 || 0;
  }
  function ka(t, e) {
    var r = e.charAt(0),
      i = parseFloat(e.substr(2));
    return (
      (t = parseFloat(t)),
      "+" === r ? t + i : "-" === r ? t - i : "*" === r ? t * i : t / i
    );
  }
  function la(t, e) {
    for (var r = e.length, i = 0; t.indexOf(e[i]) < 0 && ++i < r; );
    return i < r;
  }
  function ma() {
    var t,
      e,
      r = dt.length,
      i = dt.slice(0);
    for (ct = {}, t = dt.length = 0; t < r; t++)
      (e = i[t]) && e._lazy && (e.render(e._lazy[0], e._lazy[1], !0)._lazy = 0);
  }
  function na(t, e, r, i) {
    dt.length && !L && ma(),
      t.render(e, r, i || (L && e < 0 && (t._initted || t._startAt))),
      dt.length && !L && ma();
  }
  function oa(t) {
    var e = parseFloat(t);
    return (e || 0 === e) && (t + "").match(at).length < 2
      ? e
      : r(t)
      ? t.trim()
      : t;
  }
  function pa(t) {
    return t;
  }
  function qa(t, e) {
    for (var r in e) r in t || (t[r] = e[r]);
    return t;
  }
  function ta(t, e) {
    for (var r in e)
      "__proto__" !== r &&
        "constructor" !== r &&
        "prototype" !== r &&
        (t[r] = v(e[r]) ? ta(t[r] || (t[r] = {}), e[r]) : e[r]);
    return t;
  }
  function ua(t, e) {
    var r,
      i = {};
    for (r in t) r in e || (i[r] = t[r]);
    return i;
  }
  function va(t) {
    var e = t.parent || I,
      r = t.keyframes
        ? (function _setKeyframeDefaults(i) {
            return function (t, e) {
              for (var r in e)
                r in t ||
                  ("duration" === r && i) ||
                  "ease" === r ||
                  (t[r] = e[r]);
            };
          })(Z(t.keyframes))
        : qa;
    if (w(t.inherit))
      for (; e; ) r(t, e.vars.defaults), (e = e.parent || e._dp);
    return t;
  }
  function xa(t, e, r, i, n) {
    void 0 === r && (r = "_first"), void 0 === i && (i = "_last");
    var a,
      s = t[i];
    if (n) for (a = e[n]; s && s[n] > a; ) s = s._prev;
    return (
      s ? ((e._next = s._next), (s._next = e)) : ((e._next = t[r]), (t[r] = e)),
      e._next ? (e._next._prev = e) : (t[i] = e),
      (e._prev = s),
      (e.parent = e._dp = t),
      e
    );
  }
  function ya(t, e, r, i) {
    void 0 === r && (r = "_first"), void 0 === i && (i = "_last");
    var n = e._prev,
      a = e._next;
    n ? (n._next = a) : t[r] === e && (t[r] = a),
      a ? (a._prev = n) : t[i] === e && (t[i] = n),
      (e._next = e._prev = e.parent = null);
  }
  function za(t, e) {
    t.parent &&
      (!e || t.parent.autoRemoveChildren) &&
      t.parent.remove &&
      t.parent.remove(t),
      (t._act = 0);
  }
  function Aa(t, e) {
    if (t && (!e || e._end > t._dur || e._start < 0))
      for (var r = t; r; ) (r._dirty = 1), (r = r.parent);
    return t;
  }
  function Ca(t, e, r, i) {
    return (
      t._startAt &&
      (L
        ? t._startAt.revert(ht)
        : (t.vars.immediateRender && !t.vars.autoRevert) ||
          t._startAt.render(e, !0, i))
    );
  }
  function Ea(t) {
    return t._repeat ? Tt(t._tTime, (t = t.duration() + t._rDelay)) * t : 0;
  }
  function Ga(t, e) {
    return (
      (t - e._start) * e._ts +
      (0 <= e._ts ? 0 : e._dirty ? e.totalDuration() : e._tDur)
    );
  }
  function Ha(t) {
    return (t._end = ja(
      t._start + (t._tDur / Math.abs(t._ts || t._rts || X) || 0)
    ));
  }
  function Ia(t, e) {
    var r = t._dp;
    return (
      r &&
        r.smoothChildTiming &&
        t._ts &&
        ((t._start = ja(
          r._time -
            (0 < t._ts
              ? e / t._ts
              : ((t._dirty ? t.totalDuration() : t._tDur) - e) / -t._ts)
        )),
        Ha(t),
        r._dirty || Aa(r, t)),
      t
    );
  }
  function Ja(t, e) {
    var r;
    if (
      ((e._time ||
        (!e._dur && e._initted) ||
        (e._start < t._time && (e._dur || !e.add))) &&
        ((r = Ga(t.rawTime(), e)),
        (!e._dur || kt(0, e.totalDuration(), r) - e._tTime > X) &&
          e.render(r, !0)),
      Aa(t, e)._dp && t._initted && t._time >= t._dur && t._ts)
    ) {
      if (t._dur < t.duration())
        for (r = t; r._dp; )
          0 <= r.rawTime() && r.totalTime(r._tTime), (r = r._dp);
      t._zTime = -X;
    }
  }
  function Ka(e, r, i, n) {
    return (
      r.parent && za(r),
      (r._start = ja(
        (t(i) ? i : i || e !== I ? xt(e, i, r) : e._time) + r._delay
      )),
      (r._end = ja(
        r._start + (r.totalDuration() / Math.abs(r.timeScale()) || 0)
      )),
      xa(e, r, "_first", "_last", e._sort ? "_start" : 0),
      bt(r) || (e._recent = r),
      n || Ja(e, r),
      e._ts < 0 && Ia(e, e._tTime),
      e
    );
  }
  function La(t, e) {
    return (
      (ot.ScrollTrigger || Q("scrollTrigger", e)) &&
      ot.ScrollTrigger.create(e, t)
    );
  }
  function Ma(t, e, r, i, n) {
    return (
      Qt(t, e, n),
      t._initted
        ? !r &&
          t._pt &&
          !L &&
          ((t._dur && !1 !== t.vars.lazy) || (!t._dur && t.vars.lazy)) &&
          f !== Rt.frame
          ? (dt.push(t), (t._lazy = [n, i]), 1)
          : void 0
        : 1
    );
  }
  function Ra(t, e, r, i) {
    var n = t._repeat,
      a = ja(e) || 0,
      s = t._tTime / t._tDur;
    return (
      s && !i && (t._time *= a / t._dur),
      (t._dur = a),
      (t._tDur = n ? (n < 0 ? 1e10 : ja(a * (n + 1) + t._rDelay * n)) : a),
      0 < s && !i && Ia(t, (t._tTime = t._tDur * s)),
      t.parent && Ha(t),
      r || Aa(t.parent, t),
      t
    );
  }
  function Sa(t) {
    return t instanceof Xt ? Aa(t) : Ra(t, t._dur);
  }
  function Va(e, r, i) {
    var n,
      a,
      s = t(r[1]),
      o = (s ? 2 : 1) + (e < 2 ? 0 : 1),
      u = r[o];
    if ((s && (u.duration = r[1]), (u.parent = i), e)) {
      for (n = u, a = i; a && !("immediateRender" in n); )
        (n = a.vars.defaults || {}), (a = w(a.vars.inherit) && a.parent);
      (u.immediateRender = w(n.immediateRender)),
        e < 2 ? (u.runBackwards = 1) : (u.startAt = r[o - 1]);
    }
    return new $t(r[0], u, r[1 + o]);
  }
  function Wa(t, e) {
    return t || 0 === t ? e(t) : e;
  }
  function Ya(t, e) {
    return r(t) && (e = st.exec(t)) ? e[1] : "";
  }
  function _a(t, e) {
    return (
      t &&
      v(t) &&
      "length" in t &&
      ((!e && !t.length) || (t.length - 1 in t && v(t[0]))) &&
      !t.nodeType &&
      t !== h
    );
  }
  function cb(r) {
    return (
      (r = Mt(r)[0] || R("Invalid scope") || {}),
      function (t) {
        var e = r.current || r.nativeElement || r;
        return Mt(
          t,
          e.querySelectorAll
            ? e
            : e === r
            ? R("Invalid scope") || a.createElement("div")
            : r
        );
      }
    );
  }
  function db(t) {
    return t.sort(function () {
      return 0.5 - Math.random();
    });
  }
  function eb(t) {
    if (s(t)) return t;
    var p = v(t) ? t : { each: t },
      _ = jt(p.ease),
      m = p.from || 0,
      g = parseFloat(p.base) || 0,
      y = {},
      e = 0 < m && m < 1,
      T = isNaN(m) || e,
      b = p.axis,
      w = m,
      x = m;
    return (
      r(m)
        ? (w = x = { center: 0.5, edges: 0.5, end: 1 }[m] || 0)
        : !e && T && ((w = m[0]), (x = m[1])),
      function (t, e, r) {
        var i,
          n,
          a,
          s,
          o,
          u,
          h,
          l,
          f,
          d = (r || p).length,
          c = y[d];
        if (!c) {
          if (!(f = "auto" === p.grid ? 0 : (p.grid || [1, U])[1])) {
            for (
              h = -U;
              h < (h = r[f++].getBoundingClientRect().left) && f < d;

            );
            f < d && f--;
          }
          for (
            c = y[d] = [],
              i = T ? Math.min(f, d) * w - 0.5 : m % f,
              n = f === U ? 0 : T ? (d * x) / f - 0.5 : (m / f) | 0,
              l = U,
              u = h = 0;
            u < d;
            u++
          )
            (a = (u % f) - i),
              (s = n - ((u / f) | 0)),
              (c[u] = o = b ? Math.abs("y" === b ? s : a) : K(a * a + s * s)),
              h < o && (h = o),
              o < l && (l = o);
          "random" === m && db(c),
            (c.max = h - l),
            (c.min = l),
            (c.v = d =
              (parseFloat(p.amount) ||
                parseFloat(p.each) *
                  (d < f
                    ? d - 1
                    : b
                    ? "y" === b
                      ? d / f
                      : f
                    : Math.max(f, d / f)) ||
                0) * ("edges" === m ? -1 : 1)),
            (c.b = d < 0 ? g - d : g),
            (c.u = Ya(p.amount || p.each) || 0),
            (_ = _ && d < 0 ? Bt(_) : _);
        }
        return (
          (d = (c[t] - c.min) / c.max || 0),
          ja(c.b + (_ ? _(d) : d) * c.v) + c.u
        );
      }
    );
  }
  function fb(i) {
    var n = Math.pow(10, ((i + "").split(".")[1] || "").length);
    return function (e) {
      var r = ja(Math.round(parseFloat(e) / i) * i * n);
      return (r - (r % 1)) / n + (t(e) ? 0 : Ya(e));
    };
  }
  function gb(h, e) {
    var l,
      f,
      r = Z(h);
    return (
      !r &&
        v(h) &&
        ((l = r = h.radius || U),
        h.values
          ? ((h = Mt(h.values)), (f = !t(h[0])) && (l *= l))
          : (h = fb(h.increment))),
      Wa(
        e,
        r
          ? s(h)
            ? function (t) {
                return (f = h(t)), Math.abs(f - t) <= l ? f : t;
              }
            : function (e) {
                for (
                  var r,
                    i,
                    n = parseFloat(f ? e.x : e),
                    a = parseFloat(f ? e.y : 0),
                    s = U,
                    o = 0,
                    u = h.length;
                  u--;

                )
                  (r = f
                    ? (r = h[u].x - n) * r + (i = h[u].y - a) * i
                    : Math.abs(h[u] - n)) < s && ((s = r), (o = u));
                return (
                  (o = !l || s <= l ? h[o] : e),
                  f || o === e || t(e) ? o : o + Ya(e)
                );
              }
          : fb(h)
      )
    );
  }
  function hb(t, e, r, i) {
    return Wa(Z(t) ? !e : !0 === r ? !!(r = 0) : !i, function () {
      return Z(t)
        ? t[~~(Math.random() * t.length)]
        : (r = r || 1e-5) &&
            (i = r < 1 ? Math.pow(10, (r + "").length - 2) : 1) &&
            Math.floor(
              Math.round((t - r / 2 + Math.random() * (e - t + 0.99 * r)) / r) *
                r *
                i
            ) / i;
    });
  }
  function lb(e, r, t) {
    return Wa(t, function (t) {
      return e[~~r(t)];
    });
  }
  function ob(t) {
    for (var e, r, i, n, a = 0, s = ""; ~(e = t.indexOf("random(", a)); )
      (i = t.indexOf(")", e)),
        (n = "[" === t.charAt(e + 7)),
        (r = t.substr(e + 7, i - e - 7).match(n ? at : tt)),
        (s +=
          t.substr(a, e - a) + hb(n ? r : +r[0], n ? 0 : +r[1], +r[2] || 1e-5)),
        (a = i + 1);
    return s + t.substr(a, t.length - a);
  }
  function rb(t, e, r) {
    var i,
      n,
      a,
      s = t.labels,
      o = U;
    for (i in s)
      (n = s[i] - e) < 0 == !!r &&
        n &&
        o > (n = Math.abs(n)) &&
        ((a = i), (o = n));
    return a;
  }
  function tb(t) {
    return (
      za(t),
      t.scrollTrigger && t.scrollTrigger.kill(!!L),
      t.progress() < 1 && Ct(t, "onInterrupt"),
      t
    );
  }
  function wb(t) {
    if (t)
      if (((t = (!t.name && t.default) || t), x() || t.headless)) {
        var e = t.name,
          r = s(t),
          i =
            e && !r && t.init
              ? function () {
                  this._props = [];
                }
              : t,
          n = {
            init: T,
            render: he,
            add: Wt,
            kill: ce,
            modifier: fe,
            rawVars: 0,
          },
          a = {
            targetTest: 0,
            get: 0,
            getSetter: ne,
            aliases: {},
            register: 0,
          };
        if ((Ft(), t !== i)) {
          if (pt[e]) return;
          qa(i, qa(ua(t, n), a)),
            yt(i.prototype, yt(n, ua(t, a))),
            (pt[(i.prop = e)] = i),
            t.targetTest && (gt.push(i), (ft[e] = 1)),
            (e =
              ("css" === e ? "CSS" : e.charAt(0).toUpperCase() + e.substr(1)) +
              "Plugin");
        }
        S(e, i), t.register && t.register(ze, i, _e);
      } else At.push(t);
  }
  function zb(t, e, r) {
    return (
      ((6 * (t += t < 0 ? 1 : 1 < t ? -1 : 0) < 1
        ? e + (r - e) * t * 6
        : t < 0.5
        ? r
        : 3 * t < 2
        ? e + (r - e) * (2 / 3 - t) * 6
        : e) *
        St +
        0.5) |
      0
    );
  }
  function Ab(e, r, i) {
    var n,
      a,
      s,
      o,
      u,
      h,
      l,
      f,
      d,
      c,
      p = e ? (t(e) ? [e >> 16, (e >> 8) & St, e & St] : 0) : zt.black;
    if (!p) {
      if (("," === e.substr(-1) && (e = e.substr(0, e.length - 1)), zt[e]))
        p = zt[e];
      else if ("#" === e.charAt(0)) {
        if (
          (e.length < 6 &&
            (e =
              "#" +
              (n = e.charAt(1)) +
              n +
              (a = e.charAt(2)) +
              a +
              (s = e.charAt(3)) +
              s +
              (5 === e.length ? e.charAt(4) + e.charAt(4) : "")),
          9 === e.length)
        )
          return [
            (p = parseInt(e.substr(1, 6), 16)) >> 16,
            (p >> 8) & St,
            p & St,
            parseInt(e.substr(7), 16) / 255,
          ];
        p = [(e = parseInt(e.substr(1), 16)) >> 16, (e >> 8) & St, e & St];
      } else if ("hsl" === e.substr(0, 3))
        if (((p = c = e.match(tt)), r)) {
          if (~e.indexOf("="))
            return (p = e.match(et)), i && p.length < 4 && (p[3] = 1), p;
        } else
          (o = (+p[0] % 360) / 360),
            (u = p[1] / 100),
            (n =
              2 * (h = p[2] / 100) -
              (a = h <= 0.5 ? h * (u + 1) : h + u - h * u)),
            3 < p.length && (p[3] *= 1),
            (p[0] = zb(o + 1 / 3, n, a)),
            (p[1] = zb(o, n, a)),
            (p[2] = zb(o - 1 / 3, n, a));
      else p = e.match(tt) || zt.transparent;
      p = p.map(Number);
    }
    return (
      r &&
        !c &&
        ((n = p[0] / St),
        (a = p[1] / St),
        (s = p[2] / St),
        (h = ((l = Math.max(n, a, s)) + (f = Math.min(n, a, s))) / 2),
        l === f
          ? (o = u = 0)
          : ((d = l - f),
            (u = 0.5 < h ? d / (2 - l - f) : d / (l + f)),
            (o =
              l === n
                ? (a - s) / d + (a < s ? 6 : 0)
                : l === a
                ? (s - n) / d + 2
                : (n - a) / d + 4),
            (o *= 60)),
        (p[0] = ~~(o + 0.5)),
        (p[1] = ~~(100 * u + 0.5)),
        (p[2] = ~~(100 * h + 0.5))),
      i && p.length < 4 && (p[3] = 1),
      p
    );
  }
  function Bb(t) {
    var r = [],
      i = [],
      n = -1;
    return (
      t.split(Et).forEach(function (t) {
        var e = t.match(rt) || [];
        r.push.apply(r, e), i.push((n += e.length + 1));
      }),
      (r.c = i),
      r
    );
  }
  function Cb(t, e, r) {
    var i,
      n,
      a,
      s,
      o = "",
      u = (t + o).match(Et),
      h = e ? "hsla(" : "rgba(",
      l = 0;
    if (!u) return t;
    if (
      ((u = u.map(function (t) {
        return (
          (t = Ab(t, e, 1)) &&
          h +
            (e ? t[0] + "," + t[1] + "%," + t[2] + "%," + t[3] : t.join(",")) +
            ")"
        );
      })),
      r && ((a = Bb(t)), (i = r.c).join(o) !== a.c.join(o)))
    )
      for (s = (n = t.replace(Et, "1").split(rt)).length - 1; l < s; l++)
        o +=
          n[l] +
          (~i.indexOf(l)
            ? u.shift() || h + "0,0,0,0)"
            : (a.length ? a : u.length ? u : r).shift());
    if (!n) for (s = (n = t.split(Et)).length - 1; l < s; l++) o += n[l] + u[l];
    return o + n[s];
  }
  function Fb(t) {
    var e,
      r = t.join(" ");
    if (((Et.lastIndex = 0), Et.test(r)))
      return (
        (e = Dt.test(r)),
        (t[1] = Cb(t[1], e)),
        (t[0] = Cb(t[0], e, Bb(t[1]))),
        !0
      );
  }
  function Ob(t) {
    var e = (t + "").split("("),
      r = Lt[e[0]];
    return r && 1 < e.length && r.config
      ? r.config.apply(
          null,
          ~t.indexOf("{")
            ? [
                (function _parseObjectInString(t) {
                  for (
                    var e,
                      r,
                      i,
                      n = {},
                      a = t.substr(1, t.length - 3).split(":"),
                      s = a[0],
                      o = 1,
                      u = a.length;
                    o < u;
                    o++
                  )
                    (r = a[o]),
                      (e = o !== u - 1 ? r.lastIndexOf(",") : r.length),
                      (i = r.substr(0, e)),
                      (n[s] = isNaN(i) ? i.replace(Yt, "").trim() : +i),
                      (s = r.substr(e + 1).trim());
                  return n;
                })(e[1]),
              ]
            : (function _valueInParentheses(t) {
                var e = t.indexOf("(") + 1,
                  r = t.indexOf(")"),
                  i = t.indexOf("(", e);
                return t.substring(e, ~i && i < r ? t.indexOf(")", r + 1) : r);
              })(t)
                .split(",")
                .map(oa)
        )
      : Lt._CE && It.test(t)
      ? Lt._CE("", t)
      : r;
  }
  function Qb(t, e) {
    for (var r, i = t._first; i; )
      i instanceof Xt
        ? Qb(i, e)
        : !i.vars.yoyoEase ||
          (i._yoyo && i._repeat) ||
          i._yoyo === e ||
          (i.timeline
            ? Qb(i.timeline, e)
            : ((r = i._ease),
              (i._ease = i._yEase),
              (i._yEase = r),
              (i._yoyo = e))),
        (i = i._next);
  }
  function Sb(t, e, r, i) {
    void 0 === r &&
      (r = function easeOut(t) {
        return 1 - e(1 - t);
      }),
      void 0 === i &&
        (i = function easeInOut(t) {
          return t < 0.5 ? e(2 * t) / 2 : 1 - e(2 * (1 - t)) / 2;
        });
    var n,
      a = { easeIn: e, easeOut: r, easeInOut: i };
    return (
      ha(t, function (t) {
        for (var e in ((Lt[t] = ot[t] = a), (Lt[(n = t.toLowerCase())] = r), a))
          Lt[
            n + ("easeIn" === e ? ".in" : "easeOut" === e ? ".out" : ".inOut")
          ] = Lt[t + "." + e] = a[e];
      }),
      a
    );
  }
  function Tb(e) {
    return function (t) {
      return t < 0.5 ? (1 - e(1 - 2 * t)) / 2 : 0.5 + e(2 * (t - 0.5)) / 2;
    };
  }
  function Ub(r, t, e) {
    function Jm(t) {
      return 1 === t ? 1 : i * Math.pow(2, -10 * t) * H((t - a) * n) + 1;
    }
    var i = 1 <= t ? t : 1,
      n = (e || (r ? 0.3 : 0.45)) / (t < 1 ? t : 1),
      a = (n / N) * (Math.asin(1 / i) || 0),
      s =
        "out" === r
          ? Jm
          : "in" === r
          ? function (t) {
              return 1 - Jm(1 - t);
            }
          : Tb(Jm);
    return (
      (n = N / n),
      (s.config = function (t, e) {
        return Ub(r, t, e);
      }),
      s
    );
  }
  function Vb(e, r) {
    function Rm(t) {
      return t ? --t * t * ((r + 1) * t + r) + 1 : 0;
    }
    void 0 === r && (r = 1.70158);
    var t =
      "out" === e
        ? Rm
        : "in" === e
        ? function (t) {
            return 1 - Rm(1 - t);
          }
        : Tb(Rm);
    return (
      (t.config = function (t) {
        return Vb(e, t);
      }),
      t
    );
  }
  var F,
    L,
    l,
    I,
    h,
    n,
    a,
    i,
    o,
    f,
    d,
    c,
    p,
    _,
    m,
    g,
    b,
    k,
    O,
    M,
    C,
    A,
    z,
    E,
    D,
    Y,
    B,
    j,
    q = {
      autoSleep: 120,
      force3D: "auto",
      nullTargetWarn: 1,
      units: { lineHeight: "" },
    },
    V = { duration: 0.5, overwrite: !1, delay: 0 },
    U = 1e8,
    X = 1 / U,
    N = 2 * Math.PI,
    G = N / 4,
    W = 0,
    K = Math.sqrt,
    J = Math.cos,
    H = Math.sin,
    $ =
      ("function" == typeof ArrayBuffer && ArrayBuffer.isView) ||
      function () {},
    Z = Array.isArray,
    tt = /(?:-?\.?\d|\.)+/gi,
    et = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
    rt = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
    it = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
    nt = /[+-]=-?[.\d]+/,
    at = /[^,'"\[\]\s]+/gi,
    st = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,
    ot = {},
    ut = { suppressEvents: !0, isStart: !0, kill: !1 },
    ht = { suppressEvents: !0, kill: !1 },
    lt = { suppressEvents: !0 },
    ft = {},
    dt = [],
    ct = {},
    pt = {},
    _t = {},
    mt = 30,
    gt = [],
    vt = "",
    yt = function _merge(t, e) {
      for (var r in e) t[r] = e[r];
      return t;
    },
    Tt = function _animationCycle(t, e) {
      var r = Math.floor((t = ja(t / e)));
      return t && r === t ? r - 1 : r;
    },
    bt = function _isFromOrFromStart(t) {
      var e = t.data;
      return "isFromStart" === e || "isStart" === e;
    },
    wt = { _start: 0, endTime: T, totalDuration: T },
    xt = function _parsePosition(t, e, i) {
      var n,
        a,
        s,
        o = t.labels,
        u = t._recent || wt,
        h = t.duration() >= U ? u.endTime(!1) : t._dur;
      return r(e) && (isNaN(e) || e in o)
        ? ((a = e.charAt(0)),
          (s = "%" === e.substr(-1)),
          (n = e.indexOf("=")),
          "<" === a || ">" === a
            ? (0 <= n && (e = e.replace(/=/, "")),
              ("<" === a ? u._start : u.endTime(0 <= u._repeat)) +
                (parseFloat(e.substr(1)) || 0) *
                  (s ? (n < 0 ? u : i).totalDuration() / 100 : 1))
            : n < 0
            ? (e in o || (o[e] = h), o[e])
            : ((a = parseFloat(e.charAt(n - 1) + e.substr(n + 1))),
              s && i && (a = (a / 100) * (Z(i) ? i[0] : i).totalDuration()),
              1 < n ? _parsePosition(t, e.substr(0, n - 1), i) + a : h + a))
        : null == e
        ? h
        : +e;
    },
    kt = function _clamp(t, e, r) {
      return r < t ? t : e < r ? e : r;
    },
    Ot = [].slice,
    Mt = function toArray(t, e, i) {
      return l && !e && l.selector
        ? l.selector(t)
        : !r(t) || i || (!n && Ft())
        ? Z(t)
          ? (function _flatten(t, e, i) {
              return (
                void 0 === i && (i = []),
                t.forEach(function (t) {
                  return (r(t) && !e) || _a(t, 1)
                    ? i.push.apply(i, Mt(t))
                    : i.push(t);
                }) || i
              );
            })(t, i)
          : _a(t)
          ? Ot.call(t, 0)
          : t
          ? [t]
          : []
        : Ot.call((e || a).querySelectorAll(t), 0);
    },
    Pt = function mapRange(e, t, r, i, n) {
      var a = t - e,
        s = i - r;
      return Wa(n, function (t) {
        return r + (((t - e) / a) * s || 0);
      });
    },
    Ct = function _callback(t, e, r) {
      var i,
        n,
        a,
        s = t.vars,
        o = s[e],
        u = l,
        h = t._ctx;
      if (o)
        return (
          (i = s[e + "Params"]),
          (n = s.callbackScope || t),
          r && dt.length && ma(),
          h && (l = h),
          (a = i ? o.apply(n, i) : o.call(n)),
          (l = u),
          a
        );
    },
    At = [],
    St = 255,
    zt = {
      aqua: [0, St, St],
      lime: [0, St, 0],
      silver: [192, 192, 192],
      black: [0, 0, 0],
      maroon: [128, 0, 0],
      teal: [0, 128, 128],
      blue: [0, 0, St],
      navy: [0, 0, 128],
      white: [St, St, St],
      olive: [128, 128, 0],
      yellow: [St, St, 0],
      orange: [St, 165, 0],
      gray: [128, 128, 128],
      purple: [128, 0, 128],
      green: [0, 128, 0],
      red: [St, 0, 0],
      pink: [St, 192, 203],
      cyan: [0, St, St],
      transparent: [St, St, St, 0],
    },
    Et = (function () {
      var t,
        e =
          "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b";
      for (t in zt) e += "|" + t + "\\b";
      return new RegExp(e + ")", "gi");
    })(),
    Dt = /hsl[a]?\(/,
    Rt =
      ((O = Date.now),
      (M = 500),
      (C = 33),
      (A = O()),
      (z = A),
      (D = E = 1e3 / 240),
      (g = {
        time: 0,
        frame: 0,
        tick: function tick() {
          yl(!0);
        },
        deltaRatio: function deltaRatio(t) {
          return b / (1e3 / (t || 60));
        },
        wake: function wake() {
          o &&
            (!n &&
              x() &&
              ((h = n = window),
              (a = h.document || {}),
              (ot.gsap = ze),
              (h.gsapVersions || (h.gsapVersions = [])).push(ze.version),
              P(i || h.GreenSockGlobals || (!h.gsap && h) || {}),
              At.forEach(wb)),
            (m =
              "undefined" != typeof requestAnimationFrame &&
              requestAnimationFrame),
            p && g.sleep(),
            (_ =
              m ||
              function (t) {
                return setTimeout(t, (D - 1e3 * g.time + 1) | 0);
              }),
            (c = 1),
            yl(2));
        },
        sleep: function sleep() {
          (m ? cancelAnimationFrame : clearTimeout)(p), (c = 0), (_ = T);
        },
        lagSmoothing: function lagSmoothing(t, e) {
          (M = t || 1 / 0), (C = Math.min(e || 33, M));
        },
        fps: function fps(t) {
          (E = 1e3 / (t || 240)), (D = 1e3 * g.time + E);
        },
        add: function add(n, t, e) {
          var a = t
            ? function (t, e, r, i) {
                n(t, e, r, i), g.remove(a);
              }
            : n;
          return g.remove(n), Y[e ? "unshift" : "push"](a), Ft(), a;
        },
        remove: function remove(t, e) {
          ~(e = Y.indexOf(t)) && Y.splice(e, 1) && e <= k && k--;
        },
        _listeners: (Y = []),
      })),
    Ft = function _wake() {
      return !c && Rt.wake();
    },
    Lt = {},
    It = /^[\d.\-M][\d.\-,\s]/,
    Yt = /["']/g,
    Bt = function _invertEase(e) {
      return function (t) {
        return 1 - e(1 - t);
      };
    },
    jt = function _parseEase(t, e) {
      return (t && (s(t) ? t : Lt[t] || Ob(t))) || e;
    };
  function yl(t) {
    var e,
      r,
      i,
      n,
      a = O() - z,
      s = !0 === t;
    if (
      ((M < a || a < 0) && (A += a - C),
      (0 < (e = (i = (z += a) - A) - D) || s) &&
        ((n = ++g.frame),
        (b = i - 1e3 * g.time),
        (g.time = i /= 1e3),
        (D += e + (E <= e ? 4 : E - e)),
        (r = 1)),
      s || (p = _(yl)),
      r)
    )
      for (k = 0; k < Y.length; k++) Y[k](i, b, n, t);
  }
  function gn(t) {
    return t < j
      ? B * t * t
      : t < 0.7272727272727273
      ? B * Math.pow(t - 1.5 / 2.75, 2) + 0.75
      : t < 0.9090909090909092
      ? B * (t -= 2.25 / 2.75) * t + 0.9375
      : B * Math.pow(t - 2.625 / 2.75, 2) + 0.984375;
  }
  ha("Linear,Quad,Cubic,Quart,Quint,Strong", function (t, e) {
    var r = e < 5 ? e + 1 : e;
    Sb(
      t + ",Power" + (r - 1),
      e
        ? function (t) {
            return Math.pow(t, r);
          }
        : function (t) {
            return t;
          },
      function (t) {
        return 1 - Math.pow(1 - t, r);
      },
      function (t) {
        return t < 0.5
          ? Math.pow(2 * t, r) / 2
          : 1 - Math.pow(2 * (1 - t), r) / 2;
      }
    );
  }),
    (Lt.Linear.easeNone = Lt.none = Lt.Linear.easeIn),
    Sb("Elastic", Ub("in"), Ub("out"), Ub()),
    (B = 7.5625),
    (j = 1 / 2.75),
    Sb(
      "Bounce",
      function (t) {
        return 1 - gn(1 - t);
      },
      gn
    ),
    Sb("Expo", function (t) {
      return Math.pow(2, 10 * (t - 1)) * t + t * t * t * t * t * t * (1 - t);
    }),
    Sb("Circ", function (t) {
      return -(K(1 - t * t) - 1);
    }),
    Sb("Sine", function (t) {
      return 1 === t ? 1 : 1 - J(t * G);
    }),
    Sb("Back", Vb("in"), Vb("out"), Vb()),
    (Lt.SteppedEase =
      Lt.steps =
      ot.SteppedEase =
        {
          config: function config(t, e) {
            void 0 === t && (t = 1);
            var r = 1 / t,
              i = t + (e ? 0 : 1),
              n = e ? 1 : 0;
            return function (t) {
              return (((i * kt(0, 0.99999999, t)) | 0) + n) * r;
            };
          },
        }),
    (V.ease = Lt["quad.out"]),
    ha(
      "onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",
      function (t) {
        return (vt += t + "," + t + "Params,");
      }
    );
  var qt,
    Vt = function GSCache(t, e) {
      (this.id = W++),
        ((t._gsap = this).target = t),
        (this.harness = e),
        (this.get = e ? e.get : ga),
        (this.set = e ? e.getSetter : ne);
    },
    Ut =
      (((qt = Animation.prototype).delay = function delay(t) {
        return t || 0 === t
          ? (this.parent &&
              this.parent.smoothChildTiming &&
              this.startTime(this._start + t - this._delay),
            (this._delay = t),
            this)
          : this._delay;
      }),
      (qt.duration = function duration(t) {
        return arguments.length
          ? this.totalDuration(
              0 < this._repeat ? t + (t + this._rDelay) * this._repeat : t
            )
          : this.totalDuration() && this._dur;
      }),
      (qt.totalDuration = function totalDuration(t) {
        return arguments.length
          ? ((this._dirty = 0),
            Ra(
              this,
              this._repeat < 0
                ? t
                : (t - this._repeat * this._rDelay) / (this._repeat + 1)
            ))
          : this._tDur;
      }),
      (qt.totalTime = function totalTime(t, e) {
        if ((Ft(), !arguments.length)) return this._tTime;
        var r = this._dp;
        if (r && r.smoothChildTiming && this._ts) {
          for (Ia(this, t), !r._dp || r.parent || Ja(r, this); r && r.parent; )
            r.parent._time !==
              r._start +
                (0 <= r._ts
                  ? r._tTime / r._ts
                  : (r.totalDuration() - r._tTime) / -r._ts) &&
              r.totalTime(r._tTime, !0),
              (r = r.parent);
          !this.parent &&
            this._dp.autoRemoveChildren &&
            ((0 < this._ts && t < this._tDur) ||
              (this._ts < 0 && 0 < t) ||
              (!this._tDur && !t)) &&
            Ka(this._dp, this, this._start - this._delay);
        }
        return (
          (this._tTime !== t ||
            (!this._dur && !e) ||
            (this._initted && Math.abs(this._zTime) === X) ||
            (!t && !this._initted && (this.add || this._ptLookup))) &&
            (this._ts || (this._pTime = t), na(this, t, e)),
          this
        );
      }),
      (qt.time = function time(t, e) {
        return arguments.length
          ? this.totalTime(
              Math.min(this.totalDuration(), t + Ea(this)) %
                (this._dur + this._rDelay) || (t ? this._dur : 0),
              e
            )
          : this._time;
      }),
      (qt.totalProgress = function totalProgress(t, e) {
        return arguments.length
          ? this.totalTime(this.totalDuration() * t, e)
          : this.totalDuration()
          ? Math.min(1, this._tTime / this._tDur)
          : 0 <= this.rawTime() && this._initted
          ? 1
          : 0;
      }),
      (qt.progress = function progress(t, e) {
        return arguments.length
          ? this.totalTime(
              this.duration() *
                (!this._yoyo || 1 & this.iteration() ? t : 1 - t) +
                Ea(this),
              e
            )
          : this.duration()
          ? Math.min(1, this._time / this._dur)
          : 0 < this.rawTime()
          ? 1
          : 0;
      }),
      (qt.iteration = function iteration(t, e) {
        var r = this.duration() + this._rDelay;
        return arguments.length
          ? this.totalTime(this._time + (t - 1) * r, e)
          : this._repeat
          ? Tt(this._tTime, r) + 1
          : 1;
      }),
      (qt.timeScale = function timeScale(t, e) {
        if (!arguments.length) return this._rts === -X ? 0 : this._rts;
        if (this._rts === t) return this;
        var r =
          this.parent && this._ts ? Ga(this.parent._time, this) : this._tTime;
        return (
          (this._rts = +t || 0),
          (this._ts = this._ps || t === -X ? 0 : this._rts),
          this.totalTime(kt(-Math.abs(this._delay), this._tDur, r), !1 !== e),
          Ha(this),
          (function _recacheAncestors(t) {
            for (var e = t.parent; e && e.parent; )
              (e._dirty = 1), e.totalDuration(), (e = e.parent);
            return t;
          })(this)
        );
      }),
      (qt.paused = function paused(t) {
        return arguments.length
          ? (this._ps !== t &&
              ((this._ps = t)
                ? ((this._pTime =
                    this._tTime || Math.max(-this._delay, this.rawTime())),
                  (this._ts = this._act = 0))
                : (Ft(),
                  (this._ts = this._rts),
                  this.totalTime(
                    this.parent && !this.parent.smoothChildTiming
                      ? this.rawTime()
                      : this._tTime || this._pTime,
                    1 === this.progress() &&
                      Math.abs(this._zTime) !== X &&
                      (this._tTime -= X)
                  ))),
            this)
          : this._ps;
      }),
      (qt.startTime = function startTime(t) {
        if (arguments.length) {
          this._start = t;
          var e = this.parent || this._dp;
          return (
            !e || (!e._sort && this.parent) || Ka(e, this, t - this._delay),
            this
          );
        }
        return this._start;
      }),
      (qt.endTime = function endTime(t) {
        return (
          this._start +
          (w(t) ? this.totalDuration() : this.duration()) /
            Math.abs(this._ts || 1)
        );
      }),
      (qt.rawTime = function rawTime(t) {
        var e = this.parent || this._dp;
        return e
          ? t &&
            (!this._ts ||
              (this._repeat && this._time && this.totalProgress() < 1))
            ? this._tTime % (this._dur + this._rDelay)
            : this._ts
            ? Ga(e.rawTime(t), this)
            : this._tTime
          : this._tTime;
      }),
      (qt.revert = function revert(t) {
        void 0 === t && (t = lt);
        var e = L;
        return (
          (L = t),
          (this._initted || this._startAt) &&
            (this.timeline && this.timeline.revert(t),
            this.totalTime(-0.01, t.suppressEvents)),
          "nested" !== this.data && !1 !== t.kill && this.kill(),
          (L = e),
          this
        );
      }),
      (qt.globalTime = function globalTime(t) {
        for (var e = this, r = arguments.length ? t : e.rawTime(); e; )
          (r = e._start + r / (Math.abs(e._ts) || 1)), (e = e._dp);
        return !this.parent && this._sat ? this._sat.globalTime(t) : r;
      }),
      (qt.repeat = function repeat(t) {
        return arguments.length
          ? ((this._repeat = t === 1 / 0 ? -2 : t), Sa(this))
          : -2 === this._repeat
          ? 1 / 0
          : this._repeat;
      }),
      (qt.repeatDelay = function repeatDelay(t) {
        if (arguments.length) {
          var e = this._time;
          return (this._rDelay = t), Sa(this), e ? this.time(e) : this;
        }
        return this._rDelay;
      }),
      (qt.yoyo = function yoyo(t) {
        return arguments.length ? ((this._yoyo = t), this) : this._yoyo;
      }),
      (qt.seek = function seek(t, e) {
        return this.totalTime(xt(this, t), w(e));
      }),
      (qt.restart = function restart(t, e) {
        return (
          this.play().totalTime(t ? -this._delay : 0, w(e)),
          this._dur || (this._zTime = -X),
          this
        );
      }),
      (qt.play = function play(t, e) {
        return null != t && this.seek(t, e), this.reversed(!1).paused(!1);
      }),
      (qt.reverse = function reverse(t, e) {
        return (
          null != t && this.seek(t || this.totalDuration(), e),
          this.reversed(!0).paused(!1)
        );
      }),
      (qt.pause = function pause(t, e) {
        return null != t && this.seek(t, e), this.paused(!0);
      }),
      (qt.resume = function resume() {
        return this.paused(!1);
      }),
      (qt.reversed = function reversed(t) {
        return arguments.length
          ? (!!t !== this.reversed() &&
              this.timeScale(-this._rts || (t ? -X : 0)),
            this)
          : this._rts < 0;
      }),
      (qt.invalidate = function invalidate() {
        return (this._initted = this._act = 0), (this._zTime = -X), this;
      }),
      (qt.isActive = function isActive() {
        var t,
          e = this.parent || this._dp,
          r = this._start;
        return !(
          e &&
          !(
            this._ts &&
            this._initted &&
            e.isActive() &&
            (t = e.rawTime(!0)) >= r &&
            t < this.endTime(!0) - X
          )
        );
      }),
      (qt.eventCallback = function eventCallback(t, e, r) {
        var i = this.vars;
        return 1 < arguments.length
          ? (e
              ? ((i[t] = e),
                r && (i[t + "Params"] = r),
                "onUpdate" === t && (this._onUpdate = e))
              : delete i[t],
            this)
          : i[t];
      }),
      (qt.then = function then(t) {
        var i = this;
        return new Promise(function (e) {
          function Co() {
            var t = i.then;
            (i.then = null),
              s(r) && (r = r(i)) && (r.then || r === i) && (i.then = t),
              e(r),
              (i.then = t);
          }
          var r = s(t) ? t : pa;
          (i._initted && 1 === i.totalProgress() && 0 <= i._ts) ||
          (!i._tTime && i._ts < 0)
            ? Co()
            : (i._prom = Co);
        });
      }),
      (qt.kill = function kill() {
        tb(this);
      }),
      Animation);
  function Animation(t) {
    (this.vars = t),
      (this._delay = +t.delay || 0),
      (this._repeat = t.repeat === 1 / 0 ? -2 : t.repeat || 0) &&
        ((this._rDelay = t.repeatDelay || 0),
        (this._yoyo = !!t.yoyo || !!t.yoyoEase)),
      (this._ts = 1),
      Ra(this, +t.duration, 1, 1),
      (this.data = t.data),
      l && (this._ctx = l).data.push(this),
      c || Rt.wake();
  }
  qa(Ut.prototype, {
    _time: 0,
    _start: 0,
    _end: 0,
    _tTime: 0,
    _tDur: 0,
    _dirty: 0,
    _repeat: 0,
    _yoyo: !1,
    parent: null,
    _initted: !1,
    _rDelay: 0,
    _ts: 1,
    _dp: 0,
    ratio: 0,
    _zTime: -X,
    _prom: 0,
    _ps: !1,
    _rts: 1,
  });
  var Xt = (function (i) {
    function Timeline(t, e) {
      var r;
      return (
        void 0 === t && (t = {}),
        ((r = i.call(this, t) || this).labels = {}),
        (r.smoothChildTiming = !!t.smoothChildTiming),
        (r.autoRemoveChildren = !!t.autoRemoveChildren),
        (r._sort = w(t.sortChildren)),
        I && Ka(t.parent || I, _assertThisInitialized(r), e),
        t.reversed && r.reverse(),
        t.paused && r.paused(!0),
        t.scrollTrigger && La(_assertThisInitialized(r), t.scrollTrigger),
        r
      );
    }
    _inheritsLoose(Timeline, i);
    var e = Timeline.prototype;
    return (
      (e.to = function to(t, e, r) {
        return Va(0, arguments, this), this;
      }),
      (e.from = function from(t, e, r) {
        return Va(1, arguments, this), this;
      }),
      (e.fromTo = function fromTo(t, e, r, i) {
        return Va(2, arguments, this), this;
      }),
      (e.set = function set(t, e, r) {
        return (
          (e.duration = 0),
          (e.parent = this),
          va(e).repeatDelay || (e.repeat = 0),
          (e.immediateRender = !!e.immediateRender),
          new $t(t, e, xt(this, r), 1),
          this
        );
      }),
      (e.call = function call(t, e, r) {
        return Ka(this, $t.delayedCall(0, t, e), r);
      }),
      (e.staggerTo = function staggerTo(t, e, r, i, n, a, s) {
        return (
          (r.duration = e),
          (r.stagger = r.stagger || i),
          (r.onComplete = a),
          (r.onCompleteParams = s),
          (r.parent = this),
          new $t(t, r, xt(this, n)),
          this
        );
      }),
      (e.staggerFrom = function staggerFrom(t, e, r, i, n, a, s) {
        return (
          (r.runBackwards = 1),
          (va(r).immediateRender = w(r.immediateRender)),
          this.staggerTo(t, e, r, i, n, a, s)
        );
      }),
      (e.staggerFromTo = function staggerFromTo(t, e, r, i, n, a, s, o) {
        return (
          (i.startAt = r),
          (va(i).immediateRender = w(i.immediateRender)),
          this.staggerTo(t, e, i, n, a, s, o)
        );
      }),
      (e.render = function render(t, e, r) {
        var i,
          n,
          a,
          s,
          o,
          u,
          h,
          l,
          f,
          d,
          c,
          p,
          _ = this._time,
          m = this._dirty ? this.totalDuration() : this._tDur,
          g = this._dur,
          v = t <= 0 ? 0 : ja(t),
          y = this._zTime < 0 != t < 0 && (this._initted || !g);
        if (
          (this !== I && m < v && 0 <= t && (v = m),
          v !== this._tTime || r || y)
        ) {
          if (
            (_ !== this._time &&
              g &&
              ((v += this._time - _), (t += this._time - _)),
            (i = v),
            (f = this._start),
            (u = !(l = this._ts)),
            y && (g || (_ = this._zTime), (!t && e) || (this._zTime = t)),
            this._repeat)
          ) {
            if (
              ((c = this._yoyo),
              (o = g + this._rDelay),
              this._repeat < -1 && t < 0)
            )
              return this.totalTime(100 * o + t, e, r);
            if (
              ((i = ja(v % o)),
              v === m
                ? ((s = this._repeat), (i = g))
                : ((s = ~~(d = ja(v / o))) && s === d && ((i = g), s--),
                  g < i && (i = g)),
              (d = Tt(this._tTime, o)),
              !_ &&
                this._tTime &&
                d !== s &&
                this._tTime - d * o - this._dur <= 0 &&
                (d = s),
              c && 1 & s && ((i = g - i), (p = 1)),
              s !== d && !this._lock)
            ) {
              var T = c && 1 & d,
                b = T === (c && 1 & s);
              if (
                (s < d && (T = !T),
                (_ = T ? 0 : v % g ? g : v),
                (this._lock = 1),
                (this.render(_ || (p ? 0 : ja(s * o)), e, !g)._lock = 0),
                (this._tTime = v),
                !e && this.parent && Ct(this, "onRepeat"),
                this.vars.repeatRefresh && !p && (this.invalidate()._lock = 1),
                (_ && _ !== this._time) ||
                  u != !this._ts ||
                  (this.vars.onRepeat && !this.parent && !this._act))
              )
                return this;
              if (
                ((g = this._dur),
                (m = this._tDur),
                b &&
                  ((this._lock = 2),
                  (_ = T ? g : -1e-4),
                  this.render(_, !0),
                  this.vars.repeatRefresh && !p && this.invalidate()),
                (this._lock = 0),
                !this._ts && !u)
              )
                return this;
              Qb(this, p);
            }
          }
          if (
            (this._hasPause &&
              !this._forcing &&
              this._lock < 2 &&
              (h = (function _findNextPauseTween(t, e, r) {
                var i;
                if (e < r)
                  for (i = t._first; i && i._start <= r; ) {
                    if ("isPause" === i.data && i._start > e) return i;
                    i = i._next;
                  }
                else
                  for (i = t._last; i && i._start >= r; ) {
                    if ("isPause" === i.data && i._start < e) return i;
                    i = i._prev;
                  }
              })(this, ja(_), ja(i))) &&
              (v -= i - (i = h._start)),
            (this._tTime = v),
            (this._time = i),
            (this._act = !l),
            this._initted ||
              ((this._onUpdate = this.vars.onUpdate),
              (this._initted = 1),
              (this._zTime = t),
              (_ = 0)),
            !_ && i && !e && !s && (Ct(this, "onStart"), this._tTime !== v))
          )
            return this;
          if (_ <= i && 0 <= t)
            for (n = this._first; n; ) {
              if (
                ((a = n._next), (n._act || i >= n._start) && n._ts && h !== n)
              ) {
                if (n.parent !== this) return this.render(t, e, r);
                if (
                  (n.render(
                    0 < n._ts
                      ? (i - n._start) * n._ts
                      : (n._dirty ? n.totalDuration() : n._tDur) +
                          (i - n._start) * n._ts,
                    e,
                    r
                  ),
                  i !== this._time || (!this._ts && !u))
                ) {
                  (h = 0), a && (v += this._zTime = -X);
                  break;
                }
              }
              n = a;
            }
          else {
            n = this._last;
            for (var w = t < 0 ? t : i; n; ) {
              if (
                ((a = n._prev), (n._act || w <= n._end) && n._ts && h !== n)
              ) {
                if (n.parent !== this) return this.render(t, e, r);
                if (
                  (n.render(
                    0 < n._ts
                      ? (w - n._start) * n._ts
                      : (n._dirty ? n.totalDuration() : n._tDur) +
                          (w - n._start) * n._ts,
                    e,
                    r || (L && (n._initted || n._startAt))
                  ),
                  i !== this._time || (!this._ts && !u))
                ) {
                  (h = 0), a && (v += this._zTime = w ? -X : X);
                  break;
                }
              }
              n = a;
            }
          }
          if (
            h &&
            !e &&
            (this.pause(),
            (h.render(_ <= i ? 0 : -X)._zTime = _ <= i ? 1 : -1),
            this._ts)
          )
            return (this._start = f), Ha(this), this.render(t, e, r);
          this._onUpdate && !e && Ct(this, "onUpdate", !0),
            ((v === m && this._tTime >= this.totalDuration()) || (!v && _)) &&
              ((f !== this._start && Math.abs(l) === Math.abs(this._ts)) ||
                this._lock ||
                ((!t && g) ||
                  !((v === m && 0 < this._ts) || (!v && this._ts < 0)) ||
                  za(this, 1),
                e ||
                  (t < 0 && !_) ||
                  (!v && !_ && m) ||
                  (Ct(
                    this,
                    v === m && 0 <= t ? "onComplete" : "onReverseComplete",
                    !0
                  ),
                  !this._prom ||
                    (v < m && 0 < this.timeScale()) ||
                    this._prom())));
        }
        return this;
      }),
      (e.add = function add(e, i) {
        var n = this;
        if ((t(i) || (i = xt(this, i, e)), !(e instanceof Ut))) {
          if (Z(e))
            return (
              e.forEach(function (t) {
                return n.add(t, i);
              }),
              this
            );
          if (r(e)) return this.addLabel(e, i);
          if (!s(e)) return this;
          e = $t.delayedCall(0, e);
        }
        return this !== e ? Ka(this, e, i) : this;
      }),
      (e.getChildren = function getChildren(t, e, r, i) {
        void 0 === t && (t = !0),
          void 0 === e && (e = !0),
          void 0 === r && (r = !0),
          void 0 === i && (i = -U);
        for (var n = [], a = this._first; a; )
          a._start >= i &&
            (a instanceof $t
              ? e && n.push(a)
              : (r && n.push(a),
                t && n.push.apply(n, a.getChildren(!0, e, r)))),
            (a = a._next);
        return n;
      }),
      (e.getById = function getById(t) {
        for (var e = this.getChildren(1, 1, 1), r = e.length; r--; )
          if (e[r].vars.id === t) return e[r];
      }),
      (e.remove = function remove(t) {
        return r(t)
          ? this.removeLabel(t)
          : s(t)
          ? this.killTweensOf(t)
          : (t.parent === this && ya(this, t),
            t === this._recent && (this._recent = this._last),
            Aa(this));
      }),
      (e.totalTime = function totalTime(t, e) {
        return arguments.length
          ? ((this._forcing = 1),
            !this._dp &&
              this._ts &&
              (this._start = ja(
                Rt.time -
                  (0 < this._ts
                    ? t / this._ts
                    : (this.totalDuration() - t) / -this._ts)
              )),
            i.prototype.totalTime.call(this, t, e),
            (this._forcing = 0),
            this)
          : this._tTime;
      }),
      (e.addLabel = function addLabel(t, e) {
        return (this.labels[t] = xt(this, e)), this;
      }),
      (e.removeLabel = function removeLabel(t) {
        return delete this.labels[t], this;
      }),
      (e.addPause = function addPause(t, e, r) {
        var i = $t.delayedCall(0, e || T, r);
        return (
          (i.data = "isPause"), (this._hasPause = 1), Ka(this, i, xt(this, t))
        );
      }),
      (e.removePause = function removePause(t) {
        var e = this._first;
        for (t = xt(this, t); e; )
          e._start === t && "isPause" === e.data && za(e), (e = e._next);
      }),
      (e.killTweensOf = function killTweensOf(t, e, r) {
        for (var i = this.getTweensOf(t, r), n = i.length; n--; )
          Nt !== i[n] && i[n].kill(t, e);
        return this;
      }),
      (e.getTweensOf = function getTweensOf(e, r) {
        for (var i, n = [], a = Mt(e), s = this._first, o = t(r); s; )
          s instanceof $t
            ? la(s._targets, a) &&
              (o
                ? (!Nt || (s._initted && s._ts)) &&
                  s.globalTime(0) <= r &&
                  s.globalTime(s.totalDuration()) > r
                : !r || s.isActive()) &&
              n.push(s)
            : (i = s.getTweensOf(a, r)).length && n.push.apply(n, i),
            (s = s._next);
        return n;
      }),
      (e.tweenTo = function tweenTo(t, e) {
        e = e || {};
        var r,
          i = this,
          n = xt(i, t),
          a = e.startAt,
          s = e.onStart,
          o = e.onStartParams,
          u = e.immediateRender,
          h = $t.to(
            i,
            qa(
              {
                ease: e.ease || "none",
                lazy: !1,
                immediateRender: !1,
                time: n,
                overwrite: "auto",
                duration:
                  e.duration ||
                  Math.abs(
                    (n - (a && "time" in a ? a.time : i._time)) / i.timeScale()
                  ) ||
                  X,
                onStart: function onStart() {
                  if ((i.pause(), !r)) {
                    var t =
                      e.duration ||
                      Math.abs(
                        (n - (a && "time" in a ? a.time : i._time)) /
                          i.timeScale()
                      );
                    h._dur !== t && Ra(h, t, 0, 1).render(h._time, !0, !0),
                      (r = 1);
                  }
                  s && s.apply(h, o || []);
                },
              },
              e
            )
          );
        return u ? h.render(0) : h;
      }),
      (e.tweenFromTo = function tweenFromTo(t, e, r) {
        return this.tweenTo(e, qa({ startAt: { time: xt(this, t) } }, r));
      }),
      (e.recent = function recent() {
        return this._recent;
      }),
      (e.nextLabel = function nextLabel(t) {
        return void 0 === t && (t = this._time), rb(this, xt(this, t));
      }),
      (e.previousLabel = function previousLabel(t) {
        return void 0 === t && (t = this._time), rb(this, xt(this, t), 1);
      }),
      (e.currentLabel = function currentLabel(t) {
        return arguments.length
          ? this.seek(t, !0)
          : this.previousLabel(this._time + X);
      }),
      (e.shiftChildren = function shiftChildren(t, e, r) {
        void 0 === r && (r = 0);
        for (var i, n = this._first, a = this.labels; n; )
          n._start >= r && ((n._start += t), (n._end += t)), (n = n._next);
        if (e) for (i in a) a[i] >= r && (a[i] += t);
        return Aa(this);
      }),
      (e.invalidate = function invalidate(t) {
        var e = this._first;
        for (this._lock = 0; e; ) e.invalidate(t), (e = e._next);
        return i.prototype.invalidate.call(this, t);
      }),
      (e.clear = function clear(t) {
        void 0 === t && (t = !0);
        for (var e, r = this._first; r; )
          (e = r._next), this.remove(r), (r = e);
        return (
          this._dp && (this._time = this._tTime = this._pTime = 0),
          t && (this.labels = {}),
          Aa(this)
        );
      }),
      (e.totalDuration = function totalDuration(t) {
        var e,
          r,
          i,
          n = 0,
          a = this,
          s = a._last,
          o = U;
        if (arguments.length)
          return a.timeScale(
            (a._repeat < 0 ? a.duration() : a.totalDuration()) /
              (a.reversed() ? -t : t)
          );
        if (a._dirty) {
          for (i = a.parent; s; )
            (e = s._prev),
              s._dirty && s.totalDuration(),
              o < (r = s._start) && a._sort && s._ts && !a._lock
                ? ((a._lock = 1), (Ka(a, s, r - s._delay, 1)._lock = 0))
                : (o = r),
              r < 0 &&
                s._ts &&
                ((n -= r),
                ((!i && !a._dp) || (i && i.smoothChildTiming)) &&
                  ((a._start += r / a._ts), (a._time -= r), (a._tTime -= r)),
                a.shiftChildren(-r, !1, -Infinity),
                (o = 0)),
              s._end > n && s._ts && (n = s._end),
              (s = e);
          Ra(a, a === I && a._time > n ? a._time : n, 1, 1), (a._dirty = 0);
        }
        return a._tDur;
      }),
      (Timeline.updateRoot = function updateRoot(t) {
        if ((I._ts && (na(I, Ga(t, I)), (f = Rt.frame)), Rt.frame >= mt)) {
          mt += q.autoSleep || 120;
          var e = I._first;
          if ((!e || !e._ts) && q.autoSleep && Rt._listeners.length < 2) {
            for (; e && !e._ts; ) e = e._next;
            e || Rt.sleep();
          }
        }
      }),
      Timeline
    );
  })(Ut);
  qa(Xt.prototype, { _lock: 0, _hasPause: 0, _forcing: 0 });
  function ac(t, e, i, n, a, o) {
    var u, h, l, f;
    if (
      pt[t] &&
      !1 !==
        (u = new pt[t]()).init(
          a,
          u.rawVars
            ? e[t]
            : (function _processVars(t, e, i, n, a) {
                if (
                  (s(t) && (t = Kt(t, a, e, i, n)),
                  !v(t) || (t.style && t.nodeType) || Z(t) || $(t))
                )
                  return r(t) ? Kt(t, a, e, i, n) : t;
                var o,
                  u = {};
                for (o in t) u[o] = Kt(t[o], a, e, i, n);
                return u;
              })(e[t], n, a, o, i),
          i,
          n,
          o
        ) &&
      ((i._pt = h = new _e(i._pt, a, t, 0, 1, u.render, u, 0, u.priority)),
      i !== d)
    )
      for (l = i._ptLookup[i._targets.indexOf(a)], f = u._props.length; f--; )
        l[u._props[f]] = h;
    return u;
  }
  function gc(t, r, e, i) {
    var n,
      a,
      s = r.ease || i || "power1.inOut";
    if (Z(r))
      (a = e[t] || (e[t] = [])),
        r.forEach(function (t, e) {
          return a.push({ t: (e / (r.length - 1)) * 100, v: t, e: s });
        });
    else
      for (n in r)
        (a = e[n] || (e[n] = [])),
          "ease" === n || a.push({ t: parseFloat(t), v: r[n], e: s });
  }
  var Nt,
    Gt,
    Wt = function _addPropTween(t, e, i, n, a, o, u, h, l, f) {
      s(n) && (n = n(a || 0, t, o));
      var d,
        c = t[e],
        p =
          "get" !== i
            ? i
            : s(c)
            ? l
              ? t[
                  e.indexOf("set") || !s(t["get" + e.substr(3)])
                    ? e
                    : "get" + e.substr(3)
                ](l)
              : t[e]()
            : c,
        _ = s(c) ? (l ? re : te) : Zt;
      if (
        (r(n) &&
          (~n.indexOf("random(") && (n = ob(n)),
          "=" === n.charAt(1) &&
            ((!(d = ka(p, n) + (Ya(p) || 0)) && 0 !== d) || (n = d))),
        !f || p !== n || Gt)
      )
        return isNaN(p * n) || "" === n
          ? (c || e in t || Q(e, n),
            function _addComplexStringPropTween(t, e, r, i, n, a, s) {
              var o,
                u,
                h,
                l,
                f,
                d,
                c,
                p,
                _ = new _e(this._pt, t, e, 0, 1, ue, null, n),
                m = 0,
                g = 0;
              for (
                _.b = r,
                  _.e = i,
                  r += "",
                  (c = ~(i += "").indexOf("random(")) && (i = ob(i)),
                  a && (a((p = [r, i]), t, e), (r = p[0]), (i = p[1])),
                  u = r.match(it) || [];
                (o = it.exec(i));

              )
                (l = o[0]),
                  (f = i.substring(m, o.index)),
                  h ? (h = (h + 1) % 5) : "rgba(" === f.substr(-5) && (h = 1),
                  l !== u[g++] &&
                    ((d = parseFloat(u[g - 1]) || 0),
                    (_._pt = {
                      _next: _._pt,
                      p: f || 1 === g ? f : ",",
                      s: d,
                      c: "=" === l.charAt(1) ? ka(d, l) - d : parseFloat(l) - d,
                      m: h && h < 4 ? Math.round : 0,
                    }),
                    (m = it.lastIndex));
              return (
                (_.c = m < i.length ? i.substring(m, i.length) : ""),
                (_.fp = s),
                (nt.test(i) || c) && (_.e = 0),
                (this._pt = _)
              );
            }.call(this, t, e, p, n, _, h || q.stringFilter, l))
          : ((d = new _e(
              this._pt,
              t,
              e,
              +p || 0,
              n - (p || 0),
              "boolean" == typeof c ? se : ae,
              0,
              _
            )),
            l && (d.fp = l),
            u && d.modifier(u, this, t),
            (this._pt = d));
    },
    Qt = function _initTween(t, e, r) {
      var i,
        n,
        a,
        s,
        o,
        u,
        h,
        l,
        f,
        d,
        c,
        p,
        _,
        m = t.vars,
        g = m.ease,
        v = m.startAt,
        y = m.immediateRender,
        T = m.lazy,
        b = m.onUpdate,
        x = m.runBackwards,
        k = m.yoyoEase,
        O = m.keyframes,
        M = m.autoRevert,
        P = t._dur,
        C = t._startAt,
        A = t._targets,
        S = t.parent,
        z = S && "nested" === S.data ? S.vars.targets : A,
        E = "auto" === t._overwrite && !F,
        D = t.timeline;
      if (
        (!D || (O && g) || (g = "none"),
        (t._ease = jt(g, V.ease)),
        (t._yEase = k ? Bt(jt(!0 === k ? g : k, V.ease)) : 0),
        k &&
          t._yoyo &&
          !t._repeat &&
          ((k = t._yEase), (t._yEase = t._ease), (t._ease = k)),
        (t._from = !D && !!m.runBackwards),
        !D || (O && !m.stagger))
      ) {
        if (
          ((p = (l = A[0] ? fa(A[0]).harness : 0) && m[l.prop]),
          (i = ua(m, ft)),
          C &&
            (C._zTime < 0 && C.progress(1),
            e < 0 && x && y && !M
              ? C.render(-1, !0)
              : C.revert(x && P ? ht : ut),
            (C._lazy = 0)),
          v)
        ) {
          if (
            (za(
              (t._startAt = $t.set(
                A,
                qa(
                  {
                    data: "isStart",
                    overwrite: !1,
                    parent: S,
                    immediateRender: !0,
                    lazy: !C && w(T),
                    startAt: null,
                    delay: 0,
                    onUpdate:
                      b &&
                      function () {
                        return Ct(t, "onUpdate");
                      },
                    stagger: 0,
                  },
                  v
                )
              ))
            ),
            (t._startAt._dp = 0),
            (t._startAt._sat = t),
            e < 0 && (L || (!y && !M)) && t._startAt.revert(ht),
            y && P && e <= 0 && r <= 0)
          )
            return void (e && (t._zTime = e));
        } else if (x && P && !C)
          if (
            (e && (y = !1),
            (a = qa(
              {
                overwrite: !1,
                data: "isFromStart",
                lazy: y && !C && w(T),
                immediateRender: y,
                stagger: 0,
                parent: S,
              },
              i
            )),
            p && (a[l.prop] = p),
            za((t._startAt = $t.set(A, a))),
            (t._startAt._dp = 0),
            (t._startAt._sat = t),
            e < 0 && (L ? t._startAt.revert(ht) : t._startAt.render(-1, !0)),
            (t._zTime = e),
            y)
          ) {
            if (!e) return;
          } else _initTween(t._startAt, X, X);
        for (
          t._pt = t._ptCache = 0, T = (P && w(T)) || (T && !P), n = 0;
          n < A.length;
          n++
        ) {
          if (
            ((h = (o = A[n])._gsap || ea(A)[n]._gsap),
            (t._ptLookup[n] = d = {}),
            ct[h.id] && dt.length && ma(),
            (c = z === A ? n : z.indexOf(o)),
            l &&
              !1 !== (f = new l()).init(o, p || i, t, c, z) &&
              ((t._pt = s =
                new _e(t._pt, o, f.name, 0, 1, f.render, f, 0, f.priority)),
              f._props.forEach(function (t) {
                d[t] = s;
              }),
              f.priority && (u = 1)),
            !l || p)
          )
            for (a in i)
              pt[a] && (f = ac(a, i, t, c, o, z))
                ? f.priority && (u = 1)
                : (d[a] = s =
                    Wt.call(t, o, a, "get", i[a], c, z, 0, m.stringFilter));
          t._op && t._op[n] && t.kill(o, t._op[n]),
            E &&
              t._pt &&
              ((Nt = t),
              I.killTweensOf(o, d, t.globalTime(e)),
              (_ = !t.parent),
              (Nt = 0)),
            t._pt && T && (ct[h.id] = 1);
        }
        u && pe(t), t._onInit && t._onInit(t);
      }
      (t._onUpdate = b),
        (t._initted = (!t._op || t._pt) && !_),
        O && e <= 0 && D.render(U, !0, !0);
    },
    Kt = function _parseFuncOrString(t, e, i, n, a) {
      return s(t)
        ? t.call(e, i, n, a)
        : r(t) && ~t.indexOf("random(")
        ? ob(t)
        : t;
    },
    Jt = vt + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",
    Ht = {};
  ha(Jt + ",id,stagger,delay,duration,paused,scrollTrigger", function (t) {
    return (Ht[t] = 1);
  });
  var $t = (function (D) {
    function Tween(e, r, i, n) {
      var a;
      "number" == typeof r && ((i.duration = r), (r = i), (i = null));
      var s,
        o,
        u,
        h,
        l,
        f,
        d,
        c,
        p = (a = D.call(this, n ? r : va(r)) || this).vars,
        _ = p.duration,
        m = p.delay,
        g = p.immediateRender,
        T = p.stagger,
        b = p.overwrite,
        x = p.keyframes,
        k = p.defaults,
        O = p.scrollTrigger,
        M = p.yoyoEase,
        P = r.parent || I,
        C = (Z(e) || $(e) ? t(e[0]) : "length" in r) ? [e] : Mt(e);
      if (
        ((a._targets = C.length
          ? ea(C)
          : R(
              "GSAP target " + e + " not found. https://gsap.com",
              !q.nullTargetWarn
            ) || []),
        (a._ptLookup = []),
        (a._overwrite = b),
        x || T || y(_) || y(m))
      ) {
        if (
          ((r = a.vars),
          (s = a.timeline =
            new Xt({
              data: "nested",
              defaults: k || {},
              targets: P && "nested" === P.data ? P.vars.targets : C,
            })).kill(),
          (s.parent = s._dp = _assertThisInitialized(a)),
          (s._start = 0),
          T || y(_) || y(m))
        ) {
          if (((h = C.length), (d = T && eb(T)), v(T)))
            for (l in T) ~Jt.indexOf(l) && ((c = c || {})[l] = T[l]);
          for (o = 0; o < h; o++)
            ((u = ua(r, Ht)).stagger = 0),
              M && (u.yoyoEase = M),
              c && yt(u, c),
              (f = C[o]),
              (u.duration = +Kt(_, _assertThisInitialized(a), o, f, C)),
              (u.delay =
                (+Kt(m, _assertThisInitialized(a), o, f, C) || 0) - a._delay),
              !T &&
                1 === h &&
                u.delay &&
                ((a._delay = m = u.delay), (a._start += m), (u.delay = 0)),
              s.to(f, u, d ? d(o, f, C) : 0),
              (s._ease = Lt.none);
          s.duration() ? (_ = m = 0) : (a.timeline = 0);
        } else if (x) {
          va(qa(s.vars.defaults, { ease: "none" })),
            (s._ease = jt(x.ease || r.ease || "none"));
          var A,
            S,
            z,
            E = 0;
          if (Z(x))
            x.forEach(function (t) {
              return s.to(C, t, ">");
            }),
              s.duration();
          else {
            for (l in ((u = {}), x))
              "ease" === l || "easeEach" === l || gc(l, x[l], u, x.easeEach);
            for (l in u)
              for (
                A = u[l].sort(function (t, e) {
                  return t.t - e.t;
                }),
                  o = E = 0;
                o < A.length;
                o++
              )
                ((z = {
                  ease: (S = A[o]).e,
                  duration: ((S.t - (o ? A[o - 1].t : 0)) / 100) * _,
                })[l] = S.v),
                  s.to(C, z, E),
                  (E += z.duration);
            s.duration() < _ && s.to({}, { duration: _ - s.duration() });
          }
        }
        _ || a.duration((_ = s.duration()));
      } else a.timeline = 0;
      return (
        !0 !== b ||
          F ||
          ((Nt = _assertThisInitialized(a)), I.killTweensOf(C), (Nt = 0)),
        Ka(P, _assertThisInitialized(a), i),
        r.reversed && a.reverse(),
        r.paused && a.paused(!0),
        (g ||
          (!_ &&
            !x &&
            a._start === ja(P._time) &&
            w(g) &&
            (function _hasNoPausedAncestors(t) {
              return !t || (t._ts && _hasNoPausedAncestors(t.parent));
            })(_assertThisInitialized(a)) &&
            "nested" !== P.data)) &&
          ((a._tTime = -X), a.render(Math.max(0, -m) || 0)),
        O && La(_assertThisInitialized(a), O),
        a
      );
    }
    _inheritsLoose(Tween, D);
    var e = Tween.prototype;
    return (
      (e.render = function render(t, e, r) {
        var i,
          n,
          a,
          s,
          o,
          u,
          h,
          l,
          f,
          d = this._time,
          c = this._tDur,
          p = this._dur,
          _ = t < 0,
          m = c - X < t && !_ ? c : t < X ? 0 : t;
        if (p) {
          if (
            m !== this._tTime ||
            !t ||
            r ||
            (!this._initted && this._tTime) ||
            (this._startAt && this._zTime < 0 != _) ||
            this._lazy
          ) {
            if (((i = m), (l = this.timeline), this._repeat)) {
              if (((s = p + this._rDelay), this._repeat < -1 && _))
                return this.totalTime(100 * s + t, e, r);
              if (
                ((i = ja(m % s)),
                m === c
                  ? ((a = this._repeat), (i = p))
                  : (a = ~~(o = ja(m / s))) && a === o
                  ? ((i = p), a--)
                  : p < i && (i = p),
                (u = this._yoyo && 1 & a) && ((f = this._yEase), (i = p - i)),
                (o = Tt(this._tTime, s)),
                i === d && !r && this._initted && a === o)
              )
                return (this._tTime = m), this;
              a !== o &&
                (l && this._yEase && Qb(l, u),
                this.vars.repeatRefresh &&
                  !u &&
                  !this._lock &&
                  i !== s &&
                  this._initted &&
                  ((this._lock = r = 1),
                  (this.render(ja(s * a), !0).invalidate()._lock = 0)));
            }
            if (!this._initted) {
              if (Ma(this, _ ? t : i, r, e, m)) return (this._tTime = 0), this;
              if (
                !(d === this._time || (r && this.vars.repeatRefresh && a !== o))
              )
                return this;
              if (p !== this._dur) return this.render(t, e, r);
            }
            if (
              ((this._tTime = m),
              (this._time = i),
              !this._act && this._ts && ((this._act = 1), (this._lazy = 0)),
              (this.ratio = h = (f || this._ease)(i / p)),
              this._from && (this.ratio = h = 1 - h),
              i && !d && !e && !a && (Ct(this, "onStart"), this._tTime !== m))
            )
              return this;
            for (n = this._pt; n; ) n.r(h, n.d), (n = n._next);
            (l &&
              l.render(t < 0 ? t : l._dur * l._ease(i / this._dur), e, r)) ||
              (this._startAt && (this._zTime = t)),
              this._onUpdate &&
                !e &&
                (_ && Ca(this, t, 0, r), Ct(this, "onUpdate")),
              this._repeat &&
                a !== o &&
                this.vars.onRepeat &&
                !e &&
                this.parent &&
                Ct(this, "onRepeat"),
              (m !== this._tDur && m) ||
                this._tTime !== m ||
                (_ && !this._onUpdate && Ca(this, t, 0, !0),
                (!t && p) ||
                  !(
                    (m === this._tDur && 0 < this._ts) ||
                    (!m && this._ts < 0)
                  ) ||
                  za(this, 1),
                e ||
                  (_ && !d) ||
                  !(m || d || u) ||
                  (Ct(this, m === c ? "onComplete" : "onReverseComplete", !0),
                  !this._prom ||
                    (m < c && 0 < this.timeScale()) ||
                    this._prom()));
          }
        } else
          !(function _renderZeroDurationTween(t, e, r, i) {
            var n,
              a,
              s,
              o = t.ratio,
              u =
                e < 0 ||
                (!e &&
                  ((!t._start &&
                    (function _parentPlayheadIsBeforeStart(t) {
                      var e = t.parent;
                      return (
                        e &&
                        e._ts &&
                        e._initted &&
                        !e._lock &&
                        (e.rawTime() < 0 || _parentPlayheadIsBeforeStart(e))
                      );
                    })(t) &&
                    (t._initted || !bt(t))) ||
                    ((t._ts < 0 || t._dp._ts < 0) && !bt(t))))
                  ? 0
                  : 1,
              h = t._rDelay,
              l = 0;
            if (
              (h &&
                t._repeat &&
                ((l = kt(0, t._tDur, e)),
                (a = Tt(l, h)),
                t._yoyo && 1 & a && (u = 1 - u),
                a !== Tt(t._tTime, h) &&
                  ((o = 1 - u),
                  t.vars.repeatRefresh && t._initted && t.invalidate())),
              u !== o || L || i || t._zTime === X || (!e && t._zTime))
            ) {
              if (!t._initted && Ma(t, e, i, r, l)) return;
              for (
                s = t._zTime,
                  t._zTime = e || (r ? X : 0),
                  r = r || (e && !s),
                  t.ratio = u,
                  t._from && (u = 1 - u),
                  t._time = 0,
                  t._tTime = l,
                  n = t._pt;
                n;

              )
                n.r(u, n.d), (n = n._next);
              e < 0 && Ca(t, e, 0, !0),
                t._onUpdate && !r && Ct(t, "onUpdate"),
                l && t._repeat && !r && t.parent && Ct(t, "onRepeat"),
                (e >= t._tDur || e < 0) &&
                  t.ratio === u &&
                  (u && za(t, 1),
                  r ||
                    L ||
                    (Ct(t, u ? "onComplete" : "onReverseComplete", !0),
                    t._prom && t._prom()));
            } else t._zTime || (t._zTime = e);
          })(this, t, e, r);
        return this;
      }),
      (e.targets = function targets() {
        return this._targets;
      }),
      (e.invalidate = function invalidate(t) {
        return (
          (t && this.vars.runBackwards) || (this._startAt = 0),
          (this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0),
          (this._ptLookup = []),
          this.timeline && this.timeline.invalidate(t),
          D.prototype.invalidate.call(this, t)
        );
      }),
      (e.resetTo = function resetTo(t, e, r, i, n) {
        c || Rt.wake(), this._ts || this.play();
        var a,
          s = Math.min(this._dur, (this._dp._time - this._start) * this._ts);
        return (
          this._initted || Qt(this, s),
          (a = this._ease(s / this._dur)),
          (function _updatePropTweens(t, e, r, i, n, a, s, o) {
            var u,
              h,
              l,
              f,
              d = ((t._pt && t._ptCache) || (t._ptCache = {}))[e];
            if (!d)
              for (
                d = t._ptCache[e] = [], l = t._ptLookup, f = t._targets.length;
                f--;

              ) {
                if ((u = l[f][e]) && u.d && u.d._pt)
                  for (u = u.d._pt; u && u.p !== e && u.fp !== e; ) u = u._next;
                if (!u)
                  return (
                    (Gt = 1),
                    (t.vars[e] = "+=0"),
                    Qt(t, s),
                    (Gt = 0),
                    o ? R(e + " not eligible for reset") : 1
                  );
                d.push(u);
              }
            for (f = d.length; f--; )
              ((u = (h = d[f])._pt || h).s =
                (!i && 0 !== i) || n ? u.s + (i || 0) + a * u.c : i),
                (u.c = r - u.s),
                h.e && (h.e = ia(r) + Ya(h.e)),
                h.b && (h.b = u.s + Ya(h.b));
          })(this, t, e, r, i, a, s, n)
            ? this.resetTo(t, e, r, i, 1)
            : (Ia(this, 0),
              this.parent ||
                xa(
                  this._dp,
                  this,
                  "_first",
                  "_last",
                  this._dp._sort ? "_start" : 0
                ),
              this.render(0))
        );
      }),
      (e.kill = function kill(t, e) {
        if ((void 0 === e && (e = "all"), !(t || (e && "all" !== e))))
          return (
            (this._lazy = this._pt = 0),
            this.parent
              ? tb(this)
              : this.scrollTrigger && this.scrollTrigger.kill(!!L),
            this
          );
        if (this.timeline) {
          var i = this.timeline.totalDuration();
          return (
            this.timeline.killTweensOf(t, e, Nt && !0 !== Nt.vars.overwrite)
              ._first || tb(this),
            this.parent &&
              i !== this.timeline.totalDuration() &&
              Ra(this, (this._dur * this.timeline._tDur) / i, 0, 1),
            this
          );
        }
        var n,
          a,
          s,
          o,
          u,
          h,
          l,
          f = this._targets,
          d = t ? Mt(t) : f,
          c = this._ptLookup,
          p = this._pt;
        if (
          (!e || "all" === e) &&
          (function _arraysMatch(t, e) {
            for (
              var r = t.length, i = r === e.length;
              i && r-- && t[r] === e[r];

            );
            return r < 0;
          })(f, d)
        )
          return "all" === e && (this._pt = 0), tb(this);
        for (
          n = this._op = this._op || [],
            "all" !== e &&
              (r(e) &&
                ((u = {}),
                ha(e, function (t) {
                  return (u[t] = 1);
                }),
                (e = u)),
              (e = (function _addAliasesToVars(t, e) {
                var r,
                  i,
                  n,
                  a,
                  s = t[0] ? fa(t[0]).harness : 0,
                  o = s && s.aliases;
                if (!o) return e;
                for (i in ((r = yt({}, e)), o))
                  if ((i in r))
                    for (n = (a = o[i].split(",")).length; n--; )
                      r[a[n]] = r[i];
                return r;
              })(f, e))),
            l = f.length;
          l--;

        )
          if (~d.indexOf(f[l]))
            for (u in ((a = c[l]),
            "all" === e
              ? ((n[l] = e), (o = a), (s = {}))
              : ((s = n[l] = n[l] || {}), (o = e)),
            o))
              (h = a && a[u]) &&
                (("kill" in h.d && !0 !== h.d.kill(u)) || ya(this, h, "_pt"),
                delete a[u]),
                "all" !== s && (s[u] = 1);
        return this._initted && !this._pt && p && tb(this), this;
      }),
      (Tween.to = function to(t, e, r) {
        return new Tween(t, e, r);
      }),
      (Tween.from = function from(t, e) {
        return Va(1, arguments);
      }),
      (Tween.delayedCall = function delayedCall(t, e, r, i) {
        return new Tween(e, 0, {
          immediateRender: !1,
          lazy: !1,
          overwrite: !1,
          delay: t,
          onComplete: e,
          onReverseComplete: e,
          onCompleteParams: r,
          onReverseCompleteParams: r,
          callbackScope: i,
        });
      }),
      (Tween.fromTo = function fromTo(t, e, r) {
        return Va(2, arguments);
      }),
      (Tween.set = function set(t, e) {
        return (
          (e.duration = 0), e.repeatDelay || (e.repeat = 0), new Tween(t, e)
        );
      }),
      (Tween.killTweensOf = function killTweensOf(t, e, r) {
        return I.killTweensOf(t, e, r);
      }),
      Tween
    );
  })(Ut);
  qa($t.prototype, { _targets: [], _lazy: 0, _startAt: 0, _op: 0, _onInit: 0 }),
    ha("staggerTo,staggerFrom,staggerFromTo", function (r) {
      $t[r] = function () {
        var t = new Xt(),
          e = Ot.call(arguments, 0);
        return e.splice("staggerFromTo" === r ? 5 : 4, 0, 0), t[r].apply(t, e);
      };
    });
  function oc(t, e, r) {
    return t.setAttribute(e, r);
  }
  function wc(t, e, r, i) {
    i.mSet(t, e, i.m.call(i.tween, r, i.mt), i);
  }
  var Zt = function _setterPlain(t, e, r) {
      return (t[e] = r);
    },
    te = function _setterFunc(t, e, r) {
      return t[e](r);
    },
    re = function _setterFuncWithParam(t, e, r, i) {
      return t[e](i.fp, r);
    },
    ne = function _getSetter(t, e) {
      return s(t[e]) ? te : u(t[e]) && t.setAttribute ? oc : Zt;
    },
    ae = function _renderPlain(t, e) {
      return e.set(e.t, e.p, Math.round(1e6 * (e.s + e.c * t)) / 1e6, e);
    },
    se = function _renderBoolean(t, e) {
      return e.set(e.t, e.p, !!(e.s + e.c * t), e);
    },
    ue = function _renderComplexString(t, e) {
      var r = e._pt,
        i = "";
      if (!t && e.b) i = e.b;
      else if (1 === t && e.e) i = e.e;
      else {
        for (; r; )
          (i =
            r.p +
            (r.m
              ? r.m(r.s + r.c * t)
              : Math.round(1e4 * (r.s + r.c * t)) / 1e4) +
            i),
            (r = r._next);
        i += e.c;
      }
      e.set(e.t, e.p, i, e);
    },
    he = function _renderPropTweens(t, e) {
      for (var r = e._pt; r; ) r.r(t, r.d), (r = r._next);
    },
    fe = function _addPluginModifier(t, e, r, i) {
      for (var n, a = this._pt; a; )
        (n = a._next), a.p === i && a.modifier(t, e, r), (a = n);
    },
    ce = function _killPropTweensOf(t) {
      for (var e, r, i = this._pt; i; )
        (r = i._next),
          (i.p === t && !i.op) || i.op === t
            ? ya(this, i, "_pt")
            : i.dep || (e = 1),
          (i = r);
      return !e;
    },
    pe = function _sortPropTweensByPriority(t) {
      for (var e, r, i, n, a = t._pt; a; ) {
        for (e = a._next, r = i; r && r.pr > a.pr; ) r = r._next;
        (a._prev = r ? r._prev : n) ? (a._prev._next = a) : (i = a),
          (a._next = r) ? (r._prev = a) : (n = a),
          (a = e);
      }
      t._pt = i;
    },
    _e =
      ((PropTween.prototype.modifier = function modifier(t, e, r) {
        (this.mSet = this.mSet || this.set),
          (this.set = wc),
          (this.m = t),
          (this.mt = r),
          (this.tween = e);
      }),
      PropTween);
  function PropTween(t, e, r, i, n, a, s, o, u) {
    (this.t = e),
      (this.s = i),
      (this.c = n),
      (this.p = r),
      (this.r = a || ae),
      (this.d = s || this),
      (this.set = o || Zt),
      (this.pr = u || 0),
      (this._next = t) && (t._prev = this);
  }
  ha(
    vt +
      "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",
    function (t) {
      return (ft[t] = 1);
    }
  ),
    (ot.TweenMax = ot.TweenLite = $t),
    (ot.TimelineLite = ot.TimelineMax = Xt),
    (I = new Xt({
      sortChildren: !1,
      defaults: V,
      autoRemoveChildren: !0,
      id: "root",
      smoothChildTiming: !0,
    })),
    (q.stringFilter = Fb);
  function Ec(t) {
    return (ye[t] || Te).map(function (t) {
      return t();
    });
  }
  function Fc() {
    var t = Date.now(),
      o = [];
    2 < t - Oe &&
      (Ec("matchMediaInit"),
      ge.forEach(function (t) {
        var e,
          r,
          i,
          n,
          a = t.queries,
          s = t.conditions;
        for (r in a)
          (e = h.matchMedia(a[r]).matches) && (i = 1),
            e !== s[r] && ((s[r] = e), (n = 1));
        n && (t.revert(), i && o.push(t));
      }),
      Ec("matchMediaRevert"),
      o.forEach(function (e) {
        return e.onMatch(e, function (t) {
          return e.add(null, t);
        });
      }),
      (Oe = t),
      Ec("matchMedia"));
  }
  var me,
    ge = [],
    ye = {},
    Te = [],
    Oe = 0,
    Me = 0,
    Pe =
      (((me = Context.prototype).add = function add(t, i, n) {
        function Gw() {
          var t,
            e = l,
            r = a.selector;
          return (
            e && e !== a && e.data.push(a),
            n && (a.selector = cb(n)),
            (l = a),
            (t = i.apply(a, arguments)),
            s(t) && a._r.push(t),
            (l = e),
            (a.selector = r),
            (a.isReverted = !1),
            t
          );
        }
        s(t) && ((n = i), (i = t), (t = s));
        var a = this;
        return (
          (a.last = Gw),
          t === s
            ? Gw(a, function (t) {
                return a.add(null, t);
              })
            : t
            ? (a[t] = Gw)
            : Gw
        );
      }),
      (me.ignore = function ignore(t) {
        var e = l;
        (l = null), t(this), (l = e);
      }),
      (me.getTweens = function getTweens() {
        var e = [];
        return (
          this.data.forEach(function (t) {
            return t instanceof Context
              ? e.push.apply(e, t.getTweens())
              : t instanceof $t &&
                  !(t.parent && "nested" === t.parent.data) &&
                  e.push(t);
          }),
          e
        );
      }),
      (me.clear = function clear() {
        this._r.length = this.data.length = 0;
      }),
      (me.kill = function kill(i, t) {
        var n = this;
        if (
          (i
            ? (function () {
                for (var t, e = n.getTweens(), r = n.data.length; r--; )
                  "isFlip" === (t = n.data[r]).data &&
                    (t.revert(),
                    t.getChildren(!0, !0, !1).forEach(function (t) {
                      return e.splice(e.indexOf(t), 1);
                    }));
                for (
                  e
                    .map(function (t) {
                      return {
                        g:
                          t._dur ||
                          t._delay ||
                          (t._sat && !t._sat.vars.immediateRender)
                            ? t.globalTime(0)
                            : -1 / 0,
                        t: t,
                      };
                    })
                    .sort(function (t, e) {
                      return e.g - t.g || -1 / 0;
                    })
                    .forEach(function (t) {
                      return t.t.revert(i);
                    }),
                    r = n.data.length;
                  r--;

                )
                  (t = n.data[r]) instanceof Xt
                    ? "nested" !== t.data &&
                      (t.scrollTrigger && t.scrollTrigger.revert(), t.kill())
                    : t instanceof $t || !t.revert || t.revert(i);
                n._r.forEach(function (t) {
                  return t(i, n);
                }),
                  (n.isReverted = !0);
              })()
            : this.data.forEach(function (t) {
                return t.kill && t.kill();
              }),
          this.clear(),
          t)
        )
          for (var e = ge.length; e--; )
            ge[e].id === this.id && ge.splice(e, 1);
      }),
      (me.revert = function revert(t) {
        this.kill(t || {});
      }),
      Context);
  function Context(t, e) {
    (this.selector = e && cb(e)),
      (this.data = []),
      (this._r = []),
      (this.isReverted = !1),
      (this.id = Me++),
      t && this.add(t);
  }
  var Ce,
    Ae =
      (((Ce = MatchMedia.prototype).add = function add(t, e, r) {
        v(t) || (t = { matches: t });
        var i,
          n,
          a,
          s = new Pe(0, r || this.scope),
          o = (s.conditions = {});
        for (n in (l && !s.selector && (s.selector = l.selector),
        this.contexts.push(s),
        (e = s.add("onMatch", e)),
        (s.queries = t)))
          "all" === n
            ? (a = 1)
            : (i = h.matchMedia(t[n])) &&
              (ge.indexOf(s) < 0 && ge.push(s),
              (o[n] = i.matches) && (a = 1),
              i.addListener
                ? i.addListener(Fc)
                : i.addEventListener("change", Fc));
        return (
          a &&
            e(s, function (t) {
              return s.add(null, t);
            }),
          this
        );
      }),
      (Ce.revert = function revert(t) {
        this.kill(t || {});
      }),
      (Ce.kill = function kill(e) {
        this.contexts.forEach(function (t) {
          return t.kill(e, !0);
        });
      }),
      MatchMedia);
  function MatchMedia(t) {
    (this.contexts = []), (this.scope = t), l && l.data.push(this);
  }
  var Se = {
    registerPlugin: function registerPlugin() {
      for (var t = arguments.length, e = new Array(t), r = 0; r < t; r++)
        e[r] = arguments[r];
      e.forEach(function (t) {
        return wb(t);
      });
    },
    timeline: function timeline(t) {
      return new Xt(t);
    },
    getTweensOf: function getTweensOf(t, e) {
      return I.getTweensOf(t, e);
    },
    getProperty: function getProperty(i, t, e, n) {
      r(i) && (i = Mt(i)[0]);
      var a = fa(i || {}).get,
        s = e ? pa : oa;
      return (
        "native" === e && (e = ""),
        i
          ? t
            ? s(((pt[t] && pt[t].get) || a)(i, t, e, n))
            : function (t, e, r) {
                return s(((pt[t] && pt[t].get) || a)(i, t, e, r));
              }
          : i
      );
    },
    quickSetter: function quickSetter(r, e, i) {
      if (1 < (r = Mt(r)).length) {
        var n = r.map(function (t) {
            return ze.quickSetter(t, e, i);
          }),
          a = n.length;
        return function (t) {
          for (var e = a; e--; ) n[e](t);
        };
      }
      r = r[0] || {};
      var s = pt[e],
        o = fa(r),
        u = (o.harness && (o.harness.aliases || {})[e]) || e,
        h = s
          ? function (t) {
              var e = new s();
              (d._pt = 0),
                e.init(r, i ? t + i : t, d, 0, [r]),
                e.render(1, e),
                d._pt && he(1, d);
            }
          : o.set(r, u);
      return s
        ? h
        : function (t) {
            return h(r, u, i ? t + i : t, o, 1);
          };
    },
    quickTo: function quickTo(t, i, e) {
      function $x(t, e, r) {
        return n.resetTo(i, t, e, r);
      }
      var r,
        n = ze.to(
          t,
          qa(
            (((r = {})[i] = "+=0.1"), (r.paused = !0), (r.stagger = 0), r),
            e || {}
          )
        );
      return ($x.tween = n), $x;
    },
    isTweening: function isTweening(t) {
      return 0 < I.getTweensOf(t, !0).length;
    },
    defaults: function defaults(t) {
      return t && t.ease && (t.ease = jt(t.ease, V.ease)), ta(V, t || {});
    },
    config: function config(t) {
      return ta(q, t || {});
    },
    registerEffect: function registerEffect(t) {
      var i = t.name,
        n = t.effect,
        e = t.plugins,
        a = t.defaults,
        r = t.extendTimeline;
      (e || "").split(",").forEach(function (t) {
        return (
          t && !pt[t] && !ot[t] && R(i + " effect requires " + t + " plugin.")
        );
      }),
        (_t[i] = function (t, e, r) {
          return n(Mt(t), qa(e || {}, a), r);
        }),
        r &&
          (Xt.prototype[i] = function (t, e, r) {
            return this.add(_t[i](t, v(e) ? e : (r = e) && {}, this), r);
          });
    },
    registerEase: function registerEase(t, e) {
      Lt[t] = jt(e);
    },
    parseEase: function parseEase(t, e) {
      return arguments.length ? jt(t, e) : Lt;
    },
    getById: function getById(t) {
      return I.getById(t);
    },
    exportRoot: function exportRoot(t, e) {
      void 0 === t && (t = {});
      var r,
        i,
        n = new Xt(t);
      for (
        n.smoothChildTiming = w(t.smoothChildTiming),
          I.remove(n),
          n._dp = 0,
          n._time = n._tTime = I._time,
          r = I._first;
        r;

      )
        (i = r._next),
          (!e &&
            !r._dur &&
            r instanceof $t &&
            r.vars.onComplete === r._targets[0]) ||
            Ka(n, r, r._start - r._delay),
          (r = i);
      return Ka(I, n, 0), n;
    },
    context: function context(t, e) {
      return t ? new Pe(t, e) : l;
    },
    matchMedia: function matchMedia(t) {
      return new Ae(t);
    },
    matchMediaRefresh: function matchMediaRefresh() {
      return (
        ge.forEach(function (t) {
          var e,
            r,
            i = t.conditions;
          for (r in i) i[r] && ((i[r] = !1), (e = 1));
          e && t.revert();
        }) || Fc()
      );
    },
    addEventListener: function addEventListener(t, e) {
      var r = ye[t] || (ye[t] = []);
      ~r.indexOf(e) || r.push(e);
    },
    removeEventListener: function removeEventListener(t, e) {
      var r = ye[t],
        i = r && r.indexOf(e);
      0 <= i && r.splice(i, 1);
    },
    utils: {
      wrap: function wrap(e, t, r) {
        var i = t - e;
        return Z(e)
          ? lb(e, wrap(0, e.length), t)
          : Wa(r, function (t) {
              return ((i + ((t - e) % i)) % i) + e;
            });
      },
      wrapYoyo: function wrapYoyo(e, t, r) {
        var i = t - e,
          n = 2 * i;
        return Z(e)
          ? lb(e, wrapYoyo(0, e.length - 1), t)
          : Wa(r, function (t) {
              return e + (i < (t = (n + ((t - e) % n)) % n || 0) ? n - t : t);
            });
      },
      distribute: eb,
      random: hb,
      snap: gb,
      normalize: function normalize(t, e, r) {
        return Pt(t, e, 0, 1, r);
      },
      getUnit: Ya,
      clamp: function clamp(e, r, t) {
        return Wa(t, function (t) {
          return kt(e, r, t);
        });
      },
      splitColor: Ab,
      toArray: Mt,
      selector: cb,
      mapRange: Pt,
      pipe: function pipe() {
        for (var t = arguments.length, e = new Array(t), r = 0; r < t; r++)
          e[r] = arguments[r];
        return function (t) {
          return e.reduce(function (t, e) {
            return e(t);
          }, t);
        };
      },
      unitize: function unitize(e, r) {
        return function (t) {
          return e(parseFloat(t)) + (r || Ya(t));
        };
      },
      interpolate: function interpolate(e, i, t, n) {
        var a = isNaN(e + i)
          ? 0
          : function (t) {
              return (1 - t) * e + t * i;
            };
        if (!a) {
          var s,
            o,
            u,
            h,
            l,
            f = r(e),
            d = {};
          if ((!0 === t && (n = 1) && (t = null), f))
            (e = { p: e }), (i = { p: i });
          else if (Z(e) && !Z(i)) {
            for (u = [], h = e.length, l = h - 2, o = 1; o < h; o++)
              u.push(interpolate(e[o - 1], e[o]));
            h--,
              (a = function func(t) {
                t *= h;
                var e = Math.min(l, ~~t);
                return u[e](t - e);
              }),
              (t = i);
          } else n || (e = yt(Z(e) ? [] : {}, e));
          if (!u) {
            for (s in i) Wt.call(d, e, s, "get", i[s]);
            a = function func(t) {
              return he(t, d) || (f ? e.p : e);
            };
          }
        }
        return Wa(t, a);
      },
      shuffle: db,
    },
    install: P,
    effects: _t,
    ticker: Rt,
    updateRoot: Xt.updateRoot,
    plugins: pt,
    globalTimeline: I,
    core: {
      PropTween: _e,
      globals: S,
      Tween: $t,
      Timeline: Xt,
      Animation: Ut,
      getCache: fa,
      _removeLinkedListItem: ya,
      reverting: function reverting() {
        return L;
      },
      context: function context(t) {
        return t && l && (l.data.push(t), (t._ctx = l)), l;
      },
      suppressOverwrites: function suppressOverwrites(t) {
        return (F = t);
      },
    },
  };
  ha("to,from,fromTo,delayedCall,set,killTweensOf", function (t) {
    return (Se[t] = $t[t]);
  }),
    Rt.add(Xt.updateRoot),
    (d = Se.to({}, { duration: 0 }));
  function Jc(t, e) {
    for (var r = t._pt; r && r.p !== e && r.op !== e && r.fp !== e; )
      r = r._next;
    return r;
  }
  function Lc(t, a) {
    return {
      name: t,
      rawVars: 1,
      init: function init(t, n, e) {
        e._onInit = function (t) {
          var e, i;
          if (
            (r(n) &&
              ((e = {}),
              ha(n, function (t) {
                return (e[t] = 1);
              }),
              (n = e)),
            a)
          ) {
            for (i in ((e = {}), n)) e[i] = a(n[i]);
            n = e;
          }
          !(function _addModifiers(t, e) {
            var r,
              i,
              n,
              a = t._targets;
            for (r in e)
              for (i = a.length; i--; )
                (n = (n = t._ptLookup[i][r]) && n.d) &&
                  (n._pt && (n = Jc(n, r)),
                  n && n.modifier && n.modifier(e[r], t, a[i], r));
          })(t, n);
        };
      },
    };
  }
  var ze =
    Se.registerPlugin(
      {
        name: "attr",
        init: function init(t, e, r, i, n) {
          var a, s, o;
          for (a in ((this.tween = r), e))
            (o = t.getAttribute(a) || ""),
              ((s = this.add(
                t,
                "setAttribute",
                (o || 0) + "",
                e[a],
                i,
                n,
                0,
                0,
                a
              )).op = a),
              (s.b = o),
              this._props.push(a);
        },
        render: function render(t, e) {
          for (var r = e._pt; r; )
            L ? r.set(r.t, r.p, r.b, r) : r.r(t, r.d), (r = r._next);
        },
      },
      {
        name: "endArray",
        init: function init(t, e) {
          for (var r = e.length; r--; )
            this.add(t, r, t[r] || 0, e[r], 0, 0, 0, 0, 0, 1);
        },
      },
      Lc("roundProps", fb),
      Lc("modifiers"),
      Lc("snap", gb)
    ) || Se;
  ($t.version = Xt.version = ze.version = "3.12.7"), (o = 1), x() && Ft();
  function vd(t, e) {
    return e.set(e.t, e.p, Math.round(1e4 * (e.s + e.c * t)) / 1e4 + e.u, e);
  }
  function wd(t, e) {
    return e.set(
      e.t,
      e.p,
      1 === t ? e.e : Math.round(1e4 * (e.s + e.c * t)) / 1e4 + e.u,
      e
    );
  }
  function xd(t, e) {
    return e.set(
      e.t,
      e.p,
      t ? Math.round(1e4 * (e.s + e.c * t)) / 1e4 + e.u : e.b,
      e
    );
  }
  function yd(t, e) {
    var r = e.s + e.c * t;
    e.set(e.t, e.p, ~~(r + (r < 0 ? -0.5 : 0.5)) + e.u, e);
  }
  function zd(t, e) {
    return e.set(e.t, e.p, t ? e.e : e.b, e);
  }
  function Ad(t, e) {
    return e.set(e.t, e.p, 1 !== t ? e.b : e.e, e);
  }
  function Bd(t, e, r) {
    return (t.style[e] = r);
  }
  function Cd(t, e, r) {
    return t.style.setProperty(e, r);
  }
  function Dd(t, e, r) {
    return (t._gsap[e] = r);
  }
  function Ed(t, e, r) {
    return (t._gsap.scaleX = t._gsap.scaleY = r);
  }
  function Fd(t, e, r, i, n) {
    var a = t._gsap;
    (a.scaleX = a.scaleY = r), a.renderTransform(n, a);
  }
  function Gd(t, e, r, i, n) {
    var a = t._gsap;
    (a[e] = r), a.renderTransform(n, a);
  }
  function Jd(t, e) {
    var r = this,
      i = this.target,
      n = i.style,
      a = i._gsap;
    if (t in ar && n) {
      if (((this.tfm = this.tfm || {}), "transform" === t))
        return dr.transform.split(",").forEach(function (t) {
          return Jd.call(r, t, e);
        });
      if (
        (~(t = dr[t] || t).indexOf(",")
          ? t.split(",").forEach(function (t) {
              return (r.tfm[t] = yr(i, t));
            })
          : (this.tfm[t] = a.x ? a[t] : yr(i, t)),
        t === pr && (this.tfm.zOrigin = a.zOrigin),
        0 <= this.props.indexOf(cr))
      )
        return;
      a.svg &&
        ((this.svgo = i.getAttribute("data-svg-origin")),
        this.props.push(pr, e, "")),
        (t = cr);
    }
    (n || e) && this.props.push(t, e, n[t]);
  }
  function Kd(t) {
    t.translate &&
      (t.removeProperty("translate"),
      t.removeProperty("scale"),
      t.removeProperty("rotate"));
  }
  function Ld() {
    var t,
      e,
      r = this.props,
      i = this.target,
      n = i.style,
      a = i._gsap;
    for (t = 0; t < r.length; t += 3)
      r[t + 1]
        ? 2 === r[t + 1]
          ? i[r[t]](r[t + 2])
          : (i[r[t]] = r[t + 2])
        : r[t + 2]
        ? (n[r[t]] = r[t + 2])
        : n.removeProperty(
            "--" === r[t].substr(0, 2)
              ? r[t]
              : r[t].replace(hr, "-$1").toLowerCase()
          );
    if (this.tfm) {
      for (e in this.tfm) a[e] = this.tfm[e];
      a.svg &&
        (a.renderTransform(),
        i.setAttribute("data-svg-origin", this.svgo || "")),
        ((t = Ye()) && t.isStart) ||
          n[cr] ||
          (Kd(n),
          a.zOrigin &&
            n[pr] &&
            ((n[pr] += " " + a.zOrigin + "px"),
            (a.zOrigin = 0),
            a.renderTransform()),
          (a.uncache = 1));
    }
  }
  function Md(t, e) {
    var r = { target: t, props: [], revert: Ld, save: Jd };
    return (
      t._gsap || ze.core.getCache(t),
      e &&
        t.style &&
        t.nodeType &&
        e.split(",").forEach(function (t) {
          return r.save(t);
        }),
      r
    );
  }
  function Od(t, e) {
    var r = De.createElementNS
      ? De.createElementNS(
          (e || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"),
          t
        )
      : De.createElement(t);
    return r && r.style ? r : De.createElement(t);
  }
  function Pd(t, e, r) {
    var i = getComputedStyle(t);
    return (
      i[e] ||
      i.getPropertyValue(e.replace(hr, "-$1").toLowerCase()) ||
      i.getPropertyValue(e) ||
      (!r && Pd(t, mr(e) || e, 1)) ||
      ""
    );
  }
  function Sd() {
    (function _windowExists() {
      return "undefined" != typeof window;
    })() &&
      window.document &&
      ((Ee = window),
      (De = Ee.document),
      (Re = De.documentElement),
      (Le = Od("div") || { style: {} }),
      Od("div"),
      (cr = mr(cr)),
      (pr = cr + "Origin"),
      (Le.style.cssText =
        "border-width:0;line-height:0;position:absolute;padding:0"),
      (Be = !!mr("perspective")),
      (Ye = ze.core.reverting),
      (Fe = 1));
  }
  function Td(t) {
    var e,
      r = t.ownerSVGElement,
      i = Od(
        "svg",
        (r && r.getAttribute("xmlns")) || "http://www.w3.org/2000/svg"
      ),
      n = t.cloneNode(!0);
    (n.style.display = "block"), i.appendChild(n), Re.appendChild(i);
    try {
      e = n.getBBox();
    } catch (t) {}
    return i.removeChild(n), Re.removeChild(i), e;
  }
  function Ud(t, e) {
    for (var r = e.length; r--; )
      if (t.hasAttribute(e[r])) return t.getAttribute(e[r]);
  }
  function Vd(e) {
    var r, i;
    try {
      r = e.getBBox();
    } catch (t) {
      (r = Td(e)), (i = 1);
    }
    return (
      (r && (r.width || r.height)) || i || (r = Td(e)),
      !r || r.width || r.x || r.y
        ? r
        : {
            x: +Ud(e, ["x", "cx", "x1"]) || 0,
            y: +Ud(e, ["y", "cy", "y1"]) || 0,
            width: 0,
            height: 0,
          }
    );
  }
  function Wd(t) {
    return !(!t.getCTM || (t.parentNode && !t.ownerSVGElement) || !Vd(t));
  }
  function Xd(t, e) {
    if (e) {
      var r,
        i = t.style;
      e in ar && e !== pr && (e = cr),
        i.removeProperty
          ? (("ms" !== (r = e.substr(0, 2)) && "webkit" !== e.substr(0, 6)) ||
              (e = "-" + e),
            i.removeProperty(
              "--" === r ? e : e.replace(hr, "-$1").toLowerCase()
            ))
          : i.removeAttribute(e);
    }
  }
  function Yd(t, e, r, i, n, a) {
    var s = new _e(t._pt, e, r, 0, 1, a ? Ad : zd);
    return ((t._pt = s).b = i), (s.e = n), t._props.push(r), s;
  }
  function _d(t, e, r, i) {
    var n,
      a,
      s,
      o,
      u = parseFloat(r) || 0,
      h = (r + "").trim().substr((u + "").length) || "px",
      l = Le.style,
      f = lr.test(e),
      d = "svg" === t.tagName.toLowerCase(),
      c = (d ? "client" : "offset") + (f ? "Width" : "Height"),
      p = "px" === i,
      _ = "%" === i;
    if (i === h || !u || gr[i] || gr[h]) return u;
    if (
      ("px" === h || p || (u = _d(t, e, r, "px")),
      (o = t.getCTM && Wd(t)),
      (_ || "%" === h) && (ar[e] || ~e.indexOf("adius")))
    )
      return (
        (n = o ? t.getBBox()[f ? "width" : "height"] : t[c]),
        ia(_ ? (u / n) * 100 : (u / 100) * n)
      );
    if (
      ((l[f ? "width" : "height"] = 100 + (p ? h : i)),
      (a =
        ("rem" !== i && ~e.indexOf("adius")) ||
        ("em" === i && t.appendChild && !d)
          ? t
          : t.parentNode),
      o && (a = (t.ownerSVGElement || {}).parentNode),
      (a && a !== De && a.appendChild) || (a = De.body),
      (s = a._gsap) && _ && s.width && f && s.time === Rt.time && !s.uncache)
    )
      return ia((u / s.width) * 100);
    if (!_ || ("height" !== e && "width" !== e))
      (!_ && "%" !== h) ||
        vr[Pd(a, "display")] ||
        (l.position = Pd(t, "position")),
        a === t && (l.position = "static"),
        a.appendChild(Le),
        (n = Le[c]),
        a.removeChild(Le),
        (l.position = "absolute");
    else {
      var m = t.style[e];
      (t.style[e] = 100 + i), (n = t[c]), m ? (t.style[e] = m) : Xd(t, e);
    }
    return (
      f && _ && (((s = fa(a)).time = Rt.time), (s.width = a[c])),
      ia(p ? (n * u) / 100 : n && u ? (100 / n) * u : 0)
    );
  }
  function be(t, e, r, i) {
    if (!r || "none" === r) {
      var n = mr(e, t, 1),
        a = n && Pd(t, n, 1);
      a && a !== r
        ? ((e = n), (r = a))
        : "borderColor" === e && (r = Pd(t, "borderTopColor"));
    }
    var s,
      o,
      u,
      h,
      l,
      f,
      d,
      c,
      p,
      _,
      m,
      g = new _e(this._pt, t.style, e, 0, 1, ue),
      v = 0,
      y = 0;
    if (
      ((g.b = r),
      (g.e = i),
      (r += ""),
      "auto" === (i += "") &&
        ((f = t.style[e]),
        (t.style[e] = i),
        (i = Pd(t, e) || i),
        f ? (t.style[e] = f) : Xd(t, e)),
      Fb((s = [r, i])),
      (i = s[1]),
      (u = (r = s[0]).match(rt) || []),
      (i.match(rt) || []).length)
    ) {
      for (; (o = rt.exec(i)); )
        (d = o[0]),
          (p = i.substring(v, o.index)),
          l
            ? (l = (l + 1) % 5)
            : ("rgba(" !== p.substr(-5) && "hsla(" !== p.substr(-5)) || (l = 1),
          d !== (f = u[y++] || "") &&
            ((h = parseFloat(f) || 0),
            (m = f.substr((h + "").length)),
            "=" === d.charAt(1) && (d = ka(h, d) + m),
            (c = parseFloat(d)),
            (_ = d.substr((c + "").length)),
            (v = rt.lastIndex - _.length),
            _ ||
              ((_ = _ || q.units[e] || m),
              v === i.length && ((i += _), (g.e += _))),
            m !== _ && (h = _d(t, e, f, _) || 0),
            (g._pt = {
              _next: g._pt,
              p: p || 1 === y ? p : ",",
              s: h,
              c: c - h,
              m: (l && l < 4) || "zIndex" === e ? Math.round : 0,
            }));
      g.c = v < i.length ? i.substring(v, i.length) : "";
    } else g.r = "display" === e && "none" === i ? Ad : zd;
    return nt.test(i) && (g.e = 0), (this._pt = g);
  }
  function de(t) {
    var e = t.split(" "),
      r = e[0],
      i = e[1] || "50%";
    return (
      ("top" !== r && "bottom" !== r && "left" !== i && "right" !== i) ||
        ((t = r), (r = i), (i = t)),
      (e[0] = Tr[r] || r),
      (e[1] = Tr[i] || i),
      e.join(" ")
    );
  }
  function ee(t, e) {
    if (e.tween && e.tween._time === e.tween._dur) {
      var r,
        i,
        n,
        a = e.t,
        s = a.style,
        o = e.u,
        u = a._gsap;
      if ("all" === o || !0 === o) (s.cssText = ""), (i = 1);
      else
        for (n = (o = o.split(",")).length; -1 < --n; )
          (r = o[n]),
            ar[r] && ((i = 1), (r = "transformOrigin" === r ? pr : cr)),
            Xd(a, r);
      i &&
        (Xd(a, cr),
        u &&
          (u.svg && a.removeAttribute("transform"),
          (s.scale = s.rotate = s.translate = "none"),
          kr(a, 1),
          (u.uncache = 1),
          Kd(s)));
    }
  }
  function ie(t) {
    return "matrix(1, 0, 0, 1, 0, 0)" === t || "none" === t || !t;
  }
  function je(t) {
    var e = Pd(t, cr);
    return ie(e) ? wr : e.substr(7).match(et).map(ia);
  }
  function ke(t, e) {
    var r,
      i,
      n,
      a,
      s = t._gsap || fa(t),
      o = t.style,
      u = je(t);
    return s.svg && t.getAttribute("transform")
      ? "1,0,0,1,0,0" ===
        (u = [
          (n = t.transform.baseVal.consolidate().matrix).a,
          n.b,
          n.c,
          n.d,
          n.e,
          n.f,
        ]).join(",")
        ? wr
        : u
      : (u !== wr ||
          t.offsetParent ||
          t === Re ||
          s.svg ||
          ((n = o.display),
          (o.display = "block"),
          ((r = t.parentNode) &&
            (t.offsetParent || t.getBoundingClientRect().width)) ||
            ((a = 1), (i = t.nextElementSibling), Re.appendChild(t)),
          (u = je(t)),
          n ? (o.display = n) : Xd(t, "display"),
          a &&
            (i
              ? r.insertBefore(t, i)
              : r
              ? r.appendChild(t)
              : Re.removeChild(t))),
        e && 6 < u.length ? [u[0], u[1], u[4], u[5], u[12], u[13]] : u);
  }
  function le(t, e, r, i, n, a) {
    var s,
      o,
      u,
      h = t._gsap,
      l = n || ke(t, !0),
      f = h.xOrigin || 0,
      d = h.yOrigin || 0,
      c = h.xOffset || 0,
      p = h.yOffset || 0,
      _ = l[0],
      m = l[1],
      g = l[2],
      v = l[3],
      y = l[4],
      T = l[5],
      b = e.split(" "),
      w = parseFloat(b[0]) || 0,
      x = parseFloat(b[1]) || 0;
    r
      ? l !== wr &&
        (o = _ * v - m * g) &&
        ((u = w * (-m / o) + x * (_ / o) - (_ * T - m * y) / o),
        (w = w * (v / o) + x * (-g / o) + (g * T - v * y) / o),
        (x = u))
      : ((w = (s = Vd(t)).x + (~b[0].indexOf("%") ? (w / 100) * s.width : w)),
        (x = s.y + (~(b[1] || b[0]).indexOf("%") ? (x / 100) * s.height : x))),
      i || (!1 !== i && h.smooth)
        ? ((y = w - f),
          (T = x - d),
          (h.xOffset = c + (y * _ + T * g) - y),
          (h.yOffset = p + (y * m + T * v) - T))
        : (h.xOffset = h.yOffset = 0),
      (h.xOrigin = w),
      (h.yOrigin = x),
      (h.smooth = !!i),
      (h.origin = e),
      (h.originIsAbsolute = !!r),
      (t.style[pr] = "0px 0px"),
      a &&
        (Yd(a, h, "xOrigin", f, w),
        Yd(a, h, "yOrigin", d, x),
        Yd(a, h, "xOffset", c, h.xOffset),
        Yd(a, h, "yOffset", p, h.yOffset)),
      t.setAttribute("data-svg-origin", w + " " + x);
  }
  function oe(t, e, r) {
    var i = Ya(e);
    return ia(parseFloat(e) + parseFloat(_d(t, "x", r + "px", i))) + i;
  }
  function ve(t, e, i, n, a) {
    var s,
      o,
      u = 360,
      h = r(a),
      l = parseFloat(a) * (h && ~a.indexOf("rad") ? sr : 1) - n,
      f = n + l + "deg";
    return (
      h &&
        ("short" === (s = a.split("_")[1]) &&
          (l %= u) !== l % 180 &&
          (l += l < 0 ? u : -u),
        "cw" === s && l < 0
          ? (l = ((l + 36e9) % u) - ~~(l / u) * u)
          : "ccw" === s && 0 < l && (l = ((l - 36e9) % u) - ~~(l / u) * u)),
      (t._pt = o = new _e(t._pt, e, i, n, l, wd)),
      (o.e = f),
      (o.u = "deg"),
      t._props.push(i),
      o
    );
  }
  function we(t, e) {
    for (var r in e) t[r] = e[r];
    return t;
  }
  function xe(t, e, r) {
    var i,
      n,
      a,
      s,
      o,
      u,
      h,
      l = we({}, r._gsap),
      f = r.style;
    for (n in (l.svg
      ? ((a = r.getAttribute("transform")),
        r.setAttribute("transform", ""),
        (f[cr] = e),
        (i = kr(r, 1)),
        Xd(r, cr),
        r.setAttribute("transform", a))
      : ((a = getComputedStyle(r)[cr]),
        (f[cr] = e),
        (i = kr(r, 1)),
        (f[cr] = a)),
    ar))
      (a = l[n]) !== (s = i[n]) &&
        "perspective,force3D,transformOrigin,svgOrigin".indexOf(n) < 0 &&
        ((o = Ya(a) !== (h = Ya(s)) ? _d(r, n, a, h) : parseFloat(a)),
        (u = parseFloat(s)),
        (t._pt = new _e(t._pt, i, n, o, u - o, vd)),
        (t._pt.u = h || 0),
        t._props.push(n));
    we(i, l);
  }
  var Ee,
    De,
    Re,
    Fe,
    Le,
    Ie,
    Ye,
    Be,
    qe = Lt.Power0,
    Ve = Lt.Power1,
    Ue = Lt.Power2,
    Xe = Lt.Power3,
    Ne = Lt.Power4,
    Ge = Lt.Linear,
    We = Lt.Quad,
    Qe = Lt.Cubic,
    Ke = Lt.Quart,
    Je = Lt.Quint,
    He = Lt.Strong,
    $e = Lt.Elastic,
    Ze = Lt.Back,
    tr = Lt.SteppedEase,
    er = Lt.Bounce,
    rr = Lt.Sine,
    ir = Lt.Expo,
    nr = Lt.Circ,
    ar = {},
    sr = 180 / Math.PI,
    or = Math.PI / 180,
    ur = Math.atan2,
    hr = /([A-Z])/g,
    lr = /(left|right|width|margin|padding|x)/i,
    fr = /[\s,\(]\S/,
    dr = {
      autoAlpha: "opacity,visibility",
      scale: "scaleX,scaleY",
      alpha: "opacity",
    },
    cr = "transform",
    pr = cr + "Origin",
    _r = "O,Moz,ms,Ms,Webkit".split(","),
    mr = function _checkPropPrefix(t, e, r) {
      var i = (e || Le).style,
        n = 5;
      if (t in i && !r) return t;
      for (
        t = t.charAt(0).toUpperCase() + t.substr(1);
        n-- && !(_r[n] + t in i);

      );
      return n < 0 ? null : (3 === n ? "ms" : 0 <= n ? _r[n] : "") + t;
    },
    gr = { deg: 1, rad: 1, turn: 1 },
    vr = { grid: 1, flex: 1 },
    yr = function _get(t, e, r, i) {
      var n;
      return (
        Fe || Sd(),
        e in dr &&
          "transform" !== e &&
          ~(e = dr[e]).indexOf(",") &&
          (e = e.split(",")[0]),
        ar[e] && "transform" !== e
          ? ((n = kr(t, i)),
            (n =
              "transformOrigin" !== e
                ? n[e]
                : n.svg
                ? n.origin
                : Or(Pd(t, pr)) + " " + n.zOrigin + "px"))
          : ((n = t.style[e]) &&
              "auto" !== n &&
              !i &&
              !~(n + "").indexOf("calc(")) ||
            (n =
              (br[e] && br[e](t, e, r)) ||
              Pd(t, e) ||
              ga(t, e) ||
              ("opacity" === e ? 1 : 0)),
        r && !~(n + "").trim().indexOf(" ") ? _d(t, e, n, r) + r : n
      );
    },
    Tr = {
      top: "0%",
      bottom: "100%",
      left: "0%",
      right: "100%",
      center: "50%",
    },
    br = {
      clearProps: function clearProps(t, e, r, i, n) {
        if ("isFromStart" !== n.data) {
          var a = (t._pt = new _e(t._pt, e, r, 0, 0, ee));
          return (a.u = i), (a.pr = -10), (a.tween = n), t._props.push(r), 1;
        }
      },
    },
    wr = [1, 0, 0, 1, 0, 0],
    xr = {},
    kr = function _parseTransform(t, e) {
      var r = t._gsap || new Vt(t);
      if ("x" in r && !e && !r.uncache) return r;
      var i,
        n,
        a,
        s,
        o,
        u,
        h,
        l,
        f,
        d,
        c,
        p,
        _,
        m,
        g,
        v,
        y,
        T,
        b,
        w,
        x,
        k,
        O,
        M,
        P,
        C,
        A,
        S,
        z,
        E,
        D,
        R,
        F = t.style,
        L = r.scaleX < 0,
        I = "deg",
        Y = getComputedStyle(t),
        B = Pd(t, pr) || "0";
      return (
        (i = n = a = u = h = l = f = d = c = 0),
        (s = o = 1),
        (r.svg = !(!t.getCTM || !Wd(t))),
        Y.translate &&
          (("none" === Y.translate &&
            "none" === Y.scale &&
            "none" === Y.rotate) ||
            (F[cr] =
              ("none" !== Y.translate
                ? "translate3d(" +
                  (Y.translate + " 0 0").split(" ").slice(0, 3).join(", ") +
                  ") "
                : "") +
              ("none" !== Y.rotate ? "rotate(" + Y.rotate + ") " : "") +
              ("none" !== Y.scale
                ? "scale(" + Y.scale.split(" ").join(",") + ") "
                : "") +
              ("none" !== Y[cr] ? Y[cr] : "")),
          (F.scale = F.rotate = F.translate = "none")),
        (m = ke(t, r.svg)),
        r.svg &&
          ((M = r.uncache
            ? ((P = t.getBBox()),
              (B = r.xOrigin - P.x + "px " + (r.yOrigin - P.y) + "px"),
              "")
            : !e && t.getAttribute("data-svg-origin")),
          le(t, M || B, !!M || r.originIsAbsolute, !1 !== r.smooth, m)),
        (p = r.xOrigin || 0),
        (_ = r.yOrigin || 0),
        m !== wr &&
          ((T = m[0]),
          (b = m[1]),
          (w = m[2]),
          (x = m[3]),
          (i = k = m[4]),
          (n = O = m[5]),
          6 === m.length
            ? ((s = Math.sqrt(T * T + b * b)),
              (o = Math.sqrt(x * x + w * w)),
              (u = T || b ? ur(b, T) * sr : 0),
              (f = w || x ? ur(w, x) * sr + u : 0) &&
                (o *= Math.abs(Math.cos(f * or))),
              r.svg && ((i -= p - (p * T + _ * w)), (n -= _ - (p * b + _ * x))))
            : ((R = m[6]),
              (E = m[7]),
              (A = m[8]),
              (S = m[9]),
              (z = m[10]),
              (D = m[11]),
              (i = m[12]),
              (n = m[13]),
              (a = m[14]),
              (h = (g = ur(R, z)) * sr),
              g &&
                ((M = k * (v = Math.cos(-g)) + A * (y = Math.sin(-g))),
                (P = O * v + S * y),
                (C = R * v + z * y),
                (A = k * -y + A * v),
                (S = O * -y + S * v),
                (z = R * -y + z * v),
                (D = E * -y + D * v),
                (k = M),
                (O = P),
                (R = C)),
              (l = (g = ur(-w, z)) * sr),
              g &&
                ((v = Math.cos(-g)),
                (D = x * (y = Math.sin(-g)) + D * v),
                (T = M = T * v - A * y),
                (b = P = b * v - S * y),
                (w = C = w * v - z * y)),
              (u = (g = ur(b, T)) * sr),
              g &&
                ((M = T * (v = Math.cos(g)) + b * (y = Math.sin(g))),
                (P = k * v + O * y),
                (b = b * v - T * y),
                (O = O * v - k * y),
                (T = M),
                (k = P)),
              h &&
                359.9 < Math.abs(h) + Math.abs(u) &&
                ((h = u = 0), (l = 180 - l)),
              (s = ia(Math.sqrt(T * T + b * b + w * w))),
              (o = ia(Math.sqrt(O * O + R * R))),
              (g = ur(k, O)),
              (f = 2e-4 < Math.abs(g) ? g * sr : 0),
              (c = D ? 1 / (D < 0 ? -D : D) : 0)),
          r.svg &&
            ((M = t.getAttribute("transform")),
            (r.forceCSS = t.setAttribute("transform", "") || !ie(Pd(t, cr))),
            M && t.setAttribute("transform", M))),
        90 < Math.abs(f) &&
          Math.abs(f) < 270 &&
          (L
            ? ((s *= -1),
              (f += u <= 0 ? 180 : -180),
              (u += u <= 0 ? 180 : -180))
            : ((o *= -1), (f += f <= 0 ? 180 : -180))),
        (e = e || r.uncache),
        (r.x =
          i -
          ((r.xPercent =
            i &&
            ((!e && r.xPercent) ||
              (Math.round(t.offsetWidth / 2) === Math.round(-i) ? -50 : 0)))
            ? (t.offsetWidth * r.xPercent) / 100
            : 0) +
          "px"),
        (r.y =
          n -
          ((r.yPercent =
            n &&
            ((!e && r.yPercent) ||
              (Math.round(t.offsetHeight / 2) === Math.round(-n) ? -50 : 0)))
            ? (t.offsetHeight * r.yPercent) / 100
            : 0) +
          "px"),
        (r.z = a + "px"),
        (r.scaleX = ia(s)),
        (r.scaleY = ia(o)),
        (r.rotation = ia(u) + I),
        (r.rotationX = ia(h) + I),
        (r.rotationY = ia(l) + I),
        (r.skewX = f + I),
        (r.skewY = d + I),
        (r.transformPerspective = c + "px"),
        (r.zOrigin = parseFloat(B.split(" ")[2]) || (!e && r.zOrigin) || 0) &&
          (F[pr] = Or(B)),
        (r.xOffset = r.yOffset = 0),
        (r.force3D = q.force3D),
        (r.renderTransform = r.svg ? zr : Be ? Sr : Mr),
        (r.uncache = 0),
        r
      );
    },
    Or = function _firstTwoOnly(t) {
      return (t = t.split(" "))[0] + " " + t[1];
    },
    Mr = function _renderNon3DTransforms(t, e) {
      (e.z = "0px"),
        (e.rotationY = e.rotationX = "0deg"),
        (e.force3D = 0),
        Sr(t, e);
    },
    Pr = "0deg",
    Cr = "0px",
    Ar = ") ",
    Sr = function _renderCSSTransforms(t, e) {
      var r = e || this,
        i = r.xPercent,
        n = r.yPercent,
        a = r.x,
        s = r.y,
        o = r.z,
        u = r.rotation,
        h = r.rotationY,
        l = r.rotationX,
        f = r.skewX,
        d = r.skewY,
        c = r.scaleX,
        p = r.scaleY,
        _ = r.transformPerspective,
        m = r.force3D,
        g = r.target,
        v = r.zOrigin,
        y = "",
        T = ("auto" === m && t && 1 !== t) || !0 === m;
      if (v && (l !== Pr || h !== Pr)) {
        var b,
          w = parseFloat(h) * or,
          x = Math.sin(w),
          k = Math.cos(w);
        (w = parseFloat(l) * or),
          (b = Math.cos(w)),
          (a = oe(g, a, x * b * -v)),
          (s = oe(g, s, -Math.sin(w) * -v)),
          (o = oe(g, o, k * b * -v + v));
      }
      _ !== Cr && (y += "perspective(" + _ + Ar),
        (i || n) && (y += "translate(" + i + "%, " + n + "%) "),
        (!T && a === Cr && s === Cr && o === Cr) ||
          (y +=
            o !== Cr || T
              ? "translate3d(" + a + ", " + s + ", " + o + ") "
              : "translate(" + a + ", " + s + Ar),
        u !== Pr && (y += "rotate(" + u + Ar),
        h !== Pr && (y += "rotateY(" + h + Ar),
        l !== Pr && (y += "rotateX(" + l + Ar),
        (f === Pr && d === Pr) || (y += "skew(" + f + ", " + d + Ar),
        (1 === c && 1 === p) || (y += "scale(" + c + ", " + p + Ar),
        (g.style[cr] = y || "translate(0, 0)");
    },
    zr = function _renderSVGTransforms(t, e) {
      var r,
        i,
        n,
        a,
        s,
        o = e || this,
        u = o.xPercent,
        h = o.yPercent,
        l = o.x,
        f = o.y,
        d = o.rotation,
        c = o.skewX,
        p = o.skewY,
        _ = o.scaleX,
        m = o.scaleY,
        g = o.target,
        v = o.xOrigin,
        y = o.yOrigin,
        T = o.xOffset,
        b = o.yOffset,
        w = o.forceCSS,
        x = parseFloat(l),
        k = parseFloat(f);
      (d = parseFloat(d)),
        (c = parseFloat(c)),
        (p = parseFloat(p)) && ((c += p = parseFloat(p)), (d += p)),
        d || c
          ? ((d *= or),
            (c *= or),
            (r = Math.cos(d) * _),
            (i = Math.sin(d) * _),
            (n = Math.sin(d - c) * -m),
            (a = Math.cos(d - c) * m),
            c &&
              ((p *= or),
              (s = Math.tan(c - p)),
              (n *= s = Math.sqrt(1 + s * s)),
              (a *= s),
              p &&
                ((s = Math.tan(p)), (r *= s = Math.sqrt(1 + s * s)), (i *= s))),
            (r = ia(r)),
            (i = ia(i)),
            (n = ia(n)),
            (a = ia(a)))
          : ((r = _), (a = m), (i = n = 0)),
        ((x && !~(l + "").indexOf("px")) || (k && !~(f + "").indexOf("px"))) &&
          ((x = _d(g, "x", l, "px")), (k = _d(g, "y", f, "px"))),
        (v || y || T || b) &&
          ((x = ia(x + v - (v * r + y * n) + T)),
          (k = ia(k + y - (v * i + y * a) + b))),
        (u || h) &&
          ((s = g.getBBox()),
          (x = ia(x + (u / 100) * s.width)),
          (k = ia(k + (h / 100) * s.height))),
        (s =
          "matrix(" +
          r +
          "," +
          i +
          "," +
          n +
          "," +
          a +
          "," +
          x +
          "," +
          k +
          ")"),
        g.setAttribute("transform", s),
        w && (g.style[cr] = s);
    };
  ha("padding,margin,Width,Radius", function (e, r) {
    var t = "Right",
      i = "Bottom",
      n = "Left",
      o = (r < 3 ? ["Top", t, i, n] : ["Top" + n, "Top" + t, i + t, i + n]).map(
        function (t) {
          return r < 2 ? e + t : "border" + t + e;
        }
      );
    br[1 < r ? "border" + e : e] = function (e, t, r, i, n) {
      var a, s;
      if (arguments.length < 4)
        return (
          (a = o.map(function (t) {
            return yr(e, t, r);
          })),
          5 === (s = a.join(" ")).split(a[0]).length ? a[0] : s
        );
      (a = (i + "").split(" ")),
        (s = {}),
        o.forEach(function (t, e) {
          return (s[t] = a[e] = a[e] || a[((e - 1) / 2) | 0]);
        }),
        e.init(t, s, n);
    };
  });
  var Er,
    Dr,
    Rr,
    Fr = {
      name: "css",
      register: Sd,
      targetTest: function targetTest(t) {
        return t.style && t.nodeType;
      },
      init: function init(t, e, i, n, a) {
        var s,
          o,
          u,
          h,
          l,
          f,
          d,
          c,
          p,
          _,
          m,
          g,
          v,
          y,
          T,
          b,
          w = this._props,
          x = t.style,
          k = i.vars.startAt;
        for (d in (Fe || Sd(),
        (this.styles = this.styles || Md(t)),
        (b = this.styles.props),
        (this.tween = i),
        e))
          if (
            "autoRound" !== d &&
            ((o = e[d]), !pt[d] || !ac(d, e, i, n, t, a))
          )
            if (
              ((l = typeof o),
              (f = br[d]),
              "function" === l && (l = typeof (o = o.call(i, n, t, a))),
              "string" === l && ~o.indexOf("random(") && (o = ob(o)),
              f)
            )
              f(this, t, d, o, i) && (T = 1);
            else if ("--" === d.substr(0, 2))
              (s = (getComputedStyle(t).getPropertyValue(d) + "").trim()),
                (o += ""),
                (Et.lastIndex = 0),
                Et.test(s) || ((c = Ya(s)), (p = Ya(o))),
                p ? c !== p && (s = _d(t, d, s, p) + p) : c && (o += c),
                this.add(x, "setProperty", s, o, n, a, 0, 0, d),
                w.push(d),
                b.push(d, 0, x[d]);
            else if ("undefined" !== l) {
              if (
                (k && d in k
                  ? ((s =
                      "function" == typeof k[d] ? k[d].call(i, n, t, a) : k[d]),
                    r(s) && ~s.indexOf("random(") && (s = ob(s)),
                    Ya(s + "") ||
                      "auto" === s ||
                      (s += q.units[d] || Ya(yr(t, d)) || ""),
                    "=" === (s + "").charAt(1) && (s = yr(t, d)))
                  : (s = yr(t, d)),
                (h = parseFloat(s)),
                (_ = "string" === l && "=" === o.charAt(1) && o.substr(0, 2)) &&
                  (o = o.substr(2)),
                (u = parseFloat(o)),
                d in dr &&
                  ("autoAlpha" === d &&
                    (1 === h &&
                      "hidden" === yr(t, "visibility") &&
                      u &&
                      (h = 0),
                    b.push("visibility", 0, x.visibility),
                    Yd(
                      this,
                      x,
                      "visibility",
                      h ? "inherit" : "hidden",
                      u ? "inherit" : "hidden",
                      !u
                    )),
                  "scale" !== d &&
                    "transform" !== d &&
                    ~(d = dr[d]).indexOf(",") &&
                    (d = d.split(",")[0])),
                (m = d in ar))
              )
                if (
                  (this.styles.save(d),
                  g ||
                    (((v = t._gsap).renderTransform && !e.parseTransform) ||
                      kr(t, e.parseTransform),
                    (y = !1 !== e.smoothOrigin && v.smooth),
                    ((g = this._pt =
                      new _e(
                        this._pt,
                        x,
                        cr,
                        0,
                        1,
                        v.renderTransform,
                        v,
                        0,
                        -1
                      )).dep = 1)),
                  "scale" === d)
                )
                  (this._pt = new _e(
                    this._pt,
                    v,
                    "scaleY",
                    v.scaleY,
                    (_ ? ka(v.scaleY, _ + u) : u) - v.scaleY || 0,
                    vd
                  )),
                    (this._pt.u = 0),
                    w.push("scaleY", d),
                    (d += "X");
                else {
                  if ("transformOrigin" === d) {
                    b.push(pr, 0, x[pr]),
                      (o = de(o)),
                      v.svg
                        ? le(t, o, 0, y, 0, this)
                        : ((p = parseFloat(o.split(" ")[2]) || 0) !==
                            v.zOrigin && Yd(this, v, "zOrigin", v.zOrigin, p),
                          Yd(this, x, d, Or(s), Or(o)));
                    continue;
                  }
                  if ("svgOrigin" === d) {
                    le(t, o, 1, y, 0, this);
                    continue;
                  }
                  if (d in xr) {
                    ve(this, v, d, h, _ ? ka(h, _ + o) : o);
                    continue;
                  }
                  if ("smoothOrigin" === d) {
                    Yd(this, v, "smooth", v.smooth, o);
                    continue;
                  }
                  if ("force3D" === d) {
                    v[d] = o;
                    continue;
                  }
                  if ("transform" === d) {
                    xe(this, o, t);
                    continue;
                  }
                }
              else d in x || (d = mr(d) || d);
              if (
                m ||
                ((u || 0 === u) && (h || 0 === h) && !fr.test(o) && d in x)
              )
                (u = u || 0),
                  (c = (s + "").substr((h + "").length)) !==
                    (p = Ya(o) || (d in q.units ? q.units[d] : c)) &&
                    (h = _d(t, d, s, p)),
                  (this._pt = new _e(
                    this._pt,
                    m ? v : x,
                    d,
                    h,
                    (_ ? ka(h, _ + u) : u) - h,
                    m || ("px" !== p && "zIndex" !== d) || !1 === e.autoRound
                      ? vd
                      : yd
                  )),
                  (this._pt.u = p || 0),
                  c !== p && "%" !== p && ((this._pt.b = s), (this._pt.r = xd));
              else if (d in x) be.call(this, t, d, s, _ ? _ + o : o);
              else if (d in t) this.add(t, d, s || t[d], _ ? _ + o : o, n, a);
              else if ("parseTransform" !== d) {
                Q(d, o);
                continue;
              }
              m ||
                (d in x
                  ? b.push(d, 0, x[d])
                  : "function" == typeof t[d]
                  ? b.push(d, 2, t[d]())
                  : b.push(d, 1, s || t[d])),
                w.push(d);
            }
        T && pe(this);
      },
      render: function render(t, e) {
        if (e.tween._time || !Ye())
          for (var r = e._pt; r; ) r.r(t, r.d), (r = r._next);
        else e.styles.revert();
      },
      get: yr,
      aliases: dr,
      getSetter: function getSetter(t, e, r) {
        var i = dr[e];
        return (
          i && i.indexOf(",") < 0 && (e = i),
          e in ar && e !== pr && (t._gsap.x || yr(t, "x"))
            ? r && Ie === r
              ? "scale" === e
                ? Ed
                : Dd
              : (Ie = r || {}) && ("scale" === e ? Fd : Gd)
            : t.style && !u(t.style[e])
            ? Bd
            : ~e.indexOf("-")
            ? Cd
            : ne(t, e)
        );
      },
      core: { _removeProperty: Xd, _getMatrix: ke },
    };
  (ze.utils.checkPrefix = mr),
    (ze.core.getStyleSaver = Md),
    (Rr = ha(
      (Er = "x,y,z,scale,scaleX,scaleY,xPercent,yPercent") +
        "," +
        (Dr = "rotation,rotationX,rotationY,skewX,skewY") +
        ",transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective",
      function (t) {
        ar[t] = 1;
      }
    )),
    ha(Dr, function (t) {
      (q.units[t] = "deg"), (xr[t] = 1);
    }),
    (dr[Rr[13]] = Er + "," + Dr),
    ha(
      "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY",
      function (t) {
        var e = t.split(":");
        dr[e[1]] = Rr[e[0]];
      }
    ),
    ha(
      "x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",
      function (t) {
        q.units[t] = "px";
      }
    ),
    ze.registerPlugin(Fr);
  var Lr = ze.registerPlugin(Fr) || ze,
    Ir = Lr.core.Tween;
  (e.Back = Ze),
    (e.Bounce = er),
    (e.CSSPlugin = Fr),
    (e.Circ = nr),
    (e.Cubic = Qe),
    (e.Elastic = $e),
    (e.Expo = ir),
    (e.Linear = Ge),
    (e.Power0 = qe),
    (e.Power1 = Ve),
    (e.Power2 = Ue),
    (e.Power3 = Xe),
    (e.Power4 = Ne),
    (e.Quad = We),
    (e.Quart = Ke),
    (e.Quint = Je),
    (e.Sine = rr),
    (e.SteppedEase = tr),
    (e.Strong = He),
    (e.TimelineLite = Xt),
    (e.TimelineMax = Xt),
    (e.TweenLite = $t),
    (e.TweenMax = Ir),
    (e.default = Lr),
    (e.gsap = Lr);
  if (typeof window === "undefined" || window !== e) {
    Object.defineProperty(e, "__esModule", { value: !0 });
  } else {
    delete e.default;
  }
});

/*!
 * ScrollSmoother 3.12.7
 * https://gsap.com
 *
 * @license Copyright 2025, GreenSock. All rights reserved.
 * This plugin is a membership benefit of Club GSAP and is only authorized for use in sites/apps/products developed by individuals/companies with an active Club GSAP membership. See https://gsap.com/pricing
 * @author: Jack Doyle, jack@greensock.com
 */

!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? t(exports)
    : "function" == typeof define && define.amd
    ? define(["exports"], t)
    : t(((e = e || self).window = e.window || {}));
})(this, function (e) {
  "use strict";
  function _defineProperties(e, t) {
    for (var r = 0; r < t.length; r++) {
      var n = t[r];
      (n.enumerable = n.enumerable || !1),
        (n.configurable = !0),
        "value" in n && (n.writable = !0),
        Object.defineProperty(e, n.key, n);
    }
  }
  function s() {
    return "undefined" != typeof window;
  }
  function t() {
    return I || (s() && (I = window.gsap) && I.registerPlugin && I);
  }
  function v(e) {
    return Y.maxScroll(e || U);
  }
  var I,
    D,
    U,
    j,
    G,
    K,
    q,
    V,
    Y,
    Q,
    W,
    J,
    X,
    Z,
    $,
    r =
      ((ScrollSmoother.register = function register(e) {
        return (
          D ||
            ((I = e || t()),
            s() &&
              window.document &&
              ((U = window),
              (j = document),
              (G = j.documentElement),
              (K = j.body)),
            I &&
              ((q = I.utils.toArray),
              (V = I.utils.clamp),
              (W = I.parseEase("expo")),
              (Z = I.core.context || function () {}),
              (Y = I.core.globals().ScrollTrigger),
              I.core.globals("ScrollSmoother", ScrollSmoother),
              K &&
                Y &&
                (($ = I.delayedCall(0.2, function () {
                  return Y.isRefreshing || (Q && Q.refresh());
                }).pause()),
                (J = Y.core._getVelocityProp),
                (X = Y.core._inputObserver),
                (ScrollSmoother.refresh = Y.refresh),
                (D = 1)))),
          D
        );
      }),
      (function _createClass(e, t, r) {
        return (
          t && _defineProperties(e.prototype, t),
          r && _defineProperties(e, r),
          e
        );
      })(ScrollSmoother, [
        {
          key: "progress",
          get: function get() {
            return this.scrollTrigger
              ? this.scrollTrigger.animation._time / 100
              : 0;
          },
        },
      ]),
      ScrollSmoother);
  function ScrollSmoother(t) {
    var o = this;
    D ||
      ScrollSmoother.register(I) ||
      console.warn("Please gsap.registerPlugin(ScrollSmoother)"),
      (t = this.vars = t || {}),
      Q && Q.kill(),
      Z((Q = this));
    function Ba() {
      return z.update(-N);
    }
    function Da() {
      return (n.style.overflow = "visible");
    }
    function Fa(e) {
      e.update();
      var t = e.getTween();
      t && (t.pause(), (t._time = t._dur), (t._tTime = t._tDur)),
        (g = !1),
        e.animation.progress(e.progress, !0);
    }
    function Ga(e, t) {
      ((e !== N && !f) || t) &&
        (x && (e = Math.round(e)),
        H &&
          ((n.style.transform =
            "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + e + ", 0, 1)"),
          (n._gsap.y = e + "px")),
        (F = e - N),
        (N = e),
        Y.isUpdating || ScrollSmoother.isRefreshing || Y.update());
    }
    function Ha(e) {
      return arguments.length
        ? (e < 0 && (e = 0),
          (B.y = -e),
          (g = !0),
          f ? (N = -e) : Ga(-e),
          Y.isRefreshing ? i.update() : k(e / A),
          this)
        : -N;
    }
    function Ka(e) {
      (S.scrollTop = 0),
        (e.target.contains && e.target.contains(S)) ||
          (C && !1 === C(o, e)) ||
          (Y.isInViewport(e.target) ||
            e.target === p ||
            o.scrollTo(e.target, !1, "center center"),
          (p = e.target));
    }
    function La(t, e) {
      if (t < e.start) return t;
      var r = isNaN(e.ratio) ? 1 : e.ratio,
        n = e.end - e.start,
        o = t - e.start,
        i = e.offset || 0,
        s = e.pins || [],
        a = s.offset || 0,
        l =
          (e._startClamp && e.start <= 0) || (e.pins && e.pins.offset)
            ? 0
            : e._endClamp && e.end === v()
            ? 1
            : 0.5;
      return (
        s.forEach(function (e) {
          (n -= e.distance), e.nativeStart <= t && (o -= e.distance);
        }),
        a && (o *= (n - a / r) / n),
        t + (o - i * l) / r - o
      );
    }
    function Na(t, r) {
      b.forEach(function (e) {
        return (function adjustEffectRelatedTriggers(e, t, r) {
          r || (e.pins.length = e.pins.offset = 0);
          var n,
            o,
            i,
            s,
            a,
            l,
            c,
            f,
            u = e.pins,
            h = e.markers;
          for (c = 0; c < t.length; c++)
            if (
              ((f = t[c]),
              e.trigger &&
                f.trigger &&
                e !== f &&
                (f.trigger === e.trigger ||
                  f.pinnedContainer === e.trigger ||
                  e.trigger.contains(f.trigger)) &&
                ((a = f._startNative || f._startClamp || f.start),
                (l = f._endNative || f._endClamp || f.end),
                (i = La(a, e)),
                (s = f.pin && 0 < l ? i + (l - a) : La(l, e)),
                f.setPositions(
                  i,
                  s,
                  !0,
                  (f._startClamp ? Math.max(0, i) : i) - a
                ),
                f.markerStart &&
                  h.push(
                    I.quickSetter([f.markerStart, f.markerEnd], "y", "px")
                  ),
                f.pin && 0 < f.end && !r))
            ) {
              if (((n = f.end - f.start), (o = e._startClamp && f.start < 0))) {
                if (0 < e.start)
                  return (
                    e.setPositions(0, e.end + (e._startNative - e.start), !0),
                    void adjustEffectRelatedTriggers(e, t)
                  );
                (n += f.start), (u.offset = -f.start);
              }
              u.push({
                start: f.start,
                nativeStart: a,
                end: f.end,
                distance: n,
                trig: f,
              }),
                e.setPositions(e.start, e.end + (o ? -f.start : n), !0);
            }
        })(e, t, r);
      });
    }
    function Oa() {
      (G = j.documentElement),
        (K = j.body),
        Da(),
        requestAnimationFrame(Da),
        b &&
          (Y.getAll().forEach(function (e) {
            (e._startNative = e.start), (e._endNative = e.end);
          }),
          b.forEach(function (e) {
            var t = e._startClamp || e.start,
              r = e.autoSpeed
                ? Math.min(v(), e.end)
                : t + Math.abs((e.end - t) / e.ratio),
              n = r - e.end;
            if ((r -= n / 2) < (t -= n / 2)) {
              var o = t;
              (t = r), (r = o);
            }
            e._startClamp && t < 0
              ? ((n = (r = e.ratio < 0 ? v() : e.end / e.ratio) - e.end),
                (t = 0))
              : (e.ratio < 0 || (e._endClamp && r >= v())) &&
                (n =
                  ((r = v()) -
                    (t =
                      e.ratio < 0 || 1 < e.ratio
                        ? 0
                        : r - (r - e.start) / e.ratio)) *
                    e.ratio -
                  (e.end - e.start)),
              (e.offset = n || 1e-4),
              (e.pins.length = e.pins.offset = 0),
              e.setPositions(t, r, !0);
          }),
          Na(Y.sort())),
        z.reset();
    }
    function Pa() {
      return Y.addEventListener("refresh", Oa);
    }
    function Qa() {
      return (
        b &&
        b.forEach(function (e) {
          return e.vars.onRefresh(e);
        })
      );
    }
    function Ra() {
      return (
        b &&
          b.forEach(function (e) {
            return e.vars.onRefreshInit(e);
          }),
        Qa
      );
    }
    function Sa(r, n, o, i) {
      return function () {
        var e = "function" == typeof n ? n(o, i) : n;
        e ||
          0 === e ||
          (e = i.getAttribute("data-" + E + r) || ("speed" === r ? 1 : 0)),
          i.setAttribute("data-" + E + r, e);
        var t = "clamp(" === (e + "").substr(0, 6);
        return { clamp: t, value: t ? e.substr(6, e.length - 7) : e };
      };
    }
    function Ta(r, e, t, n, o) {
      function cc() {
        (e = u()),
          (t = parseFloat(h().value)),
          (i = parseFloat(e.value) || 1),
          (a = "auto" === e.value),
          (c =
            a || (s && s._startClamp && s.start <= 0) || p.offset
              ? 0
              : s && s._endClamp && s.end === v()
              ? 1
              : 0.5),
          l && l.kill(),
          (l = t && I.to(r, { ease: W, overwrite: !1, y: "+=0", duration: t })),
          s && ((s.ratio = i), (s.autoSpeed = a));
      }
      function dc() {
        (g.y = d + "px"), g.renderTransform(1), cc();
      }
      function gc(e) {
        if (a) {
          dc();
          var t = (function _autoDistance(e, t) {
            var r,
              n,
              o = e.parentNode || G,
              i = e.getBoundingClientRect(),
              s = o.getBoundingClientRect(),
              a = s.top - i.top,
              l = s.bottom - i.bottom,
              c = (Math.abs(a) > Math.abs(l) ? a : l) / (1 - t),
              f = -c * t;
            return (
              0 < c &&
                ((n =
                  0.5 == (r = s.height / (U.innerHeight + s.height))
                    ? 2 * s.height
                    : 2 *
                      Math.min(s.height, Math.abs((-c * r) / (2 * r - 1))) *
                      (t || 1)),
                (f += t ? -n * t : -n / 2),
                (c += n)),
              { change: c, offset: f }
            );
          })(r, V(0, 1, -e.start / (e.end - e.start)));
          (y = t.change), (f = t.offset);
        } else (f = p.offset || 0), (y = (e.end - e.start - f) * (1 - i));
        p.forEach(function (e) {
          return (y -= e.distance * (1 - i));
        }),
          (e.offset = y || 0.001),
          e.vars.onUpdate(e),
          l && l.progress(1);
      }
      o = ("function" == typeof o ? o(n, r) : o) || 0;
      var i,
        s,
        a,
        l,
        c,
        f,
        u = Sa("speed", e, n, r),
        h = Sa("lag", t, n, r),
        d = I.getProperty(r, "y"),
        g = r._gsap,
        p = [],
        m = [],
        y = 0;
      return (
        cc(),
        (1 !== i || a || l) &&
          (gc(
            (s = Y.create({
              trigger: a ? r.parentNode : r,
              start: function start() {
                return e.clamp
                  ? "clamp(top bottom+=" + o + ")"
                  : "top bottom+=" + o;
              },
              end: function end() {
                return e.value < 0
                  ? "max"
                  : e.clamp
                  ? "clamp(bottom top-=" + o + ")"
                  : "bottom top-=" + o;
              },
              scroller: S,
              scrub: !0,
              refreshPriority: -999,
              onRefreshInit: dc,
              onRefresh: gc,
              onKill: function onKill(e) {
                var t = b.indexOf(e);
                0 <= t && b.splice(t, 1), dc();
              },
              onUpdate: function onUpdate(e) {
                var t,
                  r,
                  n,
                  o = d + y * (e.progress - c),
                  i = p.length,
                  s = 0;
                if (e.offset) {
                  if (i) {
                    for (r = -N, n = e.end; i--; ) {
                      if (
                        (t = p[i]).trig.isActive ||
                        (r >= t.start && r <= t.end)
                      )
                        return void (
                          l &&
                          ((t.trig.progress +=
                            t.trig.direction < 0 ? 0.001 : -0.001),
                          t.trig.update(0, 0, 1),
                          l.resetTo("y", parseFloat(g.y), -F, !0),
                          M && l.progress(1))
                        );
                      r > t.end && (s += t.distance), (n -= t.distance);
                    }
                    o =
                      d +
                      s +
                      y *
                        ((I.utils.clamp(e.start, e.end, r) - e.start - s) /
                          (n - e.start) -
                          c);
                  }
                  m.length &&
                    !a &&
                    m.forEach(function (e) {
                      return e(o - s);
                    }),
                    (o = (function _round(e) {
                      return Math.round(1e5 * e) / 1e5 || 0;
                    })(o + f)),
                    l
                      ? (l.resetTo("y", o, -F, !0), M && l.progress(1))
                      : ((g.y = o + "px"), g.renderTransform(1));
                }
              },
            }))
          ),
          (I.core.getCache(s.trigger).stRevert = Ra),
          (s.startY = d),
          (s.pins = p),
          (s.markers = m),
          (s.ratio = i),
          (s.autoSpeed = a),
          (r.style.willChange = "transform")),
        s
      );
    }
    var n,
      S,
      e,
      i,
      b,
      s,
      a,
      l,
      c,
      f,
      r,
      u,
      h,
      d,
      g,
      p,
      m = t.smoothTouch,
      w = t.onUpdate,
      T = t.onStop,
      _ = t.smooth,
      C = t.onFocusIn,
      P = t.normalizeScroll,
      x = t.wholePixels,
      R = this,
      E = t.effectsPrefix || "",
      k = Y.getScrollFunc(U),
      H =
        1 === Y.isTouch
          ? !0 === m
            ? 0.8
            : parseFloat(m) || 0
          : 0 === _ || !1 === _
          ? 0
          : parseFloat(_) || 0.8,
      A = (H && +t.speed) || 1,
      N = 0,
      F = 0,
      M = 1,
      z = J(0),
      B = { y: 0 },
      L =
        "undefined" != typeof ResizeObserver &&
        !1 !== t.autoResize &&
        new ResizeObserver(function () {
          if (!Y.isRefreshing) {
            var e = v(S) * A;
            e < -N && Ha(e), $.restart(!0);
          }
        });
    function refreshHeight() {
      return (
        (e = n.clientHeight),
        (n.style.overflow = "visible"),
        (K.style.height = U.innerHeight + (e - U.innerHeight) / A + "px"),
        e - U.innerHeight
      );
    }
    Pa(),
      Y.addEventListener("killAll", Pa),
      I.delayedCall(0.5, function () {
        return (M = 0);
      }),
      (this.scrollTop = Ha),
      (this.scrollTo = function (e, t, r) {
        var n = I.utils.clamp(
          0,
          v(),
          isNaN(e) ? o.offset(e, r, !!t && !f) : +e
        );
        t
          ? f
            ? I.to(o, { duration: H, scrollTop: n, overwrite: "auto", ease: W })
            : k(n)
          : Ha(n);
      }),
      (this.offset = function (e, t, r) {
        var n,
          o = (e = q(e)[0]).style.cssText,
          i = Y.create({ trigger: e, start: t || "top top" });
        return (
          b && (M ? Y.refresh() : Na([i], !0)),
          (n = i.start / (r ? A : 1)),
          i.kill(!1),
          (e.style.cssText = o),
          (I.core.getCache(e).uncache = 1),
          n
        );
      }),
      (this.content = function (e) {
        if (arguments.length) {
          var t =
            q(e || "#smooth-content")[0] ||
            console.warn("ScrollSmoother needs a valid content element.") ||
            K.children[0];
          return (
            t !== n &&
              ((c = (n = t).getAttribute("style") || ""),
              L && L.observe(n),
              I.set(n, {
                overflow: "visible",
                width: "100%",
                boxSizing: "border-box",
                y: "+=0",
              }),
              H || I.set(n, { clearProps: "transform" })),
            this
          );
        }
        return n;
      }),
      (this.wrapper = function (e) {
        return arguments.length
          ? ((S =
              q(e || "#smooth-wrapper")[0] ||
              (function _wrap(e) {
                var t = j.querySelector(".ScrollSmoother-wrapper");
                return (
                  t ||
                    ((t = j.createElement("div")).classList.add(
                      "ScrollSmoother-wrapper"
                    ),
                    e.parentNode.insertBefore(t, e),
                    t.appendChild(e)),
                  t
                );
              })(n)),
            (l = S.getAttribute("style") || ""),
            refreshHeight(),
            I.set(
              S,
              H
                ? {
                    overflow: "hidden",
                    position: "fixed",
                    height: "100%",
                    width: "100%",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }
                : {
                    overflow: "visible",
                    position: "relative",
                    width: "100%",
                    height: "auto",
                    top: "auto",
                    bottom: "auto",
                    left: "auto",
                    right: "auto",
                  }
            ),
            this)
          : S;
      }),
      (this.effects = function (e, t) {
        if (((b = b || []), !e)) return b.slice(0);
        (e = q(e)).forEach(function (e) {
          for (var t = b.length; t--; ) b[t].trigger === e && b[t].kill();
        });
        t = t || {};
        var r,
          n,
          o = t.speed,
          i = t.lag,
          s = t.effectsPadding,
          a = [];
        for (r = 0; r < e.length; r++) (n = Ta(e[r], o, i, r, s)) && a.push(n);
        return b.push.apply(b, a), !1 !== t.refresh && Y.refresh(), a;
      }),
      (this.sections = function (e, t) {
        if (((s = s || []), !e)) return s.slice(0);
        var r = q(e).map(function (t) {
          return Y.create({
            trigger: t,
            start: "top 120%",
            end: "bottom -20%",
            onToggle: function onToggle(e) {
              (t.style.opacity = e.isActive ? "1" : "0"),
                (t.style.pointerEvents = e.isActive ? "all" : "none");
            },
          });
        });
        return t && t.add ? s.push.apply(s, r) : (s = r.slice(0)), r;
      }),
      this.content(t.content),
      this.wrapper(t.wrapper),
      (this.render = function (e) {
        return Ga(e || 0 === e ? e : N);
      }),
      (this.getVelocity = function () {
        return z.getVelocity(-N);
      }),
      Y.scrollerProxy(S, {
        scrollTop: Ha,
        scrollHeight: function scrollHeight() {
          return refreshHeight() && K.scrollHeight;
        },
        fixedMarkers: !1 !== t.fixedMarkers && !!H,
        content: n,
        getBoundingClientRect: function getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: U.innerWidth,
            height: U.innerHeight,
          };
        },
      }),
      Y.defaults({ scroller: S });
    var O = Y.getAll().filter(function (e) {
      return e.scroller === U || e.scroller === S;
    });
    O.forEach(function (e) {
      return e.revert(!0, !0);
    }),
      (i = Y.create({
        animation: I.fromTo(
          B,
          {
            y: function y() {
              return (d = 0);
            },
          },
          {
            y: function y() {
              return (d = 1), -refreshHeight();
            },
            immediateRender: !1,
            ease: "none",
            data: "ScrollSmoother",
            duration: 100,
            onUpdate: function onUpdate() {
              if (d) {
                var e = g;
                e && (Fa(i), (B.y = N)), Ga(B.y, e), Ba(), w && !f && w(R);
              }
            },
          }
        ),
        onRefreshInit: function onRefreshInit(e) {
          if (!ScrollSmoother.isRefreshing) {
            if (((ScrollSmoother.isRefreshing = !0), b)) {
              var t = Y.getAll().filter(function (e) {
                return !!e.pin;
              });
              b.forEach(function (r) {
                r.vars.pinnedContainer ||
                  t.forEach(function (e) {
                    if (e.pin.contains(r.trigger)) {
                      var t = r.vars;
                      (t.pinnedContainer = e.pin),
                        (r.vars = null),
                        r.init(t, r.animation);
                    }
                  });
              });
            }
            var r = e.getTween();
            (h = r && r._end > r._dp._time),
              (u = N),
              (B.y = 0),
              H &&
                (1 === Y.isTouch && (S.style.position = "absolute"),
                (S.scrollTop = 0),
                1 === Y.isTouch && (S.style.position = "fixed"));
          }
        },
        onRefresh: function onRefresh(e) {
          e.animation.invalidate(),
            e.setPositions(e.start, refreshHeight() / A),
            h || Fa(e),
            (B.y = -k() * A),
            Ga(B.y),
            M ||
              (h && (g = !1),
              e.animation.progress(I.utils.clamp(0, 1, u / A / -e.end))),
            h && ((e.progress -= 0.001), e.update()),
            (ScrollSmoother.isRefreshing = !1);
        },
        id: "ScrollSmoother",
        scroller: U,
        invalidateOnRefresh: !0,
        start: 0,
        refreshPriority: -9999,
        end: function end() {
          return refreshHeight() / A;
        },
        onScrubComplete: function onScrubComplete() {
          z.reset(), T && T(o);
        },
        scrub: H || !0,
      })),
      (this.smooth = function (e) {
        return (
          arguments.length &&
            ((A = ((H = e || 0) && +t.speed) || 1), i.scrubDuration(e)),
          i.getTween() ? i.getTween().duration() : 0
        );
      }),
      i.getTween() && (i.getTween().vars.ease = t.ease || W),
      (this.scrollTrigger = i),
      t.effects &&
        this.effects(
          !0 === t.effects
            ? "[data-" + E + "speed], [data-" + E + "lag]"
            : t.effects,
          { effectsPadding: t.effectsPadding, refresh: !1 }
        ),
      t.sections &&
        this.sections(!0 === t.sections ? "[data-section]" : t.sections),
      O.forEach(function (e) {
        (e.vars.scroller = S), e.revert(!1, !0), e.init(e.vars, e.animation);
      }),
      (this.paused = function (e, t) {
        return arguments.length
          ? (!!f !== e &&
              (e
                ? (i.getTween() && i.getTween().pause(),
                  k(-N / A),
                  z.reset(),
                  (r = Y.normalizeScroll()) && r.disable(),
                  ((f = Y.observe({
                    preventDefault: !0,
                    type: "wheel,touch,scroll",
                    debounce: !1,
                    allowClicks: !0,
                    onChangeY: function onChangeY() {
                      return Ha(-N);
                    },
                  })).nested = X(G, "wheel,touch,scroll", !0, !1 !== t)))
                : (f.nested.kill(),
                  f.kill(),
                  (f = 0),
                  r && r.enable(),
                  (i.progress = (-N / A - i.start) / (i.end - i.start)),
                  Fa(i))),
            this)
          : !!f;
      }),
      (this.kill = this.revert =
        function () {
          o.paused(!1), Fa(i), i.kill();
          for (var e = (b || []).concat(s || []), t = e.length; t--; )
            e[t].kill();
          Y.scrollerProxy(S),
            Y.removeEventListener("killAll", Pa),
            Y.removeEventListener("refresh", Oa),
            (S.style.cssText = l),
            (n.style.cssText = c);
          var r = Y.defaults({});
          r && r.scroller === S && Y.defaults({ scroller: U }),
            o.normalizer && Y.normalizeScroll(!1),
            clearInterval(a),
            (Q = null),
            L && L.disconnect(),
            K.style.removeProperty("height"),
            U.removeEventListener("focusin", Ka);
        }),
      (this.refresh = function (e, t) {
        return i.refresh(e, t);
      }),
      P &&
        (this.normalizer = Y.normalizeScroll(
          !0 === P ? { debounce: !0, content: !H && n } : P
        )),
      Y.config(t),
      "scrollBehavior" in U.getComputedStyle(K) &&
        I.set([K, G], { scrollBehavior: "auto" }),
      U.addEventListener("focusin", Ka),
      (a = setInterval(Ba, 250)),
      "loading" === j.readyState ||
        requestAnimationFrame(function () {
          return Y.refresh();
        });
  }
  (r.version = "3.12.7"),
    (r.create = function (e) {
      return Q && e && Q.content() === q(e.content)[0] ? Q : new r(e);
    }),
    (r.get = function () {
      return Q;
    }),
    t() && I.registerPlugin(r),
    (e.ScrollSmoother = r),
    (e.default = r);
  if (typeof window === "undefined" || window !== e) {
    Object.defineProperty(e, "__esModule", { value: !0 });
  } else {
    delete e.default;
  }
});

/*!
 * ScrollTrigger 3.12.7
 * https://gsap.com
 *
 * @license Copyright 2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */

!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? t(exports)
    : "function" == typeof define && define.amd
    ? define(["exports"], t)
    : t(((e = e || self).window = e.window || {}));
})(this, function (e) {
  "use strict";
  function _defineProperties(e, t) {
    for (var r = 0; r < t.length; r++) {
      var n = t[r];
      (n.enumerable = n.enumerable || !1),
        (n.configurable = !0),
        "value" in n && (n.writable = !0),
        Object.defineProperty(e, n.key, n);
    }
  }
  function r() {
    return (
      Te ||
      ("undefined" != typeof window &&
        (Te = window.gsap) &&
        Te.registerPlugin &&
        Te)
    );
  }
  function z(e, t) {
    return ~Ie.indexOf(e) && Ie[Ie.indexOf(e) + 1][t];
  }
  function A(e) {
    return !!~t.indexOf(e);
  }
  function B(e, t, r, n, i) {
    return e.addEventListener(t, r, { passive: !1 !== n, capture: !!i });
  }
  function C(e, t, r, n) {
    return e.removeEventListener(t, r, !!n);
  }
  function F() {
    return (De && De.isPressed) || qe.cache++;
  }
  function G(r, n) {
    function dd(e) {
      if (e || 0 === e) {
        i && (Se.history.scrollRestoration = "manual");
        var t = De && De.isPressed;
        (e = dd.v = Math.round(e) || (De && De.iOS ? 1 : 0)),
          r(e),
          (dd.cacheID = qe.cache),
          t && o("ss", e);
      } else (n || qe.cache !== dd.cacheID || o("ref")) && ((dd.cacheID = qe.cache), (dd.v = r()));
      return dd.v + dd.offset;
    }
    return (dd.offset = 0), r && dd;
  }
  function J(e, t) {
    return (
      ((t && t._ctx && t._ctx.selector) || Te.utils.toArray)(e)[0] ||
      ("string" == typeof e && !1 !== Te.config().nullTargetWarn
        ? console.warn("Element not found:", e)
        : null)
    );
  }
  function K(t, e) {
    var r = e.s,
      n = e.sc;
    A(t) && (t = ke.scrollingElement || Ee);
    var i = qe.indexOf(t),
      o = n === ze.sc ? 1 : 2;
    ~i || (i = qe.push(t) - 1), qe[i + o] || B(t, "scroll", F);
    var a = qe[i + o],
      s =
        a ||
        (qe[i + o] =
          G(z(t, r), !0) ||
          (A(t)
            ? n
            : G(function (e) {
                return arguments.length ? (t[r] = e) : t[r];
              })));
    return (
      (s.target = t),
      a || (s.smooth = "smooth" === Te.getProperty(t, "scrollBehavior")),
      s
    );
  }
  function L(e, t, i) {
    function Cd(e, t) {
      var r = Ye();
      t || n < r - s
        ? ((a = o), (o = e), (l = s), (s = r))
        : i
        ? (o += e)
        : (o = a + ((e - a) / (r - l)) * (s - l));
    }
    var o = e,
      a = e,
      s = Ye(),
      l = s,
      n = t || 50,
      c = Math.max(500, 3 * n);
    return {
      update: Cd,
      reset: function reset() {
        (a = o = i ? 0 : o), (l = s = 0);
      },
      getVelocity: function getVelocity(e) {
        var t = l,
          r = a,
          n = Ye();
        return (
          (!e && 0 !== e) || e === o || Cd(e),
          s === l || c < n - l
            ? 0
            : ((o + (i ? r : -r)) / ((i ? n : s) - t)) * 1e3
        );
      },
    };
  }
  function M(e, t) {
    return (
      t && !e._gsapAllow && e.preventDefault(),
      e.changedTouches ? e.changedTouches[0] : e
    );
  }
  function N(e) {
    var t = Math.max.apply(Math, e),
      r = Math.min.apply(Math, e);
    return Math.abs(t) >= Math.abs(r) ? t : r;
  }
  function O() {
    (Ae = Te.core.globals().ScrollTrigger) &&
      Ae.core &&
      (function _integrate() {
        var e = Ae.core,
          r = e.bridge || {},
          t = e._scrollers,
          n = e._proxies;
        t.push.apply(t, qe),
          n.push.apply(n, Ie),
          (qe = t),
          (Ie = n),
          (o = function _bridge(e, t) {
            return r[e](t);
          });
      })();
  }
  function P(e) {
    return (
      (Te = e || r()),
      !Ce &&
        Te &&
        "undefined" != typeof document &&
        document.body &&
        ((Se = window),
        (Ee = (ke = document).documentElement),
        (Pe = ke.body),
        (t = [Se, ke, Ee, Pe]),
        Te.utils.clamp,
        (Re = Te.core.context || function () {}),
        (Oe = "onpointerenter" in Pe ? "pointer" : "mouse"),
        (Me = k.isTouch =
          Se.matchMedia &&
          Se.matchMedia("(hover: none), (pointer: coarse)").matches
            ? 1
            : "ontouchstart" in Se ||
              0 < navigator.maxTouchPoints ||
              0 < navigator.msMaxTouchPoints
            ? 2
            : 0),
        (Be = k.eventTypes =
          (
            "ontouchstart" in Ee
              ? "touchstart,touchmove,touchcancel,touchend"
              : "onpointerdown" in Ee
              ? "pointerdown,pointermove,pointercancel,pointerup"
              : "mousedown,mousemove,mouseup,mouseup"
          ).split(",")),
        setTimeout(function () {
          return (i = 0);
        }, 500),
        O(),
        (Ce = 1)),
      Ce
    );
  }
  var Te,
    Ce,
    Se,
    ke,
    Ee,
    Pe,
    Me,
    Oe,
    Ae,
    t,
    De,
    Be,
    Re,
    i = 1,
    Le = [],
    qe = [],
    Ie = [],
    Ye = Date.now,
    o = function _bridge(e, t) {
      return t;
    },
    n = "scrollLeft",
    a = "scrollTop",
    Fe = {
      s: n,
      p: "left",
      p2: "Left",
      os: "right",
      os2: "Right",
      d: "width",
      d2: "Width",
      a: "x",
      sc: G(function (e) {
        return arguments.length
          ? Se.scrollTo(e, ze.sc())
          : Se.pageXOffset || ke[n] || Ee[n] || Pe[n] || 0;
      }),
    },
    ze = {
      s: a,
      p: "top",
      p2: "Top",
      os: "bottom",
      os2: "Bottom",
      d: "height",
      d2: "Height",
      a: "y",
      op: Fe,
      sc: G(function (e) {
        return arguments.length
          ? Se.scrollTo(Fe.sc(), e)
          : Se.pageYOffset || ke[a] || Ee[a] || Pe[a] || 0;
      }),
    };
  (Fe.op = ze), (qe.cache = 0);
  var k =
    ((Observer.prototype.init = function init(e) {
      Ce || P(Te) || console.warn("Please gsap.registerPlugin(Observer)"),
        Ae || O();
      var i = e.tolerance,
        a = e.dragMinimum,
        t = e.type,
        o = e.target,
        r = e.lineHeight,
        n = e.debounce,
        s = e.preventDefault,
        l = e.onStop,
        c = e.onStopDelay,
        u = e.ignore,
        f = e.wheelSpeed,
        d = e.event,
        p = e.onDragStart,
        g = e.onDragEnd,
        h = e.onDrag,
        v = e.onPress,
        b = e.onRelease,
        m = e.onRight,
        y = e.onLeft,
        x = e.onUp,
        w = e.onDown,
        _ = e.onChangeX,
        T = e.onChangeY,
        S = e.onChange,
        k = e.onToggleX,
        E = e.onToggleY,
        D = e.onHover,
        R = e.onHoverEnd,
        q = e.onMove,
        I = e.ignoreCheck,
        Y = e.isNormalizer,
        z = e.onGestureStart,
        H = e.onGestureEnd,
        X = e.onWheel,
        W = e.onEnable,
        V = e.onDisable,
        U = e.onClick,
        G = e.scrollSpeed,
        j = e.capture,
        Q = e.allowClicks,
        Z = e.lockAxis,
        $ = e.onLockAxis;
      function cf() {
        return (xe = Ye());
      }
      function df(e, t) {
        return (
          ((se.event = e) && u && ~u.indexOf(e.target)) ||
          (t && he && "touch" !== e.pointerType) ||
          (I && I(e, t))
        );
      }
      function ff() {
        var e = (se.deltaX = N(me)),
          t = (se.deltaY = N(ye)),
          r = Math.abs(e) >= i,
          n = Math.abs(t) >= i;
        S && (r || n) && S(se, e, t, me, ye),
          r &&
            (m && 0 < se.deltaX && m(se),
            y && se.deltaX < 0 && y(se),
            _ && _(se),
            k && se.deltaX < 0 != le < 0 && k(se),
            (le = se.deltaX),
            (me[0] = me[1] = me[2] = 0)),
          n &&
            (w && 0 < se.deltaY && w(se),
            x && se.deltaY < 0 && x(se),
            T && T(se),
            E && se.deltaY < 0 != ce < 0 && E(se),
            (ce = se.deltaY),
            (ye[0] = ye[1] = ye[2] = 0)),
          (ne || re) &&
            (q && q(se),
            re && (p && 1 === re && p(se), h && h(se), (re = 0)),
            (ne = !1)),
          oe && !(oe = !1) && $ && $(se),
          ie && (X(se), (ie = !1)),
          (ee = 0);
      }
      function gf(e, t, r) {
        (me[r] += e),
          (ye[r] += t),
          se._vx.update(e),
          se._vy.update(t),
          n ? (ee = ee || requestAnimationFrame(ff)) : ff();
      }
      function hf(e, t) {
        Z &&
          !ae &&
          ((se.axis = ae = Math.abs(e) > Math.abs(t) ? "x" : "y"), (oe = !0)),
          "y" !== ae && ((me[2] += e), se._vx.update(e, !0)),
          "x" !== ae && ((ye[2] += t), se._vy.update(t, !0)),
          n ? (ee = ee || requestAnimationFrame(ff)) : ff();
      }
      function jf(e) {
        if (!df(e, 1)) {
          var t = (e = M(e, s)).clientX,
            r = e.clientY,
            n = t - se.x,
            i = r - se.y,
            o = se.isDragging;
          (se.x = t),
            (se.y = r),
            (o ||
              ((n || i) &&
                (Math.abs(se.startX - t) >= a ||
                  Math.abs(se.startY - r) >= a))) &&
              ((re = o ? 2 : 1), o || (se.isDragging = !0), hf(n, i));
        }
      }
      function mf(e) {
        return (
          e.touches &&
          1 < e.touches.length &&
          (se.isGesturing = !0) &&
          z(e, se.isDragging)
        );
      }
      function nf() {
        return (se.isGesturing = !1) || H(se);
      }
      function of(e) {
        if (!df(e)) {
          var t = fe(),
            r = de();
          gf((t - pe) * G, (r - ge) * G, 1),
            (pe = t),
            (ge = r),
            l && te.restart(!0);
        }
      }
      function pf(e) {
        if (!df(e)) {
          (e = M(e, s)), X && (ie = !0);
          var t =
            (1 === e.deltaMode ? r : 2 === e.deltaMode ? Se.innerHeight : 1) *
            f;
          gf(e.deltaX * t, e.deltaY * t, 0), l && !Y && te.restart(!0);
        }
      }
      function qf(e) {
        if (!df(e)) {
          var t = e.clientX,
            r = e.clientY,
            n = t - se.x,
            i = r - se.y;
          (se.x = t),
            (se.y = r),
            (ne = !0),
            l && te.restart(!0),
            (n || i) && hf(n, i);
        }
      }
      function rf(e) {
        (se.event = e), D(se);
      }
      function sf(e) {
        (se.event = e), R(se);
      }
      function tf(e) {
        return df(e) || (M(e, s) && U(se));
      }
      (this.target = o = J(o) || Ee),
        (this.vars = e),
        (u = u && Te.utils.toArray(u)),
        (i = i || 1e-9),
        (a = a || 0),
        (f = f || 1),
        (G = G || 1),
        (t = t || "wheel,touch,pointer"),
        (n = !1 !== n),
        (r = r || parseFloat(Se.getComputedStyle(Pe).lineHeight) || 22);
      var ee,
        te,
        re,
        ne,
        ie,
        oe,
        ae,
        se = this,
        le = 0,
        ce = 0,
        ue = e.passive || (!s && !1 !== e.passive),
        fe = K(o, Fe),
        de = K(o, ze),
        pe = fe(),
        ge = de(),
        he =
          ~t.indexOf("touch") &&
          !~t.indexOf("pointer") &&
          "pointerdown" === Be[0],
        ve = A(o),
        be = o.ownerDocument || ke,
        me = [0, 0, 0],
        ye = [0, 0, 0],
        xe = 0,
        we = (se.onPress = function (e) {
          df(e, 1) ||
            (e && e.button) ||
            ((se.axis = ae = null),
            te.pause(),
            (se.isPressed = !0),
            (e = M(e)),
            (le = ce = 0),
            (se.startX = se.x = e.clientX),
            (se.startY = se.y = e.clientY),
            se._vx.reset(),
            se._vy.reset(),
            B(Y ? o : be, Be[1], jf, ue, !0),
            (se.deltaX = se.deltaY = 0),
            v && v(se));
        }),
        _e = (se.onRelease = function (t) {
          if (!df(t, 1)) {
            C(Y ? o : be, Be[1], jf, !0);
            var e = !isNaN(se.y - se.startY),
              r = se.isDragging,
              n =
                r &&
                (3 < Math.abs(se.x - se.startX) ||
                  3 < Math.abs(se.y - se.startY)),
              i = M(t);
            !n &&
              e &&
              (se._vx.reset(),
              se._vy.reset(),
              s &&
                Q &&
                Te.delayedCall(0.08, function () {
                  if (300 < Ye() - xe && !t.defaultPrevented)
                    if (t.target.click) t.target.click();
                    else if (be.createEvent) {
                      var e = be.createEvent("MouseEvents");
                      e.initMouseEvent(
                        "click",
                        !0,
                        !0,
                        Se,
                        1,
                        i.screenX,
                        i.screenY,
                        i.clientX,
                        i.clientY,
                        !1,
                        !1,
                        !1,
                        !1,
                        0,
                        null
                      ),
                        t.target.dispatchEvent(e);
                    }
                })),
              (se.isDragging = se.isGesturing = se.isPressed = !1),
              l && r && !Y && te.restart(!0),
              re && ff(),
              g && r && g(se),
              b && b(se, n);
          }
        });
      (te = se._dc =
        Te.delayedCall(c || 0.25, function onStopFunc() {
          se._vx.reset(), se._vy.reset(), te.pause(), l && l(se);
        }).pause()),
        (se.deltaX = se.deltaY = 0),
        (se._vx = L(0, 50, !0)),
        (se._vy = L(0, 50, !0)),
        (se.scrollX = fe),
        (se.scrollY = de),
        (se.isDragging = se.isGesturing = se.isPressed = !1),
        Re(this),
        (se.enable = function (e) {
          return (
            se.isEnabled ||
              (B(ve ? be : o, "scroll", F),
              0 <= t.indexOf("scroll") && B(ve ? be : o, "scroll", of, ue, j),
              0 <= t.indexOf("wheel") && B(o, "wheel", pf, ue, j),
              ((0 <= t.indexOf("touch") && Me) || 0 <= t.indexOf("pointer")) &&
                (B(o, Be[0], we, ue, j),
                B(be, Be[2], _e),
                B(be, Be[3], _e),
                Q && B(o, "click", cf, !0, !0),
                U && B(o, "click", tf),
                z && B(be, "gesturestart", mf),
                H && B(be, "gestureend", nf),
                D && B(o, Oe + "enter", rf),
                R && B(o, Oe + "leave", sf),
                q && B(o, Oe + "move", qf)),
              (se.isEnabled = !0),
              (se.isDragging = se.isGesturing = se.isPressed = ne = re = !1),
              se._vx.reset(),
              se._vy.reset(),
              (pe = fe()),
              (ge = de()),
              e && e.type && we(e),
              W && W(se)),
            se
          );
        }),
        (se.disable = function () {
          se.isEnabled &&
            (Le.filter(function (e) {
              return e !== se && A(e.target);
            }).length || C(ve ? be : o, "scroll", F),
            se.isPressed &&
              (se._vx.reset(), se._vy.reset(), C(Y ? o : be, Be[1], jf, !0)),
            C(ve ? be : o, "scroll", of, j),
            C(o, "wheel", pf, j),
            C(o, Be[0], we, j),
            C(be, Be[2], _e),
            C(be, Be[3], _e),
            C(o, "click", cf, !0),
            C(o, "click", tf),
            C(be, "gesturestart", mf),
            C(be, "gestureend", nf),
            C(o, Oe + "enter", rf),
            C(o, Oe + "leave", sf),
            C(o, Oe + "move", qf),
            (se.isEnabled = se.isPressed = se.isDragging = !1),
            V && V(se));
        }),
        (se.kill = se.revert =
          function () {
            se.disable();
            var e = Le.indexOf(se);
            0 <= e && Le.splice(e, 1), De === se && (De = 0);
          }),
        Le.push(se),
        Y && A(o) && (De = se),
        se.enable(d);
    }),
    (function _createClass(e, t, r) {
      return (
        t && _defineProperties(e.prototype, t), r && _defineProperties(e, r), e
      );
    })(Observer, [
      {
        key: "velocityX",
        get: function get() {
          return this._vx.getVelocity();
        },
      },
      {
        key: "velocityY",
        get: function get() {
          return this._vy.getVelocity();
        },
      },
    ]),
    Observer);
  function Observer(e) {
    this.init(e);
  }
  (k.version = "3.12.7"),
    (k.create = function (e) {
      return new k(e);
    }),
    (k.register = P),
    (k.getAll = function () {
      return Le.slice();
    }),
    (k.getById = function (t) {
      return Le.filter(function (e) {
        return e.vars.id === t;
      })[0];
    }),
    r() && Te.registerPlugin(k);
  function Ca(e, t, r) {
    var n = ct(e) && ("clamp(" === e.substr(0, 6) || -1 < e.indexOf("max"));
    return (r["_" + t + "Clamp"] = n) ? e.substr(6, e.length - 7) : e;
  }
  function Da(e, t) {
    return !t || (ct(e) && "clamp(" === e.substr(0, 6))
      ? e
      : "clamp(" + e + ")";
  }
  function Fa() {
    return (je = 1);
  }
  function Ga() {
    return (je = 0);
  }
  function Ha(e) {
    return e;
  }
  function Ia(e) {
    return Math.round(1e5 * e) / 1e5 || 0;
  }
  function Ja() {
    return "undefined" != typeof window;
  }
  function Ka() {
    return He || (Ja() && (He = window.gsap) && He.registerPlugin && He);
  }
  function La(e) {
    return !!~l.indexOf(e);
  }
  function Ma(e) {
    return (
      ("Height" === e ? T : Ne["inner" + e]) ||
      We["client" + e] ||
      Je["client" + e]
    );
  }
  function Na(e) {
    return (
      z(e, "getBoundingClientRect") ||
      (La(e)
        ? function () {
            return (Ot.width = Ne.innerWidth), (Ot.height = T), Ot;
          }
        : function () {
            return wt(e);
          })
    );
  }
  function Qa(e, t) {
    var r = t.s,
      n = t.d2,
      i = t.d,
      o = t.a;
    return Math.max(
      0,
      (r = "scroll" + n) && (o = z(e, r))
        ? o() - Na(e)()[i]
        : La(e)
        ? (We[r] || Je[r]) - Ma(n)
        : e[r] - e["offset" + n]
    );
  }
  function Ra(e, t) {
    for (var r = 0; r < g.length; r += 3)
      (t && !~t.indexOf(g[r + 1])) || e(g[r], g[r + 1], g[r + 2]);
  }
  function Ta(e) {
    return "function" == typeof e;
  }
  function Ua(e) {
    return "number" == typeof e;
  }
  function Va(e) {
    return "object" == typeof e;
  }
  function Wa(e, t, r) {
    return e && e.progress(t ? 0 : 1) && r && e.pause();
  }
  function Xa(e, t) {
    if (e.enabled) {
      var r = e._ctx
        ? e._ctx.add(function () {
            return t(e);
          })
        : t(e);
      r && r.totalTime && (e.callbackAnimation = r);
    }
  }
  function mb(e) {
    return Ne.getComputedStyle(e);
  }
  function ob(e, t) {
    for (var r in t) r in e || (e[r] = t[r]);
    return e;
  }
  function qb(e, t) {
    var r = t.d2;
    return e["offset" + r] || e["client" + r] || 0;
  }
  function rb(e) {
    var t,
      r = [],
      n = e.labels,
      i = e.duration();
    for (t in n) r.push(n[t] / i);
    return r;
  }
  function tb(i) {
    var o = He.utils.snap(i),
      a =
        Array.isArray(i) &&
        i.slice(0).sort(function (e, t) {
          return e - t;
        });
    return a
      ? function (e, t, r) {
          var n;
          if ((void 0 === r && (r = 0.001), !t)) return o(e);
          if (0 < t) {
            for (e -= r, n = 0; n < a.length; n++) if (a[n] >= e) return a[n];
            return a[n - 1];
          }
          for (n = a.length, e += r; n--; ) if (a[n] <= e) return a[n];
          return a[0];
        }
      : function (e, t, r) {
          void 0 === r && (r = 0.001);
          var n = o(e);
          return !t || Math.abs(n - e) < r || n - e < 0 == t < 0
            ? n
            : o(t < 0 ? e - i : e + i);
        };
  }
  function vb(t, r, e, n) {
    return e.split(",").forEach(function (e) {
      return t(r, e, n);
    });
  }
  function wb(e, t, r, n, i) {
    return e.addEventListener(t, r, { passive: !n, capture: !!i });
  }
  function xb(e, t, r, n) {
    return e.removeEventListener(t, r, !!n);
  }
  function yb(e, t, r) {
    (r = r && r.wheelHandler) && (e(t, "wheel", r), e(t, "touchmove", r));
  }
  function Cb(e, t) {
    if (ct(e)) {
      var r = e.indexOf("="),
        n = ~r ? (e.charAt(r - 1) + 1) * parseFloat(e.substr(r + 1)) : 0;
      ~r && (e.indexOf("%") > r && (n *= t / 100), (e = e.substr(0, r - 1))),
        (e =
          n +
          (e in H
            ? H[e] * t
            : ~e.indexOf("%")
            ? (parseFloat(e) * t) / 100
            : parseFloat(e) || 0));
    }
    return e;
  }
  function Db(e, t, r, n, i, o, a, s) {
    var l = i.startColor,
      c = i.endColor,
      u = i.fontSize,
      f = i.indent,
      d = i.fontWeight,
      p = Xe.createElement("div"),
      g = La(r) || "fixed" === z(r, "pinType"),
      h = -1 !== e.indexOf("scroller"),
      v = g ? Je : r,
      b = -1 !== e.indexOf("start"),
      m = b ? l : c,
      y =
        "border-color:" +
        m +
        ";font-size:" +
        u +
        ";color:" +
        m +
        ";font-weight:" +
        d +
        ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";
    return (
      (y += "position:" + ((h || s) && g ? "fixed;" : "absolute;")),
      (!h && !s && g) ||
        (y += (n === ze ? q : I) + ":" + (o + parseFloat(f)) + "px;"),
      a &&
        (y +=
          "box-sizing:border-box;text-align:left;width:" +
          a.offsetWidth +
          "px;"),
      (p._isStart = b),
      p.setAttribute("class", "gsap-marker-" + e + (t ? " marker-" + t : "")),
      (p.style.cssText = y),
      (p.innerText = t || 0 === t ? e + "-" + t : e),
      v.children[0] ? v.insertBefore(p, v.children[0]) : v.appendChild(p),
      (p._offset = p["offset" + n.op.d2]),
      X(p, 0, n, b),
      p
    );
  }
  function Ib() {
    return 34 < at() - st && (D = D || requestAnimationFrame(Z));
  }
  function Jb() {
    (v && v.isPressed && !(v.startX > Je.clientWidth)) ||
      (qe.cache++,
      v ? (D = D || requestAnimationFrame(Z)) : Z(),
      st || U("scrollStart"),
      (st = at()));
  }
  function Kb() {
    (y = Ne.innerWidth), (m = Ne.innerHeight);
  }
  function Lb(e) {
    qe.cache++,
      (!0 !== e &&
        (Ke ||
          h ||
          Xe.fullscreenElement ||
          Xe.webkitFullscreenElement ||
          (b &&
            y === Ne.innerWidth &&
            !(Math.abs(Ne.innerHeight - m) > 0.25 * Ne.innerHeight)))) ||
        c.restart(!0);
  }
  function Ob() {
    return xb(ne, "scrollEnd", Ob) || Et(!0);
  }
  function Rb(e) {
    for (var t = 0; t < j.length; t += 5)
      (!e || (j[t + 4] && j[t + 4].query === e)) &&
        ((j[t].style.cssText = j[t + 1]),
        j[t].getBBox && j[t].setAttribute("transform", j[t + 2] || ""),
        (j[t + 3].uncache = 1));
  }
  function Sb(e, t) {
    var r;
    for (Qe = 0; Qe < Ct.length; Qe++)
      !(r = Ct[Qe]) ||
        (t && r._ctx !== t) ||
        (e ? r.kill(1) : r.revert(!0, !0));
    (S = !0), t && Rb(t), t || U("revert");
  }
  function Tb(e, t) {
    qe.cache++,
      (!t && rt) ||
        qe.forEach(function (e) {
          return Ta(e) && e.cacheID++ && (e.rec = 0);
        }),
      ct(e) && (Ne.history.scrollRestoration = w = e);
  }
  function Yb() {
    Je.appendChild(_),
      (T = (!v && _.offsetHeight) || Ne.innerHeight),
      Je.removeChild(_);
  }
  function Zb(t) {
    return Ve(
      ".gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end"
    ).forEach(function (e) {
      return (e.style.display = t ? "none" : "block");
    });
  }
  function gc(e, t, r, n) {
    if (!e._gsap.swappedIn) {
      for (var i, o = $.length, a = t.style, s = e.style; o--; )
        a[(i = $[o])] = r[i];
      (a.position = "absolute" === r.position ? "absolute" : "relative"),
        "inline" === r.display && (a.display = "inline-block"),
        (s[I] = s[q] = "auto"),
        (a.flexBasis = r.flexBasis || "auto"),
        (a.overflow = "visible"),
        (a.boxSizing = "border-box"),
        (a[ft] = qb(e, Fe) + xt),
        (a[dt] = qb(e, ze) + xt),
        (a[bt] = s[mt] = s.top = s.left = "0"),
        Mt(n),
        (s[ft] = s.maxWidth = r[ft]),
        (s[dt] = s.maxHeight = r[dt]),
        (s[bt] = r[bt]),
        e.parentNode !== t &&
          (e.parentNode.insertBefore(t, e), t.appendChild(e)),
        (e._gsap.swappedIn = !0);
    }
  }
  function jc(e) {
    for (var t = ee.length, r = e.style, n = [], i = 0; i < t; i++)
      n.push(ee[i], r[ee[i]]);
    return (n.t = e), n;
  }
  function mc(e, t, r, n, i, o, a, s, l, c, u, f, d, p) {
    Ta(e) && (e = e(s)),
      ct(e) &&
        "max" === e.substr(0, 3) &&
        (e = f + ("=" === e.charAt(4) ? Cb("0" + e.substr(3), r) : 0));
    var g,
      h,
      v,
      b = d ? d.time() : 0;
    if ((d && d.seek(0), isNaN(e) || (e = +e), Ua(e)))
      d &&
        (e = He.utils.mapRange(
          d.scrollTrigger.start,
          d.scrollTrigger.end,
          0,
          f,
          e
        )),
        a && X(a, r, n, !0);
    else {
      Ta(t) && (t = t(s));
      var m,
        y,
        x,
        w,
        _ = (e || "0").split(" ");
      (v = J(t, s) || Je),
        ((m = wt(v) || {}) && (m.left || m.top)) ||
          "none" !== mb(v).display ||
          ((w = v.style.display),
          (v.style.display = "block"),
          (m = wt(v)),
          w ? (v.style.display = w) : v.style.removeProperty("display")),
        (y = Cb(_[0], m[n.d])),
        (x = Cb(_[1] || "0", r)),
        (e = m[n.p] - l[n.p] - c + y + i - x),
        a && X(a, x, n, r - x < 20 || (a._isStart && 20 < x)),
        (r -= r - x);
    }
    if ((p && ((s[p] = e || -0.001), e < 0 && (e = 0)), o)) {
      var T = e + r,
        C = o._isStart;
      (g = "scroll" + n.d2),
        X(
          o,
          T,
          n,
          (C && 20 < T) ||
            (!C && (u ? Math.max(Je[g], We[g]) : o.parentNode[g]) <= T + 1)
        ),
        u &&
          ((l = wt(a)),
          u && (o.style[n.op.p] = l[n.op.p] - n.op.m - o._offset + xt));
    }
    return (
      d &&
        v &&
        ((g = wt(v)),
        d.seek(f),
        (h = wt(v)),
        (d._caScrollDist = g[n.p] - h[n.p]),
        (e = (e / d._caScrollDist) * f)),
      d && d.seek(b),
      d ? e : Math.round(e)
    );
  }
  function oc(e, t, r, n) {
    if (e.parentNode !== t) {
      var i,
        o,
        a = e.style;
      if (t === Je) {
        for (i in ((e._stOrig = a.cssText), (o = mb(e))))
          +i ||
            re.test(i) ||
            !o[i] ||
            "string" != typeof a[i] ||
            "0" === i ||
            (a[i] = o[i]);
        (a.top = r), (a.left = n);
      } else a.cssText = e._stOrig;
      (He.core.getCache(e).uncache = 1), t.appendChild(e);
    }
  }
  function pc(r, e, n) {
    var i = e,
      o = i;
    return function (e) {
      var t = Math.round(r());
      return (
        t !== i &&
          t !== o &&
          3 < Math.abs(t - i) &&
          3 < Math.abs(t - o) &&
          ((e = t), n && n()),
        (o = i),
        (i = Math.round(e))
      );
    };
  }
  function qc(e, t, r) {
    var n = {};
    (n[t.p] = "+=" + r), He.set(e, n);
  }
  function rc(c, e) {
    function Dk(e, t, r, n, i) {
      var o = Dk.tween,
        a = t.onComplete,
        s = {};
      r = r || u();
      var l = pc(u, r, function () {
        o.kill(), (Dk.tween = 0);
      });
      return (
        (i = (n && i) || 0),
        (n = n || e - r),
        o && o.kill(),
        (t[f] = e),
        (t.inherit = !1),
        ((t.modifiers = s)[f] = function () {
          return l(r + n * o.ratio + i * o.ratio * o.ratio);
        }),
        (t.onUpdate = function () {
          qe.cache++, Dk.tween && Z();
        }),
        (t.onComplete = function () {
          (Dk.tween = 0), a && a.call(o);
        }),
        (o = Dk.tween = He.to(c, t))
      );
    }
    var u = K(c, e),
      f = "_scroll" + e.p2;
    return (
      ((c[f] = u).wheelHandler = function () {
        return Dk.tween && Dk.tween.kill() && (Dk.tween = 0);
      }),
      wb(c, "wheel", u.wheelHandler),
      ne.isTouch && wb(c, "touchmove", u.wheelHandler),
      Dk
    );
  }
  var He,
    s,
    Ne,
    Xe,
    We,
    Je,
    l,
    c,
    Ve,
    Ue,
    Ge,
    u,
    Ke,
    je,
    f,
    Qe,
    d,
    p,
    g,
    Ze,
    $e,
    h,
    v,
    b,
    m,
    y,
    E,
    x,
    w,
    _,
    T,
    S,
    et,
    tt,
    D,
    rt,
    nt,
    it,
    ot = 1,
    at = Date.now,
    R = at(),
    st = 0,
    lt = 0,
    ct = function _isString(e) {
      return "string" == typeof e;
    },
    ut = Math.abs,
    q = "right",
    I = "bottom",
    ft = "width",
    dt = "height",
    pt = "Right",
    gt = "Left",
    ht = "Top",
    vt = "Bottom",
    bt = "padding",
    mt = "margin",
    yt = "Width",
    Y = "Height",
    xt = "px",
    wt = function _getBounds(e, t) {
      var r =
          t &&
          "matrix(1, 0, 0, 1, 0, 0)" !== mb(e)[f] &&
          He.to(e, {
            x: 0,
            y: 0,
            xPercent: 0,
            yPercent: 0,
            rotation: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            skewX: 0,
            skewY: 0,
          }).progress(1),
        n = e.getBoundingClientRect();
      return r && r.progress(0).kill(), n;
    },
    _t = {
      startColor: "green",
      endColor: "red",
      indent: 0,
      fontSize: "16px",
      fontWeight: "normal",
    },
    Tt = { toggleActions: "play", anticipatePin: 0 },
    H = { top: 0, left: 0, center: 0.5, bottom: 1, right: 1 },
    X = function _positionMarker(e, t, r, n) {
      var i = { display: "block" },
        o = r[n ? "os2" : "p2"],
        a = r[n ? "p2" : "os2"];
      (e._isFlipped = n),
        (i[r.a + "Percent"] = n ? -100 : 0),
        (i[r.a] = n ? "1px" : 0),
        (i["border" + o + yt] = 1),
        (i["border" + a + yt] = 0),
        (i[r.p] = t + "px"),
        He.set(e, i);
    },
    Ct = [],
    St = {},
    W = {},
    V = [],
    U = function _dispatch(e) {
      return (
        (W[e] &&
          W[e].map(function (e) {
            return e();
          })) ||
        V
      );
    },
    j = [],
    kt = 0,
    Et = function _refreshAll(e, t) {
      if (
        ((We = Xe.documentElement),
        (Je = Xe.body),
        (l = [Ne, Xe, We, Je]),
        !st || e || S)
      ) {
        Yb(),
          (rt = ne.isRefreshing = !0),
          qe.forEach(function (e) {
            return Ta(e) && ++e.cacheID && (e.rec = e());
          });
        var r = U("refreshInit");
        Ze && ne.sort(),
          t || Sb(),
          qe.forEach(function (e) {
            Ta(e) &&
              (e.smooth && (e.target.style.scrollBehavior = "auto"), e(0));
          }),
          Ct.slice(0).forEach(function (e) {
            return e.refresh();
          }),
          (S = !1),
          Ct.forEach(function (e) {
            if (e._subPinOffset && e.pin) {
              var t = e.vars.horizontal ? "offsetWidth" : "offsetHeight",
                r = e.pin[t];
              e.revert(!0, 1), e.adjustPinSpacing(e.pin[t] - r), e.refresh();
            }
          }),
          (et = 1),
          Zb(!0),
          Ct.forEach(function (e) {
            var t = Qa(e.scroller, e._dir),
              r = "max" === e.vars.end || (e._endClamp && e.end > t),
              n = e._startClamp && e.start >= t;
            (r || n) &&
              e.setPositions(
                n ? t - 1 : e.start,
                r ? Math.max(n ? t : e.start + 1, t) : e.end,
                !0
              );
          }),
          Zb(!1),
          (et = 0),
          r.forEach(function (e) {
            return e && e.render && e.render(-1);
          }),
          qe.forEach(function (e) {
            Ta(e) &&
              (e.smooth &&
                requestAnimationFrame(function () {
                  return (e.target.style.scrollBehavior = "smooth");
                }),
              e.rec && e(e.rec));
          }),
          Tb(w, 1),
          c.pause(),
          kt++,
          Z((rt = 2)),
          Ct.forEach(function (e) {
            return Ta(e.vars.onRefresh) && e.vars.onRefresh(e);
          }),
          (rt = ne.isRefreshing = !1),
          U("refresh");
      } else wb(ne, "scrollEnd", Ob);
    },
    Q = 0,
    Pt = 1,
    Z = function _updateAll(e) {
      if (2 === e || (!rt && !S)) {
        (ne.isUpdating = !0), it && it.update(0);
        var t = Ct.length,
          r = at(),
          n = 50 <= r - R,
          i = t && Ct[0].scroll();
        if (
          ((Pt = i < Q ? -1 : 1),
          rt || (Q = i),
          n &&
            (st && !je && 200 < r - st && ((st = 0), U("scrollEnd")),
            (Ge = R),
            (R = r)),
          Pt < 0)
        ) {
          for (Qe = t; 0 < Qe--; ) Ct[Qe] && Ct[Qe].update(0, n);
          Pt = 1;
        } else for (Qe = 0; Qe < t; Qe++) Ct[Qe] && Ct[Qe].update(0, n);
        ne.isUpdating = !1;
      }
      D = 0;
    },
    $ = [
      "left",
      "top",
      I,
      q,
      mt + vt,
      mt + pt,
      mt + ht,
      mt + gt,
      "display",
      "flexShrink",
      "float",
      "zIndex",
      "gridColumnStart",
      "gridColumnEnd",
      "gridRowStart",
      "gridRowEnd",
      "gridArea",
      "justifySelf",
      "alignSelf",
      "placeSelf",
      "order",
    ],
    ee = $.concat([
      ft,
      dt,
      "boxSizing",
      "max" + yt,
      "max" + Y,
      "position",
      mt,
      bt,
      bt + ht,
      bt + pt,
      bt + vt,
      bt + gt,
    ]),
    te = /([A-Z])/g,
    Mt = function _setState(e) {
      if (e) {
        var t,
          r,
          n = e.t.style,
          i = e.length,
          o = 0;
        for ((e.t._gsap || He.core.getCache(e.t)).uncache = 1; o < i; o += 2)
          (r = e[o + 1]),
            (t = e[o]),
            r
              ? (n[t] = r)
              : n[t] && n.removeProperty(t.replace(te, "-$1").toLowerCase());
      }
    },
    Ot = { left: 0, top: 0 },
    re = /(webkit|moz|length|cssText|inset)/i,
    ne =
      ((ScrollTrigger.prototype.init = function init(M, O) {
        if (
          ((this.progress = this.start = 0), this.vars && this.kill(!0, !0), lt)
        ) {
          var A,
            n,
            p,
            D,
            B,
            R,
            L,
            q,
            I,
            Y,
            F,
            e,
            H,
            N,
            X,
            W,
            V,
            U,
            t,
            G,
            b,
            j,
            Q,
            m,
            Z,
            y,
            $,
            x,
            r,
            w,
            _,
            ee,
            i,
            g,
            te,
            re,
            ne,
            T,
            o,
            C = (M = ob(ct(M) || Ua(M) || M.nodeType ? { trigger: M } : M, Tt))
              .onUpdate,
            S = M.toggleClass,
            a = M.id,
            k = M.onToggle,
            ie = M.onRefresh,
            E = M.scrub,
            oe = M.trigger,
            ae = M.pin,
            se = M.pinSpacing,
            le = M.invalidateOnRefresh,
            P = M.anticipatePin,
            s = M.onScrubComplete,
            h = M.onSnapComplete,
            ce = M.once,
            ue = M.snap,
            fe = M.pinReparent,
            l = M.pinSpacer,
            de = M.containerAnimation,
            pe = M.fastScrollEnd,
            ge = M.preventOverlaps,
            he =
              M.horizontal || (M.containerAnimation && !1 !== M.horizontal)
                ? Fe
                : ze,
            ve = !E && 0 !== E,
            be = J(M.scroller || Ne),
            c = He.core.getCache(be),
            me = La(be),
            ye =
              "fixed" ===
              ("pinType" in M
                ? M.pinType
                : z(be, "pinType") || (me && "fixed")),
            xe = [M.onEnter, M.onLeave, M.onEnterBack, M.onLeaveBack],
            we = ve && M.toggleActions.split(" "),
            _e = "markers" in M ? M.markers : Tt.markers,
            Te = me ? 0 : parseFloat(mb(be)["border" + he.p2 + yt]) || 0,
            Ce = this,
            Se =
              M.onRefreshInit &&
              function () {
                return M.onRefreshInit(Ce);
              },
            ke = (function _getSizeFunc(e, t, r) {
              var n = r.d,
                i = r.d2,
                o = r.a;
              return (o = z(e, "getBoundingClientRect"))
                ? function () {
                    return o()[n];
                  }
                : function () {
                    return (t ? Ma(i) : e["client" + i]) || 0;
                  };
            })(be, me, he),
            Ee = (function _getOffsetsFunc(e, t) {
              return !t || ~Ie.indexOf(e)
                ? Na(e)
                : function () {
                    return Ot;
                  };
            })(be, me),
            Pe = 0,
            Me = 0,
            Oe = 0,
            Ae = K(be, he);
          if (
            ((Ce._startClamp = Ce._endClamp = !1),
            (Ce._dir = he),
            (P *= 45),
            (Ce.scroller = be),
            (Ce.scroll = de ? de.time.bind(de) : Ae),
            (D = Ae()),
            (Ce.vars = M),
            (O = O || M.animation),
            "refreshPriority" in M &&
              ((Ze = 1), -9999 === M.refreshPriority && (it = Ce)),
            (c.tweenScroll = c.tweenScroll || {
              top: rc(be, ze),
              left: rc(be, Fe),
            }),
            (Ce.tweenTo = A = c.tweenScroll[he.p]),
            (Ce.scrubDuration = function (e) {
              (i = Ua(e) && e)
                ? ee
                  ? ee.duration(e)
                  : (ee = He.to(O, {
                      ease: "expo",
                      totalProgress: "+=0",
                      inherit: !1,
                      duration: i,
                      paused: !0,
                      onComplete: function onComplete() {
                        return s && s(Ce);
                      },
                    }))
                : (ee && ee.progress(1).kill(), (ee = 0));
            }),
            O &&
              ((O.vars.lazy = !1),
              (O._initted && !Ce.isReverted) ||
                (!1 !== O.vars.immediateRender &&
                  !1 !== M.immediateRender &&
                  O.duration() &&
                  O.render(0, !0, !0)),
              (Ce.animation = O.pause()),
              (O.scrollTrigger = Ce).scrubDuration(E),
              (w = 0),
              (a = a || O.vars.id)),
            ue &&
              ((Va(ue) && !ue.push) || (ue = { snapTo: ue }),
              "scrollBehavior" in Je.style &&
                He.set(me ? [Je, We] : be, { scrollBehavior: "auto" }),
              qe.forEach(function (e) {
                return (
                  Ta(e) &&
                  e.target === (me ? Xe.scrollingElement || We : be) &&
                  (e.smooth = !1)
                );
              }),
              (p = Ta(ue.snapTo)
                ? ue.snapTo
                : "labels" === ue.snapTo
                ? (function _getClosestLabel(t) {
                    return function (e) {
                      return He.utils.snap(rb(t), e);
                    };
                  })(O)
                : "labelsDirectional" === ue.snapTo
                ? (function _getLabelAtDirection(r) {
                    return function (e, t) {
                      return tb(rb(r))(e, t.direction);
                    };
                  })(O)
                : !1 !== ue.directional
                ? function (e, t) {
                    return tb(ue.snapTo)(e, at() - Me < 500 ? 0 : t.direction);
                  }
                : He.utils.snap(ue.snapTo)),
              (g = ue.duration || { min: 0.1, max: 2 }),
              (g = Va(g) ? Ue(g.min, g.max) : Ue(g, g)),
              (te = He.delayedCall(ue.delay || i / 2 || 0.1, function () {
                var e = Ae(),
                  t = at() - Me < 500,
                  r = A.tween;
                if (
                  !(t || Math.abs(Ce.getVelocity()) < 10) ||
                  r ||
                  je ||
                  Pe === e
                )
                  Ce.isActive && Pe !== e && te.restart(!0);
                else {
                  var n,
                    i,
                    o = (e - R) / N,
                    a = O && !ve ? O.totalProgress() : o,
                    s = t ? 0 : ((a - _) / (at() - Ge)) * 1e3 || 0,
                    l = He.utils.clamp(-o, 1 - o, (ut(s / 2) * s) / 0.185),
                    c = o + (!1 === ue.inertia ? 0 : l),
                    u = ue.onStart,
                    f = ue.onInterrupt,
                    d = ue.onComplete;
                  if (
                    ((n = p(c, Ce)),
                    Ua(n) || (n = c),
                    (i = Math.max(0, Math.round(R + n * N))),
                    e <= L && R <= e && i !== e)
                  ) {
                    if (r && !r._initted && r.data <= ut(i - e)) return;
                    !1 === ue.inertia && (l = n - o),
                      A(
                        i,
                        {
                          duration: g(
                            ut(
                              (0.185 * Math.max(ut(c - a), ut(n - a))) /
                                s /
                                0.05 || 0
                            )
                          ),
                          ease: ue.ease || "power3",
                          data: ut(i - e),
                          onInterrupt: function onInterrupt() {
                            return te.restart(!0) && f && f(Ce);
                          },
                          onComplete: function onComplete() {
                            Ce.update(),
                              (Pe = Ae()),
                              O &&
                                !ve &&
                                (ee
                                  ? ee.resetTo(
                                      "totalProgress",
                                      n,
                                      O._tTime / O._tDur
                                    )
                                  : O.progress(n)),
                              (w = _ =
                                O && !ve ? O.totalProgress() : Ce.progress),
                              h && h(Ce),
                              d && d(Ce);
                          },
                        },
                        e,
                        l * N,
                        i - e - l * N
                      ),
                      u && u(Ce, A.tween);
                  }
                }
              }).pause())),
            a && (St[a] = Ce),
            (o =
              (o =
                (oe = Ce.trigger = J(oe || (!0 !== ae && ae))) &&
                oe._gsap &&
                oe._gsap.stRevert) && o(Ce)),
            (ae = !0 === ae ? oe : J(ae)),
            ct(S) && (S = { targets: oe, className: S }),
            ae &&
              (!1 === se ||
                se === mt ||
                (se =
                  !(
                    !se &&
                    ae.parentNode &&
                    ae.parentNode.style &&
                    "flex" === mb(ae.parentNode).display
                  ) && bt),
              (Ce.pin = ae),
              (n = He.core.getCache(ae)).spacer
                ? (X = n.pinState)
                : (l &&
                    ((l = J(l)) &&
                      !l.nodeType &&
                      (l = l.current || l.nativeElement),
                    (n.spacerIsNative = !!l),
                    l && (n.spacerState = jc(l))),
                  (n.spacer = U = l || Xe.createElement("div")),
                  U.classList.add("pin-spacer"),
                  a && U.classList.add("pin-spacer-" + a),
                  (n.pinState = X = jc(ae))),
              !1 !== M.force3D && He.set(ae, { force3D: !0 }),
              (Ce.spacer = U = n.spacer),
              (r = mb(ae)),
              (m = r[se + he.os2]),
              (G = He.getProperty(ae)),
              (b = He.quickSetter(ae, he.a, xt)),
              gc(ae, U, r),
              (V = jc(ae))),
            _e)
          ) {
            (e = Va(_e) ? ob(_e, _t) : _t),
              (Y = Db("scroller-start", a, be, he, e, 0)),
              (F = Db("scroller-end", a, be, he, e, 0, Y)),
              (t = Y["offset" + he.op.d2]);
            var u = J(z(be, "content") || be);
            (q = this.markerStart = Db("start", a, u, he, e, t, 0, de)),
              (I = this.markerEnd = Db("end", a, u, he, e, t, 0, de)),
              de && (T = He.quickSetter([q, I], he.a, xt)),
              ye ||
                (Ie.length && !0 === z(be, "fixedMarkers")) ||
                ((function _makePositionable(e) {
                  var t = mb(e).position;
                  e.style.position =
                    "absolute" === t || "fixed" === t ? t : "relative";
                })(me ? Je : be),
                He.set([Y, F], { force3D: !0 }),
                (y = He.quickSetter(Y, he.a, xt)),
                (x = He.quickSetter(F, he.a, xt)));
          }
          if (de) {
            var f = de.vars.onUpdate,
              d = de.vars.onUpdateParams;
            de.eventCallback("onUpdate", function () {
              Ce.update(0, 0, 1), f && f.apply(de, d || []);
            });
          }
          if (
            ((Ce.previous = function () {
              return Ct[Ct.indexOf(Ce) - 1];
            }),
            (Ce.next = function () {
              return Ct[Ct.indexOf(Ce) + 1];
            }),
            (Ce.revert = function (e, t) {
              if (!t) return Ce.kill(!0);
              var r = !1 !== e || !Ce.enabled,
                n = Ke;
              r !== Ce.isReverted &&
                (r &&
                  ((re = Math.max(Ae(), Ce.scroll.rec || 0)),
                  (Oe = Ce.progress),
                  (ne = O && O.progress())),
                q &&
                  [q, I, Y, F].forEach(function (e) {
                    return (e.style.display = r ? "none" : "block");
                  }),
                r && (Ke = Ce).update(r),
                !ae ||
                  (fe && Ce.isActive) ||
                  (r
                    ? (function _swapPinOut(e, t, r) {
                        Mt(r);
                        var n = e._gsap;
                        if (n.spacerIsNative) Mt(n.spacerState);
                        else if (e._gsap.swappedIn) {
                          var i = t.parentNode;
                          i && (i.insertBefore(e, t), i.removeChild(t));
                        }
                        e._gsap.swappedIn = !1;
                      })(ae, U, X)
                    : gc(ae, U, mb(ae), Z)),
                r || Ce.update(r),
                (Ke = n),
                (Ce.isReverted = r));
            }),
            (Ce.refresh = function (e, t, r, n) {
              if ((!Ke && Ce.enabled) || t)
                if (ae && e && st) wb(ScrollTrigger, "scrollEnd", Ob);
                else {
                  !rt && Se && Se(Ce),
                    (Ke = Ce),
                    A.tween && !r && (A.tween.kill(), (A.tween = 0)),
                    ee && ee.pause(),
                    le && O && O.revert({ kill: !1 }).invalidate(),
                    Ce.isReverted || Ce.revert(!0, !0),
                    (Ce._subPinOffset = !1);
                  var i,
                    o,
                    a,
                    s,
                    l,
                    c,
                    u,
                    f,
                    d,
                    p,
                    g,
                    h,
                    v,
                    b = ke(),
                    m = Ee(),
                    y = de ? de.duration() : Qa(be, he),
                    x = N <= 0.01,
                    w = 0,
                    _ = n || 0,
                    T = Va(r) ? r.end : M.end,
                    C = M.endTrigger || oe,
                    S = Va(r)
                      ? r.start
                      : M.start ||
                        (0 !== M.start && oe ? (ae ? "0 0" : "0 100%") : 0),
                    k = (Ce.pinnedContainer =
                      M.pinnedContainer && J(M.pinnedContainer, Ce)),
                    E = (oe && Math.max(0, Ct.indexOf(Ce))) || 0,
                    P = E;
                  for (
                    _e &&
                    Va(r) &&
                    ((h = He.getProperty(Y, he.p)),
                    (v = He.getProperty(F, he.p)));
                    0 < P--;

                  )
                    (c = Ct[P]).end || c.refresh(0, 1) || (Ke = Ce),
                      !(u = c.pin) ||
                        (u !== oe && u !== ae && u !== k) ||
                        c.isReverted ||
                        ((p = p || []).unshift(c), c.revert(!0, !0)),
                      c !== Ct[P] && (E--, P--);
                  for (
                    Ta(S) && (S = S(Ce)),
                      S = Ca(S, "start", Ce),
                      R =
                        mc(
                          S,
                          oe,
                          b,
                          he,
                          Ae(),
                          q,
                          Y,
                          Ce,
                          m,
                          Te,
                          ye,
                          y,
                          de,
                          Ce._startClamp && "_startClamp"
                        ) || (ae ? -0.001 : 0),
                      Ta(T) && (T = T(Ce)),
                      ct(T) &&
                        !T.indexOf("+=") &&
                        (~T.indexOf(" ")
                          ? (T = (ct(S) ? S.split(" ")[0] : "") + T)
                          : ((w = Cb(T.substr(2), b)),
                            (T = ct(S)
                              ? S
                              : (de
                                  ? He.utils.mapRange(
                                      0,
                                      de.duration(),
                                      de.scrollTrigger.start,
                                      de.scrollTrigger.end,
                                      R
                                    )
                                  : R) + w),
                            (C = oe))),
                      T = Ca(T, "end", Ce),
                      L =
                        Math.max(
                          R,
                          mc(
                            T || (C ? "100% 0" : y),
                            C,
                            b,
                            he,
                            Ae() + w,
                            I,
                            F,
                            Ce,
                            m,
                            Te,
                            ye,
                            y,
                            de,
                            Ce._endClamp && "_endClamp"
                          )
                        ) || -0.001,
                      w = 0,
                      P = E;
                    P--;

                  )
                    (u = (c = Ct[P]).pin) &&
                      c.start - c._pinPush <= R &&
                      !de &&
                      0 < c.end &&
                      ((i =
                        c.end -
                        (Ce._startClamp ? Math.max(0, c.start) : c.start)),
                      ((u === oe && c.start - c._pinPush < R) || u === k) &&
                        isNaN(S) &&
                        (w += i * (1 - c.progress)),
                      u === ae && (_ += i));
                  if (
                    ((R += w),
                    (L += w),
                    Ce._startClamp && (Ce._startClamp += w),
                    Ce._endClamp &&
                      !rt &&
                      ((Ce._endClamp = L || -0.001),
                      (L = Math.min(L, Qa(be, he)))),
                    (N = L - R || ((R -= 0.01) && 0.001)),
                    x &&
                      (Oe = He.utils.clamp(0, 1, He.utils.normalize(R, L, re))),
                    (Ce._pinPush = _),
                    q &&
                      w &&
                      (((i = {})[he.a] = "+=" + w),
                      k && (i[he.p] = "-=" + Ae()),
                      He.set([q, I], i)),
                    !ae || (et && Ce.end >= Qa(be, he)))
                  ) {
                    if (oe && Ae() && !de)
                      for (o = oe.parentNode; o && o !== Je; )
                        o._pinOffset &&
                          ((R -= o._pinOffset), (L -= o._pinOffset)),
                          (o = o.parentNode);
                  } else
                    (i = mb(ae)),
                      (s = he === ze),
                      (a = Ae()),
                      (j = parseFloat(G(he.a)) + _),
                      !y &&
                        1 < L &&
                        ((g = {
                          style: (g = (me ? Xe.scrollingElement || We : be)
                            .style),
                          value: g["overflow" + he.a.toUpperCase()],
                        }),
                        me &&
                          "scroll" !==
                            mb(Je)["overflow" + he.a.toUpperCase()] &&
                          (g.style["overflow" + he.a.toUpperCase()] =
                            "scroll")),
                      gc(ae, U, i),
                      (V = jc(ae)),
                      (o = wt(ae, !0)),
                      (f = ye && K(be, s ? Fe : ze)()),
                      se
                        ? (((Z = [se + he.os2, N + _ + xt]).t = U),
                          (P = se === bt ? qb(ae, he) + N + _ : 0) &&
                            (Z.push(he.d, P + xt),
                            "auto" !== U.style.flexBasis &&
                              (U.style.flexBasis = P + xt)),
                          Mt(Z),
                          k &&
                            Ct.forEach(function (e) {
                              e.pin === k &&
                                !1 !== e.vars.pinSpacing &&
                                (e._subPinOffset = !0);
                            }),
                          ye && Ae(re))
                        : (P = qb(ae, he)) &&
                          "auto" !== U.style.flexBasis &&
                          (U.style.flexBasis = P + xt),
                      ye &&
                        (((l = {
                          top: o.top + (s ? a - R : f) + xt,
                          left: o.left + (s ? f : a - R) + xt,
                          boxSizing: "border-box",
                          position: "fixed",
                        })[ft] = l.maxWidth =
                          Math.ceil(o.width) + xt),
                        (l[dt] = l.maxHeight = Math.ceil(o.height) + xt),
                        (l[mt] =
                          l[mt + ht] =
                          l[mt + pt] =
                          l[mt + vt] =
                          l[mt + gt] =
                            "0"),
                        (l[bt] = i[bt]),
                        (l[bt + ht] = i[bt + ht]),
                        (l[bt + pt] = i[bt + pt]),
                        (l[bt + vt] = i[bt + vt]),
                        (l[bt + gt] = i[bt + gt]),
                        (W = (function _copyState(e, t, r) {
                          for (
                            var n, i = [], o = e.length, a = r ? 8 : 0;
                            a < o;
                            a += 2
                          )
                            (n = e[a]), i.push(n, n in t ? t[n] : e[a + 1]);
                          return (i.t = e.t), i;
                        })(X, l, fe)),
                        rt && Ae(0)),
                      O
                        ? ((d = O._initted),
                          $e(1),
                          O.render(O.duration(), !0, !0),
                          (Q = G(he.a) - j + N + _),
                          ($ = 1 < Math.abs(N - Q)),
                          ye && $ && W.splice(W.length - 2, 2),
                          O.render(0, !0, !0),
                          d || O.invalidate(!0),
                          O.parent || O.totalTime(O.totalTime()),
                          $e(0))
                        : (Q = N),
                      g &&
                        (g.value
                          ? (g.style["overflow" + he.a.toUpperCase()] = g.value)
                          : g.style.removeProperty("overflow-" + he.a));
                  p &&
                    p.forEach(function (e) {
                      return e.revert(!1, !0);
                    }),
                    (Ce.start = R),
                    (Ce.end = L),
                    (D = B = rt ? re : Ae()),
                    de || rt || (D < re && Ae(re), (Ce.scroll.rec = 0)),
                    Ce.revert(!1, !0),
                    (Me = at()),
                    te && ((Pe = -1), te.restart(!0)),
                    (Ke = 0),
                    O &&
                      ve &&
                      (O._initted || ne) &&
                      O.progress() !== ne &&
                      O.progress(ne || 0, !0).render(O.time(), !0, !0),
                    (x ||
                      Oe !== Ce.progress ||
                      de ||
                      le ||
                      (O && !O._initted)) &&
                      (O &&
                        !ve &&
                        O.totalProgress(
                          de && R < -0.001 && !Oe
                            ? He.utils.normalize(R, L, 0)
                            : Oe,
                          !0
                        ),
                      (Ce.progress = x || (D - R) / N === Oe ? 0 : Oe)),
                    ae && se && (U._pinOffset = Math.round(Ce.progress * Q)),
                    ee && ee.invalidate(),
                    isNaN(h) ||
                      ((h -= He.getProperty(Y, he.p)),
                      (v -= He.getProperty(F, he.p)),
                      qc(Y, he, h),
                      qc(q, he, h - (n || 0)),
                      qc(F, he, v),
                      qc(I, he, v - (n || 0))),
                    x && !rt && Ce.update(),
                    !ie || rt || H || ((H = !0), ie(Ce), (H = !1));
                }
            }),
            (Ce.getVelocity = function () {
              return ((Ae() - B) / (at() - Ge)) * 1e3 || 0;
            }),
            (Ce.endAnimation = function () {
              Wa(Ce.callbackAnimation),
                O &&
                  (ee
                    ? ee.progress(1)
                    : O.paused()
                    ? ve || Wa(O, Ce.direction < 0, 1)
                    : Wa(O, O.reversed()));
            }),
            (Ce.labelToScroll = function (e) {
              return (
                (O &&
                  O.labels &&
                  (R || Ce.refresh() || R) +
                    (O.labels[e] / O.duration()) * N) ||
                0
              );
            }),
            (Ce.getTrailing = function (t) {
              var e = Ct.indexOf(Ce),
                r =
                  0 < Ce.direction ? Ct.slice(0, e).reverse() : Ct.slice(e + 1);
              return (
                ct(t)
                  ? r.filter(function (e) {
                      return e.vars.preventOverlaps === t;
                    })
                  : r
              ).filter(function (e) {
                return 0 < Ce.direction ? e.end <= R : e.start >= L;
              });
            }),
            (Ce.update = function (e, t, r) {
              if (!de || r || e) {
                var n,
                  i,
                  o,
                  a,
                  s,
                  l,
                  c,
                  u = !0 === rt ? re : Ce.scroll(),
                  f = e ? 0 : (u - R) / N,
                  d = f < 0 ? 0 : 1 < f ? 1 : f || 0,
                  p = Ce.progress;
                if (
                  (t &&
                    ((B = D),
                    (D = de ? Ae() : u),
                    ue && ((_ = w), (w = O && !ve ? O.totalProgress() : d))),
                  P &&
                    ae &&
                    !Ke &&
                    !ot &&
                    st &&
                    (!d && R < u + ((u - B) / (at() - Ge)) * P
                      ? (d = 1e-4)
                      : 1 === d &&
                        L > u + ((u - B) / (at() - Ge)) * P &&
                        (d = 0.9999)),
                  d !== p && Ce.enabled)
                ) {
                  if (
                    ((a =
                      (s =
                        (n = Ce.isActive = !!d && d < 1) != (!!p && p < 1)) ||
                      !!d != !!p),
                    (Ce.direction = p < d ? 1 : -1),
                    (Ce.progress = d),
                    a &&
                      !Ke &&
                      ((i = d && !p ? 0 : 1 === d ? 1 : 1 === p ? 2 : 3),
                      ve &&
                        ((o =
                          (!s && "none" !== we[i + 1] && we[i + 1]) || we[i]),
                        (c =
                          O && ("complete" === o || "reset" === o || o in O)))),
                    ge &&
                      (s || c) &&
                      (c || E || !O) &&
                      (Ta(ge)
                        ? ge(Ce)
                        : Ce.getTrailing(ge).forEach(function (e) {
                            return e.endAnimation();
                          })),
                    ve ||
                      (!ee || Ke || ot
                        ? O && O.totalProgress(d, !(!Ke || (!Me && !e)))
                        : (ee._dp._time - ee._start !== ee._time &&
                            ee.render(ee._dp._time - ee._start),
                          ee.resetTo
                            ? ee.resetTo("totalProgress", d, O._tTime / O._tDur)
                            : ((ee.vars.totalProgress = d),
                              ee.invalidate().restart()))),
                    ae)
                  )
                    if ((e && se && (U.style[se + he.os2] = m), ye)) {
                      if (a) {
                        if (
                          ((l =
                            !e && p < d && u < L + 1 && u + 1 >= Qa(be, he)),
                          fe)
                        )
                          if (e || (!n && !l)) oc(ae, U);
                          else {
                            var g = wt(ae, !0),
                              h = u - R;
                            oc(
                              ae,
                              Je,
                              g.top + (he === ze ? h : 0) + xt,
                              g.left + (he === ze ? 0 : h) + xt
                            );
                          }
                        Mt(n || l ? W : V),
                          ($ && d < 1 && n) || b(j + (1 !== d || l ? 0 : Q));
                      }
                    } else b(Ia(j + Q * d));
                  !ue || A.tween || Ke || ot || te.restart(!0),
                    S &&
                      (s || (ce && d && (d < 1 || !tt))) &&
                      Ve(S.targets).forEach(function (e) {
                        return e.classList[n || ce ? "add" : "remove"](
                          S.className
                        );
                      }),
                    !C || ve || e || C(Ce),
                    a && !Ke
                      ? (ve &&
                          (c &&
                            ("complete" === o
                              ? O.pause().totalProgress(1)
                              : "reset" === o
                              ? O.restart(!0).pause()
                              : "restart" === o
                              ? O.restart(!0)
                              : O[o]()),
                          C && C(Ce)),
                        (!s && tt) ||
                          (k && s && Xa(Ce, k),
                          xe[i] && Xa(Ce, xe[i]),
                          ce && (1 === d ? Ce.kill(!1, 1) : (xe[i] = 0)),
                          s || (xe[(i = 1 === d ? 1 : 3)] && Xa(Ce, xe[i]))),
                        pe &&
                          !n &&
                          Math.abs(Ce.getVelocity()) > (Ua(pe) ? pe : 2500) &&
                          (Wa(Ce.callbackAnimation),
                          ee
                            ? ee.progress(1)
                            : Wa(O, "reverse" === o ? 1 : !d, 1)))
                      : ve && C && !Ke && C(Ce);
                }
                if (x) {
                  var v = de
                    ? (u / de.duration()) * (de._caScrollDist || 0)
                    : u;
                  y(v + (Y._isFlipped ? 1 : 0)), x(v);
                }
                T && T((-u / de.duration()) * (de._caScrollDist || 0));
              }
            }),
            (Ce.enable = function (e, t) {
              Ce.enabled ||
                ((Ce.enabled = !0),
                wb(be, "resize", Lb),
                me || wb(be, "scroll", Jb),
                Se && wb(ScrollTrigger, "refreshInit", Se),
                !1 !== e && ((Ce.progress = Oe = 0), (D = B = Pe = Ae())),
                !1 !== t && Ce.refresh());
            }),
            (Ce.getTween = function (e) {
              return e && A ? A.tween : ee;
            }),
            (Ce.setPositions = function (e, t, r, n) {
              if (de) {
                var i = de.scrollTrigger,
                  o = de.duration(),
                  a = i.end - i.start;
                (e = i.start + (a * e) / o), (t = i.start + (a * t) / o);
              }
              Ce.refresh(
                !1,
                !1,
                {
                  start: Da(e, r && !!Ce._startClamp),
                  end: Da(t, r && !!Ce._endClamp),
                },
                n
              ),
                Ce.update();
            }),
            (Ce.adjustPinSpacing = function (e) {
              if (Z && e) {
                var t = Z.indexOf(he.d) + 1;
                (Z[t] = parseFloat(Z[t]) + e + xt),
                  (Z[1] = parseFloat(Z[1]) + e + xt),
                  Mt(Z);
              }
            }),
            (Ce.disable = function (e, t) {
              if (
                Ce.enabled &&
                (!1 !== e && Ce.revert(!0, !0),
                (Ce.enabled = Ce.isActive = !1),
                t || (ee && ee.pause()),
                (re = 0),
                n && (n.uncache = 1),
                Se && xb(ScrollTrigger, "refreshInit", Se),
                te && (te.pause(), A.tween && A.tween.kill() && (A.tween = 0)),
                !me)
              ) {
                for (var r = Ct.length; r--; )
                  if (Ct[r].scroller === be && Ct[r] !== Ce) return;
                xb(be, "resize", Lb), me || xb(be, "scroll", Jb);
              }
            }),
            (Ce.kill = function (e, t) {
              Ce.disable(e, t), ee && !t && ee.kill(), a && delete St[a];
              var r = Ct.indexOf(Ce);
              0 <= r && Ct.splice(r, 1),
                r === Qe && 0 < Pt && Qe--,
                (r = 0),
                Ct.forEach(function (e) {
                  return e.scroller === Ce.scroller && (r = 1);
                }),
                r || rt || (Ce.scroll.rec = 0),
                O &&
                  ((O.scrollTrigger = null),
                  e && O.revert({ kill: !1 }),
                  t || O.kill()),
                q &&
                  [q, I, Y, F].forEach(function (e) {
                    return e.parentNode && e.parentNode.removeChild(e);
                  }),
                it === Ce && (it = 0),
                ae &&
                  (n && (n.uncache = 1),
                  (r = 0),
                  Ct.forEach(function (e) {
                    return e.pin === ae && r++;
                  }),
                  r || (n.spacer = 0)),
                M.onKill && M.onKill(Ce);
            }),
            Ct.push(Ce),
            Ce.enable(!1, !1),
            o && o(Ce),
            O && O.add && !N)
          ) {
            var v = Ce.update;
            (Ce.update = function () {
              (Ce.update = v), qe.cache++, R || L || Ce.refresh();
            }),
              He.delayedCall(0.01, Ce.update),
              (N = 0.01),
              (R = L = 0);
          } else Ce.refresh();
          ae &&
            (function _queueRefreshAll() {
              if (nt !== kt) {
                var e = (nt = kt);
                requestAnimationFrame(function () {
                  return e === kt && Et(!0);
                });
              }
            })();
        } else this.update = this.refresh = this.kill = Ha;
      }),
      (ScrollTrigger.register = function register(e) {
        return (
          s ||
            ((He = e || Ka()),
            Ja() && window.document && ScrollTrigger.enable(),
            (s = lt)),
          s
        );
      }),
      (ScrollTrigger.defaults = function defaults(e) {
        if (e) for (var t in e) Tt[t] = e[t];
        return Tt;
      }),
      (ScrollTrigger.disable = function disable(t, r) {
        (lt = 0),
          Ct.forEach(function (e) {
            return e[r ? "kill" : "disable"](t);
          }),
          xb(Ne, "wheel", Jb),
          xb(Xe, "scroll", Jb),
          clearInterval(u),
          xb(Xe, "touchcancel", Ha),
          xb(Je, "touchstart", Ha),
          vb(xb, Xe, "pointerdown,touchstart,mousedown", Fa),
          vb(xb, Xe, "pointerup,touchend,mouseup", Ga),
          c.kill(),
          Ra(xb);
        for (var e = 0; e < qe.length; e += 3)
          yb(xb, qe[e], qe[e + 1]), yb(xb, qe[e], qe[e + 2]);
      }),
      (ScrollTrigger.enable = function enable() {
        if (
          ((Ne = window),
          (Xe = document),
          (We = Xe.documentElement),
          (Je = Xe.body),
          He &&
            ((Ve = He.utils.toArray),
            (Ue = He.utils.clamp),
            (x = He.core.context || Ha),
            ($e = He.core.suppressOverwrites || Ha),
            (w = Ne.history.scrollRestoration || "auto"),
            (Q = Ne.pageYOffset || 0),
            He.core.globals("ScrollTrigger", ScrollTrigger),
            Je))
        ) {
          (lt = 1),
            ((_ = document.createElement("div")).style.height = "100vh"),
            (_.style.position = "absolute"),
            Yb(),
            (function _rafBugFix() {
              return lt && requestAnimationFrame(_rafBugFix);
            })(),
            k.register(He),
            (ScrollTrigger.isTouch = k.isTouch),
            (E =
              k.isTouch && /(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent)),
            (b = 1 === k.isTouch),
            wb(Ne, "wheel", Jb),
            (l = [Ne, Xe, We, Je]),
            He.matchMedia
              ? ((ScrollTrigger.matchMedia = function (e) {
                  var t,
                    r = He.matchMedia();
                  for (t in e) r.add(t, e[t]);
                  return r;
                }),
                He.addEventListener("matchMediaInit", function () {
                  return Sb();
                }),
                He.addEventListener("matchMediaRevert", function () {
                  return Rb();
                }),
                He.addEventListener("matchMedia", function () {
                  Et(0, 1), U("matchMedia");
                }),
                He.matchMedia().add("(orientation: portrait)", function () {
                  return Kb(), Kb;
                }))
              : console.warn("Requires GSAP 3.11.0 or later"),
            Kb(),
            wb(Xe, "scroll", Jb);
          var e,
            t,
            r = Je.hasAttribute("style"),
            n = Je.style,
            i = n.borderTopStyle,
            o = He.core.Animation.prototype;
          for (
            o.revert ||
              Object.defineProperty(o, "revert", {
                value: function value() {
                  return this.time(-0.01, !0);
                },
              }),
              n.borderTopStyle = "solid",
              e = wt(Je),
              ze.m = Math.round(e.top + ze.sc()) || 0,
              Fe.m = Math.round(e.left + Fe.sc()) || 0,
              i ? (n.borderTopStyle = i) : n.removeProperty("border-top-style"),
              r || (Je.setAttribute("style", ""), Je.removeAttribute("style")),
              u = setInterval(Ib, 250),
              He.delayedCall(0.5, function () {
                return (ot = 0);
              }),
              wb(Xe, "touchcancel", Ha),
              wb(Je, "touchstart", Ha),
              vb(wb, Xe, "pointerdown,touchstart,mousedown", Fa),
              vb(wb, Xe, "pointerup,touchend,mouseup", Ga),
              f = He.utils.checkPrefix("transform"),
              ee.push(f),
              s = at(),
              c = He.delayedCall(0.2, Et).pause(),
              g = [
                Xe,
                "visibilitychange",
                function () {
                  var e = Ne.innerWidth,
                    t = Ne.innerHeight;
                  Xe.hidden ? ((d = e), (p = t)) : (d === e && p === t) || Lb();
                },
                Xe,
                "DOMContentLoaded",
                Et,
                Ne,
                "load",
                Et,
                Ne,
                "resize",
                Lb,
              ],
              Ra(wb),
              Ct.forEach(function (e) {
                return e.enable(0, 1);
              }),
              t = 0;
            t < qe.length;
            t += 3
          )
            yb(xb, qe[t], qe[t + 1]), yb(xb, qe[t], qe[t + 2]);
        }
      }),
      (ScrollTrigger.config = function config(e) {
        "limitCallbacks" in e && (tt = !!e.limitCallbacks);
        var t = e.syncInterval;
        (t && clearInterval(u)) || ((u = t) && setInterval(Ib, t)),
          "ignoreMobileResize" in e &&
            (b = 1 === ScrollTrigger.isTouch && e.ignoreMobileResize),
          "autoRefreshEvents" in e &&
            (Ra(xb) || Ra(wb, e.autoRefreshEvents || "none"),
            (h = -1 === (e.autoRefreshEvents + "").indexOf("resize")));
      }),
      (ScrollTrigger.scrollerProxy = function scrollerProxy(e, t) {
        var r = J(e),
          n = qe.indexOf(r),
          i = La(r);
        ~n && qe.splice(n, i ? 6 : 2),
          t && (i ? Ie.unshift(Ne, t, Je, t, We, t) : Ie.unshift(r, t));
      }),
      (ScrollTrigger.clearMatchMedia = function clearMatchMedia(t) {
        Ct.forEach(function (e) {
          return e._ctx && e._ctx.query === t && e._ctx.kill(!0, !0);
        });
      }),
      (ScrollTrigger.isInViewport = function isInViewport(e, t, r) {
        var n = (ct(e) ? J(e) : e).getBoundingClientRect(),
          i = n[r ? ft : dt] * t || 0;
        return r
          ? 0 < n.right - i && n.left + i < Ne.innerWidth
          : 0 < n.bottom - i && n.top + i < Ne.innerHeight;
      }),
      (ScrollTrigger.positionInViewport = function positionInViewport(e, t, r) {
        ct(e) && (e = J(e));
        var n = e.getBoundingClientRect(),
          i = n[r ? ft : dt],
          o =
            null == t
              ? i / 2
              : t in H
              ? H[t] * i
              : ~t.indexOf("%")
              ? (parseFloat(t) * i) / 100
              : parseFloat(t) || 0;
        return r ? (n.left + o) / Ne.innerWidth : (n.top + o) / Ne.innerHeight;
      }),
      (ScrollTrigger.killAll = function killAll(e) {
        if (
          (Ct.slice(0).forEach(function (e) {
            return "ScrollSmoother" !== e.vars.id && e.kill();
          }),
          !0 !== e)
        ) {
          var t = W.killAll || [];
          (W = {}),
            t.forEach(function (e) {
              return e();
            });
        }
      }),
      ScrollTrigger);
  function ScrollTrigger(e, t) {
    s ||
      ScrollTrigger.register(He) ||
      console.warn("Please gsap.registerPlugin(ScrollTrigger)"),
      x(this),
      this.init(e, t);
  }
  (ne.version = "3.12.7"),
    (ne.saveStyles = function (e) {
      return e
        ? Ve(e).forEach(function (e) {
            if (e && e.style) {
              var t = j.indexOf(e);
              0 <= t && j.splice(t, 5),
                j.push(
                  e,
                  e.style.cssText,
                  e.getBBox && e.getAttribute("transform"),
                  He.core.getCache(e),
                  x()
                );
            }
          })
        : j;
    }),
    (ne.revert = function (e, t) {
      return Sb(!e, t);
    }),
    (ne.create = function (e, t) {
      return new ne(e, t);
    }),
    (ne.refresh = function (e) {
      return e ? Lb(!0) : (s || ne.register()) && Et(!0);
    }),
    (ne.update = function (e) {
      return ++qe.cache && Z(!0 === e ? 2 : 0);
    }),
    (ne.clearScrollMemory = Tb),
    (ne.maxScroll = function (e, t) {
      return Qa(e, t ? Fe : ze);
    }),
    (ne.getScrollFunc = function (e, t) {
      return K(J(e), t ? Fe : ze);
    }),
    (ne.getById = function (e) {
      return St[e];
    }),
    (ne.getAll = function () {
      return Ct.filter(function (e) {
        return "ScrollSmoother" !== e.vars.id;
      });
    }),
    (ne.isScrolling = function () {
      return !!st;
    }),
    (ne.snapDirectional = tb),
    (ne.addEventListener = function (e, t) {
      var r = W[e] || (W[e] = []);
      ~r.indexOf(t) || r.push(t);
    }),
    (ne.removeEventListener = function (e, t) {
      var r = W[e],
        n = r && r.indexOf(t);
      0 <= n && r.splice(n, 1);
    }),
    (ne.batch = function (e, t) {
      function Ep(e, t) {
        var r = [],
          n = [],
          i = He.delayedCall(o, function () {
            t(r, n), (r = []), (n = []);
          }).pause();
        return function (e) {
          r.length || i.restart(!0),
            r.push(e.trigger),
            n.push(e),
            a <= r.length && i.progress(1);
        };
      }
      var r,
        n = [],
        i = {},
        o = t.interval || 0.016,
        a = t.batchMax || 1e9;
      for (r in t)
        i[r] =
          "on" === r.substr(0, 2) && Ta(t[r]) && "onRefreshInit" !== r
            ? Ep(0, t[r])
            : t[r];
      return (
        Ta(a) &&
          ((a = a()),
          wb(ne, "refresh", function () {
            return (a = t.batchMax());
          })),
        Ve(e).forEach(function (e) {
          var t = {};
          for (r in i) t[r] = i[r];
          (t.trigger = e), n.push(ne.create(t));
        }),
        n
      );
    });
  function tc(e, t, r, n) {
    return (
      n < t ? e(n) : t < 0 && e(0),
      n < r ? (n - t) / (r - t) : r < 0 ? t / (t - r) : 1
    );
  }
  function uc(e, t) {
    !0 === t
      ? e.style.removeProperty("touch-action")
      : (e.style.touchAction =
          !0 === t
            ? "auto"
            : t
            ? "pan-" + t + (k.isTouch ? " pinch-zoom" : "")
            : "none"),
      e === We && uc(Je, t);
  }
  function wc(e) {
    var t,
      r = e.event,
      n = e.target,
      i = e.axis,
      o = (r.changedTouches ? r.changedTouches[0] : r).target,
      a = o._gsap || He.core.getCache(o),
      s = at();
    if (!a._isScrollT || 2e3 < s - a._isScrollT) {
      for (
        ;
        o &&
        o !== Je &&
        ((o.scrollHeight <= o.clientHeight && o.scrollWidth <= o.clientWidth) ||
          (!oe[(t = mb(o)).overflowY] && !oe[t.overflowX]));

      )
        o = o.parentNode;
      (a._isScroll =
        o &&
        o !== n &&
        !La(o) &&
        (oe[(t = mb(o)).overflowY] || oe[t.overflowX])),
        (a._isScrollT = s);
    }
    (!a._isScroll && "x" !== i) || (r.stopPropagation(), (r._gsapAllow = !0));
  }
  function xc(e, t, r, n) {
    return k.create({
      target: e,
      capture: !0,
      debounce: !1,
      lockAxis: !0,
      type: t,
      onWheel: (n = n && wc),
      onPress: n,
      onDrag: n,
      onScroll: n,
      onEnable: function onEnable() {
        return r && wb(Xe, k.eventTypes[0], se, !1, !0);
      },
      onDisable: function onDisable() {
        return xb(Xe, k.eventTypes[0], se, !0);
      },
    });
  }
  function Bc(e) {
    function Bq() {
      return (i = !1);
    }
    function Eq() {
      (o = Qa(p, ze)),
        (S = Ue(E ? 1 : 0, o)),
        f && (C = Ue(0, Qa(p, Fe))),
        (l = kt);
    }
    function Fq() {
      (v._gsap.y = Ia(parseFloat(v._gsap.y) + b.offset) + "px"),
        (v.style.transform =
          "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " +
          parseFloat(v._gsap.y) +
          ", 0, 1)"),
        (b.offset = b.cacheID = 0);
    }
    function Lq() {
      Eq(),
        a.isActive() &&
          a.vars.scrollY > o &&
          (b() > o ? a.progress(1) && b(o) : a.resetTo("scrollY", o));
    }
    Va(e) || (e = {}),
      (e.preventDefault = e.isNormalizer = e.allowClicks = !0),
      e.type || (e.type = "wheel,touch"),
      (e.debounce = !!e.debounce),
      (e.id = e.id || "normalizer");
    var n,
      o,
      l,
      i,
      a,
      c,
      u,
      s,
      f = e.normalizeScrollX,
      t = e.momentum,
      r = e.allowNestedScroll,
      d = e.onRelease,
      p = J(e.target) || We,
      g = He.core.globals().ScrollSmoother,
      h = g && g.get(),
      v =
        E &&
        ((e.content && J(e.content)) ||
          (h && !1 !== e.content && !h.smooth() && h.content())),
      b = K(p, ze),
      m = K(p, Fe),
      y = 1,
      x =
        (k.isTouch && Ne.visualViewport
          ? Ne.visualViewport.scale * Ne.visualViewport.width
          : Ne.outerWidth) / Ne.innerWidth,
      w = 0,
      _ = Ta(t)
        ? function () {
            return t(n);
          }
        : function () {
            return t || 2.8;
          },
      T = xc(p, e.type, !0, r),
      C = Ha,
      S = Ha;
    return (
      v && He.set(v, { y: "+=0" }),
      (e.ignoreCheck = function (e) {
        return (
          (E &&
            "touchmove" === e.type &&
            (function ignoreDrag() {
              if (i) {
                requestAnimationFrame(Bq);
                var e = Ia(n.deltaY / 2),
                  t = S(b.v - e);
                if (v && t !== b.v + b.offset) {
                  b.offset = t - b.v;
                  var r = Ia((parseFloat(v && v._gsap.y) || 0) - b.offset);
                  (v.style.transform =
                    "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " +
                    r +
                    ", 0, 1)"),
                    (v._gsap.y = r + "px"),
                    (b.cacheID = qe.cache),
                    Z();
                }
                return !0;
              }
              b.offset && Fq(), (i = !0);
            })()) ||
          (1.05 < y && "touchstart" !== e.type) ||
          n.isGesturing ||
          (e.touches && 1 < e.touches.length)
        );
      }),
      (e.onPress = function () {
        i = !1;
        var e = y;
        (y = Ia(((Ne.visualViewport && Ne.visualViewport.scale) || 1) / x)),
          a.pause(),
          e !== y && uc(p, 1.01 < y || (!f && "x")),
          (c = m()),
          (u = b()),
          Eq(),
          (l = kt);
      }),
      (e.onRelease = e.onGestureStart =
        function (e, t) {
          if ((b.offset && Fq(), t)) {
            qe.cache++;
            var r,
              n,
              i = _();
            f &&
              ((n = (r = m()) + (0.05 * i * -e.velocityX) / 0.227),
              (i *= tc(m, r, n, Qa(p, Fe))),
              (a.vars.scrollX = C(n))),
              (n = (r = b()) + (0.05 * i * -e.velocityY) / 0.227),
              (i *= tc(b, r, n, Qa(p, ze))),
              (a.vars.scrollY = S(n)),
              a.invalidate().duration(i).play(0.01),
              ((E && a.vars.scrollY >= o) || o - 1 <= r) &&
                He.to({}, { onUpdate: Lq, duration: i });
          } else s.restart(!0);
          d && d(e);
        }),
      (e.onWheel = function () {
        a._ts && a.pause(), 1e3 < at() - w && ((l = 0), (w = at()));
      }),
      (e.onChange = function (e, t, r, n, i) {
        if (
          (kt !== l && Eq(),
          t && f && m(C(n[2] === t ? c + (e.startX - e.x) : m() + t - n[1])),
          r)
        ) {
          b.offset && Fq();
          var o = i[2] === r,
            a = o ? u + e.startY - e.y : b() + r - i[1],
            s = S(a);
          o && a !== s && (u += s - a), b(s);
        }
        (r || t) && Z();
      }),
      (e.onEnable = function () {
        uc(p, !f && "x"),
          ne.addEventListener("refresh", Lq),
          wb(Ne, "resize", Lq),
          b.smooth &&
            ((b.target.style.scrollBehavior = "auto"),
            (b.smooth = m.smooth = !1)),
          T.enable();
      }),
      (e.onDisable = function () {
        uc(p, !0),
          xb(Ne, "resize", Lq),
          ne.removeEventListener("refresh", Lq),
          T.kill();
      }),
      (e.lockAxis = !1 !== e.lockAxis),
      ((n = new k(e)).iOS = E) && !b() && b(1),
      E && He.ticker.add(Ha),
      (s = n._dc),
      (a = He.to(n, {
        ease: "power4",
        paused: !0,
        inherit: !1,
        scrollX: f ? "+=0.1" : "+=0",
        scrollY: "+=0.1",
        modifiers: {
          scrollY: pc(b, b(), function () {
            return a.pause();
          }),
        },
        onUpdate: Z,
        onComplete: s.vars.onComplete,
      })),
      n
    );
  }
  var ie,
    oe = { auto: 1, scroll: 1 },
    ae = /(input|label|select|textarea)/i,
    se = function _captureInputs(e) {
      var t = ae.test(e.target.tagName);
      (t || ie) && ((e._gsapAllow = !0), (ie = t));
    };
  (ne.sort = function (e) {
    if (Ta(e)) return Ct.sort(e);
    var t = Ne.pageYOffset || 0;
    return (
      ne.getAll().forEach(function (e) {
        return (e._sortY = e.trigger
          ? t + e.trigger.getBoundingClientRect().top
          : e.start + Ne.innerHeight);
      }),
      Ct.sort(
        e ||
          function (e, t) {
            return (
              -1e6 * (e.vars.refreshPriority || 0) +
              (e.vars.containerAnimation ? 1e6 : e._sortY) -
              ((t.vars.containerAnimation ? 1e6 : t._sortY) +
                -1e6 * (t.vars.refreshPriority || 0))
            );
          }
      )
    );
  }),
    (ne.observe = function (e) {
      return new k(e);
    }),
    (ne.normalizeScroll = function (e) {
      if (void 0 === e) return v;
      if (!0 === e && v) return v.enable();
      if (!1 === e) return v && v.kill(), void (v = e);
      var t = e instanceof k ? e : Bc(e);
      return v && v.target === t.target && v.kill(), La(t.target) && (v = t), t;
    }),
    (ne.core = {
      _getVelocityProp: L,
      _inputObserver: xc,
      _scrollers: qe,
      _proxies: Ie,
      bridge: {
        ss: function ss() {
          st || U("scrollStart"), (st = at());
        },
        ref: function ref() {
          return Ke;
        },
      },
    }),
    Ka() && He.registerPlugin(ne),
    (e.ScrollTrigger = ne),
    (e.default = ne);
  if (typeof window === "undefined" || window !== e) {
    Object.defineProperty(e, "__esModule", { value: !0 });
  } else {
    delete e.default;
  }
});
/*!
 * GSDevTools 3.12.7
 * https://gsap.com
 *
 * @license Copyright 2025, GreenSock. All rights reserved.
 * This plugin is a membership benefit of Club GSAP and is only authorized for use in sites/apps/products developed by individuals/companies with an active Club GSAP membership. See https://gsap.com/pricing
 * @author: Jack Doyle, jack@greensock.com
 */

!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? t(exports)
    : "function" == typeof define && define.amd
    ? define(["exports"], t)
    : t(((e = e || self).window = e.window || {}));
})(this, function (e) {
  "use strict";
  function _assertThisInitialized(e) {
    if (void 0 === e)
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called"
      );
    return e;
  }
  function w(e, t) {
    if (e.parentNode && (g || T(e))) {
      var o = P(e),
        n = o
          ? o.getAttribute("xmlns") || "http://www.w3.org/2000/svg"
          : "http://www.w3.org/1999/xhtml",
        i = o ? (t ? "rect" : "g") : "div",
        a = 2 !== t ? 0 : 100,
        r = 3 === t ? 100 : 0,
        s =
          "position:absolute;display:block;pointer-events:none;margin:0;padding:0;",
        l = g.createElementNS
          ? g.createElementNS(n.replace(/^https/, "http"), i)
          : g.createElement(i);
      return (
        t &&
          (o
            ? ((f = f || w(e)),
              l.setAttribute("width", 0.01),
              l.setAttribute("height", 0.01),
              l.setAttribute("transform", "translate(" + a + "," + r + ")"),
              f.appendChild(l))
            : (h || ((h = w(e)).style.cssText = s),
              (l.style.cssText =
                s +
                "width:0.1px;height:0.1px;top:" +
                r +
                "px;left:" +
                a +
                "px"),
              h.appendChild(l))),
        l
      );
    }
    throw "Need document and parent.";
  }
  function A(e, t, o, n, i, a, r) {
    return (e.a = t), (e.b = o), (e.c = n), (e.d = i), (e.e = a), (e.f = r), e;
  }
  var g,
    u,
    a,
    r,
    h,
    f,
    m,
    v,
    x,
    t,
    y = "transform",
    b = y + "Origin",
    T = function _setDoc(e) {
      var t = e.ownerDocument || e;
      !(y in e.style) &&
        "msTransform" in e.style &&
        (b = (y = "msTransform") + "Origin");
      for (; t.parentNode && (t = t.parentNode); );
      if (((u = window), (m = new fe()), t)) {
        (a = (g = t).documentElement),
          (r = t.body),
          ((v = g.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
          )).style.transform = "none");
        var o = t.createElement("div"),
          n = t.createElement("div"),
          i = t && (t.body || t.firstElementChild);
        i &&
          i.appendChild &&
          (i.appendChild(o),
          o.appendChild(n),
          o.setAttribute(
            "style",
            "position:static;transform:translate3d(0,0,1px)"
          ),
          (x = n.offsetParent !== o),
          i.removeChild(o));
      }
      return t;
    },
    M = function _forceNonZeroScale(e) {
      for (var t, o; e && e !== r; )
        (o = e._gsap) && o.uncache && o.get(e, "x"),
          o &&
            !o.scaleX &&
            !o.scaleY &&
            o.renderTransform &&
            ((o.scaleX = o.scaleY = 1e-4),
            o.renderTransform(1, o),
            t ? t.push(o) : (t = [o])),
          (e = e.parentNode);
      return t;
    },
    k = [],
    D = [],
    S = function _getDocScrollTop() {
      return u.pageYOffset || g.scrollTop || a.scrollTop || r.scrollTop || 0;
    },
    E = function _getDocScrollLeft() {
      return u.pageXOffset || g.scrollLeft || a.scrollLeft || r.scrollLeft || 0;
    },
    P = function _svgOwner(e) {
      return (
        e.ownerSVGElement ||
        ("svg" === (e.tagName + "").toLowerCase() ? e : null)
      );
    },
    C = function _isFixed(e) {
      return (
        "fixed" === u.getComputedStyle(e).position ||
        ((e = e.parentNode) && 1 === e.nodeType ? _isFixed(e) : void 0)
      );
    },
    L = function _placeSiblings(e, t) {
      var o,
        n,
        i,
        a,
        r,
        s,
        l = P(e),
        c = e === l,
        d = l ? k : D,
        p = e.parentNode;
      if (e === u) return e;
      if ((d.length || d.push(w(e, 1), w(e, 2), w(e, 3)), (o = l ? f : h), l))
        c
          ? ((a =
              -(i = (function _getCTM(e) {
                var t,
                  o = e.getCTM();
                return (
                  o ||
                    ((t = e.style[y]),
                    (e.style[y] = "none"),
                    e.appendChild(v),
                    (o = v.getCTM()),
                    e.removeChild(v),
                    t
                      ? (e.style[y] = t)
                      : e.style.removeProperty(
                          y.replace(/([A-Z])/g, "-$1").toLowerCase()
                        )),
                  o || m.clone()
                );
              })(e)).e / i.a),
            (r = -i.f / i.d),
            (n = m))
          : e.getBBox
          ? ((i = e.getBBox()),
            (a =
              (n = (n = e.transform ? e.transform.baseVal : {}).numberOfItems
                ? 1 < n.numberOfItems
                  ? (function _consolidate(e) {
                      for (var t = new fe(), o = 0; o < e.numberOfItems; o++)
                        t.multiply(e.getItem(o).matrix);
                      return t;
                    })(n)
                  : n.getItem(0).matrix
                : m).a *
                i.x +
              n.c * i.y),
            (r = n.b * i.x + n.d * i.y))
          : ((n = new fe()), (a = r = 0)),
          t && "g" === e.tagName.toLowerCase() && (a = r = 0),
          (c ? l : p).appendChild(o),
          o.setAttribute(
            "transform",
            "matrix(" +
              n.a +
              "," +
              n.b +
              "," +
              n.c +
              "," +
              n.d +
              "," +
              (n.e + a) +
              "," +
              (n.f + r) +
              ")"
          );
      else {
        if (((a = r = 0), x))
          for (
            n = e.offsetParent, i = e;
            (i = i && i.parentNode) && i !== n && i.parentNode;

          )
            4 < (u.getComputedStyle(i)[y] + "").length &&
              ((a = i.offsetLeft), (r = i.offsetTop), (i = 0));
        if (
          "absolute" !== (s = u.getComputedStyle(e)).position &&
          "fixed" !== s.position
        )
          for (n = e.offsetParent; p && p !== n; )
            (a += p.scrollLeft || 0),
              (r += p.scrollTop || 0),
              (p = p.parentNode);
        ((i = o.style).top = e.offsetTop - r + "px"),
          (i.left = e.offsetLeft - a + "px"),
          (i[y] = s[y]),
          (i[b] = s[b]),
          (i.position = "fixed" === s.position ? "fixed" : "absolute"),
          e.parentNode.appendChild(o);
      }
      return o;
    },
    fe =
      (((t = Matrix2D.prototype).inverse = function inverse() {
        var e = this.a,
          t = this.b,
          o = this.c,
          n = this.d,
          i = this.e,
          a = this.f,
          r = e * n - t * o || 1e-10;
        return A(
          this,
          n / r,
          -t / r,
          -o / r,
          e / r,
          (o * a - n * i) / r,
          -(e * a - t * i) / r
        );
      }),
      (t.multiply = function multiply(e) {
        var t = this.a,
          o = this.b,
          n = this.c,
          i = this.d,
          a = this.e,
          r = this.f,
          s = e.a,
          l = e.c,
          c = e.b,
          d = e.d,
          p = e.e,
          u = e.f;
        return A(
          this,
          s * t + c * n,
          s * o + c * i,
          l * t + d * n,
          l * o + d * i,
          a + p * t + u * n,
          r + p * o + u * i
        );
      }),
      (t.clone = function clone() {
        return new Matrix2D(this.a, this.b, this.c, this.d, this.e, this.f);
      }),
      (t.equals = function equals(e) {
        var t = this.a,
          o = this.b,
          n = this.c,
          i = this.d,
          a = this.e,
          r = this.f;
        return (
          t === e.a &&
          o === e.b &&
          n === e.c &&
          i === e.d &&
          a === e.e &&
          r === e.f
        );
      }),
      (t.apply = function apply(e, t) {
        void 0 === t && (t = {});
        var o = e.x,
          n = e.y,
          i = this.a,
          a = this.b,
          r = this.c,
          s = this.d,
          l = this.e,
          c = this.f;
        return (
          (t.x = o * i + n * r + l || 0), (t.y = o * a + n * s + c || 0), t
        );
      }),
      Matrix2D);
  function Matrix2D(e, t, o, n, i, a) {
    void 0 === e && (e = 1),
      void 0 === t && (t = 0),
      void 0 === o && (o = 0),
      void 0 === n && (n = 1),
      void 0 === i && (i = 0),
      void 0 === a && (a = 0),
      A(this, e, t, o, n, i, a);
  }
  function getGlobalMatrix(e, t, o, n) {
    if (!e || !e.parentNode || (g || T(e)).documentElement === e)
      return new fe();
    var i = M(e),
      a = P(e) ? k : D,
      r = L(e, o),
      s = a[0].getBoundingClientRect(),
      l = a[1].getBoundingClientRect(),
      c = a[2].getBoundingClientRect(),
      d = r.parentNode,
      p = !n && C(e),
      u = new fe(
        (l.left - s.left) / 100,
        (l.top - s.top) / 100,
        (c.left - s.left) / 100,
        (c.top - s.top) / 100,
        s.left + (p ? 0 : E()),
        s.top + (p ? 0 : S())
      );
    if ((d.removeChild(r), i))
      for (s = i.length; s--; )
        ((l = i[s]).scaleX = l.scaleY = 0), l.renderTransform(1, l);
    return t ? u.inverse() : u;
  }
  function X() {
    return "undefined" != typeof window;
  }
  function Y() {
    return me || (X() && (me = window.gsap) && me.registerPlugin && me);
  }
  function Z(e) {
    return "function" == typeof e;
  }
  function $(e) {
    return "object" == typeof e;
  }
  function _(e) {
    return void 0 === e;
  }
  function aa() {
    return !1;
  }
  function da(e) {
    return Math.round(1e4 * e) / 1e4;
  }
  function fa(e, t) {
    var o = xe.createElementNS
      ? xe.createElementNS(
          (t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"),
          e
        )
      : xe.createElement(e);
    return o.style ? o : xe.createElement(e);
  }
  function ra(e, t) {
    var o,
      n = {};
    for (o in e) n[o] = t ? e[o] * t : e[o];
    return n;
  }
  function ta(e, t) {
    for (var o, n = e.length; n--; )
      t
        ? (e[n].style.touchAction = t)
        : e[n].style.removeProperty("touch-action"),
        (o = e[n].children) && o.length && ta(o, t);
  }
  function ua() {
    return Be.forEach(function (e) {
      return e();
    });
  }
  function wa() {
    return !Be.length && me.ticker.remove(ua);
  }
  function xa(e) {
    for (var t = Be.length; t--; ) Be[t] === e && Be.splice(t, 1);
    me.to(wa, {
      overwrite: !0,
      delay: 15,
      duration: 0,
      onComplete: wa,
      data: "_draggable",
    });
  }
  function za(e, t, o, n) {
    if (e.addEventListener) {
      var i = Me[t];
      (n = n || (d ? { passive: !1 } : null)),
        e.addEventListener(i || t, o, n),
        i && t !== i && e.addEventListener(t, o, n);
    }
  }
  function Aa(e, t, o, n) {
    if (e.removeEventListener) {
      var i = Me[t];
      e.removeEventListener(i || t, o, n),
        i && t !== i && e.removeEventListener(t, o, n);
    }
  }
  function Ba(e) {
    e.preventDefault && e.preventDefault(),
      e.preventManipulation && e.preventManipulation();
  }
  function Da(e) {
    (ke = e.touches && Ye < e.touches.length), Aa(e.target, "touchend", Da);
  }
  function Ea(e) {
    (ke = e.touches && Ye < e.touches.length), za(e.target, "touchend", Da);
  }
  function Fa(e) {
    return (
      ve.pageYOffset ||
      e.scrollTop ||
      e.documentElement.scrollTop ||
      e.body.scrollTop ||
      0
    );
  }
  function Ga(e) {
    return (
      ve.pageXOffset ||
      e.scrollLeft ||
      e.documentElement.scrollLeft ||
      e.body.scrollLeft ||
      0
    );
  }
  function Ha(e, t) {
    za(e, "scroll", t), We(e.parentNode) || Ha(e.parentNode, t);
  }
  function Ia(e, t) {
    Aa(e, "scroll", t), We(e.parentNode) || Ia(e.parentNode, t);
  }
  function Ka(e, t) {
    var o = "x" === t ? "Width" : "Height",
      n = "scroll" + o,
      i = "client" + o;
    return Math.max(
      0,
      We(e)
        ? Math.max(ye[n], s[n]) - (ve["inner" + o] || ye[i] || s[i])
        : e[n] - e[i]
    );
  }
  function La(e, t) {
    var o = Ka(e, "x"),
      n = Ka(e, "y");
    We(e) ? (e = Ge) : La(e.parentNode, t),
      (e._gsMaxScrollX = o),
      (e._gsMaxScrollY = n),
      t ||
        ((e._gsScrollX = e.scrollLeft || 0), (e._gsScrollY = e.scrollTop || 0));
  }
  function Ma(e, t, o) {
    var n = e.style;
    n &&
      (_(n[t]) && (t = c(t, e) || t),
      null == o
        ? n.removeProperty &&
          n.removeProperty(t.replace(/([A-Z])/g, "-$1").toLowerCase())
        : (n[t] = o));
  }
  function Na(e) {
    return ve.getComputedStyle(
      e instanceof Element ? e : e.host || (e.parentNode || {}).host || e
    );
  }
  function Pa(e) {
    if (e === ve)
      return (
        (p.left = p.top = 0),
        (p.width = p.right =
          ye.clientWidth || e.innerWidth || s.clientWidth || 0),
        (p.height = p.bottom =
          (e.innerHeight || 0) - 20 < ye.clientHeight
            ? ye.clientHeight
            : e.innerHeight || s.clientHeight || 0),
        p
      );
    var t = e.ownerDocument || xe,
      o = _(e.pageX)
        ? e.nodeType || _(e.left) || _(e.top)
          ? _e(e)[0].getBoundingClientRect()
          : e
        : {
            left: e.pageX - Ga(t),
            top: e.pageY - Fa(t),
            right: e.pageX - Ga(t) + 1,
            bottom: e.pageY - Fa(t) + 1,
          };
    return (
      _(o.right) && !_(o.width)
        ? ((o.right = o.left + o.width), (o.bottom = o.top + o.height))
        : _(o.width) &&
          (o = {
            width: o.right - o.left,
            height: o.bottom - o.top,
            right: o.right,
            left: o.left,
            bottom: o.bottom,
            top: o.top,
          }),
      o
    );
  }
  function Qa(e, t, o) {
    var n,
      i = e.vars,
      a = i[o],
      r = e._listeners[t];
    return (
      Z(a) &&
        (n = a.apply(
          i.callbackScope || e,
          i[o + "Params"] || [e.pointerEvent]
        )),
      r && !1 === e.dispatchEvent(t) && (n = !1),
      n
    );
  }
  function Ra(e, t) {
    var o,
      n,
      i,
      a = _e(e)[0];
    return a.nodeType || a === ve
      ? B(a, t)
      : _(e.left)
      ? {
          left: (n = e.min || e.minX || e.minRotation || 0),
          top: (o = e.min || e.minY || 0),
          width: (e.max || e.maxX || e.maxRotation || 0) - n,
          height: (e.max || e.maxY || 0) - o,
        }
      : ((i = { x: 0, y: 0 }),
        {
          left: e.left - i.x,
          top: e.top - i.y,
          width: e.width,
          height: e.height,
        });
  }
  function Ua(i, a, e, t, r, o) {
    var n,
      s,
      l,
      c = {};
    if (a)
      if (1 !== r && a instanceof Array) {
        if (((c.end = n = []), (l = a.length), $(a[0])))
          for (s = 0; s < l; s++) n[s] = ra(a[s], r);
        else for (s = 0; s < l; s++) n[s] = a[s] * r;
        (e += 1.1), (t -= 1.1);
      } else
        Z(a)
          ? (c.end = function (e) {
              var t,
                o,
                n = a.call(i, e);
              if (1 !== r)
                if ($(n)) {
                  for (o in ((t = {}), n)) t[o] = n[o] * r;
                  n = t;
                } else n *= r;
              return n;
            })
          : (c.end = a);
    return (
      (!e && 0 !== e) || (c.max = e),
      (!t && 0 !== t) || (c.min = t),
      o && (c.velocity = 0),
      c
    );
  }
  function Va(e) {
    var t;
    return (
      !(!e || !e.getAttribute || e === s) &&
      (!(
        "true" !== (t = e.getAttribute("data-clickable")) &&
        ("false" === t ||
          (!n.test(e.nodeName + "") &&
            "true" !== e.getAttribute("contentEditable")))
      ) ||
        Va(e.parentNode))
    );
  }
  function Wa(e, t) {
    for (var o, n = e.length; n--; )
      ((o = e[n]).ondragstart = o.onselectstart = t ? null : aa),
        me.set(o, { lazy: !0, userSelect: t ? "text" : "none" });
  }
  function $a(a, i) {
    (a = me.utils.toArray(a)[0]), (i = i || {});
    var r,
      s,
      l,
      e,
      c,
      d,
      p = document.createElement("div"),
      u = p.style,
      t = a.firstChild,
      g = 0,
      h = 0,
      f = a.scrollTop,
      m = a.scrollLeft,
      v = a.scrollWidth,
      x = a.scrollHeight,
      y = 0,
      b = 0,
      w = 0;
    N && !1 !== i.force3D
      ? ((c = "translate3d("), (d = "px,0px)"))
      : R && ((c = "translate("), (d = "px)")),
      (this.scrollTop = function (e, t) {
        if (!arguments.length) return -this.top();
        this.top(-e, t);
      }),
      (this.scrollLeft = function (e, t) {
        if (!arguments.length) return -this.left();
        this.left(-e, t);
      }),
      (this.left = function (e, t) {
        if (!arguments.length) return -(a.scrollLeft + h);
        var o = a.scrollLeft - m,
          n = h;
        if ((2 < o || o < -2) && !t)
          return (
            (m = a.scrollLeft),
            me.killTweensOf(this, { left: 1, scrollLeft: 1 }),
            this.left(-m),
            void (i.onKill && i.onKill())
          );
        (e = -e) < 0
          ? ((h = (e - 0.5) | 0), (e = 0))
          : b < e
          ? ((h = (e - b) | 0), (e = b))
          : (h = 0),
          (h || n) &&
            (this._skip || (u[R] = c + -h + "px," + -g + d),
            0 <= h + y && (u.paddingRight = h + y + "px")),
          (a.scrollLeft = 0 | e),
          (m = a.scrollLeft);
      }),
      (this.top = function (e, t) {
        if (!arguments.length) return -(a.scrollTop + g);
        var o = a.scrollTop - f,
          n = g;
        if ((2 < o || o < -2) && !t)
          return (
            (f = a.scrollTop),
            me.killTweensOf(this, { top: 1, scrollTop: 1 }),
            this.top(-f),
            void (i.onKill && i.onKill())
          );
        (e = -e) < 0
          ? ((g = (e - 0.5) | 0), (e = 0))
          : w < e
          ? ((g = (e - w) | 0), (e = w))
          : (g = 0),
          (g || n) && (this._skip || (u[R] = c + -h + "px," + -g + d)),
          (a.scrollTop = 0 | e),
          (f = a.scrollTop);
      }),
      (this.maxScrollTop = function () {
        return w;
      }),
      (this.maxScrollLeft = function () {
        return b;
      }),
      (this.disable = function () {
        for (t = p.firstChild; t; )
          (e = t.nextSibling), a.appendChild(t), (t = e);
        a === p.parentNode && a.removeChild(p);
      }),
      (this.enable = function () {
        if ((t = a.firstChild) !== p) {
          for (; t; ) (e = t.nextSibling), p.appendChild(t), (t = e);
          a.appendChild(p), this.calibrate();
        }
      }),
      (this.calibrate = function (e) {
        var t,
          o,
          n,
          i = a.clientWidth === r;
        (f = a.scrollTop),
          (m = a.scrollLeft),
          (i &&
            a.clientHeight === s &&
            p.offsetHeight === l &&
            v === a.scrollWidth &&
            x === a.scrollHeight &&
            !e) ||
            ((g || h) &&
              ((o = this.left()),
              (n = this.top()),
              this.left(-a.scrollLeft),
              this.top(-a.scrollTop)),
            (t = Na(a)),
            (i && !e) ||
              ((u.display = "block"),
              (u.width = "auto"),
              (u.paddingRight = "0px"),
              (y = Math.max(0, a.scrollWidth - a.clientWidth)) &&
                (y +=
                  parseFloat(t.paddingLeft) +
                  (z ? parseFloat(t.paddingRight) : 0))),
            (u.display = "inline-block"),
            (u.position = "relative"),
            (u.overflow = "visible"),
            (u.verticalAlign = "top"),
            (u.boxSizing = "content-box"),
            (u.width = "100%"),
            (u.paddingRight = y + "px"),
            z && (u.paddingBottom = t.paddingBottom),
            (r = a.clientWidth),
            (s = a.clientHeight),
            (v = a.scrollWidth),
            (x = a.scrollHeight),
            (b = a.scrollWidth - r),
            (w = a.scrollHeight - s),
            (l = p.offsetHeight),
            (u.display = "block"),
            (o || n) && (this.left(o), this.top(n)));
      }),
      (this.content = p),
      (this.element = a),
      (this._skip = !1),
      this.enable();
  }
  function _a(e) {
    if (X() && document.body) {
      var t = window && window.navigator;
      (ve = window),
        (xe = document),
        (ye = xe.documentElement),
        (s = xe.body),
        (l = fa("div")),
        (Pe = !!window.PointerEvent),
        ((be = fa("div")).style.cssText =
          "visibility:hidden;height:1px;top:-1px;pointer-events:none;position:relative;clear:both;cursor:grab"),
        (Ee = "grab" === be.style.cursor ? "grab" : "move"),
        (De = t && -1 !== t.userAgent.toLowerCase().indexOf("android")),
        (Te =
          ("ontouchstart" in ye && "orientation" in ve) ||
          (t && (0 < t.MaxTouchPoints || 0 < t.msMaxTouchPoints))),
        (n = fa("div")),
        (i = fa("div")),
        (a = i.style),
        (r = s),
        (a.display = "inline-block"),
        (a.position = "relative"),
        (n.style.cssText =
          "width:90px;height:40px;padding:10px;overflow:auto;visibility:hidden"),
        n.appendChild(i),
        r.appendChild(n),
        (o = i.offsetHeight + 18 > n.scrollHeight),
        r.removeChild(n),
        (z = o),
        (Me = (function (e) {
          for (
            var t = e.split(","),
              o = (
                ("onpointerdown" in l)
                  ? "pointerdown,pointermove,pointerup,pointercancel"
                  : ("onmspointerdown" in l)
                  ? "MSPointerDown,MSPointerMove,MSPointerUp,MSPointerCancel"
                  : e
              ).split(","),
              n = {},
              i = 4;
            -1 < --i;

          )
            (n[t[i]] = o[i]), (n[o[i]] = t[i]);
          try {
            ye.addEventListener(
              "test",
              null,
              Object.defineProperty({}, "passive", {
                get: function get() {
                  d = 1;
                },
              })
            );
          } catch (e) {}
          return n;
        })("touchstart,touchmove,touchend,touchcancel")),
        za(xe, "touchcancel", aa),
        za(ve, "touchmove", aa),
        s && s.addEventListener("touchstart", aa),
        za(xe, "contextmenu", function () {
          for (var e in He) He[e].isPressed && He[e].endDrag();
        }),
        (me = we = Y());
    }
    var o, n, i, a, r;
    me
      ? ((Se = me.plugins.inertia),
        (Ce = me.core.context || function () {}),
        (c = me.utils.checkPrefix),
        (R = c(R)),
        (Ne = c(Ne)),
        (_e = me.utils.toArray),
        (Le = me.core.getStyleSaver),
        (N = !!c("perspective")))
      : e && console.warn("Please gsap.registerPlugin(Draggable)");
  }
  var me,
    ve,
    xe,
    ye,
    s,
    l,
    be,
    we,
    c,
    _e,
    d,
    Te,
    Me,
    ke,
    De,
    Se,
    Ee,
    Pe,
    Ce,
    Le,
    N,
    z,
    o,
    Ye = 0,
    R = "transform",
    Ne = "transformOrigin",
    ze = Array.isArray,
    Re = 180 / Math.PI,
    Ae = 1e20,
    i = new fe(),
    Xe =
      Date.now ||
      function () {
        return new Date().getTime();
      },
    Be = [],
    He = {},
    Oe = 0,
    n = /^(?:a|input|textarea|button|select)$/i,
    Ie = 0,
    Fe = {},
    Ge = {},
    We = function _isRoot(e) {
      return !(
        e &&
        e !== ye &&
        9 !== e.nodeType &&
        e !== xe.body &&
        e !== ve &&
        e.nodeType &&
        e.parentNode
      );
    },
    p = {},
    Ze = {},
    B = function _getElementBounds(e, t) {
      t = _e(t)[0];
      var o,
        n,
        i,
        a,
        r,
        s,
        l,
        c,
        d,
        p,
        u,
        g,
        h,
        f = e.getBBox && e.ownerSVGElement,
        m = e.ownerDocument || xe;
      if (e === ve)
        (i = Fa(m)),
          (n =
            (o = Ga(m)) +
            (m.documentElement.clientWidth ||
              e.innerWidth ||
              m.body.clientWidth ||
              0)),
          (a =
            i +
            ((e.innerHeight || 0) - 20 < m.documentElement.clientHeight
              ? m.documentElement.clientHeight
              : e.innerHeight || m.body.clientHeight || 0));
      else {
        if (t === ve || _(t)) return e.getBoundingClientRect();
        (o = i = 0),
          f
            ? ((u = (p = e.getBBox()).width), (g = p.height))
            : (e.viewBox &&
                (p = e.viewBox.baseVal) &&
                ((o = p.x || 0), (i = p.y || 0), (u = p.width), (g = p.height)),
              u ||
                ((p = "border-box" === (h = Na(e)).boxSizing),
                (u =
                  (parseFloat(h.width) || e.clientWidth || 0) +
                  (p
                    ? 0
                    : parseFloat(h.borderLeftWidth) +
                      parseFloat(h.borderRightWidth))),
                (g =
                  (parseFloat(h.height) || e.clientHeight || 0) +
                  (p
                    ? 0
                    : parseFloat(h.borderTopWidth) +
                      parseFloat(h.borderBottomWidth))))),
          (n = u),
          (a = g);
      }
      return e === t
        ? { left: o, top: i, width: n - o, height: a - i }
        : ((s = (r = getGlobalMatrix(t, !0).multiply(getGlobalMatrix(e))).apply(
            { x: o, y: i }
          )),
          (l = r.apply({ x: n, y: i })),
          (c = r.apply({ x: n, y: a })),
          (d = r.apply({ x: o, y: a })),
          {
            left: (o = Math.min(s.x, l.x, c.x, d.x)),
            top: (i = Math.min(s.y, l.y, c.y, d.y)),
            width: Math.max(s.x, l.x, c.x, d.x) - o,
            height: Math.max(s.y, l.y, c.y, d.y) - i,
          });
    },
    H =
      (((o = EventDispatcher.prototype).addEventListener =
        function addEventListener(e, t) {
          var o = this._listeners[e] || (this._listeners[e] = []);
          ~o.indexOf(t) || o.push(t);
        }),
      (o.removeEventListener = function removeEventListener(e, t) {
        var o = this._listeners[e],
          n = o && o.indexOf(t);
        0 <= n && o.splice(n, 1);
      }),
      (o.dispatchEvent = function dispatchEvent(t) {
        var o,
          n = this;
        return (
          (this._listeners[t] || []).forEach(function (e) {
            return !1 === e.call(n, { type: t, target: n.target }) && (o = !1);
          }),
          o
        );
      }),
      EventDispatcher);
  function EventDispatcher(e) {
    (this._listeners = {}), (this.target = e || this);
  }
  var Qe,
    Q =
      ((function _inheritsLoose(e, t) {
        (e.prototype = Object.create(t.prototype)),
          ((e.prototype.constructor = e).__proto__ = t);
      })(Draggable, (Qe = H)),
      (Draggable.register = function register(e) {
        (me = e), _a();
      }),
      (Draggable.create = function create(e, t) {
        return (
          we || _a(!0),
          _e(e).map(function (e) {
            return new Draggable(e, t);
          })
        );
      }),
      (Draggable.get = function get(e) {
        return He[(_e(e)[0] || {})._gsDragID];
      }),
      (Draggable.timeSinceDrag = function timeSinceDrag() {
        return (Xe() - Ie) / 1e3;
      }),
      (Draggable.hitTest = function hitTest(e, t, o) {
        if (e === t) return !1;
        var n,
          i,
          a,
          r = Pa(e),
          s = Pa(t),
          l = r.top,
          c = r.left,
          d = r.right,
          p = r.bottom,
          u = r.width,
          g = r.height,
          h = s.left > d || s.right < c || s.top > p || s.bottom < l;
        return h || !o
          ? !h
          : ((a = -1 !== (o + "").indexOf("%")),
            (o = parseFloat(o) || 0),
            ((n = {
              left: Math.max(c, s.left),
              top: Math.max(l, s.top),
            }).width = Math.min(d, s.right) - n.left),
            (n.height = Math.min(p, s.bottom) - n.top),
            !(n.width < 0 || n.height < 0) &&
              (a
                ? u * g * (o *= 0.01) <= (i = n.width * n.height) ||
                  i >= s.width * s.height * o
                : n.width > o && n.height > o));
      }),
      Draggable);
  function Draggable(g, p) {
    var e;
    (e = Qe.call(this) || this),
      we || _a(1),
      (g = _e(g)[0]),
      (e.styles = Le && Le(g, "transform,left,top")),
      (Se = Se || me.plugins.inertia),
      (e.vars = p = ra(p || {})),
      (e.target = g),
      (e.x = e.y = e.rotation = 0),
      (e.dragResistance = parseFloat(p.dragResistance) || 0),
      (e.edgeResistance = isNaN(p.edgeResistance)
        ? 1
        : parseFloat(p.edgeResistance) || 0),
      (e.lockAxis = p.lockAxis),
      (e.autoScroll = p.autoScroll || 0),
      (e.lockedAxis = null),
      (e.allowEventDefault = !!p.allowEventDefault),
      me.getProperty(g, "x");
    function Lh(e, t) {
      return parseFloat(le.get(g, e, t));
    }
    function si(e) {
      return (
        Ba(e), e.stopImmediatePropagation && e.stopImmediatePropagation(), !1
      );
    }
    function ti(e) {
      if (j.autoScroll && j.isDragging && (te || L)) {
        var t,
          o,
          n,
          i,
          a,
          r,
          s,
          l,
          c = g,
          d = 15 * j.autoScroll;
        for (
          te = !1,
            Ge.scrollTop =
              null != ve.pageYOffset
                ? ve.pageYOffset
                : null != de.documentElement.scrollTop
                ? de.documentElement.scrollTop
                : de.body.scrollTop,
            Ge.scrollLeft =
              null != ve.pageXOffset
                ? ve.pageXOffset
                : null != de.documentElement.scrollLeft
                ? de.documentElement.scrollLeft
                : de.body.scrollLeft,
            i = j.pointerX - Ge.scrollLeft,
            a = j.pointerY - Ge.scrollTop;
          c && !o;

        )
          (t = (o = We(c.parentNode)) ? Ge : c.parentNode),
            (n = o
              ? {
                  bottom: Math.max(ye.clientHeight, ve.innerHeight || 0),
                  right: Math.max(ye.clientWidth, ve.innerWidth || 0),
                  left: 0,
                  top: 0,
                }
              : t.getBoundingClientRect()),
            (r = s = 0),
            K &&
              ((l = t._gsMaxScrollY - t.scrollTop) < 0
                ? (s = l)
                : a > n.bottom - ie && l
                ? ((te = !0),
                  (s = Math.min(
                    l,
                    (d * (1 - Math.max(0, n.bottom - a) / ie)) | 0
                  )))
                : a < n.top + oe &&
                  t.scrollTop &&
                  ((te = !0),
                  (s = -Math.min(
                    t.scrollTop,
                    (d * (1 - Math.max(0, a - n.top) / oe)) | 0
                  ))),
              s && (t.scrollTop += s)),
            U &&
              ((l = t._gsMaxScrollX - t.scrollLeft) < 0
                ? (r = l)
                : i > n.right - ne && l
                ? ((te = !0),
                  (r = Math.min(
                    l,
                    (d * (1 - Math.max(0, n.right - i) / ne)) | 0
                  )))
                : i < n.left + ae &&
                  t.scrollLeft &&
                  ((te = !0),
                  (r = -Math.min(
                    t.scrollLeft,
                    (d * (1 - Math.max(0, i - n.left) / ae)) | 0
                  ))),
              r && (t.scrollLeft += r)),
            o &&
              (r || s) &&
              (ve.scrollTo(t.scrollLeft, t.scrollTop),
              ge(j.pointerX + r, j.pointerY + s)),
            (c = t);
      }
      if (L) {
        var p = j.x,
          u = j.y;
        W
          ? ((j.deltaX = p - parseFloat(le.rotation)),
            (j.rotation = p),
            (le.rotation = p + "deg"),
            le.renderTransform(1, le))
          : h
          ? (K && ((j.deltaY = u - h.top()), h.top(u)),
            U && ((j.deltaX = p - h.left()), h.left(p)))
          : G
          ? (K && ((j.deltaY = u - parseFloat(le.y)), (le.y = u + "px")),
            U && ((j.deltaX = p - parseFloat(le.x)), (le.x = p + "px")),
            le.renderTransform(1, le))
          : (K &&
              ((j.deltaY = u - parseFloat(g.style.top || 0)),
              (g.style.top = u + "px")),
            U &&
              ((j.deltaX = p - parseFloat(g.style.left || 0)),
              (g.style.left = p + "px"))),
          !f ||
            e ||
            H ||
            (!(H = !0) === Qa(j, "drag", "onDrag") &&
              (U && (j.x -= j.deltaX), K && (j.y -= j.deltaY), ti(!0)),
            (H = !1));
      }
      L = !1;
    }
    function ui(e, t) {
      var o,
        n,
        i = j.x,
        a = j.y;
      g._gsap || (le = me.core.getCache(g)),
        le.uncache && me.getProperty(g, "x"),
        G
          ? ((j.x = parseFloat(le.x)), (j.y = parseFloat(le.y)))
          : W
          ? (j.x = j.rotation = parseFloat(le.rotation))
          : h
          ? ((j.y = h.top()), (j.x = h.left()))
          : ((j.y = parseFloat(g.style.top || ((n = Na(g)) && n.top)) || 0),
            (j.x = parseFloat(g.style.left || (n || {}).left) || 0)),
        (Y || N || z) &&
          !t &&
          (j.isDragging || j.isThrowing) &&
          (z &&
            ((Fe.x = j.x),
            (Fe.y = j.y),
            (o = z(Fe)).x !== j.x && ((j.x = o.x), (L = !0)),
            o.y !== j.y && ((j.y = o.y), (L = !0))),
          Y &&
            (o = Y(j.x)) !== j.x &&
            ((j.x = o), W && (j.rotation = o), (L = !0)),
          N && ((o = N(j.y)) !== j.y && (j.y = o), (L = !0))),
        L && ti(!0),
        e ||
          ((j.deltaX = j.x - i),
          (j.deltaY = j.y - a),
          Qa(j, "throwupdate", "onThrowUpdate"));
    }
    function vi(r, s, l, o) {
      return (
        null == s && (s = -Ae),
        null == l && (l = Ae),
        Z(r)
          ? function (e) {
              var t = j.isPressed ? 1 - j.edgeResistance : 1;
              return (
                r.call(
                  j,
                  (l < e ? l + (e - l) * t : e < s ? s + (e - s) * t : e) * o
                ) * o
              );
            }
          : ze(r)
          ? function (e) {
              for (var t, o, n = r.length, i = 0, a = Ae; -1 < --n; )
                (o = (t = r[n]) - e) < 0 && (o = -o),
                  o < a && s <= t && t <= l && ((i = n), (a = o));
              return r[i];
            }
          : isNaN(r)
          ? function (e) {
              return e;
            }
          : function () {
              return r * o;
            }
      );
    }
    function xi() {
      var e, t, o, n;
      (k = !1),
        h
          ? (h.calibrate(),
            (j.minX = S = -h.maxScrollLeft()),
            (j.minY = P = -h.maxScrollTop()),
            (j.maxX = D = j.maxY = E = 0),
            (k = !0))
          : p.bounds &&
            ((e = Ra(p.bounds, g.parentNode)),
            W
              ? ((j.minX = S = e.left),
                (j.maxX = D = e.left + e.width),
                (j.minY = P = j.maxY = E = 0))
              : _(p.bounds.maxX) && _(p.bounds.maxY)
              ? ((t = Ra(g, g.parentNode)),
                (j.minX = S = Math.round(Lh(Q, "px") + e.left - t.left)),
                (j.minY = P = Math.round(Lh(V, "px") + e.top - t.top)),
                (j.maxX = D = Math.round(S + (e.width - t.width))),
                (j.maxY = E = Math.round(P + (e.height - t.height))))
              : ((e = p.bounds),
                (j.minX = S = e.minX),
                (j.minY = P = e.minY),
                (j.maxX = D = e.maxX),
                (j.maxY = E = e.maxY)),
            D < S && ((j.minX = D), (j.maxX = D = S), (S = j.minX)),
            E < P && ((j.minY = E), (j.maxY = E = P), (P = j.minY)),
            W && ((j.minRotation = S), (j.maxRotation = D)),
            (k = !0)),
        p.liveSnap &&
          ((o = !0 === p.liveSnap ? p.snap || {} : p.liveSnap),
          (n = ze(o) || Z(o)),
          W
            ? ((Y = vi(n ? o : o.rotation, S, D, 1)), (N = null))
            : o.points
            ? (z = (function buildPointSnapFunc(l, s, c, d, p, u, g) {
                return (
                  (u = u && u < Ae ? u * u : Ae),
                  Z(l)
                    ? function (e) {
                        var t,
                          o,
                          n,
                          i = j.isPressed ? 1 - j.edgeResistance : 1,
                          a = e.x,
                          r = e.y;
                        return (
                          (e.x = a =
                            c < a
                              ? c + (a - c) * i
                              : a < s
                              ? s + (a - s) * i
                              : a),
                          (e.y = r =
                            p < r
                              ? p + (r - p) * i
                              : r < d
                              ? d + (r - d) * i
                              : r),
                          (t = l.call(j, e)) !== e &&
                            ((e.x = t.x), (e.y = t.y)),
                          1 !== g && ((e.x *= g), (e.y *= g)),
                          u < Ae &&
                            ((o = e.x - a),
                            (n = e.y - r),
                            u < o * o + n * n && ((e.x = a), (e.y = r))),
                          e
                        );
                      }
                    : ze(l)
                    ? function (e) {
                        for (
                          var t, o, n, i, a = l.length, r = 0, s = Ae;
                          -1 < --a;

                        )
                          (i =
                            (t = (n = l[a]).x - e.x) * t +
                            (o = n.y - e.y) * o) < s && ((r = a), (s = i));
                        return s <= u ? l[r] : e;
                      }
                    : function (e) {
                        return e;
                      }
                );
              })(n ? o : o.points, S, D, P, E, o.radius, h ? -1 : 1))
            : (U &&
                (Y = vi(
                  n ? o : o.x || o.left || o.scrollLeft,
                  S,
                  D,
                  h ? -1 : 1
                )),
              K &&
                (N = vi(
                  n ? o : o.y || o.top || o.scrollTop,
                  P,
                  E,
                  h ? -1 : 1
                ))));
    }
    function yi() {
      (j.isThrowing = !1), Qa(j, "throwcomplete", "onThrowComplete");
    }
    function zi() {
      j.isThrowing = !1;
    }
    function Ai(e, t) {
      var o, n, i, a;
      e && Se
        ? (!0 === e &&
            ((o = p.snap || p.liveSnap || {}),
            (n = ze(o) || Z(o)),
            (e = {
              resistance:
                (p.throwResistance || p.resistance || 1e3) / (W ? 10 : 1),
            }),
            W
              ? (e.rotation = Ua(j, n ? o : o.rotation, D, S, 1, t))
              : (U &&
                  (e[Q] = Ua(
                    j,
                    n ? o : o.points || o.x || o.left,
                    D,
                    S,
                    h ? -1 : 1,
                    t || "x" === j.lockedAxis
                  )),
                K &&
                  (e[V] = Ua(
                    j,
                    n ? o : o.points || o.y || o.top,
                    E,
                    P,
                    h ? -1 : 1,
                    t || "y" === j.lockedAxis
                  )),
                (o.points || (ze(o) && $(o[0]))) &&
                  ((e.linkedProps = Q + "," + V), (e.radius = o.radius)))),
          (j.isThrowing = !0),
          (a = isNaN(p.overshootTolerance)
            ? 1 === p.edgeResistance
              ? 0
              : 1 - j.edgeResistance + 0.2
            : p.overshootTolerance),
          e.duration ||
            (e.duration = {
              max: Math.max(
                p.minDuration || 0,
                "maxDuration" in p ? p.maxDuration : 2
              ),
              min: isNaN(p.minDuration)
                ? 0 === a || ($(e) && 1e3 < e.resistance)
                  ? 0
                  : 0.5
                : p.minDuration,
              overshoot: a,
            }),
          (j.tween = i =
            me.to(h || g, {
              inertia: e,
              data: "_draggable",
              inherit: !1,
              onComplete: yi,
              onInterrupt: zi,
              onUpdate: p.fastMode ? Qa : ui,
              onUpdateParams: p.fastMode
                ? [j, "onthrowupdate", "onThrowUpdate"]
                : o && o.radius
                ? [!1, !0]
                : [],
            })),
          p.fastMode ||
            (h && (h._skip = !0),
            i.render(1e9, !0, !0),
            ui(!0, !0),
            (j.endX = j.x),
            (j.endY = j.y),
            W && (j.endRotation = j.x),
            i.play(0),
            ui(!0, !0),
            h && (h._skip = !1)))
        : k && j.applyBounds();
    }
    function Bi(e) {
      var t,
        o = R;
      (R = getGlobalMatrix(g.parentNode, !0)),
        e &&
          j.isPressed &&
          !R.equals(o || new fe()) &&
          ((t = o.inverse().apply({ x: b, y: w })),
          R.apply(t, t),
          (b = t.x),
          (w = t.y)),
        R.equals(i) && (R = null);
    }
    function Ci() {
      var e,
        t,
        o,
        n = 1 - j.edgeResistance,
        i = ce ? Ga(de) : 0,
        a = ce ? Fa(de) : 0;
      G &&
        ((le.x = Lh(Q, "px") + "px"),
        (le.y = Lh(V, "px") + "px"),
        le.renderTransform()),
        Bi(!1),
        (Ze.x = j.pointerX - i),
        (Ze.y = j.pointerY - a),
        R && R.apply(Ze, Ze),
        (b = Ze.x),
        (w = Ze.y),
        L && (ge(j.pointerX, j.pointerY), ti(!0)),
        (d = getGlobalMatrix(g)),
        h
          ? (xi(), (M = h.top()), (T = h.left()))
          : (pe() ? (ui(!0, !0), xi()) : j.applyBounds(),
            W
              ? ((e = g.ownerSVGElement
                  ? [le.xOrigin - g.getBBox().x, le.yOrigin - g.getBBox().y]
                  : (Na(g)[Ne] || "0 0").split(" ")),
                (C = j.rotationOrigin =
                  getGlobalMatrix(g).apply({
                    x: parseFloat(e[0]) || 0,
                    y: parseFloat(e[1]) || 0,
                  })),
                ui(!0, !0),
                (t = j.pointerX - C.x - i),
                (o = C.y - j.pointerY + a),
                (T = j.x),
                (M = j.y = Math.atan2(o, t) * Re))
              : ((M = Lh(V, "px")), (T = Lh(Q, "px")))),
        k &&
          n &&
          (D < T ? (T = D + (T - D) / n) : T < S && (T = S - (S - T) / n),
          W ||
            (E < M ? (M = E + (M - E) / n) : M < P && (M = P - (P - M) / n))),
        (j.startX = T = da(T)),
        (j.startY = M = da(M));
    }
    function Ei() {
      !be.parentNode || pe() || j.isDragging || be.parentNode.removeChild(be);
    }
    function Fi(e, t) {
      var o;
      if (
        !u ||
        j.isPressed ||
        !e ||
        (!(("mousedown" !== e.type && "pointerdown" !== e.type) || t) &&
          Xe() - se < 30 &&
          Me[j.pointerEvent.type])
      )
        I && e && u && Ba(e);
      else {
        if (
          ((A = pe()),
          (F = !1),
          (j.pointerEvent = e),
          Me[e.type]
            ? ((y = ~e.type.indexOf("touch")
                ? e.currentTarget || e.target
                : de),
              za(y, "touchend", he),
              za(y, "touchmove", ue),
              za(y, "touchcancel", he),
              za(de, "touchstart", Ea))
            : ((y = null), za(de, "mousemove", ue)),
          (B = null),
          (Pe && y) ||
            (za(de, "mouseup", he),
            e && e.target && za(e.target, "mouseup", he)),
          (x = re.call(j, e.target) && !1 === p.dragClickables && !t))
        )
          return (
            za(e.target, "change", he),
            Qa(j, "pressInit", "onPressInit"),
            Qa(j, "press", "onPress"),
            Wa(J, !0),
            void (I = !1)
          );
        if (
          ((X =
            !(
              !y ||
              U == K ||
              !1 === j.vars.allowNativeTouchScrolling ||
              (j.vars.allowContextMenu && e && (e.ctrlKey || 2 < e.which))
            ) && (U ? "y" : "x")),
          (I = !X && !j.allowEventDefault) &&
            (Ba(e), za(ve, "touchforcechange", Ba)),
          e.changedTouches
            ? ((e = m = e.changedTouches[0]), (v = e.identifier))
            : e.pointerId
            ? (v = e.pointerId)
            : (m = v = null),
          Ye++,
          (function _addToRenderQueue(e) {
            Be.push(e), 1 === Be.length && me.ticker.add(ua);
          })(ti),
          (w = j.pointerY = e.pageY),
          (b = j.pointerX = e.pageX),
          Qa(j, "pressInit", "onPressInit"),
          (X || j.autoScroll) && La(g.parentNode),
          !g.parentNode ||
            !j.autoScroll ||
            h ||
            W ||
            !g.parentNode._gsMaxScrollX ||
            be.parentNode ||
            g.getBBox ||
            ((be.style.width = g.parentNode.scrollWidth + "px"),
            g.parentNode.appendChild(be)),
          Ci(),
          j.tween && j.tween.kill(),
          (j.isThrowing = !1),
          me.killTweensOf(h || g, n, !0),
          h && me.killTweensOf(g, { scrollTo: 1 }, !0),
          (j.tween = j.lockedAxis = null),
          (!p.zIndexBoost && (W || h || !1 === p.zIndexBoost)) ||
            (g.style.zIndex = Draggable.zIndex++),
          (j.isPressed = !0),
          (f = !(!p.onDrag && !j._listeners.drag)),
          (l = !(!p.onMove && !j._listeners.move)),
          !1 !== p.cursor || p.activeCursor)
        )
          for (o = J.length; -1 < --o; )
            me.set(J[o], {
              cursor:
                p.activeCursor || p.cursor || ("grab" === Ee ? "grabbing" : Ee),
            });
        Qa(j, "press", "onPress");
      }
    }
    function Ji(e) {
      if (e && j.isDragging && !h) {
        var t = e.target || g.parentNode,
          o = t.scrollLeft - t._gsScrollX,
          n = t.scrollTop - t._gsScrollY;
        (o || n) &&
          (R
            ? ((b -= o * R.a + n * R.c), (w -= n * R.d + o * R.b))
            : ((b -= o), (w -= n)),
          (t._gsScrollX += o),
          (t._gsScrollY += n),
          ge(j.pointerX, j.pointerY));
      }
    }
    function Ki(e) {
      var t = Xe(),
        o = t - se < 100,
        n = t - ee < 50,
        i = o && O === se,
        a = j.pointerEvent && j.pointerEvent.defaultPrevented,
        r = o && c === se,
        s = e.isTrusted || (null == e.isTrusted && o && i);
      if (
        ((i || (n && !1 !== j.vars.suppressClickOnDrag)) &&
          e.stopImmediatePropagation &&
          e.stopImmediatePropagation(),
        o &&
          (!j.pointerEvent || !j.pointerEvent.defaultPrevented) &&
          (!i || (s && !r)))
      )
        return s && i && (c = se), void (O = se);
      (j.isPressed || n || o) && ((s && e.detail && o && !a) || Ba(e)),
        o ||
          n ||
          F ||
          (e && e.target && (j.pointerEvent = e), Qa(j, "click", "onClick"));
    }
    function Li(e) {
      return R
        ? { x: e.x * R.a + e.y * R.c + R.e, y: e.x * R.b + e.y * R.d + R.f }
        : { x: e.x, y: e.y };
    }
    var u,
      h,
      b,
      w,
      T,
      M,
      k,
      f,
      l,
      D,
      S,
      E,
      P,
      m,
      v,
      C,
      L,
      t,
      Y,
      N,
      z,
      x,
      y,
      R,
      A,
      X,
      B,
      H,
      O,
      c,
      I,
      d,
      F,
      o = (p.type || "x,y").toLowerCase(),
      G = ~o.indexOf("x") || ~o.indexOf("y"),
      W = -1 !== o.indexOf("rotation"),
      Q = W ? "rotation" : G ? "x" : "left",
      V = G ? "y" : "top",
      U = !(!~o.indexOf("x") && !~o.indexOf("left") && "scroll" !== o),
      K = !(!~o.indexOf("y") && !~o.indexOf("top") && "scroll" !== o),
      q = p.minimumMovement || 2,
      j = _assertThisInitialized(e),
      J = _e(p.trigger || p.handle || g),
      n = {},
      ee = 0,
      te = !1,
      oe = p.autoScrollMarginTop || 40,
      ne = p.autoScrollMarginRight || 40,
      ie = p.autoScrollMarginBottom || 40,
      ae = p.autoScrollMarginLeft || 40,
      re = p.clickableTest || Va,
      se = 0,
      le = g._gsap || me.core.getCache(g),
      ce = (function _isFixed(e) {
        return (
          "fixed" === Na(e).position ||
          ((e = e.parentNode) && 1 === e.nodeType ? _isFixed(e) : void 0)
        );
      })(g),
      de = g.ownerDocument || xe,
      pe = function isTweening() {
        return j.tween && j.tween.isActive();
      },
      ue = function onMove(e) {
        var t,
          o,
          n,
          i,
          a,
          r,
          s = e;
        if (u && !ke && j.isPressed && e) {
          if ((t = (j.pointerEvent = e).changedTouches)) {
            if ((e = t[0]) !== m && e.identifier !== v) {
              for (
                i = t.length;
                -1 < --i && (e = t[i]).identifier !== v && e.target !== g;

              );
              if (i < 0) return;
            }
          } else if (e.pointerId && v && e.pointerId !== v) return;
          y &&
          X &&
          !B &&
          ((Ze.x = e.pageX - (ce ? Ga(de) : 0)),
          (Ze.y = e.pageY - (ce ? Fa(de) : 0)),
          R && R.apply(Ze, Ze),
          (o = Ze.x),
          (n = Ze.y),
          (((a = Math.abs(o - b)) !== (r = Math.abs(n - w)) &&
            (q < a || q < r)) ||
            (De && X === B)) &&
            ((B = r < a && U ? "x" : "y"),
            X && B !== X && za(ve, "touchforcechange", Ba),
            !1 !== j.vars.lockAxisOnTouchScroll &&
              U &&
              K &&
              ((j.lockedAxis = "x" === B ? "y" : "x"),
              Z(j.vars.onLockAxis) && j.vars.onLockAxis.call(j, s)),
            De && X === B))
            ? he(s)
            : ((I =
                j.allowEventDefault ||
                (X && (!B || X === B)) ||
                !1 === s.cancelable
                  ? I && !1
                  : (Ba(s), !0)),
              j.autoScroll && (te = !0),
              ge(e.pageX, e.pageY, l));
        } else I && e && u && Ba(e);
      },
      ge = function setPointerPosition(e, t, o) {
        var n,
          i,
          a,
          r,
          s,
          l,
          c = 1 - j.dragResistance,
          d = 1 - j.edgeResistance,
          p = j.pointerX,
          u = j.pointerY,
          g = M,
          h = j.x,
          f = j.y,
          m = j.endX,
          v = j.endY,
          x = j.endRotation,
          y = L;
        (j.pointerX = e),
          (j.pointerY = t),
          ce && ((e -= Ga(de)), (t -= Fa(de))),
          W
            ? ((r = Math.atan2(C.y - t, e - C.x) * Re),
              180 < (s = j.y - r)
                ? ((M -= 360), (j.y = r))
                : s < -180 && ((M += 360), (j.y = r)),
              (a =
                j.x !== T || Math.max(Math.abs(b - e), Math.abs(w - t)) > q
                  ? ((j.y = r), T + (M - r) * c)
                  : T))
            : (R &&
                ((l = e * R.a + t * R.c + R.e),
                (t = e * R.b + t * R.d + R.f),
                (e = l)),
              (i = t - w) < q && -q < i && (i = 0),
              (n = e - b) < q && -q < n && (n = 0),
              (j.lockAxis || j.lockedAxis) &&
                (n || i) &&
                ((l = j.lockedAxis) ||
                  ((j.lockedAxis = l =
                    U && Math.abs(n) > Math.abs(i) ? "y" : K ? "x" : null),
                  l &&
                    Z(j.vars.onLockAxis) &&
                    j.vars.onLockAxis.call(j, j.pointerEvent)),
                "y" === l ? (i = 0) : "x" === l && (n = 0)),
              (a = da(T + n * c)),
              (r = da(M + i * c))),
          (Y || N || z) &&
            (j.x !== a || (j.y !== r && !W)) &&
            (z &&
              ((Fe.x = a),
              (Fe.y = r),
              (l = z(Fe)),
              (a = da(l.x)),
              (r = da(l.y))),
            Y && (a = da(Y(a))),
            N && (r = da(N(r)))),
          k &&
            (D < a
              ? (a = D + Math.round((a - D) * d))
              : a < S && (a = S + Math.round((a - S) * d)),
            W ||
              (E < r
                ? (r = Math.round(E + (r - E) * d))
                : r < P && (r = Math.round(P + (r - P) * d)))),
          (j.x === a && (j.y === r || W)) ||
            (W
              ? ((j.endRotation = j.x = j.endX = a), (L = !0))
              : (K && ((j.y = j.endY = r), (L = !0)),
                U && ((j.x = j.endX = a), (L = !0))),
            o && !1 === Qa(j, "move", "onMove")
              ? ((j.pointerX = p),
                (j.pointerY = u),
                (M = g),
                (j.x = h),
                (j.y = f),
                (j.endX = m),
                (j.endY = v),
                (j.endRotation = x),
                (L = y))
              : !j.isDragging &&
                j.isPressed &&
                ((j.isDragging = F = !0), Qa(j, "dragstart", "onDragStart")));
      },
      he = function onRelease(e, t) {
        if (
          u &&
          j.isPressed &&
          (!e ||
            null == v ||
            t ||
            !(
              (e.pointerId && e.pointerId !== v && e.target !== g) ||
              (e.changedTouches &&
                !(function _hasTouchID(e, t) {
                  for (var o = e.length; o--; )
                    if (e[o].identifier === t) return !0;
                })(e.changedTouches, v))
            ))
        ) {
          j.isPressed = !1;
          var o,
            n,
            i,
            a,
            r,
            s = e,
            l = j.isDragging,
            c = j.vars.allowContextMenu && e && (e.ctrlKey || 2 < e.which),
            d = me.delayedCall(0.001, Ei);
          if (
            (y
              ? (Aa(y, "touchend", onRelease),
                Aa(y, "touchmove", ue),
                Aa(y, "touchcancel", onRelease),
                Aa(de, "touchstart", Ea))
              : Aa(de, "mousemove", ue),
            Aa(ve, "touchforcechange", Ba),
            (Pe && y) ||
              (Aa(de, "mouseup", onRelease),
              e && e.target && Aa(e.target, "mouseup", onRelease)),
            (L = !1),
            l && ((ee = Ie = Xe()), (j.isDragging = !1)),
            xa(ti),
            x && !c)
          )
            return (
              e && (Aa(e.target, "change", onRelease), (j.pointerEvent = s)),
              Wa(J, !1),
              Qa(j, "release", "onRelease"),
              Qa(j, "click", "onClick"),
              void (x = !1)
            );
          for (n = J.length; -1 < --n; )
            Ma(J[n], "cursor", p.cursor || (!1 !== p.cursor ? Ee : null));
          if ((Ye--, e)) {
            if (
              (o = e.changedTouches) &&
              (e = o[0]) !== m &&
              e.identifier !== v
            ) {
              for (
                n = o.length;
                -1 < --n && (e = o[n]).identifier !== v && e.target !== g;

              );
              if (n < 0 && !t) return;
            }
            (j.pointerEvent = s),
              (j.pointerX = e.pageX),
              (j.pointerY = e.pageY);
          }
          return (
            c && s
              ? (Ba(s), (I = !0), Qa(j, "release", "onRelease"))
              : s && !l
              ? ((I = !1),
                A && (p.snap || p.bounds) && Ai(p.inertia || p.throwProps),
                Qa(j, "release", "onRelease"),
                (De && "touchmove" === s.type) ||
                  -1 !== s.type.indexOf("cancel") ||
                  (Qa(j, "click", "onClick"),
                  Xe() - se < 300 && Qa(j, "doubleclick", "onDoubleClick"),
                  (a = s.target || g),
                  (se = Xe()),
                  (r = function syntheticClick() {
                    se === O ||
                      !j.enabled() ||
                      j.isPressed ||
                      s.defaultPrevented ||
                      (a.click
                        ? a.click()
                        : de.createEvent &&
                          ((i = de.createEvent("MouseEvents")).initMouseEvent(
                            "click",
                            !0,
                            !0,
                            ve,
                            1,
                            j.pointerEvent.screenX,
                            j.pointerEvent.screenY,
                            j.pointerX,
                            j.pointerY,
                            !1,
                            !1,
                            !1,
                            !1,
                            0,
                            null
                          ),
                          a.dispatchEvent(i)));
                  }),
                  De || s.defaultPrevented || me.delayedCall(0.05, r)))
              : (Ai(p.inertia || p.throwProps),
                j.allowEventDefault ||
                !s ||
                (!1 === p.dragClickables && re.call(j, s.target)) ||
                !l ||
                (X && (!B || X !== B)) ||
                !1 === s.cancelable
                  ? (I = !1)
                  : ((I = !0), Ba(s)),
                Qa(j, "release", "onRelease")),
            pe() && d.duration(j.tween.duration()),
            l && Qa(j, "dragend", "onDragEnd"),
            !0
          );
        }
        I && e && u && Ba(e);
      };
    return (
      (t = Draggable.get(g)) && t.kill(),
      (e.startDrag = function (e, t) {
        var o, n, i, a;
        Fi(e || j.pointerEvent, !0),
          t &&
            !j.hitTest(e || j.pointerEvent) &&
            ((o = Pa(e || j.pointerEvent)),
            (n = Pa(g)),
            (i = Li({ x: o.left + o.width / 2, y: o.top + o.height / 2 })),
            (a = Li({ x: n.left + n.width / 2, y: n.top + n.height / 2 })),
            (b -= i.x - a.x),
            (w -= i.y - a.y)),
          j.isDragging ||
            ((j.isDragging = F = !0), Qa(j, "dragstart", "onDragStart"));
      }),
      (e.drag = ue),
      (e.endDrag = function (e) {
        return he(e || j.pointerEvent, !0);
      }),
      (e.timeSinceDrag = function () {
        return j.isDragging ? 0 : (Xe() - ee) / 1e3;
      }),
      (e.timeSinceClick = function () {
        return (Xe() - se) / 1e3;
      }),
      (e.hitTest = function (e, t) {
        return Draggable.hitTest(j.target, e, t);
      }),
      (e.getDirection = function (e, t) {
        var o,
          n,
          i,
          a,
          r,
          s,
          l = "velocity" === e && Se ? e : $(e) && !W ? "element" : "start";
        return (
          "element" === l && ((r = Pa(j.target)), (s = Pa(e))),
          (o =
            "start" === l
              ? j.x - T
              : "velocity" === l
              ? Se.getVelocity(g, Q)
              : r.left + r.width / 2 - (s.left + s.width / 2)),
          W
            ? o < 0
              ? "counter-clockwise"
              : "clockwise"
            : ((t = t || 2),
              (n =
                "start" === l
                  ? j.y - M
                  : "velocity" === l
                  ? Se.getVelocity(g, V)
                  : r.top + r.height / 2 - (s.top + s.height / 2)),
              (a =
                (i = Math.abs(o / n)) < 1 / t ? "" : o < 0 ? "left" : "right"),
              i < t && ("" !== a && (a += "-"), (a += n < 0 ? "up" : "down")),
              a)
        );
      }),
      (e.applyBounds = function (e, t) {
        var o, n, i, a, r, s;
        if (e && p.bounds !== e) return (p.bounds = e), j.update(!0, t);
        if ((ui(!0), xi(), k && !pe())) {
          if (
            ((o = j.x),
            (n = j.y),
            D < o ? (o = D) : o < S && (o = S),
            E < n ? (n = E) : n < P && (n = P),
            (j.x !== o || j.y !== n) &&
              ((i = !0),
              (j.x = j.endX = o),
              W ? (j.endRotation = o) : (j.y = j.endY = n),
              ti((L = !0)),
              j.autoScroll && !j.isDragging))
          )
            for (
              La(g.parentNode),
                a = g,
                Ge.scrollTop =
                  null != ve.pageYOffset
                    ? ve.pageYOffset
                    : null != de.documentElement.scrollTop
                    ? de.documentElement.scrollTop
                    : de.body.scrollTop,
                Ge.scrollLeft =
                  null != ve.pageXOffset
                    ? ve.pageXOffset
                    : null != de.documentElement.scrollLeft
                    ? de.documentElement.scrollLeft
                    : de.body.scrollLeft;
              a && !s;

            )
              (r = (s = We(a.parentNode)) ? Ge : a.parentNode),
                K &&
                  r.scrollTop > r._gsMaxScrollY &&
                  (r.scrollTop = r._gsMaxScrollY),
                U &&
                  r.scrollLeft > r._gsMaxScrollX &&
                  (r.scrollLeft = r._gsMaxScrollX),
                (a = r);
          j.isThrowing &&
            (i || j.endX > D || j.endX < S || j.endY > E || j.endY < P) &&
            Ai(p.inertia || p.throwProps, i);
        }
        return j;
      }),
      (e.update = function (e, t, o) {
        if (t && j.isPressed) {
          var n = getGlobalMatrix(g),
            i = d.apply({ x: j.x - T, y: j.y - M }),
            a = getGlobalMatrix(g.parentNode, !0);
          a.apply({ x: n.e - i.x, y: n.f - i.y }, i),
            (j.x -= i.x - a.e),
            (j.y -= i.y - a.f),
            ti(!0),
            Ci();
        }
        var r = j.x,
          s = j.y;
        return (
          Bi(!t),
          e ? j.applyBounds() : (L && o && ti(!0), ui(!0)),
          t && (ge(j.pointerX, j.pointerY), L && ti(!0)),
          j.isPressed &&
            !t &&
            ((U && 0.01 < Math.abs(r - j.x)) ||
              (K && 0.01 < Math.abs(s - j.y) && !W)) &&
            Ci(),
          j.autoScroll &&
            (La(g.parentNode, j.isDragging),
            (te = j.isDragging),
            ti(!0),
            Ia(g, Ji),
            Ha(g, Ji)),
          j
        );
      }),
      (e.enable = function (e) {
        var t,
          o,
          n,
          i = { lazy: !0 };
        if (
          (!1 !== p.cursor && (i.cursor = p.cursor || Ee),
          me.utils.checkPrefix("touchCallout") && (i.touchCallout = "none"),
          "soft" !== e)
        ) {
          for (
            ta(
              J,
              U == K
                ? "none"
                : (p.allowNativeTouchScrolling &&
                    (g.scrollHeight === g.clientHeight) ==
                      (g.scrollWidth === g.clientHeight)) ||
                  p.allowEventDefault
                ? "manipulation"
                : U
                ? "pan-y"
                : "pan-x"
            ),
              o = J.length;
            -1 < --o;

          )
            (n = J[o]),
              Pe || za(n, "mousedown", Fi),
              za(n, "touchstart", Fi),
              za(n, "click", Ki, !0),
              me.set(n, i),
              n.getBBox &&
                n.ownerSVGElement &&
                U != K &&
                me.set(n.ownerSVGElement, {
                  touchAction:
                    p.allowNativeTouchScrolling || p.allowEventDefault
                      ? "manipulation"
                      : U
                      ? "pan-y"
                      : "pan-x",
                }),
              p.allowContextMenu || za(n, "contextmenu", si);
          Wa(J, !1);
        }
        return (
          Ha(g, Ji),
          (u = !0),
          Se &&
            "soft" !== e &&
            Se.track(h || g, G ? "x,y" : W ? "rotation" : "top,left"),
          (g._gsDragID = t = g._gsDragID || "d" + Oe++),
          (He[t] = j),
          h && (h.enable(), (h.element._gsDragID = t)),
          (p.bounds || W) && Ci(),
          p.bounds && j.applyBounds(),
          j
        );
      }),
      (e.disable = function (e) {
        for (var t, o = j.isDragging, n = J.length; -1 < --n; )
          Ma(J[n], "cursor", null);
        if ("soft" !== e) {
          for (ta(J, null), n = J.length; -1 < --n; )
            (t = J[n]),
              Ma(t, "touchCallout", null),
              Aa(t, "mousedown", Fi),
              Aa(t, "touchstart", Fi),
              Aa(t, "click", Ki, !0),
              Aa(t, "contextmenu", si);
          Wa(J, !0),
            y &&
              (Aa(y, "touchcancel", he),
              Aa(y, "touchend", he),
              Aa(y, "touchmove", ue)),
            Aa(de, "mouseup", he),
            Aa(de, "mousemove", ue);
        }
        return (
          Ia(g, Ji),
          (u = !1),
          Se &&
            "soft" !== e &&
            (Se.untrack(h || g, G ? "x,y" : W ? "rotation" : "top,left"),
            j.tween && j.tween.kill()),
          h && h.disable(),
          xa(ti),
          (j.isDragging = j.isPressed = x = !1),
          o && Qa(j, "dragend", "onDragEnd"),
          j
        );
      }),
      (e.enabled = function (e, t) {
        return arguments.length ? (e ? j.enable(t) : j.disable(t)) : u;
      }),
      (e.kill = function () {
        return (
          (j.isThrowing = !1),
          j.tween && j.tween.kill(),
          j.disable(),
          me.set(J, { clearProps: "userSelect" }),
          delete He[g._gsDragID],
          j
        );
      }),
      (e.revert = function () {
        this.kill(), this.styles && this.styles.revert();
      }),
      ~o.indexOf("scroll") &&
        ((h = e.scrollProxy =
          new $a(
            g,
            (function _extend(e, t) {
              for (var o in t) o in e || (e[o] = t[o]);
              return e;
            })(
              {
                onKill: function onKill() {
                  j.isPressed && he(null);
                },
              },
              p
            )
          )),
        (g.style.overflowY = K && !Te ? "auto" : "hidden"),
        (g.style.overflowX = U && !Te ? "auto" : "hidden"),
        (g = h.content)),
      W ? (n.rotation = 1) : (U && (n[Q] = 1), K && (n[V] = 1)),
      (le.force3D = !("force3D" in p) || p.force3D),
      Ce(_assertThisInitialized(e)),
      e.enable(),
      e
    );
  }
  !(function _setDefaults(e, t) {
    for (var o in t) o in e || (e[o] = t[o]);
  })(Q.prototype, {
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isDragging: !1,
    isPressed: !1,
  }),
    (Q.zIndex = 1e3),
    (Q.version = "3.12.7"),
    Y() && me.registerPlugin(Q);
  function sb() {
    return "undefined" != typeof window;
  }
  function tb() {
    return V || (sb() && (V = window.gsap) && V.registerPlugin && V);
  }
  function ub(e) {
    return "string" == typeof e;
  }
  function vb(e) {
    return "function" == typeof e;
  }
  function xb(e) {
    return void 0 === e;
  }
  function Eb(e, t, o) {
    var n = K.createElementNS
      ? K.createElementNS("svg" === e ? F : G, e)
      : K.createElement(e);
    return (
      t && (ub(t) && (t = K.querySelector(t)), t.appendChild(n)),
      "svg" === e &&
        (n.setAttribute("xmlns", F), n.setAttribute("xmlns:xlink", G)),
      o && (n.style.cssText = o),
      n
    );
  }
  function Fb() {
    K.selection
      ? K.selection.empty()
      : O.getSelection && O.getSelection().removeAllRanges();
  }
  function Hb(e, t) {
    var o = 0,
      n = Math.max(0, e._repeat),
      i = e._first;
    for (i || (o = e.duration()); i; )
      (o = Math.max(
        o,
        999 < i.totalDuration() ? i.endTime(!1) : i._start + i._tDur / i._ts
      )),
        (i = i._next);
    return !t && n ? o * (n + 1) + e._rDelay * n : o;
  }
  function Jb(e, t, o, n) {
    var i, a, r;
    return (
      ub(e) &&
        ("=" === e.charAt(1)
          ? ((i = parseInt(e.charAt(0) + "1", 10) * parseFloat(e.substr(2))) <
              0 &&
              0 === n &&
              (n = 100),
            (e = (n / 100) * t.duration() + i))
          : isNaN(e) && t.labels && -1 !== t.labels[e]
          ? (e = t.labels[e])
          : t === j &&
            (0 < (a = e.indexOf("="))
              ? ((i =
                  parseInt(e.charAt(a - 1) + "1", 10) *
                  parseFloat(e.substr(a + 1))),
                (e = e.substr(0, a - 1)))
              : (i = 0),
            (r = V.getById(e)) &&
              (e =
                (function _globalizeTime(e, t) {
                  for (
                    var o = e, n = 1 < arguments.length ? +t : o.rawTime();
                    o;

                  )
                    (n = o._start + n / (o._ts || 1)), (o = o.parent);
                  return n;
                })(r, (o / 100) * r.duration()) + i))),
      (e = isNaN(e) ? o : parseFloat(e)),
      Math.min(100, Math.max(0, (e / t.duration()) * 100))
    );
  }
  function Nb(t, e, o, n) {
    var i, a;
    if (
      (("mousedown" !== e && "mouseup" !== e) || (t.style.cursor = "pointer"),
      "mousedown" === e &&
        (a = xb(t.onpointerdown)
          ? xb(t.ontouchstart)
            ? null
            : "touchstart"
          : "pointerdown"))
    )
      return (
        (i = function handler(e) {
          "select" !== e.target.nodeName.toLowerCase() && e.type === a
            ? (e.stopPropagation(), W && (e.preventDefault(), o.call(t, e)))
            : e.type !== a && o.call(t, e),
            (W = !0);
        }),
        t.addEventListener(a, i, n),
        void ("pointerdown" !== a && t.addEventListener(e, i, n))
      );
    t.addEventListener(e, o, n);
  }
  function Ob(e, t, o) {
    e.removeEventListener(t, o),
      (t =
        "mousedown" !== t
          ? null
          : xb(e.onpointerdown)
          ? xb(e.ontouchstart)
            ? null
            : "touchstart"
          : "pointerdown") && e.removeEventListener(t, o);
  }
  function Pb(e, t, o, n) {
    var i,
      a = e.options,
      r = a.length;
    for (t += ""; -1 < --r; )
      if (a[r].innerHTML === t || a[r].value === t)
        return (e.selectedIndex = r), (o.innerHTML = a[r].innerHTML), a[r];
    n &&
      ((i = Eb("option", e)).setAttribute("value", t),
      (i.innerHTML = o.innerHTML = ub(n) ? n : t),
      (e.selectedIndex = a.length - 1));
  }
  function Qb(e, t, o) {
    var n = e.options,
      i = Math.min(n.length - 1, Math.max(0, e.selectedIndex + t));
    return (
      (e.selectedIndex = i), o && (o.innerHTML = n[i].innerHTML), n[i].value
    );
  }
  function Rb() {
    var e,
      t,
      o,
      n = I._first;
    if (te) {
      for (e = j._dur; n; )
        (t = n._next),
          (o = n._targets && n._targets[0]),
          (vb(o) && o === n.vars.onComplete && !n._dur) ||
            (o && o._gsIgnore) ||
            j.add(n, n._start - n._delay),
          (n = t);
      return e !== j.duration();
    }
  }
  function Ub(e) {
    return V.getById(e) || ne.getById(e) || (e === j.vars.id && j);
  }
  function Vb(e) {
    (V = e || tb()),
      U ||
        (V &&
          sb() &&
          ((K = document),
          (q = K.documentElement),
          (O = window),
          (ae = V.core.context || function () {}),
          V.registerPlugin(Q),
          ((I = V.globalTimeline)._sort = !0),
          (I.autoRemoveChildren = !1),
          (J = V.core.Animation),
          (ne = V.timeline({
            data: "indy",
            autoRemoveChildren: !0,
            smoothChildTiming: !0,
          })).kill(),
          (ne._dp = 0),
          ne.to({}, { duration: 1e12 }),
          (j = V.timeline(
            {
              data: "root",
              id: "Global Timeline",
              autoRemoveChildren: !1,
              smoothChildTiming: !0,
              parent: ne,
            },
            0
          )),
          (ee = V.to(
            j,
            {
              duration: 1,
              time: 1,
              ease: "none",
              data: "root",
              id: "_rootTween",
              paused: !0,
              immediateRender: !1,
              parent: ne,
            },
            0
          )),
          (I.killTweensOf = function (e, t, o) {
            j.killTweensOf(e, t, o), j.killTweensOf.call(I, e, t, o);
          }),
          (ne._start = V.ticker.time),
          V.ticker.add(function (e) {
            return ne.render(e - ne._start);
          }),
          (I._start += I._time),
          (j._start = I._time = I._tTime = 0),
          (ie = function _delayedCall(e, t, o, n) {
            return V.to(
              t,
              {
                delay: e,
                duration: 0,
                onComplete: t,
                onReverseComplete: t,
                onCompleteParams: o,
                onReverseCompleteParams: o,
                callbackScope: n,
                parent: ne,
              },
              ne._time
            );
          })(0.01, function () {
            return te ? te.update() : Rb();
          }),
          ie(2, function () {
            var e, t, o;
            if (!te)
              for (Rb(), e = j._first, o = j._start; e; )
                (t = e._next),
                  e._tDur !== e._tTime || (!e._dur && 1 !== e.progress())
                    ? I.add(e, e._start - e._delay + o)
                    : e.kill(),
                  (e = t);
            2 < ue.globalRecordingTime
              ? ie(ue.globalRecordingTime - 2, function () {
                  te && te.update(), (I.autoRemoveChildren = !0);
                })
              : (I.autoRemoveChildren = !0),
              (se = !1);
          }),
          (U = 1)));
  }
  function Wb(e, t) {
    t.globalSync || e.parent === I || I.add(e, I.time());
  }
  var V,
    U,
    K,
    q,
    O,
    j,
    J,
    ee,
    te,
    oe,
    I,
    ne,
    ie,
    ae,
    re,
    se = !0,
    le = 0,
    F = "http://www.w3.org/2000/svg",
    G = "http://www.w3.org/1999/xhtml",
    ce = 0,
    de = {},
    pe = (function () {
      try {
        return (
          sessionStorage.setItem("gsTest", "1"),
          sessionStorage.removeItem("gsTest"),
          !0
        );
      } catch (e) {
        return !1;
      }
    })(),
    W = !0,
    ue = function GSDevTools(a) {
      U || (Vb(), V || console.warn("Please gsap.registerPlugin(GSDevTools)")),
        (this.vars = a = a || {}),
        a.animation &&
          (
            GSDevTools.getByAnimation(a.animation) || {
              kill: function kill() {
                return 0;
              },
            }
          ).kill(),
        (a.id = a.id || (ub(a.animation) ? a.animation : ce++)),
        (de[a.id + ""] = this),
        "globalSync" in a || (a.globalSync = !a.animation);
      function Yn(e) {
        return n.querySelector(e);
      }
      function Zn(e, t) {
        return (
          !1 !== a.persist &&
            pe &&
            sessionStorage.setItem("gs-dev-" + e + a.id, t),
          t
        );
      }
      function $n(e) {
        var t;
        if (!1 !== a.persist && pe)
          return (
            (t = sessionStorage.getItem("gs-dev-" + e + a.id)),
            "animation" === e ? t : "loop" === e ? "true" === t : parseFloat(t)
          );
      }
      function Go(c, d, p) {
        return function (e) {
          var t,
            o = y.getBoundingClientRect(),
            n = c.getBoundingClientRect(),
            i = n.width * d,
            a = V.getProperty(c, "x"),
            r = o.left - n.left - i + a,
            s = o.right - n.right + (n.width - i) + a,
            l = r;
          p &&
            (c !== M &&
              (t = M.getBoundingClientRect()).left &&
              (r += t.left + t.width - o.left),
            c !== k &&
              (t = k.getBoundingClientRect()).left &&
              (s -= o.left + o.width - t.left)),
            (m = C),
            this.applyBounds({ minX: r, maxX: s }),
            (u = v.duration() / o.width),
            (g = -l * u),
            f ? v.pause() : v.pause(g + u * this.x),
            this.target === x &&
              (this.activated && (this.allowEventDefault = !1),
              (this.activated = !0)),
            (h = !0);
        };
      }
      function Io() {
        (D = 0),
          (S = 100),
          (M.style.left = "0%"),
          (k.style.left = "100%"),
          Zn("in", D),
          Zn("out", S),
          B(!0);
      }
      function Mo(e) {
        if (!R.isPressed) {
          var t = e.target.getBoundingClientRect(),
            o =
              (((e.changedTouches ? e.changedTouches[0] : e).clientX - t.left) /
                t.width) *
              100;
          if (o < D)
            return (
              (D = o = Math.max(0, o)),
              (M.style.left = D + "%"),
              void A.startDrag(e)
            );
          if (S < o)
            return (
              (S = o = Math.min(100, o)),
              (k.style.left = S + "%"),
              void X.startDrag(e)
            );
          v.progress(o / 100).pause(), B(!0), R.startDrag(e);
        }
      }
      function Qo() {
        if (!R.isPressed) {
          Wb(v, a);
          var e = v._targets && v._targets[0];
          e === i && e.seek(s + ((l - s) * D) / 100),
            v.progress(D / 100, !0),
            C || v.resume();
        }
      }
      function Ro(e) {
        if ((Zn("loop", (d = e)), d)) {
          if ((Y.play(), v.progress() >= S / 100)) {
            var t = v._targets && v._targets[0];
            t === i && t.seek(s + ((l - s) * D) / 100),
              i._repeat && !D && 100 === S
                ? v.totalProgress(0, !0)
                : v.progress(D / 100, !0),
              H();
          }
        } else Y.reverse();
      }
      function So() {
        return Ro(!d);
      }
      function To() {
        var e,
          t,
          o = (function _getChildrenOf(e, t) {
            for (var o = [], n = 0, i = V.core.Tween, a = e._first; a; )
              a instanceof i
                ? a.vars.id && (o[n++] = a)
                : (t && a.vars.id && (o[n++] = a),
                  (n = (o = o.concat(_getChildrenOf(a, t))).length)),
                (a = a._next);
            return o;
          })(r && !a.globalSync ? r : j, !0),
          n = E.children,
          i = 0;
        for (
          r && !a.globalSync
            ? o.unshift(r)
            : a.hideGlobalTimeline || o.unshift(j),
            t = 0;
          t < o.length;
          t++
        )
          ((e = n[t] || Eb("option", E)).animation = o[t]),
            (i = t && o[t].vars.id === o[t - 1].vars.id ? i + 1 : 0),
            e.setAttribute(
              "value",
              (e.innerHTML =
                o[t].vars.id +
                (i
                  ? " [" + i + "]"
                  : o[t + 1] && o[t + 1].vars.id === o[t].vars.id
                  ? " [0]"
                  : ""))
            );
        for (; t < n.length; t++) E.removeChild(n[t]);
      }
      function Uo(e) {
        var t,
          o,
          n = parseFloat(N.options[N.selectedIndex].value) || 1;
        if (!arguments.length) return i;
        if (
          (ub(e) && (e = Ub(e)),
          e instanceof J ||
            console.warn("GSDevTools error: invalid animation."),
          e.scrollTrigger &&
            console.warn(
              "GSDevTools can't work with ScrollTrigger-based animations; either the scrollbar -OR- the GSDevTools scrubber can control the animation."
            ),
          e !== i)
        ) {
          if (
            (i && ((i._inProgress = D), (i._outProgress = S)),
            (i = e),
            v &&
              ((n = v.timeScale()),
              v._targets && v._targets[0] === r && (r.resume(), v.kill())),
            (D = i._inProgress || 0),
            (S = i._outProgress || 100),
            (M.style.left = D + "%"),
            (k.style.left = S + "%"),
            c && (Zn("animation", i.vars.id), Zn("in", D), Zn("out", S)),
            (s = 0),
            (o = a.maxDuration || Math.min(1e3, Hb(i))),
            i === j || a.globalSync)
          ) {
            if (
              (Rb(),
              (v = ee),
              te &&
                te !== p &&
                console.warn(
                  "Error: GSDevTools can only have one instance that's globally synchronized."
                ),
              (te = p),
              i !== j)
            )
              for (
                99999999 < (l = (t = i).totalDuration()) && (l = t.duration());
                t.parent;

              )
                (s = s / t._ts + t._start),
                  (l = l / t._ts + t._start),
                  (t = t.parent);
            else l = j.duration();
            o < l - s && (l = s + o),
              j.pause(s),
              (ee.vars.time = l),
              ee.invalidate(),
              ee.duration(l - s).timeScale(n),
              C
                ? ee.progress(1, !0).pause(0, !0)
                : ie(0.01, function () {
                    ee.resume().progress(D / 100), C && H();
                  });
          } else {
            if (
              (te === p && (te = null),
              (s = Math.min(D * i.duration(), i.time())),
              i !== r && r)
            ) {
              for (
                99999999 < (l = (t = i).totalDuration()) && (l = t.duration());
                t.parent.parent && t !== r;

              )
                (s = s / (t._ts || t._pauseTS) + t._start),
                  (l = l / (t._ts || t._pauseTS) + t._start),
                  (t = t.parent);
              o < l - s && (l = s + o),
                r.pause(s),
                (v = V.to(
                  r,
                  {
                    duration: l - s,
                    time: l,
                    ease: "none",
                    data: "root",
                    parent: ne,
                  },
                  ne._time
                ));
            } else (v = i), !d && v._repeat && Ro(!0);
            v.timeScale(n), ee.pause(), j.resume(), v.seek(0);
          }
          (_.innerHTML = v.duration().toFixed(2)), Pb(E, i.vars.id, P);
        }
      }
      function Wo(e) {
        Uo(E.options[E.selectedIndex].animation),
          e.target && e.target.blur && e.target.blur(),
          C && H();
      }
      function Xo() {
        var e,
          t = parseFloat(N.options[N.selectedIndex].value) || 1;
        v.timeScale(t),
          Zn("timeScale", t),
          C ||
            (v.progress() >= S / 100
              ? ((e = v._targets && v._targets[0]) === i &&
                  e.seek(s + ((l - s) * D) / 100),
                v.progress(D / 100, !0).pause())
              : v.pause(),
            ie(0.01, function () {
              return v.resume();
            })),
          (z.innerHTML = t + "x"),
          N.blur && N.blur();
      }
      function $o(e) {
        Q.hitTest(e, n) ||
          R.isDragging ||
          A.isDragging ||
          X.isDragging ||
          W.restart(!0);
      }
      function _o() {
        G || (F.play(), W.pause(), (G = !0));
      }
      function ap() {
        W.pause(), G && (F.reverse(), (G = !1));
      }
      function dp(e) {
        se && !le && (le = j._start),
          (c = !e),
          (r = (function _parseAnimation(e) {
            return e instanceof J ? e : e ? V.getById(e) : null;
          })(a.animation)) &&
            !r.vars.id &&
            (r.vars.id = "[no id]"),
          Rb(),
          To();
        var t = Ub($n("animation"));
        t &&
          ((t._inProgress = $n("in") || 0),
          (t._outProgress = $n("out") || 100)),
          a.paused && O(),
          (i = null),
          Uo(r || t || j);
        var o = a.timeScale || $n("timeScale"),
          n = t === i;
        o && (Pb(N, o, z, o + "x"), v.timeScale(o)),
          100 ===
            (D =
              ("inTime" in a ? Jb(a.inTime, i, 0, 0) : n ? t._inProgress : 0) ||
              0) &&
            !a.animation &&
            t &&
            (Uo(j), (D = Jb(a.inTime, i, 0, 0) || 0)),
          D &&
            ((M.style.left = D + "%"),
            (M.style.display = k.style.display = "block")),
          (S =
            ("outTime" in a
              ? Jb(a.outTime, i, 100, D)
              : n
              ? t._outProgress
              : 0) || 100) < D && (S = 100),
          100 !== S &&
            ((k.style.left = S + "%"),
            (M.style.display = k.style.display = "block")),
          (d = "loop" in a ? a.loop : $n("loop")) && Ro(!0),
          a.paused && v.progress(D / 100, !0).pause(),
          se && i === j && le && a.globalSync && !C && v.time(-le, !0),
          B(!0);
      }
      var u,
        g,
        h,
        f,
        m,
        i,
        v,
        r,
        s,
        l,
        c,
        e,
        d,
        p = this,
        n = (function _createRootElement(e, t, o) {
          re ||
            ((Eb("style", q).innerHTML =
              ".gs-dev-tools{height:51px;bottom:0;left:0;right:0;display:block;position:fixed;overflow:visible;padding:0}.gs-dev-tools *{box-sizing:content-box;visibility:visible}.gs-dev-tools .gs-top{position:relative;z-index:499}.gs-dev-tools .gs-bottom{display:flex;align-items:center;justify-content:space-between;background-color:rgba(0,0,0,.6);height:42px;border-top:1px solid #999;position:relative}.gs-dev-tools .timeline{position:relative;height:8px;margin-left:15px;margin-right:15px;overflow:visible}.gs-dev-tools .progress-bar,.gs-dev-tools .timeline-track{height:8px;width:100%;position:absolute;top:0;left:0}.gs-dev-tools .timeline-track{background-color:#999;opacity:.6}.gs-dev-tools .progress-bar{background-color:#91e600;height:8px;top:0;width:0;pointer-events:none}.gs-dev-tools .seek-bar{width:100%;position:absolute;height:24px;top:-12px;left:0;background-color:transparent}.gs-dev-tools .in-point,.gs-dev-tools .out-point{width:15px;height:26px;position:absolute;top:-18px}.gs-dev-tools .in-point-shape{fill:#6d9900;stroke:rgba(0,0,0,.5);stroke-width:1}.gs-dev-tools .out-point-shape{fill:#994242;stroke:rgba(0,0,0,.5);stroke-width:1}.gs-dev-tools .in-point{transform:translateX(-100%)}.gs-dev-tools .out-point{left:100%}.gs-dev-tools .grab{stroke:rgba(255,255,255,.3);stroke-width:1}.gs-dev-tools .playhead{position:absolute;top:-5px;transform:translate(-50%,0);left:0;border-radius:50%;width:16px;height:16px;border:1px solid #6d9900;background-color:#91e600}.gs-dev-tools .gs-btn-white{fill:#fff}.gs-dev-tools .pause{opacity:0}.gs-dev-tools .select-animation{vertical-align:middle;position:relative;padding:6px 10px}.gs-dev-tools .select-animation-container{flex-grow:4;width:40%}.gs-dev-tools .select-arrow{display:inline-block;width:12px;height:7px;margin:0 7px;transform:translate(0,-2px)}.gs-dev-tools .select-arrow-shape{stroke:rgba(255,255,255,.6);stroke-width:2px;fill:none}.gs-dev-tools .rewind{height:16px;width:19px;padding:10px 4px;min-width:24px}.gs-dev-tools .rewind-path{opacity:.6}.gs-dev-tools .play-pause{width:24px;height:24px;padding:6px 10px;min-width:24px}.gs-dev-tools .ease{width:30px;height:30px;padding:10px;min-width:30px;display:none}.gs-dev-tools .ease-path{fill:none;stroke:rgba(255,255,255,.6);stroke-width:2px}.gs-dev-tools .ease-border{fill:rgba(255,255,255,.25)}.gs-dev-tools .time-scale{font-family:monospace;font-size:18px;text-align:center;color:rgba(255,255,255,.6);padding:4px 4px 4px 0;min-width:30px;margin-left:7px}.gs-dev-tools .loop{width:20px;padding:5px;min-width:20px}.gs-dev-tools .loop-path{fill:rgba(255,255,255,.6)}.gs-dev-tools label span{color:#fff;font-family:monospace;text-decoration:none;font-size:16px;line-height:18px}.gs-dev-tools .time-scale span{color:rgba(255,255,255,.6)}.gs-dev-tools button:focus,.gs-dev-tools select:focus{outline:0}.gs-dev-tools label{position:relative;cursor:pointer}.gs-dev-tools label.locked{text-decoration:none;cursor:auto}.gs-dev-tools label input,.gs-dev-tools label select{position:absolute;left:0;top:0;z-index:1;font:inherit;font-size:inherit;line-height:inherit;height:100%;width:100%;color:#000!important;opacity:0;background:0 0;border:none;padding:0;margin:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;cursor:pointer}.gs-dev-tools label input+.display{position:relative;z-index:2}.gs-dev-tools .gs-bottom-right{vertical-align:middle;display:flex;align-items:center;flex-grow:4;width:40%;justify-content:flex-end}.gs-dev-tools .time-container{font-size:18px;font-family:monospace;color:rgba(255,255,255,.6);margin:0 5px}.gs-dev-tools .logo{width:32px;height:32px;position:relative;top:2px;margin:0 12px}.gs-dev-tools .gs-hit-area{background-color:transparent;width:100%;height:100%;top:0;position:absolute}.gs-dev-tools.minimal{height:auto;display:flex;align-items:stretch}.gs-dev-tools.minimal .gs-top{order:2;flex-grow:4;background-color:rgba(0,0,0,1)}.gs-dev-tools.minimal .gs-bottom{background-color:rgba(0,0,0,1);border-top:none}.gs-dev-tools.minimal .timeline{top:50%;transform:translate(0,-50%)}.gs-dev-tools.minimal .in-point,.gs-dev-tools.minimal .out-point{display:none}.gs-dev-tools.minimal .select-animation-container{display:none}.gs-dev-tools.minimal .rewind{display:none}.gs-dev-tools.minimal .play-pause{width:20px;height:20px;padding:4px 6px;margin-left:14px}.gs-dev-tools.minimal .time-scale{min-width:26px}.gs-dev-tools.minimal .loop{width:18px;min-width:18px;display:none}.gs-dev-tools.minimal .gs-bottom-right{display:none}@media only screen and (max-width:600px){.gs-dev-tools{height:auto;display:flex;align-items:stretch}.gs-dev-tools .gs-top{order:2;flex-grow:4;background-color:rgba(0,0,0,1);height:42px}.gs-dev-tools .gs-bottom{background-color:rgba(0,0,0,1);border-top:none}.gs-dev-tools .timeline{top:50%;transform:translate(0,-50%)}.gs-dev-tools .in-point,.gs-dev-tools .out-point{display:none}.gs-dev-tools .select-animation-container{display:none}.gs-dev-tools .rewind{display:none}.gs-dev-tools .play-pause{width:20px;height:20px;padding:4px 6px;margin-left:14px}.gs-dev-tools .time-scale{min-width:26px}.gs-dev-tools .loop{width:18px;min-width:18px;display:none}.gs-dev-tools .gs-bottom-right{display:none}}"),
            (re = !0)),
            ub(e) && (e = K.querySelector(e));
          var n = Eb("div", e || q.getElementsByTagName("body")[0] || q);
          return (
            n.setAttribute("class", "gs-dev-tools" + (t ? " minimal" : "")),
            (n.innerHTML =
              '<div class=gs-hit-area></div><div class=gs-top><div class=timeline><div class=timeline-track></div><div class=progress-bar></div><div class=seek-bar></div><svg class=in-point viewBox="0 0 15 26" xmlns=http://www.w3.org/2000/svg><polygon class=in-point-shape points=".5 .5 14.5 .5 14.5 25.5 .5 17.5"/><polyline class=grab points="5.5 4 5.5 15"/><polyline class=grab points="9.5 4 9.5 17"/></svg><svg class=out-point viewBox="0 0 15 26" xmlns=http://www.w3.org/2000/svg><polygon class=out-point-shape points=".5 .5 14.5 .5 14.5 17.5 .5 25.5"/><polyline class=grab points="5.5 4 5.5 17"/><polyline class=grab points="9.5 4 9.5 15"/></svg><div class=playhead></div></div></div><div class=gs-bottom><div class=select-animation-container><label class=select-animation><select class=animation-list><option>Global Timeline<option>myTimeline</select><nobr><span class="display animation-label">Global Timeline</span><svg class=select-arrow viewBox="0 0 12.05 6.73" xmlns=http://www.w3.org/2000/svg><polyline class=select-arrow-shape points="0.35 0.35 6.03 6.03 11.7 0.35"/></svg></nobr></label></div><svg class=rewind viewBox="0 0 12 15.38" xmlns=http://www.w3.org/2000/svg><path d=M0,.38H2v15H0Zm2,7,10,7.36V0Z class="gs-btn-white rewind-path"/></svg><svg class=play-pause viewBox="0 0 20.97 25.67" xmlns=http://www.w3.org/2000/svg><g class=play><path d="M8,4.88 C8,10.18 8,15.48 8,20.79 5.33,22.41 2.66,24.04 0,25.67 0,17.11 0,8.55 0,0 2.66,1.62 5.33,3.25 8,4.88" class="gs-btn-white play-1" style=stroke:#fff;stroke-width:.6px /><path d="M14.485,8.855 C16.64,10.18 18.8,11.5 20.97,12.83 16.64,15.48 12.32,18.13 8,20.79 8,15.48 8,10.18 8,4.88 10.16,6.2 12.32,7.53 14.48,8.85" class="gs-btn-white play-2" style=stroke:#fff;stroke-width:.6px /></g></svg> <svg class=loop viewBox="0 0 29 25.38" xmlns=http://www.w3.org/2000/svg><path d=M27.44,5.44,20.19,0V3.06H9.06A9.31,9.31,0,0,0,0,12.41,9.74,9.74,0,0,0,.69,16l3.06-2.23a6,6,0,0,1-.12-1.22,5.49,5.49,0,0,1,5.43-5.5H20.19v3.81Z class=loop-path /><path d=M25.25,11.54a5.18,5.18,0,0,1,.12,1.12,5.41,5.41,0,0,1-5.43,5.41H9.19V14.5L1.94,19.94l7.25,5.44V22.06H19.94A9.2,9.2,0,0,0,29,12.84a9.42,9.42,0,0,0-.68-3.53Z class=loop-path /></svg> <svg class=ease viewBox="0 0 25.67 25.67" xmlns=http://www.w3.org/2000/svg><path d=M.48,25.12c1.74-3.57,4.28-12.6,8.8-10.7s4.75,1.43,6.5-1.11S19.89,1.19,25.2.55 class=ease-path /><path d=M24.67,1V24.67H1V1H24.67m1-1H0V25.67H25.67V0Z class=ease-border /></svg><label class=time-scale><select><option value=10>10x<option value=5>5x<option value=2>2x<option value=1 selected>1x<option value=0.5>0.5x<option value=0.25>0.25x<option value=0.1>0.1x</select><span class="display time-scale-label">1x</span></label><div class=gs-bottom-right><div class=time-container><span class=time>0.00</span> / <span class=duration>0.00</span></div><a href="https://gsap.com/docs/v3/Plugins/GSDevTools?source=GSDevTools" target=_blank title=Docs><svg class=logo viewBox="0 0 100 100" xmlns=http://www.w3.org/2000/svg><path d="M60 15.4c-.3-.4-.5-.6-.5-.7.1-.6.2-1 .2-1.7v-.4c.6.6 1.3 1.3 1.8 1.7.2.2.5.3.8.3.2 0 .3 0 .5.1h1.6c.8 0 1.6.1 2 0 .1 0 .2 0 .3-.1.6-.3 1.4-1 2.1-1.6 0 .6.1 1.2.1 1.7v1.5c0 .3 0 .5.1.7-.1.1-.2.1-.4.2-.7.4-1.7 1-2.3.9-.5-.1-1.5-.3-2.6-.7-1.2-.3-2.4-.8-3.2-1.2 0 0-.1 0-.1-.1s-.2-.4-.4-.6zm24.6 21.9c-.5-1.7-1.9-2-4.2-.7.9-1.5 2.1-1.5 2.3-2.1.9-2.5-.6-4.6-1.2-5.3.7-1.8 1.4-4.5-1-6.8-1-1-2.4-1.2-3.6-1.1 1.8 1.7 3.4 4.4 2.5 7.2-.1.3-.9.7-1.7 1 0 0 .4 2-.3 3.5-.3.6-.8 1.5-1.3 2.6 1 .9 1.6 1 3 1.3-.9.1-1.2.4-1.2.5-.7 3 1 3.4 1.4 4.8 0 .1 0 .2.1.3v.4c-.3.3-1.4.5-2.5.5s-1.8 1-1.8 1c-.2.1-.3.3-.4.4v1c0 .1 0 .4.1.6.1.5.3 1.3.4 1.8.9.6 1.4.9 2.2 1.1.5.1 1 .2 1.5.1.3-.1.7-.3 1-.7 1.5-1.7 1.9-3.2 2.2-4.1 0-.1 0-.2.1-.2 0 .1.1.1.1.2 0 0 .1-.1.1-.2l.1-.1c1.3-1.6 2.9-4.5 2.1-7zM74.3 49.9c-.1-.3-.1-.7-.2-1.1v-.2c-.1-.2-.1-.4-.2-.6 0-.1-.1-.3-.1-.5s-.1-.5-.1-.7v-.1c0-.2-.1-.5-.1-.7-.1-.3-.1-.7-.2-1.1v-.1c0-.2 0-.3-.1-.5v-.9c0-.1 0-.2.1-.3V43h-.3c-1.1.1-3.8.4-6.7.2-1.2-.1-2.4-.3-3.6-.6-1-.3-1.8-.5-2.3-.7-1.2-.4-1.6-.6-1.8-.7 0 .2-.1.4-.1.7 0 .3-.1.5-.1.8-.1.2-.1.4-.2.6l.1.1c.5.5 1.5 1.3 1.5 2.1v.2c-.1.4-.4.5-.8.9-.1.1-.6.7-1.1 1.1l-.6.6c-.1 0-.1.1-.2.1-.1.1-.3.2-.4.3-.2.1-.7.5-.8.6-.1.1-.2.1-.3.1-2.8 8.8-2.2 13.5-1.5 16.1.1.5.3 1 .4 1.3-.4.5-.8 1-1.2 1.4-1.2 1.5-2 2.6-2.6 4.2 0 .1 0 .1-.1.2 0 .1 0 .2-.1.2-.2.5-.3 1-.4 1.5-.6 2.3-.8 4.5-.9 6.6-.1 2.4-.2 4.6-.5 6.9.7.3 3.1.9 4.7.6.2-.1 0-3.9.6-5.7l.6-1.5c.4-.9.9-1.9 1.3-3.1.3-.7.5-1.5.7-2.4.1-.5.2-1 .3-1.6V74v-.1c.1-.6.1-1.3.1-2 0-.2-.7.3-1.1.9.3-1.8 1.3-2.1 2-3.2.3-.5.6-1.1.6-2 2.5-1.7 4-3.7 5-5.7.2-.4.4-.9.6-1.4.3-.8.5-1.6.7-2.4.3-1.4.8-3.2 1.2-4.8v-.1c.4-1.2.8-2.2 1.2-2.6-.2.9-.4 1.7-.6 2.5v.2c-.6 3.5-.7 6.2-2 9.2 1 2.6 1.9 3.9 2 7.6-2 0-3.2 1.6-3.7 3.2 1.2.3 3.9.7 8.3.1h.3c.1-.5.3-1.1.5-1.5.3-.8.5-1.5.6-2.2.2-1.3.1-2.4 0-3.2 3.9-3.7 2.6-11 1.6-16.6zm.3-15.1c.1-.3.2-.6.4-.8.2-.3.3-.7.5-1 .1-.3.3-.6.4-.9.5-1.5.4-2.8.3-3.5-.1 0-.1-.1-.2-.1-.5-.2-.9-.4-1.4-.6-.1 0-.2-.1-.3-.1-3.8-1.2-7.9-.9-11.9.1-1 .2-1.9.5-2.9.1-2.3-.8-3.9-1.9-4.6-2.8l-.2-.2c-.1.2-.2.4-.4.6.2 2.3-.5 3.9-1.4 5.1.9 1.2 2.6 2.8 3.6 3.4 1.1.6 1.7.7 3.4.4-.6.7-1.1 1-1.9 1.4.1.7.2 2 .5 3.4.3.3 1.2.8 2.3 1.3.5.3 1.1.5 1.7.7.8.3 1.7.6 2.4.8.1 0 .2.1.3.1.5.1 1.1.2 1.8.2h.9c2.1 0 4.5-.2 5.4-.3h.1c-.1-2.7.2-4.6.7-6.2.2-.3.4-.7.5-1.1zm-23.2 9.3v.2c-.3 1.7.5 2.4 1.9 3.4.6.5 0 .5.5.8.3.2.7.3 1 .3.3 0 .5 0 .8-.1.2-.1.4-.3.6-.5.1-.1.3-.2.5-.4.3-.2.6-.5.7-.6.1-.1.2-.1.3-.2.2-.2.5-.5.6-.7.2-.2.4-.5.5-.7 0-.1.1-.1.1-.1v-.1c.1-.4-.3-.8-.8-1.3-.2-.2-.4-.3-.5-.5-.3-.3-.6-.5-1-.7-.9-.5-1.9-.7-3-.7l-.3-.3c-2.2-2.5-3.2-4.8-3.9-6.5-.9-2.1-1.9-3.3-3.9-4.9 1 .4 1.8.8 2.3 1.1.5.4 1.3.4 1.9.2.2-.1.5-.2.7-.3.2-.1.4-.2.6-.4 1.6-1.3 2.5-3.8 2.6-5.6v-.1c.2-.3.6-1.1.8-1.4l.1.1c.1.1.3.2.6.5.1 0 .1.1.2.1.1.1.2.1.2.2.8.6 1.9 1.3 2.6 1.7 1.4.7 2.3.7 5.3-.1 2.2-.6 4.8-.8 6.8-.8 1.4 0 2.7.3 4 .7.2.1.4.1.5.2.3.1.6.2.9.4 0 0 .1 0 .1.1.8.4 2.1 1.2 2.5-.3.1-2-.6-3.9-1.6-5.3 0 0-.1 0-.1-.1-.1-.1-.2-.2-.4-.3-.1-.1-.2-.1-.3-.2-.1-.1-.2-.2-.4-.2-.6-.4-1.2-.8-1.6-.9-.1-.1-.3-.1-.4-.2h-.1-.1c-.1 0-.3-.1-.4-.1-.1 0-.1 0-.2-.1h-.1l-.2-.4c-.2-.1-.4-.2-.5-.2h-.6c-.3 0-.5.1-.7.1-.7.1-1.2.3-1.7.4-.2 0-.3.1-.5.1-.5.1-1 .2-1.6.2-.4 0-.9-.1-1.5-.2-.4-.1-.8-.2-1.1-.3-.2-.1-.4-.1-.6-.2-.6-.2-1.1-.3-1.7-.4h-.2-1.8c-.3 0-.6.1-1 .1H57.9c-.8 0-1.5 0-2.3-.1-.2 0-.5-.1-.7-.1-.5-.1-.9-.2-1.3-.4-.2-.1-.3-.1-.4-.2-.1 0-.2 0-.2-.1-.3-.1-.6-.1-.9-.1H51h-.1c-.4 0-.9.1-1.4.2-1.1.2-2.1.6-3 1.3-.3.2-.6.5-.8.8-.1.1-.2.2-.2.3-.4.6-.8 1.2-.9 2 0 .2-.1.4-.1.6 0 .2 1.7.7 2.3 2.8-.8-1.2-2.3-2.5-4.1-1.4-1.5 1-1.1 3.1-2.4 5.4-.3.5-.6.9-1 1.4-.8 1-.7 2.1.2 4.4 1.4 3.4 7.6 5.3 11.5 8.3l.4.4zm8.7-36.3c0 .6.1 1 .2 1.6v.1c0 .3.1.6.1.9.1 1.2.4 2 1 2.9 0 .1.1.1.1.2.3.2.5.3.8.4 1.1.2 3.1.3 4.2 0 .2-.1.5-.3.7-.5.4-.4.7-1.1.9-1.7.1-.7.3-1.3.4-1.8 0-.2.1-.4.1-.5v-.1c0-.2 0-.3.1-.5.2-.7.2-2.4.3-2.8.1-.7 0-1.8-.1-2.5 0-.2-.1-.4-.1-.5v-.1c-.2-.5-1.4-1.4-4.3-1.4-3.1 0-4 1-4.1 1.5v.1c0 .1 0 .3-.1.5-.1.4-.2 1.4-.2 1.9v2.3zm-6 88.6c0-.1-.1-.2-.1-.3-.7-1.5-1.1-3.5-1.3-4.6.4.1.7.6.8.3.2-.5-.4-1.5-.5-2.2v-.1c-.5-.5-4-.5-3.7-.3-.4.8-1 .6-1.3 2.1-.1.7.8.1 1.7.1-1.4.9-3 2.1-3.4 3.2-.1.1-.1.2-.1.3 0 .2-.1.4-.1.5-.1 1.2.5 1.6 2 2.4H48.4c1.4.3 3 .3 4.3.3 1.2-.2 1.6-.7 1.6-1.4-.2-.1-.2-.2-.2-.3z" style=fill:#efefef /><path d="M56.1 36.5c.3 1.4.5 2.4.8 4.2h-.2c-.1.5-.1.9-.1 1.3-1-.4-2.2-.5-2.6-.5-3.7-4.4-2.9-6.1-4.4-8.3.4-.2 1-.4 1.5-.8 1.6 1.9 3.3 3 5 4.1zm-1.7 13.2s-1.4 0-2.3-1c0 0-.1-.5.1-.7 0 0-1.2-1-1.5-1.7-.2-.5-.3-1.1-.2-1.6-4.4-3.7-10.9-4.2-12.9-9.1-.5-1.2-1.3-2.9-.9-3.9-.3.1-.5.2-.8.3-2.9.9-11.7 5.3-17.9 8.8 1.6 1.7 2.6 4.3 3.2 7.2l.3 1.5c.1.5.1 1 .2 1.5.1 1.4.4 2.7.8 3.9.2.8.6 1.5.9 2.2.6 1 1.2 1.9 2.1 2.6.6.5 1.2.9 1.9 1.3 2.1 1.1 5 1.6 8.6 1.5H37.9c.5 0 1 .1 1.5.1h.1c.4.1.9.1 1.3.2h.2c.4.1.9.2 1.3.4h.1c.4.1.8.3 1.1.5h.1c.4.2.7.4 1.1.6h.1c.7.4 1.3.9 1.9 1.5l.1.1c.6.5 1.1 1.1 1.5 1.8 0 .1.1.1.1.2s.1.1.1.2c.4.6 1.2 1.1 1.9 1.3.7-.9 1.5-1.8 2.2-2.8-1.6-6 0-11.7 1.8-16.9zm-26-15.9c5-2.4 9-4.1 9.9-4.5.3-.6.6-1.4.9-2.6.1-.3.2-.5.3-.8 1-2.7 2.7-2.8 3.5-3v-.2c.1-1.1.5-2 1-2.8-8.8 2.5-18 5.5-28 11.7-.1.1-.2.2-.4.2C11.3 34.5 3 40.3 1.3 51c2.4-2.7 6-5.6 10.5-8.5.1-.1.3-.2.5-.3.2-.1.5-.3.7-.4 1.2-.7 2.4-1.4 3.6-2.2 2.2-1.2 4.5-2.4 6.7-3.5 1.8-.8 3.5-1.6 5.1-2.3zm54.9 61.3l-.3-.3c-.8-.6-4.1-1.2-5.5-2.3-.4-.3-1.1-.7-1.7-1.1-1.6-.9-3.5-1.8-3.5-2.1v-.1c-.2-1.7-.2-7 .1-8.8.3-1.8.7-4.4.8-5.1.1-.6.5-1.2.1-1.2h-.4c-.2 0-.4.1-.8.1-1.5.3-4.3.6-6.6.4-.9-.1-1.6-.2-2-.3-.5-.1-.7-.2-.9-.3H62.3c-.4.5 0 2.7.6 4.8.3 1.1.8 2 1.2 3 .3.8.6 1.8.8 3.1 0 .2.1.4.1.7.2 2.8.3 3.6-.2 4.9-.1.3-.3.6-.4 1-.4.9-.7 1.7-.6 2.3 0 .2.1.4.1.5.2.4.6.7 1.2.8.2 0 .3.1.5.1.3 0 .6.1.9.1 3.4 0 5.2 0 8.6.4 2.5.4 3.9.6 5.1.5.4 0 .9-.1 1.4-.1 1.2-.2 1.8-.5 1.9-.9-.1.2-.1.1-.2-.1zM60.2 16.4zm-.5 1.7zm3.8.5c.1 0 .3.1.5.1.4.1.7.2 1.2.3.3.1.6.1.9.1h1.3c.3-.1.7-.1 1-.2.7-.2 1.5-.4 2.7-.6h.3c.3 0 .6.1.9.3.1.1.2.1.4.2.3.2.8.2 1.2.4h.1c.1 0 .1.1.2.1.6.3 1.3.7 1.9 1.1l.3.3c.9-.1 1.6-.2 2.1-.2h.1c-.2-.4-.3-1.3-1.8-.6-.6-.7-.8-1.3-2.1-.9-.1-.2-.2-.3-.3-.4l-.1-.1c-.1-.1-.2-.3-.3-.4 0-.1-.1-.1-.1-.2-.2-.3-.5-.5-.9-.7-.7-.4-1.5-.6-2.3-.5-.2 0-.4.1-.6.2-.1 0-.2.1-.2.1-.1 0-.2.1-.3.2-.5.3-1.3.8-2.1 1-.1 0-.1 0-.2.1-.2 0-.4.1-.5.1H66.5h-.1c-.4-.1-1.1-.2-2-.5-.1 0-.2-.1-.3-.1-.9-.2-1.8-.5-2.7-.8-.3-.1-.7-.2-1-.3-.1 0-.1 0-.2-.1h-.1s-.1 0-.1-.1c-.3-.3-.7-.6-1.3-.8-.5-.2-1.2-.4-2.1-.5-.2 0-.5 0-.7.1-.4.2-.8.6-1.2.9.1.1.3.3.4.5.1.2.2.4.3.7l-.6-.6c-.5-.4-1.1-.8-1.7-.9-.8-.2-1.4.4-2.3.9 1 0 1.8.1 2.5.4.1 0 .1 0 .2.1h.1c.1 0 .2.1.3.1.9.4 1.8.6 2.7.6h1.3c.5 0 .8-.1 1.1-.1.1 0 .4 0 .7-.1h2.2c.4.4.9.6 1.6.8z" style=fill:#88ce02 /><path d="M100 51.8c0-19.5-12.5-36.1-30-42.1.1-1.2.2-2.4.3-3.1.1-1.5.2-3.9-.5-4.9-1.6-2.3-9.1-2.1-10.5-.1-.4.6-.7 3.6-.6 5.9-1.1-.1-2.2-.1-3.3-.1-16.5 0-30.9 9-38.6 22.3-2.4 1.4-4.7 2.8-6.1 4C5.4 38 2.2 43.2 1 47c-1.6 4.7-1.1 7.6.4 5.8 1.2-1.5 6.6-5.9 10.1-8.2-.4 2.3-.6 4.8-.6 7.2 0 21 14.5 38.5 34 43.3-.1 1.1.1 2 .7 2.6.9.8 3.2 2 6.4 1.6 2.9-.3 3.5-.5 3.2-2.9h.2c2.7 0 5.3-.2 7.8-.7.1.1.2.2.4.3 1.5 1 7.1.8 9.6.7s6.2.9 8.6.5c2.9-.5 3.4-2.3 1.6-3.2-1.5-.8-3.8-1.3-6.7-3.1C90.6 83.4 100 68.7 100 51.8zM60.1 5.5c0-.5.1-1.5.2-2.1 0-.2 0-.4.1-.5v-.1c.1-.5 1-1.5 4.1-1.5 2.9 0 4.2.9 4.3 1.4v.1c0 .1 0 .3.1.5.1.8.2 1.9.1 2.7 0 .5-.1 2.1-.2 2.9 0 .1 0 .3-.1.5v.1c0 .2-.1.3-.1.5-.1.5-.2 1.1-.4 1.8-.1.6-.5 1.2-.9 1.7-.2.3-.5.5-.7.5-1.1.3-3.1.3-4.2 0-.3-.1-.5-.2-.8-.4 0-.1-.1-.1-.1-.2-.6-.9-.9-1.7-1-2.9 0-.4-.1-.6-.1-.9v-.1c-.1-.6-.2-1-.2-1.6v-.3c-.1-1.3-.1-2.1-.1-2.1zm-.4 7.5v-.4c.6.6 1.3 1.3 1.8 1.7.2.2.5.3.8.3.2 0 .3 0 .5.1h1.6c.8 0 1.6.1 2 0 .1 0 .2 0 .3-.1.6-.3 1.4-1 2.1-1.6 0 .6.1 1.2.1 1.7v1.5c0 .3 0 .5.1.7-.1.1-.2.1-.4.2-.7.4-1.7 1-2.3.9-.5-.1-1.5-.3-2.6-.7-1.2-.3-2.4-.8-3.2-1.2 0 0-.1 0-.1-.1-.2-.3-.4-.5-.6-.7-.3-.4-.5-.6-.5-.7.3-.4.4-.9.4-1.6zm.5 3.4zm-7.3-.3c.6.1 1.2.5 1.7.9.2.2.5.4.6.6-.1-.2-.2-.5-.3-.7-.1-.2-.3-.4-.4-.5.4-.3.8-.7 1.2-.9.2-.1.4-.1.7-.1.9.1 1.6.2 2.1.5.6.2 1 .5 1.3.8 0 0 .1 0 .1.1h.1c.1 0 .1 0 .2.1.3.1.6.2 1 .3.9.3 1.9.6 2.7.8.1 0 .2.1.3.1.9.2 1.6.4 2 .5h.4c.2 0 .4 0 .5-.1.1 0 .1 0 .2-.1.7-.2 1.5-.7 2.1-1 .1-.1.2-.1.3-.2.1 0 .2-.1.2-.1.2-.1.4-.2.6-.2.8-.2 1.7.1 2.3.5.3.2.6.4.9.7 0 .1.1.1.1.2.1.2.2.3.3.4l.1.1c.1.1.2.2.3.4 1.3-.4 1.5.2 2.1.9 1.6-.7 1.7.2 1.8.6h-.1c-.5 0-1.2 0-2.1.2l-.3-.3c-.5-.4-1.2-.8-1.9-1.1-.1 0-.1-.1-.2-.1h-.1c-.4-.2-.8-.2-1.2-.4-.1-.1-.2-.1-.4-.2-.3-.1-.6-.3-.9-.3h-.3c-1.2.1-2 .4-2.7.6-.3.1-.7.2-1 .2-.4.1-.8.1-1.3 0-.3 0-.6-.1-.9-.1-.5-.1-.8-.2-1.2-.3-.2 0-.3-.1-.5-.1h-.1c-.6-.2-1.2-.3-1.8-.4h-.1-2.1c-.4.1-.6.1-.7.1-.3 0-.7.1-1.1.1h-1.3c-.9 0-1.9-.2-2.7-.6-.1 0-.2-.1-.3-.1H53c-.1 0-.1 0-.2-.1-.7-.3-1.6-.4-2.5-.4 1.2-.8 1.8-1.4 2.6-1.3zm6.8 2zm-15.2 4.1c.1-.7.4-1.4.9-2 .1-.1.2-.2.2-.3l.8-.8c.9-.6 1.9-1.1 3-1.3.5-.1 1-.2 1.4-.2H52c.3 0 .6.1.9.1.1 0 .2 0 .2.1.1.1.2.1.4.2.4.2.8.3 1.3.4.2 0 .5.1.7.1.7.1 1.5.1 2.3.1H58.7c.4 0 .7-.1 1-.1H61.7c.6.1 1.1.2 1.7.4.2 0 .4.1.6.2.3.1.7.2 1.1.3.6.1 1.1.2 1.5.2.6 0 1.1-.1 1.6-.2.2 0 .3-.1.5-.1.5-.1 1-.3 1.7-.4.2 0 .5-.1.7-.1h.6c.2 0 .4.1.5.2l.1.1h.1c.1 0 .1 0 .2.1.2.1.3.1.4.1h.2c.1.1.3.1.4.2.4.2 1 .6 1.6.9.1.1.2.2.4.2.1.1.2.1.3.2.2.1.3.3.4.3l.1.1c1.1 1.4 1.8 3.3 1.6 5.3-.3 1.5-1.6.7-2.5.3 0 0-.1 0-.1-.1-.3-.1-.6-.2-.9-.4-.2-.1-.4-.1-.5-.2-1.2-.4-2.5-.7-4-.7-2 0-4.6.1-6.8.8-3 .8-4 .8-5.3.1-.8-.4-1.8-1.1-2.6-1.7-.1-.1-.2-.1-.2-.2-.1-.1-.1-.1-.2-.1-.3-.2-.6-.4-.6-.5l-.1-.1c-.2.3-.6 1-.8 1.4v.1c-.1 1.7-1 4.2-2.6 5.6-.2.1-.4.3-.6.4-.2.1-.5.2-.7.3-.7.2-1.4.2-1.9-.2-.5-.3-1.3-.7-2.3-1.1 2 1.6 3 2.8 3.9 4.9.7 1.7 1.7 4 3.9 6.5l.3.3c1.1 0 2.1.2 3 .7.4.2.7.4 1 .7.2.2.4.3.5.5.5.4.9.8.8 1.3v.1s0 .1-.1.1c-.1.2-.3.5-.5.7-.1.1-.4.4-.6.7-.1.1-.2.2-.3.2-.1.1-.4.3-.7.6-.2.2-.4.3-.5.4-.2.1-.4.4-.6.5-.3.1-.5.2-.8.1-.3 0-.7-.2-1-.3-.5-.3.1-.3-.5-.8-1.4-1-2.2-1.7-1.9-3.4v-.2c-.2-.1-.3-.3-.5-.4-3.9-3-10.1-4.9-11.5-8.3-.9-2.3-1-3.4-.2-4.4.4-.5.8-1 1-1.4 1.3-2.3.9-4.4 2.4-5.4 1.8-1.2 3.3.2 4.1 1.4-.5-2.1-2.3-2.6-2.3-2.8.3.1.3-.1.3-.3zm29 20s-.1 0 0 0c-.1 0-.1 0 0 0-.9.1-3.3.3-5.4.3h-.9c-.7 0-1.3-.1-1.8-.2-.1 0-.2 0-.3-.1-.7-.2-1.6-.5-2.4-.8-.6-.2-1.2-.5-1.7-.7-1.1-.5-2.1-1.1-2.3-1.3-.5-1.4-.7-2.7-.7-3.4.8-.4 1.3-.7 1.9-1.4-1.7.3-2.4.2-3.4-.4-1-.5-2.6-2.2-3.6-3.4 1-1.2 1.7-2.9 1.4-5.1.1-.2.3-.4.4-.6 0 .1.1.1.2.2.7.9 2.4 2 4.6 2.8 1.1.4 2 .1 2.9-.1 4-1 8.1-1.3 11.9-.1.1 0 .2.1.3.1.5.2.9.4 1.4.6.1 0 .1.1.2.1.1.7.2 2-.3 3.5-.1.3-.2.6-.4.9-.2.3-.3.6-.5 1-.1.3-.2.5-.4.8-.2.4-.3.8-.5 1.3-.4 1.4-.7 3.4-.6 6zm-23.9-9c.4-.2 1-.4 1.5-.8 1.6 1.8 3.3 3 5 4.1.3 1.4.5 2.4.8 4.2h-.2c-.1.5-.1.9-.1 1.3-1-.4-2.2-.5-2.6-.5-3.7-4.3-3-6-4.4-8.3zm-32.9 6.5c-1.3.7-2.5 1.4-3.6 2.2-.2.1-.5.3-.7.4-.1.1-.3.2-.5.3-4.5 2.9-8.1 5.8-10.5 8.5 1.7-10.8 10-16.5 14.3-19.2.1-.1.2-.2.4-.2 10-6.2 19.2-9.2 28-11.7-.5.8-.9 1.7-1 2.8v.2c-.8.1-2.5.2-3.5 3-.1.2-.2.5-.3.8-.3 1.2-.6 2-.9 2.6-.9.4-5 2.2-9.9 4.5-1.6.8-3.3 1.6-5 2.4-2.3 1-4.6 2.2-6.8 3.4zm28 24.8s0-.1 0 0c-.4-.3-.8-.5-1.2-.7h-.1c-.4-.2-.7-.3-1.1-.5h-.1c-.4-.1-.8-.3-1.3-.4h-.2c-.4-.1-.8-.2-1.3-.2h-.1c-.5-.1-1-.1-1.5-.1H35.9c-3.7.1-6.5-.4-8.6-1.5-.7-.4-1.4-.8-1.9-1.3-.9-.7-1.5-1.6-2.1-2.6-.4-.7-.7-1.4-.9-2.2-.4-1.2-.6-2.5-.8-3.9 0-.5-.1-1-.2-1.5l-.3-1.5c-.6-2.9-1.6-5.5-3.2-7.2 6.3-3.5 15-7.9 17.8-8.8.3-.1.6-.2.8-.3-.3 1.1.4 2.7.9 3.9 2.1 4.9 8.6 5.4 12.9 9.1 0 .5 0 1.1.2 1.6.5.6 1.7 1.6 1.7 1.6-.2.2-.1.7-.1.7.9 1 2.3 1 2.3 1-1.8 5.2-3.4 10.9-1.9 16.9-.7 1-1.5 1.8-2.2 2.8-.7-.2-1.4-.6-1.9-1.3 0-.1-.1-.1-.1-.2s-.1-.1-.1-.2l-1.5-1.8-.1-.1c-.5-.4-1.2-.9-1.9-1.3zm7.9 33.6c-1.3.1-2.9 0-4.3-.3h-.2-.1c-1.5-.8-2.1-1.2-2-2.4 0-.2 0-.3.1-.5 0-.1.1-.2.1-.3.5-1.1 2.1-2.2 3.4-3.2-.8 0-1.8.7-1.7-.1.2-1.5.9-1.3 1.3-2.1-.2-.3 3.3-.2 3.8.3v.1c0 .7.7 1.7.5 2.2-.1.3-.4-.2-.8-.3.2 1.1.6 3.1 1.3 4.6.1.1.1.2.1.3 0 .1.1.2.1.3 0 .7-.4 1.2-1.6 1.4zM59 67.7c0 .9-.3 1.6-.6 2-.7 1.1-1.7 1.4-2 3.2.4-.6 1.1-1.1 1.1-.9 0 .8-.1 1.4-.1 2v.2c-.1.6-.2 1.1-.3 1.6-.2.9-.5 1.7-.7 2.4-.4 1.2-.9 2.1-1.3 3.1l-.6 1.5c-.6 1.7-.4 5.6-.6 5.7-1.6.3-4.1-.3-4.7-.6.3-2.2.4-4.5.5-6.9.1-2.1.3-4.3.9-6.6.1-.5.3-1 .4-1.5 0-.1 0-.2.1-.2 0-.1 0-.1.1-.2.5-1.6 1.4-2.7 2.6-4.2.4-.4.7-.9 1.2-1.4-.1-.4-.2-.8-.4-1.3-.7-2.6-1.3-7.3 1.5-16.1.1 0 .2-.1.3-.1.2-.1.7-.5.8-.6.1-.1.3-.2.4-.3.1 0 .1-.1.2-.1l.6-.6 1.1-1.1c.4-.4.7-.5.8-.9v-.2c0-.8-1.1-1.5-1.5-2.1l-.1-.1c.1-.2.1-.4.2-.6 0-.2.1-.5.1-.8 0-.2.1-.5.1-.7.1.1.6.4 1.8.7.6.2 1.3.4 2.3.7 1.1.3 2.4.5 3.6.6 2.9.2 5.6 0 6.7-.2h.3v.1c0 .1 0 .2-.1.3v.9c0 .2 0 .3.1.5v.1c0 .4.1.7.2 1.1 0 .3.1.5.1.7v.1c0 .3.1.5.1.7 0 .2.1.3.1.5.1.2.1.4.2.6v.2c.1.4.2.8.2 1.1 1 5.7 2.3 12.9-1.1 16.7.2.8.3 1.9 0 3.2-.1.7-.3 1.4-.6 2.2-.2.5-.3 1-.5 1.5h-.3c-4.5.6-7.1.2-8.3-.1.5-1.6 1.7-3.3 3.7-3.2-.1-3.7-1.1-5-2-7.6 1.3-3 1.3-5.7 2-9.2v-.2c.2-.8.3-1.6.6-2.5-.4.5-.8 1.5-1.2 2.6v.1c-.5 1.5-.9 3.4-1.2 4.8-.2.8-.4 1.6-.7 2.4-.2.5-.4.9-.6 1.4-1.5 1.9-3 3.9-5.5 5.6zm18.5 24.9c1.5 1.1 4.7 1.8 5.5 2.3l.3.3c.1.1.1.2.1.3-.1.4-.7.7-1.9.9-.5.1-.9.1-1.4.1-1.3 0-2.6-.2-5.1-.5-3.4-.5-5.2-.4-8.6-.4-.3 0-.6 0-.9-.1-.2 0-.4-.1-.5-.1-.6-.2-1-.5-1.2-.8-.1-.2-.1-.3-.1-.5-.1-.7.2-1.5.6-2.3.2-.4.3-.7.4-1 .5-1.3.4-2.1.2-4.9 0-.2-.1-.4-.1-.7-.2-1.3-.5-2.3-.8-3.1-.4-1.1-.9-1.9-1.2-3-.6-2.1-1-4.3-.6-4.8H62.5c.2.1.5.2.9.3.5.1 1.1.2 2 .3 2.2.2 5.1-.2 6.6-.4.3-.1.6-.1.8-.1h.4c.4 0 .1.6-.1 1.2-.1.7-.5 3.3-.8 5.1-.3 1.8-.2 7.1-.1 8.8v.1c0 .3 1.9 1.2 3.5 2.1.7.2 1.4.5 1.8.9zm4.8-48.2c0 .1 0 .1 0 0-.1.1-.2.2-.2.3 0-.1-.1-.1-.1-.2 0 .1 0 .2-.1.2-.2.9-.6 2.4-2.2 4.1-.4.4-.7.6-1 .7-.5.1-.9 0-1.5-.1-.9-.2-1.3-.6-2.2-1.1-.1-.6-.3-1.3-.4-1.8 0-.3-.1-.5-.1-.6v-1l.4-.4s.7-1 1.8-1 2.2-.2 2.5-.5v-.1-.3c0-.1 0-.2-.1-.3-.4-1.4-2.1-1.8-1.4-4.8 0-.2.3-.5 1.2-.5-1.4-.3-2-.4-3-1.3.5-1.1 1-1.9 1.3-2.6.8-1.5.3-3.5.3-3.5.8-.3 1.6-.7 1.7-1 .9-2.8-.7-5.5-2.5-7.2 1.2-.1 2.6.1 3.6 1.1 2.4 2.4 1.8 5 1 6.8.6.7 2.1 2.9 1.2 5.3-.2.6-1.4.6-2.3 2.1 2.3-1.3 3.7-1 4.2.7 1 2.4-.6 5.3-2.1 7z"/><path d="M22 53.4v-.2c0-.2-.1-.5-.2-.9s-.1-.8-.2-1.3c-.5-4.7-1.9-9.4-4.9-11.3 3.7-2 16.8-8.5 21.9-10.5 2.9-1.2.8-.4-.2 1.4-.8 1.4-.3 2.9-.5 3.2-.6.8-12.6 10.5-15.9 19.6zm32.2-2.3c-3.4 3.8-12 11-18.2 11.4 8.7-.2 12.2 4.1 14.7 9.7 2.6-5.2 2.7-10.3 2.6-16.1 0-2.6 1.8-6 .9-5zm5.3-23L54.3 24s-1.1 3.1-1 4.6c.1 1.6-1.8 2.7-.9 3.6.9.9 3.2 2.5 4 3.4.7.9 1.1 7.1 1.1 7.1l2.2 2.7s1-1.8 1.1-6.3c.2-5.4-2.9-7.1-3.3-8.6-.4-1.4.6-2.9 2-2.4zm3.1 45.6l3.9.3s1.2-2.2 2.1-3.5c.9-1.4.4-1.6 0-4.6-.4-3-1.4-9.3-1.2-13.6l-3.1 10.2s1.8 5.6 1.6 6.4c-.1.8-3.3 4.8-3.3 4.8zm5 18.8c-1.1 0-2.5-.4-3.5-.8l-1 .3.2 4s5.2.7 4.6-.4c-.6-1.2-.3-3.1-.3-3.1zm12 .6c-1 0-.3.2.4 1.2.8 1 .1 2-.8 2.3l3.2.5 1.9-1.7c.1 0-3.7-2.3-4.7-2.3zM73 76c-1.6.5-4.2.8-5.9.8-1.7.1-3.7-.1-5-.5v1.4s1.2.5 5.4.5c3.5.1 5.7-.8 5.7-.8l.9-.8c-.1.1.5-1.1-1.1-.6zm-.2 3.1c-1.6.6-3.9.6-5.6.7-1.7.1-3.7-.1-5-.5l.1 1.4s.7.3 4.9.4c3.5.1 5.7-.7 5.7-.7l.3-.5c-.1-.1.3-1-.4-.8zm5.9-42.7c-.9-.8-1.4-2.4-1.5-3.3l-1.9 2.5.7 1.2s2.5.1 2.8.1c.4 0 .3-.1-.1-.5zM69 14.7c.6-.7.2-2.7.2-2.7L66 14.6l-4.4-.8-.5-1.3-1.3-.1c.8 1.8 1.8 2.5 3.3 3.1.9.4 4.5.9 5.9-.8z" style=opacity:.4;fill-rule:evenodd;clip-rule:evenodd /></svg></a></div></div>'),
            e &&
              ((n.style.position = "absolute"),
              (n.style.top = t ? "calc(100% - 42px)" : "calc(100% - 51px)")),
            o &&
              (ub(o)
                ? (n.style.cssText = o)
                : (function _isObject(e) {
                    return "object" == typeof e;
                  })(o) && ((o.data = "root"), V.set(n, o).kill()),
              n.style.top && (n.style.bottom = "auto"),
              n.style.width &&
                V.set(n, {
                  xPercent: -50,
                  left: "50%",
                  right: "auto",
                  data: "root",
                }).kill()),
            !t &&
              n.offsetWidth < 600 &&
              (n.setAttribute("class", "gs-dev-tools minimal"),
              e && (n.style.top = "calc(100% - 42px)")),
            n
          );
        })(a.container, a.minimal, a.css),
        x = Yn(".playhead"),
        y = Yn(".timeline-track"),
        b = Yn(".progress-bar"),
        w = Yn(".time"),
        _ = Yn(".duration"),
        T = 0,
        M = Yn(".in-point"),
        k = Yn(".out-point"),
        D = 0,
        S = 100,
        E = Yn(".animation-list"),
        P = Yn(".animation-label"),
        t = Yn(".play-pause"),
        o = (function _buildPlayPauseMorph(e) {
          var t = V.timeline(
            {
              data: "root",
              parent: ne,
              onComplete: function onComplete() {
                return t.kill();
              },
            },
            ne._time
          );
          return (
            t
              .to(e.querySelector(".play-1"), {
                duration: 0.4,
                attr: {
                  d: "M5.75,3.13 C5.75,9.79 5.75,16.46 5.75,23.13 4.08,23.13 2.41,23.13 0.75,23.13 0.75,16.46 0.75,9.79 0.75,3.12 2.41,3.12 4.08,3.12 5.75,3.12",
                },
                ease: "power2.inOut",
                rotation: 360,
                transformOrigin: "50% 50%",
              })
              .to(
                e.querySelector(".play-2"),
                {
                  duration: 0.4,
                  attr: {
                    d: "M16.38,3.13 C16.38,9.79 16.38,16.46 16.38,23.13 14.71,23.13 13.04,23.13 11.38,23.13 11.38,16.46 11.38,9.79 11.38,3.12 13.04,3.12 14.71,3.12 16.38,3.12",
                  },
                  ease: "power2.inOut",
                  rotation: 360,
                  transformOrigin: "50% 50%",
                },
                0.05
              ),
            t
          );
        })(t),
        C = !1,
        L = Yn(".loop"),
        Y = (function _buildLoopAnimation(e) {
          var t = V.timeline(
            {
              data: "root",
              id: "loop",
              parent: ne,
              paused: !0,
              onComplete: function onComplete() {
                return t.kill();
              },
            },
            ne._time
          );
          return (
            t
              .to(e, {
                duration: 0.5,
                rotation: 360,
                ease: "power3.inOut",
                transformOrigin: "50% 50%",
              })
              .to(
                e.querySelectorAll(".loop-path"),
                { duration: 0.5, fill: "#91e600", ease: "none" },
                0
              ),
            t
          );
        })(L),
        N = Yn(".time-scale select"),
        z = Yn(".time-scale-label"),
        R = Q.create(x, {
          type: "x",
          cursor: "ew-resize",
          allowNativeTouchScrolling: !1,
          allowEventDefault: !0,
          onPress: Go(x, 0.5, !0),
          onDrag: function onDrag() {
            var e = g + u * this.x;
            e < 0 ? (e = 0) : e > v._dur && (e = v._dur),
              f || v.time(e),
              (b.style.width =
                Math.min(S - D, Math.max(0, (e / v._dur) * 100 - D)) + "%"),
              (w.innerHTML = e.toFixed(2));
          },
          onRelease: function onRelease() {
            C || v.resume();
          },
        })[0],
        A = Q.create(M, {
          type: "x",
          cursor: "ew-resize",
          zIndexBoost: !1,
          allowNativeTouchScrolling: !1,
          allowEventDefault: !0,
          onPress: Go(M, 1, !0),
          onDoubleClick: Io,
          onDrag: function onDrag() {
            (D = ((g + u * this.x) / v.duration()) * 100),
              v.progress(D / 100),
              B(!0);
          },
          onRelease: function onRelease() {
            D < 0 && (D = 0),
              Fb(),
              (M.style.left = D + "%"),
              Zn("in", D),
              V.set(M, { x: 0, data: "root", display: "block" }),
              C || v.resume();
          },
        })[0],
        X = Q.create(k, {
          type: "x",
          cursor: "ew-resize",
          allowNativeTouchScrolling: !1,
          allowEventDefault: !0,
          zIndexBoost: !1,
          onPress: Go(k, 0, !0),
          onDoubleClick: Io,
          onDrag: function onDrag() {
            (S = ((g + u * this.x) / v.duration()) * 100),
              v.progress(S / 100),
              B(!0);
          },
          onRelease: function onRelease() {
            100 < S && (S = 100),
              Fb(),
              (k.style.left = S + "%"),
              Zn("out", S),
              V.set(k, { x: 0, data: "root", display: "block" }),
              m || (H(), v.resume());
          },
        })[0],
        B = function updateProgress(e) {
          if (!R.isPressed || !0 === e) {
            var t,
              o =
                d || -1 !== i._repeat
                  ? 100 * v.progress() || 0
                  : (i.totalTime() / i.duration()) * 100,
              n =
                i._repeat &&
                i._rDelay &&
                i.totalTime() % (i.duration() + i._rDelay) > i.duration();
            100 < o && (o = 100),
              S <= o
                ? !d || v.paused() || R.isDragging
                  ? ((o === S && -1 !== i._repeat) ||
                      ((o = S), v.progress(o / 100)),
                    !C &&
                      (S < 100 ||
                        1 === i.totalProgress() ||
                        -1 === i._repeat) &&
                      O())
                  : n ||
                    ((o = D),
                    (t = v._targets && v._targets[0]) === i &&
                      t.seek(s + ((l - s) * D) / 100),
                    0 < i._repeat && !D && 100 === S
                      ? 1 === i.totalProgress() &&
                        v.totalProgress(0, !0).resume()
                      : v.progress(o / 100, !0).resume())
                : o < D && ((o = D), v.progress(o / 100, !0)),
              (o === T && !0 !== e) ||
                ((b.style.left = D + "%"),
                (b.style.width = Math.max(0, o - D) + "%"),
                (x.style.left = o + "%"),
                (w.innerHTML = v._time.toFixed(2)),
                (_.innerHTML = v._dur.toFixed(2)),
                h &&
                  ((x.style.transform = "translate(-50%,0)"),
                  (x._gsap.x = "0px"),
                  (x._gsap.xPercent = -50),
                  (h = !1)),
                (T = o)),
              v.paused() !== C && I();
          }
        },
        H = function play() {
          if (v.progress() >= S / 100) {
            Wb(v, a);
            var e = v._targets && v._targets[0];
            e === i && e.seek(s + ((l - s) * D) / 100),
              v._repeat && !D
                ? v.totalProgress(0, !0)
                : v.reversed() || v.progress(D / 100, !0);
          }
          o.play(), v.resume(), C && p.update(), (C = !1);
        },
        O = function pause() {
          o.reverse(), v && v.pause(), (C = !0);
        },
        I = function togglePlayPause() {
          (C ? H : O)();
        },
        F = V.to(
          [Yn(".gs-bottom"), Yn(".gs-top")],
          {
            duration: 0.3,
            autoAlpha: 0,
            y: 50,
            ease: "power2.in",
            data: "root",
            paused: !0,
            parent: ne,
          },
          ne._time
        ),
        G = !1,
        W = ie(1.3, _o).pause();
      Nb(E, "change", Wo),
        Nb(E, "mousedown", To),
        Nb(t, "mousedown", I),
        Nb(Yn(".seek-bar"), "mousedown", Mo),
        Nb(Yn(".rewind"), "mousedown", Qo),
        Nb(L, "mousedown", So),
        Nb(N, "change", Xo),
        "auto" === a.visibility
          ? (Nb(n, "mouseout", $o), Nb(n, "mouseover", ap))
          : "hidden" === a.visibility && ((G = !0), F.progress(1)),
        !1 !== a.keyboard &&
          (oe && a.keyboard
            ? console.warn(
                "[GSDevTools warning] only one instance can be affected by keyboard shortcuts. There is already one active."
              )
            : ((oe = p),
              Nb(
                q,
                "keydown",
                (e = function keyboardHandler(e) {
                  var t,
                    o = e.keyCode ? e.keyCode : e.which;
                  32 === o
                    ? I()
                    : 38 === o
                    ? ((t = parseFloat(Qb(N, -1, z))),
                      v.timeScale(t),
                      Zn("timeScale", t))
                    : 40 === o
                    ? ((t = parseFloat(Qb(N, 1, z))),
                      v.timeScale(t),
                      Zn("timeScale", t))
                    : 37 === o
                    ? Qo()
                    : 39 === o
                    ? v.progress(S / 100)
                    : 76 === o
                    ? So()
                    : 72 === o
                    ? (function toggleHide() {
                        (G ? ap : _o)();
                      })()
                    : 73 === o
                    ? ((D = 100 * v.progress()),
                      Zn("in", D),
                      (M.style.left = D + "%"),
                      B(!0))
                    : 79 === o &&
                      ((S = 100 * v.progress()),
                      Zn("out", S),
                      (k.style.left = S + "%"),
                      B(!0));
                })
              ))),
        V.set(x, { xPercent: -50, x: 0, data: "root" }),
        V.set(M, { xPercent: -100, x: 0, data: "root" }),
        (M._gsIgnore =
          k._gsIgnore =
          x._gsIgnore =
          t._gsIgnore =
          L._gsIgnore =
            !0),
        V.killTweensOf([M, k, x]),
        dp(se),
        se && ie(1e-4, dp, [!1], this),
        V.ticker.add(B),
        (this.update = function (e) {
          te === p &&
            ((ee.paused() && !e) || Rb(),
            (function updateRootDuration() {
              var e, t, o;
              i === j &&
                ((e = j._time),
                j.progress(1, !0).time(e, !0),
                (e = (ee._dp._time - ee._start) * ee._ts),
                1e3 === (o = Math.min(1e3, j.duration())) &&
                  (o = Math.min(1e3, Hb(j))),
                1 != (t = ee.duration() / o) &&
                  o &&
                  ((D *= t),
                  S < 100 && (S *= t),
                  ee.seek(0),
                  (ee.vars.time = o),
                  ee.invalidate(),
                  ee.duration(o),
                  ee.time(e),
                  (_.innerHTML = o.toFixed(2)),
                  (M.style.left = D + "%"),
                  (k.style.left = S + "%"),
                  B(!0)));
            })());
        }),
        (this.kill = this.revert =
          function () {
            Ob(E, "change", Wo),
              Ob(E, "mousedown", To),
              Ob(t, "mousedown", I),
              Ob(Yn(".seek-bar"), "mousedown", Mo),
              Ob(Yn(".rewind"), "mousedown", Qo),
              Ob(L, "mousedown", So),
              Ob(N, "change", Xo),
              R.disable(),
              A.disable(),
              X.disable(),
              V.ticker.remove(B),
              Ob(n, "mouseout", $o),
              Ob(n, "mouseover", ap),
              n.parentNode.removeChild(n),
              te === p && (te = null),
              oe === p && ((oe = null), Ob(q, "keydown", e)),
              delete de[a.id + ""];
          }),
        (this.minimal = function (e) {
          var t,
            o = n.classList.contains("minimal");
          if (!arguments.length || o === e) return o;
          e ? n.classList.add("minimal") : n.classList.remove("minimal"),
            a.container &&
              (n.style.top = e ? "calc(100% - 42px)" : "calc(100% - 51px)"),
            R.isPressed &&
              ((f = !0),
              R.endDrag(R.pointerEvent),
              (f = !1),
              (t = 100 * v.progress()),
              (b.style.width = Math.max(0, t - D) + "%"),
              (x.style.left = t + "%"),
              (x.style.transform = "translate(-50%,0)"),
              (x._gsap.x = "0px"),
              (x._gsap.xPercent = -50),
              R.startDrag(R.pointerEvent, !0));
        }),
        (this.animation = Uo),
        (this.updateList = To),
        ae(this);
    };
  (ue.version = "3.12.7"),
    (ue.globalRecordingTime = 2),
    (ue.getById = function (e) {
      return e ? de[e] : te;
    }),
    (ue.getByAnimation = function (e) {
      for (var t in (ub(e) && (e = V.getById(e)), de))
        if (de[t].animation() === e) return de[t];
    }),
    (ue.create = function (e) {
      return new ue(e);
    }),
    (ue.register = Vb),
    tb() && V.registerPlugin(ue),
    (e.GSDevTools = ue),
    (e.default = ue);
  if (typeof window === "undefined" || window !== e) {
    Object.defineProperty(e, "__esModule", { value: !0 });
  } else {
    delete e.default;
  }
});
/*!
 * SplitText 3.12.7
 * https://gsap.com
 *
 * @license Copyright 2025, GreenSock. All rights reserved.
 * This plugin is a membership benefit of Club GSAP and is only authorized for use in sites/apps/products developed by individuals/companies with an active Club GSAP membership. See https://gsap.com/pricing
 * @author: Jack Doyle, jack@greensock.com
 */

!(function (D, u) {
  "object" == typeof exports && "undefined" != typeof module
    ? u(exports)
    : "function" == typeof define && define.amd
    ? define(["exports"], u)
    : u(((D = D || self).window = D.window || {}));
})(this, function (D) {
  "use strict";
  var b =
    /([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2642\u2640]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDD27\uDCBC\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCC\uDFCB]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;
  function n(D) {
    (X = document),
      (e = window),
      (C =
        C ||
        D ||
        e.gsap ||
        console.warn("Please gsap.registerPlugin(SplitText)")) &&
        ((E = C.utils.toArray),
        (i = C.core.context || function () {}),
        (F = 1));
  }
  function o(D) {
    return e.getComputedStyle(D);
  }
  function p(D) {
    return "absolute" === D.position || !0 === D.absolute;
  }
  function q(D, u) {
    for (var e, t = u.length; -1 < --t; )
      if (((e = u[t]), D.substr(0, e.length) === e)) return e.length;
  }
  function s(D, u) {
    void 0 === D && (D = "");
    var e = ~D.indexOf("++"),
      t = 1;
    return (
      e && (D = D.split("++").join("")),
      function () {
        return (
          "<" +
          u +
          " style='position:relative;display:inline-block;'" +
          (D ? " class='" + D + (e ? t++ : "") + "'>" : ">")
        );
      }
    );
  }
  function t(D, u, e) {
    var F = D.nodeType;
    if (1 === F || 9 === F || 11 === F)
      for (D = D.firstChild; D; D = D.nextSibling) t(D, u, e);
    else (3 !== F && 4 !== F) || (D.nodeValue = D.nodeValue.split(u).join(e));
  }
  function u(D, u) {
    for (var e = u.length; -1 < --e; ) D.push(u[e]);
  }
  function v(D, u, e) {
    for (var t; D && D !== u; ) {
      if ((t = D._next || D.nextSibling)) return t.textContent.charAt(0) === e;
      D = D.parentNode || D._parent;
    }
  }
  function w(D) {
    var u,
      e,
      t = E(D.childNodes),
      F = t.length;
    for (u = 0; u < F; u++)
      (e = t[u])._isSplit
        ? w(e)
        : u && e.previousSibling && 3 === e.previousSibling.nodeType
        ? ((e.previousSibling.nodeValue +=
            3 === e.nodeType ? e.nodeValue : e.firstChild.nodeValue),
          D.removeChild(e))
        : 3 !== e.nodeType &&
          (D.insertBefore(e.firstChild, e), D.removeChild(e));
  }
  function x(D, u) {
    return parseFloat(u[D]) || 0;
  }
  function y(D, e, F, C, i, n, s) {
    var E,
      r,
      l,
      d,
      a,
      h,
      B,
      f,
      A,
      c,
      g,
      y,
      b = o(D),
      _ = x("paddingLeft", b),
      S = -999,
      T = x("borderBottomWidth", b) + x("borderTopWidth", b),
      m = x("borderLeftWidth", b) + x("borderRightWidth", b),
      N = x("paddingTop", b) + x("paddingBottom", b),
      L = x("paddingLeft", b) + x("paddingRight", b),
      W = x("fontSize", b) * (e.lineThreshold || 0.2),
      H = b.textAlign,
      O = [],
      V = [],
      M = [],
      R = e.wordDelimiter || " ",
      j = e.tag ? e.tag : e.span ? "span" : "div",
      k = e.type || e.split || "chars,words,lines",
      P = i && ~k.indexOf("lines") ? [] : null,
      z = ~k.indexOf("words"),
      q = ~k.indexOf("chars"),
      G = p(e),
      I = e.linesClass,
      J = ~(I || "").indexOf("++"),
      K = [],
      Q = "flex" === b.display,
      U = D.style.display;
    for (
      J && (I = I.split("++").join("")),
        Q && (D.style.display = "block"),
        l = (r = D.getElementsByTagName("*")).length,
        a = [],
        E = 0;
      E < l;
      E++
    )
      a[E] = r[E];
    if (P || G)
      for (E = 0; E < l; E++)
        ((h = (d = a[E]).parentNode === D) || G || (q && !z)) &&
          ((y = d.offsetTop),
          P &&
            h &&
            Math.abs(y - S) > W &&
            ("BR" !== d.nodeName || 0 === E) &&
            ((B = []), P.push(B), (S = y)),
          G &&
            ((d._x = d.offsetLeft),
            (d._y = y),
            (d._w = d.offsetWidth),
            (d._h = d.offsetHeight)),
          P &&
            (((d._isSplit && h) ||
              (!q && h) ||
              (z && h) ||
              (!z &&
                d.parentNode.parentNode === D &&
                !d.parentNode._isSplit)) &&
              (B.push(d), (d._x -= _), v(d, D, R) && (d._wordEnd = !0)),
            "BR" === d.nodeName &&
              ((d.nextSibling && "BR" === d.nextSibling.nodeName) || 0 === E) &&
              P.push([])));
    for (E = 0; E < l; E++)
      if (((h = (d = a[E]).parentNode === D), "BR" !== d.nodeName))
        if (
          (G &&
            ((A = d.style),
            z || h || ((d._x += d.parentNode._x), (d._y += d.parentNode._y)),
            (A.left = d._x + "px"),
            (A.top = d._y + "px"),
            (A.position = "absolute"),
            (A.display = "block"),
            (A.width = d._w + 1 + "px"),
            (A.height = d._h + "px")),
          !z && q)
        )
          if (d._isSplit)
            for (
              d._next = r = d.nextSibling, d.parentNode.appendChild(d);
              r && 3 === r.nodeType && " " === r.textContent;

            )
              (d._next = r.nextSibling),
                d.parentNode.appendChild(r),
                (r = r.nextSibling);
          else
            d.parentNode._isSplit
              ? ((d._parent = d.parentNode),
                !d.previousSibling &&
                  d.firstChild &&
                  (d.firstChild._isFirst = !0),
                d.nextSibling &&
                  " " === d.nextSibling.textContent &&
                  !d.nextSibling.nextSibling &&
                  K.push(d.nextSibling),
                (d._next =
                  d.nextSibling && d.nextSibling._isFirst
                    ? null
                    : d.nextSibling),
                d.parentNode.removeChild(d),
                a.splice(E--, 1),
                l--)
              : h ||
                ((y = !d.nextSibling && v(d.parentNode, D, R)),
                d.parentNode._parent && d.parentNode._parent.appendChild(d),
                y && d.parentNode.appendChild(X.createTextNode(" ")),
                "span" === j && (d.style.display = "inline"),
                O.push(d));
        else
          d.parentNode._isSplit && !d._isSplit && "" !== d.innerHTML
            ? V.push(d)
            : q &&
              !d._isSplit &&
              ("span" === j && (d.style.display = "inline"), O.push(d));
      else
        P || G
          ? (d.parentNode && d.parentNode.removeChild(d), a.splice(E--, 1), l--)
          : z || D.appendChild(d);
    for (E = K.length; -1 < --E; ) K[E].parentNode.removeChild(K[E]);
    if (P) {
      for (
        G &&
          ((c = X.createElement(j)),
          D.appendChild(c),
          (g = c.offsetWidth + "px"),
          (y = c.offsetParent === D ? 0 : D.offsetLeft),
          D.removeChild(c)),
          A = D.style.cssText,
          D.style.cssText = "display:none;";
        D.firstChild;

      )
        D.removeChild(D.firstChild);
      for (f = " " === R && (!G || (!z && !q)), E = 0; E < P.length; E++) {
        for (
          B = P[E],
            (c = X.createElement(j)).style.cssText =
              "display:block;text-align:" +
              H +
              ";position:" +
              (G ? "absolute;" : "relative;"),
            I && (c.className = I + (J ? E + 1 : "")),
            M.push(c),
            l = B.length,
            r = 0;
          r < l;
          r++
        )
          "BR" !== B[r].nodeName &&
            ((d = B[r]),
            c.appendChild(d),
            f && d._wordEnd && c.appendChild(X.createTextNode(" ")),
            G &&
              (0 === r &&
                ((c.style.top = d._y + "px"), (c.style.left = _ + y + "px")),
              (d.style.top = "0px"),
              y && (d.style.left = d._x - y + "px")));
        0 === l
          ? (c.innerHTML = "&nbsp;")
          : z || q || (w(c), t(c, String.fromCharCode(160), " ")),
          G && ((c.style.width = g), (c.style.height = d._h + "px")),
          D.appendChild(c);
      }
      D.style.cssText = A;
    }
    G &&
      (s > D.clientHeight &&
        ((D.style.height = s - N + "px"),
        D.clientHeight < s && (D.style.height = s + T + "px")),
      n > D.clientWidth &&
        ((D.style.width = n - L + "px"),
        D.clientWidth < n && (D.style.width = n + m + "px"))),
      Q && (U ? (D.style.display = U) : D.style.removeProperty("display")),
      u(F, O),
      z && u(C, V),
      u(i, M);
  }
  function z(D, u, e, F) {
    function eb(D) {
      return D === B || (D === T && " " === B);
    }
    var C,
      i,
      n,
      s,
      E,
      r,
      l,
      o,
      d = u.tag ? u.tag : u.span ? "span" : "div",
      a = ~(u.type || u.split || "chars,words,lines").indexOf("chars"),
      h = p(u),
      B = u.wordDelimiter || " ",
      f = " " !== B ? "" : h ? "&#173; " : " ",
      A = "</" + d + ">",
      c = 1,
      x = u.specialChars
        ? "function" == typeof u.specialChars
          ? u.specialChars
          : q
        : null,
      g = X.createElement("div"),
      y = D.parentNode;
    for (
      y.insertBefore(g, D),
        g.textContent = D.nodeValue,
        y.removeChild(D),
        l =
          -1 !==
          (C = (function getText(D) {
            var u = D.nodeType,
              e = "";
            if (1 === u || 9 === u || 11 === u) {
              if ("string" == typeof D.textContent) return D.textContent;
              for (D = D.firstChild; D; D = D.nextSibling) e += getText(D);
            } else if (3 === u || 4 === u) return D.nodeValue;
            return e;
          })((D = g))).indexOf("<"),
        !1 !== u.reduceWhiteSpace && (C = C.replace(S, " ").replace(_, "")),
        l && (C = C.split("<").join("{{LT}}")),
        E = C.length,
        i = (" " === C.charAt(0) ? f : "") + e(),
        n = 0;
      n < E;
      n++
    )
      if (((r = C.charAt(n)), x && (o = x(C.substr(n), u.specialChars))))
        (r = C.substr(n, o || 1)),
          (i += a && " " !== r ? F() + r + "</" + d + ">" : r),
          (n += o - 1);
      else if (eb(r) && !eb(C.charAt(n - 1)) && n) {
        for (i += c ? A : "", c = 0; eb(C.charAt(n + 1)); ) (i += f), n++;
        n === E - 1
          ? (i += f)
          : ")" !== C.charAt(n + 1) && ((i += f + e()), (c = 1));
      } else
        "{" === r && "{{LT}}" === C.substr(n, 6)
          ? ((i += a ? F() + "{{LT}}</" + d + ">" : "{{LT}}"), (n += 5))
          : (55296 <= r.charCodeAt(0) && r.charCodeAt(0) <= 56319) ||
            (65024 <= C.charCodeAt(n + 1) && C.charCodeAt(n + 1) <= 65039)
          ? ((s = ((C.substr(n, 12).split(b) || [])[1] || "").length || 2),
            (i +=
              a && " " !== r
                ? F() + C.substr(n, s) + "</" + d + ">"
                : C.substr(n, s)),
            (n += s - 1))
          : (i += a && " " !== r ? F() + r + "</" + d + ">" : r);
    (D.outerHTML = i + (c ? A : "")), l && t(y, "{{LT}}", "<");
  }
  function A(D, u, e, t) {
    var F,
      C,
      i = E(D.childNodes),
      n = i.length,
      s = p(u);
    if (3 !== D.nodeType || 1 < n) {
      for (u.absolute = !1, F = 0; F < n; F++)
        ((C = i[F])._next = C._isFirst = C._parent = C._wordEnd = null),
          (3 === C.nodeType && !/\S+/.test(C.nodeValue)) ||
            (s &&
              3 !== C.nodeType &&
              "inline" === o(C).display &&
              ((C.style.display = "inline-block"),
              (C.style.position = "relative")),
            (C._isSplit = !0),
            A(C, u, e, t));
      return (u.absolute = s), void (D._isSplit = !0);
    }
    z(D, u, e, t);
  }
  var X,
    e,
    F,
    C,
    i,
    E,
    r,
    _ = /(?:\r|\n|\t\t)/g,
    S = /(?:\s\s+)/g,
    T = String.fromCharCode(160),
    l =
      (((r = SplitText.prototype).split = function split(D) {
        this.isSplit && this.revert(),
          (this.vars = D = D || this.vars),
          (this._originals.length =
            this.chars.length =
            this.words.length =
            this.lines.length =
              0);
        for (
          var u,
            e,
            t,
            F = this.elements.length,
            C = D.tag ? D.tag : D.span ? "span" : "div",
            i = s(D.wordsClass, C),
            n = s(D.charsClass, C);
          -1 < --F;

        )
          (t = this.elements[F]),
            (this._originals[F] = {
              html: t.innerHTML,
              style: t.getAttribute("style"),
            }),
            (u = t.clientHeight),
            (e = t.clientWidth),
            A(t, D, i, n),
            y(t, D, this.chars, this.words, this.lines, e, u);
        return (
          this.chars.reverse(),
          this.words.reverse(),
          this.lines.reverse(),
          (this.isSplit = !0),
          this
        );
      }),
      (r.revert = function revert() {
        var e = this._originals;
        if (!e) throw "revert() call wasn't scoped properly.";
        return (
          this.elements.forEach(function (D, u) {
            (D.innerHTML = e[u].html),
              D.setAttribute("style", e[u].style || "");
          }),
          (this.chars = []),
          (this.words = []),
          (this.lines = []),
          (this.isSplit = !1),
          this
        );
      }),
      (SplitText.create = function create(D, u) {
        return new SplitText(D, u);
      }),
      SplitText);
  function SplitText(D, u) {
    F || n(),
      (this.elements = E(D)),
      (this.chars = []),
      (this.words = []),
      (this.lines = []),
      (this._originals = []),
      (this.vars = u || {}),
      i(this),
      this.split(u);
  }
  (l.version = "3.12.7"), (l.register = n), (D.SplitText = l), (D.default = l);
  if (typeof window === "undefined" || window !== D) {
    Object.defineProperty(D, "__esModule", { value: !0 });
  } else {
    delete D.default;
  }
});
