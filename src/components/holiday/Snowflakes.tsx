'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SnowflakeProps {
  count?: number;
}

export function Snowflakes({ count = 200 }: SnowflakeProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random positions and speeds
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const randoms = new Float32Array(count); // For random movement variation

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20; // x
      positions[i * 3 + 1] = Math.random() * 20 - 10; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z

      speeds[i] = Math.random() * 0.05 + 0.02;
      randoms[i] = Math.random();
    }

    return { positions, speeds, randoms };
  }, [count]);

  // Generate a soft circular texture for the snowflakes
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Update Y position (falling)
      positions[i * 3 + 1] -= particles.speeds[i];

      // Reset if below bottom
      if (positions[i * 3 + 1] < -10) {
        positions[i * 3 + 1] = 10;
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }

      // Add gentle sway (wind)
      positions[i * 3] += Math.sin(time * 0.5 + particles.randoms[i] * 10) * 0.01;
      positions[i * 3 + 2] += Math.cos(time * 0.3 + particles.randoms[i] * 10) * 0.01;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4} // Slightly increased size for visibility
        color="#ffffff"
        map={texture} // Apply the soft texture
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        alphaTest={0.01} // Helps with transparency edges
      />
    </points>
  );
}
