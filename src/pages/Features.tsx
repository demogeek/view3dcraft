
import React from 'react';
import Header from '@/components/Header';

const Features = () => {
  const featuresList = [
    {
      title: "Multiple File Formats",
      description: "Support for STL, OBJ, GLTF, and GLB formats.",
      icon: "📁"
    },
    {
      title: "Format Conversion",
      description: "Convert between different 3D file formats easily.",
      icon: "🔄"
    },
    {
      title: "Material Customization",
      description: "Change colors and material types with a single click.",
      icon: "🎨"
    },
    {
      title: "Measurements",
      description: "Calculate surface area and analyze model geometry.",
      icon: "📏"
    },
    {
      title: "Camera Controls",
      description: "Switch between perspective and orthographic camera views.",
      icon: "📷"
    },
    {
      title: "Part Selection",
      description: "Select and manipulate individual components of complex models.",
      icon: "👆"
    }
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 flex flex-col h-screen">
        <Header />
        
        <main className="flex-1 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Features</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
              {featuresList.map((feature, index) => (
                <div key={index} className="glass-panel p-6 rounded-xl">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
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

export default Features;
