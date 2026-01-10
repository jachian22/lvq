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
 * Design: Ochre active state, burgundy completed, larger regal circles.
 */
export function WizardProgress() {
  const { state, goToStep } = useWizard();
  const currentIndex = getStepNumber(state.currentStep) - 1;

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isClickable = index < currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <button
                onClick={() => isClickable && goToStep(step.id)}
                disabled={!isClickable}
                className={`
                  flex items-center justify-center w-12 h-12 rounded-full text-sm font-semibold transition-all duration-300 ease-regal
                  ${isActive ? "bg-ochre-500 text-charcoal ring-4 ring-ochre-200 shadow-gold" : ""}
                  ${isCompleted ? "bg-burgundy-800 text-cream-100 cursor-pointer hover:bg-burgundy-700" : ""}
                  ${!isActive && !isCompleted ? "bg-stone-200 text-stone-400" : ""}
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

              {/* Step label */}
              <span
                className={`
                  hidden sm:block ml-3 font-display text-sm font-medium transition-colors duration-200
                  ${isActive ? "text-charcoal" : ""}
                  ${isCompleted ? "text-burgundy-800" : ""}
                  ${!isActive && !isCompleted ? "text-stone-400" : ""}
                `}
              >
                {step.label}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3 sm:mx-4">
                  <div
                    className={`h-1 rounded-full transition-colors duration-500 ${
                      index < currentIndex ? "bg-burgundy-800" : "bg-stone-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step label */}
      <p className="sm:hidden text-center mt-4 text-sm text-stone-600">
        <span className="font-display font-semibold text-charcoal">Step {currentIndex + 1}</span> of {getTotalSteps()}: {steps[currentIndex]?.label}
      </p>
    </div>
  );
}
