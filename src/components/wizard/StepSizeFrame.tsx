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
 */
export function StepSizeFrame({ sizes, frames }: StepSizeFrameProps) {
  const { state, selectSize, selectFrame, nextStep, previousStep, canGoNext, canGoPrevious } = useWizard();
  const { formatPrice } = useLocale();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Size & Frame</h2>
        <p className="mt-2 text-gray-600">
          Choose your portrait size and add a frame if you'd like.
        </p>
      </div>

      {/* Size selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Size</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sizes.map((size) => {
            const isSelected = state.selectedSize?.id === size.id;

            return (
              <button
                key={size.id}
                onClick={() => selectSize(size)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${isSelected
                    ? "border-red-600 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{size.label}</p>
                    <p className="text-sm text-gray-500">{size.dimensions}</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatPrice(size.price)}</p>
                </div>

                {isSelected && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
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
        <h3 className="text-lg font-semibold text-gray-900">Add a Frame (Optional)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* No frame option */}
          <button
            onClick={() => selectFrame(null)}
            className={`
              p-4 rounded-lg border-2 text-center transition-all
              ${state.selectedFrame === null
                ? "border-red-600 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
              }
            `}
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">No Frame</p>
            <p className="text-sm text-gray-500">Canvas only</p>
          </button>

          {/* Frame options */}
          {frames.map((frame) => {
            const isSelected = state.selectedFrame?.id === frame.id;

            return (
              <button
                key={frame.id}
                onClick={() => selectFrame(frame)}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${isSelected
                    ? "border-red-600 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div
                  className="w-12 h-12 mx-auto mb-2 rounded border-4"
                  style={{ borderColor: frame.color ?? "#333" }}
                />
                <p className="font-medium text-gray-900">{frame.label}</p>
                <p className="text-sm text-gray-500">+{formatPrice(frame.price)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live price summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Price</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(state.totalPrice)}
          </span>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={previousStep}
          disabled={!canGoPrevious()}
          className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
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
