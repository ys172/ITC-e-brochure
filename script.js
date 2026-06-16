const logoButton = document.querySelector(".logo-button");
const menuButton = document.querySelector(".menu-button");
const contentMenu = document.querySelector(".content-menu");
const mapStage = document.querySelector(".map-stage");
const homeSection = document.querySelector(".home-section");
const heroWrap = document.querySelector(".hero-image-wrap");
const countNode = document.querySelector("[data-count-up]");
const heroSubtitle = document.querySelector(".height-callout > span");
const homeChineseTitle = document.querySelector(".cn-title");
let countRunId = 0;

if (heroSubtitle) heroSubtitle.textContent = "浦西第一高楼";
if (homeChineseTitle) homeChineseTitle.textContent = "愿景与变革的交汇";

logoButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const setMenuOpen = (open) => {
  if (!contentMenu || !menuButton) return;
  contentMenu.classList.toggle("is-open", open);
  contentMenu.setAttribute("aria-hidden", open ? "false" : "true");
  menuButton.setAttribute("aria-expanded", open ? "true" : "false");
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);
};

menuButton?.addEventListener("click", () => {
  setMenuOpen(!contentMenu?.classList.contains("is-open"));
});

contentMenu?.querySelectorAll("[data-target]").forEach((item) => {
  item.addEventListener("click", () => {
    const target = document.getElementById(item.dataset.target || "");
    setMenuOpen(false);
    if (!target) return;
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 420);
  });
});

function runCountUp() {
  if (!countNode || countNode.dataset.running === "true") return;

  countNode.dataset.running = "true";
  countRunId += 1;
  const currentRunId = countRunId;
  const from = Number(countNode.dataset.from || 100);
  const to = Number(countNode.dataset.to || 370);
  // Adjust 370M count-up speed here. Larger ms = slower.
  const duration = 1200;
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

document.querySelectorAll(".motion-section:not(.home-section)").forEach((section) => {
  const trigger =
    section.querySelector(".location-hero, .transport-hero, .office-hero, .team-hero, .amenities-hero, .contact-hero") || section;

  if (!("IntersectionObserver" in window)) {
    section.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        section.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.22 }
  );

  observer.observe(trigger);
});

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

document.querySelectorAll(".location-map").forEach((locationMap) => {
  if (!("IntersectionObserver" in window)) {
    locationMap.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        locationMap.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(locationMap);
});

document.querySelectorAll(".transport-animated-map, .flow-animated-map, .belt-animated-map").forEach((transportMap) => {
  if (!("IntersectionObserver" in window)) {
    transportMap.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        transportMap.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(transportMap);
});

document.querySelectorAll("[data-office]").forEach((office) => {
  const buildingImage = office.querySelector(".office-building-bg");
  const zoneInfo = office.querySelector(".office-zone-info");
  const zoneLabel = office.querySelector("[data-office-zone-label]");
  const viewImage = office.querySelector(".office-view-img");
  const viewLabel = office.querySelector("[data-office-view-label]");
  const timeButtons = Array.from(office.querySelectorAll(".office-time-button"));
  const directionButtons = Array.from(office.querySelectorAll(".office-dir"));
  const zoneButtons = Array.from(office.querySelectorAll(".office-zone-buttons button"));
  const planTrack = office.querySelector(".office-plan-track");
  const planDots = Array.from(office.querySelectorAll(".office-plan-dots button"));
  const planCarousel = office.querySelector(".office-plan-carousel");
  const viewText = { east: "EAST VIEW", north: "NORTH VIEW", south: "SOUTH VIEW", west: "WEST VIEW" };
  let zone = 7;
  let direction = "east";
  let timeMode = "day";
  let isDragging = false;
  let startX = 0;
  let currentX = 0;

  const officeAsset = (path) => `assets/v2/office/${path}`;
  const surroundSrc = () => {
    const folder = `${timeMode}_${direction}`;
    return officeAsset(`surround/surround/${timeMode}/${folder}/${folder}${String(zone - 1).padStart(4, "0")}@2x.png`);
  };

  const replayInfoAnimation = () => {
    if (!zoneInfo) return;
    zoneInfo.classList.remove("is-active");
    void zoneInfo.offsetWidth;
    zoneInfo.classList.add("is-active");
  };

  const updateOffice = (nextZone = zone, options = {}) => {
    zone = Math.min(8, Math.max(1, Number(nextZone) || 1));
    office.dataset.zone = String(zone);

    if (buildingImage) buildingImage.src = officeAsset(`building-zones/buildingZone${zone}.png`);
    if (zoneInfo) zoneInfo.src = officeAsset(`info/t${zone}@2x.png`);
    if (zoneLabel) zoneLabel.textContent = zone;
    if (viewImage) {
      viewImage.style.animation = "none";
      viewImage.src = surroundSrc();
      void viewImage.offsetWidth;
      viewImage.style.animation = "";
    }
    if (viewLabel) viewLabel.textContent = viewText[direction] || "EAST VIEW";
    timeButtons.forEach((button) => {
      const isActive = button.dataset.time === timeMode;
      button.classList.toggle("is-active", isActive);
      const icon = button.querySelector("img");
      if (icon && button.dataset.time) {
        icon.src = officeAsset(`buttons/${button.dataset.time === "day" ? "day2" : "night2"}_${isActive ? "b" : "a"}@2x.png`);
      }
    });

    directionButtons.forEach((button) => {
      const isActive = button.dataset.dir === direction;
      button.classList.toggle("is-active", isActive);
      const icon = button.querySelector("img");
      if (icon && button.dataset.dir) {
        icon.src = officeAsset(`buttons/${button.dataset.dir}_${isActive ? "b" : "a"}@2x.png`);
      }
    });
    zoneButtons.forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.zone) === zone);
    });
    planDots.forEach((dot) => {
      dot.classList.toggle("is-active", Number(dot.dataset.zone) === zone);
    });

    if (planTrack && !options.skipPlan) {
      planTrack.style.transform = `translateX(${-(zone - 1) * 100}%)`;
    }

    replayInfoAnimation();
  };

  directionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      direction = button.dataset.dir || direction;
      updateOffice(zone);
    });
  });

  zoneButtons.forEach((button) => {
    button.addEventListener("click", () => updateOffice(button.dataset.zone));
  });

  planDots.forEach((dot) => {
    dot.addEventListener("click", () => updateOffice(dot.dataset.zone));
  });

  timeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      timeMode = button.dataset.time || timeMode;
      updateOffice(zone);
    });
  });

  const finishPlanDrag = () => {
    if (!isDragging || !planCarousel || !planTrack) return;
    isDragging = false;
    const delta = currentX - startX;
    const threshold = planCarousel.clientWidth * 0.16;
    const nextZone = Math.abs(delta) > threshold ? zone + (delta < 0 ? 1 : -1) : zone;
    planTrack.classList.remove("is-dragging");
    updateOffice(nextZone);
  };

  planCarousel?.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    currentX = startX;
    planTrack?.classList.add("is-dragging");
    planCarousel.setPointerCapture?.(event.pointerId);
  });

  planCarousel?.addEventListener("pointermove", (event) => {
    if (!isDragging || !planCarousel || !planTrack) return;
    currentX = event.clientX;
    const delta = currentX - startX;
    planTrack.style.transform = `translateX(calc(${-(zone - 1) * 100}% + ${delta}px))`;
  });

  planCarousel?.addEventListener("pointerup", finishPlanDrag);
  planCarousel?.addEventListener("pointercancel", finishPlanDrag);
  planCarousel?.addEventListener("pointerleave", finishPlanDrag);

  updateOffice(zone);
});

