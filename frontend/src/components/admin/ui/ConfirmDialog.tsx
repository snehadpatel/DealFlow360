import { AlertTriangle } from "lucide-react";

type Props = {
  open?: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open = true, title, message, confirmLabel = "Confirm", danger = true, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-black/40 backdrop-blur-[2px] w-full cursor-default" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-50" : "bg-amber-50"}`}>
          <AlertTriangle size={20} className={danger ? "text-[#EF4444]" : "text-[#F59E0B]"} />
        </div>
        <h2 className="text-[#1F2937] font-semibold text-base mb-1">{title}</h2>
        <p className="text-[#6B7280] text-sm">{message}</p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F4F5F7]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${danger ? "bg-[#EF4444] hover:bg-red-600" : "bg-[#F26C4F] hover:bg-[#E05A3E]"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
