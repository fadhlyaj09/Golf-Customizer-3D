
'use client';

import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Decal as DreiDecal, Text, useTexture } from '@react-three/drei';
import type { Decal } from '@/lib/types';

// Custom Shader Material for Golf Ball Dimples
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) { 
    const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857; // 1.0/7.0
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  uniform float u_time;
  uniform float u_scale;

  void main() {
    vNormal = normal;
    vPosition = position;
    
    float noise = snoise(position * u_scale);
    vec3 newPosition = position + normal * noise * 0.035;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform vec3 u_color;
  
  void main() {
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diffuse = max(dot(norm, lightDir), 0.0);
    
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

    vec3 ambient = vec3(0.4);
    vec3 finalColor = ambient + diffuse * u_color + vec3(0.7) * spec;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface GolfBallCanvasProps {
  ballColor: string;
  decals: Decal[];
  activeDecalId: string | null;
  setActiveDecalId: (id: string | null) => void;
}

function GolfBall({ ballColor, decals, activeDecalId, setActiveDecalId }: Omit<GolfBallCanvasProps, 'onCanvasReady'>) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(() => ({
    u_time: { value: 0.0 },
    u_color: { value: new THREE.Color(ballColor) },
    u_scale: { value: 40.0 }
  }), [ballColor]);

  useFrame((state) => {
    if (meshRef.current) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.u_time.value = state.clock.getElapsedTime();
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setActiveDecalId(null);
  };

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} castShadow />
      
      <mesh ref={meshRef} onPointerDown={handlePointerDown} castShadow>
        <icosahedronGeometry args={[0.5, 8]} /> 
        <shaderMaterial
          key={THREE.ShaderMaterial.key}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
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
            <meshStandardMaterial
                polygonOffset
                polygonOffsetFactor={-10}
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

export function GolfBallCanvas({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
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
      <GolfBall 
        ballColor={ballColor}
        decals={decals}
        activeDecalId={activeDecalId}
        setActiveDecalId={setActiveDecalId}
      />
      <OrbitControls minDistance={1.2} maxDistance={3} enablePan={false} />
    </Canvas>
  );
}
