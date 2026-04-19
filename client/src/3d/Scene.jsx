import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import Roadway, { useRoadCurve } from './Roadway';
import Character from './Character';
import Milestones from './Milestones';
import CameraRig from './CameraRig';
import Environment from './Environment';

// Inner scene component — has access to R3F context
function SceneContents({ scrollT, milestones, theme }) {
  const curve = useRoadCurve();

  return (
    <>
      {/* Performance adaptors */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Environment (lights, stars, fog, particles) */}
      <Environment curve={curve} theme={theme} />

      {/* Road */}
      <Roadway theme={theme} />

      {/* The character walks along the road */}
      <Character scrollT={scrollT} curve={curve} />

      {/* Career milestone signs */}
      <Milestones scrollT={scrollT} curve={curve} milestones={milestones} />

      {/* Camera follows the character */}
      <CameraRig scrollT={scrollT} curve={curve} />
    </>
  );
}

// Fallback shown while 3D fonts/assets load
function Loading3D() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
        <p className="text-white/40 text-sm tracking-wider animate-pulse">
          Loading 3D World…
        </p>
      </div>
    </div>
  );
}

export default function Scene({ scrollT, milestones, theme }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: 3, // ACESFilmicToneMapping
        toneMappingExposure: 1.2,
      }}
      camera={{
        fov: 60,
        near: 0.1,
        far: 300,
        position: [0, 5, 12],
      }}
      style={{
        background: 'linear-gradient(180deg, #090b1a 0%, #0f0c29 50%, #090b1a 100%)',
      }}
    >
      <Suspense fallback={null}>
        <SceneContents scrollT={scrollT} milestones={milestones} theme={theme} />
      </Suspense>
    </Canvas>
  );
}
