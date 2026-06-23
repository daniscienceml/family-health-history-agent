import React from "react";
import { Sparkles, ArrowRight, ShieldAlert, FileText, GitPullRequest, Globe } from "lucide-react";
import { ActiveTab, Language } from "../types";

interface HomeViewProps {
  onStart: (tab: ActiveTab) => void;
  lang: Language;
}

export default function HomeView({ onStart, lang }: HomeViewProps) {
  const isUrdu = lang === "ur";

  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center gap-12 py-8 px-4" id="home-view">
      {/* Intro Section */}
      <div className="text-center max-w-2xl flex flex-col gap-5">
        <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25 px-3 py-1.5 rounded-full text-xs font-sans uppercase font-semibold mx-auto tracking-wider animate-bounce">
          <Sparkles size={14} />
          <span>{isUrdu ? "گوگل الائنس کا خصوصی فیملی ایجنٹ" : "Google AI Agent Intensive Submission"}</span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl lg:text-5xl text-[#0A1628] font-bold tracking-tight leading-[1.15]">
          {isUrdu ? (
            <>
              اپنے خاندان کے موروثی <span className="text-[#C9A84C]">صحت کے ڈیٹا</span> کو محفوظ کریں
            </>
          ) : (
            <>
              Preserve Your Family's <span className="text-[#C9A84C]">Health Legacy</span> Across Generations
            </>
          )}
        </h1>

        <p className="font-sans text-sm md:text-base text-[#0A1628]/70 leading-relaxed font-medium">
          {isUrdu ? (
            "مختلف نسلوں کی موروثی صحت کو گفتگو کے ذریعے محفوظ بنائیں۔ ہمارا ڈیجیٹل سسٹم ذہین فیملی ہیلتھ گراف تیار کرتا ہے، موروثی خطرات کی جانچ کرتا ہے، اور ڈاکٹر کے لیے اردو اور انگریزی رپورٹ مہیا کرتا ہے۔"
          ) : (
            "Capture, structure, and analyze your multi-generational family health history through warm natural conversation. Build a living knowledge graph of your family's health DNA, detect hereditary risk patterns, and export professional reports."
          )}
        </p>

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() => onStart("interview")}
            className="group inline-flex items-center gap-2.5 bg-[#C9A84C] text-[#0A1628] font-sans font-bold text-sm px-6 py-3 rounded-full hover:bg-opacity-90 active:scale-95 transition-all shadow-[0_4px_20px_rgba(201,168,76,0.25)]"
          >
            <span>{isUrdu ? "بات چیت کا آغاز کریں" : "Start Your Family Health Story"}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Animated Clean Family Tree SVG Illustration */}
      <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-3xl border border-[#0A1628]/5 shadow-[0_8px_32px_rgba(10,22,40,0.06)] flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#C9A84C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <svg
          viewBox="0 0 500 320"
          className="w-full max-w-md h-auto select-none overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Trunk & Main Branches */}
          <path
            d="M 250 320 L 250 220 Q 250 170 190 140 Q 250 170 310 140 M 250 250 Q 250 190 140 170 M 250 250 Q 250 190 360 170"
            fill="none"
            className="stroke-[#C9A84C] stroke-[4] stroke-linecap-round"
            style={{ strokeDasharray: "1000", strokeDashoffset: "0" }}
          />

          {/* Sub connections */}
          <path
            d="M 190 140 Q 150 100 110 80 M 190 140 Q 220 100 240 80 M 310 140 Q 280 100 260 80 M 310 140 Q 350 100 390 80"
            fill="none"
            className="stroke-slate-300 stroke-[2] stroke-linecap-round stroke-dasharray-[5]"
          />

          {/* Animated Glow Nodes */}
          {/* Level 1: Grandparents (Top) */}
          <g transform="translate(110, 80)">
            <circle r="12" className="fill-white stroke-rose-500 stroke-[2.5]" />
            <circle r="6" className="fill-rose-500 animate-pulse" />
          </g>
          <g transform="translate(240, 80)">
            <circle r="12" className="fill-white stroke-emerald-500 stroke-[2.5]" />
            <circle r="6" className="fill-emerald-500" />
          </g>
          <g transform="translate(260, 80)">
            <circle r="12" className="fill-white stroke-[#C9A84C] stroke-[2.5]" />
            <circle r="6" className="fill-[#C9A84C]" />
          </g>
          <g transform="translate(390, 80)">
            <circle r="12" className="fill-white stroke-[#C9A84C] stroke-[2.5]" />
            <circle r="6" className="fill-[#C9A84C] animate-ping" style={{ animationDuration: "3s" }} />
          </g>

          {/* Level 2: Parents (Middle) */}
          <g transform="translate(140, 170)">
            <rect x="-18" y="-10" width="36" height="20" rx="4" className="fill-white stroke-rose-500 stroke-[2]" />
            <circle r="3" className="fill-rose-500 translate-y-[2px]" />
          </g>
          <g transform="translate(360, 170)">
            <rect x="-18" y="-10" width="36" height="20" rx="4" className="fill-white stroke-emerald-500 stroke-[2]" />
            <circle r="3" className="fill-emerald-500 translate-y-[2px]" />
          </g>

          {/* Level 3: Self (Center Root) */}
          <g transform="translate(250, 225)">
            <circle r="18" className="fill-white stroke-[#C9A84C] stroke-[3]" />
            <path d="M-6-2 L0-8 L6-2 L3 4 L-3 4 Z" fill="#C9A84C" />
          </g>

          {/* Floating UI DNA helix particles */}
          <path
            d="M 120 280 Q 150 260 180 280 T 240 280"
            fill="none"
            className="stroke-[#C9A84C]/25 stroke-[1] stroke-dasharray-[3]"
          />
          <path
            d="M 120 260 Q 150 280 180 260 T 240 260"
            fill="none"
            className="stroke-cyan-500/25 stroke-[1] stroke-dasharray-[3]"
          />
          <line x1="150" y1="270" x2="150" y2="270" className="stroke-slate-300 stroke-[2]" />
        </svg>
      </div>

      {/* Agents Spotlight Cards Row */}
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
        {/* Agent 1 */}
        <div className="bg-white border border-[#0A1628]/5 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-[#C9A84C]/40 transition-all">
          <div className="w-9 h-9 rounded-xl bg-[#0A1628]/5 flex items-center justify-center text-cyan-700 border border-[#0A1628]/10">
            <GitPullRequest size={16} />
          </div>
          <h3 className="text-sm font-bold text-[#0A1628] font-serif border-b border-[#0A1628]/5 pb-2">
            {isUrdu ? "انٹیک ایجنٹ" : "1. Intake Agent"}
          </h3>
          <p className="text-xs text-[#0A1628]/70 leading-relaxed">
            {isUrdu ? (
              "خاندان کی تفصیلات کو ایک ایک کر کے دوستانہ انداز میں جمع کرتا ہے۔ آپ قدرتی اردو یا مخلوط زبان استعمال کر سکتے ہیں۔"
            ) : (
              "Conducts a warm, step-by-step interview. Processes English, Urdu, and Hinglish inputs, extracting clinical indicators automatically."
            )}
          </p>
        </div>

        {/* Agent 2 */}
        <div className="bg-white border border-[#0A1628]/5 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-[#C9A84C]/40 transition-all">
          <div className="w-9 h-9 rounded-xl bg-[#0A1628]/5 flex items-center justify-center text-emerald-700 border border-[#0A1628]/10">
            <Globe size={16} />
          </div>
          <h3 className="text-sm font-bold text-[#0A1628] font-serif border-b border-[#0A1628]/5 pb-2">
            {isUrdu ? "پیٹرن ایجنٹ" : "2. Pattern Agent"}
          </h3>
          <p className="text-xs text-[#0A1628]/70 leading-relaxed">
            {isUrdu ? (
              "حاصل کردہ ریکارڈز کا موازنہ کر کے موروثی امراض اور خاندانی رجحانات کی سائنسی فہرست تیار کرتا ہے۔"
            ) : (
              "Scans family records, detects hereditary clusters (like Diabetes/Heart conditions) across maternal and paternal lines."
            )}
          </p>
        </div>

        {/* Agent 3 */}
        <div className="bg-white border border-[#0A1628]/5 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-[#C9A84C]/40 transition-all">
          <div className="w-9 h-9 rounded-xl bg-[#0A1628]/5 flex items-center justify-center text-[#C9A84C] border border-[#0A1628]/10">
            <ShieldAlert size={16} />
          </div>
          <h3 className="text-sm font-bold text-[#0A1628] font-serif border-b border-[#0A1628]/5 pb-2">
            {isUrdu ? "ملٹی رسک ایجنٹ" : "3. Risk Agent"}
          </h3>
          <p className="text-xs text-[#0A1628]/70 leading-relaxed">
            {isUrdu ? (
              "خاندانی سائنسی ثبوت کی بنیاد پر آپ کا خطرے کا اسکور (Risk Matrix) مرتب کرتا ہے اور حفاظتی تدابیر بتاتا ہے۔"
            ) : (
              "Provides personalized risk scores (0-100) and evidence maps based on family history without making direct diagnoses."
            )}
          </p>
        </div>

        {/* Agent 4 */}
        <div className="bg-white border border-[#0A1628]/5 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-[#C9A84C]/40 transition-all">
          <div className="w-9 h-9 rounded-xl bg-[#0A1628]/5 flex items-center justify-center text-rose-600 border border-[#0A1628]/10">
            <FileText size={16} />
          </div>
          <h3 className="text-sm font-bold text-[#0A1628] font-serif border-b border-[#0A1628]/5 pb-2">
            {isUrdu ? "کلینیکل رپورٹ ایجنٹ" : "4. Clinical Report"}
          </h3>
          <p className="text-xs text-[#0A1628]/70 leading-relaxed">
            {isUrdu ? (
              "طبی معائنے کے لیے تفصیلی کلینیکل رپورٹ اور فیملی کے لیے سادہ اردو خلاصہ تیار کرتا ہے۔"
            ) : (
              "Compiles doctor-ready printable PDF/html documents with clinical annotations, plus clean Urdu messages for WhatsApp."
            )}
          </p>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="w-full text-center border-t border-[#0A1628]/10 pt-6 mt-4">
        <p className="text-[10px] text-[#0A1628]/60 leading-relaxed font-sans max-w-xl mx-auto italic">
          ⚠️ **{isUrdu ? "طبی ڈس کلیمر" : "PHYSICIAN DISCLAIMER"}:** {isUrdu ? (
            "یہ فیملی ہیلتھ ایجنٹ صرف تعلیمی معلومات اور صحت کے موروثی رجحانات کی آگاہی کے لیے ہے۔ یہ کسی طبی معائنے، تشخیص یا علاج کا متبادل نہیں ہے۔ ہم کوئی حتمی تشخیص نہیں کرتے۔"
          ) : (
            "The Family Health History Agent is an educational risk-awareness tool and does not provide clinical diagnoses, medical prescription, or therapeutic plans. Always consult with a licensed primary care provider for clinical diagnosis."
          )}
        </p>
      </div>
    </div>
  );
}
