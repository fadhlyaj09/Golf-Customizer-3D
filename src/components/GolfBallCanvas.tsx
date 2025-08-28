
'use client';

import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Decal as DreiDecal, Text, useTexture } from '@react-three/drei';
import type { Decal } from '@/lib/types';


interface GolfBallCanvasProps {
  ballColor: string;
  decals: Decal[];
  activeDecalId: string | null;
  setActiveDecalId: (id: string | null) => void;
}

function GolfBall({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const normalMap = useTexture('/textures/golf_ball_normal.jpg');

  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(4, 4); 

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setActiveDecalId(null);
  };

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={2.5}
        castShadow 
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
       <directionalLight 
        position={[-5, -5, -5]} 
        intensity={0.8}
      />
      
      <mesh ref={meshRef} onPointerDown={handlePointerDown} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 64, 64]} /> 
        <meshStandardMaterial
          color={ballColor}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.3, 0.3)}
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
    </>
  );
}

// Parent Decal Component for conditional rendering
function BallDecal({ decal, isActive, onClick }: { 
    decal: Decal; 
    isActive: boolean;
    onClick: () => void;
}) {
    if (decal.type === 'logo') {
        return <LogoDecal decal={decal} isActive={isActive} onClick={onClick} />;
    }
    return <TextDecal decal={decal} isActive={isActive} onClick={onClick} />;
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

// Specific component for rendering Logo decals, ensuring useTexture is not called conditionally
function LogoDecal({ decal, isActive, onClick }: { decal: Decal; isActive: boolean; onClick: () => void; }) {
    const texture = useTexture(decal.content || ''); // useTexture is now called unconditionally

    if (!decal.content) return null;

    return (
        <DreiDecal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            onPointerDown={(e) => { e.stopPropagation(); onClick(); }}
        >
            <meshStandardMaterial
                map={texture}
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
      onCreated={({ scene }) => {
        scene.background = null;
      }}
    >
      <GolfBall {...props} />
      <OrbitControls minDistance={1.2} maxDistance={3} enablePan={false} />
    </Canvas>
  );
}
