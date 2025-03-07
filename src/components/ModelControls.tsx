
import React, { useState } from 'react';
import {
  RotateCw,
  MoveDiagonal,
  ZoomIn,
  Grid3X3,
  Maximize2,
  Download,
  Loader2,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface ModelControlsProps {
  isModelLoaded: boolean;
  onResetView: () => void;
  onToggleGrid: () => void;
  onDownload?: () => void;
  onChangeColor?: (color: string) => void;
}

const ModelControls: React.FC<ModelControlsProps> = ({
  isModelLoaded,
  onResetView,
  onToggleGrid,
  onDownload,
  onChangeColor
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
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

  return (
    <div className="glass-panel rounded-2xl p-4 mb-4 w-full max-w-xs">
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="view" className="text-xs">View</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs" disabled={!isModelLoaded}>Appearance</TabsTrigger>
          <TabsTrigger value="export" className="text-xs" disabled={!isModelLoaded}>Export</TabsTrigger>
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
          
          <div className="flex justify-between gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleGrid}
              disabled={!isModelLoaded}
              className="flex-1 h-8 text-xs"
            >
              <Grid3X3 size={14} className="mr-1.5" />
              Toggle Grid
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onResetView}
              disabled={!isModelLoaded}
              className="flex-1 h-8 text-xs"
            >
              <Maximize2 size={14} className="mr-1.5" />
              Fit to View
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
            <label className="text-xs font-medium">Background</label>
            <div className="grid grid-cols-2 gap-2">
              <button className="h-8 rounded-md bg-white border border-gray-200 text-xs font-medium">
                Light
              </button>
              <button className="h-8 rounded-md bg-gray-900 text-white border border-gray-800 text-xs font-medium">
                Dark
              </button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Export Options</label>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelControls;
