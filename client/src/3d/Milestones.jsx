import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

// Default fallback milestones (if no track is selected)
const DEFAULT_MILESTONES = [
  { label: '🎯 Choose a Path',      t: 0.2,   color: '#a78bfa', subtext: 'Select your career from the top menu' },
  { label: '🚀 Your Journey Awaits', t: 0.6,   color: '#60a5fa', subtext: 'Pick a degree to generate your roadmap' },
];

function MilestoneSign({ label, subtext, color, t, scrollT, curve }) {
  const groupRef = useRef();
  const scaleRef = useRef(0);

  // Position along curve (raised high above road)
  const position = useMemo(() => {
    if (!curve) return new THREE.Vector3(0, 0, 0);
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    return new THREE.Vector3(
      pt.x + side.x * 5,
      pt.y + 6,
      pt.z
    );
  }, [curve, t]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Distance from character to milestone
    const dist = Math.abs(scrollT - t);
    // Scale in when within range, scale out when far past
    const targetScale = dist < 0.18 ? Math.min(1, (0.18 - dist) / 0.08) : 0;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.07);

    groupRef.current.scale.setScalar(Math.max(0, scaleRef.current));
  });

  return (
    <group ref={groupRef} position={position} scale={0}>
      <Billboard follow={false}>
        {/* Background glow panel */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[5.5, 2.2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.15}
            transparent
            opacity={0.12}
          />
        </mesh>

        {/* Border frame */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[5.7, 2.4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={0.25}
            wireframe
          />
        </mesh>

        {/* Main label */}
        <Text
          position={[0, 0.35, 0]}
          fontSize={0.62}
          color={color}
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
        >
          {label}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </Text>

        {/* Subtext */}
        <Text
          position={[0, -0.35, 0]}
          fontSize={0.32}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
        >
          {subtext}
          <meshStandardMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} />
        </Text>
      </Billboard>

      {/* Pole */}
      <mesh position={[0, -2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 4, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Milestone glow light */}
      <pointLight color={color} intensity={3} distance={8} decay={2} />
    </group>
  );
}

export default function Milestones({ scrollT, curve, milestones }) {
  const activeMilestones = milestones?.length > 0 ? milestones : DEFAULT_MILESTONES;

  return (
    <group>
      {activeMilestones.map((m) => (
        <MilestoneSign key={m.t} {...m} scrollT={scrollT} curve={curve} />
      ))}
    </group>
  );
}

