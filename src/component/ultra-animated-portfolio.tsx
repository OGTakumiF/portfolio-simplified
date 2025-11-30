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
      lineWidth={1.5}
    />
  );
}

// --- CARS ---

function Wheel({ position, rotation, rimColor = "#888" }: any) {
  return (
    <group position={position} rotation={rotation}>
      <Cylinder args={[0.35, 0.35, 0.25, 16]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#111" />
      </Cylinder>
      {/* Rim */}
      <Cylinder args={[0.2, 0.2, 0.26, 8]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={rimColor} metalness={0.6} roughness={0.3} />
      </Cylinder>
      {/* Hub */}
      <Cylinder args={[0.05, 0.05, 0.27, 8]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#111" />
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
      <Box args={[1.82, 0.25, 4.22]} position={[0, 0.45, 0]}>
        <meshStandardMaterial color="#111" />
      </Box>
      
      {/* Cabin (Greenhouse) */}
      <group position={[0, 1.3, 0.2]}>
         {/* Main Roof Block */}
         <RoundedBox args={[1.5, 0.7, 1.8]} radius={0.1}>
            <meshStandardMaterial color="#fff" />
         </RoundedBox>
         {/* Windows (Black Glass) */}
         <Box args={[1.52, 0.55, 1.6]} position={[0, 0.05, 0]}>
            <meshStandardMaterial color="#111" roughness={0.1} />
         </Box>
      </group>

      {/* --- OPEN TRUNK (Hatchback) --- */}
      {/* Pivoted at the top roof line */}
      <group position={[0, 1.6, 1.1]} rotation={[-0.8, 0, 0]}> {/* Rotated UP */}
         {/* The Glass/Metal Hatch */}
         <Box args={[1.4, 0.1, 1.2]} position={[0, 0, 0.6]}>
            <meshStandardMaterial color="#fff" />
         </Box>
         <Box args={[1.3, 0.05, 1]} position={[0, 0.05, 0.6]}>
            <meshStandardMaterial color="#111" />
         </Box>
         {/* Struts holding it up */}
         <Cylinder args={[0.02, 0.02, 1.2]} position={[-0.6, 0.5, 0.3]} rotation={[0.5, 0, 0]}>
            <meshStandardMaterial color="#333" />
         </Cylinder>
         <Cylinder args={[0.02, 0.02, 1.2]} position={[0.6, 0.5, 0.3]} rotation={[0.5, 0, 0]}>
            <meshStandardMaterial color="#333" />
         </Cylinder>
      </group>

      {/* Trunk Interior (Visible now) */}
      <Box args={[1.4, 0.4, 1]} position={[0, 0.7, 1.5]}>
         <meshStandardMaterial color="#222" />
      </Box>

      {/* Pop-up Headlights (Closed) */}
      <Box args={[0.4, 0.05, 0.3]} position={[-0.5, 0.91, -1.8]}>
         <meshStandardMaterial color="#111" />
      </Box>
      <Box args={[0.4, 0.05, 0.3]} position={[0.5, 0.91, -1.8]}>
         <meshStandardMaterial color="#111" />
      </Box>

      {/* Tail Lights */}
      <group position={[0, 0.7, 2.1]}>
         <Box args={[1.6, 0.25, 0.1]}><meshStandardMaterial color="#111" /></Box>
         <Box args={[0.4, 0.15, 0.12]} position={[-0.5, 0, 0]}><meshStandardMaterial color="#aa0000" /></Box>
         <Box args={[0.4, 0.15, 0.12]} position={[0.5, 0, 0]}><meshStandardMaterial color="#aa0000" /></Box>
         <Box args={[0.3, 0.15, 0.12]} position={[0, 0, 0]}><meshStandardMaterial color="#ffaa00" /></Box> {/* Turn signal */}
         {/* License Plate */}
         <Box args={[0.4, 0.15, 0.12]} position={[0, -0.2, 0]}>
            <meshStandardMaterial color="#fff" />
         </Box>
      </group>

      {/* Wheels */}
      <Wheel position={[-0.75, 0.35, 1.3]} rimColor="#333" />
      <Wheel position={[0.75, 0.35, 1.3]} rimColor="#333" />
      <Wheel position={[-0.75, 0.35, -1.3]} rimColor="#333" />
      <Wheel position={[0.75, 0.35, -1.3]} rimColor="#333" />

      {/* Side Decal Text */}
      <Text 
        position={[0.92, 0.65, 0.5]} 
        rotation={[0, Math.PI / 2, 0]} 
        fontSize={0.12} 
        color="#111"
        anchorX="center"
      >
        藤原とうふ店 (自家用)
      </Text>
    </group>
  );
}

function Subaru({ position, rotation }: any) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[1.8, 0.65, 4.3]} radius={0.05} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#0044aa" metalness={0.6} roughness={0.2} />
      </RoundedBox>
      <group position={[0, 1.3, -0.3]}>
         <RoundedBox args={[1.6, 0.7, 2.4]} radius={0.15}>
            <meshStandardMaterial color="#0044aa" metalness={0.6} roughness={0.2} />
         </RoundedBox>
         <Box args={[1.62, 0.55, 2.2]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#111" roughness={0.1} />
         </Box>
      </group>
      <Box args={[0.6, 0.1, 0.6]} position={[0, 0.95, 1.2]}>
         <meshStandardMaterial color="#0044aa" />
      </Box>
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
      <group>
        <Wheel position={[-0.75, 0.35, 1.3]} rimColor="#daa520" />
        <Wheel position={[0.75, 0.35, 1.3]} rimColor="#daa520" />
        <Wheel position={[-0.75, 0.35, -1.3]} rimColor="#daa520" />
        <Wheel position={[0.75, 0.35, -1.3]} rimColor="#daa520" />
      </group>
    </group>
  );
}

// --- CHARACTER: BUNTA ---
function Bunta({ position, rotation }: any) {
  return (
    <group position={position} rotation={rotation}>
      {/* Head */}
      <Sphere args={[0.2, 16, 16]} position={[0, 1.6, 0]}>
        <meshStandardMaterial color="#e0ac69" />
      </Sphere>
      {/* Hair (Flat top/Spiky) */}
      <Cylinder args={[0.22, 0.2, 0.1]} position={[0, 1.75, 0]}>
         <meshStandardMaterial color="#222" />
      </Cylinder>

      {/* Body (Grey Shirt) */}
      <RoundedBox args={[0.5, 0.7, 0.25]} radius={0.05} position={[0, 1, 0]}>
        <meshStandardMaterial color="#777" /> {/* Grey Shirt */}
      </RoundedBox>

      {/* Apron (Dark Blue/Black) */}
      <Box args={[0.52, 0.9, 0.05]} position={[0, 0.7, 0.13]}>
         <meshStandardMaterial color="#1a1a2e" />
      </Box>
      {/* Apron String/Neck */}
      <Cylinder args={[0.15, 0.25, 0.4]} position={[0, 1.4, 0.1]} rotation={[0.2, 0, 0]}>
         <meshStandardMaterial color="#1a1a2e" />
      </Cylinder>

      {/* Arms holding Tofu Tray */}
      <group position={[0, 1, 0.2]}>
         {/* Left Arm */}
         <RoundedBox args={[0.12, 0.4, 0.12]} position={[-0.25, 0, 0.2]} rotation={[1.2, 0, -0.2]}>
            <meshStandardMaterial color="#777" />
         </RoundedBox>
         {/* Right Arm */}
         <RoundedBox args={[0.12, 0.4, 0.12]} position={[0.25, 0, 0.2]} rotation={[1.2, 0, 0.2]}>
            <meshStandardMaterial color="#777" />
         </RoundedBox>
         
         {/* The Tofu Tray */}
         <Box args={[0.7, 0.15, 0.5]} position={[0, 0, 0.5]}>
            <meshStandardMaterial color="#8b4513" /> {/* Wood Tray */}
         </Box>
         {/* Tofu Blocks inside */}
         <Box args={[0.6, 0.1, 0.4]} position={[0, 0.1, 0.5]}>
            <meshStandardMaterial color="#fff" />
         </Box>
      </group>

      {/* Legs (Dark Pants) */}
      <group position={[0, 0.35, 0]}>
         <RoundedBox args={[0.18, 0.75, 0.18]} position={[-0.15, 0, 0]}>
            <meshStandardMaterial color="#111" />
         </RoundedBox>
         <RoundedBox args={[0.18, 0.75, 0.18]} position={[0.15, 0, 0]}>
            <meshStandardMaterial color="#111" />
         </RoundedBox>
      </group>
      
      {/* Boots */}
      <Box args={[0.2, 0.15, 0.3]} position={[-0.15, -0.05, 0.05]}>
         <meshStandardMaterial color="#fff" />
      </Box>
      <Box args={[0.2, 0.15, 0.3]} position={[0.15, -0.05, 0.05]}>
         <meshStandardMaterial color="#fff" />
      </Box>
    </group>
  );
}

// --- ENVIRONMENT OBJECTS ---

function Asphalt() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#333" roughness={0.9} />
    </mesh>
  );
}

