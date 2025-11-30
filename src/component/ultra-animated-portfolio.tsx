import { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Text, Float, MeshReflectorMaterial, Cylinder, Box, Sphere, 
  OrbitControls, RoundedBox, CubicBezierLine, Environment
} from '@react-three/drei';
import * as THREE from 'three';

// --- DATA ---
const sections = [
  { id: 'engineering', title: 'ENGINEERING', color: '#3b82f6', description: "Rail & Infra" },
  { id: 'music', title: 'MUSIC', color: '#ec4899', description: "Violin & Vocals" },
  { id: 'psychology', title: 'PSYCHOLOGY', color: '#ef4444', description: "Mentorship" },
  { id: 'motorsports', title: 'MOTORSPORTS', color: '#fbbf24', description: "Dynamics" },
  { id: 'archery', title: 'ARCHERY', color: '#10b981', description: "Discipline" },
  { id: 'achievements', title: 'AWARDS', color: '#8b5cf6', description: "Excellence" },
];

// --- HELPER COMPONENTS ---

function Cable({ start, end, v1, v2, color = '#111' }: any) {
  return (
    <CubicBezierLine
      start={start}
      end={end}
      midA={v1}
      midB={v2}
      color={color}
      lineWidth={2}
    />
  );
}

// --- CARS ---

