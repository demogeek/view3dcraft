
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// File types we support
export const supportedFileTypes = ['.stl', '.obj', '.gltf', '.glb'];

// Helper to determine file type
export const getFileExtension = (filename: string): string => {
  return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
};

// Material options
export const materialOptions = [
  { name: 'Standard', value: 'standard' },
  { name: 'Basic', value: 'basic' },
  { name: 'Phong', value: 'phong' },
  { name: 'Lambert', value: 'lambert' },
  { name: 'Toon', value: 'toon' },
  { name: 'Normal', value: 'normal' },
  { name: 'Wireframe', value: 'wireframe' },
];

// Apply material to object
export const applyMaterial = (object: THREE.Object3D, materialType: string, color: THREE.Color): void => {
  let material: THREE.Material;

  switch (materialType) {
    case 'basic':
      material = new THREE.MeshBasicMaterial({ color, wireframe: false });
      break;
    case 'phong':
      material = new THREE.MeshPhongMaterial({ 
        color, 
        shininess: 60,
        specular: new THREE.Color(0x111111)
      });
      break;
    case 'lambert':
      material = new THREE.MeshLambertMaterial({ color });
      break;
    case 'toon':
      material = new THREE.MeshToonMaterial({ color });
      break;
    case 'normal':
      material = new THREE.MeshNormalMaterial();
      break;
    case 'wireframe':
      material = new THREE.MeshBasicMaterial({ color, wireframe: true });
      break;
    case 'standard':
    default:
      material = new THREE.MeshStandardMaterial({ 
        color, 
        metalness: 0.2, 
        roughness: 0.5 
      });
      break;
  }

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = material;
    }
  });
};

// Load a 3D model from a file
export const loadModel = async (
  file: File,
  onProgress?: (event: ProgressEvent) => void
): Promise<THREE.Object3D> => {
  // Get the file extension without the dot
  const extension = getFileExtension(file.name);
  const fileURL = URL.createObjectURL(file);
  
  console.log(`Loading file: ${file.name}, detected extension: ${extension}`);

  return new Promise<THREE.Object3D>((resolve, reject) => {
    let loader;
    
    switch (extension) {
      case 'stl':
        loader = new STLLoader();
        loader.load(
          fileURL,
          (geometry) => {
            const material = new THREE.MeshStandardMaterial({ 
              color: 0xC0C0C0,
              metalness: 0.2,
              roughness: 0.5,
            });
            const mesh = new THREE.Mesh(geometry, material);
            resolve(mesh);
          },
          onProgress,
          (error) => {
            console.error('Error loading STL:', error);
            reject(error);
          }
        );
        break;

      case 'obj':
        loader = new OBJLoader();
        loader.load(
          fileURL,
          (object) => {
            // Apply material to all meshes in the object
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({ 
                  color: 0xC0C0C0,
                  metalness: 0.2,
                  roughness: 0.5,
                });
              }
            });
            resolve(object);
          },
          onProgress,
          (error) => {
            console.error('Error loading OBJ:', error);
            reject(error);
          }
        );
        break;

      case 'gltf':
      case 'glb':
        loader = new GLTFLoader();
        loader.load(
          fileURL,
          (gltf) => {
            resolve(gltf.scene);
          },
          onProgress,
          (error) => {
            console.error('Error loading GLTF/GLB:', error);
            reject(error);
          }
        );
        break;

      default:
        console.error(`Unsupported file type: .${extension}`);
        reject(new Error(`Unsupported file type: .${extension}`));
        // Create an empty object to satisfy TypeScript
        const defaultObject = new THREE.Object3D();
        defaultObject.name = "error-object";
        resolve(defaultObject);
    }
  }).finally(() => {
    // Clean up the URL when done
    URL.revokeObjectURL(fileURL);
  });
};

// Export model to a different format
export const exportModel = (object: THREE.Object3D, format: string, filename: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      let result: any;
      let mimeType: string;
      let exportedFilename = filename.substring(0, filename.lastIndexOf('.')) || filename;
      
      switch (format) {
        case 'stl':
          const stlExporter = new STLExporter();
          result = stlExporter.parse(object, { binary: true });
          mimeType = 'application/octet-stream';
          exportedFilename += '.stl';
          break;
          
        case 'obj':
          const objExporter = new OBJExporter();
          result = objExporter.parse(object);
          mimeType = 'text/plain';
          exportedFilename += '.obj';
          break;
          
        case 'gltf':
        case 'glb':
          const gltfExporter = new GLTFExporter();
          gltfExporter.parse(
            object,
            (gltf) => {
              result = format === 'glb' ? gltf : JSON.stringify(gltf);
              mimeType = format === 'glb' ? 'application/octet-stream' : 'application/json';
              exportedFilename += format === 'glb' ? '.glb' : '.gltf';
              
              const blob = new Blob([result], { type: mimeType });
              resolve(blob);
            },
            (error) => {
              reject(error);
            },
            { binary: format === 'glb' }
          );
          return; // Early return because GLTFExporter is async
          
        default:
          reject(new Error(`Unsupported export format: ${format}`));
          return;
      }
      
      // For STL and OBJ which are handled synchronously
      const blob = new Blob([result], { type: mimeType });
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
};

