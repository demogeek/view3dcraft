
import React, { forwardRef } from 'react';
import Viewer from '@/components/Viewer';

interface ModelViewerCanvasProps {
  file: File | null;
  onModelLoaded: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  onPartSelected: (partName: string) => void;
}

const ModelViewerCanvas = forwardRef<any, ModelViewerCanvasProps>(
  ({ file, onModelLoaded, onLoadingChange, onPartSelected }, ref) => {
    return (
      <Viewer 
        file={file}
        onModelLoaded={onModelLoaded}
        onLoadingChange={onLoadingChange}
        ref={ref}
        onPartSelected={onPartSelected}
      />
    );
  }
);

ModelViewerCanvas.displayName = 'ModelViewerCanvas';

export default ModelViewerCanvas;
