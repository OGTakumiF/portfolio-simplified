import { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Text, Float, MeshReflectorMaterial, Cylinder, Box, Sphere, 
  OrbitControls, RoundedBox, CubicBezierLine, Instance, Instances 
} from '@react-three/drei';
import * as THREE from 'three';

// --- DATA ---
const sections = [
  { id: 'engineering', title: 'ENGINEERING', color: '#22d3ee', description: "Rail & Infra" }, // Cyan
  { id: 'music', title: 'MUSIC', color: '#f472b6', description: "Violin & Vocals" }, // Pink
  { id: 'psychology', title: 'PSYCHOLOGY', color: '#f87171', description: "Mentorship" }, // Red
  { id: 'motorsports', title: 'MOTORSPORTS', color: '#fbbf24', description: "Dynamics" }, // Amber
  { id: 'archery', title: 'ARCHERY', color: '#34d399', description: "Discipline" }, // Emerald
  { id: 'achievements', title: 'AWARDS', color: '#a78bfa', description: "Excellence" }, // Purple
];

// --- HELPER COMPONENTS ---

// 1. Cables/Wires Draping
function Cable({ start, end, v1, v2, color = '#111' }: { start: [number, number, number], end: [number, number, number], v1: [number, number, number], v2: [number, number, number], color?: string }) {
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

// 2. Rising Steam Particles
function Steam() {
  const steamRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (steamRef.current) {
      steamRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        // Move up
        mesh.position.y += 0.005 + (i * 0.0005);
        // Wiggle
        mesh.position.x += Math.sin(state.clock.elapsedTime * 2 + i) * 0.002;
        // Reset if too high
        if (mesh.position.y > 1.5) {
          mesh.position.y = 0;
          mesh.material.opacity = 0.6;
        } else {
          // Fade out as it goes up
          (mesh.material as THREE.MeshBasicMaterial).opacity -= 0.002;
        }
      });
    }
  });

  return (
    <group ref={steamRef} position={[0, 0.8, 0]}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 0.5, Math.random(), (Math.random() - 0.5) * 0.5]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// 3. Fake Glow Sprite (Billboard)
function Glow({ color, scale = 1 }: { color: string, scale?: number }) {
  return (
    <mesh position={[0, 0, -0.1]}>
      <planeGeometry args={[scale, scale]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.3} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// --- SCENE OBJECTS ---

// 1. The Reflective Floor
function NeonFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={80}
        roughness={0.4} // Smoother for more reflection
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#080808" // Pitch black floor base
        metalness={0.8}
        mirror={0.75}
      />
    </mesh>
  );
}

