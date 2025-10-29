import React from 'react';

interface PhotoRecord {
  id: string;
  filename: string;
  path: string;
  pictureContent: string;
  pictureContentHTML: string;
  yourResponse: string;
  twinID: string;
  pictureURL: string;
}

interface PhotoGalleryProps {
  photoGallery: PhotoRecord[];
  onPhotoClick: (photo: PhotoRecord) => void;
  onDeletePhoto: (photo: PhotoRecord) => void;
}

const PhotoGalleryWithDelete: React.FC<PhotoGalleryProps> = ({ 
  photoGallery, 
  onPhotoClick, 
  onDeletePhoto 
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {photoGallery.map((photo, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 relative group"
        >
          {/* Botón de eliminar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeletePhoto(photo);
            }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            title="Eliminar foto"
          >
            ×
          </button>
          
          {/* Área clickeable para abrir modal */}
          <div 
            className="cursor-pointer"
            onClick={() => onPhotoClick(photo)}
          >
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center h-32 sm:h-36 md:h-40 p-2">
              <img 
                src={photo.pictureURL} 
                alt={photo.filename}
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.nextElementSibling as HTMLDivElement;
                  if (placeholder) {
                    placeholder.classList.remove('hidden');
                    placeholder.classList.add('flex');
                  }
                }}
              />
              <div className="hidden w-full h-full items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-3xl mb-2">🖼️</div>
                  <div className="text-xs font-medium">Imagen no disponible</div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-b from-white to-gray-50">
              <div className="font-semibold text-xs text-gray-800 truncate mb-1 text-center" title={photo.filename}>
                {photo.filename}
              </div>
              {photo.yourResponse && (
                <div className="text-xs text-gray-600 overflow-hidden leading-tight" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }} title={photo.yourResponse}>
                  {photo.yourResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {photoGallery.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📷</div>
          <div className="text-lg font-semibold mb-2">¡Tus recuerdos te esperan!</div>
          <div className="text-sm text-gray-400">Haz una consulta para explorar tus fotos familiares</div>
        </div>
      )}
    </div>
  );
};

export default PhotoGalleryWithDelete;