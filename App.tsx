import React, { useState, useEffect } from "react";
import { ActiveTab, Language, FamilyMember, ChatMessage, DiseasePattern, RiskScore, UserProfile } from "./types";
import HomeView from "./components/HomeView";
import InterviewView from "./components/InterviewView";
import NetworkGraph from "./components/NetworkGraph";
import RiskView from "./components/RiskView";
import ReportView from "./components/ReportView";
import SettingsView from "./components/SettingsView";
import {
  Heart,
  MessageSquare,
  Network,
  ShieldAlert,
  FileText,
  Settings,
  Menu,
  X,
  Sparkles,
  Award,
  ExternalLink,
  Trash2,
  Lock,
  RefreshCw,
} from "lucide-react";

// Asset Import for App Logo
const logoFile = "/src/assets/images/app_logo_1782214777058.jpg";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [lang, setLang] = useState<Language>("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Synced Datastores
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 38,
    gender: "Male",
    conditions: ["Pre-diabetes"],
    lifestyle: ["Sedentary", "High Stress"],
  });
  const [members, setMembers] = useState<FamilyMember[]>([]);

  // AI Agent States
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [patterns, setPatterns] = useState<DiseasePattern[]>([]);
  const [risks, setRisks] = useState<RiskScore[]>([]);
  const [doctorMarkdown, setDoctorMarkdown] = useState("");
  const [urduSummary, setUrduSummary] = useState("");

  // Loading flags
  const [isSending, setIsSending] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize and Seed Stores
  useEffect(() => {
    // 1. Fetch persistent database records from server
    fetch("/api/family")
      .then((res) => res.json())
      .then((data) => {
        if (data.userProfile) setUserProfile(data.userProfile);
        if (data.members) {
          setMembers(data.members);
          // Auto-trigger pattern scoring immediately on load
          triggerAnalysis(data.userProfile, data.members);
        }
      })
      .catch((err) => console.error("Error reading database:", err));

    // 2. Initialize chat logs with welcoming prompt
    const welcomeText =
      lang === "ur"
        ? "اسلام علیکم! میں آپ کا فیملی ہیلتھ کونسلر کانٹیکسٹ ایجنٹ ہوں۔ آئیے مل کر آپ کے خاندان کی صحت کا گراف تیار کریں۔ پہلے اپنے والد محترم کے بارے میں بتائیں — ان کا نام کیا ہے اور کیا وہ حیات ہیں؟"
        : "Assalam-o-Alaikum! I am your multi-agent intake counselor. Let's record your family's health genetics. Tell me about your father — what is his name, and is he still with us?";

    setChatHistory([
      {
        id: "init_greet",
        sender: "agent",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        activeAgent: "Intake Agent",
      },
    ]);
  }, []);

  // Update dynamic translations when language flips
  useEffect(() => {
    if (chatHistory.length === 1 && chatHistory[0].id === "init_greet") {
      const text =
        lang === "ur"
          ? "اسلام علیکم! میں آپ کا فیملی ہیلتھ کونسلر کانٹیکسٹ ایجنٹ ہوں۔ آئیے مل کر آپ کے خاندان کی صحت کا گراف تیار کریں۔ پہلے اپنے والد محترم کے بارے میں بتائیں — ان کا نام کیا ہے اور کیا وہ حیات ہیں؟"
          : "Assalam-o-Alaikum! I am your multi-agent intake counselor. Let's record your family's health genetics. Tell me about your father — what is his name, and is he still with us?";
      setChatHistory([
        {
          id: "init_greet",
          sender: "agent",
          text: text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          activeAgent: "Intake Agent",
        },
      ]);
    }
  }, [lang]);

  // Sync state modifications out to Express json storage
  const syncWithServer = (profile: UserProfile, newList: FamilyMember[]) => {
    fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userProfile: profile, members: newList }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Re-evaluate risk analytics models dynamically on modifications
          triggerAnalysis(profile, newList);
        }
      })
      .catch((e) => console.error("Database sync error:", e));
  };

  // Run Agent 2 (Patterns) & Agent 3 (Risk scoring) models
  const triggerAnalysis = async (profile: UserProfile, list: FamilyMember[]) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/agents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile: profile, members: list }),
      });
      const data = await res.json();
      if (data.patterns) setPatterns(data.patterns);
      if (data.riskScores) {
        setRisks(data.riskScores);
        // Call Report compiling Agent (Agent 4) immediately for real-time document sync
        triggerReport(data.patterns, data.riskScores, profile);
      }
    } catch (err) {
      console.error("Pattern calculations failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run Agent 4 (Clinical Markdown and Urdu summary generators)
  const triggerReport = async (pList: DiseasePattern[], rList: RiskScore[], profile: UserProfile) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/agents/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patterns: pList, riskScores: rList, userProfile: profile }),
      });
      const data = await res.json();
      if (data.doctorSummaryMarkdown) setDoctorMarkdown(data.doctorSummaryMarkdown);
      if (data.urduSummary) setUrduSummary(data.urduSummary);
    } catch (e) {
      console.error("Report compiler failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Agent 1 conversation message dispatcher
  const handleSendChatMessage = async (userInput: string) => {
    if (!userInput.trim() || isSending) return;

    // Create immediate user message element
    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      sender: "user",
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsSending(true);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          chatHistory: updatedHistory,
          members: members,
        }),
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: "agt_" + Date.now(),
        sender: "agent",
        text: data.responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        activeAgent: data.activeAgent,
        extractedMember: data.extractedMember,
      };

      setChatHistory((curr) => [...curr, agentMsg]);
    } catch (e) {
      console.error("Conversation agent communication crash:", e);
      setChatHistory((curr) => [
        ...curr,
        {
          id: "err_" + Date.now(),
          sender: "agent",
          text: "I encountered a processing blip. Please check your developer key and submit again.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Direct actions triggers (Settings adding / Dialog confirmations)
  const handleCommitMember = (newMember: FamilyMember) => {
    const updated = [...members, newMember];
    setMembers(updated);
    syncWithServer(userProfile, updated);
  };

  const handleDeleteMember = (id: string) => {
    const filtered = members.filter((m) => m.id !== id);
    setMembers(filtered);
    syncWithServer(userProfile, filtered);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    syncWithServer(newProfile, members);
  };

  const handleImportBackupObj = (rawText: string) => {
    try {
      const parsed = JSON.parse(rawText);
      if (parsed.userProfile && Array.isArray(parsed.members)) {
        setUserProfile(parsed.userProfile);
        setMembers(parsed.members);
        syncWithServer(parsed.userProfile, parsed.members);
        return true;
      }
    } catch (e) {
      console.error("Backup JSON parsing failed:", e);
    }
    return false;
  };

  const handleNukeDB = () => {
    fetch("/api/family/clear", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setMembers([]);
        setUserProfile({ age: 30, gender: "Male", conditions: [], lifestyle: [] });
        setPatterns([]);
        setRisks([]);
        setDoctorMarkdown("");
        setUrduSummary("");
      })
      .catch((e) => console.error("Database nuke failed:", e));
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col text-[#F5F0E8] font-sans antialiased overflow-x-hidden selection:bg-[#C9A84C]/30 selection:text-[#F5F0E8]" id="root-shell">
      
      {/* 1. TOP PREMIUM HEADER WITH SIGNATURE BADGE AND STREAMLIT REF */}
      <header className="no-print bg-[#0A1628] border-b border-[#C9A84C]/25 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 backdrop-blur shadow-md">
        
        {/* Logo and Application Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-slate-400 hover:text-[#C9A84C] transition-colors"
          >
            <Menu size={22} />
          </button>
          
          <img
            src={logoFile}
            alt="Family Health History Agent Logo"
            className="w-10 h-10 rounded-xl cursor-pointer hover:rotate-6 transition-all border border-[#C9A84C]/45 shadow-[0_0_12px_rgba(201,168,76,0.35)]"
            referrerPolicy="no-referrer"
          />

          <div className="flex flex-col">
            <h1 className="font-serif text-sm md:text-md uppercase font-black tracking-wider text-[#F5F0E8] leading-tight select-none">
              Family Health <span className="text-[#C9A84C]">History Agent</span>
            </h1>
            <span className="text-[9px] font-mono text-[#4CAF7D] uppercase tracking-widest hidden md:inline leading-normal">
              MULTI-AGENT INTELLIGENT SYSTEM
            </span>
          </div>
        </div>

        {/* PROMINENT USER SIGNATURE ACCORDING TO USER DIRECTIVES */}
        <div className="flex items-center gap-4 text-xs md:text-xs">
          {/* Muhammad Danyal Custom Prestige Card */}
          <div className="flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(201,168,76,0.1)] hover:border-[#C9A84C]/60 transition-colors">
            <Award size={13} className="text-[#C9A84C] shrink-0" />
            <span className="font-serif font-bold text-slate-300">
              Muhammad Danyal
            </span>
          </div>

          {/* Quick Streamlit Short link badge */}
          <a
            href="https://share.streamlit.io/danyal/family-health-history"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1 text-[10px] bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-400 font-mono tracking-tighter hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-all select-all hover:bg-slate-950 shadow-[0_3px_6px_rgba(0,0,0,0.5)]"
          >
            <span>share.streamlit.io/danyal/family-history</span>
            <ExternalLink size={10} className="shrink-0 text-slate-500" />
          </a>
        </div>

      </header>

      {/* 2. LOWER CONTAINER SHELL - LEFT NAVIGATION SIDEBAR / RIGHT TAB CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside
          className={`no-print w-[240px] shrink-0 bg-[#0A1628] border-r border-[#C9A84C]/15 p-4 flex flex-col justify-between fixed md:static inset-y-0 left-0 z-40 transform md:transform-none transition-transform duration-300 text-sm ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Navigation Links Grid */}
          <div className="flex flex-col gap-1.5 font-sans">
            {/* Mobile Sidebar Close */}
            <div className="flex md:hidden justify-end mb-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <button
              onClick={() => {
                setActiveTab("home");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold ${
                activeTab === "home"
                  ? "bg-[#C9A84C] text-[#0A1628] shadow-[0_4px_12px_rgba(201,168,76,0.2)]"
                  : "text-[#F5F0E8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Heart size={16} />
              <span>{lang === "ur" ? "ہوم پیج" : "Home Dashboard"}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("interview");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold ${
                activeTab === "interview"
                  ? "bg-[#C9A84C] text-[#0A1628]"
                  : "text-[#F5F0E8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare size={16} />
              <span>{lang === "ur" ? "طبی انٹرویو" : "Family Interview"}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("tree");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold ${
                activeTab === "tree"
                  ? "bg-[#C9A84C] text-[#0A1628]"
                  : "text-[#F5F0E8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Network size={16} />
              <span>{lang === "ur" ? "فیملی شجرہ" : "Family Health Tree"}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("risk");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold ${
                activeTab === "risk"
                  ? "bg-[#C9A84C] text-[#0A1628]"
                  : "text-[#F5F0E8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShieldAlert size={16} />
              <span>{lang === "ur" ? "خطرہ انڈیکس" : "Risk Dashboard"}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("report");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold ${
                activeTab === "report"
                  ? "bg-[#C9A84C] text-[#0A1628]"
                  : "text-[#F5F0E8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText size={16} />
              <span>{lang === "ur" ? "ڈاکٹر رپورٹ" : "Report & Export"}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold ${
                activeTab === "settings"
                  ? "bg-[#C9A84C] text-[#0A1628]"
                  : "text-[#F5F0E8]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings size={16} />
              <span>{lang === "ur" ? "ترتیبات" : "Settings Manager"}</span>
            </button>
          </div>

          {/* Sidebar Footer Info */}
          <div className="flex flex-col gap-2 mt-auto border-t border-[#C9A84C]/10 pt-4 font-sans text-[11px] text-[#F5F0E8]/40">
            <div className="flex items-center gap-2">
              <Award size={12} className="text-[#C9A84C]" />
              <span className="font-semibold text-[#F5F0E8]/70">Competition Entry</span>
            </div>
            <p className="leading-normal">
              5-Day AI Agents Intensive. Built with Express + React + Google Gemini 2.0.
            </p>
          </div>
        </aside>

        {/* Primary Page Canvas Switcher */}
        <main className="flex-1 bg-[#F5F0E8] text-[#0A1628] p-4 md:p-8 overflow-y-auto min-w-0" id="main-content-flow">
          {activeTab === "home" && (
            <HomeView onStart={(tab) => setActiveTab(tab)} lang={lang} />
          )}

          {activeTab === "interview" && (
            <InterviewView
              chatHistory={chatHistory}
              members={members}
              onSendMessage={handleSendChatMessage}
              onCommitMember={handleCommitMember}
              lang={lang}
              isSending={isSending}
              onClearChat={() => {
                if (confirm(lang === "ur" ? "کیا آپ چیٹ دوبارہ شروع کرنا چاہتے ہیں؟" : "Are you sure you want to reset the interview chat?")) {
                  setChatHistory([
                    {
                      id: "init_greet",
                      sender: "agent",
                      text:
                        lang === "ur"
                          ? "اسلام علیکم! میں آپ کا فیملی ہیلتھ کونسلر کانٹیکسٹ ایجنٹ ہوں۔ آئیے مل کر آپ کے خاندان کی صحت کا گراف تیار کریں۔ پہلے اپنے والد محترم کے بارے میں بتائیں — ان کا نام کیا ہے اور کیا وہ حیات ہیں؟"
                          : "Assalam-o-Alaikum! I am your multi-agent intake counselor. Let's record your family's health genetics. Tell me about your father — what is his name, and is he still with us?",
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                  ]);
                }
              }}
            />
          )}

          {activeTab === "tree" && (
            <div className="flex flex-col gap-5 h-full">
              <div className="border-b border-[#0A1628]/10 pb-4">
                <h2 className="font-serif text-2xl text-[#0A1628] font-bold">
                  {lang === "ur" ? "موروثی فیملی شجرہ" : "Dynamic Family Health Pedigree"}
                </h2>
                <p className="text-xs text-[#0A1628]/70 font-sans mt-0.5">
                  {lang === "ur"
                    ? "خاندان کے موروثی جینیاتی تعلقات کی تصویری شکل۔ معلومات دیکھنے کے لیے کسی بھی ممبر کے گول دائرے پر دبائیں۔"
                    : "Interactive clinical genogram constructed using Network Pedigree logic. Click on any member to explore properties."}
                </p>
              </div>
              <div className="flex-1">
                <NetworkGraph
                  members={members}
                  onSelectMember={(member) => {
                    console.log("Selected member on tree:", member);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "risk" && (
            <RiskView
              risks={risks}
              lang={lang}
              onRefresh={() => triggerAnalysis(userProfile, members)}
              isAnalyzing={isAnalyzing}
            />
          )}

          {activeTab === "report" && (
            <ReportView
              patterns={patterns}
              risks={risks}
              userProfile={userProfile}
              doctorMarkdown={doctorMarkdown}
              urduSummary={urduSummary}
              lang={lang}
              onRefresh={() => triggerAnalysis(userProfile, members)}
              isGenerating={isGenerating}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              userProfile={userProfile}
              members={members}
              lang={lang}
              onUpdateLanguage={(l) => setLang(l)}
              onUpdateProfile={handleUpdateProfile}
              onAddMember={handleCommitMember}
              onDeleteMember={handleDeleteMember}
              onImportBackup={handleImportBackupObj}
              onClearDB={handleNukeDB}
            />
          )}
        </main>
      </div>
    </div>
  );
}
