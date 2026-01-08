import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/**
 * Wizard steps
 */
export type WizardStep = "costume" | "size-frame" | "photo" | "review";

/**
 * Size option
 */
export interface SizeOption {
  id: string;
  label: string;
  dimensions: string;
  price: number;
}

/**
 * Frame option
 */
export interface FrameOption {
  id: string;
  label: string;
  price: number;
  color?: string;
}

/**
 * Costume option
 */
export interface CostumeOption {
  id: string;
  label: string;
  imageUrl: string;
}

/**
 * Wizard state
 */
export interface WizardState {
  // Current step
  currentStep: WizardStep;

  // Product info
  productId: string | null;
  productHandle: string | null;
  productTitle: string | null;

  // Selected options
  selectedCostume: CostumeOption | null;
  selectedSize: SizeOption | null;
  selectedFrame: FrameOption | null;

  // Uploaded image
  uploadedImageUrl: string | null;
  uploadedImageName: string | null;

  // Calculated price
  basePrice: number;
  totalPrice: number;
}

/**
 * Context value type
 */
interface WizardContextValue {
  state: WizardState;
  // Navigation
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  getStepIndex: () => number;
  // Actions
  setProduct: (productId: string, productHandle: string, productTitle: string, basePrice: number) => void;
  selectCostume: (costume: CostumeOption) => void;
  selectSize: (size: SizeOption) => void;
  selectFrame: (frame: FrameOption | null) => void;
  setUploadedImage: (url: string, name: string) => void;
  clearUploadedImage: () => void;
  reset: () => void;
  // Helpers
  getVariantId: () => string | null;
  getCartAttributes: () => Array<{ key: string; value: string }>;
}

/**
 * Step order
 */
const stepOrder: WizardStep[] = ["costume", "size-frame", "photo", "review"];

/**
 * Initial state
 */
const initialState: WizardState = {
  currentStep: "costume",
  productId: null,
  productHandle: null,
  productTitle: null,
  selectedCostume: null,
  selectedSize: null,
  selectedFrame: null,
  uploadedImageUrl: null,
  uploadedImageName: null,
  basePrice: 0,
  totalPrice: 0,
};

/**
 * Create the context
 */
const WizardContext = createContext<WizardContextValue | null>(null);

/**
 * Calculate total price
 */
function calculateTotalPrice(state: WizardState): number {
  let total = state.selectedSize?.price ?? state.basePrice;
  if (state.selectedFrame) {
    total += state.selectedFrame.price;
  }
  return total;
}

/**
 * WizardProvider component
 */
export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);

  // Navigation
  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = stepOrder.indexOf(prev.currentStep);
      const nextIndex = Math.min(currentIndex + 1, stepOrder.length - 1);
      return { ...prev, currentStep: stepOrder[nextIndex]! };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = stepOrder.indexOf(prev.currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return { ...prev, currentStep: stepOrder[prevIndex]! };
    });
  }, []);

  const canGoNext = useCallback((): boolean => {
    switch (state.currentStep) {
      case "costume":
        return state.selectedCostume !== null;
      case "size-frame":
        return state.selectedSize !== null;
      case "photo":
        return state.uploadedImageUrl !== null;
      case "review":
        return false; // Last step
      default:
        return false;
    }
  }, [state]);

  const canGoPrevious = useCallback((): boolean => {
    return stepOrder.indexOf(state.currentStep) > 0;
  }, [state.currentStep]);

  const getStepIndex = useCallback((): number => {
    return stepOrder.indexOf(state.currentStep);
  }, [state.currentStep]);

  // Actions
  const setProduct = useCallback(
    (productId: string, productHandle: string, productTitle: string, basePrice: number) => {
      setState((prev) => ({
        ...prev,
        productId,
        productHandle,
        productTitle,
        basePrice,
        totalPrice: basePrice,
      }));
    },
    []
  );

  const selectCostume = useCallback((costume: CostumeOption) => {
    setState((prev) => ({
      ...prev,
      selectedCostume: costume,
    }));
  }, []);

  const selectSize = useCallback((size: SizeOption) => {
    setState((prev) => {
      const newState = { ...prev, selectedSize: size };
      return { ...newState, totalPrice: calculateTotalPrice(newState) };
    });
  }, []);

  const selectFrame = useCallback((frame: FrameOption | null) => {
    setState((prev) => {
      const newState = { ...prev, selectedFrame: frame };
      return { ...newState, totalPrice: calculateTotalPrice(newState) };
    });
  }, []);

  const setUploadedImage = useCallback((url: string, name: string) => {
    setState((prev) => ({
      ...prev,
      uploadedImageUrl: url,
      uploadedImageName: name,
    }));
  }, []);

  const clearUploadedImage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      uploadedImageUrl: null,
      uploadedImageName: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Helpers
  const getVariantId = useCallback((): string | null => {
    // This would map selected options to a Shopify variant ID
    // The actual implementation depends on your Shopify product structure
    // For now, return a placeholder
    if (!state.productId || !state.selectedSize) {
      return null;
    }
    // In real implementation, this would look up the variant based on selected options
    return state.productId;
  }, [state.productId, state.selectedSize]);

  const getCartAttributes = useCallback((): Array<{ key: string; value: string }> => {
    const attributes: Array<{ key: string; value: string }> = [];

    if (state.selectedCostume) {
      attributes.push({ key: "_costume_style", value: state.selectedCostume.id });
    }

    if (state.selectedFrame) {
      attributes.push({ key: "_frame_option", value: state.selectedFrame.id });
    }

    if (state.uploadedImageUrl) {
      attributes.push({ key: "_customization_image", value: state.uploadedImageUrl });
    }

    // Visible at checkout
    attributes.push({ key: "Customization", value: "Custom pet portrait" });

    return attributes;
  }, [state]);

  return (
    <WizardContext.Provider
      value={{
        state,
        goToStep,
        nextStep,
        previousStep,
        canGoNext,
        canGoPrevious,
        getStepIndex,
        setProduct,
        selectCostume,
        selectSize,
        selectFrame,
        setUploadedImage,
        clearUploadedImage,
        reset,
        getVariantId,
        getCartAttributes,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

/**
 * Hook to access wizard context
 */
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}

/**
 * Get step number (1-indexed for display)
 */
export function getStepNumber(step: WizardStep): number {
  return stepOrder.indexOf(step) + 1;
}

/**
 * Get total steps
 */
export function getTotalSteps(): number {
  return stepOrder.length;
}
