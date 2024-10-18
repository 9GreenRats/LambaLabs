import React from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertTriangle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${bgColors[type]} p-4 rounded-md shadow-md flex items-center`}>
      {icons[type]}
      <span className="ml-3 text-sm font-medium text-gray-900">{message}</span>
      <button onClick={onClose} className="ml-auto bg-white rounded-md p-1.5 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Notification;
