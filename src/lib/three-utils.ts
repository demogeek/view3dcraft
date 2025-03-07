
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// File types we support
export const supportedFileTypes = ['.stl', '.obj', '.gltf', '.glb'];

// Helper to determine file type
export const getFileExtension = (filename: string): string => {
  return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
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
        // Return a default object to satisfy TypeScript
        const defaultObject = new THREE.Object3D();
        defaultObject.name = "error-object";
        resolve(defaultObject);
    }
  }).finally(() => {
    // Clean up the URL when done
    URL.revokeObjectURL(fileURL);
  });
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
