import { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Text, Float, MeshReflectorMaterial, Cylinder, Box, Sphere, 
  OrbitControls, RoundedBox, CubicBezierLine, Environment, Instance, Instances
} from '@react-three/drei';
import * as THREE from 'three';

// --- DATA ---
const sections = [
  { id: 'engineering', title: 'ENGINEERING', color: '#22d3ee', description: "Rail & Infra" },
  { id: 'music', title: 'MUSIC', color: '#f472b6', description: "Violin & Vocals" },
  { id: 'psychology', title: 'PSYCHOLOGY', color: '#f87171', description: "Mentorship" },
  { id: 'motorsports', title: 'MOTORSPORTS', color: '#fbbf24', description: "Dynamics" },
  { id: 'archery', title: 'ARCHERY', color: '#34d399', description: "Discipline" },
  { id: 'achievements', title: 'AWARDS', color: '#a78bfa', description: "Excellence" },
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

// "Fake Bloom" Sprite - Adds a soft glow aura behind lights
function Glow({ color, scale = 1, opacity = 0.5 }: { color: string, scale?: number, opacity?: number }) {
  return (
    <mesh>
      <planeGeometry args={[scale, scale]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      >
        {/* Simple gradient texture created programmatically would be ideal, 
            but using a high-opacity center circle works for "bloom" */}
      </meshBasicMaterial>
    </mesh>
  );
}

function Steam() {
  const steamRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (steamRef.current) {
      steamRef.current.children.forEach((child: any, i) => {
        child.position.y += 0.005 + (i * 0.0005);
        child.position.x += Math.sin(state.clock.elapsedTime * 2 + i) * 0.002;
        child.scale.setScalar(1 + child.position.y * 0.5); // Grow as it rises
        if (child.position.y > 1.5) {
          child.position.y = 0;
          child.scale.setScalar(1);
          child.material.opacity = 0.4;
        } else {
          child.material.opacity -= 0.002;
        }
      });
    }
  });

  return (
    <group ref={steamRef} position={[0, 0.8, 0]}>
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 0.3, Math.random(), (Math.random() - 0.5) * 0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// --- CHARACTERS (IMPROVED) ---

function Human({ position, rotation = [0, 0, 0], scale = 1, role = 'observer', colors = { skin: '#ffdbac', shirt: '#333', pants: '#222' } }: any) {
  const isSitting = role === 'customer';
  
  return (
    <group position={position} rotation={rotation as any} scale={scale}>
      <group position={[0, isSitting ? 0.6 : 1, 0]}> {/* Height adjustment */}
        
        {/* Head */}
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color={colors.skin} roughness={0.5} />
        </mesh>

        {/* Chef Hat */}
        {role === 'chef' && (
          <group position={[0, 0.82, 0]}>
             <Cylinder args={[0.22, 0.2, 0.15]} position={[0, 0, 0]}><meshStandardMaterial color="#fff" /></Cylinder>
             <Cylinder args={[0.25, 0.22, 0.25]} position={[0, 0.2, 0]}><meshStandardMaterial color="#fff" /></Cylinder>
          </group>
        )}

        {/* Torso */}
        <RoundedBox args={[0.45, 0.6, 0.25]} radius={0.05} position={[0, 0.1, 0]}>
          <meshStandardMaterial color={colors.shirt} />
        </RoundedBox>

        {/* Arms */}
        <group position={[0, 0.3, 0]}>
           {/* Left Arm */}
           <group position={[-0.3, 0, 0]} rotation={[0, 0, role === 'chef' ? 0.5 : 0.1]}>
              <RoundedBox args={[0.12, 0.5, 0.12]} radius={0.05} position={[0, -0.2, 0]}>
                 <meshStandardMaterial color={colors.shirt} />
              </RoundedBox>
              <Sphere args={[0.07]} position={[0, -0.5, 0]}><meshStandardMaterial color={colors.skin} /></Sphere>
           </group>
           {/* Right Arm */}
           <group position={[0.3, 0, 0]} rotation={[0, 0, role === 'chef' ? -0.5 : -0.1]}>
              <RoundedBox args={[0.12, 0.5, 0.12]} radius={0.05} position={[0, -0.2, 0]}>
                 <meshStandardMaterial color={colors.shirt} />
              </RoundedBox>
              <Sphere args={[0.07]} position={[0, -0.5, 0]}><meshStandardMaterial color={colors.skin} /></Sphere>
           </group>
        </group>

        {/* Legs */}
        {isSitting ? (
           <group position={[0, -0.2, 0.1]}>
              {/* Thighs */}
              <RoundedBox args={[0.16, 0.4, 0.16]} position={[-0.12, 0, 0]} rotation={[-1.5, 0, 0]}><meshStandardMaterial color={colors.pants} /></RoundedBox>
              <RoundedBox args={[0.16, 0.4, 0.16]} position={[0.12, 0, 0]} rotation={[-1.5, 0, 0]}><meshStandardMaterial color={colors.pants} /></RoundedBox>
              {/* Shins (Dangling) */}
              <RoundedBox args={[0.14, 0.4, 0.14]} position={[-0.12, -0.1, 0.2]} rotation={[0.2, 0, 0]}><meshStandardMaterial color={colors.pants} /></RoundedBox>
              <RoundedBox args={[0.14, 0.4, 0.14]} position={[0.12, -0.1, 0.2]} rotation={[0.2, 0, 0]}><meshStandardMaterial color={colors.pants} /></RoundedBox>
           </group>
        ) : (
           <group position={[0, -0.2, 0]}>
              <RoundedBox args={[0.16, 0.7, 0.16]} position={[-0.12, -0.35, 0]}><meshStandardMaterial color={colors.pants} /></RoundedBox>
              <RoundedBox args={[0.16, 0.7, 0.16]} position={[0.12, -0.35, 0]}><meshStandardMaterial color={colors.pants} /></RoundedBox>
           </group>
        )}
      </group>
    </group>
  );
}

// --- SCENE OBJECTS ---

function NeonFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={80} // High reflectivity
        roughness={0.6} // Blurrier reflections
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#080808"
        metalness={0.6}
        mirror={0.7}
      />
    </mesh>
  );
}

