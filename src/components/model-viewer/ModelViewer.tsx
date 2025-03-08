
import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import ModelViewerControls from './ModelViewerControls';
import ModelViewerCanvas from './ModelViewerCanvas';
import LoadingScreen from '@/components/LoadingScreen';
import MeasurementsPanel from '@/components/MeasurementsPanel';
import EmptyStateView from './EmptyStateView';

const ModelViewer = () => {
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

  const handleSelectPart = (partName: string) => {
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
    }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        <ModelViewerControls 
          file={file}
          viewerRef={viewerRef}
          isModelLoaded={isModelLoaded}
          cameraType={cameraType}
          setCameraType={setCameraType}
          selectedPartName={selectedPartName}
          onFileSelected={handleFileSelected}
          onSelectPart={handleSelectPart}
          setShowMeasurements={setShowMeasurements}
          setMeasurements={setMeasurements}
        />
        
        <div className="flex-1 relative w-full h-full min-h-[500px] lg:min-h-0 rounded-2xl overflow-hidden shadow-xl">
          <ModelViewerCanvas 
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
          
          {!file && <EmptyStateView />}
        </div>
      </main>
    </>
  );
};

export default ModelViewer;
