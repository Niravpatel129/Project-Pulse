'use client';

import {
  CameraShake,
  Environment,
  Float,
  MeshDistortMaterial,
  PointMaterial,
  Points,
  Stars,
  Trail,
  Wireframe,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { inSphere } from 'maath/random';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// Galaxy particles simulation
function GalaxyAnimation() {
  const pointsRef = useRef<THREE.Points>(null);
  const { clock, mouse, viewport } = useThree();

  // Galaxy parameters
  const params = useMemo(() => {
    return {
      count: 50000,
      size: 0.015,
      radius: 5,
      branches: 6,
      spin: 1,
      randomness: 0.2,
      randomnessPower: 3,
      insideColor: '#ff6030',
      outsideColor: '#1b3984',
      stars: 1000,
    };
  }, []);

  // Generate galaxy
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);

    const colorInside = new THREE.Color(params.insideColor);
    const colorOutside = new THREE.Color(params.outsideColor);

    for (let i = 0; i < params.count; i++) {
      const i3 = i * 3;

      // Position
      const radius = Math.random() * params.radius;
      const spinAngle = radius * params.spin;
      const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2;

      const randomX =
        Math.pow(Math.random(), params.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        params.randomness *
        radius;
      const randomY =
        Math.pow(Math.random(), params.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        params.randomness *
        radius;
      const randomZ =
        Math.pow(Math.random(), params.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        params.randomness *
        radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / params.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    return [positions, colors];
  }, [params]);

  useFrame((state) => {
    if (pointsRef.current) {
      // Dynamic rotation based on time
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;

      // Interactive rotation based on mouse position
      const x = (state.mouse.x * state.viewport.width) / 100;
      const y = (state.mouse.y * state.viewport.height) / 100;

      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        y * 0.5,
        0.1,
      );
      pointsRef.current.rotation.z = THREE.MathUtils.lerp(
        pointsRef.current.rotation.z,
        -x * 0.5,
        0.1,
      );
    }
  });

  return (
    <group>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={params.size}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <MovingStar />
      <InteractiveOrb position={[2, 1, 3]} color='#ff9f00' />
      <InteractiveOrb position={[-2.5, -1, 2]} color='#00ffcc' />
      <InteractiveOrb position={[1, -2, -3]} color='#ff00aa' />
    </group>
  );
}

// Shooting star
function MovingStar() {
  const ref = useRef<THREE.Mesh>(null);
  const { clock, viewport } = useThree();

  useFrame(() => {
    if (ref.current) {
      // Create a path for the star to follow
      const time = clock.getElapsedTime();
      const t = (time % 10) / 10; // 0 to 1 over 10 seconds

      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-viewport.width, viewport.height * 0.5, -10),
        new THREE.Vector3(-viewport.width * 0.5, viewport.height * 0.3, 10),
        new THREE.Vector3(viewport.width * 0.5, -viewport.height * 0.2, -5),
        new THREE.Vector3(viewport.width, -viewport.height * 0.5, 5),
      );

      const position = curve.getPoint(t);
      ref.current.position.copy(position);

      // Fade in and out
      const fade = Math.sin(t * Math.PI);
      ref.current.scale.setScalar(fade * 0.5 + 0.1);
    }
  });

  return (
    <Trail
      width={2}
      length={8}
      color='#ffffff'
      attenuation={(t) => {
        return t * t;
      }}
      stride={10}
    >
      <mesh ref={ref}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color='#ffffff' />
      </mesh>
    </Trail>
  );
}

