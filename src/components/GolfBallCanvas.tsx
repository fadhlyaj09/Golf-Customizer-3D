
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

// GLSL code for the dimple shader
const fragmentShader = `
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  // https://www.shadertoy.com/view/ll2GD3
  float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p.yx, p.xy + vec2(21.532, 23.234));
    return fract(p.x * p.y);
  }
`;

const vertexShader = `
  // https://www.shadertoy.com/view/ll2GD3
  float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p.yx, p.xy + vec2(21.532, 23.234));
    return fract(p.x * p.y);
  }

  // https://www.shadertoy.com/view/4d2XWV
  vec3 hash3(vec2 p) {
    vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)),
           dot(p, vec2(419.2, 371.9)));
    return fract(sin(q) * 43758.5453);
  }

  // https://www.shadertoy.com/view/Xl2XWy
  float pnoise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    vec2 uv = (i.xy + vec2(37.0, 17.0) * i.z) + f.xy;
    vec2 rg = texture2D(iChannel0, (uv + 0.5) / 256.0, -100.0).yx;
    
    return mix(rg.x, rg.y, f.z);
  }

  // https://www.gamedev.net/tutorials/programming/graphics/a-gentle-introduction-to-shaders-r2952/
  // The MIT License, Copyright (C) 2011 by th_pion
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
           
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
  float circle(in vec2 st, in float radius) {
    vec2 dist = st - vec2(0.5);
    return 1.0 - smoothstep(radius - (radius * 0.01), radius + (radius * 0.01), dot(dist, dist) * 4.0);
  }

  float map(vec3 p) {
    // Golf ball dimples
    // https://www.shadertoy.com/view/Xl2XWy by inigo quilez
    vec3 q = p;
    
    // Add some noise
    float f;
    f = 0.5000 * snoise(q); q = q * 2.01;
    f += 0.2500 * snoise(q); q = q * 2.02;
    f += 0.1250 * snoise(q); q = q * 2.03;
    f += 0.0625 * snoise(q);
    
    return f;
  }

  vec3 calcNormal(in vec3 p) {
    // https://www.shadertoy.com/view/Xl2XWy by inigo quilez
    vec3 n;
    vec2 e = vec2(0.001, 0.0);
    n.x = map(p + e.xyy) - map(p - e.xyy);
    n.y = map(p + e.yxy) - map(p - e.yxy);
    n.z = map(p + e.yyx) - map(p - e.yyx);
    
    return normalize(n);
  }

  // https://gist.github.com/companje/2940894
  // P is point in 3d space, a and b are points on the line
  float distToLine(vec3 p, vec3 a, vec3 b) {
    vec3 pa = p - a;
    vec3 ba = b - a;
    return length(pa - ba * dot(pa, ba) / dot(ba, ba));
  }

  float hexagon(vec2 p) {
    // https://www.shadertoy.com/view/4sBSWW
    // Remaps the space to a hexagonal grid.
    // The domain is now a set of hexagons of radius 1.0.
    vec2 q = vec2(p.x * 2.0 * 0.57735026919, p.y + p.x * 0.57735026919);
    
    vec2 pi = floor(q);
    vec2 pf = fract(q);
    
    float v = mod(pi.x + pi.y, 2.0);
    
    float ca = step(1.0, pf.x);
    float cb = step(1.0, pf.y);
    
    pf = abs(pf - 0.5);
    
    // Distance to center of hexagon
    return length(pf);
  }

  // https://www.shadertoy.com/view/MslGWN
  vec3 getHex(vec3 p) {
    vec3 q = p;
    vec3 r = vec3(0.0);
    vec3 a = vec3(0.5, 0.86602540378, 0.0);
    vec3 b = vec3(1.0, 0.0, 0.0);
    
    float size = 20.0;
    
    // Scale and generate hexagonal grid.
    // Then place a circle in each hexagon.
    p *= size;
    p.x += p.y * 0.5;
    p.y = p.y * 0.86602540378; // sqrt(3)/2
    
    vec2 i = floor(p.xy);
    vec2 f = fract(p.xy);
    
    float c1 = step(0.5, f.x);
    float c2 = step(0.5, f.y);
    
    i.x += (c1 - c2);
    f.x -= c1 - 0.5;
    f.y -= c2 - 0.5;
    
    float d = length(f);
    
    // Smooth circle
    // float c = circle(f, 0.25);
    float c = smoothstep(0.48, 0.49, d) - smoothstep(0.49, 0.5, d);
    c = 1.0 - c;
    
    // Perturb the surface normal
    // normal += c * 0.1;
    // normal = vec3(1.0);
    
    // Perturb the normals
    // float f = 1.0;
    // f = 0.5000 * snoise(q); q = q * 2.01;
    // f += 0.2500 * snoise(q); q = q * 2.02;
    // f += 0.1250 * snoise(q); q = q * 2.03;
    // f += 0.0625 * snoise(q);
    
    // normal *= f * 0.1;
    
    // vec3 hexNormal = calcNormal(vec3(p, 0.0));
    // normal *= hexNormal;
    
    vec3 q1 = vec3(0.0);
    // q.x = p.x;
    
    // p = vec3(st, 0.0);
    
    float frequency = 10.0;
    float amplitude = 0.1;
    
    vec3 pp = position;
    
    float hex = hexagon(pp.xy * frequency) * amplitude;
    // normal = vec3(hex);
    
    return normal;
  }

  void main() {
    // Hexagonal tiling
    // https://www.redblobgames.com/grids/hexagons/
    // https://gamedev.stackexchange.com/questions/112633/how-can-i-map-a-hexagonal-grid-to-a-sphere
    float scale = 30.0;
    vec3 p = position * scale;
    
    // Skew the coordinates
    mat3 m = mat3(
      1.0, 0.0, 0.0,
      -0.5, 0.866, 0.0, // 0.866 = sqrt(3)/2
      0.0, 0.0, 1.0
    );
    // p = m * p;
    
    // Round to nearest hex
    vec3 r = round(p);
    
    // Find the distance to the center of the hex
    // vec3 d = abs(p - r);
    // float dist = max(d.x, d.y, d.z);
    
    // Unskew
    mat3 m_inv = mat3(
      1.0, 0.0, 0.0,
      0.577, 1.154, 0.0, // 0.577 = 1/sqrt(3), 1.154 = 2/sqrt(3)
      0.0, 0.0, 1.0
    );
    // p = m_inv * p;
    
    // Place a circle in each hex
    // float c = circle(fract(p.xy), 0.5);
    
    // Calculate the normal for the dimples
    // https://www.shadertoy.com/view/4l2GWy
    float bumpHeight = 0.1;
    float bumpSize = 25.0;
    vec3 p2 = position * bumpSize;
    vec3 p2_i = floor(p2) + 0.5;
    vec3 p2_f = p2 - p2_i;
    float bumps = 1.0 - smoothstep(0.4, 0.5, length(p2_f.xy));
    bumps *= 1.0 - smoothstep(0.4, 0.5, length(p2_f.yz));
    bumps *= 1.0 - smoothstep(0.4, 0.5, length(p2_f.xz));
    
    // Hexagonal grid
    // https://www.shadertoy.com/view/ll2GD3
    vec2 st = position.xy;
    st.y /= 0.866;
    st.x -= st.y * 0.5;
    
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    // Remap f to the center of the hexagon
    f = f * f * (3.0 - 2.0 * f);
    if (f.x > f.y) {
      f.x = 1.0 - f.x;
    } else {
      f.y = 1.0 - f.y;
    }
    
    float d = length(f);
    
    vec3 n;
    float size = 0.5; // Radius of dimples
    float softness = 0.1; // Softness of dimples
    float depth = 0.1; // Depth of dimples
    
    // Hexagonal grid coordinates
    const vec2 s = vec2(1, 1.732);
    float scale2 = 25.0;
    vec2 a = mod(position.xy * scale2, s) - s/2.0;
    vec2 b = mod(position.xy * scale2 + s/2.0, s) - s/2.0;
    
    vec3 p_hex = dot(a,a) < dot(b,b) ? vec3(a, 0.0) : vec3(b, 1.0);
    float d_hex = length(p_hex.xy);
    
    // Dimple shape
    float dimple = 1.0 - smoothstep(size, size + softness, d_hex);
    
    // Perturb the normal
    objectNormal += dimple * depth * vec3(p_hex.xy, -1.0);
  }
`;

function GolfBall({ ballColor, decals, activeDecalId, setActiveDecalId }: GolfBallCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const onBeforeCompile = (shader: THREE.Shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
        #include <begin_vertex>
        ${vertexShader}
      `
    );
  };

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
      
      <mesh ref={meshRef} onPointerDown={handlePointerDown} castShadow receiveShadow>
        <icosahedronGeometry args={[0.5, 8]} />
        <meshStandardMaterial
          color={ballColor}
          roughness={0.4}
          metalness={0.1}
          onBeforeCompile={onBeforeCompile}
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

// Specific component for rendering Logo decals, ensuring useTexture is not called unconditionally
function LogoDecal({ decal, isActive, onClick }: { decal: Decal; isActive: boolean; onClick: () => void; }) {
    // LogoDecal no longer uses useTexture, as it relies on text-based data URI from the file upload
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

    