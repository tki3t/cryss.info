'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
if (sidebarBtn) { sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); }); }





// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const clickedPage = this.innerText.toLowerCase().trim();

    // Remove active class from all pages and navigation links first
    pages.forEach(page => page.classList.remove("active"));
    navigationLinks.forEach(link => link.classList.remove("active"));

    // Add active class to the clicked page and navigation link
    for (let j = 0; j < pages.length; j++) {
      const pageName = pages[j].dataset.page;

      if (clickedPage === pageName) {
        pages[j].classList.add("active");
        this.classList.add("active");
        window.scrollTo(0, 0);
        break;
      }
    }
  });
}

// Infinite marquee for clients list
const clientsList = document.querySelector(".clients-list");
if (clientsList) {
  const items = Array.from(clientsList.children);
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clientsList.appendChild(clone);
  });
}

// Page loader — show minimum time, then prompt "click to enter"
;(function () {
  var loader = document.getElementById('page-loader');
  if (!loader) return;

  var MIN_DISPLAY = 1500;
  var startTime = Date.now();

  // Block scrolling while loading
  document.documentElement.style.overflow = 'hidden';

  var readyToEnter = false;
  var entering = false;

  function showClickToEnter() {
    if (readyToEnter || entering) return;
    // Stop CSS animation and fill bar to 100%
    var fill = loader.querySelector('.loader-bar-fill');
    if (fill) {
      fill.style.animation = 'none';
      fill.style.width = '100%';
    }
    // Short pause so bar visually completes before showing text
    setTimeout(function () {
      loader.classList.add('ready-to-enter');
      readyToEnter = true;
    }, 250);
  }

  function enterSite() {
    if (!readyToEnter || entering) return;
    entering = true;
    readyToEnter = false;
    document.removeEventListener('click', enterSite);
    document.removeEventListener('touchstart', enterSite);

    // Animate page content in
    document.body.classList.add('page-entering');
    // Clean up class after animation finishes (0.1s delay + 0.8s anim = ~0.9s)
    setTimeout(function () { document.body.classList.remove('page-entering'); }, 1100);

    // Fade out loader
    loader.classList.add('loaded');
    document.documentElement.style.overflow = '';

    // Signal music player to start from track 1
    document.dispatchEvent(new CustomEvent('loaderExited'));
  }

  document.addEventListener('click', enterSite);
  document.addEventListener('touchstart', enterSite, { passive: true });

  function scheduleShow() {
    var elapsed = Date.now() - startTime;
    var remaining = MIN_DISPLAY - elapsed;
    setTimeout(showClickToEnter, remaining > 0 ? remaining : 0);
  }

  // Wait for DOM ready, then wait out the remaining minimum time
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleShow);
  } else {
    scheduleShow();
  }

  // Hard fallback: show click-to-enter after 8s at most
  setTimeout(showClickToEnter, 8000);
})();

// EmailJS - lazy init, only runs when contact form is submitted
document.getElementById("contact-form").addEventListener("submit", function (e) {
  e.preventDefault();

  if (typeof emailjs === 'undefined') {
    alert("Dịch vụ email chưa sẵn sàng, vui lòng thử lại sau giây lát.");
    return;
  }

  emailjs.init({ publicKey: "2Qt2Tx3B_YeZCfFWq" });
  emailjs.sendForm("service_uq48gps", "template_fqwyrec", this)
    .then(function () {
      alert("Email được gửi thành công!");
    }, function (error) {
      alert("Có lỗi: " + error.text);
    });

  this.reset();
});


(function () {
  var el = document.getElementById('visit-count');
  if (!el) return;

  var WORKER_URL = 'https://counter-api-sable.vercel.app/v1/cryss-info/site-visits/up';

  fetch(WORKER_URL)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (d) {
      var count = (d && (d.count !== undefined ? d.count : d.value));
      if (typeof count === 'number') {
        el.textContent = count.toLocaleString('vi-VN');
        el.classList.add('counting');
      } else {
        document.querySelector('.visit-counter').style.display = 'none';
      }
    })
    .catch(function () {
      var widget = document.querySelector('.visit-counter');
      if (widget) widget.style.display = 'none';
    });
})();
