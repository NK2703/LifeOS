import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Floating coins / particles scattered along the road
function FloatingCoins({ curve }) {
  const coinsRef = useRef([]);
  const timeRef = useRef(0);

  const coins = useMemo(() => {
    if (!curve) return [];
    const arr = [];
    for (let i = 0; i < 30; i++) {
      const t = (i / 30) * 0.9 + 0.05;
      const pt = curve.getPointAt(t);
      arr.push({
        t,
        position: new THREE.Vector3(
          pt.x + (Math.random() - 0.5) * 8,
          pt.y + 3 + Math.random() * 5,
          pt.z
        ),
        phase: Math.random() * Math.PI * 2,
        color: ['#f59e0b', '#a78bfa', '#34d399', '#60a5fa'][Math.floor(Math.random() * 4)],
      });
    }
    return arr;
  }, [curve]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    coinsRef.current.forEach((mesh, i) => {
      if (!mesh || !coins[i]) return;
      mesh.position.y = coins[i].position.y + Math.sin(timeRef.current * 1.5 + coins[i].phase) * 0.4;
      mesh.rotation.y += delta * 1.5;
    });
  });

  return (
    <group>
      {coins.map((coin, i) => (
        <mesh
          key={i}
          ref={(el) => (coinsRef.current[i] = el)}
          position={coin.position}
        >
          <cylinderGeometry args={[0.22, 0.22, 0.06, 20]} />
          <meshStandardMaterial
            color={coin.color}
            emissive={coin.color}
            emissiveIntensity={1}
            metalness={0.9}
            roughness={0.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Particle field — tiny white dots drifting upward
function ParticleField() {
  const pointsRef = useRef();
  const timeRef = useRef(0);

  const [positions, phases] = useMemo(() => {
    const N = 200;
    const pos = new Float32Array(N * 3);
    const ph = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 20 - 2;
      pos[i * 3 + 2] = Math.random() * -150;
      ph[i]          = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta * 0.4;
    if (!pointsRef.current) return;
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3 + 1] += Math.sin(timeRef.current + phases[i]) * delta * 0.3;
      if (arr[i * 3 + 1] > 18) arr[i * 3 + 1] = -2;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#c4b5fd"
        size={0.08}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

export default function Environment({ curve, theme }) {
  const isLight = theme === 'light';
  const fogColor = isLight ? '#f1f5f9' : '#090b1a'; // slate-100 for light mode
  return (
    <>
      {/* Star field backdrop */}
      {!isLight && (
        <Stars
          radius={80}
          depth={60}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
      )}

      {/* Floating coins */}
      <FloatingCoins curve={curve} />

      {/* Particle field */}
      <ParticleField />

      {/* Atmospheric fog colour */}
      <fog attach="fog" args={[fogColor, 40, 160]} />

      {/* World ambient */}
      <ambientLight color={isLight ? "#ffffff" : "#1a1040"} intensity={isLight ? 1.5 : 0.6} />

      {/* Main directional light */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={isLight ? 2.5 : 1.2}
        color={isLight ? "#ffffff" : "#a5b4fc"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={200}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      {/* Coloured accent lights */}
      <pointLight position={[-15, 8, -50]} color="#7c3aed" intensity={8} distance={40} decay={2} />
      <pointLight position={[18, 6, -90]} color="#0ea5e9" intensity={8} distance={40} decay={2} />
      <pointLight position={[-10, 6, -130]} color="#f59e0b" intensity={6} distance={30} decay={2} />
    </>
  );
}
