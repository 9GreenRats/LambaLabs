import React from 'react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  showFinish: boolean;
  onFinish: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  showFinish, 
  onFinish 
}) => {
  return (
    <div className="flex justify-between mt-8">
      <button
        onClick={onBack}
        disabled={currentStep === 0}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Back
      </button>
      {showFinish ? (
        <button
          onClick={onFinish}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Finish
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      )}
    </div>
  );
};

export default StepNavigation;
