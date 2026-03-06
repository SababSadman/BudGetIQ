import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../stores/useAppStore';

function ZenSphere({ zenScore }) {
    const meshRef = useRef();
    const target = useRef({ distort: 0.2, speed: 1, r: 0.5, g: 0.4, b: 1.0 });

    // Map zenScore (1=calm, 0=stressed) → visual properties
    const desired = useMemo(() => {
        const stress = 1 - zenScore;
        return {
            distort: 0.1 + stress * 0.65,        // calm=smooth, stressed=jagged
            speed: 0.5 + stress * 3.0,          // calm=slow, stressed=fast
            r: 0.45 + stress * 0.4,               // stressed shifts toward red
            g: 0.35 - stress * 0.2,
            b: 0.95 - stress * 0.6,
        };
    }, [zenScore]);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const t = clock.getElapsedTime();

        // Lerp toward desired values for smooth transitions
        const lerp = (a, b, f) => a + (b - a) * f;
        const dt = 0.008;
        const d = target.current;
        d.distort = lerp(d.distort, desired.distort, dt);
        d.speed = lerp(d.speed, desired.speed, dt);
        d.r = lerp(d.r, desired.r, dt);
        d.g = lerp(d.g, desired.g, dt);
        d.b = lerp(d.b, desired.b, dt);

        if (meshRef.current.material) {
            meshRef.current.material.distort = d.distort;
            meshRef.current.material.speed = d.speed;
            meshRef.current.material.color.setRGB(d.r, d.g, d.b);
        }

        // Gentle rotation
        meshRef.current.rotation.y = t * 0.12;
        meshRef.current.rotation.x = Math.sin(t * 0.07) * 0.08;
    });

    return (
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
            <mesh ref={meshRef} castShadow>
                <sphereGeometry args={[1.4, 128, 128]} />
                <MeshDistortMaterial
                    color={new THREE.Color(0.5, 0.35, 0.95)}
                    distort={0.2}
                    speed={1}
                    roughness={0.08}
                    metalness={0.15}
                    transparent
                    opacity={0.95}
                />
            </mesh>
        </Float>
    );
}

function ParticleField({ zenScore }) {
    const points = useRef();
    const positions = useMemo(() => {
        const arr = new Float32Array(300 * 3);
        for (let i = 0; i < 300; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 8;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
        return arr;
    }, []);

    useFrame(({ clock }) => {
        if (points.current) {
            points.current.rotation.y = clock.getElapsedTime() * 0.04;
            points.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.05;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.025}
                color={zenScore > 0.5 ? '#818cf8' : '#f87171'}
                transparent
                opacity={0.5}
                sizeAttenuation
            />
        </points>
    );
}

export default function ThreeCanvas() {
    const zenScore = useAppStore(s => s.getZenScore());

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <pointLight position={[-3, 3, 3]} intensity={0.8} color="#818cf8" />
                <pointLight position={[3, -3, -3]} intensity={0.5} color="#c4b5fd" />
                <Environment preset="city" />

                <ZenSphere zenScore={zenScore} />
                <ParticleField zenScore={zenScore} />
            </Canvas>

            {/* Zen score label */}
            <div style={{
                position: 'absolute', bottom: '1rem', left: 0, right: 0,
                textAlign: 'center', pointerEvents: 'none',
            }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    FINANCIAL ZEN
                </span>
                <div style={{
                    fontSize: '2rem', fontWeight: 700, color: 'var(--accent)',
                    lineHeight: 1, marginTop: '0.15rem',
                    textShadow: '0 0 20px var(--accent-glow)',
                }}>
                    {Math.round(zenScore * 100)}
                </div>
            </div>
        </div>
    );
}
