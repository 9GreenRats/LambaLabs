import React, { useState } from 'react';
import { Layer, GeneratedImage } from '../types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ChevronDown, ChevronUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CollectionAnalyticsProps {
  layers: Layer[];
  generatedImages: GeneratedImage[];
}

const CollectionAnalytics: React.FC<CollectionAnalyticsProps> = ({ layers, generatedImages }) => {
  const [expandedLayers, setExpandedLayers] = useState<string[]>([]);

  const calculateTraitDistribution = () => {
    const distribution: { [key: string]: { [key: string]: number } } = {};
    
    layers.forEach(layer => {
      distribution[layer.name] = {};
      layer.traits.forEach(trait => {
        distribution[layer.name][trait.name.split('.')[0]] = 0;
      });
    });

    generatedImages.forEach(image => {
      Object.entries(image.traits).forEach(([layerName, traitName]) => {
        distribution[layerName][traitName.split('.')[0]]++;
      });
    });

    return distribution;
  };

  const traitDistribution = calculateTraitDistribution();

  const renderDistributionChart = (traits: { [key: string]: number }) => {
    const data = {
      labels: Object.keys(traits),
      datasets: [
        {
          label: 'Trait Distribution',
          data: Object.values(traits),
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Count' },
        },
        x: {
          title: { display: true, text: 'Traits' },
        },
      },
    };

    return <Bar data={data} options={options} />;
  };

  const toggleLayerExpansion = (layerName: string) => {
    setExpandedLayers(prev =>
      prev.includes(layerName) ? prev.filter(name => name !== layerName) : [...prev, layerName]
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">Collection Analytics</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(traitDistribution).map(([layerName, traits]) => (
          <div key={layerName} className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleLayerExpansion(layerName)}
              className="w-full p-4 text-left bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 flex justify-between items-center"
            >
              <h4 className="text-lg font-medium text-indigo-700">{layerName}</h4>
              {expandedLayers.includes(layerName) ? (
                <ChevronUp className="w-5 h-5 text-indigo-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-indigo-600" />
              )}
            </button>
            {expandedLayers.includes(layerName) && (
              <div className="p-4">
                {renderDistributionChart(traits)}
                <div className="mt-6 space-y-2">
                  {Object.entries(traits).map(([traitName, count]) => (
                    <div key={traitName} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">{traitName}</span>
                      <span className="text-indigo-600">
                        {count} ({((count / generatedImages.length) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionAnalytics;
