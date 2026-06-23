import React, { useState } from "react";
import { FamilyMember, UserProfile, Language } from "../types";
import { Trash2, Plus, Edit, ShieldAlert, Download, Upload, Globe, CheckCircle, UserPlus, FileText } from "lucide-react";

interface SettingsViewProps {
  userProfile: UserProfile;
  members: FamilyMember[];
  lang: Language;
  onUpdateLanguage: (l: Language) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onAddMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
  onImportBackup: (backupText: string) => boolean;
  onClearDB: () => void;
}

export default function SettingsView({
  userProfile,
  members,
  lang,
  onUpdateLanguage,
  onUpdateProfile,
  onAddMember,
  onDeleteMember,
  onImportBackup,
  onClearDB,
}: SettingsViewProps) {
  const isUrdu = lang === "ur";
  
  // Local state for direct adding
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<FamilyMember["relationship"]>("Father");
  const [gender, setGender] = useState<FamilyMember["gender"]>("Male");
  const [age, setAge] = useState("");
  const [deceased, setDeceased] = useState(false);
  const [ageAtDeath, setAgeAtDeath] = useState("");
  const [conditions, setConditions] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medications, setMedications] = useState("");
  const [lifestyle, setLifestyle] = useState("");

  // Backup state
  const [backupString, setBackupString] = useState("");
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [importError, setImportError] = useState(false);

  // User profile editor state
  const [userAge, setUserAge] = useState(userProfile.age.toString());
  const [userGender, setUserGender] = useState(userProfile.gender);
  const [userCond, setUserCond] = useState(userProfile.conditions.join(", "));
  const [userLife, setUserLife] = useState(userProfile.lifestyle.join(", "));
  const [profileSuccess, setProfileSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      age: parseInt(userAge) || 30,
      gender: userGender,
      conditions: userCond.split(",").map(c => c.trim()).filter(Boolean),
      lifestyle: userLife.split(",").map(l => l.trim()).filter(Boolean),
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: FamilyMember = {
      id: "mem_" + Date.now(),
      name: name.trim(),
      relationship: relation,
      gender: gender,
      age: age ? parseInt(age) : undefined,
      deceased: deceased,
      ageAtDeath: deceased && ageAtDeath ? parseInt(ageAtDeath) : undefined,
      conditions: conditions.split(",").map(c => c.trim()).filter(Boolean),
      symptoms: symptoms.split(",").map(s => s.trim()).filter(Boolean),
      medications: medications.split(",").map(m => m.trim()).filter(Boolean),
      lifestyle: lifestyle.split(",").map(l => l.trim()).filter(Boolean),
    };

    onAddMember(newMember);
    setFormOpen(false);
    
    // Reset form fields
    setName("");
    setRelation("Father");
    setGender("Male");
    setAge("");
    setDeceased(false);
    setAgeAtDeath("");
    setConditions("");
    setSymptoms("");
    setMedications("");
    setLifestyle("");
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ userProfile, members }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "family_health_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onImportBackup(backupString);
    if (success) {
      setBackupSuccess(true);
      setBackupString("");
      setImportError(false);
      setTimeout(() => setBackupSuccess(false), 3000);
    } else {
      setImportError(true);
      setTimeout(() => setImportError(false), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 py-4" id="settings-view-panel">
      
      {/* Tab Header */}
      <div>
        <h2 className="font-serif text-2xl text-[#0A1628] font-bold">
          {isUrdu ? "ترتیبات اور ایڈمن کنٹرول" : "Family Directory & Admin Controls"}
        </h2>
        <p className="text-xs text-[#0A1628]/70 font-sans mt-1">
          {isUrdu ? "زبان تبدیل کریں۔ فیملی ممبرز کا ڈیٹا شامل یا ترمیم کریں، بیک اپ درآمد یا برآمد کریں۔" : "Manage system language, direct-edit health nodes, and backup database instances."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-[#0A1628]">
        
        {/* Left column: Profile & Translation Configuration */}
        <div className="flex flex-col gap-6">
          
          {/* Language selection card */}
          <div className="bg-white border border-[#0A1628]/5 rounded-2xl p-5 flex flex-col gap-4 shadow-sm text-[#0A1628]">
            <h3 className="font-serif text-[#0A1628] text-sm font-bold border-b border-[#0A1628]/5 pb-2 flex items-center gap-2">
              <Globe size={15} className="text-[#C9A84C]" />
              <span>{isUrdu ? "زبان منتخب کریں" : "Interface Language"}</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <button
                onClick={() => onUpdateLanguage("en")}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  lang === "en"
                    ? "bg-[#C9A84C] text-[#0A1628] border-[#C9A84C]"
                    : "bg-transparent border-[#0A1628]/15 text-[#0A1628] hover:bg-[#F5F0E8]"
                }`}
              >
                English (Inter)
              </button>
              <button
                onClick={() => onUpdateLanguage("ur")}
                className={`py-2 px-3 rounded-lg border text-center font-sans tracking-wide transition-all ${
                  lang === "ur"
                    ? "bg-[#C9A84C] text-[#0A1628] border-[#C9A84C]"
                    : "bg-transparent border-[#0A1628]/15 text-[#0A1628] hover:bg-[#F5F0E8]"
                }`}
              >
                اردو (RTL)
              </button>
            </div>
          </div>

          {/* User Profile details editor */}
          <div className="bg-white border border-[#0A1628]/5 rounded-2xl p-5 shadow-sm text-[#0A1628]">
            <h3 className="font-serif text-[#0A1628] text-sm font-bold border-b border-[#0A1628]/5 pb-2.5 mb-4 flex items-center gap-2">
              <FileText size={15} className="text-[#C9A84C]" />
              <span>{isUrdu ? "آپ کی ذاتی معلومات" : "Your Health Profile"}</span>
            </h3>

            <form onSubmit={handleProfileSave} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[#0A1628]/60">Your Current Age</label>
                  <input
                    type="number"
                    value={userAge}
                    onChange={(e) => setUserAge(e.target.value)}
                    className="bg-[#F5F0E8] text-[#0A1628] border border-[#0A1628]/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#0A1628]/60">Gender</label>
                  <select
                    value={userGender}
                    onChange={(e) => setUserGender(e.target.value)}
                    className="bg-[#F5F0E8] text-[#0A1628] border border-[#0A1628]/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#0A1628]/60">Your Conditions (comma separated)</label>
                <input
                  type="text"
                  value={userCond}
                  placeholder="e.g. Pre-diabetes, High Cholesterol"
                  onChange={(e) => setUserCond(e.target.value)}
                  className="bg-[#F5F0E8] text-[#0A1628] border border-[#0A1628]/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#0A1628]/60">Your Lifestyle (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Sedentary, Night Owl"
                  value={userLife}
                  onChange={(e) => setUserLife(e.target.value)}
                  className="bg-[#F5F0E8] text-[#0A1628] border border-[#0A1628]/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <button
                type="submit"
                className={`font-bold py-2.5 rounded-lg transition-all shadow-sm active:scale-[0.98] ${
                  profileSuccess
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-[#C9A84C] hover:bg-opacity-95 text-[#0A1628]"
                }`}
              >
                {profileSuccess
                  ? (isUrdu ? "معلومات محفوظ ہوگئیں!" : "✓ Profile Synchronized!")
                  : (isUrdu ? "محفوظ کریں" : "Apply & Sync Profiles")}
              </button>
            </form>
          </div>

        </div>

        {/* Center Pillar: Direct node list and manual add */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Main list & manage card */}
          <div className="bg-white border border-[#0A1628]/5 rounded-2xl p-6 shadow-sm text-[#0A1628]">
            <div className="flex justify-between items-center border-b border-[#0A1628]/5 pb-3 mb-4">
              <h3 className="font-serif text-[#0A1628] text-sm font-bold flex items-center gap-2">
                <UserPlus size={15} className="text-[#C9A84C]" />
                <span>{isUrdu ? "فیملی ممبرز ڈائرکٹری" : "Family Member Directory Control"}</span>
              </h3>
              
              <button
                onClick={() => setFormOpen(!formOpen)}
                className="bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] font-semibold text-xs py-1 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Add member directly without chat counselor"
              >
                <Plus size={13} />
                <span>{formOpen ? (isUrdu ? "بند کریں" : "Close Editor") : (isUrdu ? "نیا شامل کریں" : "Add Direct Node")}</span>
              </button>
            </div>

            {/* Direct Add form block */}
            {formOpen && (
              <form onSubmit={handleAddMemberSubmit} className="bg-[#F5F0E8] p-4 rounded-xl border border-[#0A1628]/10 mb-5 flex flex-col gap-4 text-xs">
                <h4 className="font-serif font-bold text-[#A68633] text-xs uppercase tracking-wider mb-1">
                  Direct Node Registrar Form
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#0A1628]/60">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white text-[#0A1628] border border-[#0A1628]/10 rounded p-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[#0A1628]/60">Relationship</label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value as FamilyMember["relationship"])}
                      className="bg-white text-[#0A1628] border border-[#0A1628]/10 rounded p-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Paternal Grandfather">Paternal Grandfather</option>
                      <option value="Paternal Grandmother">Paternal Grandmother</option>
                      <option value="Maternal Grandfather">Maternal Grandfather</option>
                      <option value="Maternal Grandmother">Maternal Grandmother</option>
                      <option value="Uncle (Paternal)">Uncle (Paternal)</option>
                      <option value="Aunt (Paternal)">Aunt (Paternal)</option>
                      <option value="Uncle (Maternal)">Uncle (Maternal)</option>
                      <option value="Aunt (Maternal)">Aunt (Maternal)</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[#0A1628]/60">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as FamilyMember["gender"])}
                      className="bg-white text-[#0A1628] border border-[#0A1628]/10 rounded p-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="deceased-check"
                      checked={deceased}
                      onChange={(e) => setDeceased(e.target.checked)}
                      className="accent-[#C9A84C] w-4 h-4"
                    />
                    <label htmlFor="deceased-check" className="text-[#0A1628]/70 cursor-pointer font-medium">Deceased?</label>
                  </div>

                  {!deceased ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-[#0A1628]/60">Current Age</label>
                      <input
                        type="number"
                        placeholder="e.g. 64"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="bg-white text-[#0A1628] border border-[#0A1628]/10 rounded p-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <label className="text-[#0A1628]/60">Age at Death</label>
                      <input
                        type="number"
                        placeholder="e.g. 64"
                        value={ageAtDeath}
                        onChange={(e) => setAgeAtDeath(e.target.value)}
                        className="bg-white text-[#0A1628] border border-[#0A1628]/10 rounded p-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#0A1628]/60">Conditions (comma separated health terms)</label>
                    <input
                      type="text"
                      placeholder="e.g. Type 2 Diabetes, Hypertension"
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      className="bg-white text-[#0A1628] border border-[#0A1628]/10 rounded p-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#0A1628]/60">Symptoms (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. dizzy, chest pains"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="bg-white text-[#0A1628] border border-[#0A1628]/10 rounded p-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#C9A84C] text-[#0A1628] font-bold py-2 px-4 rounded-xl mt-1 hover:bg-opacity-95 active:scale-95 transition-all self-end flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle size={14} />
                  <span>{isUrdu ? "فیملی گراف میں محفوظ کریں" : "Register Node & Sync Graph"}</span>
                </button>
              </form>
            )}

            {/* List members table */}
            <div className="flex flex-col gap-3 font-sans">
              {members.length > 0 ? (
                members.map((m) => (
                  <div
                    key={m.id}
                    className="bg-[#F5F0E8] border border-[#0A1628]/5 rounded-xl px-4 py-3 flex items-center justify-between hover:border-[#0A1628]/10 transition-colors"
                  >
                    <div>
                      <strong className="text-sm text-[#0A1628] font-serif block">
                        {m.name} ({m.relationship})
                      </strong>
                      <span className="text-[10px] text-[#0A1628]/60">
                        {m.gender} • {m.deceased ? `Deceased at ${m.ageAtDeath} yr` : `${m.age || "N/A"} yr old`}
                        {m.conditions.length > 0 && ` • Conditions: ${m.conditions.join(", ")}`}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteMember(m.id)}
                      className="text-[#0A1628]/40 hover:text-red-600 p-2 rounded transition-colors"
                      title="Delete profile node"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 italic text-[#0A1628]/50 text-xs font-medium">
                  {isUrdu ? "کوئی ممبر درج نہیں ہے۔" : "No nodes currently registered in active genogram instance."}
                </div>
              )}
            </div>
          </div>

          {/* Backup administrative card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-[#0A1628]/5 rounded-2xl p-5 shadow-sm text-[#0A1628]">
            <div>
              <h4 className="font-serif text-[#0A1628] text-sm font-bold pb-2.5 mb-2.5 flex items-center gap-2 border-b border-[#0A1628]/5">
                <Download size={14} className="text-[#C9A84C]" />
                <span>{isUrdu ? "ڈیٹا برآمد کریں" : "Database Backup Export"}</span>
              </h4>
              <p className="text-xs text-[#0A1628]/70 leading-normal mb-3 font-medium">
                {isUrdu ? "خاندان کی تمام تفاصیل اور پروفائل کو فائل کی شکل میں محفوظ کریں۔" : "Sync and save your full multi-generational directory records out of web space."}
              </p>
              <button
                onClick={handleExport}
                className="bg-white hover:bg-[#F5F0E8] border border-[#C9A84C]/40 text-[#A68633] font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download size={12} />
                <span>Backup JSON Archive</span>
              </button>
            </div>

            <form onSubmit={handleImport}>
              <h4 className="font-serif text-[#0A1628] text-sm font-bold pb-2.5 mb-2.5 flex items-center gap-2 border-b border-[#0A1628]/5">
                <Upload size={14} className="text-[#C9A84C]" />
                <span>{isUrdu ? "ڈیٹا درآمد کریں" : "Database Backup Import"}</span>
              </h4>
              <p className="text-xs text-[#0A1628]/70 leading-normal mb-2 font-medium">
                Paste raw JSON from a previous backup file to restore instant family tree nodes:
              </p>
              <div className="flex flex-col gap-2">
                <textarea
                  value={backupString}
                  onChange={(e) => setBackupString(e.target.value)}
                  placeholder='{"userProfile": ..., "members": ...}'
                  rows={2}
                  className="bg-[#F5F0E8] text-[#0A1628] border border-[#0A1628]/10 rounded p-1.5 text-[10px] font-mono focus:outline-none focus:border-[#C9A84C]"
                ></textarea>
                <button
                  type="submit"
                  className={`font-bold text-xs py-1.5 rounded-lg active:scale-95 transition-all shadow-sm ${
                    backupSuccess
                      ? "bg-emerald-600 text-white"
                      : importError
                        ? "bg-red-600 text-white"
                        : "bg-[#C9A84C] text-[#0A1628]"
                  }`}
                >
                  {backupSuccess
                    ? (isUrdu ? "درآمد کامیاب!" : "✓ JSON Database Restored!")
                    : importError
                      ? (isUrdu ? "غلط ڈیٹا!" : "✗ Invalid JSON format!")
                      : (isUrdu ? "بیک اپ بحال کریں" : "Import & Inject Backup")}
                </button>
              </div>
            </form>
          </div>

          <div className="flex justify-between items-center border-t border-[#0A1628]/10 pt-4">
            <span className="text-[10px] text-[#0A1628]/50 font-mono">WORKSPACE STATE ENGINE: OFF-LINE COMPLIANT</span>
            <button
              onClick={() => {
                if (confirm(isUrdu ? "کیا آپ تمام ریکارڈز کو یقینی طور پر مٹانا چاہتے ہیں؟" : "Confirm absolute deletion of all records and resets?")) {
                  onClearDB();
                }
              }}
              className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={13} />
              <span>{isUrdu ? "تمام تاریخ مٹائیں" : "Nuke Database Records"}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
