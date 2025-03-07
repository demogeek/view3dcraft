
import React from 'react';
import Header from '@/components/Header';

const Documentation = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 flex flex-col h-screen">
        <Header />
        
        <main className="flex-1 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Documentation</h1>
            
            <div className="glass-panel p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
              <p className="mb-4">
                Upload a 3D model by dragging and dropping a file onto the upload area or by clicking 
                the upload button. View3DCraft supports .STL, .OBJ, .GLTF, and .GLB file formats.
              </p>
              <h3 className="text-lg font-medium mt-4 mb-2">Navigation Controls</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Rotate:</strong> Click and drag with left mouse button</li>
                <li><strong>Pan:</strong> Click and drag with right mouse button or middle mouse button</li>
                <li><strong>Zoom:</strong> Use mouse wheel or pinch gesture on touchpads</li>
              </ul>
            </div>
            
            <div className="glass-panel p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-4">Model Analysis</h2>
              <p className="mb-4">
                View3DCraft provides tools to analyze your 3D models:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Surface Area:</strong> Calculate the total surface area of your model</li>
                <li><strong>Part Selection:</strong> Select individual parts of complex models to analyze them separately</li>
                <li><strong>Measurements:</strong> Analyze dimensions and geometric properties</li>
              </ul>
            </div>
            
            <div className="glass-panel p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Export Options</h2>
              <p className="mb-4">
                You can export your models in different formats:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>STL:</strong> Common format for 3D printing</li>
                <li><strong>OBJ:</strong> Widely supported format with texture information</li>
                <li><strong>GLTF/GLB:</strong> Modern formats for web and AR/VR applications</li>
              </ul>
              <p className="mt-4">
                To export, select your desired format from the Export tab in the controls panel.
              </p>
            </div>
          </div>
        </main>
        
        <footer className="mt-8 mb-4 text-center text-sm text-gray-500">
          <p>View3DCraft © {new Date().getFullYear()} | A powerful 3D model viewer for the web</p>
        </footer>
      </div>
    </div>
  );
};

export default Documentation;
