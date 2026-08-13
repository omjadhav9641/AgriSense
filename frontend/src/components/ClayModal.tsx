import React from 'react';
import { X } from 'lucide-react';

interface ClayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ClayModal: React.FC<ClayModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="clay-card max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD3] mb-4">
          <h3 className="text-xl font-bold text-[#2B2E28]">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B6F63] hover:text-[#2B2E28] hover:bg-[#EAE6DF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
