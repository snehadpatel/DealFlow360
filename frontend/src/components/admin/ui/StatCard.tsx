import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  label: string;
  value: string;
  trend?: { value: string; up: boolean };
  icon?: ReactNode;
  dark?: boolean;
  accent?: boolean;
};

export default function StatCard({ label, value, trend, icon, dark, accent }: Props) {
  if (dark) {
    return (
      <div className="bg-[#161616] rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center justify-between">
          <p className="text-[#9CA3AF] text-[13px] font-medium">{label}</p>
          {icon && <span className="text-[#F26C4F]">{icon}</span>}
        </div>
        <div>
          <p className="text-white text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-1 ${trend.up ? "text-emerald-400" : "text-red-400"}`}>
              {trend.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span className="text-[12px] font-medium">{trend.value}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={`bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col justify-between min-h-[100px] ${accent ? "border-l-4 border-l-[#F26C4F]" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-[#6B7280] text-[13px] font-medium">{label}</p>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-[#FFF4F1] flex items-center justify-center text-[#F26C4F]">
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className="text-[#1F2937] text-[28px] font-bold leading-none mt-2">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-1.5 ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
            {trend.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span className="text-[12px] font-medium">{trend.value} vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
