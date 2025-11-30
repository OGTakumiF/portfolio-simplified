import { Suspense, useRef, useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Text, Stars, OrbitControls, Environment, Sparkles, Trail, Sphere, MeshDistortMaterial, RoundedBox, Cylinder } from '@react-three/drei';
import {
  Menu, X, Zap, Music, Heart, Target, Trophy, Briefcase, ArrowRight, Sparkles as SparklesIcon, ArrowLeft
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

interface Planet {
  id: string;
  title: string;
  color: string;
  darkColor: string;
  detail?: string;
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
    highlights?: string[];
  };
}

const sections: Section[] = [
  {
    id: 'engineering',
    title: 'Engineering',
    position: [0, 2, 0],
    color: '#06b6d4',
    darkColor: '#164e63',
    icon: Zap,
    content: {
      heading: 'Sustainable Infrastructure Engineer',
      description: 'Specialized in Railway Engineering & Power Systems',
      planets: [
        { 
          id: 'p1', 
          title: 'B.Eng. Sustainable Infrastructure (Land), Honours with Merit', 
          color: '#38bdf8', 
          darkColor: '#0c4a6e',
          detail: "Graduated with Honours with Merit from the Singapore Institute of Technology (SIT).\n\nMy studies in Sustainable Infrastructure Engineering (Land) provided a strong foundation in designing and managing modern infrastructure. I was also an active member of the SIE Student Member Committee and a student member of the IEEE and IES."
        },
        { 
          id: 'p2', 
          title: 'Diploma in Electrical Engineering (Power Specialisation)', 
          color: '#38bdf8', 
          darkColor: '#0c4a6e',
          detail: "Obtained a Diploma from Ngee Ann Polytechnic with a specialisation in Electrical Power Engineering.\n\nThis equipped me with core technical skills in power distribution, control systems, and electronics."
        },
        { 
          id: 'p3', 
          title: 'Champion, Singapore RailTech Grand Challenge 2024', 
          color: '#38bdf8', 
          darkColor: '#0c4a6e',
          detail: "Achieved 1st Place (Champion) in the Open Innovation Challenge at the Singapore RailTech Grand Challenge (SGRTGC) 2024.\n\nThis award recognized an innovative solution developed for the rail industry, based on work from the LongRange Safety Tracker project."
        },
        { 
          id: 'p4', 
          title: 'Designed LoRaWAN Safety Tracker for Railway Tunnels', 
          color: '#38bdf8', 
          darkColor: '#0c4a6e',
          detail: "Designed and prototyped a LoRaWAN tracking and emergency alert system to enhance the safety of maintenance personnel in railway tunnels.\n\nThis project was advised by SBS Transit Rail and was an enhancement based on award-winning solutions for an LTA open innovation competition."
        },
        { 
          id: 'p5', 
          title: 'Published Academic Papers & Best Presenter Award', 
          color: '#38bdf8', 
          darkColor: '#0c4a6e',
          detail: "Co-authored multiple conference papers on this railway safety technology:\n\n• 'Design and Prototyping of a Real-Time Location Tracking System...' for the 2025 11th International Conference on Control, Automation and Robotics (ICCAR).\n\n• 'A Real-Time LoRaWAN Tracking System in Railway Tunnels...' (In Press).\n\n• Received the Best Presenter Award at the IEEE SOLI 2025 Conference."
        },
        { 
          id: 'p6', 
          title: 'Project Management Intern at Siemens AG (Rail Comms)', 
          color: '#38bdf8', 
          darkColor: '#0c4a6e',
          detail: "As a Project Management Intern at Siemens AG, I managed the renewal of rail communications systems.\n\nMy responsibilities included coordinating with subcontractors and operators, designing PA system front-ends (SLDs and cable routing), overseeing on-site installation and commissioning, and resolving on-site technical issues."
        }
      ],
      highlights: ['Railway Systems', 'Power Distribution', 'Infrastructure Design']
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
      heading: 'Musician & Performer',
      description: 'Trained violinist with vocal capabilities',
      planets: [
        { id: 'm1', title: 'Classical violin performance and training', color: '#f472b6', darkColor: '#831843', detail: "Trained in classical violin performance and technique." },
        { id: 'm2', title: 'Vocal training and professional performance', color: '#f472b6', darkColor: '#831843', detail: "Experienced in vocal training and professional performance settings." },
        { id: 'm3', title: 'Voice-over work for media projects', color: '#f472b6', darkColor: '#831843' },
        { id: 'm4', title: 'Studio recording experience', color: '#f472b6', darkColor: '#831843' },
        { id: 'm5', title: 'Music production and arrangement', color: '#f472b6', darkColor: '#831843' },
        { id: 'm6', title: 'ABRSM Grade 8 Music Theory', color: '#f472b6', darkColor: '#831843', detail: "Certified with a Level 3 Certification in Graded Examination in Music Theory (Grade 8) from ABRSM, demonstrating an advanced understanding of music theory." },
      ],
      highlights: ['Violin', 'Vocals', 'Performance']
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
      heading: 'Psychology & Advisory',
      description: 'Passionate about understanding and helping others',
      planets: [
        { id: 'ps1', title: 'Regular advisor for friends and family', color: '#fb7185', darkColor: '#7f1d1d' },
        { id: 'ps2', title: 'Community support and mentorship', color: '#fb7185', darkColor: '#7f1d1d' },
        { id: 'ps3', title: 'Empathetic problem-solving approach', color: '#fb7185', darkColor: '#7f1d1d' },
        { id: 'ps4', title: 'Personal and professional development focus', color: '#fb7185', darkColor: '#7f1d1d' },
        { id: 'ps5', title: 'Conflict resolution and mediation', color: '#fb7185', darkColor: '#7f1d1d' },
        { id: 'ps6', title: 'Certified in Psychology of Learning', color: '#fb7185', darkColor: '#7f1d1d', detail: "Completed a certification in 'Psicologia dell'apprendimento' (Psychology of Learning) from FedericaX, reflecting a personal interest in human behavior and development." },
      ],
      highlights: ['Mentorship', 'Counseling', 'Development']
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
      heading: 'Motorsports Enthusiast',
      description: 'Speed, precision, and engineering excellence',
      planets: [
        { id: 'mo1', title: 'Deep interest in vehicle dynamics', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo2', title: 'Racing strategy and competitive analytics', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo3', title: 'High-performance engineering principles', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo4', title: 'Motorsports technology and innovations', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo5', title: 'Passion for precision and speed', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo6', title: 'Class 3 Drivers License', color: '#fcd34d', darkColor: '#78350f', detail: "Holding a Class 3 Drivers License since 2020." },
      ],
      highlights: ['Performance', 'Dynamics', 'Racing']
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
      heading: 'Archery Practice',
      description: 'Focus, discipline, and precision mastery',
      planets: [
        { id: 'a1', title: 'Varsity Archer (SIT & NP)', color: '#4ade80', darkColor: '#064e3b', detail: "Competed as a member of the varsity archery teams at both Singapore Institute of Technology (SIT) and Ngee Ann Polytechnic." },
        { id: 'a2', title: 'Half-Colours Award (Ngee Ann Polytechnic)', color: '#4ade80', darkColor: '#064e3b', detail: "Received the Half-Colours Award from Ngee Ann Polytechnic, recognizing achievements and contributions to the varsity archery team." },
        { id: 'a3', title: 'Discipline & Focus', color: '#4ade80', darkColor: '#064e3b', detail: "Archery practice hones mental discipline, focus, and a philosophy of continuous improvement, which I apply to engineering and technical challenges." },
        { id: 'a4', title: 'Mental discipline and focus training', color: '#4ade80', darkColor: '#064e3b' },
        { id: 'a5', title: 'Precision accuracy development', color: '#4ade80', darkColor: '#064e3b' },
        { id: 'a6', title: 'Continuous improvement philosophy', color: '#4ade80', darkColor: '#064e3b' }
      ],
      highlights: ['Precision', 'Focus', 'Discipline']
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
      heading: 'Multi-Disciplinary Excellence',
      description: 'Combining technical expertise with creative passion',
      planets: [
        { id: 'ac1', title: 'Lean Six Sigma (Green Belt)', color: '#fde047', darkColor: '#713f12', detail: "Certified Lean Six Sigma Green Belt, demonstrating skills in process improvement, statistical analysis, and quality management." },
        { id: 'ac2', title: 'Professional Certifications', color: '#fde047', darkColor: '#713f12', detail: "Holds multiple professional certifications including:\n\n• 'Mastering systems thinking in practice' (The Open University)\n• 'SAP Enterprise Services (Materials Management)'\n• 'Apply Workplace Safety and Health in Construction Sites'" },
        { id: 'ac3', title: 'SAF Ammunition Reliability SO (NS)', color: '#fde047', darkColor: '#713f12', detail: "During National Service, served as an Ammunition Reliability SO. Centralised disparate data into a master repository, enabling the creation of the annual Tri-Service Ammunition Surveillance Work Plan. Also conducted root cause analysis on ammunition incident reports." },
        { id: 'ac4', title: 'SAFAC Digital-In-Charge (NS)', color: '#fde047', darkColor: '#713f12', detail: "Also served as the Digital-In-Charge for SAF Ammunition Command. Directed all content for SAFAC Firepower TV to enhance safety and security awareness. Managed media production and live event coverage for key events like Change of Command and SAF Day." },
        { id: 'ac5', title: 'Installation Engineer Intern (ST Eng.)', color: '#fde047', darkColor: '#713f12', detail: "As an intern, I supervised on-site installation of\nPlatform Screen Door (PSD) systems, ensuring WSH compliance. I also\nprepared reports, assisted the PM with schedules, and participated in\nfault findings and technical investigations." },
        { id: 'ac6', title: 'Bridging engineering, arts, and personal development', color: '#fde047', darkColor: '#713f12' }
      ],
      highlights: ['Excellence', 'Leadership', 'Innovation']
    }
  }
];

function ParticleField() {
  const particles = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.x = state.clock.elapsedTime * 0.0001;
      particles.current.rotation.y = state.clock.elapsedTime * 0.0002;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 400;
      positions[i + 1] = (Math.random() - 0.5) * 400;
      positions[i + 2] = (Math.random() - 0.5) * 400;
      colors[i] = 1; colors[i+1] = 1; colors[i+2] = 1;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <points ref={particles} geometry={geometry}>
      <pointsMaterial size={0.3} vertexColors sizeAttenuation transparent opacity={0.4} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function BackgroundImage() {
  const texture = useLoader(THREE.TextureLoader, "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop");
  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} transparent={true} opacity={0.6} />
    </mesh>
  );
}

