'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Decal as DreiDecal, useTexture, Text } from '@react-three/drei';
import { useRef, useState } from 'react';
import type { Decal } from '@/lib/types';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useLoader } from '@react-three/fiber';

interface GolfBallCanvasProps {
  ballColor: string;
  decals: Decal[];
  setDecals: React.Dispatch<React.SetStateAction<Decal[]>>;
  activeDecalId: string | null;
  setActiveDecalId: (id: string | null) => void;
}

function GolfBall({ ballColor, decals, setDecals, activeDecalId, setActiveDecalId }: Omit<GolfBallCanvasProps, 'ballColor'> & {ballColor: string}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // For simplicity, we use a sphere geometry.
  // For a real product, you'd load a GLTF model with dimples.
  // const { nodes } = useLoader(GLTFLoader, '/golf_ball.glb');
  // const geometry = (nodes.Scene.children[0] as THREE.Mesh).geometry;


  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setActiveDecalId(null);
  };
  
  const handlePointerMissed = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.type === 'click') {
       setActiveDecalId(null);
    }
  }

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
      >
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial color={ballColor} roughness={0.4} metalness={0.1} />

        {decals.map((decal) => (
          <Sticker
            key={decal.id}
            decal={decal}
            parentMesh={meshRef}
            isActive={activeDecalId === decal.id}
            onClick={() => setActiveDecalId(decal.id)}
            onUpdate={(newProps) => setDecals(prev => prev.map(d => d.id === decal.id ? {...d, ...newProps} : d))}
          />
        ))}
      </mesh>
    </>
  );
}

function Sticker({ decal, parentMesh, isActive, onClick, onUpdate }: { 
    decal: Decal; 
    parentMesh: React.RefObject<THREE.Mesh>;
    isActive: boolean;
    onClick: () => void;
    onUpdate: (props: Partial<Decal>) => void;
}) {
    const texture = decal.type === 'logo' ? useTexture(decal.content) : null;
    const decalRef = useRef<THREE.Mesh>(null!);

    return (
         <DreiDecal
            ref={decalRef}
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            map={texture || undefined}
            onClick={(e) => { e.stopPropagation(); onClick();}}
            onPointerDown={(e) => { e.stopPropagation(); onClick();}}
        >
             <meshBasicMaterial
                // The polygonOffset helps prevent z-fighting.
                polygonOffset
                polygonOffsetFactor={-10}
                // Other material properties
                transparent
                depthTest={true}
                depthWrite={false}
                toneMapped={false}
              />

            {decal.type === 'text' && (
                 <Text
                    font="/fonts/Roboto-Bold.ttf"
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

export function GolfBallCanvas({ ballColor, decals, setDecals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
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
        setDecals={setDecals}
        activeDecalId={activeDecalId}
        setActiveDecalId={setActiveDecalId}
      />
      <OrbitControls minDistance={1} maxDistance={3} enablePan={false} />
    </Canvas>
  );
}