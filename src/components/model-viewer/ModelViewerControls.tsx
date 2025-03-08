
import React from 'react';
import FileUpload from '@/components/FileUpload';
import ModelControls from '@/components/ModelControls';
import { useToast } from '@/components/ui/use-toast';
import { generateThumbnail } from '@/lib/storage-utils';

interface ModelViewerControlsProps {
  file: File | null;
  viewerRef: React.RefObject<any>;
  isModelLoaded: boolean;
  cameraType: string;
  setCameraType: (type: string) => void;
  selectedPartName: string | undefined;
  onFileSelected: (file: File) => void;
  onSelectPart: (partName: string) => void;
  setShowMeasurements: (show: boolean) => void;
  setMeasurements: React.Dispatch<React.SetStateAction<{
    surfaceArea: number;
    selectedPartArea: number;
    selectedPartVolume: number;
    selectedPartDimensions: { width: number; height: number; depth: number; }
  }>>;
}

const ModelViewerControls: React.FC<ModelViewerControlsProps> = ({ 
  file, 
  viewerRef, 
  isModelLoaded, 
  cameraType,
  setCameraType,
  selectedPartName,
  onFileSelected, 
  onSelectPart,
  setShowMeasurements,
  setMeasurements
}) => {
  const { toast } = useToast();

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
        onSelectPart(partName);
        return partData.area || 0;
      }
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
  
  const handleSaveThumbnail = () => {
    if (viewerRef.current && viewerRef.current.getRenderer && file) {
      const renderer = viewerRef.current.getRenderer();
      if (renderer) {
        const thumbnail = generateThumbnail(renderer);
        console.log('Thumbnail generated:', thumbnail ? 'Success' : 'Failed');
      }
    }
  };

  return (
    <div className="w-full lg:w-64 flex flex-col items-center z-20">
      {!isModelLoaded && (
        <div className="glass-panel rounded-2xl p-6 mb-6 w-full max-w-xs animate-slide-in">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Welcome to View3DCraft</h2>
          <p className="text-sm text-gray-600 mb-6">
            Upload a 3D model file to visualize and interact with it in your browser.
          </p>
          <FileUpload onFileSelected={onFileSelected} />
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
          onSelectPart={onSelectPart}
        />
      )}
    </div>
  );
};

export default ModelViewerControls;