// Interactive glowing orbs
function InteractiveOrb({ position, color }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock, mouse, viewport } = useThree();

  useFrame(({ mouse }) => {
    if (meshRef.current) {
      // Pulsing effect
      const time = clock.getElapsedTime();
      meshRef.current.scale.x = 1 + Math.sin(time * 0.8) * 0.1;
      meshRef.current.scale.y = 1 + Math.sin(time * 0.9) * 0.1;
      meshRef.current.scale.z = 1 + Math.sin(time * 1.0) * 0.1;

      // Interactive movement
      const dist = Math.sqrt(
        Math.pow(meshRef.current.position.x / viewport.width - mouse.x, 2) +
          Math.pow(meshRef.current.position.y / viewport.height - mouse.y, 2),
      );

      // If mouse is close, move slightly away
      if (dist < 0.5) {
        meshRef.current.position.x +=
          (meshRef.current.position.x / viewport.width - mouse.x) * 0.05;
        meshRef.current.position.y +=
          (meshRef.current.position.y / viewport.height - mouse.y) * 0.05;
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          distort={0.4}
          speed={5}
          roughness={0.2}
          metalness={0.8}
        />
        <Wireframe thickness={0.005} />
      </mesh>
    </Float>
  );
}

// Easter egg animation: Vortex
function VortexAnimation() {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  // Generate spiral points
  const count = 5000;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = (i / count) * Math.PI * 20;
      const radius = Math.pow(i / count, 0.5) * 5;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (i / count) * 5 - 2.5;
      positions[i3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1;
      camera.position.z = 10 + Math.sin(state.clock.elapsedTime * 0.3) * 3;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color='#ff3366'
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Easter egg animation: Matrix rain
function MatrixRainAnimation() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random points in a grid
  const count = 5000;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() * 2 - 1) * 10 + 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current && pointsRef.current.geometry.attributes.position) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] -= 0.1;
        if (positions[i3 + 1] < -10) {
          positions[i3 + 1] = 10;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color='#00ff66'
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Easter egg animation: Exploding particles
function ExplosionAnimation() {
  const pointsRef = useRef<THREE.Points>(null);
  const { clock } = useThree();

  // Generate random points in a sphere
  const count = 3000;
  const initialPositions = useMemo(() => {
    return Float32Array.from(inSphere(new Float32Array(count * 3), { radius: 0.1 }));
  }, [count]);

  const velocities = useMemo(() => {
    const vels = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      vels[i] = (Math.random() - 0.5) * 0.2;
      vels[i + 1] = (Math.random() - 0.5) * 0.2;
      vels[i + 2] = (Math.random() - 0.5) * 0.2;
    }
    return vels;
  }, [count]);

  useFrame(() => {
    if (pointsRef.current && pointsRef.current.geometry.attributes.position) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = clock.getElapsedTime();

      for (let i = 0; i < count * 3; i += 3) {
        positions[i] += velocities[i] * (1 + time * 0.5);
        positions[i + 1] += velocities[i + 1] * (1 + time * 0.5);
        positions[i + 2] += velocities[i + 2] * (1 + time * 0.5);
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={initialPositions} stride={3}>
      <PointMaterial
        transparent
        color='#ffaa00'
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Floating particles component
function FloatingParticles({ count = 2000 }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random points in a sphere
  const particlesPosition = useMemo(() => {
    return Float32Array.from(inSphere(new Float32Array(count * 3), { radius: 4 }));
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += delta * 0.02;
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <Points ref={pointsRef} positions={particlesPosition} stride={3}>
      <PointMaterial
        transparent
        color='#5555ff'
        size={0.025}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// The 3D animated component that will be rendered in Three.js
function Pulsar() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.5;
      meshRef.current.scale.x = 1 + Math.sin(clock.getElapsedTime() * 0.7) * 0.05;
      meshRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05;
      meshRef.current.scale.z = 1 + Math.sin(clock.getElapsedTime() * 0.9) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1, 0.3, 128, 32, 2, 3]} />
        <meshStandardMaterial color='#0066FF' emissive='#0044aa' metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  );
}

// The main component
export default function ComingSoonPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showInputField, setShowInputField] = useState(false);
  const [easterEggAnimation, setEasterEggAnimation] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isWorkspaceSubdomain, setIsWorkspaceSubdomain] = useState(false);
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const router = useRouter();

  // Password configuration
  const correctPassword = 'flyff';
  const easterEggPasswords = {
    matrix: 'green',
    vortex: 'spiral',
    explosion: 'boom',
  };

  // Check if we're on a workspace subdomain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];

      // If this is a workspace subdomain (not localhost, www, or main domain)
      if (hostname !== 'localhost' && subdomain !== 'www' && subdomain !== 'pulse-app') {
        setIsWorkspaceSubdomain(true);
        setWorkspaceName(subdomain);

        // If on a workspace subdomain, go directly to that workspace
        router.push(`/${subdomain}`);
      }

      // Listen for PWA install event
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        setInstallPrompt(e);
      });
    }
  }, [router]);

  // Handle password submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for correct password
    if (password === correctPassword) {
      // Redirect to bolo.hourblock.com
      router.push('https://bolo.hourblock.com/login');
      return;
    }

    // Check for easter egg passwords
    const foundEasterEgg = Object.entries(easterEggPasswords).find(([_, value]) => {
      return value === password;
    });

    if (foundEasterEgg) {
      setEasterEggAnimation(foundEasterEgg[0]);
      setShowInputField(false);
      return;
    }

    // If no match found
    setError('Incorrect password. Try again.');
    setPassword('');
  };

  // Toggle the visibility of the password input field
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowInputField(!showInputField);
      // Reset the easter egg animation when ESC is pressed
      if (easterEggAnimation) {
        setEasterEggAnimation(null);
      }
    }
  };

  // Handle PWA installation
  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;

    // We've used the prompt, and can't use it again, so clear it
    setInstallPrompt(null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showInputField, easterEggAnimation]);

  // Determine which animation to show
  const renderAnimation = () => {
    if (easterEggAnimation === 'vortex') {
      return <VortexAnimation />;
    } else if (easterEggAnimation === 'matrix') {
      return <MatrixRainAnimation />;
    } else if (easterEggAnimation === 'explosion') {
      return <ExplosionAnimation />;
    } else {
      // Default animation - The new galaxy animation
      return <GalaxyAnimation />;
    }
  };

  // If we're on a workspace subdomain, show nothing as we're redirecting
  if (isWorkspaceSubdomain) {
    return (
      <div className='h-screen w-screen flex items-center justify-center bg-black'>
        <div className='animate-pulse text-white text-lg'>Loading {workspaceName} workspace...</div>
      </div>
    );
  }

  return (
    <div className='h-screen w-screen relative overflow-hidden bg-black'>
      {/* Three.js Canvas */}
      <div className='absolute inset-0 z-0'>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} color='#0066FF' intensity={0.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <CameraShake
            maxYaw={0.02}
            maxPitch={0.02}
            maxRoll={0.02}
            yawFrequency={0.1}
            pitchFrequency={0.1}
            rollFrequency={0.1}
          />
          <Environment preset='night' />
          {renderAnimation()}
        </Canvas>
      </div>

      {/* PULSE Text */}
      <div className='absolute top-20 left-1/2 transform -translate-x-1/2 z-10'>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className='text-6xl font-bold text-white tracking-widest drop-shadow-[0_0_15px_rgba(0,102,255,0.8)]'
        >
          PULSE
        </motion.h1>
      </div>

      {/* Content Layer */}
      <div className='absolute inset-0 z-10 flex flex-col items-center justify-center p-4'>
        {authenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-center p-8 bg-black/40 backdrop-blur-sm rounded-2xl max-w-md mx-auto border border-blue-500/30 shadow-[0_0_15px_rgba(0,102,255,0.3)]'
          >
            <h1 className='text-3xl font-bold text-white mb-4'>Welcome to Pulse</h1>
            <p className='text-white/80 mb-6'>
              We&apos;re crafting something extraordinary. Our team is working diligently to bring
              you a revolutionary platform that will transform the way you work.
            </p>
            <p className='text-white/60 text-sm'>Launch Date: Coming Soon</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className='text-center'
          >
            <h1 className='text-4xl font-bold text-white mb-4 drop-shadow-[0_0_15px_rgba(0,102,255,0.7)]'>
              {easterEggAnimation
                ? `${easterEggAnimation.charAt(0).toUpperCase()}${easterEggAnimation.slice(
                    1,
                  )} Mode Activated`
                : 'Something Extraordinary Is Coming'}
            </h1>
            <p className='text-white/70 mb-8'>
              {easterEggAnimation ? 'Press ESC to return' : 'Press ESC to enter password'}
            </p>

            <AnimatePresence>
              {showInputField && !easterEggAnimation && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className='flex flex-col items-center'
                >
                  <input
                    type='password'
                    value={password}
                    onChange={(e) => {
                      return setPassword(e.target.value);
                    }}
                    placeholder='Enter password'
                    className='bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg outline-none border border-blue-500/30 focus:border-blue-500 transition-all w-64 mb-2 shadow-[0_0_15px_rgba(0,102,255,0.2)]'
                    autoFocus
                  />
                  {error && <p className='text-red-400 text-sm mb-2'>{error}</p>}
                  <button
                    type='submit'
                    className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-[0_0_10px_rgba(0,102,255,0.4)]'
                  >
                    Submit
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {easterEggAnimation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='mt-8 text-sm text-white/50'
              >
                <p>You discovered a secret animation!</p>
              </motion.div>
            )}

            {/* PWA Install Button */}
            {installPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='mt-8'
              >
                <button
                  onClick={handleInstallClick}
                  className='bg-blue-600/80 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 mr-2'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                    />
                  </svg>
                  Install App
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Interaction hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className='absolute bottom-14 left-1/2 transform -translate-x-1/2 text-white/50 text-xs'
      >
        Try moving your mouse to interact with the galaxy
      </motion.div>

      {/* Subtle hint text */}
      <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/30 text-xs'>
        Pulse • Coming Soon {easterEggAnimation ? `• ${easterEggAnimation} Mode` : ''}
      </div>
    </div>
  );
}
