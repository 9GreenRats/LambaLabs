import React, { useState, useEffect } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { Layer, GeneratedImage } from '../types'
import CollectionSetup from './CollectionSetup'
import LayerUpload from './LayerUpload'
import RarityConfiguration from './RarityConfiguration'
import ImageGeneration from './ImageGeneration'
import CollectionAnalytics from './CollectionAnalytics'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { 
  Settings, 
  Layers, 
  Sliders, 
  Image, 
  BarChart2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  HelpCircle, 
  Palette,
  Menu,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const LambaLabs: React.FC = () => {
  const [collectionName, setCollectionName] = useState('')
  const [collectionDescription, setCollectionDescription] = useState('')
  const [layers, setLayers] = useState<Layer[]>([])
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [activeSection, setActiveSection] = useState('welcome')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false, false])
  const [imagesGenerated, setImagesGenerated] = useState(false)

  const sections = [
    { id: 'welcome', name: 'Welcome', icon: HelpCircle },
    { id: 'setup', name: 'Collection Setup', icon: Settings },
    { id: 'layers', name: 'Layer Upload', icon: Layers },
    { id: 'rarity', name: 'Rarity Configuration', icon: Sliders },
    { id: 'generation', name: 'Image Generation', icon: Image },
    { id: 'analytics', name: 'Collection Analytics', icon: BarChart2 },
  ]

  useEffect(() => {
    validateSteps()
  }, [collectionName, collectionDescription, layers, generatedImages, imagesGenerated])

  const validateSteps = () => {
    const newCompletedSteps = [...completedSteps]
    newCompletedSteps[0] = true // Welcome is always completed
    newCompletedSteps[1] = collectionName.trim() !== '' && collectionDescription.trim() !== ''
    newCompletedSteps[2] = layers.length > 0
    newCompletedSteps[3] = layers.every(layer => layer.traits.every(trait => trait.rarity > 0))
    newCompletedSteps[4] = imagesGenerated
    newCompletedSteps[5] = imagesGenerated
    setCompletedSteps(newCompletedSteps)
  }

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(layers)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setLayers(items.map((item, index) => ({ ...item, order: index })))
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-4xl mb-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-700 mb-4">
                  Welcome to Lamba Labs NFT Generator
                </CardTitle>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  Create unique NFT collections with ease using our powerful generative art tool.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Set up your collection details</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Upload and organize your trait layers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Configure rarity and dependencies</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Generate and preview your unique NFTs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Analyze your collection statistics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button 
              onClick={() => setActiveSection('setup')}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-lg font-semibold px-8 py-3"
            >
              Get Started
            </Button>
          </div>
        )
      case 'setup':
        return (
          <CollectionSetup
            collectionName={collectionName}
            setCollectionName={setCollectionName}
            collectionDescription={collectionDescription}
            setCollectionDescription={setCollectionDescription}
          />
        )
      case 'layers':
        return (
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <LayerUpload layers={layers} setLayers={setLayers} />
          </DragDropContext>
        )
      case 'rarity':
        return <RarityConfiguration layers={layers} setLayers={setLayers} />
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
        )
      case 'analytics':
        return <CollectionAnalytics layers={layers} generatedImages={generatedImages} />
      default:
        return null
    }
  }

  const renderBreadcrumbs = () => {
    const currentSectionIndex = sections.findIndex(s => s.id === activeSection)
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 overflow-x-auto pb-2">
        {sections.slice(0, currentSectionIndex + 1).map((section, index) => (
          <React.Fragment key={section.id}>
            {index > 0 && <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className={`hover:text-indigo-600 transition-colors duration-200 ${
                index === currentSectionIndex ? 'font-semibold text-indigo-600' : ''
              }`}
            >
              {section.name}
            </Button>
          </React.Fragment>
        ))}
      </div>
    )
  }

  const renderSidebar = () => (
    <motion.div
      initial={false}
      animate={{ 
        width: sidebarCollapsed ? '4rem' : '16rem',
        height: sidebarCollapsed ? '3rem' : 'auto'
      }}
      className="bg-indigo-800 text-white transition-all duration-300 flex flex-col h-screen z-20"
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
                <span className="hidden lg:inline">Lamba Labs</span>
              </h1>
              <p className="text-xs text-indigo-300 hidden lg:block">Generative Art Tool</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
          className="p-1 rounded-full hover:bg-indigo-700 transition-colors duration-200 text-white"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
      <nav className={`${sidebarCollapsed ? 'hidden lg:flex' : 'flex'} flex-col flex-grow mt-6`}>
        {sections.map((section, index) => (
          <motion.button
            key={section.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveSection(section.id)
              if (window.innerWidth < 1024) setMobileMenuOpen(false)
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
  )

  const renderMobileMenu = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-indigo-800 text-white p-0">
        <div className="p-4 border-b border-indigo-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center">
              <Palette className="mr-2" size={24} />
              Lamba Labs
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:bg-indigo-700"
            >
              <X size={20} />
            </Button>
          </div>
          <p className="text-xs text-indigo-300 mt-1">Generative Art Tool</p>
        </div>
        <nav className="flex flex-col mt-6">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id)
                setMobileMenuOpen(false)
              }}
              className={`w-full p-3 flex items-center hover:bg-indigo-700 transition-colors duration-200 ${
                activeSection === section.id ? 'bg-indigo-900' : ''
              }`}
            >
              <section.icon size={20} />
              <span className="ml-4 text-sm">{section.name}</span>
              {completedSteps[index] && <CheckCircle className="ml-auto text-green-400" size={16} />}
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {renderSidebar()}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col h-screen">
        <header className="bg-white shadow-sm p-4 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center justify-between">
              {renderMobileMenu()}
              <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">
                {sections.find(s => s.id === activeSection)?.name}
              </h2>
            </div>
            <div className="overflow-x-auto">
              {renderBreadcrumbs()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-3 sm:p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white overflow-hidden shadow-lg rounded-lg h-full"
          >
            <div className="p-4 sm:p-6 h-full overflow-auto">
              {renderActiveSection()}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-auto p-4 rounded-md shadow-md flex items-center z-50 ${
              notification.type === 'success' ? 'bg-green-100 text-green-800' :
              notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <CheckCircle className="mr-2 flex-shrink-0" size={20} />
            <span className="flex-1 text-sm">{notification.message}</span>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setNotification(null)} 
              className="ml-4 text-gray-500 hover:text-gray-700 flex-shrink-0"
              aria-label="Close notification"
            >
              <X size={20} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LambaLabs
