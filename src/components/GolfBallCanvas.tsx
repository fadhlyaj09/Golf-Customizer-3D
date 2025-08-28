'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Decal as DreiDecal, useTexture, Text } from '@react-three/drei';
import { useRef } from 'react';
import type { Decal } from '@/lib/types';
import * as THREE from 'three';

interface GolfBallCanvasProps {
  ballColor: string;
  decals: Decal[];
  activeDecalId: string | null;
  setActiveDecalId: (id: string | null) => void;
}

function GolfBall({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setActiveDecalId(null);
  };

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <directionalLight position={[-10, -10, -5]} intensity={1} />
      
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
      >
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial 
            color={ballColor} 
            roughness={0.1} 
            metalness={0.2}
         />

        {decals.map((decal) => (
          <Sticker
            key={decal.id}
            decal={decal}
            isActive={activeDecalId === decal.id}
            onClick={() => setActiveDecalId(decal.id)}
          />
        ))}
      </mesh>
    </>
  );
}

function Sticker({ decal, isActive, onClick }: { 
    decal: Decal; 
    isActive: boolean;
    onClick: () => void;
}) {
    // Correctly handle conditional hook usage. Only call useTexture if it's a logo with content.
    const texture = (decal.type === 'logo' && decal.content) ? useTexture(decal.content) : null;

    return (
         <DreiDecal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            onPointerDown={(e) => { e.stopPropagation(); onClick();}}
        >
              <meshBasicMaterial
                map={texture || undefined}
                polygonOffset
                polygonOffsetFactor={-10}
                transparent
                depthTest={true}
                depthWrite={false}
                toneMapped={false}
                opacity={1}
                color={isActive ? '#000000' : 'white'} 
              />
              {decal.type === 'text' && (
                  <Text
                      fontSize={0.5}
                      color={decal.color}
                      font="sans-serif"
                      anchorX="center"
                      anchorY="middle"
                  >
                      {decal.content}
                  </Text>
              )}
        </DreiDecal>
    )
}

export function GolfBallCanvas({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
  return (
    <Canvas
      style={{ background: 'transparent' }}
      camera={{ position: [0, 0, 1.5], fov: 50 }}
      shadows
      gl={{ preserveDrawingBuffer: true }}
    >
      <GolfBall 
        ballColor={ballColor}
        decals={decals}
        activeDecalId={activeDecalId}
        setActiveDecalId={setActiveDecalId}
      />
      <OrbitControls minDistance={1} maxDistance={3} enablePan={false} />
    </Canvas>
  );
}
