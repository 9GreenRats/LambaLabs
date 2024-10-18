import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Layer, Trait } from '../types';
import { Layers, Move, Trash2, Plus, Image, ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface LayerUploadLambaProps {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}

const LayerUploadLamba: React.FC<LayerUploadLambaProps> = ({ layers, setLayers }) => {
  const [expandedLayers, setExpandedLayers] = useState<string[]>([]);

  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'layer') {
      const newLayers = Array.from(layers);
      const [reorderedItem] = newLayers.splice(source.index, 1);
      newLayers.splice(destination.index, 0, reorderedItem);
      setLayers(newLayers.map((layer, index) => ({ ...layer, order: index })));
    } else if (type === 'trait') {
      const layerId = source.droppableId;
      const layerIndex = layers.findIndex(l => l.id === layerId);
      const newTraits = Array.from(layers[layerIndex].traits);
      const [reorderedItem] = newTraits.splice(source.index, 1);
      newTraits.splice(destination.index, 0, reorderedItem);
      
      setLayers(layers.map(layer => 
        layer.id === layerId ? { ...layer, traits: newTraits } : layer
      ));
    }
  }, [layers, setLayers]);

  const addLayer = useCallback(() => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `New Layer ${layers.length + 1}`,
      traits: [],
      order: layers.length,
    };
    setLayers([...layers, newLayer]);
  }, [layers, setLayers]);

  const deleteLayer = useCallback((layerId: string) => {
    setLayers(layers.filter(layer => layer.id !== layerId));
  }, [layers, setLayers]);

  const updateLayerName = useCallback((layerId: string, newName: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, name: newName } : layer
    ));
  }, [layers, setLayers]);

  const toggleLayerExpansion = useCallback((layerId: string) => {
    setExpandedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  }, []);

  const addTrait = useCallback((layerId: string) => {
    setLayers(layers.map(layer => {
      if (layer.id === layerId) {
        const newTrait: Trait = {
          name: `Trait ${layer.traits.length + 1}`,
          image: new File([""], "placeholder.png", { type: "image/png" }),
          rarity: 100
        };
        return {
          ...layer,
          traits: [...layer.traits, newTrait]
        };
      }
      return layer;
    }));
  }, [layers, setLayers]);

  const handleTraitImageUpload = useCallback((layerId: string, traitIndex: number, file: File) => {
    setLayers(layers.map(layer => {
      if (layer.id === layerId) {
        const newTraits = [...layer.traits];
        newTraits[traitIndex] = { ...newTraits[traitIndex], image: file };
        return { ...layer, traits: newTraits };
      }
      return layer;
    }));
  }, [layers, setLayers]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Layer Management</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="layers" type="layer">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {layers.map((layer, index) => (
                <Draggable key={layer.id} draggableId={layer.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <div className="p-4 flex items-center">
                        <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                          <Move size={20} />
                        </div>
                        <Layers size={20} className="mr-2 text-indigo-600" />
                        <input
                          type="text"
                          value={layer.name}
                          onChange={(e) => updateLayerName(layer.id, e.target.value)}
                          className="flex-grow px-2 py-1 border rounded"
                        />
                        <span className="mx-2 text-gray-500">{layer.traits.length} traits</span>
                        <button
                          onClick={() => toggleLayerExpansion(layer.id)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded mr-2"
                        >
                          {expandedLayers.includes(layer.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <button
                          onClick={() => deleteLayer(layer.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      {expandedLayers.includes(layer.id) && (
                        <div className="px-4 pb-4">
                          <h4 className="font-semibold mb-2">Traits:</h4>
                          <Droppable droppableId={layer.id} type="trait">
                            {(provided) => (
                              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {layer.traits.map((trait, traitIndex) => (
                                  <Draggable key={`${layer.id}-trait-${traitIndex}`} draggableId={`${layer.id}-trait-${traitIndex}`} index={traitIndex}>
                                    {(provided) => (
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="flex items-center bg-gray-100 p-2 rounded"
                                      >
                                        <Move size={16} className="mr-2 text-gray-400" />
                                        <Image size={16} className="mr-2 text-gray-400" />
                                        <span>{trait.name}</span>
                                        <div className="ml-auto flex items-center">
                                          {trait.image instanceof File && (
                                            <img
                                              src={URL.createObjectURL(trait.image)}
                                              alt={trait.name}
                                              className="w-8 h-8 object-cover rounded mr-2"
                                            />
                                          )}
                                          <label className="cursor-pointer">
                                            <Upload size={16} className="text-indigo-600" />
                                            <input
                                              type="file"
                                              className="hidden"
                                              accept="image/*"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  handleTraitImageUpload(layer.id, traitIndex, file);
                                                }
                                              }}
                                            />
                                          </label>
                                        </div>
                                      </li>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </ul>
                            )}
                          </Droppable>
                          <button
                            onClick={() => addTrait(layer.id)}
                            className="mt-2 flex items-center px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            <Plus size={16} className="mr-1" />
                            Add Trait
                          </button>
                        </div>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <button
        onClick={addLayer}
        className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        <Plus size={20} className="mr-2" />
        Add Layer
      </button>
    </div>
  );
};

export default LayerUploadLamba;
