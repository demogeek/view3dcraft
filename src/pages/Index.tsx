
import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import ModelControls from '@/components/ModelControls';
import Viewer from '@/components/Viewer';
import LoadingScreen from '@/components/LoadingScreen';
import MeasurementsPanel from '@/components/MeasurementsPanel';
import { generateThumbnail } from '@/lib/storage-utils';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraType, setCameraType] = useState('perspective');
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [selectedPartName, setSelectedPartName] = useState<string | undefined>();
  const [measurements, setMeasurements] = useState({
    surfaceArea: 0,
    selectedPartArea: 0,
    selectedPartVolume: 0,
    selectedPartDimensions: { width: 0, height: 0, depth: 0 }
  });
  
  const viewerRef = useRef<any>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setIsModelLoaded(false);
    setSelectedPartName(undefined);
    setShowMeasurements(false);
  };

  const handleModelLoaded = () => {
    setIsModelLoaded(true);
    
    // Calculate initial surface area
    if (viewerRef.current && viewerRef.current.calculateAreaHandler) {
      const area = viewerRef.current.calculateAreaHandler();
      setMeasurements(prev => ({ ...prev, surfaceArea: area }));
    }
  };

  const handleResetView = () => {
    if (viewerRef.current && viewerRef.current.resetView) {
      viewerRef.current.resetView();
    }
  };

  const handleToggleGrid = () => {
    if (viewerRef.current && viewerRef.current.toggleGrid) {
      viewerRef.current.toggleGrid();
    }
  };

  const handleDownload = () => {
    if (viewerRef.current && viewerRef.current.downloadModel) {
      return viewerRef.current.downloadModel();
    }
    return Promise.reject(new Error('Download not available'));
  };

  const handleChangeColor = (color: string) => {
    if (viewerRef.current && viewerRef.current.changeModelColorHandler) {
      viewerRef.current.changeModelColorHandler(color);
    }
  };
  
  const handleChangeMaterial = (material: string) => {
    if (viewerRef.current && viewerRef.current.changeModelMaterialHandler) {
      viewerRef.current.changeModelMaterialHandler(material);
    }
  };
  
  const handleExportModel = (format: string) => {
    if (viewerRef.current && viewerRef.current.exportModelHandler) {
      return viewerRef.current.exportModelHandler(format);
    }
    return Promise.reject(new Error('Export not available'));
  };
  
  const handleCalculateArea = () => {
    if (viewerRef.current && viewerRef.current.calculateAreaHandler) {
      const area = viewerRef.current.calculateAreaHandler();
      setMeasurements(prev => ({ ...prev, surfaceArea: area }));
      setShowMeasurements(true);
      return area;
    }
    return 0;
  };
  
  const handleCalculatePartArea = (partName: string) => {
    if (viewerRef.current && viewerRef.current.calculatePartAreaHandler) {
      const partData = viewerRef.current.calculatePartAreaHandler(partName);
      if (partData) {
        setSelectedPartName(partName);
        setMeasurements(prev => ({ 
          ...prev, 
          selectedPartArea: partData.area || 0,
          selectedPartVolume: partData.volume || 0,
          selectedPartDimensions: partData.dimensions || { width: 0, height: 0, depth: 0 }
        }));
        setShowMeasurements(true);
      }
      return partData?.area || 0;
    }
    return 0;
  };
  
  const handleSetYAxisUp = () => {
    if (viewerRef.current && viewerRef.current.setYAxisUpHandler) {
      viewerRef.current.setYAxisUpHandler();
    }
  };
  
  const handleFlipZAxis = () => {
    if (viewerRef.current && viewerRef.current.flipZAxisHandler) {
      viewerRef.current.flipZAxisHandler();
    }
  };
  
  const handleToggleCameraType = () => {
    if (viewerRef.current && viewerRef.current.toggleCameraTypeHandler) {
      viewerRef.current.toggleCameraTypeHandler();
      if (viewerRef.current.getCameraType) {
        setCameraType(viewerRef.current.getCameraType());
      }
    }
  };
  
  const handleFitToWindow = () => {
    if (viewerRef.current && viewerRef.current.fitToWindowHandler) {
      viewerRef.current.fitToWindowHandler();
    }
  };
  
  const handleSelectPart = (partName: string) => {
    handleCalculatePartArea(partName);
  };
  
  const handleSaveThumbnail = () => {
    if (viewerRef.current && viewerRef.current.getRenderer && file) {
      const renderer = viewerRef.current.getRenderer();
      if (renderer) {
        const thumbnail = generateThumbnail(renderer);
        console.log('Thumbnail generated:', thumbnail ? 'Success' : 'Failed');
        // You could save this thumbnail with the model metadata
      }
    }
  };

  useEffect(() => {
    if (viewerRef.current && viewerRef.current.getCameraType) {
      setCameraType(viewerRef.current.getCameraType());
    }
  }, [isModelLoaded]);

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <LoadingScreen isLoading={isLoading} />

      <div className="container mx-auto px-4 py-6 flex flex-col h-screen relative z-10">
        <Header />
        
        <main className="flex-1 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          <div className="w-full lg:w-64 flex flex-col items-center z-20">
            {!isModelLoaded && (
              <div className="glass-panel rounded-2xl p-6 mb-6 w-full max-w-xs animate-slide-in">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Welcome to View3DCraft</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Upload a 3D model file to visualize and interact with it in your browser.
                </p>
                <FileUpload onFileSelected={handleFileSelected} />
              </div>
            )}
            
            {(file || isModelLoaded) && (
              <ModelControls 
                isModelLoaded={isModelLoaded}
                onResetView={handleResetView}
                onToggleGrid={handleToggleGrid}
                onDownload={handleDownload}
                onChangeColor={handleChangeColor}
                onChangeMaterial={handleChangeMaterial}
                onExportModel={handleExportModel}
                onCalculateArea={handleCalculateArea}
                onCalculatePartArea={handleCalculatePartArea}
                onSetYAxisUp={handleSetYAxisUp}
                onFlipZAxis={handleFlipZAxis}
                onToggleCameraType={handleToggleCameraType}
                onFitToWindow={handleFitToWindow}
                cameraType={cameraType}
                selectedPart={selectedPartName}
                onSelectPart={handleSelectPart}
              />
            )}
          </div>
          
          <div className="flex-1 relative w-full h-full min-h-[500px] lg:min-h-0 rounded-2xl overflow-hidden shadow-xl">
            <Viewer 
              file={file}
              onModelLoaded={handleModelLoaded}
              onLoadingChange={setIsLoading}
              ref={viewerRef}
              onPartSelected={handleSelectPart}
            />
            
            <MeasurementsPanel 
              visible={showMeasurements && isModelLoaded}
              surfaceArea={measurements.surfaceArea}
              selectedPartArea={selectedPartName ? measurements.selectedPartArea : undefined}
              selectedPartName={selectedPartName}
              selectedPartVolume={selectedPartName ? measurements.selectedPartVolume : undefined}
              selectedPartDimensions={selectedPartName ? measurements.selectedPartDimensions : undefined}
            />
            
            {!file && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 backdrop-blur-sm rounded-2xl">
                <div className="text-center max-w-md px-6 py-10 animate-pulse-subtle">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="32" 
                      height="32" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-primary"
                    >
                      <path d="M2 12h10" />
                      <path d="m9 7 5 5-5 5" />
                      <path d="M22 17v-1a4 4 0 0 0-4-4h-2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-gray-800 mb-2">Upload a Model to Begin</h2>
                  <p className="text-gray-600 mb-0">
                    Drag and drop a 3D file or use the upload panel to visualize your model
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <footer className="mt-8 mb-4 text-center text-sm text-gray-500">
          <p>View3DCraft © {new Date().getFullYear()} | A powerful 3D model viewer for the web</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
