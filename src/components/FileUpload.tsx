
import React, { useCallback, useState } from 'react';
import { Upload, FileUp, Check, History } from 'lucide-react';
import { supportedFileTypes } from '@/lib/three-utils';
import { useToast } from "@/components/ui/use-toast";
import SavedModels from './SavedModels';
import { v4 as uuidv4 } from 'uuid';
import { saveModelMetadata, saveModelFile } from '@/lib/storage-utils';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [showSavedModels, setShowSavedModels] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const saveToLocalStorage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        try {
          const modelId = uuidv4();
          
          // Save model metadata
          saveModelMetadata({
            id: modelId,
            name: file.name,
            dateAdded: new Date().toISOString(),
            fileType: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
            size: file.size,
          });
          
          // Save file content
          saveModelFile(modelId, e.target.result as string);
          
          toast({
            title: "Model saved",
            description: `${file.name} has been saved to your local storage.`,
          });
        } catch (error) {
          if (error instanceof Error) {
            toast({
              title: "Storage error",
              description: error.message,
              variant: "destructive"
            });
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const processFile = useCallback((file: File) => {
    // Check if file type is supported
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !supportedFileTypes.includes(`.${fileExt}`)) {
      toast({
        title: "Unsupported file format",
        description: `Please upload an STL, OBJ, GLTF, or GLB file.`,
        variant: "destructive"
      });
      return;
    }

    setIsUploaded(true);
    onFileSelected(file);
    
    // Save to localStorage
    saveToLocalStorage(file);
    
    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been loaded.`,
    });
  }, [onFileSelected, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, [processFile]);

  const toggleSavedModels = () => {
    setShowSavedModels(prev => !prev);
  };

  return (
    <div className="w-full">
      <div 
        className={`dropzone ${isDragging ? 'dropzone-active' : ''} ${isUploaded ? 'bg-green-50 border-green-300' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file"
          id="fileInput"
          className="hidden"
          accept=".stl,.obj,.gltf,.glb"
          onChange={handleFileChange}
        />
        
        {isUploaded ? (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Check size={24} className="text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">File uploaded successfully</p>
            <div className="flex space-x-3 mt-3">
              <label 
                htmlFor="fileInput" 
                className="text-xs text-primary hover:text-primary/80 cursor-pointer"
              >
                Upload a different file
              </label>
              <button
                onClick={toggleSavedModels}
                className="text-xs text-gray-600 hover:text-gray-800 flex items-center"
              >
                <History size={14} className="mr-1" />
                {showSavedModels ? 'Hide saved models' : 'Show saved models'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 animate-pulse-subtle">
              {isDragging ? (
                <FileUp size={32} className="text-primary" />
              ) : (
                <Upload size={32} className="text-primary" />
              )}
            </div>
            <p className="text-base font-medium text-gray-700 mb-2">
              {isDragging ? 'Drop your file here' : 'Drag & drop your 3D model'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports STL, OBJ, GLTF, and GLB files
            </p>
            <div className="flex space-x-4">
              <label 
                htmlFor="fileInput" 
                className="button-glass text-sm text-gray-700 cursor-pointer"
              >
                Browse Files
              </label>
              <button
                onClick={toggleSavedModels}
                className="button-glass-secondary text-sm text-gray-600 flex items-center"
              >
                <History size={14} className="mr-1.5" />
                Saved Models
              </button>
            </div>
          </>
        )}
      </div>
      
      {showSavedModels && (
        <div className="mt-4 glass-panel p-4 rounded-xl">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Your Saved Models</h3>
          <SavedModels onModelSelect={processFile} />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
