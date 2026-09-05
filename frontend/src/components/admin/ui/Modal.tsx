import { X } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  open?: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  size?: "sm" | "md" | "lg";
};

export default function Modal({ open = true, onClose, title, description, children, onSave, saveLabel = "Save", size = "md" }: Props) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl p-6 w-full ${widths[size]} shadow-xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[#1F2937] font-semibold text-base">{title}</h2>
            {description && <p className="text-[#6B7280] text-sm mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] ml-4 flex-shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
        {onSave && (
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F4F5F7] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 text-sm font-medium text-white bg-[#F26C4F] rounded-lg hover:bg-[#E05A3E] transition-colors"
            >
              {saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
