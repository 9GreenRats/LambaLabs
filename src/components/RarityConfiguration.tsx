import React, { useState } from 'react'
import { Layer } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Shuffle, ChevronDown, ChevronUp, Plus, Minus, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RarityConfigurationProps {
  layers: Layer[]
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>
}

interface Dependency {
  layerIndex: number
  traitIndex: number
}

const RarityConfiguration: React.FC<RarityConfigurationProps> = ({ layers, setLayers }) => {
  const [expandedLayers, setExpandedLayers] = useState<string[]>([])
  const [dependencies, setDependencies] = useState<Record<string, Dependency[]>>({})

  const handleRarityChange = (layerIndex: number, traitIndex: number, newRarity: number) => {
    const updatedLayers = [...layers]
    updatedLayers[layerIndex].traits[traitIndex].rarity = newRarity

    // Normalize percentages
    const totalRarity = updatedLayers[layerIndex].traits.reduce((sum, trait) => sum + trait.rarity, 0)
    updatedLayers[layerIndex].traits.forEach(trait => {
      trait.rarity = (trait.rarity / totalRarity) * 100
    })

    setLayers(updatedLayers)
  }

  const randomizeLayerRarities = (layerIndex: number) => {
    const updatedLayers = [...layers]
    const layer = updatedLayers[layerIndex]
    
    layer.traits.forEach(trait => {
      trait.rarity = Math.random()
    })

    const totalRarity = layer.traits.reduce((sum, trait) => sum + trait.rarity, 0)
    layer.traits.forEach(trait => {
      trait.rarity = (trait.rarity / totalRarity) * 100
    })

    setLayers(updatedLayers)
  }

  const addDependency = (layerIndex: number, traitIndex: number) => {
    const key = `${layerIndex}-${traitIndex}`
    setDependencies(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { layerIndex: -1, traitIndex: -1 }]
    }))
  }

  const updateDependency = (key: string, index: number, field: 'layerIndex' | 'traitIndex', value: number) => {
    setDependencies(prev => ({
      ...prev,
      [key]: prev[key].map((dep, i) => i === index ? { ...dep, [field]: value } : dep)
    }))
  }

  const removeDependency = (key: string, index: number) => {
    setDependencies(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }))
  }

  const toggleLayerExpansion = (layerId: string) => {
    setExpandedLayers(prev =>
      prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]
    )
  }

  if (layers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Layers Available</h3>
            <p className="text-gray-500">Upload some layers first to configure rarity settings and dependencies.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-indigo-700 text-center">
            Rarity Configuration
          </CardTitle>
        </CardHeader>
      </Card>

      {layers.map((layer, layerIndex) => (
        <motion.div 
          key={layer.id} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <Button
              variant="ghost"
              onClick={() => toggleLayerExpansion(layer.id)}
              className="w-full p-4 text-left bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 flex justify-between items-center rounded-none border-b"
            >
              <h3 className="text-lg font-semibold text-indigo-700">{layer.name}</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    randomizeLayerRarities(layerIndex)
                  }}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600"
                  title="Randomize rarities"
                >
                  <Shuffle className="w-4 h-4 mr-1" />
                  Randomize
                </Button>
                <Badge variant="outline" className="bg-white">
                  {layer.traits.length} traits
                </Badge>
                {expandedLayers.includes(layer.id) ? (
                  <ChevronUp className="w-5 h-5 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-indigo-600" />
                )}
              </div>
            </Button>
            <AnimatePresence>
              {expandedLayers.includes(layer.id) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-4 space-y-4">
                    {layer.traits.map((trait, traitIndex) => (
                      <div key={trait.name} className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <span className="text-sm font-medium text-gray-700">{trait.name.split('.')[0]}</span>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={trait.rarity.toFixed(2)}
                                onChange={(e) => handleRarityChange(layerIndex, traitIndex, Number(e.target.value))}
                                className="w-20 text-right"
                              />
                              <span className="text-sm text-gray-600">%</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addDependency(layerIndex, traitIndex)}
                              className="text-indigo-600 hover:text-indigo-800"
                              title="Add Dependency"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Dependency
                            </Button>
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
                              className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-4 bg-gray-50 p-3 rounded-lg"
                            >
                              <Select
                                value={dep.layerIndex.toString()}
                                onValueChange={(value) => updateDependency(`${layerIndex}-${traitIndex}`, index, 'layerIndex', Number(value))}
                              >
                                <SelectTrigger className="w-full sm:w-32">
                                  <SelectValue placeholder="Select Layer" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="-1">Select Layer</SelectItem>
                                  {layers.map((l, i) => (
                                    <SelectItem key={i} value={i.toString()}>{l.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={dep.traitIndex.toString()}
                                onValueChange={(value) => updateDependency(`${layerIndex}-${traitIndex}`, index, 'traitIndex', Number(value))}
                              >
                                <SelectTrigger className="w-full sm:w-32">
                                  <SelectValue placeholder="Select Trait" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="-1">Select Trait</SelectItem>
                                  {layers[dep.layerIndex]?.traits.map((t, i) => (
                                    <SelectItem key={i} value={i.toString()}>{t.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeDependency(`${layerIndex}-${traitIndex}`, index)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove Dependency"
                              >
                                <Minus className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ))}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">How to configure rarity:</p>
              <ul className="space-y-1 text-xs">
                <li>• Set the rarity percentage for each trait (higher = more common)</li>
                <li>• Add dependencies to create rules for trait combinations</li>
                <li>• Use the randomize button to quickly set random rarities</li>
                <li>• Percentages are automatically normalized to total 100%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RarityConfiguration
