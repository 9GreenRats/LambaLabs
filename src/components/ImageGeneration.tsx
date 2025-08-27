import React, { useState, useRef } from 'react'
import { Layer, GeneratedImage } from '../types'
import JSZip from 'jszip'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Download, Loader, Camera } from 'lucide-react'

interface ImageGenerationProps {
  layers: Layer[]
  collectionName: string
  collectionDescription: string
  generatedImages: GeneratedImage[]
  setGeneratedImages: React.Dispatch<React.SetStateAction<GeneratedImage[]>>
  setImagesGenerated: React.Dispatch<React.SetStateAction<boolean>>
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void
}

const ImageGeneration: React.FC<ImageGenerationProps> = ({ 
  layers, 
  collectionName, 
  collectionDescription, 
  generatedImages,
  setGeneratedImages,
  setImagesGenerated,
  showNotification 
}) => {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const thumbnailsRef = useRef<HTMLDivElement>(null)

  const generateDNA = (traits: { [key: string]: string }): string => {
    return Object.values(traits).join('-')
  }

  const isTraitValid = (layerIndex: number, traitIndex: number, selectedTraits: { [key: string]: string }): boolean => {
    const trait = layers[layerIndex].traits[traitIndex]
    if (!trait.dependencies || trait.dependencies.length === 0) return true

    return trait.dependencies.every(dep => {
      const dependentLayer = layers[dep.layerIndex]
      const dependentTrait = dependentLayer.traits[dep.traitIndex]
      return selectedTraits[dependentLayer.name] === dependentTrait.name
    })
  }

  const generateRandomImage = async (existingDNAs: Set<string>): Promise<GeneratedImage | null> => {
    const canvas = document.createElement('canvas')
    canvas.width = 500
    canvas.height = 500
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    const selectedTraits: { [key: string]: string } = {}

    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex]
      const validTraits = layer.traits.filter((_, traitIndex) => isTraitValid(layerIndex, traitIndex, selectedTraits))
      
      if (validTraits.length === 0) {
        console.warn(`No valid traits found for layer: ${layer.name}`)
        return null // Skip this combination
      }

      const randomTrait = validTraits[Math.floor(Math.random() * validTraits.length)]
      selectedTraits[layer.name] = randomTrait.name
    }

    const dna = generateDNA(selectedTraits)
    if (existingDNAs.has(dna)) {
      return null // Duplicate DNA, try again
    }
    existingDNAs.add(dna)

    for (const layer of layers) {
      const traitName = selectedTraits[layer.name]
      const trait = layer.traits.find((t) => t.name === traitName)
      if (trait) {
        const img = await createImageBitmap(trait.image)
        ctx.drawImage(img, 0, 0, 500, 500)
      }
    }

    return {
      id: Date.now().toString(),
      traits: selectedTraits,
      imageData: canvas.toDataURL(),
    }
  }

  const handleGenerateImages = async (count: number) => {
    setGenerating(true)
    setProgress(0)
    const newImages: GeneratedImage[] = []
    const existingDNAs = new Set<string>()

    try {
      while (newImages.length < count) {
        const newImage = await generateRandomImage(existingDNAs)
        if (newImage) {
          newImages.push(newImage)
          setProgress(Math.floor((newImages.length / count) * 100))
          setGeneratedImages([...newImages])
        }
      }
      setImagesGenerated(true)
      showNotification('success', `Successfully generated ${count} images.`)
    } catch (error) {
      showNotification('error', `Error generating images: ${error}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    try {
      const zip = new JSZip()
      const imagesFolder = zip.folder("images")
      const jsonFolder = zip.folder("json")

      for (let i = 0; i < generatedImages.length; i++) {
        const image = generatedImages[i]
        const imageData = image.imageData.split(',')[1]
        imagesFolder?.file(`${i + 1}.png`, imageData, { base64: true })

        const metadata = {
          name: `${collectionName} #${i + 1}`,
          description: collectionDescription,
          image: `${i + 1}.png`,
          edition: i + 1,
          date: Date.now(),
          attributes: Object.entries(image.traits).map(([trait_type, value]) => ({
            trait_type,
            value: value.split('.')[0] // Remove file extension
          })),
          compiler: "Lamba Labs 4.0"
        }
        jsonFolder?.file(`${i + 1}.json`, JSON.stringify(metadata, null, 2))
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `${collectionName.replace(/\s+/g, '_')}_collection.zip`
      link.click()
      showNotification('success', 'Collection downloaded successfully.')
    } catch (error) {
      showNotification('error', `Error downloading collection: ${error}`)
    }
  }

  const handleSnapshotDownload = async () => {
    try {
      if (thumbnailsRef.current) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const images = thumbnailsRef.current.querySelectorAll('img')
        const imageSize = 120 // Size of each thumbnail
        const padding = 5 // Padding between images
        const columns = Math.ceil(Math.sqrt(images.length))
        const rows = Math.ceil(images.length / columns)

        canvas.width = columns * (imageSize + padding) - padding
        canvas.height = rows * (imageSize + padding) - padding

        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        images.forEach((img, index) => {
          const x = (index % columns) * (imageSize + padding)
          const y = Math.floor(index / columns) * (imageSize + padding)
          ctx.drawImage(img, x, y, imageSize, imageSize)
        })

        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `${collectionName.replace(/\s+/g, '_')}_thumbnail_sheet.png`
        link.click()
        showNotification('success', 'Snapshot downloaded successfully.')
      }
    } catch (error) {
      showNotification('error', `Error downloading snapshot: ${error}`)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-indigo-700">
            Image Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="number"
              min="1"
              max="10000"
              defaultValue="10"
              className="w-full sm:w-24 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
              id="generationCount"
            />
            <Button
              onClick={() => handleGenerateImages(parseInt((document.getElementById('generationCount') as HTMLInputElement).value))}
              disabled={generating}
              size="lg"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
            >
              {generating ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Generating... {progress}%
                </>
              ) : (
                'Generate Images'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-center">
              Generated Images ({generatedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={thumbnailsRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-2 mb-6">
              {generatedImages.map((image, index) => (
                <div key={image.id} className="text-center">
                  <img 
                    src={image.imageData} 
                    alt={`Generated ${index + 1}`} 
                    className="w-full h-auto object-cover rounded-lg shadow-md border" 
                    style={{ maxWidth: '120px', maxHeight: '120px' }} 
                  />
                  <p className="text-xs mt-1 text-gray-600">#{index + 1}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleDownload}
                size="lg"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2" size={18} />
                Download ZIP
              </Button>
              <Button
                onClick={handleSnapshotDownload}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Camera className="mr-2" size={18} />
                Download Snapshot
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ImageGeneration
