'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Snowflakes } from './Snowflakes';
import { HolidayDecorations } from './HolidayDecorations';

interface HolidaySceneProps {
  className?: string;
}

export function HolidayScene({ className }: HolidaySceneProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true }}
        style={{ background: 'radial-gradient(ellipse at center, #001122 0%, #000011 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#ff4500" />

        {/* Environment */}
        <Environment preset="night" />

        {/* Snowflakes */}
        <Snowflakes count={150} />

        {/* Holiday Decorations */}
        <HolidayDecorations />

        {/* Camera Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}