const carouselRefreshers = [];

document.querySelectorAll(".location-carousel").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const originalSlides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const dots = Array.from(carousel.querySelectorAll(".carousel-dots button"));
  const isTeamChartCarousel = carousel.classList.contains("team-chart-carousel");
  if (!track || originalSlides.length === 0) return;

  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
  track.insertBefore(lastClone, originalSlides[0]);
  track.appendChild(firstClone);

  let index = 1;
  let timer = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let activeChartSlide = null;

  const getRealIndex = () => (index - 1 + originalSlides.length) % originalSlides.length;

  const resetTeamChartSlide = (slide) => {
    if (!slide) return;
    slide.classList.remove("is-active", "is-chart-animating", "is-chart-complete");
    slide.querySelectorAll(".team-chart-ring-progress").forEach((progress) => {
      progress.style.animation = "none";
      progress.style.strokeDasharray = "0 100";
      progress.style.strokeDashoffset = "0";
    });
    slide.querySelectorAll(".team-chart-value, .team-chart-percent").forEach((node) => {
      node.style.animation = "none";
      node.style.opacity = "0";
    });
  };

  const playTeamChartSlide = (slide) => {
    if (!slide) return;
    slide.classList.add("is-active");
    slide.classList.remove("is-chart-animating", "is-chart-complete");

    const progressNodes = Array.from(slide.querySelectorAll(".team-chart-ring-progress"));
    const revealNodes = Array.from(slide.querySelectorAll(".team-chart-value, .team-chart-percent"));
    progressNodes.forEach((progress) => {
      progress.style.animation = "none";
      progress.style.strokeDasharray = "0 100";
      progress.style.strokeDashoffset = "0";
    });
    revealNodes.forEach((node) => {
      node.style.animation = "none";
      node.style.opacity = "0";
    });

    void slide.offsetWidth;

    progressNodes.forEach((progress) => {
      progress.style.animation = "";
    });
    revealNodes.forEach((node) => {
      node.style.animation = "";
      node.style.opacity = "";
    });
    slide.classList.add("is-chart-animating");
    activeChartSlide = slide;
  };

  const syncTeamChartSlide = (restartAnimation = false) => {
    if (!isTeamChartCarousel) return;
    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    const activeSlide = slides[index];
    const isRealSlideIndex = index >= 1 && index <= originalSlides.length;
    slides.forEach((slide) => {
      if (slide !== activeSlide) resetTeamChartSlide(slide);
    });
    if (!isRealSlideIndex) {
      if (activeSlide) resetTeamChartSlide(activeSlide);
      activeChartSlide = null;
      return;
    }
    if (!activeSlide) return;
    const isNewActiveSlide = activeChartSlide !== activeSlide;
    if (!restartAnimation && !isNewActiveSlide) return;
    if (!restartAnimation) {
      resetTeamChartSlide(activeSlide);
      activeChartSlide = null;
      return;
    }
    playTeamChartSlide(activeSlide);
  };

  const stopAuto = () => {
    window.clearInterval(timer);
    timer = 0;
  };

  const startAuto = () => {
    stopAuto();
    timer = window.setInterval(() => {
      if (document.hidden) return;
      if (index <= 0 || index >= originalSlides.length + 1) {
        normalizeIndex();
      }
      moveTo(index + 1, false);
    }, 3000);
  };

  const update = (animate = true) => {
    track.classList.toggle("is-dragging", !animate);
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === getRealIndex());
    });
    syncTeamChartSlide(animate);
  };

  const normalizeIndex = () => {
    index = getRealIndex() + 1;
    update(false);
  };

  const moveTo = (nextIndex, restartAuto = true) => {
    if (nextIndex < 0 || nextIndex > originalSlides.length + 1) {
      const realIndex = (nextIndex - 1 + originalSlides.length * 1000) % originalSlides.length;
      nextIndex = realIndex + 1;
    }
    index = nextIndex;
    update(true);
    if (restartAuto) startAuto();
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => moveTo(dotIndex + 1));
  });

  const finishDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    const delta = currentX - startX;
    const threshold = carousel.clientWidth * 0.16;

    if (Math.abs(delta) > threshold) {
      moveTo(index + (delta < 0 ? 1 : -1));
    } else {
      moveTo(index);
    }
  };

  carousel.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    currentX = startX;
    stopAuto();
    update(false);
    carousel.setPointerCapture?.(event.pointerId);
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    currentX = event.clientX;
    const delta = currentX - startX;
    track.style.transform = `translateX(calc(${-index * 100}% + ${delta}px))`;
  });

  carousel.addEventListener("pointerup", finishDrag);
  carousel.addEventListener("pointercancel", finishDrag);
  carousel.addEventListener("pointerleave", finishDrag);

  track.addEventListener("transitionend", () => {
    if (index === 0) {
      index = originalSlides.length;
      update(false);
      if (isTeamChartCarousel) window.requestAnimationFrame(() => syncTeamChartSlide(true));
    }

    if (index === originalSlides.length + 1) {
      index = 1;
      update(false);
      if (isTeamChartCarousel) window.requestAnimationFrame(() => syncTeamChartSlide(true));
    }
  });

  update(false);
  if (isTeamChartCarousel) {
    window.requestAnimationFrame(() => syncTeamChartSlide(true));
  }
  startAuto();

  carouselRefreshers.push(() => {
    isDragging = false;
    stopAuto();
    normalizeIndex();
    startAuto();
  });
});

