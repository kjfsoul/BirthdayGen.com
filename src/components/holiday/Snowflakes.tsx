'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SnowflakeProps {
  count?: number;
}

export function Snowflakes({ count = 100 }: SnowflakeProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const snowflakes = useMemo(() => {
    const temp: {
      position: [number, number, number];
      rotation: [number, number, number];
      scale: number;
      speed: number;
    }[] = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          Math.random() * 10 + 5,
          (Math.random() - 0.5) * 20,
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ] as [number, number, number],
        scale: Math.random() * 0.1 + 0.05,
        speed: Math.random() * 0.02 + 0.01,
      });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;

    snowflakes.forEach((snowflake, i) => {
      const matrix = new THREE.Matrix4();
      snowflake.position[1] -= snowflake.speed;

      if (snowflake.position[1] < -5) {
        snowflake.position[1] = 10;
        snowflake.position[0] = (Math.random() - 0.5) * 20;
        snowflake.position[2] = (Math.random() - 0.5) * 20;
      }

      snowflake.rotation[0] += snowflake.speed * 0.5;
      snowflake.rotation[1] += snowflake.speed * 0.3;

      matrix.makeScale(snowflake.scale, snowflake.scale, snowflake.scale);
      matrix.setPosition(...snowflake.position);
      matrix.makeRotationFromEuler(
        new THREE.Euler(...snowflake.rotation)
      );

      meshRef.current!.setMatrixAt(i, matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="white"
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
