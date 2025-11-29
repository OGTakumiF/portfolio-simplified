import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, MeshReflectorMaterial, Cylinder, Box, Sphere, OrbitControls, RoundedBox, Loader } from '@react-three/drei';
import * as THREE from 'three';

// --- DATA ---
const sections = [
  { id: 'engineering', title: 'Engineering', color: '#06b6d4', description: "Infrastructure & Rail Systems" },
  { id: 'music', title: 'Music', color: '#ec4899', description: "Violin, Vocals & Production" },
  { id: 'psychology', title: 'Psychology', color: '#f87171', description: "Mentorship & Human Behavior" },
  { id: 'motorsports', title: 'Motorsports', color: '#fbbf24', description: "Vehicle Dynamics & Racing" },
  { id: 'archery', title: 'Archery', color: '#34d399', description: "Focus & Discipline" },
  { id: 'achievements', title: 'Awards', color: '#a78bfa', description: "Honours & Certifications" },
];

// --- COMPONENTS ---

// 1. The Reflective Floor
function NeonFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={60}
        roughness={0.5}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#151520"
        metalness={0.8}
        mirror={0.7}
      />
    </mesh>
  );
}

// 2. The Navigation Signpost
function SignPost({ activeId, onSectionSelect }: { activeId: string | null, onSectionSelect: (id: string, pos: THREE.Vector3) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={[-6, 0, 2]} rotation={[0, 0.3, 0]}>
      {/* The Pole */}
      <Cylinder args={[0.15, 0.25, 12, 16]} position={[0, 6, 0]}>
        <meshStandardMaterial color="#2d2d3a" roughness={0.4} />
      </Cylinder>
      {/* Concrete Base */}
      <Box args={[1.5, 0.5, 1.5]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#1f1f23" />
      </Box>

      {/* Street Lamps on the Pole */}
      <group position={[0, 9, 0]}>
        <Box args={[3, 0.1, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#333" />
        </Box>
        <pointLight position={[-1.4, -0.5, 0]} distance={8} intensity={3} color="#d946ef" />
        <Sphere args={[0.4]} position={[-1.4, -0.5, 0]}>
          <meshStandardMaterial emissive="#d946ef" emissiveIntensity={2} color="#000" />
        </Sphere>
        <pointLight position={[1.4, -0.5, 0]} distance={8} intensity={3} color="#06b6d4" />
        <Sphere args={[0.4]} position={[1.4, -0.5, 0]}>
          <meshStandardMaterial emissive="#06b6d4" emissiveIntensity={2} color="#000" />
        </Sphere>
      </group>

      {/* The Signs */}
      {sections.map((section, idx) => {
        const isLeft = idx % 2 === 0;
        const yPos = 7.5 - idx * 1.1;
        const xOffset = isLeft ? -0.8 : 0.8;
        const rotY = isLeft ? -0.1 : 0.1;

        return (
          <group 
            key={section.id} 
            position={[0, yPos, 0]} 
            onClick={(e) => {
              e.stopPropagation();
              const worldPos = new THREE.Vector3(0, yPos, 0).applyMatrix4(groupRef.current!.matrixWorld);
              onSectionSelect(section.id, worldPos);
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
              <group position={[xOffset * 1.2, 0, 0]} rotation={[0, rotY, 0]}>
                <RoundedBox args={[2.8, 0.8, 0.1]} radius={0.05} smoothness={4}>
                  <meshStandardMaterial 
                    color="#1a1a2e" 
                    emissive={activeId === section.id ? section.color : '#000'}
                    emissiveIntensity={activeId === section.id ? 0.5 : 0}
                  />
                </RoundedBox>
                <Box args={[2.9, 0.9, 0.05]} position={[0, 0, -0.04]}>
                   <meshBasicMaterial color={section.color} />
                </Box>

                {/* Text - Removed custom font to prevent loading errors */}
                <Text
                  position={[0, 0, 0.06]}
                  fontSize={0.35}
                  color={activeId === section.id ? "#fff" : section.color}
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="bold"
                >
                  {section.title.toUpperCase()}
                </Text>
              </group>
            </Float>
          </group>
        );
      })}
    </group>
  );
}

// 3. The Ramen Shop
function RamenStall() {
  return (
    <group position={[2, 0, -2]} rotation={[0, -0.4, 0]}>
      {/* Main Structure */}
      <Box args={[6, 5, 4]} position={[0, 2.5, 0]}>
        <meshStandardMaterial color="#2d2d3a" />
      </Box>
      
      {/* The Roof */}
      <Box args={[6.2, 0.2, 5]} position={[0, 5.1, 0.5]} rotation={[0.1, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Box>
      <Box args={[6, 1.5, 3]} position={[0, 6, 0.5]}>
         <meshStandardMaterial color="#111" />
      </Box>

      {/* Neon Sign */}
      <group position={[0, 6, 2.1]}>
        <Text
          fontSize={0.8}
          color="#ff00ff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#fff"
          fontWeight="bold"
        >
          SEAN'S RAMEN
          <meshBasicMaterial color="#ff00ff" toneMapped={false} />
        </Text>
        <pointLight position={[0, 0, 1]} intensity={2} color="#ff00ff" distance={5} />
      </group>

      {/* The Counter */}
      <Box args={[5.5, 1.2, 1]} position={[0, 0.6, 2.2]}>
        <meshStandardMaterial color="#5c3a21" />
      </Box>

      {/* Hanging Lanterns */}
      <group position={[0, 4.5, 2.5]}>
         <Float speed={3} rotationIntensity={0.2} floatIntensity={0.2}>
            {[-2, 0, 2].map((x, i) => (
              <Sphere key={i} args={[0.3]} position={[x, i === 1 ? -0.2 : 0, 0]}>
                 <meshStandardMaterial emissive="#fbbf24" emissiveIntensity={3} color="orange" />
                 <pointLight intensity={1} color="#fbbf24" distance={3} />
              </Sphere>
            ))}
         </Float>
      </group>

      {/* Stools */}
      <group position={[0, 0.5, 3.2]}>
        {[-1.5, 0, 1.5].map((x, i) => (
          <Cylinder key={i} args={[0.3, 0.3, 1, 16]} position={[x, 0, 0]}>
            <meshStandardMaterial color="#3f3f46" />
          </Cylinder>
        ))}
      </group>

      {/* Holographic Menu */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[3.5, 2, 2]} rotation={[0, -0.5, 0]}>
           <Box args={[2, 3, 0.1]}>
              <meshBasicMaterial color="#000" opacity={0.8} transparent />
           </Box>
           <Box args={[2.05, 3.05, 0.05]}>
              <meshBasicMaterial color="#06b6d4" />
           </Box>
           <Text position={[0, 1, 0.1]} fontSize={0.3} color="#06b6d4" fontWeight="bold">
             MENU
           </Text>
           <Text position={[0, 0, 0.1]} fontSize={0.15} color="white" maxWidth={1.8} textAlign="center">
             Click signs on left to explore...
           </Text>
        </group>
      </Float>
    </group>
  );
}

// 4. Camera Controller
function CameraRig({ targetPosition }: { targetPosition: THREE.Vector3 | null }) {
  const { camera, controls } = useThree<any>();
  
  useFrame((state, delta) => {
    // Smoothly interpolate camera position
    const defaultPos = new THREE.Vector3(0, 4, 14); 
    const focusPos = targetPosition ? new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z + 8) : defaultPos;
    
    state.camera.position.lerp(focusPos, 2 * delta);
    
    // Smooth lookAt target
    const defaultTarget = new THREE.Vector3(0, 3, 0);
    const focusTarget = targetPosition ? new THREE.Vector3(targetPosition.x + 3, targetPosition.y, 0) : defaultTarget;
    
    // Controls need to be present for this to work
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
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden">
      {/* UI Overlay for Details */}
      {activeSectionData && (
        <div className="absolute top-1/2 right-10 -translate-y-1/2 z-10 max-w-md w-full animate-fade-in pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border-2 p-8 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] pointer-events-auto" style={{ borderColor: activeSectionData.color }}>
            <h2 className="text-4xl font-bold mb-2 text-white font-mono" style={{ textShadow: `0 0 10px ${activeSectionData.color}` }}>
              {activeSectionData.title}
            </h2>
            <div className="h-1 w-20 mb-6" style={{ backgroundColor: activeSectionData.color }} />
            <p className="text-gray-300 text-lg font-mono leading-relaxed">
              {activeSectionData.description}
            </p>
            
            <div className="mt-6 text-sm text-gray-500 font-mono border-t border-gray-700 pt-4">
              {activeSectionData.id === 'engineering' && "• RailTech Champion 2024\n• LoRaWAN Safety Systems\n• Siemens Project Management"}
              {activeSectionData.id === 'music' && "• Grade 8 ABRSM\n• Classical Violin\n• Audio Engineering"}
              {activeSectionData.id === 'achievements' && "• Lean Six Sigma Green Belt\n• Best Presenter IEEE SOLI"}
              {activeSectionData.id === 'motorsports' && "• Vehicle Dynamics\n• Track Analysis"}
              {activeSectionData.id === 'psychology' && "• Certified in Psychology of Learning\n• Conflict Resolution"}
              {activeSectionData.id === 'archery' && "• Varsity Team Member\n• Half-Colours Award"}
            </div>
          </div>
        </div>
      )}

      {/* Helper Text */}
      {!activeSectionId && (
        <div className="absolute bottom-10 w-full text-center z-10 pointer-events-none">
          <p className="text-cyan-400 font-mono text-sm bg-black/50 inline-block px-4 py-2 rounded animate-pulse border border-cyan-900">
            CLICK A SIGN TO EXPLORE
          </p>
        </div>
      )}

      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 4, 14], fov: 50 }}>
        {/* Suspense is required for async Drei components. Fallback=null can hide errors, so we use no fallback for now to let it render ASAP */}
        <Suspense fallback={null}>
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 10, 40]} />

          <CameraRig targetPosition={cameraTarget} />
          <OrbitControls 
            makeDefault // Important for useThree controls access
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 - 0.05}
            minPolarAngle={Math.PI / 4}
            minDistance={8}
            maxDistance={25}
          />

          <ambientLight intensity={0.2} />
          <hemisphereLight args={['#2e022d', '#02182e', 0.5]} />

          <spotLight 
            position={[5, 10, 5]} 
            angle={0.5} 
            penumbra={0.5} 
            intensity={2} 
            color="#ff00ff" 
            castShadow 
          />
          
          <pointLight position={[-6, 8, 2]} intensity={1} color="#06b6d4" distance={15} />

          <SignPost activeId={activeSectionId} onSectionSelect={handleSectionSelect} />
          <RamenStall />
          <NeonFloor />

          {/* Background City Blocks */}
          <group position={[0, 0, -10]}>
             <Box args={[4, 15, 4]} position={[-8, 7.5, 0]}>
               <meshStandardMaterial color="#0a0a0a" />
             </Box>
             <Box args={[5, 12, 5]} position={[8, 6, 2]}>
               <meshStandardMaterial color="#0a0a0a" />
             </Box>
             {/* Simple distant windows */}
             {[...Array(10)].map((_, i) => (
                <mesh key={i} position={[-8 + (Math.random() > 0.5 ? 2.1 : -2.1), Math.random() * 12 + 2, Math.random() * 2 - 1]}>
                   <planeGeometry args={[0.2, 0.4]} />
                   <meshBasicMaterial color="#ffff00" opacity={0.5} transparent />
                </mesh>
             ))}
          </group>

        </Suspense>
      </Canvas>
      
      {/* Overlaid Loader so you see progress instead of a blank screen */}
      <Loader />
    </div>
  );
}