// --- NEW CHARACTER COMPONENT ---
// Based on description: Orange hoodie, green vest, beard, dark hair
function MyAvatar() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      // Gentle float
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
      // Gentle rotation to greet user
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group}>
      {/* --- HEAD --- */}
      {/* Face */}
      <Sphere args={[1.8, 32, 32]} position={[0, 4, 0]}>
        <meshStandardMaterial color="#f0c0a0" /> {/* Skin tone */}
      </Sphere>
      {/* Hair (Dark Brown) */}
      <RoundedBox args={[3.8, 1.5, 3.8]} radius={0.5} position={[0, 5.2, 0]}>
        <meshStandardMaterial color="#3e2723" />
      </RoundedBox>
      <Sphere args={[2, 32, 32]} position={[0, 4.8, -0.5]}>
        <meshStandardMaterial color="#3e2723" />
      </Sphere>
      {/* Beard (Dark Brown) */}
      <RoundedBox args={[3.6, 1.2, 1]} radius={0.5} position={[0, 2.8, 1.2]}>
        <meshStandardMaterial color="#3e2723" />
      </RoundedBox>
      {/* Eyes */}
      <Sphere args={[0.3]} position={[-0.8, 4.2, 1.6]}>
        <meshStandardMaterial color="black" />
      </Sphere>
      <Sphere args={[0.3]} position={[0.8, 4.2, 1.6]}>
        <meshStandardMaterial color="black" />
      </Sphere>
      {/* Nose */}
      <Sphere args={[0.4]} position={[0, 3.8, 1.8]}>
        <meshStandardMaterial color="#e0b090" />
      </Sphere>

      {/* --- BODY --- */}
      {/* Orange Hoodie Torso */}
      <RoundedBox args={[3.5, 4.5, 2]} radius={0.5} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#f57c00" /> {/* Orange */}
      </RoundedBox>
      {/* Green Vest (Slightly larger) */}
      <RoundedBox args={[3.8, 4.2, 2.3]} radius={0.5} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#2e7d32" /> {/* Green */}
      </RoundedBox>
      {/* Hoodie String/Detail */}
      <Cylinder args={[0.1, 0.1, 1.5]} position={[-0.5, 1.5, 1.2]} rotation={[0,0,-0.2]}>
        <meshStandardMaterial color="#fff" />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 1.5]} position={[0.5, 1.5, 1.2]} rotation={[0,0,0.2]}>
        <meshStandardMaterial color="#fff" />
      </Cylinder>

      {/* --- ARMS --- */}
      {/* Left Arm (Orange) */}
      <group position={[-2.2, 2, 0]} rotation={[0, 0, 0.2]}>
        <RoundedBox args={[1.2, 3.5, 1.2]} radius={0.4} position={[0, -1.5, 0]}>
          <meshStandardMaterial color="#f57c00" />
        </RoundedBox>
        <Sphere args={[0.7]} position={[0, -3.5, 0]}>
          <meshStandardMaterial color="#f0c0a0" />
        </Sphere>
      </group>
      {/* Right Arm (Orange) */}
      <group position={[2.2, 2, 0]} rotation={[0, 0, -0.2]}>
        <RoundedBox args={[1.2, 3.5, 1.2]} radius={0.4} position={[0, -1.5, 0]}>
          <meshStandardMaterial color="#f57c00" />
        </RoundedBox>
        <Sphere args={[0.7]} position={[0, -3.5, 0]}>
          <meshStandardMaterial color="#f0c0a0" />
        </Sphere>
      </group>

      {/* --- LEGS --- */}
      {/* Left Leg (Jeans) */}
      <RoundedBox args={[1.4, 4, 1.4]} radius={0.4} position={[-1, -3.5, 0]}>
        <meshStandardMaterial color="#455a64" /> {/* Grey/Blue */}
      </RoundedBox>
      {/* Right Leg (Jeans) */}
      <RoundedBox args={[1.4, 4, 1.4]} radius={0.4} position={[1, -3.5, 0]}>
        <meshStandardMaterial color="#455a64" />
      </RoundedBox>
    </group>
  );
}

