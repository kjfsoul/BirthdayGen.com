'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function HolidayDecorations() {
  const treeRef = useRef<THREE.Mesh>(null);
  const lightsRef = useRef<THREE.InstancedMesh>(null);

  // Tree position and properties
  const treePosition: [number, number, number] = [-3, -2, -2];
  const treeScale: [number, number, number] = [1.5, 2.5, 1.5];

  // Christmas lights around the tree
  const lights = useMemo(() => {
    const temp: Array<{
      position: [number, number, number];
      color: string;
    }> = [];
    const lightCount = 20;
    for (let i = 0; i < lightCount; i++) {
      const angle = (i / lightCount) * Math.PI * 2;
      const height = (i % 3) * 0.5 + 0.5;
      const radius = 1.2 - height * 0.2;

      temp.push({
        position: [
          treePosition[0] + Math.cos(angle) * radius,
          treePosition[1] + height,
          treePosition[2] + Math.sin(angle) * radius,
        ] as [number, number, number],
        color: i % 2 === 0 ? '#ff0000' : '#00ff00', // Red and green lights
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Gentle tree sway
    if (treeRef.current) {
      treeRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
    }

    // Twinkling lights
    if (lightsRef.current) {
      lights.forEach((light, i) => {
        const matrix = new THREE.Matrix4();
        matrix.setPosition(...light.position);

        // Make lights twinkle at different rates
        const twinkle = Math.sin(time * 2 + i * 0.5) * 0.3 + 0.7;
        matrix.scale(new THREE.Vector3(twinkle, twinkle, twinkle));

        lightsRef.current!.setMatrixAt(i, matrix);
        lightsRef.current!.setColorAt(i, new THREE.Color(light.color));
      });

      lightsRef.current.instanceMatrix.needsUpdate = true;
      if (lightsRef.current.instanceColor) {
        lightsRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Christmas Tree */}
      <mesh ref={treeRef} position={treePosition} scale={treeScale}>
        <coneGeometry args={[1, 2, 8]} />
        <meshLambertMaterial color="#0f5132" />
      </mesh>

      {/* Tree trunk */}
      <mesh position={[treePosition[0], treePosition[1] - 1.5, treePosition[2]]} scale={[0.3, 1, 0.3]}>
        <cylinderGeometry args={[0.2, 0.3, 1]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Christmas Lights */}
      <instancedMesh ref={lightsRef} args={[undefined, undefined, lights.length]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshBasicMaterial />
      </instancedMesh>

      {/* Star on top */}
      <mesh position={[treePosition[0], treePosition[1] + 1.8, treePosition[2]]}>
        <octahedronGeometry args={[0.2]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}