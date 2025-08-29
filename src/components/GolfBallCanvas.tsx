
'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Decal as DreiDecal, Text } from '@react-three/drei';
import type { Decal } from '@/lib/types';


interface GolfBallCanvasProps {
  ballColor: string;
  decals: Decal[];
  activeDecalId: string | null;
  setActiveDecalId: (id: string | null) => void;
}

// Separate component for the GolfBall mesh and its logic
// This prevents re-rendering the entire canvas when only ball props change.
function GolfBall({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // This hook ensures the ball color updates efficiently without recreating the component
  useFrame(() => {
    if (meshRef.current && meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.color.set(ballColor);
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setActiveDecalId(null);
  };

  return (
      <mesh ref={meshRef} onPointerDown={handlePointerDown} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial 
            color={ballColor} 
            roughness={0.4} 
            metalness={0.1}
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
  );
}

// Parent Decal Component for conditional rendering
function BallDecal({ decal, isActive, onClick }: { 
    decal: Decal; 
    isActive: boolean;
    onClick: () => void;
}) {
    if (decal.type === 'logo' && decal.content) {
        return <LogoDecal decal={decal} isActive={isActive} onClick={onClick} />;
    }
    if (decal.type === 'text') {
        return <TextDecal decal={decal} isActive={isActive} onClick={onClick} />;
    }
    return null;
}

// Specific component for rendering Text decals
function TextDecal({ decal, isActive, onClick }: { decal: Decal; isActive: boolean; onClick: () => void; }) {
    return (
        <DreiDecal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            onPointerDown={(e) => { e.stopPropagation(); onClick(); }}
        >
            <meshStandardMaterial
                polygonOffset
                polygonOffsetFactor={-10}
                transparent
                roughness={0.6}
                toneMapped={false}
                emissive={isActive ? '#00A3FF' : '#000000'}
                emissiveIntensity={isActive ? 0.3 : 0}
            >
                <Text
                    fontSize={0.25}
                    color={decal.color || '#000000'}
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={1}
                    textAlign='center'
                >
                    {decal.content}
                </Text>
            </meshStandardMaterial>
        </DreiDecal>
    );
}

// Specific component for rendering Logo decals, ensuring useTexture is not called unconditionally
function LogoDecal({ decal, isActive, onClick }: { decal: Decal; isActive: boolean; onClick: () => void; }) {
    if (!decal.content) return null;

    const texture = new THREE.TextureLoader().load(decal.content);
    texture.colorSpace = THREE.SRGBColorSpace;

    return (
        <DreiDecal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            onPointerDown={(e) => { e.stopPropagation(); onClick(); }}
        >
            <meshStandardMaterial
                map={texture}
                map-anisotropy={16}
                polygonOffset
                polygonOffsetFactor={-10}
                transparent
                roughness={0.6}
                toneMapped={false}
                emissive={isActive ? '#00A3FF' : '#000000'}
                emissiveIntensity={isActive ? 0.3 : 0}
            />
        </DreiDecal>
    );
}


export function GolfBallCanvas(props: GolfBallCanvasProps) {
  return (
    <Canvas
      shadows
      gl={{ 
        antialias: true, 
        alpha: true,
        preserveDrawingBuffer: true 
      }}
      camera={{ position: [0, 0, 1.5], fov: 50 }}
      frameloop="demand"
    >
      <ambientLight intensity={1.2} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
       <directionalLight 
        position={[-5, -5, -5]} 
        intensity={1.0}
      />
      <GolfBall {...props} />
      <OrbitControls minDistance={1.2} maxDistance={3} enablePan={false} />
    </Canvas>
  );
}

    