// 2. The Navigation Signpost (Upgraded)
function SignPost({ activeId, onSectionSelect }: { activeId: string | null, onSectionSelect: (id: string, pos: THREE.Vector3) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={[-5, 0, 1]} rotation={[0, 0.4, 0]}>
      {/* Main Pole */}
      <Cylinder args={[0.12, 0.12, 10, 8]} position={[0, 5, 0]}>
        <meshStandardMaterial color="#1f1f23" roughness={0.8} />
      </Cylinder>
      
      {/* Concrete Base */}
      <Box args={[1, 0.6, 1]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#333" />
      </Box>

      {/* Top Light Fixture */}
      <group position={[0, 9.8, 0]}>
        <Box args={[0.4, 0.5, 0.4]}>
           <meshStandardMaterial color="#111" />
        </Box>
        <pointLight intensity={2} color="#fff" distance={5} />
        <Sphere args={[0.2]} position={[0, -0.2, 0]}>
           <meshBasicMaterial color="#fff" />
        </Sphere>
      </group>

      {/* The Signs */}
      {sections.map((section, idx) => {
        const isLeft = idx % 2 === 0;
        const yPos = 8.5 - idx * 1.2;
        const xOffset = isLeft ? -0.1 : 0.1;
        const rotY = isLeft ? -0.2 : 0.2;
        const isActive = activeId === section.id;

        return (
          <group 
            key={section.id} 
            position={[xOffset, yPos, 0]} 
            rotation={[0, rotY, 0]}
            onClick={(e) => {
              e.stopPropagation();
              const worldPos = new THREE.Vector3(0, yPos, 0).applyMatrix4(groupRef.current!.matrixWorld);
              onSectionSelect(section.id, worldPos);
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <group position={[isLeft ? -1.6 : 1.6, 0, 0]}>
              {/* Connector Arm */}
              <Box args={[1.2, 0.1, 0.1]} position={[isLeft ? 0.6 : -0.6, 0, 0]}>
                <meshStandardMaterial color="#222" />
              </Box>

              {/* The Sign Box */}
              <RoundedBox args={[2.2, 0.7, 0.15]} radius={0.05} smoothness={4}>
                <meshStandardMaterial 
                  color="#000"
                  emissive={section.color}
                  emissiveIntensity={isActive ? 0.4 : 0.1}
                  roughness={0.2}
                />
              </RoundedBox>

              {/* Glowing Border */}
              <Box args={[2.25, 0.75, 0.14]}>
                 <meshBasicMaterial color={isActive ? "#fff" : section.color} wireframe />
              </Box>

              {/* Text */}
              <Text
                position={[0, 0, 0.09]}
                fontSize={0.28}
                color={isActive ? "#fff" : section.color}
                anchorX="center"
                anchorY="middle"
                fontWeight="900"
                letterSpacing={0.05}
              >
                {section.title}
                {/* Text Glow */}
                {isActive && <meshBasicMaterial color="#fff" toneMapped={false} />}
              </Text>
            </group>
          </group>
        );
      })}
    </group>
  );
}

// 3. The Detailed Ramen Shop
function RamenStall() {
  return (
    <group position={[2.5, 0, -2]} rotation={[0, -0.5, 0]}>
      {/* --- STRUCTURE --- */}
      {/* Base Platform */}
      <Box args={[7, 0.5, 5]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      {/* Main Container */}
      <Box args={[6, 4.5, 3.5]} position={[0, 2.5, -0.5]}>
        <meshStandardMaterial color="#2d2d3a" />
      </Box>
      
      {/* --- ROOF DETAIL --- */}
      {/* Awning */}
      <group position={[0, 4.2, 1.8]} rotation={[0.2, 0, 0]}>
        <Box args={[6.2, 0.2, 2]}>
          <meshStandardMaterial color="#111" />
        </Box>
        {/* Awning Stripes */}
        <Box args={[6.25, 0.21, 0.1]} position={[0, 0, 1]}>
           <meshBasicMaterial color="#d946ef" /> {/* Pink Stripe */}
        </Box>
      </group>

      {/* AC Unit / Vents on Roof */}
      <group position={[1.5, 5, -0.5]}>
         <Box args={[1.5, 1, 1.5]}>
            <meshStandardMaterial color="#444" />
         </Box>
         <Cylinder args={[0.4, 0.4, 0.2, 16]} rotation={[0, 0, Math.PI/2]} position={[0.8, 0, 0]}>
            <meshStandardMaterial color="#222" />
         </Cylinder>
      </group>

      {/* --- SIGNAGE --- */}
      {/* Main Sign Board */}
      <group position={[0, 5.5, 1]}>
        <Box args={[5, 1.2, 0.2]}>
           <meshStandardMaterial color="#000" />
        </Box>
        {/* Neon Tube Border */}
        <Box args={[5.1, 1.3, 0.15]}>
           <meshBasicMaterial color="#d946ef" />
        </Box>
        <Text
          position={[0, 0, 0.12]}
          fontSize={0.6}
          color="#ff00ff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          SEAN'S RAMEN
          <meshBasicMaterial color="#ff00ff" toneMapped={false} />
        </Text>
        {/* Backlight for Sign */}
        <pointLight intensity={3} color="#ff00ff" distance={6} decay={2} />
      </group>

      {/* --- INTERIOR/FRONT --- */}
      {/* Counter */}
      <Box args={[5.8, 1.1, 0.8]} position={[0, 0.8, 1.5]}>
        <meshStandardMaterial color="#5c3a21" /> {/* Dark Wood */}
      </Box>
      {/* Counter Top */}
      <Box args={[6, 0.1, 1]} position={[0, 1.4, 1.5]}>
        <meshStandardMaterial color="#8b5a2b" /> {/* Light Wood */}
      </Box>

      {/* Noren (Curtains) */}
      <group position={[0, 3.8, 1.3]}>
         {[-2, -1, 0, 1, 2].map((x, i) => (
            <mesh key={i} position={[x, -0.4, 0]}>
               <planeGeometry args={[0.9, 0.8]} />
               <meshStandardMaterial color="#1a1a2e" side={THREE.DoubleSide} />
               <Text position={[0, 0, 0.01]} fontSize={0.4} color="#fff">
                  {['ラ', 'ー', 'メ', 'ン', '店'][i]}
               </Text>
            </mesh>
         ))}
      </group>

      {/* Lanterns */}
      <group position={[0, 3, 2]}>
         {[-2.2, 2.2].map((x, i) => (
            <group key={i} position={[x, 0, 0]}>
               {/* Lantern Body */}
               <Cylinder args={[0.3, 0.3, 0.8, 8]}>
                  <meshStandardMaterial emissive="#fbbf24" emissiveIntensity={2} color="#fbbf24" />
               </Cylinder>
               <pointLight intensity={2} color="orange" distance={4} />
            </group>
         ))}
      </group>

      {/* --- DETAILS --- */}
      {/* Bowls on Counter */}
      <group position={[0, 1.5, 1.5]}>
         <group position={[-1, 0, 0]}>
            <Cylinder args={[0.2, 0.15, 0.2]}><meshStandardMaterial color="#111" /></Cylinder>
            <Steam />
         </group>
         <group position={[1, 0, 0]}>
            <Cylinder args={[0.2, 0.15, 0.2]}><meshStandardMaterial color="#111" /></Cylinder>
            <Steam />
         </group>
      </group>

      {/* Stools */}
      <group position={[0, 0.5, 2.5]}>
        {[-1.5, 0, 1.5].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
             <Cylinder args={[0.3, 0.3, 0.1, 16]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color="#8b0000" /> {/* Red cushion */}
             </Cylinder>
             <Cylinder args={[0.05, 0.05, 1]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#111" />
             </Cylinder>
             <Cylinder args={[0.25, 0.25, 0.05]} position={[0, -0.5, 0]}>
                <meshStandardMaterial color="#111" />
             </Cylinder>
          </group>
        ))}
      </group>

      {/* Menu Board */}
      <group position={[3.2, 1.5, 1.5]} rotation={[0, -0.2, 0]}>
         <Box args={[0.1, 2, 1.2]}>
            <meshStandardMaterial color="#000" />
         </Box>
         {/* Glowing Menu Face */}
         <mesh position={[-0.06, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
            <planeGeometry args={[1, 1.8]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} side={THREE.DoubleSide} />
         </mesh>
         <Text 
            position={[-0.07, 0.6, 0]} 
            rotation={[0, -Math.PI/2, 0]}
            fontSize={0.2} 
            color="#06b6d4"
         >
            MENU
         </Text>
         <Text 
            position={[-0.07, 0, 0]} 
            rotation={[0, -Math.PI/2, 0]}
            fontSize={0.1} 
            color="#fff"
            maxWidth={0.9}
            textAlign="center"
            lineHeight={1.5}
         >
            {"Ramen.....$12\nGyoza.....$6\nSake......$8"}
         </Text>
      </group>
    </group>
  );
}

// 4. Wires Connecting Scene
function Wires() {
  return (
    <group>
       {/* From SignPost to Shop Roof */}
       <Cable start={[-5, 9, 1]} end={[2.5, 5.5, -2.5]} v1={[-2, 7, 0]} v2={[0, 6, -1]} />
       <Cable start={[-5, 8.5, 1]} end={[2.5, 5.5, -1.5]} v1={[-2, 6, 0]} v2={[0, 5, 0]} />
       
       {/* Hanging loose wire on shop */}
       <Cable start={[0, 6, -2]} end={[5, 6, -2]} v1={[1, 4, -2]} v2={[4, 5, -2]} color="#222" />
    </group>
  );
}

// 5. Camera Controller
function CameraRig({ targetPosition }: { targetPosition: THREE.Vector3 | null }) {
  const { camera, controls } = useThree<any>();
  
  useFrame((state, delta) => {
    // Default wide view
    const defaultPos = new THREE.Vector3(0, 3, 14); 
    const focusPos = targetPosition ? new THREE.Vector3(targetPosition.x - 2, targetPosition.y + 1, 8) : defaultPos;
    
    state.camera.position.lerp(focusPos, 2 * delta);
    
    // Look target
    const defaultTarget = new THREE.Vector3(0, 3, 0);
    const focusTarget = targetPosition ? new THREE.Vector3(targetPosition.x + 2, targetPosition.y, 0) : defaultTarget;
    
    if (controls) {
      controls.target.lerp(focusTarget, 2 * delta);
      controls.update();
    }
  });

  return null;
}

// --- MAIN SCENE ---
export default function CyberpunkScene() {
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
    <div className="relative w-full h-screen bg-[#020202] overflow-hidden font-sans">
      {/* UI Overlay for Details */}
      {activeSectionData && (
        <div className="absolute top-1/2 right-4 md:right-20 -translate-y-1/2 z-10 max-w-sm md:max-w-md w-full animate-fade-in pointer-events-none">
          <div 
            className="bg-black/90 backdrop-blur-xl border-l-4 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto transition-all" 
            style={{ borderColor: activeSectionData.color }}
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white tracking-tighter" style={{ textShadow: `0 0 20px ${activeSectionData.color}` }}>
              {activeSectionData.title}
            </h2>
            <div className="text-gray-300 text-lg leading-relaxed font-light border-t border-gray-800 pt-4">
              {/* Dynamic Content based on section */}
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
              {/* Fallback for others */}
              {!['engineering', 'music', 'achievements'].includes(activeSectionData.id) && (
                <p>{activeSectionData.description} - Details coming soon.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Helper Text */}
      {!activeSectionId && (
        <div className="absolute bottom-12 w-full text-center z-10 pointer-events-none">
          <p className="text-white/50 text-xs tracking-[0.3em] uppercase animate-pulse">
            Scroll to rotate • Click sign to inspect
          </p>
        </div>
      )}

      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3, 14], fov: 45 }}>
        <Suspense fallback={null}>
          {/* FOG for depth */}
          <fog attach="fog" args={['#020202', 8, 35]} />
          <color attach="background" args={['#020202']} />

          <CameraRig targetPosition={cameraTarget} />
          <OrbitControls 
            makeDefault
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 - 0.02}
            minPolarAngle={Math.PI / 3}
            minDistance={6}
            maxDistance={20}
          />

          {/* --- LIGHTING --- */}
          <ambientLight intensity={0.2} color="#4c1d95" /> {/* Deep purple ambient */}
          <hemisphereLight args={['#d946ef', '#0ea5e9', 0.3]} /> 

          {/* Shop Highlight */}
          <spotLight 
            position={[5, 12, 5]} 
            angle={0.4} 
            penumbra={0.5} 
            intensity={3} 
            color="#f0abfc" 
            castShadow 
          />
          {/* Signpost Highlight */}
          <spotLight position={[-6, 10, 5]} angle={0.3} intensity={2} color="#22d3ee" />

          {/* --- SCENE --- */}
          <SignPost activeId={activeSectionId} onSectionSelect={handleSectionSelect} />
          <RamenStall />
          <Wires />
          <NeonFloor />

          {/* --- BACKGROUND CITY SILHOUETTE --- */}
          <group position={[0, 0, -8]}>
             <Box args={[6, 20, 6]} position={[-10, 10, 0]}>
               <meshStandardMaterial color="#050505" />
             </Box>
             <Box args={[8, 18, 8]} position={[10, 9, 2]}>
               <meshStandardMaterial color="#050505" />
             </Box>
             {/* Distant window lights */}
             {[...Array(15)].map((_, i) => (
                <mesh key={i} position={[-10 + (Math.random() > 0.5 ? 3.1 : -3.1), Math.random() * 15 + 2, Math.random() * 4 - 2]}>
                   <planeGeometry args={[0.3, 0.6]} />
                   <meshBasicMaterial color={Math.random() > 0.8 ? "#ef4444" : "#fef08a"} opacity={0.8} transparent />
                </mesh>
             ))}
          </group>

        </Suspense>
      </Canvas>
    </div>
  );
}