function SpiralGalaxy({ color, radius = 3 }: { color: string, radius?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const galaxyParameters = useMemo(() => {
    const count = 2500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const galaxyColor = new THREE.Color(color);

    for(let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random() * radius + 0.5; 
      const spinAngle = r * 5;
      const branchAngle = (i % 3) * ((Math.PI * 2) / 3);
      
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i3 + 1] = randomY * 0.8;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      const mixedColor = galaxyColor.clone().lerp(new THREE.Color("white"), 1 / r);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    return { positions, colors };
  }, [color, radius]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={galaxyParameters.positions.length / 3} array={galaxyParameters.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={galaxyParameters.colors.length / 3} array={galaxyParameters.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.35} sizeAttenuation={true} depthWrite={false} vertexColors={true} blending={THREE.AdditiveBlending} transparent={true} opacity={0.9} />
      </points>
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} blur={0.5} />
      </mesh>
      <pointLight distance={15} intensity={3} color={color} />
    </group>
  );
}

function OrbitingSystem({ section, onClick, isActive, orbit }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (groupRef.current && orbit) {
      const angle = state.clock.elapsedTime * orbit.speed + orbit.phase;
      const y = orbit.y ?? section.position[1] ?? 0;
      groupRef.current.position.set(Math.cos(angle) * orbit.radius, y, Math.sin(angle) * orbit.radius);
    }
  });

  return (
    <group ref={groupRef} position={section.position}>
      <mesh 
        visible={false} 
        onClick={(e) => { e.stopPropagation(); onClick(groupRef.current ? groupRef.current.position.clone() : new THREE.Vector3(...section.position)); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
        <sphereGeometry args={[4]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.3, 64]} />
        <meshBasicMaterial color={section.color} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <SpiralGalaxy color={section.color} radius={4} />
      <Text position={[0, 4.5, 0]} fontSize={3} color="white" anchorX="center" anchorY="middle" outlineWidth={0.2} outlineColor="#000">
        {section.title}
      </Text>
    </group>
  );
}

