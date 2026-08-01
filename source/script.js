import "@phosphor-icons/web/regular";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

const header = document.querySelector("[data-site-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

function setMenu(open) {
  if (!menuToggle || !mobileNav) return;

  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");

  const icon = menuToggle.querySelector("i");
  if (icon) icon.className = open ? "ph ph-x" : "ph ph-list";

  mobileNav.hidden = !open;
  document.body.classList.toggle("menu-open", open);
  header?.classList.remove("is-hidden");
}

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || menuToggle.getAttribute("aria-expanded") !== "true") return;
    setMenu(false);
    menuToggle.focus();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1050) setMenu(false);
  });
}

if (header) {
  const homeHero = document.querySelector(".hero");
  const solidHeaderPage = document.body.classList.contains("interior-page");
  let lastScrollY = Math.max(0, window.scrollY);
  let scrollTicking = false;

  const updateHeader = () => {
    const currentScrollY = Math.max(0, window.scrollY);
    const heroThreshold = homeHero
      ? Math.max(120, homeHero.offsetHeight - header.offsetHeight)
      : 0;
    const pastHero = currentScrollY > heroThreshold;
    const menuIsOpen = menuToggle?.getAttribute("aria-expanded") === "true";
    const scrollingDown = currentScrollY > lastScrollY + 5;
    const scrollingUp = currentScrollY < lastScrollY - 5;

    header.classList.toggle("is-scrolled", solidHeaderPage || pastHero);

    if (pastHero && scrollingDown && currentScrollY > header.offsetHeight * 2 && !menuIsOpen) {
      header.classList.add("is-hidden");
    } else if (scrollingUp || !pastHero || menuIsOpen) {
      header.classList.remove("is-hidden");
    }

    lastScrollY = currentScrollY;
    scrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(updateHeader);
    },
    { passive: true },
  );

  updateHeader();
}

const callFab = document.querySelector("[data-call-fab]");

if (callFab) {
  const callTrigger = callFab.querySelector(".call-fab__trigger");
  const callMenu = callFab.querySelector(".call-fab__menu");
  const callMenuLink = callMenu?.querySelector("a");

  const setCallMenu = (open, returnFocus = false) => {
    if (!callTrigger || !callMenu) return;

    callFab.classList.toggle("is-open", open);
    callTrigger.setAttribute("aria-expanded", String(open));
    callTrigger.setAttribute("aria-label", open ? "Close call options" : "Open call options");
    callMenu.setAttribute("aria-hidden", String(!open));
    callMenu.toggleAttribute("inert", !open);
    if (callMenuLink) callMenuLink.tabIndex = open ? 0 : -1;

    const icon = callTrigger.querySelector("i");
    if (icon) icon.className = open ? "ph ph-x" : "ph ph-phone";
    if (returnFocus) callTrigger.focus();
  };

  setCallMenu(false);

  callTrigger?.addEventListener("click", () => {
    setCallMenu(callTrigger.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("click", (event) => {
    if (!callFab.contains(event.target) && callTrigger?.getAttribute("aria-expanded") === "true") {
      setCallMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || callTrigger?.getAttribute("aria-expanded") !== "true") return;
    setCallMenu(false, true);
  });
}

const lightbox = document.querySelector("#project-lightbox");
let activeGalleryItem = null;

if (lightbox instanceof HTMLDialogElement) {
  const lightboxImage = lightbox.querySelector(".lightbox__image");
  const lightboxCaption = lightbox.querySelector("#lightbox-caption");
  const lightboxClose = lightbox.querySelector(".lightbox__close");

  document.querySelectorAll(".project-gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const image = item.querySelector("img");
      if (!image || !lightboxImage || !lightboxCaption) return;

      activeGalleryItem = item;
      const largestResponsiveSource = image.srcset
        ?.split(",")
        .map((candidate) => candidate.trim().split(/\s+/)[0])
        .filter(Boolean)
        .at(-1);

      lightboxImage.src = largestResponsiveSource || image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = item.dataset.caption || image.alt;
      lightbox.showModal();
    });
  });

  lightboxClose?.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    lightbox.close();
  });

  lightbox.addEventListener("close", () => {
    activeGalleryItem?.focus();
    activeGalleryItem = null;
  });
}

