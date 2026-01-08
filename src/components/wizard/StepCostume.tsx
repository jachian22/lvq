import { useWizard, type CostumeOption } from "~/contexts/WizardContext";

interface StepCostumeProps {
  costumes: CostumeOption[];
}

/**
 * StepCostume component
 *
 * First wizard step: Select a costume/style for the portrait.
 */
export function StepCostume({ costumes }: StepCostumeProps) {
  const { state, selectCostume, nextStep, canGoNext } = useWizard();

  const handleSelect = (costume: CostumeOption) => {
    selectCostume(costume);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Style</h2>
        <p className="mt-2 text-gray-600">
          Select the costume your pet will wear in their royal portrait.
        </p>
      </div>

      {/* Costume grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {costumes.map((costume) => {
          const isSelected = state.selectedCostume?.id === costume.id;

          return (
            <button
              key={costume.id}
              onClick={() => handleSelect(costume)}
              className={`
                relative rounded-lg overflow-hidden aspect-[3/4] group transition-all
                ${isSelected ? "ring-4 ring-red-600 ring-offset-2" : "hover:shadow-lg"}
              `}
            >
              <img
                src={costume.imageUrl}
                alt={costume.label}
                className="w-full h-full object-cover"
              />
              <div className={`
                absolute inset-0 flex items-end justify-center pb-4
                bg-gradient-to-t from-black/60 via-transparent to-transparent
              `}>
                <span className="text-white font-medium text-sm">
                  {costume.label}
                </span>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="flex justify-end">
        <button
          onClick={nextStep}
          disabled={!canGoNext()}
          className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
