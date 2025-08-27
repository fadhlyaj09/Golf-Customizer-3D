
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
  const [normalMap] = useTexture(['/golf-normal.jpg']);

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
            normalMap={normalMap}
            normalMap-anisotropy={16}
            normalScale={new THREE.Vector2(0.3, 0.3)}
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
    // FIX: Hooks cannot be called conditionally. `useTexture` must be called at the top level.
    // We pass a valid data URI for logos, or an empty string for text, which useTexture can handle.
    const texture = useTexture(decal.type === 'logo' ? decal.content : '');

    return (
         <DreiDecal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            onPointerDown={(e) => { e.stopPropagation(); onClick();}}
        >
              <meshBasicMaterial
                // Only use the texture if the decal type is 'logo'
                map={decal.type === 'logo' ? texture : undefined}
                polygonOffset
                polygonOffsetFactor={-10}
                transparent
                depthTest={true}
                depthWrite={false}
                toneMapped={false}
                opacity={1}
                // Highlight the active decal
                color={isActive ? '#87CEEB' : 'white'} 
              />

              {decal.type === 'text' && (
                  <Text
                      fontSize={0.5}
                      color={decal.color}
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
