
import React from 'react';
import { Trash2, FileUp, Eye } from 'lucide-react';
import { StoredModel, getSavedModels, deleteModel, createFileFromStored } from '@/lib/storage-utils';
import { toast } from '@/components/ui/use-toast';

interface SavedModelsProps {
  onModelSelect: (file: File) => void;
}

const SavedModels: React.FC<SavedModelsProps> = ({ onModelSelect }) => {
  const [models, setModels] = React.useState<StoredModel[]>([]);

  React.useEffect(() => {
    const storedModels = getSavedModels();
    setModels(storedModels);
  }, []);

  const handleDeleteModel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteModel(id);
    setModels(prevModels => prevModels.filter(model => model.id !== id));
    toast({
      title: 'Model deleted',
      description: 'The model has been removed from your saved models.',
    });
  };

  const handleLoadModel = async (model: StoredModel) => {
    try {
      const file = await createFileFromStored(model);
      onModelSelect(file);
      toast({
        title: 'Model loaded',
        description: `${model.name} has been loaded successfully.`,
      });
    } catch (error) {
      console.error('Error loading model:', error);
      toast({
        title: 'Error loading model',
        description: 'There was a problem loading the model. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (models.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        <FileUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No saved models found</p>
        <p className="text-sm mt-1">Models you save will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto p-2">
      {models.map((model) => (
        <div 
          key={model.id}
          onClick={() => handleLoadModel(model)}
          className="relative glass-panel cursor-pointer hover:shadow-md transition-shadow rounded-lg overflow-hidden group"
        >
          <div className="h-28 bg-gray-100 flex items-center justify-center">
            {model.thumbnail ? (
              <img 
                src={model.thumbnail} 
                alt={model.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <FileUp className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm truncate">{model.name}</h3>
              <span className="text-xs text-gray-500">{model.fileType}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(model.dateAdded).toLocaleDateString()}
            </p>
          </div>
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => handleDeleteModel(model.id, e)}
              className="p-1 bg-white/90 rounded-full hover:bg-red-50 text-red-500"
              title="Delete model"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex justify-center">
              <button className="button-glass text-xs py-1 px-3 text-white flex items-center gap-1">
                <Eye size={14} /> View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedModels;
