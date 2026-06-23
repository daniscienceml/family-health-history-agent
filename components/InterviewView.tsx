import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, FamilyMember, Language } from "../types";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles, UserPlus, FileEdit, Trash2, HelpCircle } from "lucide-react";

interface InterviewViewProps {
  chatHistory: ChatMessage[];
  members: FamilyMember[];
  onSendMessage: (text: string) => Promise<void>;
  onCommitMember: (member: FamilyMember) => void;
  lang: Language;
  isSending: boolean;
  onClearChat: () => void;
}

export default function InterviewView({
  chatHistory,
  members,
  onSendMessage,
  onCommitMember,
  lang,
  isSending,
  onClearChat,
}: InterviewViewProps) {
  const [inputText, setInputText] = useState("");
  const [pendingMember, setPendingMember] = useState<Partial<FamilyMember> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUrdu = lang === "ur";

  // Automatically scroll to the bottom of the chat on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isSending]);

  // Keep track of the latest extracted member from chat history
  useEffect(() => {
    const latestAgentMsg = [...chatHistory]
      .reverse()
      .find((m) => m.sender === "agent" && m.extractedMember);
    if (latestAgentMsg?.extractedMember) {
      setPendingMember(latestAgentMsg.extractedMember);
    }
  }, [chatHistory]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const calculateCompleteness = () => {
    // Basic clinical coverage: Father, Mother, and at least 2 grandparents
    let score = 0;
    const relations = members.map((m) => m.relationship);
    if (relations.includes("Father")) score += 25;
    if (relations.includes("Mother")) score += 25;
    if (relations.includes("Paternal Grandfather") || relations.includes("Paternal Grandmother")) score += 25;
    if (relations.includes("Maternal Grandfather") || relations.includes("Maternal Grandmother")) score += 25;
    return score;
  };

  const handleApplyPending = () => {
    if (!pendingMember) return;
    // Build a fully-qualified family member object
    const finalMember: FamilyMember = {
      id: "mem_" + Date.now(),
      name: pendingMember.name || "Default Family Member",
      relationship: pendingMember.relationship || "Father",
      gender: pendingMember.gender || "Male",
      age: pendingMember.age || undefined,
      deceased: pendingMember.deceased ?? false,
      ageAtDeath: pendingMember.ageAtDeath || undefined,
      conditions: pendingMember.conditions || [],
      symptoms: pendingMember.symptoms || [],
      medications: pendingMember.medications || [],
      lifestyle: pendingMember.lifestyle || [],
    };
    onCommitMember(finalMember);
    setPendingMember(null);
  };

  const completeness = calculateCompleteness();

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[500px]" id="interview-view">
      
      {/* Dynamic Left Counter Sidebar */}
      <div className="w-full lg:w-[280px] shrink-0 bg-[#0A1628] border border-slate-800 rounded-2xl p-5 flex flex-col gap-6">
        <div>
          <h3 className="font-serif text-[#F5F0E8] font-bold text-sm tracking-wide uppercase border-b border-slate-900 pb-3 mb-4">
            {isUrdu ? "انٹیک انڈیکس" : "Intake Assessment Summary"}
          </h3>

          {/* Quick numbers widget */}
          <div className="grid grid-cols-2 gap-3 mb-5 text-center font-sans">
            <div className="bg-[#050D18] border border-slate-850 p-3 rounded-xl">
              <span className="text-2xl font-bold text-[#C9A84C]">{members.length}</span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {isUrdu ? "خاندان کے ممبرز" : "Members Logged"}
              </p>
            </div>
            <div className="bg-[#050D18] border border-slate-850 p-3 rounded-xl">
              <span className="text-2xl font-bold text-[#4CAF7D]">
                {members.flatMap((m) => m.conditions).length}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {isUrdu ? "طبی حالات" : "Conditions Extracted"}
              </p>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="font-sans mb-4">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-400">{isUrdu ? "مجموعی پیشرفت" : "Tree Completeness"}</span>
              <span className="text-[#C9A84C]">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-[#C9A84C] to-[#4CAF7D] h-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal mt-1 text-center">
              {isUrdu ? "مکمل کرنے کے لیے دونوں والدین اور دادا دادی/نانا نانی کو درج کریں۔" : "To maximize risk metrics, record at least Parents and Grandparents."}
            </p>
          </div>
        </div>

        {/* Suggestive Questions Box */}
        <div className="bg-[#050D18] border border-slate-850 p-4 rounded-xl flex flex-col gap-3 font-sans">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <HelpCircle size={14} className="text-[#C9A84C]" />
            <span>{isUrdu ? "نمونہ جملے" : "Try saying:"}</span>
          </div>
          <div className="flex flex-col gap-2 text-[11px] leading-relaxed text-slate-400">
            <button
              onClick={() => setInputText("Aba's name is Tariq. He passed at 64 from a cardiac event and had diabetes.")}
              className="text-left bg-[#0A1628] hover:bg-slate-900 p-2 rounded border border-slate-800/80 transition-colors"
            >
              "Aba Tariq passed at 64 from a heart attack & had diabetes."
            </button>
            <button
              onClick={() => setInputText("Meray nana Tariq was diabetic and got dizzy always. He passed away at 72.")}
              className="text-left bg-[#0A1628] hover:bg-slate-900 p-2 rounded border border-slate-800/80 transition-colors"
            >
              "Meray nana Naseer had sugar and passed away at 72."
            </button>
          </div>
        </div>

        {/* Condolences / Human warmth guidelines block */}
        <div className="mt-auto bg-[#C9A84C]/5 border border-[#C9A84C]/10 p-3.5 rounded-xl flex items-start gap-2.5 leading-normal">
          <Sparkles className="text-[#C9A84C] shrink-0 mt-0.5" size={15} />
          <p className="text-[10px] text-slate-400 font-sans">
            {isUrdu ? "ہماری ذہین آرکیسٹریٹر اردو اور انگریزی دونوں الفاظ کو سمجھ کر ڈیجیٹل ڈیش بورڈ بناتی ہے۔" : "Our Google Gemini Orchestrator processes mixed languages, automatically cataloging diseases like sugar as Type 2 Diabetes."}
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-[#050D18] border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden">
        {/* Chat Title bar */}
        <div className="bg-[#0A1628] border-b border-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C]">
              <MessageSquare size={16} />
            </div>
            <div>
              <h4 className="font-serif text-[#F5F0E8] font-bold text-sm">
                {isUrdu ? "فیملی ہیلتھ کونسلر ایجنٹ" : "Hereditary Family Intake Agent"}
              </h4>
              <p className="text-[10px] text-[#4CAF7D] font-mono uppercase tracking-wider">
                ● {isUrdu ? "ذہین کونسل جاری ہے" : "Orchestrator Session Active"}
              </p>
            </div>
          </div>
          <button
            onClick={onClearChat}
            className="text-slate-500 hover:text-rose-400 text-xs font-sans flex items-center gap-1.5 transition-colors"
            title="Reset Chat Session"
          >
            <Trash2 size={13} />
            <span>{isUrdu ? "دوبارہ شروع کریں" : "Reset Conversation"}</span>
          </button>
        </div>

        {/* Scrollable Conversation Bubbles */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {chatHistory.map((msg) => {
            const isAgent = msg.sender === "agent";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAgent ? "self-start" : "self-end flex-row-reverse"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border font-sans text-[11px] font-bold ${
                    isAgent
                      ? "bg-slate-900 border-[#C9A84C]/30 text-[#C9A84C]"
                      : "bg-[#C9A84C]/20 border-slate-700 text-[#F5F0E8]"
                  }`}
                >
                  {isAgent ? "A1" : "Me"}
                </div>

                <div className="flex flex-col gap-1">
                  {/* Bubble Container */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed font-sans ${
                      isAgent
                        ? "bg-[#0A1628] text-[#F5F0E8] border border-slate-850 rounded-tl-none"
                        : "bg-[#C9A84C] text-[#0A1628] font-semibold rounded-tr-none shadow-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono self-end mr-1 mt-0.5">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing / Query processing Spinner */}
          {isSending && (
            <div className="flex gap-3 self-start max-w-[80%] items-center text-xs text-slate-400 font-sans">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <span className="animate-pulse">A1</span>
              </div>
              <div className="bg-[#0A1628]/40 border border-slate-900 px-4 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-[11px] italic text-slate-400">
                  {isUrdu ? "انٹیک ایجنٹ معلومات کا جائزہ لے رہا ہے..." : "Intake Agent is analyzing family connections..."}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Real-Time Extraction Confirmation Drawer */}
        {pendingMember && (
          <div className="m-4 bg-slate-900/90 border border-[#C9A84C]/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in z-20 shadow-[0_4px_20px_rgba(201,168,76,0.1)]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/35 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <UserPlus size={15} />
              </div>
              <div>
                <span className="text-[#C9A84C] font-semibold text-xs uppercase tracking-wider font-sans block">
                  {isUrdu ? "فیملی ممبر کا پروفائل برآمد ہوا" : "Structured Profile Extracted"}
                </span>
                <span className="text-sm font-semibold text-[#F5F0E8] font-serif block">
                  {pendingMember.name} ({pendingMember.relationship})
                </span>
                <p className="text-[11px] text-slate-400 leading-normal mt-1 font-sans">
                  {isUrdu ? "پیچھے چلنے والے حالات:" : "Extracted conditions:"}{" "}
                  <span className="text-rose-300 font-semibold">{pendingMember.conditions?.join(", ") || "None"}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPendingMember(null)}
                className="bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors border border-slate-800"
              >
                {isUrdu ? "مسترد کریں" : "Discard"}
              </button>
              <button
                onClick={handleApplyPending}
                className="bg-[#C9A84C] hover:bg-opacity-95 text-[#0A1628] font-bold text-xs px-3 py-1.5 rounded-lg font-sans transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
              >
                <CheckCircle2 size={13} />
                <span>{isUrdu ? "درج کریں" : "Approve & Add to Tree"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Standard Input Form */}
        <form onSubmit={handleSend} className="bg-[#0A1628] border-t border-slate-900 p-4 flex gap-3 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder={
              isUrdu
                ? "یہاں لکھیں، مثال کے طور پر: 'میرے نانا احمد صاحب تھے، وہ شوگر کے مریض تھے اور 72 کی عمر میں انتقال کر گئے'"
                : "Type here... e.g. 'My nana naseer had sugar and passed away at 72.'"
            }
            className="flex-1 bg-[#050D18] text-[#F5F0E8] border border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-sans focus:outline-none focus:border-[#C9A84C] disabled:opacity-55"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-11 h-11 rounded-xl bg-[#C9A84C] text-[#0A1628] flex items-center justify-center hover:bg-opacity-90 active:scale-95 transition-all shrink-0 disabled:opacity-45"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
