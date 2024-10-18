import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

interface CollectionSetupProps {
  collectionName: string;
  setCollectionName: (name: string) => void;
  collectionDescription: string;
  setCollectionDescription: (description: string) => void;
}

const useFormValidation = (name: string, description: string) => {
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let valid = true;

    if (name.trim().length < 3) {
      setNameError('Collection name must be at least 3 characters long');
      valid = false;
    } else {
      setNameError('');
    }

    if (description.trim().length < 10) {
      setDescriptionError('Description must be at least 10 characters long');
      valid = false;
    } else {
      setDescriptionError('');
    }

    setIsValid(valid);
  }, [name, description]);

  return { nameError, descriptionError, isValid };
};

const CollectionSetup: React.FC<CollectionSetupProps> = ({
  collectionName,
  setCollectionName,
  collectionDescription,
  setCollectionDescription,
}) => {
  const { nameError, descriptionError, isValid } = useFormValidation(collectionName, collectionDescription);

  const handleClear = () => {
    setCollectionName('');
    setCollectionDescription('');
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 mb-1">
          Collection Name
        </label>
        <div className="relative">
          <input
            type="text"
            id="collectionName"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        {nameError && <p className="mt-1 text-sm text-red-500">{nameError}</p>}
      </div>
      <div>
        <label htmlFor="collectionDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Collection Description
        </label>
        <div className="relative">
          <textarea
            id="collectionDescription"
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              descriptionError ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'
            }`}
            placeholder="Enter collection description"
            title="Provide a detailed description of your NFT collection (at least 10 characters)"
          ></textarea>
          {descriptionError ? (
            <div className="absolute top-2 right-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          ) : isValid && (
            <div className="absolute top-2 right-2">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        {descriptionError && <p className="mt-1 text-sm text-red-500">{descriptionError}</p>}
        <p className="mt-1 text-sm text-gray-500 text-right">
          {collectionDescription.length} / 500 characters
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {isValid ? (
            <span className="text-green-500 flex items-center">
              <Check className="h-5 w-5 mr-1" /> Collection setup is valid
            </span>
          ) : (
            <span className="text-red-500 flex items-center">
              <AlertCircle className="h-5 w-5 mr-1" /> Please fill in all required fields
            </span>
          )}
        </p>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          <X className="w-4 h-4 inline-block mr-1" /> Clear
        </button>
      </div>
    </div>
  );
};

export default CollectionSetup;
