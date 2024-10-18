import React from 'react';
import { Layers, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-indigo-600 text-white py-4">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <div className="flex items-center">
          <div className="mr-3 bg-white p-2 rounded-full">
            <Layers className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold flex items-center">
              Lamba Labs 4.0
              <Zap className="w-5 h-5 ml-2" />
            </h1>
            <p className="text-sm">Generative Art Tool</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
