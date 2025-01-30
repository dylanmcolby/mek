window.mekApp = (function() {
    const navId = '#nav';
    const navMenuId = '#nav-menu';
    const navContentSelector = '.nav_menu-content';
    const animationClass = 'animate-content';
    let dataNavHideElements = [];

    // Variables to track scroll position for detecting scroll direction
    let lastScrollY = window.scrollY;
    let ticking = false; // To optimize scroll event handling

    function init() {
      setupNavListeners();
      setupScrollBehavior();
    }

    function setupNavListeners() {
      const openNavElements = document.querySelectorAll('[data-nav="open"]');
      openNavElements.forEach(element => {
        element.addEventListener('click', openNav);
        element.setAttribute('aria-controls', 'nav-menu');
        element.setAttribute('aria-expanded', 'false');
        element.setAttribute('aria-label', 'Open Navigation Menu');
      });

      const closeNavElements = document.querySelectorAll('[data-nav="close"]');
      closeNavElements.forEach(element => {
        element.addEventListener('click', closeNav);
        element.setAttribute('aria-controls', 'nav-menu');
        element.setAttribute('aria-expanded', 'true');
        element.setAttribute('aria-label', 'Close Navigation Menu');
      });
    }

    function openNav(e) {
      e.preventDefault();
      const navMenu = document.querySelector(navMenuId);
      const nav = document.querySelector(navId);
      const navContent = navMenu.querySelector(navContentSelector);
      if (nav && navMenu && navContent) {
        // Add the 'is-opening' class
        navMenu.classList.add('is-opening');

        // Add the 'is-open' class to display the nav
        nav.classList.add('is-open');
        navMenu.classList.add('is-open');
        navMenu.setAttribute('aria-hidden', 'false');

        // Remove the 'is-opening' class after 550ms
        setTimeout(() => {
          navMenu.classList.remove('is-opening');
        }, 550);

        // Add animation class to nav content
        setTimeout(() => navContent.classList.add(animationClass), 0);

        // Update ARIA attributes
        document.querySelectorAll('[data-nav="open"]').forEach(btn => btn.setAttribute('aria-expanded', 'true'));
        document.querySelectorAll('[data-nav="close"]').forEach(btn => btn.setAttribute('aria-expanded', 'false'));

        // Listen for Escape key to close nav
        document.addEventListener('keydown', handleEscape);
      }
    }

    function closeNav(e) {
      e.preventDefault();
      const nav = document.querySelector(navId);
      const navMenu = document.querySelector(navMenuId);
      const navContent = navMenu.querySelector(navContentSelector);
      if (nav && navMenu && navContent) {
        // Add the 'is-closing' class
        navMenu.classList.add('is-closing');

        // Remove the 'is-open' class to hide the nav
        navMenu.classList.remove('is-open');
        nav.classList.remove('is-open');
        navMenu.setAttribute('aria-hidden', 'true');

        // Remove animation class from nav content
        navContent.classList.remove(animationClass);

        // Remove the 'is-closing' class after 550ms
        setTimeout(() => {
          navMenu.classList.remove('is-closing');
        }, 550);

        // Update ARIA attributes
        document.querySelectorAll('[data-nav="open"]').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
        document.querySelectorAll('[data-nav="close"]').forEach(btn => btn.setAttribute('aria-expanded', 'true'));

        // Return focus to the open button
        const openButton = document.querySelector('[data-nav="open"]');
        if (openButton) openButton.focus();

        // Remove the Escape key listener
        document.removeEventListener('keydown', handleEscape);
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape' || e.key === 'Esc') closeNav(e);
    }

    function setupScrollBehavior() {
      dataNavHideElements = Array.from(document.querySelectorAll('[data-nav-hide]'));
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    function handleScroll() {
      const currentScrollY = window.scrollY;

      // Handle page-scrolled class
      if (currentScrollY > 1) {
        document.body.classList.add('page-scrolled');
      } else {
        document.body.classList.remove('page-scrolled');
      }

      // Handle nav-hide class based on data-nav-hide elements
      if (!dataNavHideElements.length) {
        if (currentScrollY > 1) {
          document.body.classList.add('nav-hide');
        } else {
          document.body.classList.remove('nav-hide');
        }
      } else {
        let lastState = null;
        dataNavHideElements.forEach(el => {
          if (el.offsetTop <= currentScrollY) {
            lastState = el.getAttribute('data-nav-hide');
          }
        });

        if (lastState === 'true') {
          document.body.classList.add('nav-hide');
        } else {
          document.body.classList.remove('nav-hide');
        }
      }

      // --- New Scroll Direction Detection ---
      if (currentScrollY > lastScrollY) {
        // Scrolling Down
        document.body.classList.remove('scrolled-up');
      } else if (currentScrollY < lastScrollY) {
        // Scrolling Up
        document.body.classList.add('scrolled-up');
      }
      // Update lastScrollY
      lastScrollY = currentScrollY;
      // --- End of Scroll Direction Detection ---
    }

    return { init };
  })();

  document.addEventListener("DOMContentLoaded", function() {
    mekApp.init();
  });