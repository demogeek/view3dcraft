
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { useToast } from '@/components/ui/use-toast';
import {
  loadModel,
  setupScene,
  centerModel,
  addGrid,
  addAxesHelper,
  changeModelColor,
  applyMaterial,
  getFileExtension,
  supportedFileTypes,
  exportModel,
  calculateSurfaceArea,
  setYAxisUp,
  flipZAxis,
  toggleCameraType
} from '@/lib/three-utils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ViewerProps {
  file: File | null;
  onModelLoaded: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

const Viewer = forwardRef<any, ViewerProps>(({ file, onModelLoaded, onLoadingChange }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [cameraType, setCameraType] = useState<string>('perspective');

  // Expose methods to parent component through ref
  useImperativeHandle(ref, () => ({
    resetView: () => resetView(),
    toggleGrid: () => toggleGrid(),
    downloadModel: () => downloadModel(),
    changeModelColorHandler: (color: string) => changeModelColorHandler(color),
    changeModelMaterialHandler: (material: string) => changeModelMaterialHandler(material),
    exportModelHandler: (format: string) => exportModelHandler(format),
    calculateAreaHandler: () => calculateAreaHandler(),
    setYAxisUpHandler: () => setYAxisUpHandler(),
    flipZAxisHandler: () => flipZAxisHandler(),
    toggleCameraTypeHandler: () => toggleCameraTypeHandler(),
    fitToWindowHandler: () => fitToWindowHandler(),
    getCameraType: () => cameraType
  }));

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup scene
    const {
      scene,
      camera,
      renderer,
      controls,
      animate
    } = setupScene(containerRef.current);
    
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    
    // Add grid
    gridRef.current = addGrid(scene);
    
    // Add axes helper
    axesHelperRef.current = addAxesHelper(scene);
    
    // Start animation loop
    const animationId = requestAnimationFrame(animate);
    animationFrameRef.current = animationId;
    
    // Clean up on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      renderer.dispose();
      controls.dispose();
      
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      if (cameraRef.current.type === 'PerspectiveCamera') {
        (cameraRef.current as THREE.PerspectiveCamera).aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      } else if (cameraRef.current.type === 'OrthographicCamera') {
        const orthoCamera = cameraRef.current as THREE.OrthographicCamera;
        const frustumSize = 5;
        const aspect = width / height;
        orthoCamera.left = frustumSize * aspect / -2;
        orthoCamera.right = frustumSize * aspect / 2;
        orthoCamera.top = frustumSize / 2;
        orthoCamera.bottom = frustumSize / -2;
        orthoCamera.updateProjectionMatrix();
      }
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Load model when file changes
  useEffect(() => {
    if (!file || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
    
    const loadFile = async () => {
      try {
        // Validate file type correctly
        const extension = getFileExtension(file.name);
        const validExtensions = supportedFileTypes.map(ext => ext.slice(1)); // Remove the dots
        
        if (!validExtensions.includes(extension)) {
          toast({
            title: "Unsupported file format",
            description: `Please upload one of these supported formats: ${supportedFileTypes.join(', ')}`,
            variant: "destructive"
          });
          onLoadingChange(false);
          return;
        }

        onLoadingChange(true);
        
        // Remove previous model if it exists
        if (modelRef.current) {
          sceneRef.current?.remove(modelRef.current);
          modelRef.current = null;
        }
        
        console.log(`Starting to load file: ${file.name}, extension: ${extension}`);
        
        // Load the new model
        const object = await loadModel(file, (event) => {
          // Handle loading progress if needed
          console.log(`Loading: ${Math.round((event.loaded / event.total) * 100)}%`);
        });
        
        console.log(`Model loaded successfully: ${object.uuid}`);
        
        // Add to scene
        sceneRef.current?.add(object);
        
        // Save reference
        modelRef.current = object;
        
        // Center model
        centerModel(object, cameraRef.current as THREE.PerspectiveCamera, controlsRef.current);
        
        // Notify parent
        onModelLoaded();
        
        toast({
          title: "Model loaded successfully",
          description: "You can now interact with your 3D model.",
        });
      } catch (error) {
        console.error('Error loading model:', error);
        toast({
          title: "Error loading model",
          description: error instanceof Error ? error.message : "There was a problem loading your 3D model.",
          variant: "destructive"
        });
      } finally {
        onLoadingChange(false);
      }
    };
    
    loadFile();
  }, [file, onModelLoaded, onLoadingChange, toast]);
  
  // Reset view to default
  const resetView = () => {
    if (!cameraRef.current || !controlsRef.current || !modelRef.current) return;
    
    // Reset camera and controls
    centerModel(modelRef.current, cameraRef.current as THREE.PerspectiveCamera, controlsRef.current);
  };

  // Fit model to window
  const fitToWindowHandler = () => {
    if (!modelRef.current || !cameraRef.current || !controlsRef.current) return;
    
    // Reset view which includes centering and fitting
    resetView();
    
    toast({
      title: "View Reset",
      description: "Model has been centered and fitted to the view.",
    });
  };
  
  // Toggle grid visibility
  const toggleGrid = () => {
    if (!gridRef.current) return;
    
    const newVisibility = !isGridVisible;
    gridRef.current.visible = newVisibility;
    setIsGridVisible(newVisibility);
    
    toast({
      title: `Grid ${newVisibility ? 'Shown' : 'Hidden'}`,
      description: `The grid has been ${newVisibility ? 'enabled' : 'disabled'}.`,
    });
  };
  
  // Change model color
  const changeModelColorHandler = (colorHex: string) => {
    if (!modelRef.current) return;
    
    const color = new THREE.Color(colorHex);
    changeModelColor(modelRef.current, color);
    
    toast({
      title: "Color Changed",
      description: "The model color has been updated.",
    });
  };
  
  // Change model material
  const changeModelMaterialHandler = (materialType: string) => {
    if (!modelRef.current) return;
    
    // Get current color from the model
    let currentColor = new THREE.Color(0xC0C0C0); // Default color
    
    // Try to extract current color from the model
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        if ('color' in child.material && child.material.color instanceof THREE.Color) {
          currentColor = (child.material as THREE.MeshStandardMaterial).color.clone();
          return; // Stop after finding first color
        }
      }
    });
    
    // Apply the new material with the same color
    applyMaterial(modelRef.current, materialType, currentColor);
    
    toast({
      title: "Material Changed",
      description: `Applied ${materialType} material to the model.`,
    });
  };
  
  // Set Y-Axis Up
  const setYAxisUpHandler = () => {
    if (!modelRef.current) return;
    
    setYAxisUp(modelRef.current);
    
    toast({
      title: "Orientation Changed",
      description: "Y-axis is now set as up vector.",
    });
  };
  
  // Flip Z-Axis
  const flipZAxisHandler = () => {
    if (!modelRef.current) return;
    
    flipZAxis(modelRef.current);
    
    toast({
      title: "Orientation Changed",
      description: "Z-axis has been flipped.",
    });
  };
  
  // Toggle camera type between perspective and orthographic
  const toggleCameraTypeHandler = () => {
    if (!containerRef.current || !cameraRef.current || !controlsRef.current || !rendererRef.current) return;
    
    const { camera, controls } = toggleCameraType(
      containerRef.current,
      cameraRef.current,
      controlsRef.current,
      rendererRef.current
    );
    
    // Update refs with new camera and controls
    cameraRef.current = camera;
    controlsRef.current = controls;
    
    // Update camera type state
    setCameraType(camera.type === 'PerspectiveCamera' ? 'perspective' : 'orthographic');
    
    toast({
      title: "Camera Changed",
      description: `Switched to ${camera.type === 'PerspectiveCamera' ? 'perspective' : 'orthographic'} camera.`,
    });
  };
  
  // Calculate surface area
  const calculateAreaHandler = () => {
    if (!modelRef.current) return;
    
    const area = calculateSurfaceArea(modelRef.current);
    
    toast({
      title: "Surface Area",
      description: `The model has a surface area of ${area.toFixed(2)} square units.`,
    });
  };
  
  // Export model to a different format
  const exportModelHandler = async (format: string): Promise<void> => {
    if (!modelRef.current || !file) return Promise.reject(new Error('No model to export'));
    
    try {
      const blob = await exportModel(modelRef.current, format, file.name);
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      link.download = `${originalName}.${format}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 100);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error exporting model:', error);
      return Promise.reject(error);
    }
  };
  
  // Download the current model
  const downloadModel = () => {
    if (!file) return Promise.reject(new Error('No model to download'));
    
    return new Promise<void>((resolve) => {
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
        resolve();
      }, 100);
    });
  };
  
  return (
    <div ref={containerRef} id="canvas-container" className="relative">
      {/* Controls for handling model interactions */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          className="control-button"
          onClick={resetView}
          title="Reset View"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
        
        <button 
          className={`control-button ${isGridVisible ? 'bg-primary text-white hover:bg-primary/90' : ''}`}
          onClick={toggleGrid}
          title="Toggle Grid"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
          </svg>
        </button>
      </div>
    </div>
  );
});

Viewer.displayName = 'Viewer';

export default Viewer;
