import { useWizard, getStepNumber, getTotalSteps, type WizardStep } from "~/contexts/WizardContext";

const steps: { id: WizardStep; label: string }[] = [
  { id: "costume", label: "Style" },
  { id: "size-frame", label: "Size & Frame" },
  { id: "photo", label: "Photo" },
  { id: "review", label: "Review" },
];

/**
 * WizardProgress component
 *
 * Shows progress through the 4-step customization flow.
 */
export function WizardProgress() {
  const { state, goToStep, canGoNext } = useWizard();
  const currentIndex = getStepNumber(state.currentStep) - 1;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isClickable = index < currentIndex; // Can only go back to completed steps

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <button
                onClick={() => isClickable && goToStep(step.id)}
                disabled={!isClickable}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors
                  ${isActive ? "bg-red-600 text-white" : ""}
                  ${isCompleted ? "bg-green-600 text-white cursor-pointer hover:bg-green-700" : ""}
                  ${!isActive && !isCompleted ? "bg-gray-200 text-gray-500" : ""}
                  ${isClickable ? "" : "cursor-default"}
                `}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>

              {/* Step label (below on mobile, inline on desktop) */}
              <span
                className={`
                  hidden sm:block ml-2 text-sm font-medium
                  ${isActive ? "text-gray-900" : "text-gray-500"}
                `}
              >
                {step.label}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div
                    className={`h-1 rounded ${
                      index < currentIndex ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step label */}
      <p className="sm:hidden text-center mt-3 text-sm text-gray-600">
        Step {currentIndex + 1} of {getTotalSteps()}: {steps[currentIndex]?.label}
      </p>
    </div>
  );
}
