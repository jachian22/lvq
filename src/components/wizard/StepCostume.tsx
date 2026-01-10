import { useWizard, type CostumeOption } from "~/contexts/WizardContext";

interface StepCostumeProps {
  costumes: CostumeOption[];
}

/**
 * StepCostume component
 *
 * First wizard step: Select a costume/style for the portrait.
 * Design: Interactive portrait cards with golden glow, vignette hover effect.
 */
export function StepCostume({ costumes }: StepCostumeProps) {
  const { state, selectCostume, nextStep, canGoNext } = useWizard();

  const handleSelect = (costume: CostumeOption) => {
    selectCostume(costume);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-charcoal">Choose Your Style</h2>
        <p className="mt-3 text-stone-600">
          Select the costume your pet will wear in their royal portrait.
        </p>
      </div>

      {/* Costume grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {costumes.map((costume) => {
          const isSelected = state.selectedCostume?.id === costume.id;

          return (
            <button
              key={costume.id}
              onClick={() => handleSelect(costume)}
              className={`
                relative rounded-lg overflow-hidden aspect-[3/4] group transition-all duration-300 ease-regal
                ring-2 focus:outline-none focus-visible:ring-ochre-500 focus-visible:ring-offset-2
                ${isSelected
                  ? "ring-4 ring-ochre-500 ring-offset-2 shadow-gold-lg"
                  : "ring-transparent hover:ring-ochre-300 hover:shadow-gold hover:-translate-y-1"
                }
              `}
            >
              <img
                src={costume.imageUrl}
                alt={costume.label}
                className="w-full h-full object-cover transition-transform duration-500 ease-regal group-hover:scale-105"
              />

              {/* Vignette overlay */}
              <div className="absolute inset-0 pointer-events-none transition-shadow duration-500 ease-regal group-hover:shadow-[inset_0_0_60px_rgba(28,25,23,0.3)]" />

              {/* Label gradient */}
              <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent">
                <span className="font-display text-cream-100 font-semibold text-sm tracking-wide">
                  {costume.label}
                </span>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-7 h-7 bg-ochre-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-charcoal" viewBox="0 0 20 20" fill="currentColor">
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
          className="btn-primary px-8 py-3"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
