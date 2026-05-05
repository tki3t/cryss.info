'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
if (sidebarBtn) { sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); }); }



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  if (modalContainer) modalContainer.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    if (modalImg) { modalImg.src = this.querySelector("[data-testimonials-avatar]").src; }
    if (modalImg) { modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt; }
    if (modalTitle) { modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML; }
    if (modalText) { modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML; }

    testimonialsModalFunc();

  });

}

// add click event to modal close button
if (modalCloseBtn) { modalCloseBtn.addEventListener("click", testimonialsModalFunc); }
if (overlay) { overlay.addEventListener("click", testimonialsModalFunc); }



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) { select.addEventListener("click", function () { elementToggleFunc(this); }); }

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    if (selectValue) { selectValue.innerText = this.innerText; }
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0] || null;

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    if (selectValue) { selectValue.innerText = this.innerText; }
    filterFunc(selectedValue);

    if (lastClickedBtn) { lastClickedBtn.classList.remove("active"); }
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



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

// Page loader — show minimum 3s, then hide after DOM ready
;(function () {
  var loader = document.getElementById('page-loader');
  if (!loader) return;

  var MIN_DISPLAY = 1500; // minimum ms to show loader
  var startTime = Date.now();

  // Block scrolling while loading
  document.documentElement.style.overflow = 'hidden';

  var done = false;
  function hideLoader() {
    if (done) return;
    done = true;
    var fill = loader.querySelector('.loader-bar-fill');
    if (fill) fill.style.width = '100%';
    setTimeout(function () {
      loader.classList.add('loaded');
      document.documentElement.style.overflow = '';
    }, 180);
  }

  function scheduleHide() {
    var elapsed = Date.now() - startTime;
    var remaining = MIN_DISPLAY - elapsed;
    setTimeout(hideLoader, remaining > 0 ? remaining : 0);
  }

  // Wait for DOM ready, then wait out the remaining minimum time
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleHide);
  } else {
    scheduleHide();
  }

  // Hard fallback: never exceed 8s
  setTimeout(hideLoader, 8000);
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

  fetch(WORKER_URL, { cache: 'no-store' })
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
