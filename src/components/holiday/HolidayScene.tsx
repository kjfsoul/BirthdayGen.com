'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, Stars, Cloud, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Snowflakes } from './Snowflakes';

interface HolidaySceneProps {
  className?: string;
}

export function HolidayScene({ className }: HolidaySceneProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ alpha: true, antialias: false }} // Disable antialias for postprocessing performance
        dpr={[1, 1.5]} // Limit pixel ratio for performance
        style={{ background: 'linear-gradient(to bottom, #020617, #1e1b4b, #4c1d95)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />

        {/* Environment */}
        <Environment preset="night" />

        {/* Magical Atmosphere */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <Cloud opacity={0.3} speed={0.4} bounds={[10, 2, 1.5]} segments={20} position={[0, -2, -5]} color="#a78bfa" />
          <Cloud opacity={0.3} speed={0.4} bounds={[10, 2, 1.5]} segments={20} position={[0, 5, -10]} color="#fbbf24" />
        </Float>

        {/* Floating Sparkles (The "Magic") */}
        <Sparkles count={300} scale={12} size={4} speed={0.4} opacity={0.7} color="#fbbf24" />
        <Sparkles count={200} scale={10} size={6} speed={0.3} opacity={0.5} color="#c084fc" />

        {/* Snowflakes (Improved) */}
        <Snowflakes count={200} />

        {/* Post Processing */}
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.8} radius={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>

        {/* Camera Controls (Subtle movement) */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}
