import { X, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: string; // e.g., 'bg-red-600' or 'bg-purple-600'
  icon?: React.ReactNode;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmColor = 'bg-red-600',
  icon = <HelpCircle className="w-5 h-5 text-gray-400" />,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
              {icon}
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 mb-6">
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold py-2.5 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 ${confirmColor} hover:brightness-110 shadow-lg text-white text-sm font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
