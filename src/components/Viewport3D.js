import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Viewport3D = ({ selectedElements, className }) => {
  const scene = new THREE.Scene();
  const [viewMode, setViewMode] = useState("SHELL");
  const meshesRef = useRef({});
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  const createShape = (points, depth, position, rotation, material) => {
    
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }
    shape.lineTo(points[0].x, points[0].y);
    
    const extrudeSettings = {
      depth: depth,     // thickness in z-direction
      bevelEnabled: false
    };

    // 3. Create extruded geometry
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const mesh = new THREE.Mesh(geometry, material);
    const group = new THREE.Group();
    group.add(mesh);
    group.position.set(position.x, position.y, position.z);
    group.rotation.set(rotation.x, rotation.y, rotation.z);

    scene.add(group);
  }
  const createTrim = (thickness, height, trimMaterial,position, rotation) => {
    // Add trims
    const trimGeometry = new THREE.BoxGeometry(thickness, height, thickness);
    const trim = new THREE.Mesh(trimGeometry, trimMaterial);
    trim.rotation.set(rotation.x, rotation.y, rotation.z);
    trim.position.set(position.x, position.y, position.z);
    // trim.castShadow = true;
    scene.add(trim);
  }
  const createHouse = (width, length, height, depth, roofHeight, roofType, matWall, matRoof) => {
    const trim_thickness = 0.5;
    matWall.wrapS = THREE.RepeatWrapping;
    matWall.wrapT = THREE.RepeatWrapping;
    matWall.repeat.set(2, 4);

    matRoof.wrapS = THREE.RepeatWrapping;
    matRoof.wrapT = THREE.RepeatWrapping;
    matRoof.repeat.set(2, 4);

    const wallMaterial = new THREE.MeshPhongMaterial({
      map: matWall,
      color: 0xffffff,
      // side: new THREE.DoubleSide,
    });
    const roofMaterial = new THREE.MeshPhongMaterial({
      map: matRoof,
      color: 0xff0000,
      // side: new THREE.DoubleSide,
    });
    const trimMaterial = new THREE.MeshPhongMaterial({
      map: matRoof,
      color: 0x999999,
    });
    
    createTrim(trim_thickness, height, trimMaterial, new THREE.Vector3(width/2 - depth / 2, height/2, length/2), new THREE.Vector3(0, 0, 0));
    createTrim(trim_thickness, height, trimMaterial, new THREE.Vector3(- width/2 + depth / 2, height/2, length/2), new THREE.Vector3(0, 0, 0));
    createTrim(trim_thickness, height, trimMaterial, new THREE.Vector3(- width/2 + depth / 2, height/2, -length/2), new THREE.Vector3(0, 0, 0));
    createTrim(trim_thickness, height, trimMaterial, new THREE.Vector3(width/2 - depth / 2, height/2, -length/2), new THREE.Vector3(0, 0, 0));

    const points_hor = [
      new THREE.Vector2(width/2, height/2),
      new THREE.Vector2(-width/2, height/2),
      new THREE.Vector2(-width/2, -height/2),
      new THREE.Vector2(width/2, -height/2),
    ]

    // Left
    createShape(
      points_hor,
      depth,
      new THREE.Vector3(0, height/2, length/2 - depth/2),
      new THREE.Vector3(0, 0, 0),
      wallMaterial
    )

    // Right
    createShape(
      points_hor,
      depth,
      new THREE.Vector3(0, height/2, -length/2 - depth/2),
      new THREE.Vector3(0, 0, 0),
      wallMaterial
    )

    const points_ver = [
      new THREE.Vector2(height/2, length/2),
      new THREE.Vector2(-height/2, length/2),
      new THREE.Vector2(-height/2, -length/2),
      new THREE.Vector2(height/2, -length/2),
      new THREE.Vector2(height/2 + roofHeight, 0),
    ]
    
    const points_ver1 = [
      new THREE.Vector2(height/2, length/2),
      new THREE.Vector2(-height/2, length/2),
      new THREE.Vector2(-height/2 - roofHeight, 0),
      new THREE.Vector2(-height/2, -length/2),
      new THREE.Vector2(height/2, -length/2),
    ]
    
    // Front
    createShape(
      points_ver1,
      depth,
      new THREE.Vector3(width/2, height/2, 0),
      new THREE.Vector3(Math.PI/2, -Math.PI/2, 0),
      wallMaterial
    )

    // Back
    createShape(
      points_ver,
      depth,
      new THREE.Vector3(-width/2, height/2, 0),
      new THREE.Vector3(Math.PI/2, Math.PI/2, 0),
      wallMaterial
    )

    // Roof creation logic
    const createRoof = () => {
      const roofOverhang = 0;
      const roofWidth = width + roofOverhang * 2;
      const roofDepth = depth;
      const roofLength = Math.sqrt(length ** 2 / 4 + roofHeight ** 2);
      const angle = Math.acos(roofHeight / roofLength);
      // 4 side
      createTrim(
        trim_thickness, 
        roofLength, 
        trimMaterial, 
        new THREE.Vector3(width/2 - depth / 2, height + roofHeight / 2, -length / 4), 
        new THREE.Vector3(angle, 0, 0)
      );

      createTrim(
        trim_thickness, 
        roofLength, 
        trimMaterial, 
        new THREE.Vector3(width/2 - depth / 2, height + roofHeight / 2, length / 4), 
        new THREE.Vector3(-angle + Math.PI, 0, 0)
      );

      createTrim(
        trim_thickness, 
        roofLength, 
        trimMaterial, 
        new THREE.Vector3(-width/2 + depth / 2, height + roofHeight / 2, -length / 4), 
        new THREE.Vector3(angle , 0, 0)
      );
      
      createTrim(
        trim_thickness, 
        roofLength, 
        trimMaterial, 
        new THREE.Vector3(-width/2 + depth / 2, height + roofHeight / 2, length / 4), 
        new THREE.Vector3(-angle + Math.PI, 0, 0)
      );

      // top
      createTrim(
        trim_thickness, 
        width, 
        trimMaterial, 
        new THREE.Vector3(0, height + roofHeight, 0), 
        new THREE.Vector3(Math.PI / 4, 0, Math.PI / 2)
      );

      // 2 side
      createTrim(
        trim_thickness, 
        width, 
        trimMaterial, 
        new THREE.Vector3(0, height, length / 2), 
        new THREE.Vector3(0, 0, Math.PI / 2)
      );
      
      createTrim(
        trim_thickness, 
        width, 
        trimMaterial, 
        new THREE.Vector3(0, height, -length / 2), 
        new THREE.Vector3(0, 0, -Math.PI / 2)
      );

      const points_roof = [
        new THREE.Vector2(roofWidth/2, roofLength/2),
        new THREE.Vector2(-roofWidth/2, roofLength/2),
        new THREE.Vector2(-roofWidth/2, -roofLength/2),
        new THREE.Vector2(roofWidth/2, -roofLength/2),
      ]
      // Create interlocking roof geometry
     
      // Right roof
      createShape(
        points_roof,
        depth,
        new THREE.Vector3(0, height + roofHeight / 2 , -length/4 - depth/2),
        new THREE.Vector3(angle, 0, 0),
        roofMaterial
      )

      // Left roof
      createShape(
        points_roof,
        depth,
        new THREE.Vector3(0, height + roofHeight / 2, length/4 + depth/2),
        new THREE.Vector3(-angle + Math.PI, 0, 0),
        roofMaterial
      )
    };

    // Call createRoof within createHouse
    createRoof();
  }
  useEffect(() => {
    const axeshelper = new THREE.AxesHelper(100,100,100);
    scene.add(axeshelper);
    const textureLoader = new THREE.TextureLoader();
    createHouse(40, 20, 20, 0.3, 5, 1, textureLoader.load(require("../images/mat.png")), textureLoader.load(require("../images/mat.png")));
    // Add directional light for sunny day effect
  }, []);
  useEffect(() => {
    // Create skybox
    const skyLoader = new THREE.CubeTextureLoader();
    const skyboxTexture = skyLoader.load([
      require("../images/Sky/px.png"),
      require("../images/Sky/nx.png"),
      require("../images/Sky/pz.png"),
      require("../images/Sky/nz.jpg"),
      require("../images/Sky/ny.jpg"),
      require("../images/Sky/py.png"),
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
    camera.position.set(100, 20, 30);
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
      color: 0xffffff,
    });
    const roofMaterial = new THREE.MeshPhongMaterial({
      map: wallTexture,
      color: 0xff0000,
    });
    // const trimMaterial = new THREE.MeshPhongMaterial({
    //   map: wallTexture,
    //   color: 0x4a4a4a,
    // });

    // // House dimensions (scaled down from feet to units)
    // const width = 20;
    // const depth = 20;
    // const height = 10;
    // const roofHeight = 5;

    // // Create triangular wall shapes
    // const wallShape = new THREE.Shape();
    // wallShape.moveTo(-width / 2, 0);
    // wallShape.lineTo(width / 2, 0);
    // wallShape.lineTo(width / 2, height);
    // wallShape.lineTo(0, height + roofHeight);
    // wallShape.lineTo(-width / 2, height);
    // wallShape.lineTo(-width / 2, 0);

    // const wallGeometry = new THREE.ShapeGeometry(wallShape);

    // // Front wall
    // const wallFront = new THREE.Mesh(wallGeometry, wallMaterial);
    // wallFront.position.set(0, 0, depth / 2);
    // meshesRef.current.wall_front = wallFront;
    // scene.add(wallFront);

    // // Back wall
    // const wallBack = wallFront.clone();
    // wallBack.position.z = -depth / 2;
    // wallBack.rotation.y = Math.PI;
    // meshesRef.current.wall_back = wallBack;
    // scene.add(wallBack);

    // // Side walls with adjusted height for roof
    // const sideWallShape = new THREE.Shape();
    // sideWallShape.moveTo(0, 0);
    // sideWallShape.lineTo(depth, 0);
    // sideWallShape.lineTo(depth, height);
    // sideWallShape.lineTo(0, height);
    // sideWallShape.lineTo(0, 0);

    // const sideWallGeometry = new THREE.ShapeGeometry(sideWallShape);

    // // Left wall
    // const wallLeft = new THREE.Mesh(sideWallGeometry, wallMaterial);
    // wallLeft.position.set(-width / 2, 0, depth / 2);
    // wallLeft.rotation.y = -Math.PI / 2;
    // meshesRef.current.wall_left = wallLeft;
    // scene.add(wallLeft);

    // // Right wall
    // const wallRight = wallLeft.clone();
    // wallRight.position.x = width / 2;
    // wallRight.rotation.y = Math.PI / 2;
    // meshesRef.current.wall_right = wallRight;
    // scene.add(wallRight);

    // // Roof with interlocking parts
    // // const roofHeight = 5;
    // const roofOverhang = 1;
    // const roofWidth = width + roofOverhang * 2;
    // const roofDepth = depth + roofOverhang * 2;

    // // Create interlocking roof geometry
    // const roofShape = new THREE.Shape();
    // roofShape.moveTo(-roofWidth / 4, 0);
    // roofShape.lineTo(roofWidth / 4, roofHeight);
    // roofShape.lineTo(roofWidth / 2, 0);
    // roofShape.lineTo(-roofWidth / 4, 0);

    // const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
    //   depth: roofDepth,
    //   bevelEnabled: false,
    // });

    // const roofLeft = new THREE.Mesh(roofGeometry, roofMaterial);
    // roofLeft.position.set(-roofWidth / 4, height, roofDepth / 2);
    // meshesRef.current.roof_left = roofLeft;
    // scene.add(roofLeft);

    // const roofRight = roofLeft.clone();
    // roofRight.position.x = roofWidth / 4;
    // roofRight.rotation.y = Math.PI;
    // meshesRef.current.roof_right = roofRight;
    // scene.add(roofRight);

    // // Add trims
    // const trimGeometry = new THREE.BoxGeometry(0.4, height, 0.4);
    // const createTrim = (x, z) => {
    //   const trim = new THREE.Mesh(trimGeometry, trimMaterial);
    //   trim.position.set(x, height / 2, z);
    //   scene.add(trim);
    // };

    // // Add trims at wall corners
    // createTrim(-width / 2, depth / 2);
    // createTrim(width / 2, depth / 2);
    // createTrim(-width / 2, -depth / 2);
    // createTrim(width / 2, -depth / 2);

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
    button.style.right = "30px";
    button.style.padding = "7px 20px";
    button.style.fontSize = "13px";
    button.style.fontWeight = "bold";
    button.style.color = "#fff";
    button.style.background = "linear-gradient(45deg, #6a11cb, #2575fc)";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    button.style.cursor = "pointer";
    button.style.transition = "transform 0.2s, box-shadow 0.2s";
    button.onmouseover = () => {
      button.style.transform = "scale(1.1)";
      button.style.boxShadow = "0 6px 10px rgba(0, 0, 0, 0.2)";
    };
    button.onmouseout = () => {
      button.style.transform = "scale(1)";
      button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    };
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
