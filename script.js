const logoButton = document.querySelector(".logo-button");
const mapStage = document.querySelector(".map-stage");
const homeSection = document.querySelector(".home-section");
const heroWrap = document.querySelector(".hero-image-wrap");
const countNode = document.querySelector("[data-count-up]");
let countRunId = 0;

logoButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector(".menu-button")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function runCountUp() {
  if (!countNode || countNode.dataset.running === "true") return;

  countNode.dataset.running = "true";
  countRunId += 1;
  const currentRunId = countRunId;
  const from = Number(countNode.dataset.from || 100);
  const to = Number(countNode.dataset.to || 370);
  const duration = 720;
  const startedAt = performance.now();

  const tick = (now) => {
    if (currentRunId !== countRunId) return;

    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    countNode.textContent = Math.round(from + (to - from) * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    countNode.textContent = to;
    countNode.dataset.running = "false";
  };

  requestAnimationFrame(tick);
}

function resetCountUp() {
  if (!countNode) return;
  countRunId += 1;
  countNode.dataset.running = "false";
  countNode.textContent = countNode.dataset.from || "100";
}

function revealHomeIntro() {
  homeSection?.classList.add("is-visible");
  runCountUp();
}

function resetHomeIntro() {
  homeSection?.classList.remove("is-visible");
  resetCountUp();
}

if (heroWrap && "IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealHomeIntro();
        } else {
          resetHomeIntro();
        }
      });
    },
    { threshold: 0.35 }
  );
  heroObserver.observe(heroWrap);
} else {
  revealHomeIntro();
}

if (mapStage && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          mapStage.classList.add("is-visible");
        } else {
          mapStage.classList.remove("is-visible");
        }
      });
    },
    { threshold: 0.35 }
  );
  observer.observe(mapStage);
} else {
  mapStage?.classList.add("is-visible");
}
