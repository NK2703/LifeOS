import { useMemo } from 'react';
import * as THREE from 'three';

// 8 control points create an S-shaped winding road through the world
const CONTROL_POINTS = [
  new THREE.Vector3(0,   0,   0),
  new THREE.Vector3(5,   0, -20),
  new THREE.Vector3(-4,  0, -40),
  new THREE.Vector3(8,   0, -60),
  new THREE.Vector3(-6,  0, -80),
  new THREE.Vector3(4,   0, -100),
  new THREE.Vector3(-2,  0, -120),
  new THREE.Vector3(0,   0, -140),
];

export function useRoadCurve() {
  return useMemo(() => new THREE.CatmullRomCurve3(CONTROL_POINTS, false, 'catmullrom', 0.5), []);
}

export default function Roadway() {
  const curve = useRoadCurve();

  // Road surface — tube mesh following the curve
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 200, 2.2, 8, false),
    [curve]
  );

  // Flat ground plane to fill the world
  const groundGeometry = useMemo(() => new THREE.PlaneGeometry(80, 180), []);

  // Center dashes geometry (thin rectangle lane markings)
  const dashGeometry = useMemo(() => {
    const points = [];
    const N = 100;
    for (let i = 0; i < N; i++) {
      const t0 = i / N;
      const t1 = (i + 0.4) / N;
      const p0 = curve.getPointAt(t0);
      const p1 = curve.getPointAt(t1);
      // Raise slightly above road surface
      points.push(p0.x, p0.y + 2.25, p0.z);
      points.push(p1.x, p1.y + 2.25, p1.z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [curve]);

  return (
    <group>
      {/* Ground plane */}
      <mesh
        geometry={groundGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, -70]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#0a0c1a"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Road tube */}
      <mesh geometry={tubeGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#1a1c2e"
          roughness={0.7}
          metalness={0.2}
          emissive="#1a1c2e"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Glowing road edges — two thin offset tubes */}
      <mesh geometry={new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(CONTROL_POINTS.map(p => new THREE.Vector3(p.x + 2.2, p.y, p.z))),
        200, 0.08, 6, false
      )}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh geometry={new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(CONTROL_POINTS.map(p => new THREE.Vector3(p.x - 2.2, p.y, p.z))),
        200, 0.08, 6, false
      )}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Center lane dashes */}
      <lineSegments geometry={dashGeometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </lineSegments>
    </group>
  );
}
