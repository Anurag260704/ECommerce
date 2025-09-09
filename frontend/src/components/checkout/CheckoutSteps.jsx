import React from 'react';

const CheckoutSteps = ({ currentStep, onStepClick }) => {
    const steps = [
        { number: 1, title: 'Shipping', description: 'Address details' },
        { number: 2, title: 'Payment', description: 'Payment method' },
        { number: 3, title: 'Review', description: 'Place order' }
    ];

    const getStepStatus = (stepNumber) => {
        if (stepNumber < currentStep) return 'completed';
        if (stepNumber === currentStep) return 'active';
        return 'upcoming';
    };

    const getStepClasses = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-600 text-white border-green-600';
            case 'active':
                return 'bg-blue-600 text-white border-blue-600';
            case 'upcoming':
                return 'bg-gray-200 text-gray-600 border-gray-300';
            default:
                return 'bg-gray-200 text-gray-600 border-gray-300';
        }
    };

    const getConnectorClasses = (index) => {
        const status = getStepStatus(index + 1);
        if (status === 'completed') {
            return 'bg-green-600';
        }
        return 'bg-gray-300';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        {/* Step */}
                        <div 
                            className="flex flex-col items-center cursor-pointer group"
                            onClick={() => onStepClick(step.number)}
                        >
                            {/* Step Circle */}
                            <div 
                                className={`
                                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                                    text-sm font-semibold transition-colors duration-200
                                    group-hover:scale-110 transform
                                    ${getStepClasses(getStepStatus(step.number))}
                                `}
                            >
                                {getStepStatus(step.number) === 'completed' ? (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path 
                                            fillRule="evenodd" 
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                            clipRule="evenodd" 
                                        />
                                    </svg>
                                ) : (
                                    step.number
                                )}
                            </div>
                            
                            {/* Step Info */}
                            <div className="text-center mt-3">
                                <p className={`
                                    text-sm font-medium
                                    ${getStepStatus(step.number) === 'active' ? 'text-blue-600' : ''}
                                    ${getStepStatus(step.number) === 'completed' ? 'text-green-600' : ''}
                                    ${getStepStatus(step.number) === 'upcoming' ? 'text-gray-600' : ''}
                                `}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {step.description}
                                </p>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-4">
                                <div 
                                    className={`
                                        h-0.5 transition-colors duration-200
                                        ${getConnectorClasses(index)}
                                    `}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Mobile Progress Bar */}
            <div className="mt-6 md:hidden">
                <div className="bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                    Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
                </p>
            </div>
        </div>
    );
};

export default CheckoutSteps;
