import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Stars, OrbitControls, Environment, Sparkles, Trail, Sphere, MeshDistortMaterial, Html } from '@react-three/drei';
import {
  Menu, X, Github, Linkedin, Mail, ChevronDown, ExternalLink,
  Zap, Music, Heart, Target, Trophy, Briefcase, ArrowRight, Sparkles as SparklesIcon, ArrowLeft
} from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';

// --- ADDED SHADERS ---
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
    // This creates a glowing rim effect (Fresnel)
    float intensity = pow( 0.6 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.0 );
    gl_FragColor = vec4( glowColor, 1.0 ) * intensity * 0.8;
  }
`;
// --- END OF SHADERS ---

interface Planet {
  id: string;
  title: string;
  color: string;
  darkColor: string;
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
        { id: 'p1', title: 'Bachelor in Sustainable Infrastructure Engineering (Land)', color: '#38bdf8', darkColor: '#0c4a6e' },
        { id: 'p2', title: 'Diploma in Electrical Engineering (Power)', color: '#38bdf8', darkColor: '#0c4a6e' },
        { id: 'p3', title: 'Railway systems, track design, and signaling expertise', color: '#38bdf8', darkColor: '#0c4a6e' },
        { id: 'p4', title: 'Power distribution and control systems', color: '#38bdf8', darkColor: '#0c4a6e' },
        { id: 'p5', title: 'Sustainable transport solutions', color: '#38bdf8', darkColor: '#0c4a6e' },
        { id: 'p6', title: 'Expert in infrastructure project management', color: '#38bdf8', darkColor: '#0c4a6e' }
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
        { id: 'm1', title: 'Classical violin performance and training', color: '#f472b6', darkColor: '#831843' },
        { id: 'm2', title: 'Vocal training and professional performance', color: '#f472b6', darkColor: '#831843' },
        { id: 'm3', title: 'Voice-over work for media projects', color: '#f472b6', darkColor: '#831843' },
        { id: 'm4', title: 'Studio recording experience', color: '#f472b6', darkColor: '#831843' },
        { id: 'm5', title: 'Music production and arrangement', color: '#f472b6', darkColor: '#831843' },
        { id: 'm6', title: 'Performance in orchestral and chamber settings', color: '#f472b6', darkColor: '#831843' }
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
        { id: 'ps3', title: 'Deep understanding of human behavior', color: '#fb7185', darkColor: '#7f1d1d' },
        { id: 'ps4', title: 'Empathetic problem-solving approach', color: '#fb7185', darkColor: '#7f1d1d' },
        { id: 'ps5', title: 'Personal and professional development focus', color: '#fb7185', darkColor: '#7f1d1d' },
        { id: 'ps6', title: 'Conflict resolution and mediation', color: '#fb7185', darkColor: '#7f1d1d' }
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
        { id: 'mo1', title: 'Deep interest in vehicle dynamics and performance', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo2', title: 'Racing strategy and competitive analytics', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo3', title: 'High-performance engineering principles', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo4', title: 'Motorsports technology and innovations', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo5', title: 'Track day experience and driver training', color: '#fcd34d', darkColor: '#78350f' },
        { id: 'mo6', title: 'Passion for precision and speed', color: '#fcd34d', darkColor: '#78350f' }
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
        { id: 'a1', title: 'Regular competitive archery practice', color: '#4ade80', darkColor: '#064e3b' },
        { id: 'a2', title: 'Mental discipline and focus training', color: '#4ade80', darkColor: '#064e3b' },
        { id: 'a3', title: 'Precision accuracy development', color: '#4ade80', darkColor: '#064e3b' },
        { id: 'a4', title: 'Tournament participation and ranking', color: '#4ade80', darkColor: '#064e3b' },
        { id: 'a5', title: 'Translates engineering mindset to athletics', color: '#4ade80', darkColor: '#064e3b' },
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
        { id: 'ac1', title: 'Dual engineering qualifications recognized internationally', color: '#fde047', darkColor: '#713f12' },
        { id: 'ac2', title: 'Active community involvement and leadership', color: '#fde047', darkColor: '#713f12' },
        { id: 'ac3', title: 'Award-winning musician with regional recognition', color: '#fde047', darkColor: '#713f12' },
        { id: 'ac4', title: 'Technical leadership in multiple fields', color: '#fde047', darkColor: '#713f12' },
        { id: 'ac5', title: 'Continuous learner and innovator', color: '#fde047', darkColor: '#713f12' },
        { id: 'ac6', title: 'Bridging engineering, arts, and personal development', color: '#fde047', darkColor: '#713f12' }
      ],
      highlights: ['Excellence', 'Leadership', 'Innovation']
    }
  }
];

function ParticleField() {
  const particles = useRef<THREE.Points>(null);
  const particleCount = 3000;

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.x = state.clock.elapsedTime * 0.0001;
      particles.current.rotation.y = state.clock.elapsedTime * 0.0002;
      
      const positions = particles.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + positions[i]) * 0.001;
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200;
    positions[i + 1] = (Math.random() - 0.5) * 200;
    positions[i + 2] = (Math.random() - 0.5) * 200;
    
    colors[i] = Math.random() * 0.5 + 0.5;
    colors[i + 1] = Math.random() * 0.5 + 0.5;
    colors[i + 2] = 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return (
    <points ref={particles} geometry={geometry}>
      <pointsMaterial 
        size={0.2} 
        vertexColors
        sizeAttenuation 
        transparent 
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function AnimatedOrbital({ section, onClick, isActive, orbit }: {
  section: Section;
  onClick: (currentPos: THREE.Vector3) => void;
  isActive: boolean;
  orbit?: { radius: number; speed: number; phase: number; y?: number };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Orbit the group around the origin if orbit settings are provided
    if (groupRef.current && orbit) {
      const angle = state.clock.elapsedTime * orbit.speed + orbit.phase;
      const y = orbit.y ?? section.position[1] ?? 0;
      groupRef.current.position.set(
        Math.cos(angle) * orbit.radius,
        y,
        Math.sin(angle) * orbit.radius
      );
    }

    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
      meshRef.current.rotation.z += 0.008;

      const scale = hovered || isActive ? 1.4 : 1;
      const targetScale = new THREE.Vector3(scale, scale, scale);
      meshRef.current.scale.lerp(targetScale, 0.15);

      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.003;
    }

    if (glowRef.current) {
      glowRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      glowRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      glowRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      glowRef.current.scale.y = 1 + Math.cos(state.clock.elapsedTime * 2.5) * 0.2;
    }

    if (ringRef.current) {
      ringRef.current.rotation.y += 0.02;
      // Keep the ring's x rotation tilted, but allow for a slight wobble
      ringRef.current.rotation.x = (Math.PI * 0.4) + (Math.sin(state.clock.elapsedTime) * 0.1);
    }

    if (pointLightRef.current) {
      pointLightRef.current.intensity = isActive ? 6 : (hovered ? 4 : 2);
      pointLightRef.current.distance = isActive ? 25 : 20;
    }

    if (trailRef.current) {
      trailRef.current.rotation.x += 0.005;
      trailRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} position={section.position}>
        {/* Flat, tilted ring --- MODIFIED --- */}
        <mesh ref={ringRef} rotation-x={Math.PI * 0.4}>
          <ringGeometry args={[3.2, 3.8, 64]} />
          <meshBasicMaterial
            color={section.color}
            transparent
            opacity={isActive ? 0.6 : 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Inner trail ring */}
        <mesh ref={trailRef}>
          <torusGeometry args={[2.8, 0.1, 16, 100]} />
          <meshBasicMaterial
            color={section.color}
            transparent
            opacity={0.4}
            wireframe
          />
        </mesh>

        {/* Main orbital sphere */}
        <Trail
          width={2}
          length={8}
          color={section.color}
          attenuation={(t) => t * t}
        >
          <mesh
            ref={meshRef}
            onClick={() => onClick(groupRef.current ? groupRef.current.position.clone() : new THREE.Vector3(...section.position))}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <icosahedronGeometry args={[2, 4]} />
            <MeshDistortMaterial
              color={section.color}
              emissive={section.color}
              emissiveIntensity={isActive ? 1.5 : (hovered ? 1 : 0.6)}
              roughness={0.1}
              metalness={0.9}
              distort={hovered || isActive ? 0.6 : 0.4}
              speed={3}
            />
          </mesh>
        </Trail>

        {/* Glowing Atmosphere --- MODIFIED --- */}
        <mesh ref={glowRef}>
          <icosahedronGeometry args={[2.5, 4]} />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={{
              glowColor: { value: new THREE.Color(section.color) }
            }}
            blending={THREE.AdditiveBlending}
            transparent={true}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Sparkles around the orb */}
        <Sparkles
          count={100}
          scale={6}
          size={2}
          speed={0.4}
          opacity={hovered || isActive ? 1 : 0.5}
          color={section.color}
        />

        {/* Icon badge */}
        <mesh position={[0, 0, 2.5]}>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial 
            color={section.color} 
            transparent 
            opacity={0.8}
          />
        </mesh>

        {/* Floating text */}
        <Text
          position={[0, 4, 0]}
          fontSize={0.7}
          fontWeight="bold"
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
          maxWidth={5}
        >
          {section.title}
        </Text>

        {/* Pulsing light */}
        <pointLight
          ref={pointLightRef}
          position={[0, 0, 0]}
          color={section.color}
          distance={20}
          castShadow
        />

        {/* Inner glowing sphere */}
        <Sphere args={[2, 32, 32]} castShadow>
          <meshStandardMaterial
            color={section.color}
            emissive={section.color}
            emissiveIntensity={0.4}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Discovery badge for active */}
        {isActive && (
          <mesh position={[0, 5, 0]}>
            <ringGeometry args={[0.6, 0.9, 32]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.9} />
          </mesh>
        )}
      </group>
    </Float>
  );
}

function GalaxyCenter({ section }: { section?: Section }) {
  const shellRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (shellRef.current) {
      shellRef.current.rotation.y += 0.01;
      shellRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      shellRef.current.scale.y = 1 + Math.cos(state.clock.elapsedTime * 1.2) * 0.05;
    }
  });

  const title = section ? section.title : 'Milky Way';
  const color = section ? section.color : '#3b82f6';
  const emissive = section ? section.color : '#60a5fa';

  return (
    <group position={[0, 1.5, 0]}>
      <Sphere args={[3.5, 64, 64]} castShadow>
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.8}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.95}
        />
      </Sphere>
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[4.2, 2]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.2} wireframe />
      </mesh>
      <Sparkles count={300} scale={12} size={2} speed={0.3} opacity={0.6} color={emissive} />
      <Text
        position={[0, 6, 0]}
        fontSize={1}
        fontWeight="bold"
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.12}
        outlineColor="#000000"
      >
        {title}
      </Text>
    </group>
  );
}

function SolarSystemView({ activeSection, planets, onPlanetClick }: { activeSection: Section, planets: Planet[], onPlanetClick: (planet: Planet) => void }) {
  return (
    <group>
      {/* Render the central star */}
      <GalaxyCenter section={activeSection} />

      {/* Render the orbiting planets */}
      {planets.map((planet, idx) => (
        <AnimatedOrbital
          key={planet.id}
          section={{ 
            id: planet.id,
            title: planet.title,
            position: [0, 0, 0],
            color: planet.color,
            darkColor: planet.darkColor,
            icon: Zap, 
            content: {
              heading: '',
              description: '',
              planets: []
            }
          }}
          onClick={() => onPlanetClick(planet)}
          isActive={false}
          orbit={{
            radius: 8 + idx * 3.5, // --- MODIFIED --- Increased base radius and spacing
            speed: 0.3 - idx * 0.04, // --- MODIFIED --- Outer planets now move slower
            phase: idx * ((Math.PI * 2) / planets.length),
            y: 0
          }}
        />
      ))}
    </group>
  );
}

function Scene3D({
  activeSection,
  onSectionClick,
  view, // Add view prop
  planets, // Add planets prop
  onPlanetClick // Add onPlanetClick prop
}: {
  activeSection: Section | null;
  onSectionClick: (section: Section, currentPos: THREE.Vector3) => void;
  view: 'galaxy' | 'solarSystem'; // Define view type
  planets: Planet[]; // Define planets type
  onPlanetClick: (planet: Planet) => void; // Define onPlanetClick type
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[15, 15, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-15, 10, -5]} intensity={0.8} color="#60a5fa" />
      <pointLight position={[0, 20, 0]} intensity={1.2} color="#a78bfa" distance={150} />
      <spotLight
        position={[0, 30, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />

      <ParticleField />

      {view === 'galaxy' ? (
        <GalaxyCenter />
      ) : (
        <SolarSystemView activeSection={activeSection!} planets={planets} onPlanetClick={onPlanetClick} />
      )}

      {view === 'galaxy' && sections.map((section, idx) => (
        <AnimatedOrbital
          key={section.id}
          section={section}
          onClick={(pos) => onSectionClick(section, pos)}
          isActive={activeSection?.id === section.id}
          orbit={{
            radius: 10 + idx * 4,
            speed: 0.2 + idx * 0.03,
            phase: idx * ((Math.PI * 2) / sections.length),
            y: 2
          }}
        />
      ))}

      <Stars radius={250} depth={100} count={10000} factor={6} saturation={0.5} fade speed={1} />
      <Environment preset="night" />
    </>
  );
}

export default function AnimatedPortfolio() {
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [activePlanet, setActivePlanet] = useState<Planet | null>(null);
  const [view, setView] = useState<'galaxy' | 'solarSystem'>('galaxy');
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  const handleSectionClick = (section: Section, currentPos?: THREE.Vector3) => {
    setActiveSection(section);
    setActivePlanet(null); // Reset active planet
    setShowMenu(false);
    setView('solarSystem');
    setPlanets(section.content.planets);

    if (controlsRef.current) {
      // If we have the current orbiting position, use it; otherwise estimate based on index
      const idx = sections.findIndex((s) => s.id === section.id);
      const radius = 10 + idx * 4;
      const phase = idx * ((Math.PI * 2) / sections.length);
      const y = 2;
      const target = currentPos ?? new THREE.Vector3(Math.cos(phase) * radius, y, Math.sin(phase) * radius);

      gsap.to(controlsRef.current.object.position, {
        x: target.x * 0.7,
        y: target.y + 8,
        z: target.z + 15,
        duration: 2,
        ease: 'power2.inOut'
      });
    }
  };

  const handlePlanetClick = (planet: Planet) => {
    setActivePlanet(planet);
  };

  const resetView = () => {
    setActiveSection(null);
    setActivePlanet(null);
    setView('galaxy');
    setPlanets([]);
    if (controlsRef.current) {
      gsap.to(controlsRef.current.object.position, {
        x: 0,
        y: 10,
        z: 30,
        duration: 2,
        ease: 'power2.inOut'
      });
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <button
            onClick={resetView}
            className="text-white hover:text-cyan-400 transition-all duration-300 font-black text-xl tracking-tight flex items-center space-x-2 group"
          >
            <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Sean Ogta Goh</span>
          </button>

          {view === 'solarSystem' && (
            <button
              onClick={resetView}
              className="text-white hover:text-cyan-400 transition-all p-2 hover:bg-slate-800/50 rounded-lg flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Galaxy</span>
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-white hover:text-cyan-400 transition-all p-2 hover:bg-slate-800/50 rounded-lg"
          >
            {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {showMenu && (
        <div className="absolute top-20 right-4 z-40 bg-slate-900/98 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl max-w-sm w-full">
          <h3 className="text-white font-black text-lg mb-6 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>Explore My Journey</span>
          </h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section)}
                className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl transition-all hover:bg-slate-800/80 group relative overflow-hidden"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 relative z-10"
                  style={{ backgroundColor: section.color }}
                >
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white group-hover:text-cyan-300 transition-colors font-semibold">
                    {section.title}
                  </p>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300">
                    {section.content.description.substring(0, 40)}...
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-all group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="text-center space-y-3">
          <p className="text-white/70 text-sm bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700/50 font-medium">
            🌌 Milky Way at center • Planets are sections • Click to explore
          </p>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 10, 30], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#0a0a15']} />
          <fog attach="fog" args={['#0a0a15', 25, 90]} />
 
           <Scene3D 
             activeSection={activeSection} 
             onSectionClick={handleSectionClick} 
             view={view} 
             planets={planets} 
             onPlanetClick={handlePlanetClick} 
           />
 
           <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            maxDistance={60}
            minDistance={12}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 3}
            autoRotate={!activeSection}
            autoRotateSpeed={0.8}
          />
        </Suspense>
      </Canvas>

      {activePlanet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity"
          onClick={() => setActivePlanet(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl p-8 md:p-12 max-w-2xl w-full border shadow-2xl transform transition-all animate-fade-in relative overflow-hidden"
            style={{
              borderColor: activePlanet.color,
              borderWidth: '2px',
              boxShadow: `0 0 80px ${activePlanet.color}60`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePlanet(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-black text-white mb-4">{activePlanet.title}</h2>
              <p className="text-lg text-slate-300">Detailed information about this achievement or skill would be displayed here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
