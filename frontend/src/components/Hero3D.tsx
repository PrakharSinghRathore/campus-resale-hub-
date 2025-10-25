import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Html, OrbitControls, Environment, useGLTF, Sparkles } from '@react-three/drei';

function RotatingLogo() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh>
        <torusKnotGeometry args={[1.2, 0.35, 150, 32]} />
        <meshStandardMaterial color="#5b6cff" metalness={0.4} roughness={0.2} />
      </mesh>
    </Float>
  );
}

function FloatingCards() {
  const positions = useMemo(() => [
    [-3, 1.5, -2],
    [3, 1.2, -1.5],
    [-2.2, -0.8, 0.5],
    [2.4, -1.2, 1.2],
  ] as [number, number, number][], []);

  return (
    <group>
      {positions.map((pos, idx) => (
        <Float key={idx} rotationIntensity={0.8} floatIntensity={1.2} speed={1.2 + idx * 0.2} position={pos}>
          <mesh>
            <boxGeometry args={[1.4, 0.9, 0.1]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#8b5cf6' : '#06b6d4'} metalness={0.2} roughness={0.4} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 border">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <RotatingLogo />
          <FloatingCards />
          <Sparkles count={80} size={2} speed={0.4} opacity={0.3} color="#60a5fa" scale={[10, 6, 10]} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
