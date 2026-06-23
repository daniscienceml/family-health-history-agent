export interface UserProfile {
  age: number;
  gender: string;
  conditions: string[];
  lifestyle: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 
    | "Self"
    | "Father"
    | "Mother"
    | "Paternal Grandfather"
    | "Paternal Grandmother"
    | "Maternal Grandfather"
    | "Maternal Grandmother"
    | "Brother"
    | "Sister"
    | "Uncle (Paternal)"
    | "Aunt (Paternal)"
    | "Uncle (Maternal)"
    | "Aunt (Maternal)"
    | "Son"
    | "Daughter";
  gender: "Male" | "Female" | "Other";
  age?: number;
  deceased: boolean;
  ageAtDeath?: number;
  conditions: string[];
  symptoms: string[];
  medications: string[];
  lifestyle: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  activeAgent?: string;
  extractedMember?: Partial<FamilyMember> | null;
}

export interface DiseasePattern {
  disease: string;
  clusterSize: number;
  affectedMembers: string[];
  generationalTrend: string;
  inheritanceWeight: string;
}

export interface RiskScore {
  disease: string;
  level: "Low" | "Moderate" | "High" | "Critical";
  score: number; // 0 - 100
  evidence: string;
  prevention: string[];
}

export type ActiveTab = "home" | "interview" | "tree" | "risk" | "report" | "settings";

export type Language = "en" | "ur";