// Calculate surface area of model
export const calculateSurfaceArea = (object: THREE.Object3D): number => {
  let totalArea = 0;
  
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      // For BufferGeometry
      if (child.geometry.index !== null) {
        const position = child.geometry.attributes.position;
        const index = child.geometry.index;
        
        for (let i = 0; i < index.count; i += 3) {
          const a = new THREE.Vector3().fromBufferAttribute(position, index.getX(i));
          const b = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 1));
          const c = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 2));
          
          // Calculate two edges of the triangle
          const edge1 = new THREE.Vector3().subVectors(b, a);
          const edge2 = new THREE.Vector3().subVectors(c, a);
          
          // Cross product to get the area
          const areaVector = new THREE.Vector3().crossVectors(edge1, edge2);
          const area = 0.5 * areaVector.length();
          
          totalArea += area;
        }
      } else if (child.geometry.attributes.position) {
        // Non-indexed BufferGeometry
        const position = child.geometry.attributes.position;
        
        for (let i = 0; i < position.count; i += 3) {
          const a = new THREE.Vector3().fromBufferAttribute(position, i);
          const b = new THREE.Vector3().fromBufferAttribute(position, i + 1);
          const c = new THREE.Vector3().fromBufferAttribute(position, i + 2);
          
          // Calculate two edges of the triangle
          const edge1 = new THREE.Vector3().subVectors(b, a);
          const edge2 = new THREE.Vector3().subVectors(c, a);
          
          // Cross product to get the area
          const areaVector = new THREE.Vector3().crossVectors(edge1, edge2);
          const area = 0.5 * areaVector.length();
          
          totalArea += area;
        }
      }
    }
  });
  
  return totalArea;
};

// Calculate angle between two vectors
export const calculateAngle = (v1: THREE.Vector3, v2: THREE.Vector3): number => {
  // Normalize the vectors
  const v1Normalized = v1.clone().normalize();
  const v2Normalized = v2.clone().normalize();
  
  // Calculate dot product
  const dotProduct = v1Normalized.dot(v2Normalized);
  
  // Calculate angle in radians and convert to degrees
  return Math.acos(Math.max(-1, Math.min(1, dotProduct))) * (180 / Math.PI);
};

// Center model and adjust camera
export const centerModel = (
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
): void => {
  // Calculate bounding box
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  // Center the object
  object.position.sub(center);

  // Reset controls target to center of object
  controls.target.set(0, 0, 0);
  controls.update();

  // Position camera based on bounding box
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov;
  const cameraZ = maxDim / 2 / Math.tan((fov * Math.PI) / 360);

  // Set camera position and look at center
  camera.position.set(0, 0, cameraZ * 1.5);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
};

// Toggle between perspective and orthographic camera
export const toggleCameraType = (
  container: HTMLElement,
  currentCamera: THREE.Camera,
  controls: OrbitControls,
  renderer: THREE.WebGLRenderer
): { camera: THREE.Camera; controls: OrbitControls } => {
  // Store the current position and target
  const position = new THREE.Vector3();
  currentCamera.getWorldPosition(position);
  const target = controls.target.clone();
  
  let newCamera;
  
  // If current camera is perspective, switch to orthographic
  if (currentCamera.type === 'PerspectiveCamera') {
    const perspCamera = currentCamera as THREE.PerspectiveCamera;
    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 5;
    
    newCamera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
  } 
  // If current camera is orthographic, switch to perspective
  else {
    newCamera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
  }
  
  // Set the new camera's position to match the old one
  newCamera.position.copy(position);
  newCamera.lookAt(target);
  
  // Create new controls
  controls.dispose();
  const newControls = new OrbitControls(newCamera, renderer.domElement);
  newControls.target.copy(target);
  newControls.update();
  
  // Configure the new controls to match the previous settings
  newControls.enableDamping = true;
  newControls.dampingFactor = 0.1;
  newControls.rotateSpeed = 0.7;
  newControls.panSpeed = 0.7;
  newControls.zoomSpeed = 1.2;
  
  return { camera: newCamera, controls: newControls };
};

// Set up a basic scene
export const setupScene = (container: HTMLElement): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  animate: () => void;
} => {
  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace; // Using outputColorSpace instead of deprecated outputEncoding
  container.appendChild(renderer.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(1, 1, 1);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-1, -1, -1);
  scene.add(directionalLight2);

  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.7;
  controls.panSpeed = 0.7;
  controls.zoomSpeed = 1.2;

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  // Handle window resizes
  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', handleResize);

  return { scene, camera, renderer, controls, animate };
};

// Helper function to add a grid to the scene
export const addGrid = (scene: THREE.Scene) => {
  const grid = new THREE.GridHelper(10, 10, 0xaaaaaa, 0xe0e0e0);
  grid.position.y = -0.01; // Slightly below the object to avoid z-fighting
  scene.add(grid);
  return grid;
};

// Add axes helper to the scene
export const addAxesHelper = (scene: THREE.Scene) => {
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  return axesHelper;
};

// Set Y-axis up
export const setYAxisUp = (object: THREE.Object3D) => {
  if (!object) return;
  
  // Rotate to set Y-axis up
  object.rotation.set(-Math.PI / 2, 0, 0);
};

// Flip Z-axis (up vector)
export const flipZAxis = (object: THREE.Object3D) => {
  if (!object) return;
  
  // Flip the object along the Z axis
  object.rotation.z += Math.PI;
};

// Change the material color of a model
export const changeModelColor = (object: THREE.Object3D, color: THREE.Color) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.material instanceof THREE.Material) {
        // Type guard to check if material has color property
        if ('color' in child.material && child.material.color instanceof THREE.Color) {
          (child.material as THREE.MeshStandardMaterial).color = color;
        }
      } else if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          // Type guard to check if material has color property
          if ('color' in material && material.color instanceof THREE.Color) {
            (material as THREE.MeshStandardMaterial).color = color;
          }
        });
      }
    }
  });
};
