import { useState, useCallback } from "react";
import { useWizard } from "~/contexts/WizardContext";

/**
 * StepPhotoUpload component
 *
 * Third wizard step: Upload a photo of your pet.
 * Uses UploadThing for file handling.
 */
export function StepPhotoUpload() {
  const { state, setUploadedImage, clearUploadedImage, nextStep, previousStep, canGoNext, canGoPrevious } = useWizard();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // For now, create a local preview URL
      // In production, this would use UploadThing
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl, file.name);

      // TODO: Replace with actual UploadThing upload
      // const response = await uploadFiles([file]);
      // setUploadedImage(response[0].url, file.name);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Upload Your Photo</h2>
        <p className="mt-2 text-gray-600">
          Upload a clear photo of your pet. We'll transform it into a stunning portrait.
        </p>
      </div>

      {/* Photo tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Photo Tips
        </h3>
        <ul className="mt-2 text-sm text-blue-800 space-y-1">
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            Use a clear, high-resolution photo
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            Make sure your pet's face is clearly visible
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            Good lighting works best
          </li>
          <li className="flex items-start">
            <span className="text-red-600 mr-2">✗</span>
            Avoid blurry or dark photos
          </li>
        </ul>
      </div>

      {/* Upload area */}
      {state.uploadedImageUrl ? (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative max-w-md mx-auto">
            <img
              src={state.uploadedImageUrl}
              alt="Uploaded pet photo"
              className="w-full rounded-lg shadow-lg"
            />
            <button
              onClick={clearUploadedImage}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Remove photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="text-center text-sm text-gray-500">
            {state.uploadedImageName}
          </p>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
            ${isDragging ? "border-red-600 bg-red-50" : "border-gray-300 hover:border-gray-400"}
            ${isUploading ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
            disabled={isUploading}
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">
              {isUploading ? "Uploading..." : "Drag and drop your photo here"}
            </p>
            <p className="mt-2 text-gray-500">
              or <span className="text-red-600 underline">browse files</span>
            </p>
            <p className="mt-2 text-sm text-gray-400">
              JPG, PNG up to 10MB
            </p>
          </label>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-4 text-center">
          {error}
        </div>
      )}

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
