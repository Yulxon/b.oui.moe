import { onMount, onCleanup, type Component } from "solid-js";
import { Portal } from "solid-js/web";

const FooterGlow: Component = () => {
  let spacerRef: HTMLDivElement | undefined;
  let artRef: HTMLDivElement | undefined;

  const VBW = 1271;
  const VBH = 599;
  const BASE = 614;
  const BLUR = 15;

  const BARS = [
    { x: -16, w: 174, h: 323 },
    { x: 125, w: 174, h: 404 },
    { x: 266, w: 174, h: 478 },
    { x: 407, w: 175, h: 530 },
    { x: 549, w: 173, h: 584 },
    { x: 689, w: 175, h: 530 },
    { x: 831, w: 174, h: 478 },
    { x: 972, w: 174, h: 404 },
    { x: 1113, w: 174, h: 323 },
  ];

  const ramp = [
    { offset: 0, color: "rgb(3 6 13)", opacity: "1.000" },
    { offset: 0.032, color: "rgb(20 45 59)", opacity: "1.000" },
    { offset: 0.161, color: "rgb(88 200 242)", opacity: "1.000" },
    { offset: 0.226, color: "rgb(146 193 227)", opacity: "1.000" },
    { offset: 0.323, color: "rgb(235 171 188)", opacity: "1.000" },
    { offset: 0.419, color: "rgb(250 213 221)", opacity: "1.000" },
    { offset: 0.484, color: "rgb(254 247 248)", opacity: "1.000" },
    { offset: 0.548, color: "rgb(252 230 234)", opacity: "1.000" },
    { offset: 0.645, color: "rgb(246 180 193)", opacity: "1.000" },
    { offset: 0.774, color: "rgb(146 193 227)", opacity: "1.000" },
    { offset: 0.839, color: "rgb(91 206 250)", opacity: "0.968" },
    { offset: 1, color: "rgb(91 206 250)", opacity: "0.000" },
  ];

  onMount(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (artRef) artRef.style.transform = "scaleY(1)";
      return;
    }

    let progress = 0;
    let ticking = false;
    let settle = 0;
    let snapping = false;
    let snapRelease = 0;
    let last = 0;
    let lastAt = 0;
    let ticks = 0;
    let slow = false;

    const measure = () => {
      ticking = false;
      const pad = spacerRef;
      const node = artRef;
      if (!pad || !node) return;

      const rect = pad.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const absoluteTop = window.scrollY + rect.top;
      const triggerLine = Math.max(absoluteTop, vh);
      const overScroll = window.scrollY + vh - triggerLine;
      
      progress = Math.max(0, Math.min(1, overScroll / (rect.height || 1)));
      
      node.style.transform = `scaleY(${Math.min(1, progress / 0.995).toFixed(4)})`;
      document.documentElement.style.setProperty(
        "--glow-push",
        `${(progress * 12).toFixed(2)}vh`
      );

      const now = performance.now();
      const dt = now - lastAt;
      const speed = dt > 0 ? (Math.abs(progress - last) / dt) * 1000 : 0;
      if (++ticks > 10) {
        slow = speed < 5 && dt < 50;
        ticks = 0;
      }
      if (snapping && speed > 0.1) snapping = false;
      last = progress;
      lastAt = now;
    };

    const snap = () => {
      const pad = spacerRef;
      if (snapping || progress <= 0.05 || !pad) return;
      snapping = true;
      // Scroll so the bottom of the viewport perfectly aligns with the top of the spacer
      const top = window.scrollY + pad.getBoundingClientRect().top - window.innerHeight;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      clearTimeout(snapRelease);
      snapRelease = setTimeout(() => {
        snapping = false;
      }, 1000);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
      clearTimeout(settle);
      settle = setTimeout(snap, slow ? 150 : 350);
    };

    // Observer to re-measure when page height changes (e.g. route transitions)
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    resizeObserver.observe(document.body);

    // Use setTimeout to ensure Portal is mounted before first measure
    setTimeout(measure, 50);
    
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    onCleanup(() => {
      resizeObserver.disconnect();
      clearTimeout(settle);
      clearTimeout(snapRelease);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.documentElement.style.removeProperty("--glow-push");
    });
  });

  return (
    <div class="ft-glow" style={{ position: "relative", "z-index": 3, "margin-top": "32px" }}>
      <div class="ft-glow-spacer" ref={spacerRef} />
      
      <Portal mount={document.body}>
        <div class="dia-glow" ref={artRef} aria-hidden="true">
          <svg
            viewBox={`0 0 ${VBW} ${VBH}`}
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="dia-glow-grad" x1="0" y1="1" x2="0" y2="0">
                {ramp.map((s) => (
                  <stop
                    offset={s.offset}
                    style={{ "stop-color": s.color, "stop-opacity": s.opacity }}
                  />
                ))}
              </linearGradient>
              <filter
                id="dia-glow-blur"
                x="-25%"
                y="-25%"
                width="150%"
                height="150%"
                filterUnits="objectBoundingBox"
                color-interpolation-filters="sRGB"
              >
                <feGaussianBlur stdDeviation={BLUR} />
              </filter>
            </defs>
            <g filter="url(#dia-glow-blur)">
              {BARS.map((b) => (
                <rect
                  x={b.x}
                  y={BASE - b.h}
                  width={b.w}
                  height={b.h}
                  fill="url(#dia-glow-grad)"
                />
              ))}
            </g>
          </svg>
        </div>
      </Portal>
    </div>
  );
};

export default FooterGlow;
