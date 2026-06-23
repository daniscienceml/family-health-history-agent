import React from "react";
import { RiskScore, Language } from "../types";
import { ShieldAlert, Activity, CheckCircle, Sparkles, AlertTriangle, RefreshCw, Zap } from "lucide-react";

interface RiskViewProps {
  risks: RiskScore[];
  lang: Language;
  onRefresh: () => Promise<void>;
  isAnalyzing: boolean;
}

export default function RiskView({ risks, lang, onRefresh, isAnalyzing }: RiskViewProps) {
  const isUrdu = lang === "ur";

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
      case "high":
        return {
          text: "text-[#E05C5C]",
          bg: "bg-[#E05C5C]/10",
          border: "border-[#E05C5C]/20",
          bar: "bg-[#E05C5C]",
          shadow: "shadow-[0_2px_10px_rgba(224,92,92,0.15)]",
        };
      case "moderate":
        return {
          text: "text-[#C9A84C]",
          bg: "bg-[#C9A84C]/10",
          border: "border-[#C9A84C]/25",
          bar: "bg-[#C9A84C]",
          shadow: "shadow-[0_2px_10px_rgba(201,168,76,0.15)]",
        };
      default:
        return {
          text: "text-[#4CAF7D]",
          bg: "bg-[#4CAF7D]/10",
          border: "border-[#4CAF7D]/25",
          bar: "bg-[#4CAF7D]",
          shadow: "shadow-[0_2px_10px_rgba(76,175,125,0.15)]",
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6" id="risk-dashboard-view">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0A1628]/10 pb-5">
        <div>
          <h2 className="font-serif text-2xl text-[#0A1628] font-bold">
            {isUrdu ? "موروثی صحت کے خطرات کا ڈیش بورڈ" : "Hereditary Risk Assessment Map"}
          </h2>
          <p className="text-xs text-[#0A1628]/70 font-sans mt-1">
            {isUrdu ? "فیملی جینیٹک لائنز اور موروثی پیٹرن کی بنیاد پر آپ کا ذاتی تجزیہ" : "Personal risk analysis based on multi-generational family disease patterns."}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2.5 bg-[#0A1628] hover:bg-[#0A1628]/90 border border-[#0A1628]/10 text-white font-bold text-xs px-4 py-2.5 rounded-xl font-sans transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={13} className={isAnalyzing ? "animate-spin text-[#C9A84C]" : "text-[#C9A84C]"} />
          <span>{isAnalyzing ? (isUrdu ? "تجزیہ ہو رہا ہے..." : "Scanning Pedigree Tree...") : (isUrdu ? "دوبارہ تجزیہ کریں" : "Re-analyze Family DNA")}</span>
        </button>
      </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#0A1628]/5 rounded-3xl gap-4 shadow-sm">
          <div className="relative">
            <RefreshCw className="text-[#C9A84C] animate-spin" size={40} />
            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-600" size={16} />
          </div>
          <h3 className="font-serif text-[#0A1628] font-bold text-sm">
            {isUrdu ? "موروثی امراض کے پیٹرنز کا موازنہ ہو رہا ہے..." : "Coordinating Deep Genetic Agents..."}
          </h3>
          <p className="text-xs text-[#0A1628]/70 font-sans max-w-sm text-center leading-normal">
            {isUrdu ? "انٹیک، پیٹرن اور رسک ایجنٹس مل کر ڈیٹا بیس کلسٹرز کا موازنہ کر رہے ہیں۔" : "Pattern Detection and Risk Assessment Agents are grouping clinical clusters and calculating risk margins."}
          </p>
        </div>
      ) : risks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {risks.map((risk, index) => {
            const theme = getRiskColor(risk.level);
            return (
              <div
                key={index}
                className="bg-white border border-[#0A1628]/5 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all gap-5 shadow-sm text-[#0A1628]"
              >
                <div>
                  {/* Card head */}
                  <div className="flex items-center justify-between gap-3 border-b border-[#0A1628]/5 pb-3.5 mb-4">
                    <h3 className="font-serif text-[#0A1628] font-bold text-md leading-tight">
                      {risk.disease}
                    </h3>
                    <span
                      className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${theme.text} ${theme.bg} ${theme.border} ${theme.shadow}`}
                    >
                      {risk.level}
                    </span>
                  </div>

                  {/* Percentage bar meter */}
                  <div className="font-sans mb-4">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-[#0A1628]/60 font-medium">Hereditary Concentration Index</span>
                      <span className={`font-semibold ${theme.text}`}>{risk.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#0A1628]/5 rounded-full overflow-hidden border border-[#0A1628]/10">
                      <div
                        className={`h-full ${theme.bar} transition-all duration-700`}
                        style={{ width: `${risk.score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Clinical evidence text block */}
                  <div className="bg-[#F5F0E8] p-3 rounded-xl border border-[#0A1628]/5 flex items-start gap-2.5 mb-4 font-sans">
                    <AlertTriangle size={15} className={`${theme.text} shrink-0 mt-0.5`} />
                    <div className="text-[11px] leading-relaxed text-[#0A1628]/80">
                      <strong className="text-[#0A1628]/60">Biological Evidence:</strong> {risk.evidence}
                    </div>
                  </div>

                  {/* Prevention Guidelines checklist */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#A68633] uppercase tracking-wider font-sans border-l-2 border-[#C9A84C] pl-2 mb-2.5">
                      {isUrdu ? "حفاظتی تدابیر اور سکریننگ" : "Recommended Preventive Actions"}
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {risk.prevention.map((tip, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2 text-xs text-[#0A1628]/70 leading-normal font-sans">
                          <CheckCircle className="text-[#4CAF7D] shrink-0 mt-0.5" size={13} />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-[#0A1628]/5 rounded-3xl text-center gap-4 shadow-sm">
          <Activity className="text-[#0A1628]/30" size={40} />
          <h3 className="font-serif text-[#0A1628] font-bold text-sm">
            {isUrdu ? "کوئی امراض کے پیٹرنز کا موازنہ نہیں ہوا" : "Risk Index Empty"}
          </h3>
          <p className="text-xs text-[#0A1628]/70 font-sans max-w-sm mb-2 leading-relaxed">
            {isUrdu ? "براہ کرم فیملی انٹیک سیکشن میں فیملی کے ممبرز درج کریں یا دوبارہ تفتیش کے بٹن پر کلک کریں۔" : "Analyze your pedigree database to calculate risk concentrations and evidence logs."}
          </p>
          <button
            onClick={onRefresh}
            className="bg-[#C9A84C] text-[#0A1628] font-bold text-xs px-5 py-2.5 rounded-xl font-sans hover:bg-opacity-95 transition-all shadow-[0_4px_12px_rgba(201,168,76,0.15)]"
          >
            {isUrdu ? "فیملی ڈی این اے کا تجزیہ کریں" : "Analyze Family DNA Matrix"}
          </button>
        </div>
      )}

      {/* Clinician's reference footer guard notes */}
      <div className="bg-white border border-[#0A1628]/10 rounded-2xl p-4 flex items-start gap-3 mt-4 shadow-[0_4px_24px_rgba(10,22,40,0.02)]">
        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="font-sans text-[11px] leading-normal text-[#0A1628]/70">
          <strong>INFORMATIONAL ONLY Disclaimer:</strong> Risk concentrations indicate relative genetic concentration values based on biological reports and do not constitute clinical diagnostic conclusions. All findings should be printed and evaluated by a qualified doctor in a clinical consultation.
        </div>
      </div>
    </div>
  );
}
