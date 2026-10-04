'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LiquidityWall, POI } from '@/types/orderflow';

interface ThreeGravitationalCanvasProps {
  liquidityWalls: LiquidityWall[];
  activePOIs: POI[];
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  width: number;
  height: number;
  showGravitational: boolean;
  showAbsorption: boolean;
}

export const ThreeGravitationalCanvas: React.FC<ThreeGravitationalCanvasProps> = ({
  liquidityWalls,
  activePOIs,
  currentPrice,
  minPrice,
  maxPrice,
  width,
  height,
  showGravitational,
  showAbsorption,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // References to dynamic objects
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const shockwavesGroupRef = useRef<THREE.Group | null>(null);
  const particleDataRef = useRef<{
    positions: Float32Array;
    velocities: Float32Array;
    lifetimes: Float32Array;
    maxLifetimes: Float32Array;
  } | null>(null);

  // Keep latest props in ref for animation loop
  const propsRef = useRef({
    liquidityWalls,
    activePOIs,
    currentPrice,
    minPrice,
    maxPrice,
    width,
    height,
    showGravitational,
    showAbsorption,
  });

  useEffect(() => {
    propsRef.current = {
      liquidityWalls,
      activePOIs,
      currentPrice,
      minPrice,
      maxPrice,
      width,
      height,
      showGravitational,
      showAbsorption,
    };
  }, [liquidityWalls, activePOIs, currentPrice, minPrice, maxPrice, width, height, showGravitational, showAbsorption]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const w = width || container.clientWidth || 800;
    const h = height || container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup (Orthographic matching pixel dimensions)
    const camera = new THREE.OrthographicCamera(0, w, 0, h, -500, 500);
    camera.position.z = 10;
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Particle Field setup (1,200 particles)
    const PARTICLE_COUNT = 1000;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const lifetimes = new Float32Array(PARTICLE_COUNT);
    const maxLifetimes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = Math.random() * w;
      positions[i * 3 + 1] = Math.random() * h;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      velocities[i * 3] = (Math.random() - 0.5) * 0.4;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      velocities[i * 3 + 2] = 0;

      lifetimes[i] = Math.random() * 120;
      maxLifetimes[i] = 90 + Math.random() * 90;

      // Color palette: Cyan / Emerald for bids, Amber / Crimson for asks
      const isCyan = Math.random() > 0.5;
      if (isCyan) {
        colors[i * 3] = 0.05;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 0.95;
      } else {
        colors[i * 3] = 0.98;
        colors[i * 3 + 1] = 0.65;
        colors[i * 3 + 2] = 0.15;
      }
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Glow circle particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(100, 220, 255, 0.8)');
      grad.addColorStop(0.7, 'rgba(0, 180, 255, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particlesMaterial = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    particlesMeshRef.current = particlesMesh;
    particleDataRef.current = { positions, velocities, lifetimes, maxLifetimes };

    // 5. Shockwaves Group for POI Absorption
    const shockwavesGroup = new THREE.Group();
    scene.add(shockwavesGroup);
    shockwavesGroupRef.current = shockwavesGroup;

    // Helper to map price to Y canvas coordinate
    const priceToY = (price: number, minP: number, maxP: number, hVal: number): number => {
      const pRange = Math.max(0.0001, maxP - minP);
      return hVal - ((price - minP) / pRange) * hVal;
    };

    // 6. Animation loop
    let tickCount = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      tickCount++;

      const {
        liquidityWalls: walls,
        activePOIs: pois,
        currentPrice: cPrice,
        minPrice: minP,
        maxPrice: maxP,
        width: curW,
        height: curH,
        showGravitational: showGrav,
        showAbsorption: showAbs,
      } = propsRef.current;

      // Toggle visibility
      if (particlesMeshRef.current) {
        particlesMeshRef.current.visible = showGrav;
      }
      if (shockwavesGroupRef.current) {
        shockwavesGroupRef.current.visible = showAbs;
      }

      // Gravitational physics update
      if (showGrav && particleDataRef.current && particlesMeshRef.current) {
        const { positions: pos, velocities: vel, lifetimes: life, maxLifetimes: maxLife } = particleDataRef.current;
        const currentPriceY = priceToY(cPrice, minP, maxP, curH);

        // Precompute screen Y coordinates for major liquidity walls
        const targetWalls = walls.slice(0, 6).map(w => ({
          y: priceToY(w.price, minP, maxP, curH),
          force: Math.min(1.5, w.pullForce * 0.04),
          side: w.side,
        }));

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const idx = i * 3;
          let px = pos[idx];
          let py = pos[idx + 1];

          life[i]++;
          if (life[i] > maxLife[i] || px < -20 || px > curW + 20 || py < -20 || py > curH + 20) {
            // Respawn particle near current price or random position
            pos[idx] = Math.random() < 0.6 ? curW * 0.65 + (Math.random() - 0.5) * 200 : Math.random() * curW;
            pos[idx + 1] = Math.random() < 0.6 ? currentPriceY + (Math.random() - 0.5) * 80 : Math.random() * curH;
            vel[idx] = (Math.random() - 0.5) * 0.3;
            vel[idx + 1] = (Math.random() - 0.5) * 0.3;
            life[i] = 0;
            continue;
          }

          // Gravitational pull towards major walls
          for (let w = 0; w < targetWalls.length; w++) {
            const wall = targetWalls[w];
            const dy = wall.y - py;
            const distY = Math.abs(dy);
            if (distY < 180) {
              const pullAcc = (Math.sign(dy) * wall.force) / Math.max(12, distY * 0.3);
              vel[idx + 1] += pullAcc * 0.05;
              // Slight horizontal drift toward the orderbook depth side (right side)
              vel[idx] += 0.02;
            }
          }

          // Friction damping
          vel[idx] *= 0.97;
          vel[idx + 1] *= 0.97;

          pos[idx] += vel[idx];
          pos[idx + 1] += vel[idx + 1];
        }

        particlesGeometry.attributes.position.needsUpdate = true;
      }

      // POI Absorption Shockwave rings update
      if (showAbs && shockwavesGroupRef.current) {
        // Find interacting POIs
        const interactingPOIs = pois.filter(p => p.isInteracting);

        // Spawn a new shockwave periodically if interacting
        if (interactingPOIs.length > 0 && tickCount % 22 === 0) {
          const targetPOI = interactingPOIs[Math.floor(Math.random() * interactingPOIs.length)];
          const ringY = priceToY(targetPOI.price, minP, maxP, curH);

          const ringGeom = new THREE.RingGeometry(4, 7, 32);
          const isBull = targetPOI.side === 'bullish' || targetPOI.type === 'VAL' || targetPOI.type === 'POC';
          const ringMat = new THREE.MeshBasicMaterial({
            color: isBull ? 0x00f3ff : 0xff9900,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          });

          const ringMesh = new THREE.Mesh(ringGeom, ringMat);
          ringMesh.position.set(curW * 0.72, ringY, 5);
          (ringMesh as any).userData = { scale: 1, maxScale: 8 + Math.random() * 4, age: 0 };
          shockwavesGroupRef.current.add(ringMesh);
        }

        // Animate existing rings
        for (let i = shockwavesGroupRef.current.children.length - 1; i >= 0; i--) {
          const ring = shockwavesGroupRef.current.children[i] as THREE.Mesh;
          const uData = (ring as any).userData;
          uData.age++;
          uData.scale += 0.28;
          ring.scale.set(uData.scale, uData.scale, 1);

          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, 0.9 * (1 - uData.scale / uData.maxScale));

          if (uData.scale >= uData.maxScale) {
            shockwavesGroupRef.current.remove(ring);
            ring.geometry.dispose();
            mat.dispose();
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-15 overflow-hidden"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
