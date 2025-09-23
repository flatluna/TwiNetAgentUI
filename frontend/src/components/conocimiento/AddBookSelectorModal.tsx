import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Book } from '../../types/conocimiento';
import { AddBookManualModal } from './AddBookManualModal';
import { AddBookAIModal } from './AddBookAIModal';

interface AddBookSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (book: Book) => void;
}

export const AddBookSelectorModal: React.FC<AddBookSelectorModalProps> = ({
  isOpen,
  onClose,
  onBookAdded,
}) => {
  const [showManualModal, setShowManualModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const handleMethodSelect = (method: 'manual' | 'ai') => {
    onClose(); // Cerrar el selector

    // Abrir el modal correspondiente
    if (method === 'manual') {
      setShowManualModal(true);
    } else {
      setShowAIModal(true);
    }
  };

  const handleBookAdded = (book: Book) => {
    onBookAdded(book);
    // Cerrar todos los modales
    setShowManualModal(false);
    setShowAIModal(false);
  };

  const handleModalClose = () => {
    setShowManualModal(false);
    setShowAIModal(false);
  };

  return (
    <>
      {/* Modal Selector */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📚 Agregar Nuevo Libro
            </DialogTitle>
            <DialogDescription>
              Selecciona cómo quieres agregar el libro a tu biblioteca
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {/* Opción Manual */}
            <div
              onClick={() => handleMethodSelect('manual')}
              className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">✍️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Manual
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Completa todos los campos del libro paso a paso. Tienes control total sobre toda la información.
                  </p>
                  <div className="flex items-center text-xs text-blue-600">
                    <span>✓ Control completo</span>
                    <span className="mx-2">•</span>
                    <span>✓ Información precisa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Opción IA */}
            <div
              onClick={() => handleMethodSelect('ai')}
              className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Con Inteligencia Artificial
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Solo proporciona el nombre del libro y nuestra IA completará automáticamente toda la información.
                  </p>
                  <div className="flex items-center text-xs text-green-600">
                    <span>✓ Súper rápido</span>
                    <span className="mx-2">•</span>
                    <span>✓ Información automática</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Manual */}
      <AddBookManualModal
        isOpen={showManualModal}
        onClose={handleModalClose}
        onBookAdded={handleBookAdded}
      />

      {/* Modal AI */}
      <AddBookAIModal
        isOpen={showAIModal}
        onClose={handleModalClose}
        onBookAdded={handleBookAdded}
      />
    </>
  );
};