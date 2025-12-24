import { Suspense, useRef, useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Text, Stars, OrbitControls, Environment, Sparkles, Trail, Sphere, MeshDistortMaterial, RoundedBox, Cylinder } from '@react-three/drei';
import {
  Menu, X, Zap, Music, Heart, Target, Trophy, Briefcase, ArrowRight, Sparkles as SparklesIcon, ArrowLeft, ExternalLink
} from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';

// --- SHADERS ---
const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize( normalMatrix * normal );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  uniform vec3 glowColor;
  void main() {
    float intensity = pow( 0.6 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.0 );
    gl_FragColor = vec4( glowColor, 1.0 ) * intensity * 0.8;
  }
`;

type PlanetType = 'gas' | 'rocky' | 'ringed' | 'ice';

interface Planet {
  id: string;
  title: string;
  color: string;
  darkColor: string;
  detail?: string;
  type: PlanetType;
  size: number;
}

interface Section {
  id: string;
  title: string;
  position: [number, number, number];
  color: string;
  darkColor: string;
  icon: any;
  content: {
    heading: string;
    description: string;
    planets: Planet[];
  };
}

// --- DATA: CLEAN & FOCUSED ---
const sections: Section[] = [
  {
    id: 'engineering',
    title: 'Engineering',
    position: [0, 2, 0],
    color: '#06b6d4',
    darkColor: '#164e63',
    icon: Zap,
    content: {
      heading: 'System Engineer',
      description: 'Rail & Power Systems',
      planets: [
        { id: 'p1', title: 'B.Eng (Honours)', color: '#38bdf8', darkColor: '#0c4a6e', type: 'ringed', size: 2.2, detail: "Graduated with Honours (Merit) in Sustainable Infrastructure Engineering (Land) from SIT." },
        { id: 'p2', title: 'Power Eng. Diploma', color: '#0284c7', darkColor: '#0c4a6e', type: 'rocky', size: 1.5, detail: "Diploma in Electrical Engineering (Power Specialisation) from Ngee Ann Polytechnic." },
        { id: 'p3', title: 'RailTech Champion', color: '#7dd3fc', darkColor: '#0c4a6e', type: 'gas', size: 2.5, detail: "1st Place Winner: Singapore RailTech Grand Challenge 2024 (Open Innovation)." },
        { id: 'p4', title: 'LoRaWAN Tracker', color: '#bae6fd', darkColor: '#0c4a6e', type: 'rocky', size: 1.2, detail: "Designed a safety tracking system for railway tunnels using LoRaWAN technology." },
        { id: 'p6', title: 'Siemens Internship', color: '#0369a1', darkColor: '#0c4a6e', type: 'ice', size: 1.8, detail: "Managed rail comms renewal, coordinated subcontractors, and designed PA systems." }
      ]
    }
  },
  {
    id: 'music',
    title: 'Music',
    position: [10, 2, -8],
    color: '#ec4899',
    darkColor: '#831843',
    icon: Music,
    content: {
      heading: 'Musician',
      description: 'Violin & Vocals',
      planets: [
        { id: 'm1', title: 'Violinist', color: '#f472b6', darkColor: '#831843', type: 'ringed', size: 2.0, detail: "Classically trained violinist with performance experience." },
        { id: 'm2', title: 'Vocalist', color: '#fb7185', darkColor: '#831843', type: 'gas', size: 2.4, detail: "Professional vocal training and recording experience." },
        { id: 'm5', title: 'Production', color: '#be185d', darkColor: '#831843', type: 'rocky', size: 1.4, detail: "Music production, arrangement, and audio engineering skills." },
        { id: 'm6', title: 'Grade 8 Theory', color: '#9d174d', darkColor: '#831843', type: 'ice', size: 1.8, detail: "ABRSM Grade 8 Music Theory Certification." },
      ]
    }
  },
  {
    id: 'psychology',
    title: 'Psychology',
    position: [-10, 2, -8],
    color: '#f87171',
    darkColor: '#7f1d1d',
    icon: Heart,
    content: {
      heading: 'Psychology',
      description: 'Human Behavior',
      planets: [
        { id: 'ps6', title: 'Psych of Learning', color: '#991b1b', darkColor: '#7f1d1d', type: 'ringed', size: 1.9, detail: "Certified in Psychology of Learning from FedericaX." },
        { id: 'ps2', title: 'Mentorship', color: '#f87171', darkColor: '#7f1d1d', type: 'rocky', size: 1.6, detail: "Active in community mentorship and advisory roles." },
        { id: 'ps5', title: 'Mediation', color: '#b91c1c', darkColor: '#7f1d1d', type: 'gas', size: 1.5, detail: "Skilled in conflict resolution and empathetic problem solving." },
      ]
    }
  },
  {
    id: 'motorsports',
    title: 'Motorsports',
    position: [10, 2, 8],
    color: '#fbbf24',
    darkColor: '#78350f',
    icon: Briefcase,
    content: {
      heading: 'Motorsports',
      description: 'Dynamics & Speed',
      planets: [
        { id: 'mo1', title: 'Vehicle Dynamics', color: '#fcd34d', darkColor: '#78350f', type: 'ringed', size: 2.5, detail: "Deep technical interest in racing strategy and vehicle physics." },
        { id: 'mo6', title: 'Drivers License', color: '#92400e', darkColor: '#78350f', type: 'rocky', size: 1.7, detail: "Class 3 Drivers License (Manual)." },
      ]
    }
  },
  {
    id: 'archery',
    title: 'Archery',
    position: [-10, 2, 8],
    color: '#34d399',
    darkColor: '#064e3b',
    icon: Target,
    content: {
      heading: 'Archery',
      description: 'Focus & Precision',
      planets: [
        { id: 'a1', title: 'Varsity Team', color: '#4ade80', darkColor: '#064e3b', type: 'rocky', size: 1.5, detail: "Competed for SIT and Ngee Ann Polytechnic Varsity Teams." },
        { id: 'a2', title: 'Half-Colours', color: '#22c55e', darkColor: '#064e3b', type: 'ice', size: 2.1, detail: "Awarded Half-Colours for sporting excellence." },
      ]
    }
  },
  {
    id: 'achievements',
    title: 'Achievements',
    position: [0, 2, -14],
    color: '#fcd34d',
    darkColor: '#713f12',
    icon: Trophy,
    content: {
      heading: 'Awards',
      description: 'Excellence & Service',
      planets: [
        { id: 'ac1', title: 'Lean Six Sigma', color: '#fef08a', darkColor: '#713f12', type: 'ringed', size: 2.4, detail: "Green Belt Certified for process improvement." },
        { id: 'ac3', title: 'SAF Ammo Officer', color: '#eab308', darkColor: '#713f12', type: 'gas', size: 1.6, detail: "Served as Ammunition Reliability Officer during National Service." },
      ]
    }
  }
];

// --- 3D UTILS ---

function BackgroundImage() {
  const texture = useLoader(THREE.TextureLoader, "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop");
  return (
    <mesh>
      <sphereGeometry args={[800, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} transparent={true} opacity={0.5} />
    </mesh>
  );
}

function ParticleField() {
  const particles = useRef<THREE.Points>(null);
  const count = 2000;
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 400;
      pos[i + 1] = (Math.random() - 0.5) * 400;
      pos[i + 2] = (Math.random() - 0.5) * 400;
      col[i] = col[i+1] = col[i+2] = 1; 
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.3} vertexColors transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function VariedPlanetMesh({ type, color, size }: { type: PlanetType, color: string, size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.005; });

  let distort = 0, roughness = 0.5, metalness = 0.1, speed = 0;
  if (type === 'gas') { distort = 0.5; speed = 2; roughness = 0.8; }
  else if (type === 'rocky') { distort = 0.15; speed = 0.5; roughness = 0.9; }
  else if (type === 'ice') { distort = 0.1; speed = 1; roughness = 0.1; metalness = 0.8; }
  else if (type === 'ringed') { distort = 0.2; speed = 1.5; roughness = 0.6; }

  return (
    <group scale={size}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={roughness} metalness={metalness} distort={distort} speed={speed} />
      </mesh>
      {type === 'ringed' && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[1.4, 2.0, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// --- OUTER VIEW (Galaxies) ---
function SpiralGalaxy({ color, radius = 3 }: { color: string, radius?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const [positions, colors] = useMemo(() => {
    const count = 1500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const galaxyColor = new THREE.Color(color);

    for(let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random() * radius + 0.5; 
      const spinAngle = r * 5;
      const branchAngle = (i % 3) * ((Math.PI * 2) / 3);
      
      const randomX = (Math.random() - 0.5) * 0.5 * r;
      const randomY = (Math.random() - 0.5) * 0.2 * r;
      const randomZ = (Math.random() - 0.5) * 0.5 * r;

      pos[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      pos[i3 + 1] = randomY;
      pos[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      const mixedColor = galaxyColor.clone().lerp(new THREE.Color("white"), 1 / r);
      col[i3] = mixedColor.r;
      col[i3 + 1] = mixedColor.g;
      col[i3 + 2] = mixedColor.b;
    }
    return [pos, col];
  }, [color, radius]);

  useFrame(() => { if (pointsRef.current) pointsRef.current.rotation.y += 0.002; });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.2} sizeAttenuation vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <pointLight distance={10} intensity={2} color={color} />
    </group>
  );
}

function OrbitingGalaxySystem({ section, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const idx = sections.findIndex(s => s.id === section.id);
    const radius = 18 + idx * 8;
    const speed = 0.05 + idx * 0.01;
    const angle = state.clock.elapsedTime * speed + (idx * 2);
    const y = Math.sin(idx * 3) * 4;
    if (groupRef.current) groupRef.current.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  });

  return (
    <group ref={groupRef}>
      <mesh 
        visible={false} 
        onClick={(e) => { e.stopPropagation(); onClick(groupRef.current ? groupRef.current.position.clone() : new THREE.Vector3()); }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[4]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <SpiralGalaxy color={section.color} radius={4} />
      <Text position={[0, 4.5, 0]} fontSize={2.5} color="white" anchorX="center" anchorY="middle" outlineWidth={0.1} outlineColor="#000">
        {section.title}
      </Text>
    </group>
  );
}

// --- INNER VIEW (Planets) ---
function OrbitingPlanetSystem({ planet, onClick, idx, total }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    const radius = 12 + idx * 4;
    const speed = 0.2 - idx * 0.02;
    const phase = idx * ((Math.PI * 2) / total);
    const angle = state.clock.elapsedTime * speed + phase;
    if (groupRef.current) groupRef.current.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  });

  return (
    <group ref={groupRef}>
      <mesh 
        visible={false} 
        onClick={(e) => { e.stopPropagation(); onClick(groupRef.current ? groupRef.current.position.clone() : new THREE.Vector3(), planet); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
        <sphereGeometry args={[planet.size * 1.5]} />
        <meshBasicMaterial color="red" />
      </mesh>

      <VariedPlanetMesh type={planet.type} color={planet.color} size={planet.size} />
      
      {/* Label only appears on hover or if it's large */}
      <Text 
        position={[0, planet.size + 1.2, 0]} 
        fontSize={hovered ? 1.5 : 1} 
        color="white" 
        anchorX="center" 
        anchorY="middle" 
        outlineWidth={0.05} 
        outlineColor="#000"
      >
        {planet.title}
      </Text>
    </group>
  );
}

function InternationalSpaceStation() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={ref} scale={0.8} rotation={[0.2, 0, 0]}>
       <Cylinder args={[0.5, 0.5, 4, 16]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -2]}><meshStandardMaterial color="#d0d0d0" metalness={0.7} roughness={0.2} /></Cylinder>
       <Cylinder args={[0.6, 0.6, 5, 16]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 2]}><meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.2} /></Cylinder>
       <Sphere args={[0.7]} position={[0, 0, 0]}><meshStandardMaterial color="#a0a0a0" metalness={0.6} /></Sphere>
       <Box args={[18, 0.4, 0.4]} position={[0, 0, 0]}><meshStandardMaterial color="#555" metalness={0.5} /></Box>
       <group position={[-6, 0, 0]}>
          <Cylinder args={[0.3, 0.3, 1]} rotation={[0, 0, Math.PI/2]}><meshStandardMaterial color="#444" /></Cylinder>
          <Box args={[3, 0.05, 8]} position={[0, 0, 0]} rotation={[0.4, 0, 0]}><meshStandardMaterial color="#1a237e" metalness={0.9} roughness={0.2} emissive="#0d1b3e" emissiveIntensity={0.2} /></Box>
          <Box args={[3.05, 0.06, 8.05]} position={[0, 0, 0]} rotation={[0.4, 0, 0]}><meshBasicMaterial color="#000" wireframe opacity={0.2} transparent /></Box>
       </group>
       <group position={[6, 0, 0]}>
          <Cylinder args={[0.3, 0.3, 1]} rotation={[0, 0, Math.PI/2]}><meshStandardMaterial color="#444" /></Cylinder>
          <Box args={[3, 0.05, 8]} position={[0, 0, 0]} rotation={[0.4, 0, 0]}><meshStandardMaterial color="#1a237e" metalness={0.9} roughness={0.2} emissive="#0d1b3e" emissiveIntensity={0.2} /></Box>
          <Box args={[3.05, 0.06, 8.05]} position={[0, 0, 0]} rotation={[0.4, 0, 0]}><meshBasicMaterial color="#000" wireframe opacity={0.2} transparent /></Box>
       </group>
       <Text position={[0, 3, 0]} fontSize={2} color="white" anchorX="center" anchorY="middle" outlineWidth={0.1} outlineColor="#000">Sean Ogta Goh</Text>
    </group>
  )
}

function CentralStar({ section }: { section?: Section }) {
  const title = section ? section.title : 'Sean Ogta Goh';
  const color = section ? section.color : '#fbbf24'; 
  const emissive = section ? section.color : '#d97706'; 

  return (
    <group>
      <mesh>
        <sphereGeometry args={[4.5, 64, 64]} />
        <MeshDistortMaterial color={color} emissive={emissive} emissiveIntensity={2} roughness={0.2} metalness={0.1} distort={0.3} speed={2} />
      </mesh>
      <pointLight intensity={3} distance={50} color={color} />
      <Text position={[0, 7, 0]} fontSize={3} fontWeight="bold" color="white" anchorX="center" anchorY="middle" outlineWidth={0.2} outlineColor="#000">
        {title}
      </Text>
    </group>
  );
}

function GalaxyScene({ activeSection, onSectionClick, view, planets, onPlanetClick }: any) {
  return (
    <>
      <ambientLight intensity={0.2} /> 
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <ParticleField /> 
      
      {view === 'galaxy' ? (
        <>
          <InternationalSpaceStation />
          {sections.map((section) => (
            <OrbitingGalaxySystem
              key={section.id}
              section={section}
              onClick={(pos: any) => onSectionClick(section, pos)}
            />
          ))}
        </>
      ) : (
        <>
          <CentralStar section={activeSection} />
          {planets.map((planet: any, idx: number) => (
            <OrbitingPlanetSystem
              key={planet.id}
              planet={planet}
              idx={idx}
              total={planets.length}
              onClick={(pos: any, p: Planet) => onPlanetClick(p, pos)}
            />
          ))}
        </>
      )}
      
      <Stars radius={300} depth={100} count={3000} factor={6} saturation={0} fade speed={0.5} />
    </>
  );
}

function IntroCameraRig({ active }: { active: boolean }) {
  const { camera } = useThree();
  const [hasStarted, setHasStarted] = useState(false);
  
  useLayoutEffect(() => {
    if (!hasStarted) camera.position.set(0, 100, 2000); 
  }, [camera, hasStarted]);

  useEffect(() => {
    if (!active && !hasStarted) {
      setHasStarted(true);
      gsap.to(camera.position, { x: 0, y: 30, z: 60, duration: 4, ease: "power2.out" });
    }
  }, [active, camera, hasStarted]);

  return null;
}

export default function AnimatedPortfolio({ introPlaying = false }: { introPlaying?: boolean }) {
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [activePlanet, setActivePlanet] = useState<Planet | null>(null);
  const [view, setView] = useState<'galaxy' | 'system'>('galaxy');
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const controlsRef = useRef<any>(null);

  const handleSectionClick = (section: Section, currentPos?: THREE.Vector3) => {
    setActiveSection(section);
    setActivePlanet(null);
    setShowMenu(false);
    setView('system');
    setPlanets(section.content.planets);
    if (controlsRef.current) {
      const idx = sections.findIndex(s => s.id === section.id);
      const radius = 18 + idx * 8;
      const angle = 0 + (idx * 2);
      const y = Math.sin(idx * 3) * 4;
      const target = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);

      gsap.to(controlsRef.current.target, { x: target.x, y: target.y, z: target.z, duration: 2, ease: "power3.inOut" });
      const offset = target.clone().normalize().multiplyScalar(15);
      const camPos = target.clone().add(new THREE.Vector3(offset.x, 5, offset.z)); 
      gsap.to(controlsRef.current.object.position, { x: camPos.x, y: camPos.y, z: camPos.z, duration: 2, ease: "power3.inOut" });
    }
  };

  const handlePlanetClick = (planet: Planet, pos: THREE.Vector3) => { 
    setActivePlanet(planet); 
    // Focus camera on the clicked planet
    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, { x: pos.x, y: pos.y, z: pos.z, duration: 1.5, ease: "power2.out" });
      const offset = pos.clone().normalize().multiplyScalar(8); // Get closer
      const camPos = pos.clone().add(new THREE.Vector3(offset.x, 2, offset.z));
      gsap.to(controlsRef.current.object.position, { x: camPos.x, y: camPos.y, z: camPos.z, duration: 1.5, ease: "power2.out" });
    }
  };

  const resetView = () => {
    setActiveSection(null);
    setActivePlanet(null);
    setView('galaxy');
    setPlanets([]);
    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, { x: 0, y: 0, z: 0, duration: 2, ease: "power3.inOut" });
      gsap.to(controlsRef.current.object.position, { x: 0, y: 30, z: 60, duration: 2, ease: "power3.inOut" });
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {!introPlaying && (
        <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm border-b border-white/10 transition-opacity duration-1000 opacity-100">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <button onClick={resetView} className="text-white hover:text-cyan-400 transition-all duration-300 font-black text-xl tracking-tight flex items-center space-x-2 group">
              <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Home</span>
            </button>
            {view === 'system' && (
              <button onClick={resetView} className="text-white hover:text-cyan-400 transition-all p-2 hover:bg-white/10 rounded-lg flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Galaxy</span>
              </button>
            )}
            <button onClick={() => setShowMenu(!showMenu)} className="text-white hover:text-cyan-400 transition-all p-2 hover:bg-white/10 rounded-lg">
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="absolute top-20 right-4 z-40 bg-black/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl max-w-sm w-full">
          <h3 className="text-white font-black text-lg mb-6 flex items-center space-x-2"><Zap className="w-5 h-5 text-cyan-400" /><span>Explore My Journey</span></h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <button key={section.id} onClick={() => handleSectionClick(section)} className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl transition-all hover:bg-white/10 group relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 relative z-10" style={{ backgroundColor: section.color }}><section.icon className="w-6 h-6 text-white" /></div>
                <div className="flex-1"><p className="text-white group-hover:text-cyan-300 transition-colors font-semibold">{section.title}</p></div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-all group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {!introPlaying && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-1000 opacity-100">
          <div className="text-center space-y-3">
            <p className="text-white/70 text-sm bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 font-medium">
              🌌 You are the ISS • Orbiting Galaxies are your Skills • Click to Explore
            </p>
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 100, 2000], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <color attach="background" args={['#000000']} />
           <IntroCameraRig active={introPlaying} />
           <GalaxyScene activeSection={activeSection} onSectionClick={handleSectionClick} view={view} planets={planets} onPlanetClick={handlePlanetClick} />
           <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} enableRotate={true} maxDistance={150} minDistance={5} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 4} autoRotate={false} />
        </Suspense>
      </Canvas>

      {/* --- SIDEBAR INFO PANEL --- */}
      {activePlanet && (
        <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-black/60 backdrop-blur-xl border-l border-white/10 p-8 shadow-2xl z-50 flex flex-col justify-center animate-slide-in-right">
          <button onClick={() => setActivePlanet(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
          
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-wider text-cyan-400 uppercase">
              {activePlanet.type.toUpperCase()} PLANET
            </div>
            
            <h2 className="text-4xl font-black text-white leading-tight" style={{ textShadow: `0 0 30px ${activePlanet.color}` }}>
              {activePlanet.title}
            </h2>
            
            <div className="h-1 w-20 rounded-full" style={{ backgroundColor: activePlanet.color }} />
            
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              {activePlanet.detail || "Detail unavailable."}
            </p>

            <button className="mt-8 flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors group">
              <span className="uppercase tracking-widest text-sm font-bold">Learn More</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
