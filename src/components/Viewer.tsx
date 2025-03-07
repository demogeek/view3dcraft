
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useToast } from '@/components/ui/use-toast';
import {
  loadModel,
  setupScene,
  centerModel,
  addGrid,
  changeModelColor
} from '@/lib/three-utils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ViewerProps {
  file: File | null;
  onModelLoaded: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

const Viewer: React.FC<ViewerProps> = ({ file, onModelLoaded, onLoadingChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const [isGridVisible, setIsGridVisible] = useState(true);

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
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
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
        onLoadingChange(true);
        
        // Remove previous model if it exists
        if (modelRef.current) {
          sceneRef.current?.remove(modelRef.current);
          modelRef.current = null;
        }
        
        // Load the new model
        const object = await loadModel(file, (event) => {
          // Handle loading progress if needed
          console.log(`Loading: ${Math.round((event.loaded / event.total) * 100)}%`);
        });
        
        // Add to scene
        sceneRef.current?.add(object);
        
        // Save reference
        modelRef.current = object;
        
        // Center model
        centerModel(object, cameraRef.current, controlsRef.current);
        
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
          description: "There was a problem loading your 3D model.",
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
    centerModel(modelRef.current, cameraRef.current, controlsRef.current);
  };
  
  // Toggle grid visibility
  const toggleGrid = () => {
    if (!gridRef.current) return;
    
    const newVisibility = !isGridVisible;
    gridRef.current.visible = newVisibility;
    setIsGridVisible(newVisibility);
  };
  
  // Change model color
  const changeModelColorHandler = (colorHex: string) => {
    if (!modelRef.current) return;
    
    const color = new THREE.Color(colorHex);
    changeModelColor(modelRef.current, color);
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
};

export default Viewer;
