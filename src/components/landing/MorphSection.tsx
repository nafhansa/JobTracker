"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLanguage } from "@/lib/language/context";

export default function MorphSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const NUM_POINTS = 10;
  const NUM_PATHS = 2;
  const DELAY_POINTS_MAX = 0.3;
  const DELAY_PER_PATH = 0.25;
  const DURATION = 0.9;

  useEffect(() => {
    const allPoints: number[][] = [];
    for (let i = 0; i < NUM_PATHS; i++) {
      allPoints.push(new Array(NUM_POINTS).fill(0));
    }

    let isOpened = false;

    const renderPaths = () => {
      for (let i = 0; i < NUM_PATHS; i++) {
        const path = pathRefs.current[i];
        const points = allPoints[i];
        if (!path) continue;

        let d = "";
        d += isOpened ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`;

        for (let j = 0; j < NUM_POINTS - 1; j++) {
          const p = ((j + 1) / (NUM_POINTS - 1)) * 100;
          const cp = p - ((1 / (NUM_POINTS - 1)) * 100) / 2;
          d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
        }

        d += isOpened ? ` V 100 H 0` : ` V 0 H 0`;
        path.setAttribute("d", d);
      }
    };

    renderPaths();

    const animate = () => {
      const tl = gsap.timeline({
        onUpdate: renderPaths,
        defaults: {
          ease: "power2.inOut",
          duration: DURATION,
        },
      });

      timelineRef.current = tl;

      tl.to(sectionRef.current, {
        backgroundColor: "#0a1628",
        duration: 1.4,
        ease: "power2.inOut",
      }, 0);

      const pointsDelay: number[] = [];
      for (let i = 0; i < NUM_POINTS; i++) {
        pointsDelay[i] = Math.random() * DELAY_POINTS_MAX;
      }

      for (let i = 0; i < NUM_PATHS; i++) {
        const points = allPoints[i];
        const pathDelay = DELAY_PER_PATH * i;

        for (let j = 0; j < NUM_POINTS; j++) {
          const delay = pointsDelay[j];
          tl.to(points, {
            [j]: 100,
          }, delay + pathDelay);
        }
      }

      if (contentRef.current) {
        tl.fromTo(
          contentRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          0.8
        );
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            animate();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none -scale-y-100"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="morph-grad-back" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="morph-grad-front" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <path
          ref={(el) => { pathRefs.current[0] = el; }}
          fill="url(#morph-grad-back)"
        />
        <path
          ref={(el) => { pathRefs.current[1] = el; }}
          fill="url(#morph-grad-front)"
        />
      </svg>

      <div
        ref={contentRef}
        className="relative z-10 text-center px-6"
        style={{ opacity: 0 }}
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          {t("phone.title")}
        </h2>
      </div>
    </section>
  );
}