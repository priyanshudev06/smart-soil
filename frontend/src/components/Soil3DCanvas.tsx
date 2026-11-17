import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Soil3DCanvasProps {
  className?: string;
  height?: string;
}

export const Soil3DCanvas: React.FC<Soil3DCanvasProps> = ({ className = '', height = '260px' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const canvasHeight = mountRef.current.clientHeight || 260;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, 8, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 2, 20);
    pointLight.position.set(-4, 3, 2);
    scene.add(pointLight);

    // 3. Undulating 3D Soil Terrain Mesh
    const terrainGeo = new THREE.PlaneGeometry(16, 12, 32, 24);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.8 + Math.sin(x * 1.2) * 0.3;
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x223322,
      wireframe: true,
      roughness: 0.8,
      metalness: 0.1,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.set(0, -1, 0);
    scene.add(terrain);

    // 4. Floating 3D Nutrient Spheres (pH, N, P, K)
    const sphereGroup = new THREE.Group();

    // Emerald sphere (pH)
    const phGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const phMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.4
    });
    const phSphere = new THREE.Mesh(phGeo, phMat);
    phSphere.position.set(-3, 1.5, 0);
    sphereGroup.add(phSphere);

    // Blue sphere (Nitrogen)
    const nGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const nMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.4
    });
    const nSphere = new THREE.Mesh(nGeo, nMat);
    nSphere.position.set(-1, 2.2, 1);
    sphereGroup.add(nSphere);

    // Purple sphere (Phosphorus)
    const pGeo = new THREE.SphereGeometry(0.48, 32, 32);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.4
    });
    const pSphere = new THREE.Mesh(pGeo, pMat);
    pSphere.position.set(1.5, 1.8, -0.5);
    sphereGroup.add(pSphere);

    // Amber sphere (Potassium)
    const kGeo = new THREE.SphereGeometry(0.52, 32, 32);
    const kMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.4
    });
    const kSphere = new THREE.Mesh(kGeo, kMat);
    kSphere.position.set(3.2, 1.2, 0.5);
    sphereGroup.add(kSphere);

    scene.add(sphereGroup);

    // 5. Floating Dust / Bio-Particles
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = Math.random() * 5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.08,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Interactive Mouse Movement Listener
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      terrain.rotation.z = targetX * 0.1;
      terrain.rotation.x = -Math.PI / 2 + targetY * 0.08;

      // Floating spheres wave animation
      phSphere.position.y = 1.5 + Math.sin(elapsedTime * 1.5) * 0.25;
      nSphere.position.y = 2.2 + Math.cos(elapsedTime * 1.8) * 0.3;
      pSphere.position.y = 1.8 + Math.sin(elapsedTime * 1.2 + 1) * 0.25;
      kSphere.position.y = 1.2 + Math.cos(elapsedTime * 1.4 + 2) * 0.3;

      sphereGroup.rotation.y = elapsedTime * 0.15 + targetX * 0.3;

      // Particles rotation
      particles.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`w-full overflow-hidden rounded-3xl relative pointer-events-none ${className}`}
      style={{ height }}
    />
  );
};
