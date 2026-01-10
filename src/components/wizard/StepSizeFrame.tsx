import { useWizard, type SizeOption, type FrameOption } from "~/contexts/WizardContext";
import { useLocale } from "~/contexts/LocaleContext";

interface StepSizeFrameProps {
  sizes: SizeOption[];
  frames: FrameOption[];
}

/**
 * StepSizeFrame component
 *
 * Second wizard step: Select size and optional frame.
 * Design: Clean selection cards with ochre highlights, live pricing.
 */
export function StepSizeFrame({ sizes, frames }: StepSizeFrameProps) {
  const { state, selectSize, selectFrame, nextStep, previousStep, canGoNext, canGoPrevious } = useWizard();
  const { formatPrice } = useLocale();

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-charcoal">Size & Frame</h2>
        <p className="mt-3 text-stone-600">
          Choose your portrait size and add a frame if you'd like.
        </p>
      </div>

      {/* Size selection */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-charcoal">Select Size</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sizes.map((size) => {
            const isSelected = state.selectedSize?.id === size.id;

            return (
              <button
                key={size.id}
                onClick={() => selectSize(size)}
                className={`
                  p-5 rounded-lg border-2 text-left transition-all duration-200 ease-regal
                  ${isSelected
                    ? "border-ochre-500 bg-ochre-50 shadow-gold"
                    : "border-stone-200 hover:border-ochre-300 hover:bg-cream-50"
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-charcoal">{size.label}</p>
                    <p className="text-sm text-stone-500 mt-0.5">{size.dimensions}</p>
                  </div>
                  <p className="font-display text-lg font-bold text-ochre-700">{formatPrice(size.price)}</p>
                </div>

                {isSelected && (
                  <div className="mt-3 flex items-center text-ochre-700 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame selection */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-charcoal">Add a Frame <span className="text-stone-400 font-normal text-base">(Optional)</span></h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* No frame option */}
          <button
            onClick={() => selectFrame(null)}
            className={`
              p-5 rounded-lg border-2 text-center transition-all duration-200 ease-regal
              ${state.selectedFrame === null
                ? "border-ochre-500 bg-ochre-50 shadow-gold"
                : "border-stone-200 hover:border-ochre-300 hover:bg-cream-50"
              }
            `}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-lg bg-stone-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-medium text-charcoal">No Frame</p>
            <p className="text-sm text-stone-500 mt-0.5">Canvas only</p>
          </button>

          {/* Frame options */}
          {frames.map((frame) => {
            const isSelected = state.selectedFrame?.id === frame.id;

            return (
              <button
                key={frame.id}
                onClick={() => selectFrame(frame)}
                className={`
                  p-5 rounded-lg border-2 text-center transition-all duration-200 ease-regal
                  ${isSelected
                    ? "border-ochre-500 bg-ochre-50 shadow-gold"
                    : "border-stone-200 hover:border-ochre-300 hover:bg-cream-50"
                  }
                `}
              >
                <div
                  className="w-14 h-14 mx-auto mb-3 rounded border-4 bg-cream-100"
                  style={{ borderColor: frame.color ?? "#333" }}
                />
                <p className="font-medium text-charcoal">{frame.label}</p>
                <p className="text-sm text-ochre-700 font-medium mt-0.5">+{formatPrice(frame.price)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live price summary */}
      <div className="bg-cream-100 rounded-lg p-5 border border-cream-300">
        <div className="flex justify-between items-center">
          <span className="text-stone-600 font-medium">Total Price</span>
          <span className="font-display text-3xl font-bold text-ochre-700">
            {formatPrice(state.totalPrice)}
          </span>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={previousStep}
          disabled={!canGoPrevious()}
          className="px-6 py-3 text-stone-600 font-medium hover:text-charcoal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
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
