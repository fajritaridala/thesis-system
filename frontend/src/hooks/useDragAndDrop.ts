import { useState, DragEvent } from 'react';

interface UseDragAndDropProps {
  onFileDrop: (file: File) => void;
  acceptedTypes?: string[];
}

export const useDragAndDrop = ({ onFileDrop, acceptedTypes = ['application/pdf'] }: UseDragAndDropProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if file type is accepted
      if (acceptedTypes.length === 0 || acceptedTypes.includes(file.type)) {
        onFileDrop(file);
      } else {
        alert(`Tipe file tidak didukung. Harap unggah file dengan tipe: ${acceptedTypes.join(", ")}`);
      }
    }
  };

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
};
