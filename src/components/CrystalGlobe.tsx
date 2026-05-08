"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CrystalGlobe.module.css";

const STAR_COUNT = 80;

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function CrystalGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 50, y: 50 });
  const shakeRef = useRef({ x: 0, y: 0 });
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Initialize and animate stars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    let animationId: number;
    const animate = () => {
      if (!canvas || !ctx) return;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const time = Date.now() * 0.001;
      const mouseX = mouseRef.current.x / 100;
      const mouseY = mouseRef.current.y / 100;

      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.twinkleOffset);
        const alpha = star.opacity * (0.5 + twinkle * 0.5);

        const dx = star.x - mouseX;
        const dy = star.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const brightness = dist < 0.2 ? 1 + (0.2 - dist) * 2 : 1;

        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 180, 255, ${alpha * brightness})`;
        ctx.fill();
      });

      stars.forEach((star1, i) => {
        stars.slice(i + 1).forEach((star2) => {
          const dx = star1.x - star2.x;
          const dy = star1.y - star2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 0.15) {
            const midX = (star1.x + star2.x) / 2;
            const midY = (star1.y + star2.y) / 2;
            const distToMouse = Math.sqrt((midX - mouseX) ** 2 + (midY - mouseY) ** 2);

            if (distToMouse < 0.3) {
              const alpha = (0.15 - distToMouse) * 0.5;
              ctx.beginPath();
              ctx.moveTo(star1.x * width, star1.y * height);
              ctx.lineTo(star2.x * width, star2.y * height);
              ctx.strokeStyle = `rgba(180, 160, 220, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Mouse tracking and shake effect
  useEffect(() => {
    const container = containerRef.current;
    const viewport = viewportRef.current;
    if (!container || !viewport) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      mouseRef.current = { x, y };
      container.style.setProperty("--x", `${x}%`);
      container.style.setProperty("--y", `${y}%`);
    };

    const handleShake = () => {
      const intensity = 0.3;
      shakeRef.current = {
        x: (Math.random() - 0.5) * intensity,
        y: (Math.random() - 0.5) * intensity,
      };
      viewport.style.transform = `translate3d(${shakeRef.current.x}px, ${shakeRef.current.y}px, 0)`;
    };

    const shakeInterval = setInterval(handleShake, 100);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      clearInterval(shakeInterval);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className={styles.crystalGlobeSafeArea}>
        <div ref={viewportRef} className={styles.featherViewportInner}>
          <div className={styles.featherContents}>
            <div className={styles.featherSharp}>
              <video
                src="/assets/back.mp4"
                autoPlay
                loop
                playsInline
                muted
                onCanPlay={() => setVideoLoaded(true)}
                className={videoLoaded ? styles.loaded : ""}
              />
            </div>
            <canvas
              ref={canvasRef}
              className={styles.featherStars}
              width={720}
              height={720}
              aria-hidden="true"
            />
            <div className={styles.featherVeil} />
          </div>
        </div>
      </div>
      <p className={styles.galleryCaption}>
        &ldquo;You and I have memories. Longer than the road that stretches out ahead.&rdquo;
      </p>
    </>
  );
}