function CentralStar({ section }: { section?: Section }) {
  const title = section ? section.title : 'Sean Ogta Goh';
  // Removed old MeshDistortMaterial and replaced with Avatar
  return (
    <group position={[0, 0, 0]}>
      {/* --- REPLACED SPHERE WITH AVATAR --- */}
      <MyAvatar /> 
      
      {/* Light for the avatar */}
      <pointLight intensity={2} distance={20} color="white" position={[5, 5, 5]} />
      <ambientLight intensity={0.5} />

      <Text position={[0, 7.5, 0]} fontSize={4} fontWeight="bold" color="white" anchorX="center" anchorY="middle" outlineWidth={0.2} outlineColor="#000000">
        {title}
      </Text>
    </group>
  );
}

function SystemDetails({ activeSection, planets, onPlanetClick }: any) {
  return (
    <group>
      <CentralStar section={activeSection} />
      {planets.map((planet: any, idx: number) => (
        <OrbitingSystem
          key={planet.id}
          section={{ id: planet.id, title: planet.title, position: [0, 0, 0], color: planet.color, darkColor: planet.darkColor, icon: Zap, content: { heading: '', description: '', planets: [] } }}
          onClick={() => onPlanetClick(planet)}
          isActive={false}
          orbit={{ radius: 9 + idx * 4, speed: 0.2 - idx * 0.02, phase: idx * ((Math.PI * 2) / planets.length), y: 0 }}
        />
      ))}
    </group>
  );
}

