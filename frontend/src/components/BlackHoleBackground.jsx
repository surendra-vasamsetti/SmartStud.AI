import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function BlackHole() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.z += 0.002;
    }
  });

  return (
    <group position={[0, 4.5, -2]} rotation={[1.4, 0, 0]}> {/* Higher tilt for horizon look */}
        {/* Main Accretion Disk - Flattened */}
        <mesh ref={meshRef}>
            <torusGeometry args={[5, 0.4, 64, 100]} /> {/* Larger radius, thinner tube */}
            <meshStandardMaterial 
                color="#a855f7" 
                emissive="#7c3aed"
                emissiveIntensity={3}
                transparent
                opacity={0.7}
                roughness={0}
                metalness={0.8}
            />
        </mesh>
        
        {/* Secondary Inner Glow */}
        <mesh rotation={[0,0,0]} scale={[0.95, 0.95, 1]}>
             <torusGeometry args={[4.5, 0.1, 32, 100]} />
             <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>

        {/* Event Horizon (Black Void) */}
        <mesh scale={[1, 0.8, 1]}> {/* Flattened sphere slightly */}
            <sphereGeometry args={[4.2, 64, 64]} />
            <meshBasicMaterial color="#000000" />
        </mesh>
        
        {/* Upper Glow (Lensing Effect approximation) */}
         <mesh position={[0, 2, -1]} rotation={[-1.2, 0, 0]} scale={[1, 0.5, 1]}>
            <torusGeometry args={[5.2, 0.2, 32, 100]} />
            <meshBasicMaterial color="#d8b4fe" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
    </group>
  );
};

const RotatingStars = () => {
    const starsRef = useRef();
    useFrame(() => {
        if (starsRef.current) {
            starsRef.current.rotation.y -= 0.0005;
        }
    });
    return (
        <group ref={starsRef}>
            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
};

export default function BlackHoleBackground() {
  return (
    <div className="fixed inset-0 z-0 h-full w-full bg-[#030014]">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#B49BFF"/>
        <BlackHole />
        <RotatingStars />
      </Canvas>
      {/* Overlay Gradient for seamless blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030014]/50 to-[#030014] pointer-events-none"></div>
    </div>
  );
}
