import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { Upload, X, Star, GripVertical, AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface MediaUploaderProps {
  photos: string[];
  coverIndex: number;
  onPhotosChange: (photos: string[]) => void;
  onCoverChange: (index: number) => void;
  maxPhotos?: number;
}

export function MediaUploader({
  photos,
  coverIndex,
  onPhotosChange,
  onCoverChange,
  maxPhotos = 8,
}: MediaUploaderProps) {
  const { t, lang } = useI18n();
  const [dragOver, setDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const handlePhotoAdd = () => {
    // Simulate adding a photo with sample images
    const sampleImages = [
      'https://images.pexels.com/photos/33521845/pexels-photo-33521845.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/7587828/pexels-photo-7587828.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/30639091/pexels-photo-30639091.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ];
    if (photos.length < maxPhotos) {
      const newPhoto = sampleImages[photos.length % sampleImages.length];
      onPhotosChange([...photos, newPhoto]);
    }
  };

  const handlePhotoDelete = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
    if (coverIndex === index && updated.length > 0) {
      onCoverChange(0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    // In a real implementation, this would handle file drops
    if (photos.length < maxPhotos) {
      handlePhotoAdd();
    }
  };

  // Image drag handlers
  const handleImageDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(index);
  };

  const handleImageDragLeave = () => {
    setDropTarget(null);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newPhotos = [...photos];
      const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
      newPhotos.splice(dropIndex, 0, draggedPhoto);
      
      // Update photos array
      onPhotosChange(newPhotos);
      
      // Update cover index if needed
      if (coverIndex === draggedIndex) {
        onCoverChange(dropIndex);
      } else if (draggedIndex < coverIndex && dropIndex >= coverIndex) {
        onCoverChange(coverIndex - 1);
      } else if (draggedIndex > coverIndex && dropIndex <= coverIndex) {
        onCoverChange(coverIndex + 1);
      }
    }
    
    setDraggedIndex(null);
    setDropTarget(null);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
    setDropTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver
              ? 'border-primary-500 bg-primary-50'
              : 'border-sand-200 bg-sand-50 hover:border-primary-300'
          }`}
        >
          <Upload className="w-8 h-8 text-primary-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-primary-600 mb-1">{t('dragPhotos')}</p>
          <p className="text-xs text-primary-400 mb-3">{t('or')}</p>
          <button
            onClick={handlePhotoAdd}
            type="button"
            className="btn-primary text-sm"
          >
            {t('selectPhotos')}
          </button>
          <p className="text-xs text-primary-400 mt-3">
            {t('maxPhotos')}: {maxPhotos} • {photos.length}/{maxPhotos}
          </p>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <>
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700">{t('dragToReorder')}</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {photos.map((photo, i) => (
              <div
                key={i}
                draggable={true}
                onDragStart={(e) => handleImageDragStart(e, i)}
                onDragOver={(e) => handleImageDragOver(e, i)}
                onDragLeave={handleImageDragLeave}
                onDrop={(e) => handleImageDrop(e, i)}
                onDragEnd={handleImageDragEnd}
                className={`relative aspect-square rounded-xl overflow-hidden border group transition-all ${
                  draggedIndex === i
                    ? 'opacity-50 border-sand-200 cursor-grabbing'
                    : dropTarget === i
                    ? 'ring-2 ring-primary-500 border-sand-100 cursor-grab'
                    : 'border-sand-100 hover:border-primary-300 cursor-grab'
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                
                {i === coverIndex && (
                  <div className="absolute top-1 start-1 badge bg-primary-950 text-white text-[10px]">
                    {t('coverImage')}
                  </div>
                )}
                
                {/* Drag handle */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <GripVertical className="w-5 h-5 text-white drop-shadow" />
                </div>
                
                {/* Hover actions */}
                <div className="absolute inset-0 bg-primary-950/0 group-hover:bg-primary-950/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 pointer-events-auto">
                  {i !== coverIndex && (
                    <button
                      onClick={() => onCoverChange(i)}
                      type="button"
                      className="p-1.5 rounded-lg bg-white hover:bg-sand-100 text-primary-950 transition-colors"
                      title={t('setCoverPhoto')}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handlePhotoDelete(i)}
                    type="button"
                    className="p-1.5 rounded-lg bg-white hover:bg-red-100 text-red-600 transition-colors"
                    title={t('delete')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="text-center py-8 text-primary-400">
          <p className="text-sm">{t('noPhotosAdded')}</p>
        </div>
      )}
    </div>
  );
}
