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
  
  // Load the normal map texture from the public directory.
  // This is the most reliable way to avoid CORS and loading issues.
  const normalMap = useTexture('/textures/golf_ball_normal.jpg');

  // Ensure the texture repeats correctly over the sphere
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(4, 4); // Adjust this value to control dimple density

  useFrame((state, delta) => {
    // Optional: Add a slow rotation for presentation
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
          normalScale={new THREE.Vector2(0.3, 0.3)} // Adjust the strength of the dimples
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


function BallDecal({ decal, isActive, onClick }: { 
    decal: Decal; 
    isActive: boolean;
    onClick: () => void;
}) {
    const texture = useMemo(() => {
        if (decal.type === 'logo' && decal.content) {
            return new THREE.TextureLoader().load(decal.content);
        }
        return null;
    }, [decal.type, decal.content]);

    return (
        <DreiDecal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            onPointerDown={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* The material for the decal */}
            <meshStandardMaterial
                polygonOffset
                polygonOffsetFactor={-10} // Prevents z-fighting
                transparent
                roughness={0.6}
                toneMapped={false}
                map={texture}
                emissive={isActive ? '#00A3FF' : '#000000'}
                emissiveIntensity={isActive ? 0.3 : 0}
            >
                {decal.type === 'text' && decal.content && (
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
                )}
            </meshStandardMaterial>
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