function UtilityPole({ activeId, onSectionSelect }: { activeId: string | null, onSectionSelect: (id: string, pos: THREE.Vector3) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={[-6, 0, 4]} rotation={[0, 0.5, 0]}>
      <Cylinder args={[0.2, 0.25, 12, 16]} position={[0, 6, 0]}>
        <meshStandardMaterial color="#777" roughness={0.9} />
      </Cylinder>
      
      {/* Street Light */}
      <group position={[0, 10, 0]} rotation={[0, -1.5, 0]}>
        <Box args={[3, 0.15, 0.15]} position={[1.5, 0, 0]}>
           <meshStandardMaterial color="#666" />
        </Box>
        <pointLight position={[3, -0.5, 0]} color="#aaddff" intensity={3} distance={20} />
      </group>

      {/* Signs */}
      {sections.map((section, idx) => {
        const yPos = 8 - idx * 1.1;
        return (
          <group 
            key={section.id} 
            position={[0.25, yPos, 0]} 
            onClick={(e) => {
              e.stopPropagation();
              const worldPos = new THREE.Vector3(0, yPos, 0).applyMatrix4(groupRef.current!.matrixWorld);
              onSectionSelect(section.id, worldPos);
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <Box args={[0.1, 0.8, 2.5]} position={[0.1, 0, 1.2]}>
               <meshStandardMaterial color="#fff" />
            </Box>
            <Box args={[0.11, 0.7, 2.4]} position={[0.1, 0, 1.2]}>
               <meshStandardMaterial color={section.color} />
            </Box>
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
      {/* Main Building Block */}
      <Box args={[9, 8, 7]} position={[0, 4, -1.5]}>
        <meshStandardMaterial color="#ccc" /> {/* Beige/Grey Wall */}
      </Box>

      {/* --- SHOP FRONT --- */}
      
      {/* 1. Metal Shutter Housing (Top Box) */}
      <Box args={[3.2, 0.6, 0.4]} position={[-1.5, 3.2, 2.1]}>
         <meshStandardMaterial color="#778899" metalness={0.4} /> {/* Blue-ish Grey Metal */}
      </Box>

      {/* 2. Sliding Door (Open) */}
      <group position={[-1.5, 1.5, 2]}>
         {/* Interior Void */}
         <Box args={[3, 3, 0.1]} position={[0, 0, -0.1]}>
            <meshBasicMaterial color="#000" />
         </Box>
         {/* Door Frame */}
         <Box args={[0.1, 3, 0.1]} position={[-1.5, 0, 0]}><meshStandardMaterial color="#8b4513" /></Box>
         <Box args={[0.1, 3, 0.1]} position={[1.5, 0, 0]}><meshStandardMaterial color="#8b4513" /></Box>
         <Box args={[3, 0.1, 0.1]} position={[0, 1.5, 0]}><meshStandardMaterial color="#8b4513" /></Box>
         
         {/* The Sliding Door (Pushed to the right) */}
         <group position={[0.8, 0, 0]}>
            <Box args={[1.4, 2.9, 0.05]} position={[0, 0, 0]}>
               <meshStandardMaterial color="#d4c4a8" /> {/* Paper/Wood */}
            </Box>
            <Box args={[1.4, 2.9, 0.06]} wireframe>
               <meshBasicMaterial color="#3e2723" />
            </Box>
         </group>
      </group>

      {/* 3. The Awning (Canvas Roof) */}
      <group position={[-1.5, 4, 3.2]} rotation={[0.2, 0, 0]}>
         {/* Main Sheet */}
         <Box args={[3.5, 0.1, 2.5]}>
            <meshStandardMaterial color="#f0f0f0" /> {/* White/Dirty White */}
         </Box>
         {/* Front Flap (Valence) */}
         <Box args={[3.5, 0.5, 0.1]} position={[0, -0.25, 1.25]} rotation={[-0.2, 0, 0]}>
            <meshStandardMaterial color="#f0f0f0" />
         </Box>
         
         {/* Text: Top Line */}
         <Text 
            position={[0, 0.06, 0.5]} 
            rotation={[-Math.PI/2, 0, 0]} 
            fontSize={0.2} 
            color="#222"
            font="https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFQggM.woff"
         >
            手づくりの店   とうふ 油あげ
         </Text>

         {/* Text: Front Main Line */}
         <Text 
            position={[0, -0.25, 1.31]} 
            fontSize={0.35} 
            color="#222"
            font="https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFQggM.woff"
            fontWeight="bold"
         >
            藤原 豆腐 店
         </Text>
      </group>

      {/* 4. Details */}
      {/* Drain Pipe (Left) */}
      <Cylinder args={[0.1, 0.1, 8]} position={[-4.2, 4, 2.2]}>
         <meshStandardMaterial color="#888" />
      </Cylinder>
      {/* AC Unit (Right Wall) */}
      <group position={[3, 3, 2.2]}>
         <Box args={[1.2, 1.2, 0.5]}><meshStandardMaterial color="#ddd" /></Box>
         <Cylinder args={[0.4, 0.4, 0.6, 16]} rotation={[Math.PI/2, 0, 0]}>
            <meshStandardMaterial color="#333" />
         </Cylinder>
      </group>

      {/* Side Fence/Neighbor */}
      <Box args={[0.2, 3, 6]} position={[4.5, 1.5, 1]}>
         <meshStandardMaterial color="#5c4033" />
      </Box>

    </group>
  );
}

function Wires() {
  return (
    <group>
       <Cable start={[-6, 11, 4]} end={[3, 7, -1]} v1={[-2, 9, 2]} v2={[1, 8, 0]} color="#222" />
       <Cable start={[-6, 10.5, 4]} end={[3, 6.5, -1]} v1={[-2, 8.5, 2]} v2={[1, 7.5, 0]} color="#222" />
    </group>
  );
}

function CameraRig({ targetPosition }: { targetPosition: THREE.Vector3 | null }) {
  const { camera, controls } = useThree<any>();
  
  useFrame((state, delta) => {
    // Default Angle: Looking at shop from street level, slightly left
    const defaultPos = new THREE.Vector3(-6, 2, 10); 
    const focusPos = targetPosition ? new THREE.Vector3(targetPosition.x - 3, targetPosition.y + 1, 8) : defaultPos;
    
    state.camera.position.lerp(focusPos, 2 * delta);
    
    const defaultTarget = new THREE.Vector3(1, 1.5, 0); // Target center of shop door
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
    <div className="relative w-full h-screen bg-[#222] overflow-hidden font-sans">
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

      <Canvas shadows dpr={[1, 2]} camera={{ position: [-6, 2, 10], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Environment - Cool Morning Light */}
          <Environment preset="night" environmentIntensity={0.8} />
          
          <fog attach="fog" args={['#222', 15, 50]} />
          <color attach="background" args={['#222']} />

          <CameraRig targetPosition={cameraTarget} />
          <OrbitControls 
            makeDefault
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 - 0.05}
            minPolarAngle={Math.PI / 4}
            minDistance={5}
            maxDistance={25}
          />

          {/* Morning Sun (Directional Blue-ish) */}
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={1.5} 
            color="#aaddff" 
            castShadow 
          />
          <ambientLight intensity={0.5} color="#ccddff" />

          {/* Scene Components */}
          <UtilityPole activeId={activeSectionId} onSectionSelect={handleSectionSelect} />
          <TofuShop />
          <Bunta position={[1.5, 0.25, -1]} rotation={[0, -0.2, 0]} />
          <Wires />
          
          {/* Cars - Angled for loading */}
          <AE86 position={[1.5, 0, 1.5]} rotation={[0, -2.8, 0]} />
          <Subaru position={[-5, 0, -2]} rotation={[0, 0.5, 0]} />

          <Asphalt />

          {/* Background Trees / Mountain base */}
          <group position={[0, 0, -10]}>
             <Box args={[30, 10, 5]} position={[0, 5, 0]}>
                <meshStandardMaterial color="#112211" />
             </Box>
          </group>

        </Suspense>
      </Canvas>
    </div>
  );
}
