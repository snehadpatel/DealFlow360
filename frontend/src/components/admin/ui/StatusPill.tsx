type Variant = "active" | "inactive" | "pending" | "suspended" | "approved" | "rejected" | "draft" | "healthy" | "warning" | "error";

const variants: Record<Variant, string> = {
  active: "bg-emerald-50 text-emerald-700",
  approved: "bg-emerald-50 text-emerald-700",
  healthy: "bg-emerald-50 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  draft: "bg-gray-100 text-gray-500",
  pending: "bg-amber-50 text-amber-700",
  warning: "bg-amber-50 text-amber-700",
  suspended: "bg-red-50 text-red-600",
  rejected: "bg-red-50 text-red-600",
  error: "bg-red-50 text-red-600",
};

type Props = {
  status: Variant | string;
  label?: string;
};

export default function StatusPill({ status, label }: Props) {
  const safeStatus = status || "active";
  const key = safeStatus.toLowerCase() as Variant;
  const cls = variants[key] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${cls}`}>
      {label ?? status}
    </span>
  );
}
