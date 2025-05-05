
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Viewport3D = ({ selectedElements, className }) => {
  const [viewMode, setViewMode] = useState('SHELL');
  const meshesRef = useRef({});
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer();
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Create house components
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

    // Front wall
    const wallFront = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 0.2),
      wallMaterial
    );
    wallFront.position.set(0, 1.5, 2);
    meshesRef.current.wall_front = wallFront;
    scene.add(wallFront);

    // Back wall
    const wallBack = wallFront.clone();
    wallBack.position.z = -2;
    meshesRef.current.wall_back = wallBack;
    scene.add(wallBack);

    // Left wall
    const wallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3, 4),
      wallMaterial
    );
    wallLeft.position.set(-2, 1.5, 0);
    meshesRef.current.wall_left = wallLeft;
    scene.add(wallLeft);

    // Right wall
    const wallRight = wallLeft.clone();
    wallRight.position.x = 2;
    meshesRef.current.wall_right = wallRight;
    scene.add(wallRight);

    // Roof parts
    const roofGeometry = new THREE.BoxGeometry(4.4, 0.2, 3);
    const roofLeft = new THREE.Mesh(roofGeometry, roofMaterial);
    roofLeft.position.set(-1.1, 3.1, 0);
    roofLeft.rotation.z = Math.PI / 6;
    meshesRef.current.roof_left = roofLeft;
    scene.add(roofLeft);

    const roofRight = new THREE.Mesh(roofGeometry, roofMaterial);
    roofRight.position.set(1.1, 3.1, 0);
    roofRight.rotation.z = -Math.PI / 6;
    meshesRef.current.roof_right = roofRight;
    scene.add(roofRight);

    // Add directional light for sunny day effect
    const sunLight = new THREE.DirectionalLight(0xffffbb, 1.5);
    sunLight.position.set(5, 10, 7);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x404040));

    // Handle element selection and view mode
    const updateVisibility = () => {
      Object.entries(meshesRef.current).forEach(([id, mesh]) => {
        if (selectedElements.length === 0) {
          mesh.visible = true;
          mesh.material.wireframe = viewMode === 'FRAME';
        } else {
          mesh.visible = selectedElements.includes(id);
          mesh.material.wireframe = viewMode === 'FRAME';
        }
      });
    };

    // Add view mode toggle button
    const toggleViewMode = () => {
      setViewMode(prev => prev === 'SHELL' ? 'FRAME' : 'SHELL');
      updateVisibility();
    };

    // Update camera position for selected element
    if (selectedElements.length === 1) {
      const selectedMesh = meshesRef.current[selectedElements[0]];
      if (selectedMesh) {
        camera.position.copy(selectedMesh.position);
        camera.position.z += 5;
        camera.lookAt(selectedMesh.position);
      }
    }

    // Add button to DOM
    const button = document.createElement('button');
    button.textContent = `View Mode: ${viewMode}`;
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.right = '10px';
    button.onclick = toggleViewMode;
    mountRef.current.appendChild(button);

    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [selectedElements, viewMode]);

  return <div ref={mountRef} className={className} />;
};

export default Viewport3D;
