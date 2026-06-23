import React from "react";
import { Language, DiseasePattern, RiskScore, UserProfile } from "../types";
import { FileText, Printer, Share2, Globe, Sparkles, CheckCircle, Shield, PhoneCall } from "lucide-react";

interface ReportViewProps {
  patterns: DiseasePattern[];
  risks: RiskScore[];
  userProfile: UserProfile;
  doctorMarkdown: string;
  urduSummary: string;
  lang: Language;
  onRefresh: () => void;
  isGenerating: boolean;
}

export default function ReportView({
  patterns,
  risks,
  userProfile,
  doctorMarkdown,
  urduSummary,
  lang,
  onRefresh,
  isGenerating,
}: ReportViewProps) {
  const isUrdu = lang === "ur";
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn("Print action not allowed or failed in sandbox environment", e);
    }
  };

  const handleShareWhatsApp = () => {
    try {
      const textToShare = urduSummary || `My Family Health Report:\n${risks.map(r => `- ${r.disease}: ${r.level} Risk`).join('\n')}`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
      const newWindow = window.open(url, "_blank");
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        // Fallback or warning if popup blocker active
        console.warn("Popup blocked while opening WhatsApp link.");
      }
    } catch (e) {
      console.warn("Failed to open WhatsApp share dialog:", e);
    }
  };

  const handleCopyUrdu = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urduSummary);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      } else {
        // Fallback for sandboxed frames lacking secure clipboard permissions
        const textArea = document.createElement("textarea");
        textArea.value = urduSummary;
        textArea.style.position = "fixed"; // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      }
    } catch (e) {
      console.warn("Failed to copy to clipboard", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6" id="report-view-container">
      
      {/* Action Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0A1628]/10 pb-5 no-print">
        <div>
          <h2 className="font-serif text-2xl text-[#0A1628] font-bold">
            {isUrdu ? "طبی برآمدگی ایجنٹ اور رپورٹس" : "Doctor-Ready Export Reports"}
          </h2>
          <p className="text-xs text-[#0A1628]/70 font-sans mt-1">
            {isUrdu ? "ڈاکٹر کے معائنے کے لیے تفصیلی کلینیکل رپورٹ اور فیملی ممبرز کے لیے فیملی اسکور کارڈ" : "Preview clinical-grade medical genograms, print PDFs, or share simple Urdu explanations via WhatsApp."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] font-sans font-bold text-xs px-4 py-2.5 rounded-xl transition-all hover:bg-opacity-95 active:scale-95"
          >
            <Printer size={13} />
            <span>{isUrdu ? "رپورٹ پرنٹ کریں / PDF" : "Print / Save PDF"}</span>
          </button>
          
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-xl transition-all hover:bg-emerald-500 active:scale-95"
          >
            <Share2 size={13} />
            <span>{isUrdu ? "واٹس ایپ شیئر" : "Share on WhatsApp"}</span>
          </button>
        </div>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#0A1628]/5 rounded-3xl gap-4 no-print shadow-sm">
          <FileText className="text-[#C9A84C] animate-spin" size={36} />
          <h3 className="font-serif text-[#0A1628] font-semibold text-sm">
            {isUrdu ? "طبی رپورٹ مرتب ہو رہی ہے..." : "Report Agent compiling clinical summaries..."}
          </h3>
          <p className="text-xs text-[#0A1628]/70 font-sans">
            {isUrdu ? "انٹیک کلسٹرز اور موروثی خطرات کی رپورٹ لکھی جا رہی ہے..." : "Formatting pedigree charts and translation summaries..."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left / Primary Area: Clinical Document Preview */}
          <div className="lg:col-span-2 flex flex-col gap-6 printable-region">
            <div className="bg-[#FFFFFF] text-slate-905 p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col gap-6 font-sans select-text relative">
              {/* Doctor Header card with high-fidelity clinical style */}
              <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-350 pb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-950 text-[#C9A84C] flex items-center justify-center font-bold text-sm shrink-0 rounded-lg no-print">
                    🧬
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 tracking-tight leading-tight uppercase">
                      Family Health Genogram Report
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase font-mono mt-0.5">
                      GENETIC PEDIGREE ANALYSIS & DIABETES TRACKER
                    </p>
                  </div>
                </div>
                
                {/* Clinical Metadata */}
                <div className="text-[9px] font-mono text-slate-500 border border-slate-200 bg-slate-50/50 p-2.5 rounded-md leading-normal">
                  <div>DATE: {new Date().toLocaleDateString()}</div>
                  <div className="text-slate-900 font-bold">PROVIDER: Muhammad Danyal</div>
                  <div>REF LINK: share.streamlit.io/danyal/family-history</div>
                </div>
              </div>

              {/* Patient Demographics Matrix Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5 uppercase tracking-wide">
                  I. Patient Clinical Profile
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-slate-500 block text-[10px] pb-0.5 uppercase tracking-wider">Age</span>
                    <strong className="text-slate-800 font-semibold">{userProfile.age || "35"} Yr</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-slate-500 block text-[10px] pb-0.5 uppercase tracking-wider">Gender</span>
                    <strong className="text-slate-800 font-semibold">{userProfile.gender || "Male"}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-slate-500 block text-[10px] pb-0.5 uppercase tracking-wider">User Diagnoses</span>
                    <strong className="text-slate-800 font-semibold">
                      {userProfile.conditions?.join(", ") || "None Recorded"}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-slate-500 block text-[10px] pb-0.5 uppercase tracking-wider">Lifestyle Factors</span>
                    <strong className="text-slate-800 font-semibold">
                      {userProfile.lifestyle?.join(", ") || "Active"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Genetic Disease Clusters Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5 uppercase tracking-wide">
                  II. Pedigree Disease Clusters (Hereditary Load)
                </h4>
                {patterns.length > 0 ? (
                  <div className="flex flex-col gap-2 text-xs">
                    {patterns.map((p, idx) => (
                      <div key={idx} className="bg-slate-50/80 p-3 rounded border border-slate-100 leading-relaxed">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{p.disease} Cluster (Size: {p.clusterSize})</span>
                          <span className="text-xs text-rose-600 font-semibold uppercase">{p.inheritanceWeight}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-1">
                          <strong>Affected Lineage:</strong> {p.affectedMembers?.join(", ")}
                        </p>
                        <p className="text-slate-600 font-medium text-[11px] mt-1">
                          <strong>Generational Recurrence Trend:</strong> {p.generationalTrend}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">No logical disease clusters matched on the family tree database.</p>
                )}
              </div>

              {/* Hereditary Risk Assessment Profile */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5 uppercase tracking-wide">
                  III. Genetic Predisposition & Proactive Preventatives
                </h4>
                {risks.length > 0 ? (
                  <div className="flex flex-col gap-4 text-xs">
                    {risks.map((r, idx) => (
                      <div key={idx} className="border-l-4 border-rose-500 pl-3 py-1 bg-slate-50/50 rounded-r">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{r.disease} Map</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                            r.level.toLowerCase() === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {r.level} Risk
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                          <strong>Clinical Logic:</strong> {r.evidence}
                        </p>
                        <div className="mt-2 text-[11px]">
                          <span className="font-bold text-slate-800">Proactive Recommendations:</span>
                          <ul className="list-disc list-inside text-slate-500 flex flex-col gap-1 mt-1 pl-1">
                            {r.prevention.map((tip, tIdx) => (
                              <li key={tIdx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">Scan family data to structure genetic predisposition rankings.</p>
                )}
              </div>

              {/* Physician annotations / sign block */}
              <div className="border-t border-slate-300 pt-8 mt-4 font-sans text-xs">
                <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-4">
                  IV. Clinical Assessor Annotation & Review Board
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 leading-relaxed text-slate-400">
                  <div className="border-b border-slate-350 pb-8 italic">
                     Physician Diagnostic Annotation:
                  </div>
                  <div className="border-b border-slate-350 pb-8 italic">
                     Prescribed Screenings / Testing:
                  </div>
                </div>

                <div className="flex justify-between items-center mt-10">
                  <div className="text-[10px] font-mono text-slate-400">
                    REPORT PROTOCOL: FHHA-GEN-2026
                  </div>
                  <div className="text-right border-t border-slate-900 w-[160px] pt-1 text-[11px] text-slate-800 font-semibold uppercase tracking-wider">
                    Assessing Doctor Stamp
                  </div>
                </div>
              </div>

              {/* Waterproof medical disclaimer */}
              <div className="text-[9px] text-slate-400 border-t border-slate-200 pt-4 leading-normal mt-2 select-none">
                <strong>Clinician's Alert:</strong> This report acts purely as a genetic lineage mapping resource generated through a client-authorized history intake session. It constitutes a support indicator file and is strictly designed to aid professional clinical inspections, rather than finalize clinical prescriptions or therapies.
              </div>
            </div>
          </div>

          {/* Right Area: Client / Urdu sharing card */}
          <div className="bg-white border border-[#0A1628]/5 rounded-2xl p-6 h-fit text-left flex flex-col gap-5 no-print shadow-sm text-[#0A1628]">
            <div className="flex items-center gap-2 border-b border-[#0A1628]/5 pb-3 mb-1">
              <Globe className="text-[#C9A84C]" size={16} />
              <h3 className="font-serif text-[#0A1628] font-bold text-sm">
                {isUrdu ? "فیملی فارورڈ خلاصہ (اردو)" : "Urdu Family Sharing summary"}
              </h3>
            </div>

            <div
              dir="rtl"
              className="bg-[#F5F0E8] pr-4 pl-2 py-4 rounded-xl border border-[#0A1628]/5 text-xs text-right text-[#0A1628] whitespace-pre-wrap font-sans leading-relaxed font-medium"
            >
              {urduSummary || "فیملی کے ممبرز درج کر کے اور تجزیہ کرنے کے بعد آپ کا موروثی خلاصہ یہاں فراہم کیا جائے گا۔"}
            </div>

            <div className="flex flex-col gap-2 mt-2 font-sans">
              <button
                onClick={handleCopyUrdu}
                className={`w-full font-bold text-xs py-2 px-4 rounded-xl border transition-all duration-200 ${
                  copySuccess
                    ? "bg-emerald-50 border-emerald-500/30 text-emerald-600"
                    : "bg-white hover:bg-[#F5F0E8] text-[#A68633] border-[#C9A84C]/30"
                }`}
              >
                {copySuccess
                  ? (isUrdu ? "خلاصہ کاپی ہو گیا ہے!" : "✓ Copied to clipboard!")
                  : (isUrdu ? "خلاصہ کاپی کریں" : "Copy Urdu Summary")}
              </button>
              
              <button
                onClick={handleShareWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl border border-[#0A1628]/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <PhoneCall size={12} />
                <span>{isUrdu ? "فیملی کو واٹس ایپ بھیجیں" : "Send WhatsApp Forward"}</span>
              </button>
            </div>

            <div className="bg-[#F5F0E8]/50 p-3.5 rounded-xl border border-dashed border-[#0A1628]/15 flex items-start gap-2.5">
              <Sparkles className="text-[#C9A84C] shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] text-[#0A1628]/60 leading-normal font-sans">
                {isUrdu ? "اردو کا خلاصہ واٹس ایپ پر خاندان کے ساتھ آسانی سے کلاسک شیئرنگ کے لیے ڈیزائن کیا گیا ہے۔" : "The Urdu report format summarizes multi-generational hereditary risks in colloquial, compassionate language for parental sharing."}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
