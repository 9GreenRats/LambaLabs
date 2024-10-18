import React, { useState, useRef } from 'react';
import { Layer, GeneratedImage } from '../types';
import JSZip from 'jszip';
import { Download, Loader, Camera } from 'lucide-react';

interface ImageGenerationProps {
  layers: Layer[];
  collectionName: string;
  collectionDescription: string;
  generatedImages: GeneratedImage[];
  setGeneratedImages: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
  setImagesGenerated: React.Dispatch<React.SetStateAction<boolean>>;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
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
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const generateDNA = (traits: { [key: string]: string }): string => {
    return Object.values(traits).join('-');
  };

  const isTraitValid = (layerIndex: number, traitIndex: number, selectedTraits: { [key: string]: string }): boolean => {
    const trait = layers[layerIndex].traits[traitIndex];
    if (!trait.dependencies || trait.dependencies.length === 0) return true;

    return trait.dependencies.every(dep => {
      const dependentLayer = layers[dep.layerIndex];
      const dependentTrait = dependentLayer.traits[dep.traitIndex];
      return selectedTraits[dependentLayer.name] === dependentTrait.name;
    });
  };

  const generateRandomImage = async (existingDNAs: Set<string>): Promise<GeneratedImage | null> => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const selectedTraits: { [key: string]: string } = {};

    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex];
      const validTraits = layer.traits.filter((_, traitIndex) => isTraitValid(layerIndex, traitIndex, selectedTraits));
      
      if (validTraits.length === 0) {
        console.warn(`No valid traits found for layer: ${layer.name}`);
        return null; // Skip this combination
      }

      const randomTrait = validTraits[Math.floor(Math.random() * validTraits.length)];
      selectedTraits[layer.name] = randomTrait.name;
    }

    const dna = generateDNA(selectedTraits);
    if (existingDNAs.has(dna)) {
      return null; // Duplicate DNA, try again
    }
    existingDNAs.add(dna);

    for (const layer of layers) {
      const traitName = selectedTraits[layer.name];
      const trait = layer.traits.find((t) => t.name === traitName);
      if (trait) {
        const img = await createImageBitmap(trait.image);
        ctx.drawImage(img, 0, 0, 500, 500);
      }
    }

    return {
      id: Date.now().toString(),
      traits: selectedTraits,
      imageData: canvas.toDataURL(),
    };
  };

  const handleGenerateImages = async (count: number) => {
    setGenerating(true);
    setProgress(0);
    const newImages: GeneratedImage[] = [];
    const existingDNAs = new Set<string>();

    try {
      while (newImages.length < count) {
        const newImage = await generateRandomImage(existingDNAs);
        if (newImage) {
          newImages.push(newImage);
          setProgress(Math.floor((newImages.length / count) * 100));
          setGeneratedImages([...newImages]);
        }
      }
      setImagesGenerated(true);
      showNotification('success', `Successfully generated ${count} images.`);
    } catch (error) {
      showNotification('error', `Error generating images: ${error}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const zip = new JSZip();
      const imagesFolder = zip.folder("images");
      const jsonFolder = zip.folder("json");

      for (let i = 0; i < generatedImages.length; i++) {
        const image = generatedImages[i];
        const imageData = image.imageData.split(',')[1];
        imagesFolder?.file(`${i + 1}.png`, imageData, { base64: true });

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
        };
        jsonFolder?.file(`${i + 1}.json`, JSON.stringify(metadata, null, 2));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${collectionName.replace(/\s+/g, '_')}_collection.zip`;
      link.click();
      showNotification('success', 'Collection downloaded successfully.');
    } catch (error) {
      showNotification('error', `Error downloading collection: ${error}`);
    }
  };

  const handleSnapshotDownload = async () => {
    try {
      if (thumbnailsRef.current) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const images = thumbnailsRef.current.querySelectorAll('img');
        const imageSize = 120; // Size of each thumbnail
        const padding = 5; // Padding between images
        const columns = Math.ceil(Math.sqrt(images.length));
        const rows = Math.ceil(images.length / columns);

        canvas.width = columns * (imageSize + padding) - padding;
        canvas.height = rows * (imageSize + padding) - padding;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        images.forEach((img, index) => {
          const x = (index % columns) * (imageSize + padding);
          const y = Math.floor(index / columns) * (imageSize + padding);
          ctx.drawImage(img, x, y, imageSize, imageSize);
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${collectionName.replace(/\s+/g, '_')}_thumbnail_sheet.png`;
        link.click();
        showNotification('success', 'Snapshot downloaded successfully.');
      }
    } catch (error) {
      showNotification('error', `Error downloading snapshot: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-4">
        <input
          type="number"
          min="1"
          max="10000"
          defaultValue="10"
          className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          id="generationCount"
        />
        <button
          onClick={() => handleGenerateImages(parseInt((document.getElementById('generationCount') as HTMLInputElement).value))}
          disabled={generating}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {generating ? (
            <>
              <Loader className="animate-spin mr-2" size={18} />
              Generating... {progress}%
            </>
          ) : (
            'Generate Images'
          )}
        </button>
      </div>

      {generatedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-center">Generated Images</h3>
          <div ref={thumbnailsRef} className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-1">
            {generatedImages.map((image, index) => (
              <div key={image.id} className="text-center">
                <img src={image.imageData} alt={`Generated ${index + 1}`} className="w-full h-auto object-cover rounded-md shadow-md" style={{ maxWidth: '120px', maxHeight: '120px' }} />
                <p className="text-sm mt-1 text-gray-600">#{index + 1}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
            >
              <Download className="mr-2" size={18} />
              Download ZIP
            </button>
            <button
              onClick={handleSnapshotDownload}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
            >
              <Camera className="mr-2" size={18} />
              Download Snapshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGeneration;
