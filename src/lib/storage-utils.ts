
/**
 * Utilities for managing 3D model storage in localStorage
 */

// Define a type for storing model metadata
export interface StoredModel {
  id: string;
  name: string;
  dateAdded: string;
  fileType: string;
  thumbnail?: string; // Base64 encoded image preview
  size: number;
}

// Local storage key for saved models
const STORED_MODELS_KEY = 'view3dcraft_saved_models';
const MODEL_FILES_KEY = 'view3dcraft_model_files_';

/**
 * Get all stored model metadata
 */
export const getSavedModels = (): StoredModel[] => {
  try {
    const storedModelsJson = localStorage.getItem(STORED_MODELS_KEY);
    if (!storedModelsJson) return [];
    return JSON.parse(storedModelsJson);
  } catch (error) {
    console.error('Error retrieving saved models:', error);
    return [];
  }
};

/**
 * Save model metadata to localStorage
 */
export const saveModelMetadata = (model: StoredModel): void => {
  try {
    const existingModels = getSavedModels();
    const updatedModels = [...existingModels.filter(m => m.id !== model.id), model];
    localStorage.setItem(STORED_MODELS_KEY, JSON.stringify(updatedModels));
  } catch (error) {
    console.error('Error saving model metadata:', error);
  }
};

/**
 * Save model file content to localStorage
 */
export const saveModelFile = (id: string, fileContent: string): void => {
  try {
    localStorage.setItem(`${MODEL_FILES_KEY}${id}`, fileContent);
  } catch (error) {
    console.error('Error saving model file:', error);
    // Handle localStorage quota exceeded
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      throw new Error('Storage limit reached. Please delete some saved models to continue.');
    }
  }
};

/**
 * Get model file content from localStorage
 */
export const getModelFile = (id: string): string | null => {
  return localStorage.getItem(`${MODEL_FILES_KEY}${id}`);
};

/**
 * Delete a model and its file from localStorage
 */
export const deleteModel = (id: string): void => {
  try {
    const existingModels = getSavedModels();
    const updatedModels = existingModels.filter(model => model.id !== id);
    localStorage.setItem(STORED_MODELS_KEY, JSON.stringify(updatedModels));
    localStorage.removeItem(`${MODEL_FILES_KEY}${id}`);
  } catch (error) {
    console.error('Error deleting model:', error);
  }
};

/**
 * Generate thumbnail from a renderer
 */
export const generateThumbnail = (renderer: THREE.WebGLRenderer): string => {
  try {
    return renderer.domElement.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return '';
  }
};

/**
 * Create a File object from stored model data
 */
export const createFileFromStored = (model: StoredModel): Promise<File> => {
  return new Promise((resolve, reject) => {
    const fileData = getModelFile(model.id);
    if (!fileData) {
      reject(new Error('File data not found'));
      return;
    }

    // Convert base64 to blob
    const byteString = atob(fileData.split(',')[1]);
    const mimeString = fileData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    
    // Create File object
    const file = new File([blob], model.name, { type: mimeString });
    resolve(file);
  });
};
