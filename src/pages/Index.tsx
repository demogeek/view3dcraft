
import React from 'react';
import ModelViewer from '@/components/model-viewer/ModelViewer';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 flex flex-col h-screen relative z-10">
        <ModelViewer />
        
        <footer className="mt-8 mb-4 text-center text-sm text-gray-500">
          <p>View3DCraft © {new Date().getFullYear()} | A powerful 3D model viewer for the web</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
