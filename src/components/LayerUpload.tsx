import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Layer } from '../types';
import { Image, GripVertical, X, Upload } from 'lucide-react';

interface LayerUploadProps {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

const LayerUpload: React.FC<LayerUploadProps> = ({ layers, setLayers }) => {
  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newLayer: Layer = {
        id: Date.now().toString(),
        name: files[0].webkitRelativePath.split('/')[0],
        traits: Array.from(files).map((file) => ({
          name: file.name,
          image: file,
          rarity: 100 / files.length,
        })),
        order: layers.length,
      };
      setLayers([...layers, newLayer]);
    }
  };

  const removeLayer = (layerId: string) => {
    setLayers(layers.filter(layer => layer.id !== layerId));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <label htmlFor="folderUpload" className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Upload className="mr-2" size={20} />
          Upload Layer Folder
        </label>
        <input
          type="file"
          id="folderUpload"
          onChange={handleFolderUpload}
          webkitdirectory="true"
          directory=""
          multiple
          className="hidden"
          {...({} as CustomInputProps)}
        />
      </div>
      {layers.length > 0 ? (
        <Droppable droppableId="layers">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} className="w-full max-w-2xl space-y-4">
              {layers.map((layer, index) => (
                <Draggable key={layer.id} draggableId={layer.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div {...provided.dragHandleProps} className="mr-3 cursor-move">
                          <GripVertical className="w-6 h-6 text-gray-400" />
                        </div>
                        <Image className="w-6 h-6 mr-3 text-indigo-600" />
                        <span className="font-medium">{layer.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4">{layer.traits.length} traits</span>
                        <button
                          onClick={() => removeLayer(layer.id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      ) : (
        <p className="text-center text-gray-500">No layers uploaded yet. Use the button above to upload layers.</p>
      )}
    </div>
  );
};

export default LayerUpload;
