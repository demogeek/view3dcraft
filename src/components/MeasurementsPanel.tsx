
import React from 'react';
import { Ruler, Square, Box, Pin } from 'lucide-react';

interface MeasurementsPanelProps {
  surfaceArea?: number;
  selectedPartArea?: number;
  selectedPartName?: string;
  selectedPartVolume?: number;
  selectedPartDimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  visible: boolean;
}

const MeasurementsPanel: React.FC<MeasurementsPanelProps> = ({
  surfaceArea,
  selectedPartArea,
  selectedPartName,
  selectedPartVolume,
  selectedPartDimensions,
  visible
}) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-6 right-6 glass-panel p-4 rounded-xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 w-64 transform transition-all z-30">
      <h3 className="font-medium mb-3 flex items-center text-gray-800">
        <Ruler className="h-4 w-4 mr-2" /> Measurements
      </h3>
      
      <div className="space-y-3">
        {surfaceArea !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center text-gray-700">
              <Square className="h-3.5 w-3.5 mr-1.5 text-blue-500" /> 
              Total Surface Area
            </span>
            <span className="text-sm font-medium bg-blue-50 px-2 py-0.5 rounded text-blue-700">
              {surfaceArea.toFixed(2)} mm²
            </span>
          </div>
        )}
        
        {selectedPartName && (
          <div className="pt-1 border-t border-gray-100">
            <div className="flex items-center mb-2">
              <Pin className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">
                {selectedPartName}
              </span>
            </div>
            
            {selectedPartArea !== undefined && (
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-600">Surface Area</span>
                <span className="text-xs font-medium bg-purple-50 px-2 py-0.5 rounded text-purple-700">
                  {selectedPartArea.toFixed(2)} mm²
                </span>
              </div>
            )}
            
            {selectedPartVolume !== undefined && (
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-600">Volume</span>
                <span className="text-xs font-medium bg-purple-50 px-2 py-0.5 rounded text-purple-700">
                  {selectedPartVolume.toFixed(2)} mm³
                </span>
              </div>
            )}
            
            {selectedPartDimensions && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Dimensions</span>
                <span className="text-xs font-medium bg-purple-50 px-2 py-0.5 rounded text-purple-700">
                  {selectedPartDimensions.width.toFixed(1)} × {selectedPartDimensions.height.toFixed(1)} × {selectedPartDimensions.depth.toFixed(1)} mm
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementsPanel;