function SignPost({ activeId, onSectionSelect }: { activeId: string | null, onSectionSelect: (id: string, pos: THREE.Vector3) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={[-5, 0, 1]} rotation={[0, 0.4, 0]}>
      <Cylinder args={[0.15, 0.15, 10, 8]} position={[0, 5, 0]}>
        <meshStandardMaterial color="#2a2a30" roughness={0.3} metalness={0.5} />
      </Cylinder>
      
      {/* Base */}
      <Box args={[1.2, 0.4, 1.2]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#111" />
      </Box>

      {/* Top Light */}
      <group position={[0, 9.8, 0]}>
        <pointLight intensity={2} color="#fff" distance={8} />
        <mesh>
           <sphereGeometry args={[0.3]} />
           <meshBasicMaterial color="#fff" />
        </mesh>
        {/* Fake Bloom Sprite */}
        <group rotation={[0, 0, 0]}>
           <mesh rotation={[0, 0, 0]}>
              <planeGeometry args={[4, 4]} />
              <meshBasicMaterial color="#fff" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
           </mesh>
        </group>
      </group>

      {/* Signs */}
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
              <Box args={[1.2, 0.08, 0.08]} position={[isLeft ? 0.6 : -0.6, 0, 0]}>
                <meshStandardMaterial color="#111" />
              </Box>

              <RoundedBox args={[2.4, 0.8, 0.1]} radius={0.02} smoothness={4}>
                <meshStandardMaterial 
                  color="#000"
                  emissive={section.color}
                  emissiveIntensity={isActive ? 0.5 : 0.1}
                  roughness={0.2}
                />
              </RoundedBox>

              {/* Glowing Border Tube */}
              <group position={[0, 0, 0]}>
                 <Box args={[2.45, 0.85, 0.08]}>
                    <meshBasicMaterial color={isActive ? "#fff" : section.color} wireframe />
                 </Box>
                 {/* Back Glow Billboard */}
                 <mesh position={[0, 0, -0.1]}>
                    <planeGeometry args={[4, 2]} />
                    <meshBasicMaterial color={section.color} transparent opacity={isActive ? 0.3 : 0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
                 </mesh>
              </group>

              <Text
                position={[0, 0, 0.06]}
                fontSize={0.25}
                color={isActive ? "#fff" : section.color}
                anchorX="center"
                anchorY="middle"
                fontWeight="900"
                letterSpacing={0.05}
              >
                {section.title}
                {isActive && <meshBasicMaterial color="#fff" toneMapped={false} />}
              </Text>
            </group>
          </group>
        );
      })}
    </group>
  );
}

