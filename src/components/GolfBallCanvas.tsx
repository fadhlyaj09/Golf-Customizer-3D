
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Decal as DreiDecal, useTexture, Text } from '@react-three/drei';
import { useRef, Suspense } from 'react';
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
  
  const normalMap = useTexture('https://threejs.org/examples/textures/normal_map.png');

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
            roughness={0.4} 
            metalness={0.1}
            normalMap={normalMap}
            normalMap-encoding={THREE.LinearEncoding}
         />
        <Suspense fallback={null}>
          {decals.map((decal) => (
            <BallDecal
              key={decal.id}
              decal={decal}
              isActive={activeDecalId === decal.id}
              onClick={() => setActiveDecalId(decal.id)}
            />
          ))}
        </Suspense>
      </mesh>
    </>
  );
}

function BallDecal({ decal, isActive, onClick }: { 
    decal: Decal; 
    isActive: boolean;
    onClick: () => void;
}) {
    const texture = (decal.type === 'logo' && decal.content) ? useTexture(decal.content) : null;

    if (decal.type === 'text' && decal.content) {
        return (
             <DreiDecal
                position={decal.position}
                rotation={decal.rotation}
                scale={decal.scale}
                onPointerDown={(e) => { e.stopPropagation(); onClick();}}
            >
                {/* Text is rendered inside a transparent material decal */}
                <meshStandardMaterial
                    polygonOffset
                    polygonOffsetFactor={-20} // Push text forward to prevent z-fighting
                    transparent
                >
                    <Text
                        fontSize={0.25}
                        color={decal.color}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {decal.content}
                    </Text>
                </meshStandardMaterial>
            </DreiDecal>
        )
    }
    
    if (decal.type === 'logo' && texture) {
        return (
            <DreiDecal
                position={decal.position}
                rotation={decal.rotation}
                scale={decal.scale}
                onPointerDown={(e) => { e.stopPropagation(); onClick();}}
            >
                <meshStandardMaterial
                    map={texture}
                    polygonOffset
                    polygonOffsetFactor={-10}
                    transparent
                    map-anisotropy={16}
                />
            </DreiDecal>
        );
    }
    
    return null;
}

export function GolfBallCanvas({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
  return (
    <Canvas
      style={{ background: 'transparent' }}
      camera={{ position: [0, 0, 1.5], fov: 50 }}
      shadows
      gl={{ preserveDrawingBuffer: true, alpha: true }}
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
