import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LambaLabs from './components/LambaLabs';
import './index.css';

const isLambaLabs = import.meta.env.MODE === 'lambalabs';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isLambaLabs ? <LambaLabs /> : <App />}
  </React.StrictMode>,
);
