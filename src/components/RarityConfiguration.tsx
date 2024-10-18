import React, { useState } from 'react';
import { Layer } from '../types';
import { Shuffle, ChevronDown, ChevronUp, Plus, Minus, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RarityConfigurationProps {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}

interface Dependency {
  layerIndex: number;
  traitIndex: number;
}

const RarityConfiguration: React.FC<RarityConfigurationProps> = ({ layers, setLayers }) => {
  const [expandedLayers, setExpandedLayers] = useState<string[]>([]);
  const [dependencies, setDependencies] = useState<Record<string, Dependency[]>>({});

  const handleRarityChange = (layerIndex: number, traitIndex: number, newRarity: number) => {
    const updatedLayers = [...layers];
    updatedLayers[layerIndex].traits[traitIndex].rarity = newRarity;

    // Normalize percentages
    const totalRarity = updatedLayers[layerIndex].traits.reduce((sum, trait) => sum + trait.rarity, 0);
    updatedLayers[layerIndex].traits.forEach(trait => {
      trait.rarity = (trait.rarity / totalRarity) * 100;
    });

    setLayers(updatedLayers);
  };

  const randomizeLayerRarities = (layerIndex: number) => {
    const updatedLayers = [...layers];
    const layer = updatedLayers[layerIndex];
    
    layer.traits.forEach(trait => {
      trait.rarity = Math.random();
    });

    const totalRarity = layer.traits.reduce((sum, trait) => sum + trait.rarity, 0);
    layer.traits.forEach(trait => {
      trait.rarity = (trait.rarity / totalRarity) * 100;
    });

    setLayers(updatedLayers);
  };

  const addDependency = (layerIndex: number, traitIndex: number) => {
    const key = `${layerIndex}-${traitIndex}`;
    setDependencies(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { layerIndex: -1, traitIndex: -1 }]
    }));
  };

  const updateDependency = (key: string, index: number, field: 'layerIndex' | 'traitIndex', value: number) => {
    setDependencies(prev => ({
      ...prev,
      [key]: prev[key].map((dep, i) => i === index ? { ...dep, [field]: value } : dep)
    }));
  };

  const removeDependency = (key: string, index: number) => {
    setDependencies(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  };

  const toggleLayerExpansion = (layerId: string) => {
    setExpandedLayers(prev =>
      prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Rarity Configuration</h2>
      {layers.map((layer, layerIndex) => (
        <motion.div 
          key={layer.id} 
          className="bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="bg-indigo-50 p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleLayerExpansion(layer.id)}
          >
            <h3 className="text-lg font-semibold text-indigo-700">{layer.name}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  randomizeLayerRarities(layerIndex);
                }}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                title="Randomize rarities"
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Randomize
              </button>
              {expandedLayers.includes(layer.id) ? (
                <ChevronUp className="w-5 h-5 text-indigo-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-indigo-600" />
              )}
            </div>
          </div>
          <AnimatePresence>
            {expandedLayers.includes(layer.id) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 space-y-4"
              >
                {layer.traits.map((trait, traitIndex) => (
                  <div key={trait.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{trait.name.split('.')[0]}</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={trait.rarity.toFixed(2)}
                          onChange={(e) => handleRarityChange(layerIndex, traitIndex, Number(e.target.value))}
                          className="w-20 px-2 py-1 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        <span className="text-sm text-gray-600">%</span>
                        <button
                          onClick={() => addDependency(layerIndex, traitIndex)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                          title="Add Dependency"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {dependencies[`${layerIndex}-${traitIndex}`]?.map((dep, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center space-x-2 ml-4 bg-gray-50 p-2 rounded-md"
                        >
                          <select
                            value={dep.layerIndex}
                            onChange={(e) => updateDependency(`${layerIndex}-${traitIndex}`, index, 'layerIndex', Number(e.target.value))}
                            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value={-1}>Select Layer</option>
                            {layers.map((l, i) => (
                              <option key={i} value={i}>{l.name}</option>
                            ))}
                          </select>
                          <select
                            value={dep.traitIndex}
                            onChange={(e) => updateDependency(`${layerIndex}-${traitIndex}`, index, 'traitIndex', Number(e.target.value))}
                            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value={-1}>Select Trait</option>
                            {layers[dep.layerIndex]?.traits.map((t, i) => (
                              <option key={i} value={i}>{t.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeDependency(`${layerIndex}-${traitIndex}`, index)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            title="Remove Dependency"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
      <div className="mt-4 p-4 bg-blue-50 rounded-md flex items-start">
        <HelpCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
        <p className="text-sm text-blue-700">
          Set the rarity percentage for each trait. Add dependencies to create rules for trait combinations. 
          Use the randomize button to quickly set random rarities for all traits in a layer.
        </p>
      </div>
    </div>
  );
};

export default RarityConfiguration;
