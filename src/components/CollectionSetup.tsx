import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface CollectionSetupProps {
  collectionName: string
  setCollectionName: (name: string) => void
  collectionDescription: string
  setCollectionDescription: (description: string) => void
}

const useFormValidation = (name: string, description: string) => {
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    let valid = true

    if (name.trim().length < 3) {
      setNameError('Collection name must be at least 3 characters long')
      valid = false
    } else {
      setNameError('')
    }

    if (description.trim().length < 10) {
      setDescriptionError('Description must be at least 10 characters long')
      valid = false
    } else {
      setDescriptionError('')
    }

    setIsValid(valid)
  }, [name, description])

  return { nameError, descriptionError, isValid }
}

const CollectionSetup: React.FC<CollectionSetupProps> = ({
  collectionName,
  setCollectionName,
  collectionDescription,
  setCollectionDescription,
}) => {
  const { nameError, descriptionError, isValid } = useFormValidation(collectionName, collectionDescription)

  const handleClear = () => {
    setCollectionName('')
    setCollectionDescription('')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-indigo-700">
            Collection Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="collectionName"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  nameError ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="Enter collection name"
                title="Enter a unique and memorable name for your NFT collection (at least 3 characters)"
              />
              {nameError ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              ) : isValid && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {nameError && <p className="mt-2 text-sm text-red-500">{nameError}</p>}
          </div>

          <div>
            <label htmlFor="collectionDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Collection Description
            </label>
            <div className="relative">
              <textarea
                id="collectionDescription"
                value={collectionDescription}
                onChange={(e) => setCollectionDescription(e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  descriptionError ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="Enter collection description"
                title="Provide a detailed description of your NFT collection (at least 10 characters)"
              />
              {descriptionError ? (
                <div className="absolute top-3 right-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              ) : isValid && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {descriptionError && <p className="mt-2 text-sm text-red-500">{descriptionError}</p>}
            <p className="mt-2 text-sm text-gray-500 text-right">
              {collectionDescription.length} / 500 characters
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              {isValid ? (
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Collection setup is valid
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please fill in all required fields
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleClear}
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CollectionSetup
