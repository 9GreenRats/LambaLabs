import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Layer, GeneratedImage } from './types';
import CollectionSetup from './components/CollectionSetup';
import LayerUpload from './components/LayerUpload';
import RarityConfiguration from './components/RarityConfiguration';
import ImageGeneration from './components/ImageGeneration';
import CollectionAnalytics from './components/CollectionAnalytics';
import { Settings, Layers, Sliders, Image, BarChart2, ChevronRight, ChevronLeft, CheckCircle, HelpCircle, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeSection, setActiveSection] = useState('welcome');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false, false]);
  const [imagesGenerated, setImagesGenerated] = useState(false);

  const sections = [
    { id: 'welcome', name: 'Welcome', icon: HelpCircle },
    { id: 'setup', name: 'Collection Setup', icon: Settings },
    { id: 'layers', name: 'Layer Upload', icon: Layers },
    { id: 'rarity', name: 'Rarity Configuration', icon: Sliders },
    { id: 'generation', name: 'Image Generation', icon: Image },
    { id: 'analytics', name: 'Collection Analytics', icon: BarChart2 },
  ];

  useEffect(() => {
    validateSteps();
  }, [collectionName, collectionDescription, layers, generatedImages, imagesGenerated]);

  const validateSteps = () => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[0] = true; 
    newCompletedSteps[1] = collectionName.trim() !== '' && collectionDescription.trim() !== '';
    newCompletedSteps[2] = layers.length > 0;
    newCompletedSteps[3] = layers.every(layer => layer.traits.every(trait => trait.rarity > 0));
    newCompletedSteps[4] = imagesGenerated;
    newCompletedSteps[5] = imagesGenerated;
    setCompletedSteps(newCompletedSteps);
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(layers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLayers(items.map((item, index) => ({ ...item, order: index })));
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 md:px-6">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-indigo-700">Welcome to Lamba Labs NFT Generator</h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl">Create unique NFT collections with ease using our powerful generative art tool.</p>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <ul className="text-left space-y-4">
                <li className="flex items-center"><CheckCircle className="mr-3 text-green-500" size={24} /> Set up your collection details</li>
                <li className="flex items-center"><CheckCircle className="mr-3 text-green-500" size={24} /> Upload and organize your trait layers</li>
                <li className="flex items-center"><CheckCircle className="mr-3 text-green-500" size={24} /> Configure rarity and dependencies</li>
                <li className="flex items-center"><CheckCircle className="mr-3 text-green-500" size={24} /> Generate and preview your unique NFTs</li>
                <li className="flex items-center"><CheckCircle className="mr-3 text-green-500" size={24} /> Analyze your collection statistics</li>
              </ul>
            </div>
            <button
              onClick={() => setActiveSection('setup')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
            >
              Get Started
            </button>
          </div>
        );
      case 'setup':
        return (
          <CollectionSetup
            collectionName={collectionName}
            setCollectionName={setCollectionName}
            collectionDescription={collectionDescription}
            setCollectionDescription={setCollectionDescription}
          />
        );
      case 'layers':
        return (
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <LayerUpload layers={layers} setLayers={setLayers} />
          </DragDropContext>
        );
      case 'rarity':
        return <RarityConfiguration layers={layers} setLayers={setLayers} />;
      case 'generation':
        return (
          <ImageGeneration
            layers={layers}
            collectionName={collectionName}
            collectionDescription={collectionDescription}
            generatedImages={generatedImages}
            setGeneratedImages={setGeneratedImages}
            setImagesGenerated={setImagesGenerated}
            showNotification={showNotification}
          />
        );
      case 'analytics':
        return <CollectionAnalytics layers={layers} generatedImages={generatedImages} />;
      default:
        return null;
    }
  };

  const renderBreadcrumbs = () => {
    const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 whitespace-nowrap">
        {sections.slice(0, currentSectionIndex + 1).map((section, index) => (
          <React.Fragment key={section.id}>
            {index > 0 && <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
            <button
              onClick={() => setActiveSection(section.id)}
              className={`hover:text-indigo-600 transition-colors duration-200 ${
                index === currentSectionIndex ? 'font-semibold text-indigo-600' : ''
              }`}
            >
              {section.name}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar - Full width on mobile, side panel on desktop */}
      <motion.div
        initial={false}
        animate={{ 
          width: sidebarCollapsed ? '4rem' : '16rem',
          height: sidebarCollapsed ? '3rem' : 'auto'
        }}
        className="bg-indigo-800 text-white transition-all duration-300 flex flex-col md:h-screen z-20"
      >
        <div className="p-4 flex justify-between items-center border-b border-indigo-700">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold"
              >
                <h1 className="text-xl font-bold flex items-center">
                  <Palette className="mr-2" size={24} />
                  <span className="hidden md:inline">Lamba Labs</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="p-1 rounded-full hover:bg-indigo-700 transition-colors duration-200"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className={`${sidebarCollapsed ? 'hidden md:flex' : 'flex'} flex-col flex-grow mt-6`}>
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveSection(section.id);
                if (window.innerWidth < 768) setSidebarCollapsed(true);
              }}
              className={`w-full p-3 flex items-center hover:bg-indigo-700 transition-colors duration-200 ${
                activeSection === section.id ? 'bg-indigo-900' : ''
              }`}
            >
              <section.icon size={20} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-4 text-sm"
                  >
                    {section.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {completedSteps[index] && <CheckCircle className="ml-auto text-green-400" size={16} />}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col h-screen">
        <header className="bg-white shadow-sm p-4 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <h2 className="text-xl md:text-2xl font-bold text-indigo-700">
              {sections.find(s => s.id === activeSection)?.name}
            </h2>
            <div className="overflow-x-auto pb-2 md:pb-0">
              {renderBreadcrumbs()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-3 md:p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white overflow-hidden shadow-lg rounded-lg"
          >
            <div className="p-4 md:p-6">
              {renderActiveSection()}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Mobile-friendly notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto p-4 rounded-md shadow-md flex items-center z-50 ${
              notification.type === 'success' ? 'bg-green-100 text-green-800' :
              notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <CheckCircle className="mr-2 flex-shrink-0" size={20} />
            <span className="flex-1 text-sm">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)} 
              className="ml-4 text-gray-500 hover:text-gray-700 flex-shrink-0"
              aria-label="Close notification"
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
