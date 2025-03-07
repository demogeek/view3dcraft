
import React, { useCallback, useState } from 'react';
import { Upload, FileUp, Check } from 'lucide-react';
import { supportedFileTypes } from '@/lib/three-utils';
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
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

  return (
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
          <label 
            htmlFor="fileInput" 
            className="mt-3 text-xs text-primary hover:text-primary/80 cursor-pointer"
          >
            Upload a different file
          </label>
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
          <label 
            htmlFor="fileInput" 
            className="button-glass text-sm text-gray-700 cursor-pointer"
          >
            Browse Files
          </label>
        </>
      )}
    </div>
  );
};

export default FileUpload;