const flowAnimators = [];

document.querySelectorAll(".flow-animated-map").forEach((flowMap) => {
  const frameNode = flowMap.querySelector(".flow-frame");
  const frameCount = Number(flowMap.dataset.flowFrameCount || 75);
  if (!frameNode || !frameCount) return;

  const framePrefix = "assets/v2/transport/flow-loop/ITC_Flow_Loop_";
  const frameUrls = Array.from({ length: frameCount }, (_, frameIndex) => {
    return `${framePrefix}${String(frameIndex).padStart(3, "0")}.png`;
  });

  frameUrls.forEach((url) => {
    const image = new Image();
    image.src = url;
  });

  let rafId = 0;
  let active = false;
  let startedAt = 0;
  const frameDuration = 42;

  const render = (now) => {
    if (!active || document.hidden) {
      rafId = 0;
      return;
    }

    if (!startedAt) startedAt = now;
    const frameIndex = Math.floor((now - startedAt) / frameDuration) % frameCount;
    frameNode.src = frameUrls[frameIndex];
    rafId = window.requestAnimationFrame(render);
  };

  const start = () => {
    if (active) return;
    active = true;
    startedAt = 0;
    rafId = window.requestAnimationFrame(render);
  };

  const stop = () => {
    active = false;
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  };

  if (!("IntersectionObserver" in window)) {
    start();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(flowMap);
  }

  flowAnimators.push({ start, stop });
});

const refreshCarousels = () => {
  carouselRefreshers.forEach((refresh) => refresh());
};

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    window.requestAnimationFrame(refreshCarousels);
    flowAnimators.forEach((animator) => animator.start());
  } else {
    flowAnimators.forEach((animator) => animator.stop());
  }
});

window.addEventListener("pageshow", refreshCarousels);
window.addEventListener("focus", refreshCarousels);