function RamenStall() {
  return (
    <group position={[2.5, 0, -2]} rotation={[0, -0.5, 0]}>
      {/* Platform */}
      <Box args={[7, 0.3, 5]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#222" />
      </Box>
      
      {/* Main Box */}
      <Box args={[6, 4.5, 3.5]} position={[0, 2.5, -0.5]}>
        <meshStandardMaterial color="#333" />
      </Box>
      
      {/* Roof / Awning */}
      <group position={[0, 4.5, 1.5]} rotation={[0.1, 0, 0]}>
        <Box args={[6.4, 0.2, 2.5]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
        {/* Vents on roof */}
        <Box args={[1, 0.8, 1]} position={[1.5, 0.5, 0]}>
           <meshStandardMaterial color="#444" />
        </Box>
        <Cylinder args={[0.3, 0.3, 0.6]} position={[-1.5, 0.4, 0]}>
           <meshStandardMaterial color="#555" />
        </Cylinder>
      </group>

      {/* Main Neon Sign */}
      <group position={[0, 5.8, 1]}>
        <Box args={[5.2, 1.4, 0.2]}>
           <meshStandardMaterial color="#000" />
        </Box>
        {/* Neon Border */}
        <Box args={[5.3, 1.5, 0.1]}>
           <meshBasicMaterial color="#d946ef" toneMapped={false} />
        </Box>
        <Text
          position={[0, 0, 0.12]}
          fontSize={0.65}
          color="#ff00ff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          SEAN'S RAMEN
          <meshBasicMaterial color="#ff00ff" toneMapped={false} />
        </Text>
        {/* Sign Glow */}
        <mesh position={[0, 0, -0.5]}>
           <planeGeometry args={[8, 4]} />
           <meshBasicMaterial color="#d946ef" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <pointLight intensity={3} color="#d946ef" distance={10} decay={2} />
      </group>

      {/* Counter Area */}
      <Box args={[5.8, 1.1, 0.8]} position={[0, 0.8, 1.5]}>
        <meshStandardMaterial color="#5c4033" roughness={0.8} /> 
      </Box>
      <Box args={[6, 0.1, 1]} position={[0, 1.4, 1.5]}>
        <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
      </Box>

      {/* Noren (Curtains) */}
      <group position={[0, 4, 1.3]}>
         {[-2, -1, 0, 1, 2].map((x, i) => (
            <mesh key={i} position={[x, -0.4, 0]}>
               <planeGeometry args={[0.95, 1]} />
               <meshStandardMaterial color="#1e1e2e" side={THREE.DoubleSide} />
               <Text position={[0, 0, 0.01]} fontSize={0.5} color="#fff">
                  {['ラ', 'ー', 'メ', 'ン', '店'][i]}
               </Text>
            </mesh>
         ))}
      </group>

      {/* Lanterns */}
      <group position={[0, 3.2, 2]}>
         {[-2.2, 2.2].map((x, i) => (
            <group key={i} position={[x, 0, 0]}>
               <Cylinder args={[0.35, 0.35, 0.9, 16]}>
                  <meshStandardMaterial emissive="#f59e0b" emissiveIntensity={2} color="#f59e0b" toneMapped={false} />
               </Cylinder>
               <pointLight intensity={3} color="#f59e0b" distance={5} />
               {/* Lantern Glow */}
               <mesh>
                  <sphereGeometry args={[0.8]} />
                  <meshBasicMaterial color="#f59e0b" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
               </mesh>
            </group>
         ))}
      </group>

      {/* Bowls & Steam */}
      <group position={[0, 1.5, 1.5]}>
         {/* Interior Warm Light */}
         <pointLight position={[0, 1, -1]} intensity={2} color="#fbbf24" distance={5} /> 
         <group position={[-1, 0, 0]}>
            <Cylinder args={[0.25, 0.15, 0.25]}><meshStandardMaterial color="#111" /></Cylinder>
            <Steam />
         </group>
         <group position={[1, 0, 0]}>
            <Cylinder args={[0.25, 0.15, 0.25]}><meshStandardMaterial color="#111" /></Cylinder>
            <Steam />
         </group>
      </group>

      {/* Menu Hologram */}
      <group position={[3.2, 1.5, 1.5]} rotation={[0, -0.3, 0]}>
         <Box args={[0.1, 2.2, 1.4]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#111" />
         </Box>
         <mesh position={[-0.06, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
            <planeGeometry args={[1.2, 2]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} side={THREE.DoubleSide} />
         </mesh>
         <Text position={[-0.08, 0.8, 0]} rotation={[0, -Math.PI/2, 0]} fontSize={0.25} color="#22d3ee">MENU</Text>
         <Text position={[-0.08, 0, 0]} rotation={[0, -Math.PI/2, 0]} fontSize={0.12} color="#fff" maxWidth={1}>
            {"Ramen.....$12\nGyoza.....$6\nSake......$8\n\n[Click Signs\nto Order]"}
         </Text>
      </group>

      {/* --- CHARACTERS --- */}
      {/* 1. The Chef (Standing) */}
      <Human 
        position={[0, 1.5, 0]} 
        scale={0.9} 
        role="chef" 
        colors={{ skin: '#f5d0b0', shirt: '#fff', pants: '#222' }} 
      /> 
      
      {/* 2. The Customer (Sitting) */}
      <group position={[-1.5, 0, 2.5]}>
         {/* Stool */}
         <Cylinder args={[0.3, 0.3, 0.1, 16]} position={[0, 1, 0]}><meshStandardMaterial color="#8b0000" /></Cylinder>
         <Cylinder args={[0.05, 0.05, 1]} position={[0, 0.5, 0]}><meshStandardMaterial color="#333" /></Cylinder>
         {/* Human */}
         <Human 
            position={[0, 1.1, 0]} 
            rotation={[0, 0.5, 0]} 
            scale={0.9} 
            role="customer"
            colors={{ skin: '#8d5524', shirt: '#f59e0b', pants: '#1e3a8a' }} 
         />
      </group>

      {/* 3. Empty Stool */}
      <group position={[1.5, 0, 2.5]}>
         <Cylinder args={[0.3, 0.3, 0.1, 16]} position={[0, 1, 0]}><meshStandardMaterial color="#8b0000" /></Cylinder>
         <Cylinder args={[0.05, 0.05, 1]} position={[0, 0.5, 0]}><meshStandardMaterial color="#333" /></Cylinder>
      </group>

      {/* 4. The Observer (Standing) */}
      <Human 
        position={[-3.5, 0, 3]} 
        rotation={[0, -0.5, 0]} 
        scale={1} 
        role="observer"
        colors={{ skin: '#e0ac69', shirt: '#06b6d4', pants: '#374151' }} 
      />

    </group>
  );
}

function Wires() {
  return (
    <group>
       <Cable start={[-5, 9, 1]} end={[2.5, 5.5, -2.5]} v1={[-2, 7, 0]} v2={[0, 6, -1]} color="#222" />
       <Cable start={[-5, 8.5, 1]} end={[2.5, 5.5, -1.5]} v1={[-2, 6, 0]} v2={[0, 5, 0]} color="#222" />
       <Cable start={[0, 6, -2]} end={[5, 6, -2]} v1={[1, 4, -2]} v2={[4, 5, -2]} color="#222" />
    </group>
  );
}

function CameraRig({ targetPosition }: { targetPosition: THREE.Vector3 | null }) {
  const { camera, controls } = useThree<any>();
  
  useFrame((state, delta) => {
    const defaultPos = new THREE.Vector3(0, 3, 14); 
    const focusPos = targetPosition ? new THREE.Vector3(targetPosition.x - 2, targetPosition.y + 1, 8) : defaultPos;
    state.camera.position.lerp(focusPos, 2 * delta);
    
    const defaultTarget = new THREE.Vector3(0, 3, 0);
    const focusTarget = targetPosition ? new THREE.Vector3(targetPosition.x + 2, targetPosition.y, 0) : defaultTarget;
    
    if (controls) {
      controls.target.lerp(focusTarget, 2 * delta);
      controls.update();
    }
  });

  return null;
}

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
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans">
      {/* UI Overlay */}
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
            Scroll to rotate • Click sign to inspect
          </p>
        </div>
      )}

      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3, 14], fov: 45 }}>
        <Suspense fallback={null}>
          {/* Environment fills the darkness */}
          <Environment preset="city" environmentIntensity={0.6} />
          
          <fog attach="fog" args={['#050505', 10, 40]} />
          <color attach="background" args={['#050505']} />

          <CameraRig targetPosition={cameraTarget} />
          <OrbitControls 
            makeDefault
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 - 0.05}
            minPolarAngle={Math.PI / 3}
            minDistance={6}
            maxDistance={25}
          />

          {/* --- LIGHTING (Boosted) --- */}
          <ambientLight intensity={0.4} color="#a78bfa" />
          <hemisphereLight args={['#d946ef', '#0ea5e9', 0.5]} /> 

          {/* Main Area Spotlight */}
          <spotLight 
            position={[5, 12, 5]} 
            angle={0.45} 
            penumbra={0.5} 
            intensity={4} 
            color="#f0abfc" 
            castShadow 
          />
          {/* Signpost Fill */}
          <pointLight position={[-6, 8, 3]} intensity={3} color="#22d3ee" distance={10} />

          <SignPost activeId={activeSectionId} onSectionSelect={handleSectionSelect} />
          <RamenStall />
          <Wires />
          <NeonFloor />

          {/* Background City */}
          <group position={[0, 0, -8]}>
             <Box args={[6, 20, 6]} position={[-10, 10, 0]}>
               <meshStandardMaterial color="#111" />
             </Box>
             <Box args={[8, 18, 8]} position={[10, 9, 2]}>
               <meshStandardMaterial color="#111" />
             </Box>
             {[...Array(20)].map((_, i) => (
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
