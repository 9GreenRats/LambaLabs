import React from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Layer } from '../types'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Image, GripVertical, X, Upload } from 'lucide-react'

interface LayerUploadProps {
  layers: Layer[]
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>
}

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string
  directory?: string
}

const LayerUpload: React.FC<LayerUploadProps> = ({ layers, setLayers }) => {
  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
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
      }
      setLayers([...layers, newLayer])
    }
  }

  const removeLayer = (layerId: string) => {
    setLayers(layers.filter(layer => layer.id !== layerId))
  }

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto">
      <Card className="w-full mb-8">
        <CardContent className="p-6 text-center">
          <label htmlFor="folderUpload" className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
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
        </CardContent>
      </Card>

      {layers.length > 0 ? (
        <Droppable droppableId="layers">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} className="w-full space-y-4">
              {layers.map((layer, index) => (
                <Draggable key={layer.id} draggableId={layer.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="w-full"
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-3">
                              <div {...provided.dragHandleProps} className="cursor-move">
                                <GripVertical className="w-6 h-6 text-gray-400" />
                              </div>
                              <Image className="w-6 h-6 text-indigo-600" />
                              <span className="font-medium text-gray-900">{layer.name}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                              <Badge variant="secondary" className="w-fit">
                                {layer.traits.length} traits
                              </Badge>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeLayer(layer.id)}
                                className="w-full sm:w-auto"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      ) : (
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No layers uploaded yet</p>
            <p className="text-gray-400 text-sm mt-2">Use the button above to upload layers</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LayerUpload
