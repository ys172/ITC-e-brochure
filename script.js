document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const viewport = carousel.querySelector(".carousel-viewport");
  const slides = [...track.children];
  const dots = carousel.querySelector(".carousel-dots");
  let activeIndex = 0;
  let dragStartX = 0;
  let dragDeltaX = 0;
  let dragging = false;

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to image ${index + 1}`);
    dot.addEventListener("click", () => {
      goTo(index);
    });
    dots.appendChild(dot);
  });

  const dotButtons = [...dots.children];

  function goTo(index) {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    track.style.transform = `translateX(${-activeIndex * viewport.clientWidth}px)`;
    updateDots();
  }

  function updateDots() {
    dotButtons.forEach((dot, index) => {
      dot.classList.toggle("active", index === activeIndex);
    });
  }

  viewport.addEventListener("pointerdown", (event) => {
    dragging = true;
    dragStartX = event.clientX;
    dragDeltaX = 0;
    track.style.transition = "none";
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }
    dragDeltaX = event.clientX - dragStartX;
    track.style.transform = `translateX(${(-activeIndex * viewport.clientWidth) + dragDeltaX}px)`;
  });

  function endDrag(event) {
    if (!dragging) {
      return;
    }
    dragging = false;
    track.style.transition = "";
    viewport.releasePointerCapture(event.pointerId);
    const threshold = Math.max(36, viewport.clientWidth * 0.16);
    if (dragDeltaX < -threshold) {
      goTo(activeIndex + 1);
    } else if (dragDeltaX > threshold) {
      goTo(activeIndex - 1);
    } else {
      goTo(activeIndex);
    }
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  window.addEventListener("resize", () => goTo(activeIndex));
  goTo(0);
});

const logoButton = document.querySelector(".logo-button");
const menuButton = document.querySelector(".menu-button");
const sideMenu = document.querySelector(".side-menu");
const menuBackdrop = document.querySelector(".menu-backdrop");

function closeMenu() {
  document.body.classList.remove("menu-open");
  sideMenu?.setAttribute("aria-hidden", "true");
}

function openMenu() {
  document.body.classList.add("menu-open");
  sideMenu?.setAttribute("aria-hidden", "false");
}

function scrollToSection(targetId) {
  const target = targetId === "top" ? document.body : document.getElementById(targetId);
  if (!target) {
    return;
  }
  const bandHeight = document.querySelector(".top-band")?.offsetHeight || 0;
  const top = targetId === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY - bandHeight;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

logoButton?.addEventListener("click", () => {
  closeMenu();
  scrollToSection("top");
});

menuButton?.addEventListener("click", () => {
  if (document.body.classList.contains("menu-open")) {
    closeMenu();
  } else {
    openMenu();
  }
});

menuBackdrop?.addEventListener("click", closeMenu);

document.querySelectorAll(".menu-timeline button").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    closeMenu();
    window.setTimeout(() => scrollToSection(targetId), 80);
  });
});

let pageDragging = false;
let pageStartX = 0;
let pageStartY = 0;
let pageLastY = 0;
let pageGestureLocked = false;
let pagePointerTarget = null;
let pagePointerId = null;

document.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

document.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    document.body.classList.contains("menu-open") ||
    event.target.closest("[data-carousel]") ||
    event.target.closest("button") ||
    event.target.closest("input, textarea, select")
  ) {
    return;
  }
  pageDragging = true;
  pageGestureLocked = false;
  pagePointerTarget = event.target;
  pagePointerId = event.pointerId;
  pageStartX = event.clientX;
  pageStartY = event.clientY;
  pageLastY = event.clientY;
  if (pagePointerTarget.setPointerCapture) {
    pagePointerTarget.setPointerCapture(pagePointerId);
  }
  document.body.classList.add("dragging-page");
});

document.addEventListener("pointermove", (event) => {
  if (!pageDragging) {
    return;
  }
  const deltaX = event.clientX - pageStartX;
  const deltaY = event.clientY - pageStartY;
  if (!pageGestureLocked && Math.hypot(deltaX, deltaY) > 8) {
    pageGestureLocked = Math.abs(deltaY) >= Math.abs(deltaX);
  }
  if (!pageGestureLocked) {
    return;
  }
  event.preventDefault();
  window.scrollBy(0, pageLastY - event.clientY);
  pageLastY = event.clientY;
}, { passive: false });

function endPageDrag() {
  if (pagePointerTarget && pagePointerTarget.releasePointerCapture && pagePointerId !== null) {
    try {
      pagePointerTarget.releasePointerCapture(pagePointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
  }
  pageDragging = false;
  pagePointerTarget = null;
  pagePointerId = null;
  document.body.classList.remove("dragging-page");
}

document.addEventListener("pointerup", endPageDrag);
document.addEventListener("pointercancel", endPageDrag);