const estimateForm = document.querySelector("#estimate-form");
const formStatus = document.querySelector("#form-status");
const preparedTextLink = document.querySelector("#prepared-text-link");

if (estimateForm && formStatus && preparedTextLink) {
  const serviceSelect = estimateForm.querySelector('select[name="service"]');
  const requestedService = new URLSearchParams(window.location.search).get("service");
  const serviceValues = {
    "kitchen-backsplash": "Kitchen backsplash",
    "bathroom-shower-tile": "Bathroom or shower tile",
    "tile-floor-repair": "Tile floor or repair",
    "laminate-flooring": "Laminate flooring",
  };

  if (serviceSelect && requestedService && serviceValues[requestedService]) {
    serviceSelect.value = serviceValues[requestedService];
  }

  estimateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!estimateForm.reportValidity()) return;

    const data = new FormData(estimateForm);
    const message = [
      `Hi David, this is ${data.get("name")}.`,
      `I’m in ${data.get("location")} and I’m interested in ${data.get("service")}.`,
      data.get("details") ? `Project details: ${data.get("details")}` : "",
      "Could we talk about a free estimate?",
    ]
      .filter(Boolean)
      .join("\n\n");

    preparedTextLink.href = `sms:+15186504248?body=${encodeURIComponent(message)}`;
    preparedTextLink.hidden = false;
    formStatus.textContent =
      "Your estimate request is ready. Open your text app to review and send it to David.";
    preparedTextLink.focus();
  });
}

document.querySelectorAll("#year").forEach((year) => {
  year.textContent = new Date().getFullYear();
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  const headerInner = document.querySelector(".site-header__inner");
  if (headerInner) {
    gsap.from(headerInner, {
      opacity: 0,
      y: -18,
      duration: 0.72,
      ease: "power3.out",
      clearProps: "all",
    });
  }

  const heroContent = document.querySelector(".hero__content");
  if (heroContent) {
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(".hero__content h1", { opacity: 0, y: 36, duration: 0.9 })
      .from(".hero__content > p", { opacity: 0, y: 22, duration: 0.7 }, "-=0.52")
      .from(".hero__actions", { opacity: 0, y: 18, duration: 0.7 }, "-=0.44")
      .to(".hero__media", { scale: 1, duration: 1.5, ease: "power2.out" }, 0);
  }

  const workHero = document.querySelector(".work-hero__content, .page-hero__content");
  if (workHero) {
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(".work-hero .eyebrow, .page-hero .eyebrow", { opacity: 0, y: 14, duration: 0.55 })
      .from(".work-hero h1, .page-hero h1", { opacity: 0, y: 32, duration: 0.9 }, "-=0.25")
      .from(".work-hero__content > p:last-child, .page-hero__content > p:last-child", { opacity: 0, y: 18, duration: 0.65 }, "-=0.48");
  }

  const wordReveal = document.querySelector(".word-reveal");
  if (wordReveal) {
    const originalText = wordReveal.textContent.trim().replace(/\s+/g, " ");
    wordReveal.setAttribute("aria-label", originalText);
    wordReveal.innerHTML = originalText
      .split(" ")
      .map((word) => `<span class="word" aria-hidden="true">${word}</span>`)
      .join(" ");

    gsap.fromTo(
      ".word-reveal .word",
      { opacity: 0.16 },
      {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
          trigger: wordReveal,
          start: "top 82%",
          end: "bottom 48%",
          scrub: true,
        },
      },
    );
  }

  document.querySelectorAll(".reveal-image").forEach((element) => {
    gsap.fromTo(
      element,
      { opacity: 0.35, scale: 0.96, y: 24 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top 94%",
          end: "center 70%",
          scrub: 0.55,
        },
      },
    );
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}
