import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Stylised procedural "common man" character:
// body (capsule) + head (sphere) + arms (cylinders) + briefcase
export default function Character({ scrollT, curve }) {
  const groupRef = useRef();
  const bodyBobRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !curve) return;

    const t = Math.min(Math.max(scrollT, 0.001), 0.999);
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    // Position on road (slightly above tube centre)
    groupRef.current.position.set(pos.x, pos.y + 2.5, pos.z);

    // Face direction of travel
    const angle = Math.atan2(tangent.x, tangent.z);
    groupRef.current.rotation.y = angle;

    // Walking bob animation when moving
    bodyBobRef.current += delta * 6;
    const bob = Math.sin(bodyBobRef.current) * 0.08;
    groupRef.current.children[0].position.y = bob; // body bobs
  });

  return (
    <group ref={groupRef}>
      {/* ── Inner group bobs ── */}
      <group>
        {/* Body */}
        <mesh castShadow position={[0, 0.8, 0]}>
          <capsuleGeometry args={[0.28, 0.7, 8, 16]} />
          <meshStandardMaterial
            color="#6366f1"
            roughness={0.4}
            metalness={0.3}
            emissive="#4f46e5"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 1.72, 0]}>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#f5c8a0" roughness={0.6} metalness={0} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 1.92, 0]}>
          <sphereGeometry args={[0.21, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2d1b00" roughness={0.8} />
        </mesh>

        {/* Left arm */}
        <mesh castShadow position={[-0.42, 0.82, 0]} rotation={[0, 0, Math.PI / 5]}>
          <capsuleGeometry args={[0.09, 0.42, 6, 8]} />
          <meshStandardMaterial color="#6366f1" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Right arm (holds briefcase) */}
        <mesh castShadow position={[0.42, 0.82, 0]} rotation={[0, 0, -Math.PI / 5]}>
          <capsuleGeometry args={[0.09, 0.42, 6, 8]} />
          <meshStandardMaterial color="#6366f1" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Left leg */}
        <mesh castShadow position={[-0.16, 0.22, 0]}>
          <capsuleGeometry args={[0.1, 0.38, 6, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Right leg */}
        <mesh castShadow position={[0.16, 0.22, 0]}>
          <capsuleGeometry args={[0.1, 0.38, 6, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Briefcase */}
        <mesh castShadow position={[0.72, 0.54, 0]}>
          <boxGeometry args={[0.28, 0.22, 0.12]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.3}
            metalness={0.6}
            emissive="#f59e0b"
            emissiveIntensity={0.08}
          />
        </mesh>
        {/* Briefcase handle */}
        <mesh position={[0.72, 0.67, 0]}>
          <torusGeometry args={[0.07, 0.015, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#78350f" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Character glow aura */}
        <pointLight
          position={[0, 1, 0]}
          color="#818cf8"
          intensity={1.5}
          distance={4}
          decay={2}
        />
      </group>
    </group>
  );
}
