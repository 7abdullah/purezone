// ===== PURE ZONE — MAIN JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ===== HAMBURGER MENU =====
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');

  function closeMobileMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    navLinks.classList.add('open');
    hamburger.classList.add('active');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // Create backdrop element
  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  if (hamburger && navLinks) {
    // Toggle menu open/closed
    hamburger.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when clicking backdrop
    backdrop.addEventListener('click', closeMobileMenu);

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Handle all nav-link clicks in one consolidated listener:
    //   • Always close the mobile menu first
    //   • For same-page hash links (#services etc.) scroll AFTER a 150 ms
    //     delay so the menu collapse animation finishes and the page layout
    //     settles before we measure the target's position.
    //   • External links (WhatsApp etc.) are left to the browser as normal.
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';

        // Step 1 — close mobile menu
        closeMobileMenu();

        // Step 2 — smooth scroll for in-page anchors
        if (href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          const targetEl = document.querySelector(href);
          if (targetEl) {
            setTimeout(() => {
              const top = targetEl.getBoundingClientRect().top + window.pageYOffset - 80;
              window.scrollTo({ top, behavior: 'smooth' });
            }, 150);  // wait for menu close animation
          }
        }
        // External links (https://) and page links (index.html) fall
        // through and are handled by the browser normally.
      });
    });
  }

  // ===== DRAGGABLE NAV MENU (inertia scroll) =====
  const navList = document.querySelector('.nav-links');
  const isMobileNav = () => window.innerWidth <= 900;

  if (navList && !isMobileNav()) {
    let isDown = false, startX, scrollLeft, vel = 0, momentumId, moved = false;

    navList.addEventListener('mousedown', (e) => {
      // Don't hijack clicks on actual links — only drag on empty nav space
      if (e.target.closest('a')) return;
      isDown = true;
      moved = false;
      navList.classList.add('dragging');
      startX = e.pageX - navList.offsetLeft;
      scrollLeft = navList.scrollLeft;
      cancelAnimationFrame(momentumId);
    });

    navList.addEventListener('mouseleave', () => {
      if (isDown) { isDown = false; navList.classList.remove('dragging'); }
    });

    navList.addEventListener('mouseup', () => {
      isDown = false;
      navList.classList.remove('dragging');
      if (!moved) return;
      startMomentum();
    });

    navList.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - navList.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 3) moved = true;
      vel = walk;
      navList.scrollLeft = scrollLeft - walk;
    });

    function startMomentum() {
      const step = () => {
        vel *= 0.92;
        if (Math.abs(vel) > 0.5) {
          navList.scrollLeft -= vel;
          momentumId = requestAnimationFrame(step);
        }
      };
      momentumId = requestAnimationFrame(step);
    }
  }

  // ===== ACTIVE NAV LINK (scroll-aware) =====
  // Track sections so the right nav link lights up as the user scrolls.
  const navSections = [
    { href: '#services', el: document.querySelector('#services') },
    // Add more { href, el } entries here as new sections are added.
  ];

  function updateActiveNav() {
    const scrollY = window.scrollY + 120; // 80px navbar + 40px buffer
    let active = 'index.html'; // default → الرئيسية

    for (const { href, el } of navSections) {
      if (el && scrollY >= el.offsetTop) {
        active = href;
      }
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === active);
    });
  }

  updateActiveNav(); // run once on load
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ===== SCROLL REVEAL ANIMATION =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, Number(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    el.dataset.delay = index * 80;
    observer.observe(el);
  });

  // ===== COUNTER ANIMATION =====
  function animateCounter(el, target, duration = 2000) {
    const increment = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (!isNaN(target)) animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS (same-page) =====
  // Nav links are handled by the nav block above; skip them here.
  document.querySelectorAll('a[href^="#"]:not(.nav-links a)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

});