function GalaxyScene({ activeSection, onSectionClick, view, planets, onPlanetClick }: any) {
  return (
    <>
      <ambientLight intensity={0.3} /> 
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <BackgroundImage />
      <ParticleField /> 
      {view === 'galaxy' ? (
        <CentralStar />
      ) : (
        <SystemDetails activeSection={activeSection!} planets={planets} onPlanetClick={onPlanetClick} />
      )}
      {view === 'galaxy' && sections.map((section, idx) => (
        <OrbitingSystem
          key={section.id}
          section={section}
          onClick={(pos: any) => onSectionClick(section, pos)}
          isActive={activeSection?.id === section.id}
          orbit={{ radius: 18 + idx * 8, speed: 0.1 + idx * 0.01, phase: idx * ((Math.PI * 2) / sections.length), y: Math.sin(idx) * 4 }}
        />
      ))}
      <Stars radius={400} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

function IntroCameraRig({ active }: { active: boolean }) {
  const { camera } = useThree();
  const [hasStarted, setHasStarted] = useState(false);
  
  useLayoutEffect(() => {
    if (!hasStarted) {
      camera.position.set(0, 100, 2000); 
    }
  }, [camera, hasStarted]);

  useEffect(() => {
    if (!active && !hasStarted) {
      setHasStarted(true);
      gsap.to(camera.position, {
        x: 0,
        y: 20,
        z: 40,
        duration: 4, 
        ease: "power2.out"
      });
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
      const idx = sections.findIndex((s) => s.id === section.id);
      const radius = 18 + idx * 8;
      const phase = idx * ((Math.PI * 2) / sections.length);
      const y = Math.sin(idx) * 4;
      const target = currentPos ?? new THREE.Vector3(Math.cos(phase) * radius, y, Math.sin(phase) * radius);
      gsap.to(controlsRef.current.target, { x: target.x, y: target.y, z: target.z, duration: 2.5, ease: "power3.inOut" });
      const offset = target.clone().normalize().multiplyScalar(15);
      const camPos = target.clone().add(new THREE.Vector3(offset.x, 5, offset.z)); 
      gsap.to(controlsRef.current.object.position, { x: camPos.x, y: camPos.y, z: camPos.z, duration: 2.5, ease: "power3.inOut" });
    }
  };

  const handlePlanetClick = (planet: Planet) => { setActivePlanet(planet); };

  const resetView = () => {
    setActiveSection(null);
    setActivePlanet(null);
    setView('galaxy');
    setPlanets([]);
    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, { x: 0, y: 0, z: 0, duration: 2, ease: "power3.inOut" });
      gsap.to(controlsRef.current.object.position, { x: 0, y: 20, z: 40, duration: 2, ease: "power3.inOut" });
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
              🌌 You are the Central Star • Orbiting Galaxies are your Skills • Click to Explore
            </p>
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 100, 2000], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <color attach="background" args={['#000000']} />
           <IntroCameraRig active={introPlaying} />
           <GalaxyScene activeSection={activeSection} onSectionClick={handleSectionClick} view={view} planets={planets} onPlanetClick={handlePlanetClick} />
           <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} enableRotate={true} maxDistance={150} minDistance={10} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 4} autoRotate={false} />
        </Suspense>
      </Canvas>

      {activePlanet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity" onClick={() => setActivePlanet(null)}>
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-8 md:p-12 max-w-2xl w-full border border-white/10 shadow-2xl transform transition-all animate-fade-in relative overflow-hidden" style={{ borderColor: activePlanet.color, borderWidth: '2px', boxShadow: `0 0 80px ${activePlanet.color}60` }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActivePlanet(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/10 p-3 rounded-xl hover:bg-white/20 z-10"><X className="w-6 h-6" /></button>
            <div className="relative z-10 text-left">
              <h2 className="text-3xl font-black text-white mb-6 text-center">{activePlanet.title}</h2>
              {activePlanet.detail ? <p className="text-lg text-slate-300 whitespace-pre-line">{activePlanet.detail}</p> : <p className="text-lg text-slate-300 text-center">Detailed information about this achievement or skill would be displayed here.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
