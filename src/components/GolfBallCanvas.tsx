'use client';

import React, { useRef, useEffect, Suspense } from 'react';
import * as drei from '@react-three/drei';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import type { Decal } from '@/lib/types';

// We use the drei helpers for convenience but the core logic is now more fundamental.
const { OrbitControls, Decal: DreiDecal, useTexture, Text } = drei;

interface GolfBallCanvasProps {
  ballColor: string;
  decals: Decal[];
  activeDecalId: string | null;
  setActiveDecalId: (id: string | null) => void;
}

function GolfBall({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Use a reliable, high-quality normal map for the golf ball dimples.
  // This is a standard asset from Three.js examples, ensuring it's accessible.
  const normalMap = useTexture('https://threejs.org/examples/textures/golf_ball_normal.jpg');

  const handlePointerDown = (e: any) => {
    // When clicking the ball itself, deselect any active decal.
    e.stopPropagation();
    setActiveDecalId(null);
  };

  return (
    <>
      {/* --- Lighting Setup --- */}
      <ambientLight intensity={1.8} />
      <directionalLight position={[10, 10, 5]} intensity={2.5} />
      <directionalLight position={[-10, -5, -5]} intensity={1} />
      <directionalLight position={[0, -10, 0]} intensity={0.5} />


      {/* --- Golf Ball Mesh --- */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
      >
        {/* Use SphereGeometry for the ball shape. */}
        <sphereGeometry args={[0.5, 64, 64]} />
        {/* The material gives the ball its appearance. */}
        <meshStandardMaterial
          color={ballColor}
          roughness={0.4}
          metalness={0.1}
          normalMap={normalMap} // This texture creates the dimple effect.
          normalMap-encoding={THREE.LinearEncoding} // Correct encoding for normal maps.
        />

        {/* --- Decals (Logos/Text) --- */}
        {/* Wrap in Suspense to handle asynchronous texture loading for logos. */}
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

// A component to render a single decal (logo or text)
function BallDecal({ decal, isActive, onClick }: { 
    decal: Decal; 
    isActive: boolean;
    onClick: () => void;
}) {
    // Load the texture only if it's a logo decal with content.
    const texture = (decal.type === 'logo' && decal.content) ? useTexture(decal.content) : null;

    return (
        <DreiDecal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            onPointerDown={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* The decal material itself */}
            <meshStandardMaterial
                map={texture || undefined}
                polygonOffset
                polygonOffsetFactor={-10} // Prevents visual artifacts (Z-fighting)
                transparent
                map-anisotropy={16} // Improves texture quality at sharp angles
            >
                {/* If the decal is text, render it inside the material */}
                {decal.type === 'text' && decal.content && (
                    <Text
                        fontSize={0.25} // Adjust size as needed
                        color={decal.color || '#000000'}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {decal.content}
                    </Text>
                )}
            </meshStandardMaterial>
        </DreiDecal>
    );
}


// The main canvas component that sets up the 3D scene.
export function GolfBallCanvas({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
  return (
    <Canvas
      shadows
      // Configure the WebGLRenderer as requested for transparency and export.
      gl={{ 
        antialias: true, 
        alpha: true, // For transparent background
        preserveDrawingBuffer: true // Required for exporting to image
      }}
      camera={{ position: [0, 0, 1.5], fov: 50 }}
      // Ensure scene background is null for transparency.
      onCreated={({ scene }) => {
        scene.background = null;
      }}
    >
      <GolfBall 
        ballColor={ballColor}
        decals={decals}
        activeDecalId={activeDecalId}
        setActiveDecalId={setActiveDecalId}
      />
      {/* Add OrbitControls to allow the user to rotate the ball. */}
      <OrbitControls minDistance={1.2} maxDistance={3} enablePan={false} />
    </Canvas>
  );
}
