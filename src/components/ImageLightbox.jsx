import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageLightbox = ({ images, selectedIndex, onClose, onNext, onPrev }) => {
  if (!images || images.length === 0) {
    return null;
  }

  // Stop background from scrolling
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, onPrev, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
        aria-label="Close image viewer"
      >
        <X size={40} />
      </button>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <img
          src={images[selectedIndex]}
          alt={`Property image ${selectedIndex + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Previous Button */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 bg-black bg-opacity-50 rounded-full transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft size={40} />
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 bg-black bg-opacity-50 rounded-full transition-colors"
        aria-label="Next image"
      >
        <ChevronRight size={40} />
      </button>
      
      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        {selectedIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageLightbox; 