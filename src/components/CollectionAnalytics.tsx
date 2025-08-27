import React, { useState } from 'react'
import { Layer, GeneratedImage } from '../types'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface CollectionAnalyticsProps {
  layers: Layer[]
  generatedImages: GeneratedImage[]
}

const CollectionAnalytics: React.FC<CollectionAnalyticsProps> = ({ layers, generatedImages }) => {
  const [expandedLayers, setExpandedLayers] = useState<string[]>([])

  const calculateTraitDistribution = () => {
    const distribution: { [key: string]: { [key: string]: number } } = {}
    
    layers.forEach(layer => {
      distribution[layer.name] = {}
      layer.traits.forEach(trait => {
        distribution[layer.name][trait.name.split('.')[0]] = 0
      })
    })

    generatedImages.forEach(image => {
      Object.entries(image.traits).forEach(([layerName, traitName]) => {
        distribution[layerName][traitName.split('.')[0]]++
      })
    })

    return distribution
  }

  const traitDistribution = calculateTraitDistribution()

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
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
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
    }

    return (
      <div className="h-64 sm:h-80 lg:h-96">
        <Bar data={data} options={options} />
      </div>
    )
  }

  const toggleLayerExpansion = (layerName: string) => {
    setExpandedLayers(prev =>
      prev.includes(layerName) ? prev.filter(name => name !== layerName) : [...prev, layerName]
    )
  }

  if (generatedImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
            <p className="text-gray-500">Generate some images first to see collection analytics and trait distribution.</p>
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
            Collection Analytics
          </CardTitle>
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {generatedImages.length} Images Generated
            </Badge>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(traitDistribution).map(([layerName, traits]) => (
          <Card key={layerName} className="overflow-hidden">
            <Button
              variant="ghost"
              onClick={() => toggleLayerExpansion(layerName)}
              className="w-full p-4 text-left bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 flex justify-between items-center rounded-none border-b"
            >
              <h4 className="text-lg font-medium text-indigo-700">{layerName}</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-white">
                  {Object.keys(traits).length} traits
                </Badge>
                {expandedLayers.includes(layerName) ? (
                  <ChevronUp className="w-5 h-5 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-indigo-600" />
                )}
              </div>
            </Button>
            {expandedLayers.includes(layerName) && (
              <CardContent className="p-4">
                <div className="mb-6">
                  {renderDistributionChart(traits)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(traits).map(([traitName, count]) => (
                    <div key={traitName} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 text-sm">{traitName}</span>
                      <div className="text-right">
                        <div className="text-indigo-600 font-semibold">{count}</div>
                        <div className="text-xs text-gray-500">
                          {((count / generatedImages.length) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CollectionAnalytics
