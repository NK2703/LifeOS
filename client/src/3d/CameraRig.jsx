import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// The camera rig follows the character along the CatmullRomCurve.
// `scrollT`   — normalised scroll position [0, 1]
// `curve`     — shared CatmullRomCurve3 instance
export default function CameraRig({ scrollT, curve }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!curve) return;

    // Camera sits slightly behind and above the character
    const behindT = Math.max(0, scrollT - 0.04);
    const charPos = curve.getPointAt(scrollT);
    const camBase = curve.getPointAt(behindT);

    targetPos.current.set(
      camBase.x + 1.5,   // slight right offset
      camBase.y + 4,     // elevated
      camBase.z + 8      // pulled back
    );

    targetLook.current.copy(charPos).add(new THREE.Vector3(0, 1.5, 0));

    // Smooth lerp — gives cinematic feel
    camera.position.lerp(targetPos.current, 0.06);
    camera.lookAt(targetLook.current);
  });

  return null;
}
