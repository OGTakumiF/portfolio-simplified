import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Stars, OrbitControls, Environment, Sparkles, Trail, Sphere, MeshDistortMaterial, Html } from '@react-three/drei';
import {
  Menu, X, Github, Linkedin, Mail, ChevronDown, ExternalLink,
  Zap, Music, Heart, Target, Trophy, Briefcase, ArrowRight, Sparkles as SparklesIcon
} from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';

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
    details: string[];
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
      details: [
        'Bachelor in Sustainable Infrastructure Engineering (Land)',
        'Diploma in Electrical Engineering (Power)',
        'Railway systems, track design, and signaling expertise',
        'Power distribution and control systems',
        'Sustainable transport solutions',
        'Expert in infrastructure project management'
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
      details: [
        'Classical violin performance and training',
        'Vocal training and professional performance',
        'Voice-over work for media projects',
        'Studio recording experience',
        'Music production and arrangement',
        'Performance in orchestral and chamber settings'
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
      details: [
        'Regular advisor for friends and family',
        'Community support and mentorship',
        'Deep understanding of human behavior',
        'Empathetic problem-solving approach',
        'Personal and professional development focus',
        'Conflict resolution and mediation'
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
      details: [
        'Deep interest in vehicle dynamics and performance',
        'Racing strategy and competitive analytics',
        'High-performance engineering principles',
        'Motorsports technology and innovations',
        'Track day experience and driver training',
        'Passion for precision and speed'
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
      details: [
        'Regular competitive archery practice',
        'Mental discipline and focus training',
        'Precision accuracy development',
        'Tournament participation and ranking',
        'Translates engineering mindset to athletics',
        'Continuous improvement philosophy'
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
      details: [
        'Dual engineering qualifications recognized internationally',
        'Active community involvement and leadership',
        'Award-winning musician with regional recognition',
        'Technical leadership in multiple fields',
        'Continuous learner and innovator',
        'Bridging engineering, arts, and personal development'
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

function AnimatedOrbital({ section, onClick, isActive }: {
  section: Section;
  onClick: () => void;
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
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
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      ringRef.current.scale.set(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.3,
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.3,
        1
      );
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
      <group position={section.position}>
        {/* Outer rotating ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[3.5, 0.15, 16, 100]} />
          <meshBasicMaterial
            color={section.color}
            transparent
            opacity={isActive ? 0.8 : 0.3}
            wireframe={false}
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
            onClick={onClick}
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

        {/* Glowing outer shell */}
        <mesh ref={glowRef}>
          <icosahedronGeometry args={[2.5, 2]} />
          <meshBasicMaterial
            color={section.color}
            transparent
            opacity={isActive ? 0.5 : 0.2}
            wireframe
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

function Scene3D({
  activeSection,
  onSectionClick
}: {
  activeSection: Section | null;
  onSectionClick: (section: Section) => void;
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

      {sections.map((section) => (
        <AnimatedOrbital
          key={section.id}
          section={section}
          onClick={() => onSectionClick(section)}
          isActive={activeSection?.id === section.id}
        />
      ))}

      <Stars radius={250} depth={100} count={10000} factor={6} saturation={0.5} fade speed={1} />
      <Environment preset="night" />
    </>
  );
}

export default function AnimatedPortfolio() {
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  const handleSectionClick = (section: Section) => {
    setActiveSection(section);
    setShowMenu(false);

    if (controlsRef.current) {
      gsap.to(controlsRef.current.object.position, {
        x: section.position[0] * 0.7,
        y: section.position[1] + 8,
        z: section.position[2] + 15,
        duration: 2,
        ease: 'power2.inOut'
      });
    }
  };

  const resetView = () => {
    setActiveSection(null);
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
            ✨ Click orbs to explore • Drag to rotate • Scroll to zoom
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

          <Scene3D activeSection={activeSection} onSectionClick={handleSectionClick} />

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

      {activeSection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity"
          onClick={() => setActiveSection(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl p-8 md:p-12 max-w-4xl w-full border shadow-2xl transform transition-all animate-fade-in relative overflow-hidden"
            style={{
              borderColor: activeSection.color,
              borderWidth: '2px',
              boxShadow: `0 0 80px ${activeSection.color}60`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15 blur-3xl"
              style={{ backgroundColor: activeSection.color }}
            ></div>

            <button
              onClick={() => setActiveSection(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10">
              <div className="flex items-start space-x-6 mb-8">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0 relative"
                  style={{ backgroundColor: activeSection.color }}
                >
                  <activeSection.icon className="w-12 h-12 text-white" />
                  <div
                    className="absolute inset-0 rounded-2xl opacity-30"
                    style={{
                      boxShadow: `inset 0 0 20px ${activeSection.color}`
                    }}
                  ></div>
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
                    {activeSection.content.heading}
                  </h2>
                  <p className="text-xl text-slate-300 font-semibold">
                    {activeSection.content.description}
                  </p>
                </div>
              </div>

              {activeSection.content.highlights && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {activeSection.content.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-bold text-white"
                      style={{
                        backgroundColor: activeSection.color + '25',
                        color: activeSection.color,
                        border: `1px solid ${activeSection.color}60`
                      }}
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {activeSection.content.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0"
                      style={{ backgroundColor: activeSection.color }}
                    ></div>
                    <p className="text-slate-200 text-base leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center space-x-4 pt-8 border-t border-slate-700/50">
                <a
                  href="https://www.linkedin.com/in/sean-ogta-goh"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredLink('linkedin')}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl transition-all hover:scale-110 font-semibold shadow-lg"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                  {hoveredLink === 'linkedin' && <ExternalLink className="w-4 h-4" />}
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredLink('github')}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition-all hover:scale-110 font-semibold shadow-lg"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                  {hoveredLink === 'github' && <ExternalLink className="w-4 h-4" />}
                </a>
                <a
                  href="mailto:sean.goh@example.com"
                  onMouseEnter={() => setHoveredLink('email')}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 py-3 rounded-xl transition-all hover:scale-110 font-semibold shadow-lg"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                  {hoveredLink === 'email' && <ExternalLink className="w-4 h-4" />}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}