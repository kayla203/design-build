import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Viewport3D = ({ selectedElements, className }) => {
  const [viewMode, setViewMode] = useState("SHELL");
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

    // Create skybox
    const skyLoader = new THREE.CubeTextureLoader();
    const skyboxTexture = skyLoader.load([
      require("../images/Sky/px.png"),
      require("../images/Sky/nx.png"),
      require("../images/Sky/py.png"),
      require("../images/Sky/ny.jpg"),
      require("../images/Sky/pz.png"),
      require("../images/Sky/nz.jpg"),
    ]);
    scene.background = skyboxTexture;

    // Load materials
    const textureLoader = new THREE.TextureLoader();
    const wallTexture = textureLoader.load(require("../images/mat.png"));
    const grassTexture = textureLoader.load(require("../images/grass.jpg"));
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    cameraRef.current = camera;
    camera.position.set(30, 20, 30);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer();
    rendererRef.current = renderer;
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
    const groundMaterial = new THREE.MeshPhongMaterial({
      map: grassTexture,
      // color: 0xffffff,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Create materials
    const wallMaterial = new THREE.MeshPhongMaterial({
      map: wallTexture,
      color: 0xcccccc,
    });
    const roofMaterial = new THREE.MeshPhongMaterial({
      map: wallTexture,
      color: 0x8b4513,
    });
    const trimMaterial = new THREE.MeshPhongMaterial({
      map: wallTexture,
      color: 0x4a4a4a,
    });

    // House dimensions (scaled down from feet to units)
    const width = 20;
    const depth = 20;
    const height = 10;

    // Create triangular wall shapes
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-width / 2, 0);
    wallShape.lineTo(width / 2, 0);
    wallShape.lineTo(width / 2, height);
    wallShape.lineTo(0, height + roofHeight);
    wallShape.lineTo(-width / 2, height);
    wallShape.lineTo(-width / 2, 0);

    const wallGeometry = new THREE.ShapeGeometry(wallShape);

    // Front wall
    const wallFront = new THREE.Mesh(wallGeometry, wallMaterial);
    wallFront.position.set(0, 0, depth / 2);
    meshesRef.current.wall_front = wallFront;
    scene.add(wallFront);

    // Back wall
    const wallBack = wallFront.clone();
    wallBack.position.z = -depth / 2;
    wallBack.rotation.y = Math.PI;
    meshesRef.current.wall_back = wallBack;
    scene.add(wallBack);

    // Side walls with adjusted height for roof
    const sideWallShape = new THREE.Shape();
    sideWallShape.moveTo(0, 0);
    sideWallShape.lineTo(depth, 0);
    sideWallShape.lineTo(depth, height);
    sideWallShape.lineTo(0, height);
    sideWallShape.lineTo(0, 0);

    const sideWallGeometry = new THREE.ShapeGeometry(sideWallShape);

    // Left wall
    const wallLeft = new THREE.Mesh(sideWallGeometry, wallMaterial);
    wallLeft.position.set(-width / 2, 0, depth / 2);
    wallLeft.rotation.y = -Math.PI / 2;
    meshesRef.current.wall_left = wallLeft;
    scene.add(wallLeft);

    // Right wall
    const wallRight = wallLeft.clone();
    wallRight.position.x = width / 2;
    wallRight.rotation.y = Math.PI / 2;
    meshesRef.current.wall_right = wallRight;
    scene.add(wallRight);

    // Roof with interlocking parts
    const roofHeight = 5;
    const roofOverhang = 1;
    const roofWidth = width + roofOverhang * 2;
    const roofDepth = depth + roofOverhang * 2;

    // Create interlocking roof geometry
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-roofWidth / 4, 0);
    roofShape.lineTo(roofWidth / 4, roofHeight);
    roofShape.lineTo(roofWidth / 2, 0);
    roofShape.lineTo(-roofWidth / 4, 0);

    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
      depth: roofDepth,
      bevelEnabled: false,
    });

    const roofLeft = new THREE.Mesh(roofGeometry, roofMaterial);
    roofLeft.position.set(-roofWidth / 4, height, roofDepth / 2);
    meshesRef.current.roof_left = roofLeft;
    scene.add(roofLeft);

    const roofRight = roofLeft.clone();
    roofRight.position.x = roofWidth / 4;
    roofRight.rotation.y = Math.PI;
    meshesRef.current.roof_right = roofRight;
    scene.add(roofRight);

    // Add trims
    const trimGeometry = new THREE.BoxGeometry(0.4, height, 0.4);
    const createTrim = (x, z) => {
      const trim = new THREE.Mesh(trimGeometry, trimMaterial);
      trim.position.set(x, height / 2, z);
      scene.add(trim);
    };

    // Add trims at wall corners
    createTrim(-width / 2, depth / 2);
    createTrim(width / 2, depth / 2);
    createTrim(-width / 2, -depth / 2);
    createTrim(width / 2, -depth / 2);

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
          mesh.material.wireframe = viewMode === "FRAME";
        } else {
          mesh.visible = selectedElements.includes(id);
          mesh.material.wireframe = viewMode === "FRAME";
        }
      });
    };

    // Add view mode toggle button
    const toggleViewMode = () => {
      setViewMode((prev) => (prev === "SHELL" ? "FRAME" : "SHELL"));
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
    const button = document.createElement("button");
    button.textContent = `View Mode: ${viewMode}`;
    button.style.position = "absolute";
    button.style.top = "10px";
    button.style.right = "10px";
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
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [selectedElements, viewMode]);

  return <div ref={mountRef} className={className} />;
};

export default Viewport3D;
