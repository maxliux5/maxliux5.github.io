"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 18;
const MOUSE_INFLUENCE_RADIUS = 25;

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const PALETTE = [
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x3b82f6),
      new THREE.Color(0xec4899),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xa855f7),
    ];

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01
        )
      );
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
    particleGeometry.setAttribute(
      "size",
      new THREE.BufferAttribute(sizes, 1)
    );

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float pulse = sin(uTime * 2.0 + position.x * 0.1) * 0.3 + 1.0;
          gl_PointSize = size * pulse * uPixelRatio * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 1.5);
          gl_FragColor = vec4(vColor, alpha * 0.9);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const connections: number[][] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const neighbors: number[] = [];
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECTION_DISTANCE) {
          neighbors.push(j);
        }
      }
      connections.push(neighbors);
    }

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(PARTICLE_COUNT * 10 * 6);
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    const mouse = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mousePoint = new THREE.Vector3();

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.x =
          (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y =
          -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener("touchmove", handleTouchMove);

    let animationId: number;
    const clock = new THREE.Clock();

    const updateLines = () => {
      const posArray = particleGeometry.attributes.position
        .array as Float32Array;
      const linePosArray = lineGeometry.attributes.position
        .array as Float32Array;
      let lineIndex = 0;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const neighbors = connections[i];
        for (let j = 0; j < neighbors.length && j < 5; j++) {
          const ni = neighbors[j];

          const dx = posArray[i * 3] - posArray[ni * 3];
          const dy = posArray[i * 3 + 1] - posArray[ni * 3 + 1];
          const dz = posArray[i * 3 + 2] - posArray[ni * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < CONNECTION_DISTANCE) {
            linePosArray[lineIndex * 6] = posArray[i * 3];
            linePosArray[lineIndex * 6 + 1] = posArray[i * 3 + 1];
            linePosArray[lineIndex * 6 + 2] = posArray[i * 3 + 2];
            linePosArray[lineIndex * 6 + 3] = posArray[ni * 3];
            linePosArray[lineIndex * 6 + 4] = posArray[ni * 3 + 1];
            linePosArray[lineIndex * 6 + 5] = posArray[ni * 3 + 2];
            lineIndex++;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIndex * 2);
      lineGeometry.attributes.position.needsUpdate = true;
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      particleMaterial.uniforms.uTime.value = elapsed;

      const posArray = particleGeometry.attributes.position
        .array as Float32Array;

      raycaster.setFromCamera(mouse, camera);
      const intersectPoint = raycaster.ray.intersectPlane(
        mousePlane,
        mousePoint
      );
      const hasMouse = intersectPoint !== null;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        posArray[i3] += velocities[i].x;
        posArray[i3 + 1] += velocities[i].y;
        posArray[i3 + 2] += velocities[i].z;

        if (posArray[i3] > 60) posArray[i3] = -60;
        if (posArray[i3] < -60) posArray[i3] = 60;
        if (posArray[i3 + 1] > 50) posArray[i3 + 1] = -50;
        if (posArray[i3 + 1] < -50) posArray[i3 + 1] = 50;

        if (hasMouse) {
          const dx = mousePoint.x - posArray[i3];
          const dy = mousePoint.y - posArray[i3 + 1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_INFLUENCE_RADIUS && dist > 0.1) {
            const force = (1 - dist / MOUSE_INFLUENCE_RADIUS) * 0.02;
            posArray[i3] += dx * force;
            posArray[i3 + 1] += dy * force;
          }
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      updateLines();

      particles.rotation.z = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      particleMaterial.uniforms.uPixelRatio.value =
        renderer.getPixelRatio();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
