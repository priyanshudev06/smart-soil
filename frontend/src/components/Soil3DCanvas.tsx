import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Soil3DCanvasProps {
  className?: string;
  height?: string;
}

export const Soil3DCanvas: React.FC<Soil3DCanvasProps> = ({ className = '', height = '300px' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const canvasHeight = mountRef.current.clientHeight || 300;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, 7, 13);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting - Vertex architectural warm terracotta + steel blue palette
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xb02310, 2.0); // Terracotta rust
    dirLight1.position.set(6, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x396a94, 1.8); // Steel blue
    dirLight2.position.set(-6, 4, 3);
    scene.add(dirLight2);

    // 3. Architectural Contour Terrain (Wireframe + Grid)
    const terrainGeo = new THREE.PlaneGeometry(16, 12, 28, 20);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = Math.sin(x * 0.45) * Math.cos(z * 0.45) * 0.9 + Math.cos(x * 0.9) * 0.25;
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x1e0b09,
      wireframe: true,
      roughness: 0.6,
      metalness: 0.2,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.set(0, -1, 0);
    scene.add(terrain);

    // 4. Floating Luxury Geometric Crystals (representing Soil Health Factors)
    const crystalGroup = new THREE.Group();

    // Terracotta Icosahedron (pH Balance)
    const phGeo = new THREE.IcosahedronGeometry(0.7, 0);
    const phMat = new THREE.MeshStandardMaterial({
      color: 0xb02310,
      roughness: 0.2,
      metalness: 0.6,
      wireframe: false
    });
    const phMesh = new THREE.Mesh(phGeo, phMat);
    phMesh.position.set(-3.2, 1.8, 0);
    crystalGroup.add(phMesh);

    // Steel Blue Octahedron (Nitrogen)
    const nGeo = new THREE.OctahedronGeometry(0.65, 0);
    const nMat = new THREE.MeshStandardMaterial({
      color: 0x396a94,
      roughness: 0.2,
      metalness: 0.7,
    });
    const nMesh = new THREE.Mesh(nGeo, nMat);
    nMesh.position.set(-1, 2.5, 1);
    crystalGroup.add(nMesh);

    // Architectural Emerald Dodecahedron (Phosphorus)
    const pGeo = new THREE.DodecahedronGeometry(0.6, 0);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.3,
      metalness: 0.5,
    });
    const pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.position.set(1.4, 2.0, -0.6);
    crystalGroup.add(pMesh);

    // Amber Gold Crystal (Potassium)
    const kGeo = new THREE.TetrahedronGeometry(0.75, 0);
    const kMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.8,
    });
    const kMesh = new THREE.Mesh(kGeo, kMat);
    kMesh.position.set(3.4, 1.4, 0.6);
    crystalGroup.add(kMesh);

    scene.add(crystalGroup);

    // 5. Floating Dust / Agro Particles
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = Math.random() * 5.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xb02310,
      size: 0.08,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Interactive Mouse Movement
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

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      terrain.rotation.z = targetX * 0.12;
      terrain.rotation.x = -Math.PI / 2 + targetY * 0.1;

      // Crystals rotate and float elegantly
      phMesh.rotation.x += 0.01;
      phMesh.rotation.y += 0.015;
      phMesh.position.y = 1.8 + Math.sin(elapsedTime * 1.6) * 0.25;

      nMesh.rotation.y += 0.02;
      nMesh.rotation.z += 0.01;
      nMesh.position.y = 2.5 + Math.cos(elapsedTime * 1.8) * 0.3;

      pMesh.rotation.x += 0.015;
      pMesh.position.y = 2.0 + Math.sin(elapsedTime * 1.3 + 1) * 0.25;

      kMesh.rotation.y += 0.02;
      kMesh.rotation.x += 0.01;
      kMesh.position.y = 1.4 + Math.cos(elapsedTime * 1.5 + 2) * 0.3;

      crystalGroup.rotation.y = elapsedTime * 0.15 + targetX * 0.3;
      particles.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

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
      className={`w-full overflow-hidden relative pointer-events-none ${className}`}
      style={{ height }}
    />
  );
};