function Wheel({ position, rotation }: any) {
  return (
    <group position={position} rotation={rotation}>
      <Cylinder args={[0.35, 0.35, 0.25, 16]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#111" />
      </Cylinder>
      <Cylinder args={[0.2, 0.2, 0.26, 8]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  );
}

function AE86({ position, rotation }: any) {
  return (
    <group position={position} rotation={rotation}>
      {/* --- CHASSIS --- */}
      {/* Lower Body (White) */}
      <RoundedBox args={[1.8, 0.6, 4.2]} radius={0.05} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#fff" />
      </RoundedBox>
      {/* Black Strip (Panda Scheme) */}
      <Box args={[1.82, 0.2, 4.22]} position={[0, 0.45, 0]}>
        <meshStandardMaterial color="#111" />
      </Box>
      
      {/* Cabin (Greenhouse) */}
      <group position={[0, 1.3, -0.2]}>
         <RoundedBox args={[1.6, 0.7, 2.2]} radius={0.1}>
            <meshStandardMaterial color="#fff" />
         </RoundedBox>
         {/* Windows (Black Glass) */}
         <Box args={[1.62, 0.5, 2]} position={[0, 0.05, 0]}>
            <meshStandardMaterial color="#111" roughness={0.1} />
         </Box>
      </group>

      {/* Pop-up Headlights (Closed) */}
      <Box args={[0.4, 0.05, 0.3]} position={[-0.5, 0.91, 1.8]}>
         <meshStandardMaterial color="#111" />
      </Box>
      <Box args={[0.4, 0.05, 0.3]} position={[0.5, 0.91, 1.8]}>
         <meshStandardMaterial color="#111" />
      </Box>

      {/* Tail Lights */}
      <Box args={[1.4, 0.2, 0.1]} position={[0, 0.7, -2.1]}>
         <meshStandardMaterial color="#aa0000" />
      </Box>

      {/* Wheels */}
      <Wheel position={[-0.75, 0.35, 1.3]} />
      <Wheel position={[0.75, 0.35, 1.3]} />
      <Wheel position={[-0.75, 0.35, -1.3]} />
      <Wheel position={[0.75, 0.35, -1.3]} />

      {/* Side Decal Text - Default Font to avoid loading errors */}
      <Text 
        position={[0.92, 0.7, 0.5]} 
        rotation={[0, Math.PI / 2, 0]} 
        fontSize={0.15} 
        color="#111"
        anchorX="center"
      >
        FUJIWARA TOFU
      </Text>
    </group>
  );
}

function Subaru({ position, rotation }: any) {
  return (
    <group position={position} rotation={rotation}>
      {/* Body (Blue) */}
      <RoundedBox args={[1.8, 0.65, 4.3]} radius={0.05} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#0044aa" metalness={0.6} roughness={0.2} />
      </RoundedBox>
      
      {/* Cabin */}
      <group position={[0, 1.3, -0.3]}>
         <RoundedBox args={[1.6, 0.7, 2.4]} radius={0.15}>
            <meshStandardMaterial color="#0044aa" metalness={0.6} roughness={0.2} />
         </RoundedBox>
         <Box args={[1.62, 0.55, 2.2]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#111" roughness={0.1} />
         </Box>
      </group>

      {/* Hood Scoop */}
      <Box args={[0.6, 0.1, 0.6]} position={[0, 0.95, 1.2]}>
         <meshStandardMaterial color="#0044aa" />
      </Box>

      {/* Spoiler */}
      <group position={[0, 1.1, -2]}>
         <Box args={[1.8, 0.1, 0.4]}>
            <meshStandardMaterial color="#0044aa" />
         </Box>
         <Box args={[0.1, 0.4, 0.3]} position={[-0.6, -0.2, 0]}>
            <meshStandardMaterial color="#0044aa" />
         </Box>
         <Box args={[0.1, 0.4, 0.3]} position={[0.6, -0.2, 0]}>
            <meshStandardMaterial color="#0044aa" />
         </Box>
      </group>

      {/* Gold Wheels */}
      <group>
        <Wheel position={[-0.75, 0.35, 1.3]} />
        <Cylinder args={[0.2, 0.2, 0.27, 8]} rotation={[Math.PI / 2, 0, 0]} position={[-0.75, 0.35, 1.3]}><meshStandardMaterial color="#daa520" /></Cylinder>
        <Wheel position={[0.75, 0.35, 1.3]} />
        <Cylinder args={[0.2, 0.2, 0.27, 8]} rotation={[Math.PI / 2, 0, 0]} position={[0.75, 0.35, 1.3]}><meshStandardMaterial color="#daa520" /></Cylinder>
        <Wheel position={[-0.75, 0.35, -1.3]} />
        <Cylinder args={[0.2, 0.2, 0.27, 8]} rotation={[Math.PI / 2, 0, 0]} position={[-0.75, 0.35, -1.3]}><meshStandardMaterial color="#daa520" /></Cylinder>
        <Wheel position={[0.75, 0.35, -1.3]} />
        <Cylinder args={[0.2, 0.2, 0.27, 8]} rotation={[Math.PI / 2, 0, 0]} position={[0.75, 0.35, -1.3]}><meshStandardMaterial color="#daa520" /></Cylinder>
      </group>
    </group>
  );
}

// --- ENVIRONMENT OBJECTS ---

function Asphalt() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#222" roughness={0.8} />
    </mesh>
  );
}

function GuardRail() {
  const rails = useMemo(() => {
    return [...Array(12)].map((_, i) => (
      <group key={i} position={[-8, 0.5, -15 + i * 3]}>
        {/* Post */}
        <Cylinder args={[0.1, 0.1, 1.5]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#ccc" />
        </Cylinder>
        {/* Rails */}
        <Box args={[0.2, 0.3, 3.2]} position={[0.2, 0.4, 0]}>
           <meshStandardMaterial color="#fff" />
        </Box>
      </group>
    ));
  }, []);
  return <group>{rails}</group>;
}

function UtilityPole({ activeId, onSectionSelect }: { activeId: string | null, onSectionSelect: (id: string, pos: THREE.Vector3) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={[-6, 0, 4]} rotation={[0, 0.5, 0]}>
      {/* Concrete Pole */}
      <Cylinder args={[0.2, 0.25, 12, 16]} position={[0, 6, 0]}>
        <meshStandardMaterial color="#888" roughness={0.9} />
      </Cylinder>
      
      {/* Street Light */}
      <group position={[0, 10, 0]} rotation={[0, -1.5, 0]}>
        <Box args={[3, 0.15, 0.15]} position={[1.5, 0, 0]}>
           <meshStandardMaterial color="#666" />
        </Box>
        <Box args={[0.8, 0.3, 0.4]} position={[3, -0.1, 0]}>
           <meshStandardMaterial color="#ddd" />
        </Box>
        <pointLight position={[3, -0.5, 0]} color="#ffaa55" intensity={10} distance={25} />
        <mesh position={[3, -0.25, 0]} rotation={[Math.PI, 0, 0]}>
           <coneGeometry args={[0.5, 1, 32, 1, true]} />
           <meshBasicMaterial color="#ffaa55" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Signs (Attached to pole) */}
      {sections.map((section, idx) => {
        const yPos = 8 - idx * 1.1;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isActive = activeId === section.id;

        return (
          <group 
            key={section.id} 
            position={[0.25, yPos, 0]} 
            rotation={[0, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              const worldPos = new THREE.Vector3(0, yPos, 0).applyMatrix4(groupRef.current!.matrixWorld);
              onSectionSelect(section.id, worldPos);
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            {/* Sign Plate */}
            <Box args={[0.1, 0.8, 2.5]} position={[0.1, 0, 1.2]}>
               <meshStandardMaterial color="#f0f0f0" />
            </Box>
            <Box args={[0.11, 0.7, 2.4]} position={[0.1, 0, 1.2]}>
               <meshStandardMaterial color={section.color} />
            </Box>

            {/* Text */}
            <Text
              position={[0.16, 0, 1.2]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.25}
              color="#fff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {section.title}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function TofuShop() {
  return (
    <group position={[3, 0, -3]} rotation={[0, -0.2, 0]}>
      {/* Foundation */}
      <Box args={[8, 0.5, 6]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#555" />
      </Box>

      {/* First Floor (Shop) */}
      <Box args={[7, 3.5, 5]} position={[0, 2, -0.5]}>
        <meshStandardMaterial color="#eaddcf" /> {/* Beige wall */}
      </Box>
      
      {/* Shop Front - Wood Frame */}
      <group position={[0, 1.5, 2]}>
         <Box args={[6, 3, 0.2]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#5c4033" />
         </Box>
         {/* Sliding Door 1 */}
         <Box args={[1.5, 2.5, 0.1]} position={[-1.5, 0.25, 0.1]}>
            <meshStandardMaterial color="#d4c4a8" /> {/* Paper color */}
         </Box>
         <Box args={[1.5, 2.5, 0.1]} position={[-1.5, 0.25, 0.12]} wireframe>
            <meshBasicMaterial color="#3e2723" />
         </Box>
         {/* Sliding Door 2 */}
         <Box args={[1.5, 2.5, 0.1]} position={[0.1, 0.25, 0.05]}>
            <meshStandardMaterial color="#d4c4a8" />
         </Box>
         <Box args={[1.5, 2.5, 0.1]} position={[0.1, 0.25, 0.07]} wireframe>
            <meshBasicMaterial color="#3e2723" />
         </Box>
         {/* Window */}
         <Box args={[2, 2, 0.1]} position={[2, 0.5, 0.1]}>
            <meshStandardMaterial color="#8899aa" metalness={0.5} roughness={0.1} transparent opacity={0.6} />
         </Box>
      </group>

      {/* Awning (Blue) */}
      <group position={[0, 3.2, 2.5]} rotation={[0.2, 0, 0]}>
         <Box args={[6.5, 0.1, 1.5]}>
            <meshStandardMaterial color="#1e3a8a" />
         </Box>
         {/* Shop Sign Text */}
         <Text 
            position={[0, 0.06, 0.4]} 
            rotation={[-Math.PI/2, 0, 0]} 
            fontSize={0.3} 
            color="#fff"
            fontWeight="bold"
         >
            FUJIWARA TOFU SHOP
         </Text>
      </group>

      {/* Second Floor */}
      <Box args={[7, 3, 5]} position={[0, 5, -0.5]}>
        <meshStandardMaterial color="#eaddcf" />
      </Box>
      {/* Balcony Railing */}
      <Box args={[6.5, 0.8, 0.1]} position={[0, 4, 2]}>
         <meshStandardMaterial color="#333" />
      </Box>
      {/* Roof */}
      <group position={[0, 6.5, 0]}>
         <Box args={[7.5, 0.2, 6]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color="#333" />
         </Box>
         <Cylinder args={[3.8, 3.8, 7.5, 3]} rotation={[0, 0, Math.PI/2]} position={[0, 0.8, 0]}>
            <meshStandardMaterial color="#444" />
         </Cylinder>
      </group>

      {/* Vending Machine */}
      <group position={[3, 1.5, 2.2]} rotation={[0, -0.3, 0]}>
         <Box args={[1, 2.2, 0.8]}>
            <meshStandardMaterial color="#fff" />
         </Box>
         <Box args={[0.8, 1.2, 0.1]} position={[0, 0.2, 0.41]}>
            <meshBasicMaterial color="#cc0000" /> {/* Coke red */}
         </Box>
         {/* Vending Machine Light */}
         <pointLight color="#fff" intensity={2} distance={5} position={[0, 0.5, 1]} />
      </group>

    </group>
  );
}

function Wires() {
  return (
    <group>
       <Cable start={[-6, 11, 4]} end={[3, 6, -3]} v1={[-2, 9, 2]} v2={[1, 7, 0]} color="#111" />
       <Cable start={[-6, 10.5, 4]} end={[3, 5.5, -3]} v1={[-2, 8.5, 2]} v2={[1, 6.5, 0]} color="#111" />
    </group>
  );
}

function CameraRig({ targetPosition }: { targetPosition: THREE.Vector3 | null }) {
  const { camera, controls } = useThree<any>();
  
  useFrame((state, delta) => {
    const defaultPos = new THREE.Vector3(-8, 3, 12); 
    const focusPos = targetPosition ? new THREE.Vector3(targetPosition.x - 3, targetPosition.y + 1, 8) : defaultPos;
    
    state.camera.position.lerp(focusPos, 2 * delta);
    
    const defaultTarget = new THREE.Vector3(0, 2, 0);
    const focusTarget = targetPosition ? new THREE.Vector3(targetPosition.x, targetPosition.y, 0) : defaultTarget;
    
    if (controls) {
      controls.target.lerp(focusTarget, 2 * delta);
      controls.update();
    }
  });

  return null;
}

export default function FujiwaraScene() {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);

  const handleSectionSelect = (id: string, worldPos: THREE.Vector3) => {
    if (activeSectionId === id) {
      setActiveSectionId(null);
      setCameraTarget(null);
    } else {
      setActiveSectionId(id);
      setCameraTarget(worldPos);
    }
  };

  const activeSectionData = sections.find(s => s.id === activeSectionId);

  return (
    <div className="relative w-full h-screen bg-[#111] overflow-hidden font-sans">
      {/* UI Overlay */}
      {activeSectionData && (
        <div className="absolute top-1/2 right-4 md:right-20 -translate-y-1/2 z-10 max-w-sm md:max-w-md w-full animate-fade-in pointer-events-none">
          <div 
            className="bg-black/80 backdrop-blur-xl border-l-4 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto transition-all" 
            style={{ borderColor: activeSectionData.color }}
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white tracking-tighter" style={{ textShadow: `0 0 20px ${activeSectionData.color}` }}>
              {activeSectionData.title}
            </h2>
            <div className="text-gray-300 text-lg leading-relaxed font-light border-t border-gray-800 pt-4">
              {activeSectionData.id === 'engineering' && (
                <ul className="space-y-2 list-disc pl-4 marker:text-cyan-500">
                  <li>RailTech Grand Challenge <strong>Champion</strong> (2024)</li>
                  <li>Designed <strong>LoRaWAN</strong> Tunnel Safety Tracker</li>
                  <li>Project Management Intern at <strong>Siemens AG</strong></li>
                  <li>Published researcher (ICCAR, IEEE SOLI)</li>
                </ul>
              )}
              {activeSectionData.id === 'music' && (
                <ul className="space-y-2 list-disc pl-4 marker:text-pink-500">
                  <li><strong>ABRSM Grade 8</strong> Music Theory</li>
                  <li>Trained Classical Violinist</li>
                  <li>Vocal performance & Audio Engineering</li>
                </ul>
              )}
              {activeSectionData.id === 'achievements' && (
                <ul className="space-y-2 list-disc pl-4 marker:text-purple-500">
                  <li><strong>Lean Six Sigma</strong> Green Belt</li>
                  <li>Best Presenter Award (IEEE SOLI)</li>
                  <li>SAF Ammunition Reliability Officer</li>
                </ul>
              )}
              {!['engineering', 'music', 'achievements'].includes(activeSectionData.id) && (
                <p>{activeSectionData.description} - Details coming soon.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!activeSectionId && (
        <div className="absolute bottom-12 w-full text-center z-10 pointer-events-none">
          <p className="text-white/50 text-xs tracking-[0.3em] uppercase animate-pulse">
            Scroll to rotate • Click signs on pole
          </p>
        </div>
      )}

      <Canvas shadows dpr={[1, 2]} camera={{ position: [-8, 3, 12], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="night" environmentIntensity={0.8} />
          
          {/* Pushed fog further back so scene isn't hidden */}
          <fog attach="fog" args={['#111', 30, 90]} />
          <color attach="background" args={['#111']} />

          <CameraRig targetPosition={cameraTarget} />
          <OrbitControls 
            makeDefault
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 - 0.05}
            minPolarAngle={Math.PI / 4}
            minDistance={5}
            maxDistance={25}
          />

          {/* Moonlight - Strong Directional Light */}
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={2} 
            color="#aaddff" 
            castShadow 
          />
          {/* Ambient Fill */}
          <ambientLight intensity={0.8} color="#444" />

          {/* Scene Components */}
          <UtilityPole activeId={activeSectionId} onSectionSelect={handleSectionSelect} />
          <TofuShop />
          <Wires />
          
          {/* Cars */}
          <AE86 position={[0, 0, 1]} rotation={[0, -0.4, 0]} />
          <Subaru position={[-4, 0, -1]} rotation={[0, 0.3, 0]} />

          <Asphalt />
          <GuardRail />

          {/* Mountain Silhouette */}
          <group position={[0, 0, -20]}>
             <mesh position={[0, 5, 0]}>
                <planeGeometry args={[60, 20]} />
                <meshBasicMaterial color="#050505" />
             </mesh>
          </group>

        </Suspense>
      </Canvas>
    </div>
  );
}
