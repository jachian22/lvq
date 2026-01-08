import { useEffect } from "react";
import { useWizard, type CostumeOption, type SizeOption, type FrameOption } from "~/contexts/WizardContext";
import { WizardProgress } from "./WizardProgress";
import { StepCostume } from "./StepCostume";
import { StepSizeFrame } from "./StepSizeFrame";
import { StepPhotoUpload } from "./StepPhotoUpload";
import { StepReview } from "./StepReview";

interface WizardContainerProps {
  productId: string;
  productHandle: string;
  productTitle: string;
  basePrice: number;
  costumes: CostumeOption[];
  sizes: SizeOption[];
  frames: FrameOption[];
}

/**
 * WizardContainer component
 *
 * Main container for the 4-step product customization wizard.
 * Manages the state machine and renders the current step.
 */
export function WizardContainer({
  productId,
  productHandle,
  productTitle,
  basePrice,
  costumes,
  sizes,
  frames,
}: WizardContainerProps) {
  const { state, setProduct } = useWizard();

  // Initialize product data
  useEffect(() => {
    setProduct(productId, productHandle, productTitle, basePrice);
  }, [productId, productHandle, productTitle, basePrice, setProduct]);

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case "costume":
        return <StepCostume costumes={costumes} />;
      case "size-frame":
        return <StepSizeFrame sizes={sizes} frames={frames} />;
      case "photo":
        return <StepPhotoUpload />;
      case "review":
        return <StepReview />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress bar */}
      <WizardProgress />

      {/* Step content */}
      <div className="mt-8">
        {renderStep()}
      </div>
    </div>
  );
}
