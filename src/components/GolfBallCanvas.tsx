
'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Decal as DreiDecal, Text } from '@react-three/drei';
import type { Decal } from '@/lib/types';


interface GolfBallCanvasProps {
  ballColor: string;
  decals: Decal[];
  activeDecalId: string | null;
  setActiveDecalId: (id: string | null) => void;
}

const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        
        // Golf ball dimples simulation
        float bumpHeight = 0.05;
        float bumpSize = 20.0;
        
        vec3 p_i = floor(position * bumpSize) + 0.5;
        vec3 p_f = position * bumpSize - p_i;

        float bumps = 1.0 - smoothstep(0.45, 0.5, length(p_f.xy));
        bumps *= 1.0 - smoothstep(0.45, 0.5, length(p_f.yz));
        bumps *= 1.0 - smoothstep(0.45, 0.5, length(p_f.xz));
        
        vec3 newPosition = position + normal * bumps * bumpHeight;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 ballColor;

    void main() {
        vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
        float diffuse = max(0.0, dot(normalize(vNormal), lightDirection));
        
        vec3 viewDirection = normalize(-vPosition);
        vec3 reflectDirection = reflect(-lightDirection, normalize(vNormal));
        float specular = pow(max(0.0, dot(viewDirection, reflectDirection)), 32.0);
        
        vec3 ambientColor = ballColor * 0.4;
        vec3 diffuseColor = ballColor * diffuse;
        vec3 specularColor = vec3(1.0, 1.0, 1.0) * specular * 0.5;
        
        gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, 1.0);
    }
`;

function GolfBall({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        ballColor: { value: new THREE.Color(ballColor) }
    },
    vertexShader,
    fragmentShader,
  });

  // Update color when prop changes
  shaderMaterial.uniforms.ballColor.value.set(ballColor);


  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setActiveDecalId(null);
  };

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.0}
        castShadow
      />
      
      <mesh ref={meshRef} onPointerDown={handlePointerDown} material={shaderMaterial} castShadow receiveShadow>
        <icosahedronGeometry args={[0.5, 8]} />
        
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

    return (
        <DreiDecal
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
            onPointerDown={(e) => { e.stopPropagation(); onClick(); }}
        >
            <meshStandardMaterial
                map-anisotropy={16}
                polygonOffset
                polygonOffsetFactor={-10}
                transparent
                roughness={0.6}
                toneMapped={false}
                emissive={isActive ? '#00A3FF' : '#000000'}
                emissiveIntensity={isActive ? 0.3 : 0}
            >
              <primitive object={new THREE.TextureLoader().load(decal.content)} attach="map" />
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
