
import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  MoveDiagonal,
  ZoomIn,
  Grid3X3,
  Maximize2,
  Download,
  Loader2,
  Palette,
  ArrowUp,
  ArrowDown,
  Camera,
  Ruler,
  FileOutput,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { materialOptions, supportedFileTypes } from '@/lib/three-utils';

interface ModelControlsProps {
  isModelLoaded: boolean;
  onResetView: () => void;
  onToggleGrid: () => void;
  onDownload?: () => Promise<void>;
  onChangeColor?: (color: string) => void;
  onChangeMaterial?: (material: string) => void;
  onExportModel?: (format: string) => Promise<void>;
  onCalculateArea?: () => { totalArea: number, meshNames: string[] } | void;
  onCalculatePartArea?: (partName: string) => number;
  onSetYAxisUp?: () => void;
  onFlipZAxis?: () => void;
  onToggleCameraType?: () => void;
  onFitToWindow?: () => void;
  cameraType?: string;
}

const ModelControls: React.FC<ModelControlsProps> = ({
  isModelLoaded,
  onResetView,
  onToggleGrid,
  onDownload,
  onChangeColor,
  onChangeMaterial,
  onExportModel,
  onCalculateArea,
  onCalculatePartArea,
  onSetYAxisUp,
  onFlipZAxis,
  onToggleCameraType,
  onFitToWindow,
  cameraType = 'perspective'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('stl');
  const [partNames, setPartNames] = useState<string[]>([]);
  const [selectedPart, setSelectedPart] = useState<string>('');
  const { toast } = useToast();
  
  useEffect(() => {
    if (isModelLoaded && onCalculateArea) {
      const result = onCalculateArea();
      if (result && result.meshNames) {
        setPartNames(result.meshNames);
        if (result.meshNames.length > 0) {
          setSelectedPart(result.meshNames[0]);
        }
      }
    }
  }, [isModelLoaded, onCalculateArea]);
  
  const colorOptions = [
    { label: 'Silver', value: '#C0C0C0' },
    { label: 'Blue', value: '#4B9CD3' },
    { label: 'Red', value: '#E74C3C' },
    { label: 'Green', value: '#2ECC71' },
    { label: 'Gold', value: '#F1C40F' },
    { label: 'Purple', value: '#9B59B6' },
  ];

  const handleDownload = async () => {
    if (!onDownload) return;
    
    setIsDownloading(true);
    try {
      await onDownload();
      toast({
        title: "Downloaded Successfully",
        description: "Your model has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the model.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExport = async () => {
    if (!onExportModel) return;
    
    setIsExporting(true);
    try {
      await onExportModel(exportFormat);
      toast({
        title: "Exported Successfully",
        description: `Your model has been exported to ${exportFormat.toUpperCase()} format.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "There was an error exporting the model.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCalculateArea = () => {
    if (onCalculateArea) {
      onCalculateArea();
    }
  };
  
  const handleCalculatePartArea = () => {
    if (onCalculatePartArea && selectedPart) {
      onCalculatePartArea(selectedPart);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 mb-4 w-full max-w-xs">
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="view" className="text-xs">View</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs" disabled={!isModelLoaded}>Appearance</TabsTrigger>
          <TabsTrigger value="export" className="text-xs" disabled={!isModelLoaded}>Export</TabsTrigger>
          <TabsTrigger value="measure" className="text-xs" disabled={!isModelLoaded}>Measure</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium flex items-center gap-1.5">
                <RotateCw size={14} />
                Rotation
              </label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onResetView}
                disabled={!isModelLoaded}
                className="h-6 text-xs"
              >
                Reset
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Click and drag on model to rotate view
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <MoveDiagonal size={14} />
              Pan
            </label>
            <p className="text-xs text-muted-foreground">
              Right-click and drag or use middle mouse button
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <ZoomIn size={14} />
              Zoom
            </label>
            <p className="text-xs text-muted-foreground">
              Use mouse wheel or pinch gesture
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleGrid}
              disabled={!isModelLoaded}
              className="h-8 text-xs"
            >
              <Grid3X3 size={14} className="mr-1.5" />
              Toggle Grid
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onFitToWindow}
              disabled={!isModelLoaded}
              className="h-8 text-xs"
            >
              <Maximize2 size={14} className="mr-1.5" />
              Fit to View
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSetYAxisUp}
              disabled={!isModelLoaded}
              className="h-8 text-xs"
            >
              <ArrowUp size={14} className="mr-1.5" />
              Y-Axis Up
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onFlipZAxis}
              disabled={!isModelLoaded}
              className="h-8 text-xs"
            >
              <ArrowDown size={14} className="mr-1.5" />
              Flip Z-Axis
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleCameraType}
              disabled={!isModelLoaded}
              className="col-span-2 h-8 text-xs"
            >
              <Camera size={14} className="mr-1.5" />
              {cameraType === 'perspective' ? 'Switch to Orthographic' : 'Switch to Perspective'}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Palette size={14} />
              Model Color
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  className="w-full aspect-square rounded-md border border-gray-200 transition-all hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  style={{ backgroundColor: color.value }}
                  onClick={() => onChangeColor?.(color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium">Material Type</label>
            <Select onValueChange={onChangeMaterial}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Standard" />
              </SelectTrigger>
              <SelectContent>
                {materialOptions.map((material) => (
                  <SelectItem key={material.value} value={material.value}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Original Format</label>
            <p className="text-xs text-muted-foreground">
              Download your model in the original format
            </p>
            
            <Button 
              className="w-full mt-2 h-9"
              onClick={handleDownload}
              disabled={isDownloading || !onDownload}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download Model
            </Button>
          </div>
          
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <FileOutput size={14} />
              Convert Format
            </label>
            
            <Select 
              defaultValue="stl" 
              onValueChange={(value) => setExportFormat(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {supportedFileTypes.map((type) => (
                  <SelectItem key={type} value={type.replace('.', '')}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              className="w-full mt-2"
              onClick={handleExport}
              disabled={isExporting || !onExportModel}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileOutput className="h-4 w-4 mr-2" />
              )}
              Export as {exportFormat.toUpperCase()}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="measure" className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Ruler size={14} />
              Measurements
            </label>
            
            <Button 
              className="w-full mt-2"
              onClick={handleCalculateArea}
              disabled={!onCalculateArea}
            >
              Calculate Total Surface Area
            </Button>
            
            {partNames.length > 0 && (
              <div className="mt-4 space-y-2">
                <label className="text-xs font-medium flex items-center gap-1.5">
                  <Layers size={14} />
                  Parts
                </label>
                
                <Select 
                  value={selectedPart} 
                  onValueChange={setSelectedPart}
                  disabled={partNames.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select part" />
                  </SelectTrigger>
                  <SelectContent>
                    {partNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleCalculatePartArea}
                  disabled={!selectedPart || !onCalculatePartArea}
                >
                  Calculate Part Area
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelControls;
