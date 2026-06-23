import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || "TEMPORARY_DEV_KEY";
const hasValidKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

const ai = new GoogleGenAI({
  apiKey: hasValidKey ? process.env.GEMINI_API_KEY : apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

/**
 * Robust wrapper for generating content with Gemini.
 * Implements exponential backoff retry on "gemini-3.5-flash" and,
 * if that exhibits high-demand 503 or transient issues, transparently
 * falls back to the highly stable "gemini-3.1-flash-lite" model.
 */
async function generateContentWithFallback(params: {
  model?: string;
  contents: any;
  config?: any;
}) {
  const primaryModel = params.model || "gemini-3.5-flash";
  const fallbackModel = "gemini-3.1-flash-lite";
  let lastError: any = null;

  // 1. Try Primary Model (up to 2 attempts)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[Gemini SDK Request] Trying primary model: ${primaryModel} (Attempt ${attempt}/2)`);
      const response = await ai.models.generateContent({
        ...params,
        model: primaryModel,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Warning] Model ${primaryModel} attempt ${attempt} failed: ${err.message || err}`);
      
      // If we failed and have attempts remaining, back off briefly
      if (attempt < 2) {
        const delay = attempt * 1200;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // 2. Fall back to gemini-3.1-flash-lite if primary fails or is overloaded
  console.log(`[Gemini SDK Fallback] Primary model failed or threw 503. Switching to fallback model: ${fallbackModel}`);
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[Gemini SDK Fallback Request] Trying stable fallback model: ${fallbackModel} (Attempt ${attempt}/2)`);
      const response = await ai.models.generateContent({
        ...params,
        model: fallbackModel,
      });
      console.log(`[Gemini SDK Success] Fallback resolved successfully.`);
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Warning] Fallback model ${fallbackModel} attempt ${attempt} failed: ${err.message || err}`);
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // 3. Propagate error if both primary and fallback failed after retries
  throw lastError;
}

const app = express();
app.use(express.json());

const PORT = 3000;
const RECORDS_FILE = path.join(process.cwd(), "family_records.json");

// Default starter dataset so the app has high-quality demo data out-of-the-box
const defaultRecords = {
  userProfile: {
    age: 38,
    gender: "Male",
    conditions: ["Pre-diabetes"],
    lifestyle: ["Sedentary", "High Stress"],
  },
  members: [
    {
      id: "m1",
      name: "Tariq",
      relationship: "Father",
      gender: "Male",
      age: 64,
      deceased: true,
      ageAtDeath: 64,
      conditions: ["Type 2 Diabetes", "Myocardial Infarction", "Hypertension"],
      symptoms: ["Chest tightness", "High blood sugar", "Fatigue"],
      medications: ["Metformin", "Lisinopril"],
      lifestyle: ["Inactive", "High-fat diet", "Smoker"],
    },
    {
      id: "m2",
      name: "Sajida",
      relationship: "Mother",
      gender: "Female",
      age: 61,
      deceased: false,
      conditions: ["Hypertension", "Hyperthyroidism"],
      symptoms: ["High blood pressure", "Shaky hands"],
      medications: ["Amlodipine", "Methimazole"],
      lifestyle: ["Active", "Vegetarian", "Non-smoker"],
    },
    {
      id: "m3",
      name: "Bashir",
      relationship: "Paternal Grandfather",
      gender: "Male",
      age: 78,
      deceased: true,
      ageAtDeath: 78,
      conditions: ["Stroke", "Type 2 Diabetes"],
      symptoms: ["Partial paralysis", "Extreme thirst"],
      medications: ["Insulin"],
      lifestyle: ["Inactive", "Smoker"],
    },
    {
      id: "m4",
      name: "Nusrat",
      relationship: "Paternal Grandmother",
      gender: "Female",
      age: 82,
      deceased: true,
      ageAtDeath: 82,
      conditions: ["Arthritis", "Hypertension"],
      symptoms: ["Joint pain"],
      medications: ["Painkillers"],
      lifestyle: ["Sedentary"],
    },
    {
      id: "m5",
      name: "Farooqi",
      relationship: "Maternal Grandfather",
      gender: "Male",
      age: 72,
      deceased: true,
      ageAtDeath: 72,
      conditions: ["Hypertension", "Coronary Artery Disease"],
      symptoms: ["Angina", "Dizziness"],
      medications: ["Beta-blocker", "Aspirin"],
      lifestyle: ["Sedentary", "Heavy tobacco user"],
    },
    {
      id: "m6",
      name: "Anwar (Chacha)",
      relationship: "Uncle (Paternal)",
      gender: "Male",
      age: 56,
      deceased: false,
      conditions: ["Type 2 Diabetes", "High Cholesterol"],
      symptoms: ["Frequent urination"],
      medications: ["Metformin"],
      lifestyle: ["Sedentary", "Sweet tooth"],
    }
  ],
};

// Initialize File Storage
function getRecords() {
  try {
    if (fs.existsSync(RECORDS_FILE)) {
      const content = fs.readFileSync(RECORDS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading records file, resetting to fallback", e);
  }
  // Store default records
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(defaultRecords, null, 2));
  return defaultRecords;
}

function saveRecords(data: any) {
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(data, null, 2));
}

// REST Api for Family Records
app.get("/api/family", (req, res) => {
  const records = getRecords();
  res.json(records);
});

app.post("/api/family", (req, res) => {
  const { userProfile, members } = req.body;
  const records = getRecords();
  if (userProfile) records.userProfile = userProfile;
  if (members) records.members = members;
  saveRecords(records);
  res.json({ success: true, records });
});

app.post("/api/family/clear", (req, res) => {
  const cleared = {
    userProfile: { age: 30, gender: "Male", conditions: [], lifestyle: [] },
    members: [],
  };
  saveRecords(cleared);
  res.json({ success: true, records: cleared });
});

/*
  ======================================================
  AGENT 1: INTAKE ORCHESTRATOR ENDPOINT
  Interviews conversational input, extracts structured family profiles
  ======================================================
*/
app.post("/api/agents/chat", async (req, res) => {
  const { message, chatHistory = [], members = [] } = req.body;

  if (!hasValidKey) {
    // If no valid key is provided, return a friendly simulated intelligent response with Urdu details
    const cleanLower = message.toLowerCase();
    let label = "Simulated Response";
    let extracted: any = null;

    if (cleanLower.includes("aba") || cleanLower.includes("father") || cleanLower.includes("walid") || cleanLower.includes("tariq")) {
      label = "Father Profile Extracted";
      extracted = {
        name: "Tariq",
        relationship: "Father",
        gender: "Male",
        age: 64,
        deceased: true,
        ageAtDeath: 64,
        conditions: ["Heart Disease", "Type 2 Diabetes"],
        symptoms: ["Chest tightness", "High sugar"],
        medications: ["Insulin", "Beta-blockers"],
        lifestyle: ["Smoker", "Inactive"],
      };
    } else if (cleanLower.includes("nana") || cleanLower.includes("grandfather") || cleanLower.includes("sugar")) {
      label = "Maternal Grandfather Extracted";
      extracted = {
        name: "Naseer",
        relationship: "Maternal Grandfather",
        gender: "Male",
        age: 72,
        deceased: true,
        ageAtDeath: 72,
        conditions: ["Type 2 Diabetes"],
        symptoms: ["Dizzy spells"],
        medications: [],
        lifestyle: [],
      };
    }

    return res.json({
      activeAgent: "Intake Agent",
      responseText: `[Demo Mode / No API Key configured in Settings > Secrets] \n\nAssalam-o-Alaikum! I have heard your response: "${message}". I've simulated our Multi-Agent Root Orchestrator parsing your profile. \n\nIn a real session, our Google Gemini model would perform professional dual Urdu/English extraction. Here is what I caught:`,
      extractedMember: extracted,
      demoMode: true,
    });
  }

  try {
    // Build context prompt
    const systemPrompt = `You are the core Root Orchestrator and Intake Agent for "Family Health History Agent".
Your absolute goal is to run a warm, supportive, conversational health interview to build a multi-generational family tree.
The user speaks Urdu, English, or mixed "Hinglish/Urdu-English" (e.g. "Aba ko sugar thi and 64 stroke se pass huay").

RULES OF CONVERSATION:
1. Speak in a warm, comforting tone (millions of users discuss lost elders here - be respectful, start with brief condolences or warmth if they mention deaths).
2. Ask about family members ONE BY ONE. Do not overwhelm the user.
3. Validate and confirm what you extracted.
4. Support mixed language and translate appropriately. If the user answers in Urdu, reply in simple, caring Urdu combined with clear summaries.
5. If the user expresses confusion or says "I don't know" or "skip", gracefully skip that field or member and ask about the next logical relation (e.g., Mother, Grandparents, Sibling, Uncle/Aunt).

EXTRACTION DIRECTIVE:
If the user's message contains health descriptors or relationship details, you must extract them.
Return your response as a valid JSON object matching the schema below:
{
  "responseText": "Your warm, conversational, professional reply to the user (in mixed English/Urdu as context warrants)",
  "extractedMember": null OR {
    "name": "Member Name if provided, otherwise default like 'Maternal Grandmother'",
    "relationship": "One of: 'Self' | 'Father' | 'Mother' | 'Paternal Grandfather' | 'Paternal Grandmother' | 'Maternal Grandfather' | 'Maternal Grandmother' | 'Brother' | 'Sister' | 'Uncle (Paternal)' | 'Aunt (Paternal)' | 'Uncle (Maternal)' | 'Aunt (Maternal)' | 'Son' | 'Daughter'",
    "gender": "Male" | "Female" | "Other",
    "age": number or null,
    "deceased": boolean,
    "ageAtDeath": number or null,
    "conditions": ["Diabetes", "Hypertension", etc. list of standardized professional medical terms computed from natural descriptions (e.g. sugar = Type 2 Diabetes, dil ka dora = Myocardial Infarction / Heart Disease)],
    "symptoms": ["dizziness", "chest tightness", "increased urination" etc. list of colloquial symptoms],
    "medications": ["metformin" etc. if mentioned],
    "lifestyle": ["smoker", "inactive", etc. standard habits]
  }
}

Format strictly as a JSON object. Return ONLY valid JSON. Keep the response text beautiful and emotionally intelligent. Current members list in store to avoid duplication: ${JSON.stringify(members)}`;

    // Invoke Gemini with dynamic retry and fallback
    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: [
        { role: "system", parts: [{ text: systemPrompt }] },
        ...chatHistory.map((m: any) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        })),
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const body = JSON.parse(response.text || "{}");
    res.json({
      activeAgent: "Intake Agent",
      responseText: body.responseText || "Thank you for sharing that. I have noted this details.",
      extractedMember: body.extractedMember || null,
      demoMode: false,
    });
  } catch (error: any) {
    console.error("Gemini Intake Chat Error:", error);
    res.status(500).json({
      error: "Failed to evaluate agent orchestrator request",
      message: error.message,
    });
  }
});

/*
  ======================================================
  AGENT 2 & 3: PATTERN DETECTION & RISK ASSESSMENT ENDPOINT
  Computes disease clusters, generational trends, and user risks
  ======================================================
*/
app.post("/api/agents/analyze", async (req, res) => {
  const records = getRecords();
  const { userProfile = records.userProfile, members = records.members } = req.body;

  if (!hasValidKey) {
    // Return mock calculations if API key is not configured
    const simulatedPatterns = [
      {
        disease: "Type 2 Diabetes",
        clusterSize: 3,
        affectedMembers: ["Tariq (Father)", "Bashir (Paternal Grandfather)", "Anwar (Uncle (Paternal))"],
        generationalTrend: "High recurrence observed in paternal lineage across 2 consecutive generations (75% of paternal males).",
        inheritanceWeight: "Paternal High (80% weight)",
      },
      {
        disease: "Hypertension",
        clusterSize: 3,
        affectedMembers: ["Tariq (Father)", "Sajida (Mother)", "Farooqi (Maternal Grandfather)"],
        generationalTrend: "Bilateral risk pattern. Both maternal and paternal sides present elevated vascular tension indications.",
        inheritanceWeight: "Equal Maternal & Paternal (50% each)",
      }
    ];

    const simulatedRisks = [
      {
        disease: "Type 2 Diabetes / Diabetic Risk",
        level: "High",
        score: 82,
        evidence: "Paternal grandfather, father, and uncle present full diagnostic history for Type 2 Diabetes. User currently exhibits pre-diabetic clinical trends.",
        prevention: [
          "Establish high-fiber, low-glycemic eating protocols (portion-controlled carbs).",
          "Engage in 150+ minutes of aerobic activity combined with resistance training weekly.",
          "Check Fasting Blood Glucose & HbA1c values every 6 months to track state."
        ]
      },
      {
        disease: "Cardiovascular Disease / Heart Disease",
        level: "Moderate",
        score: 55,
        evidence: "Father experienced a fatal Myocardial Infarction at 64; maternal grandfather had confirmed Coronary Artery Disease.",
        prevention: [
          "Schedule baseline lipid panels (LDL, HDL, Triglycerides) with a clinic.",
          "Limit foods high in saturated fat and refined salt to protect vascular linings.",
          "Engage in heart-rate elevated exercise regularly and manage chronic stress levels."
        ]
      }
    ];

    return res.json({
      patterns: simulatedPatterns,
      riskScores: simulatedRisks,
      demoMode: true,
    });
  }

  try {
    const analysisPrompt = `You are both the Pattern Detection Agent and the Risk Assessment Agent working in unison.
You are given a family history dataset comprising of family members and a current user profile.
Your jobs are:
1. Pattern Detection Agent: Scan all family records and group them into logical disease clusters (e.g. Diabetes, Hypertension, Heart Disease, Stroke, Cancer, Thyroid). Outline exact recurrence patterns across paternal/maternal generations, count cluster size, and identify inheritance side weighting.
2. Risk Assessment Agent: Take the computed patterns + the user profile (Age, Gender, existing conditions, lifestyle), and output highly personalized risk ratings (High / Moderate / Low) for the major disease groups. Provide a scientific "why" explanation basing on the family tree evidence and 3 precise lifestyle prevention goals.

CRITICAL MEDICAL RESTRICTION:
- Do not make a diagnostic claim ("you have" / "you will contract").
- Express results strictly using educational terms like "elevated hereditary risk factors", "predisposition indicator", "family clustering burden".
- Present warning statements clearly that this is an informational awareness resource, not a replacement for a professional physician consultation.

Return your exact results as a valid JSON object with the following structure:
{
  "patterns": [
    {
      "disease": "Disease Group Name",
      "clusterSize": number,
      "affectedMembers": [ "Name (Relation)", "Name (Relation)" ],
      "generationalTrend": "Detailed natural summary of trend across generations, e.g., 'Recurrence observed on father's side through grandfather Anwar'",
      "inheritanceWeight": "Maternal / Paternal / Bilateral with description"
    }
  ],
  "riskScores": [
    {
      "disease": "Disease Group",
      "level": "Low" | "Moderate" | "High" | "Critical",
      "score": number (0 to 100),
      "evidence": "Detailed explanation citing specific family connections and factors",
      "prevention": ["Prevention tip 1", "Prevention tip 2", "Prevention tip 3"]
    }
  ]
}

Input User Profile: ${JSON.stringify(userProfile)}
Input Family Members list: ${JSON.stringify(members)}`;

    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      patterns: parsed.patterns || [],
      riskScores: parsed.riskScores || [],
      demoMode: false,
    });
  } catch (error: any) {
    console.error("Gemini Analysis Agent Error:", error);
    res.status(500).json({
      error: "Failed to run pattern and risk assessment analysis",
      message: error.message,
    });
  }
});

/*
  ======================================================
  AGENT 4: DOCTOR-READY TEXT REPORT & URDU SUMMARY GENERATION
  ======================================================
*/
app.post("/api/agents/report", async (req, res) => {
  const { patterns = [], riskScores = [], userProfile = {} } = req.body;

  if (!hasValidKey) {
    return res.json({
      urduSummary: `**فیملی صحت کی تاریخ کا اردو خلاصہ**

1۔ **ذیابیطس موروثی خطرہ (Diabetes Risk):**
والد، دادا اور چچا میں شوگر کی تصدیق شدہ ہسٹری ہے۔ آپ کے لیے ذیابیطس کا مینیجمنٹ بہت ضروری ہے کیونکہ والد صاحب کا موروثی رجحان مضبوط پایا گیا ہے۔

2۔ **بلڈ پریشر اور دل کے امراض (Hypertension & CAD):**
والد صاحب کے ہارٹ اٹیک (64 سال کی عمر میں) کا موروثی اثر موجود ہے۔ روزمرہ کی واک اور نمک سے پرہیز انتہائی ضروری ہے۔

*نوٹ: یہ کوئی طبی تشخیص نہیں ہے بلکہ آگاہی کے لیے ہے۔ اپنے طبی معالج سے مشورہ کریں۔*`,
      doctorSummaryMarkdown: `# FAMILY HEALTH ANALYSIS REPORT
*Prepared for Clinical Annotation & Review*

## Patient Intake Profile
- **Current Age:** ${userProfile.age || "N/A"}
- **Gender:** ${userProfile.gender || "N/A"}
- **User Current Conditions:** ${userProfile.conditions?.join(", ") || "None"}
- **Lifestyle Risk Factors:** ${userProfile.lifestyle?.join(", ") || "None"}

## Hereditary Disease Clusters Found
${patterns.map((p: any) => `- **${p.disease}**: Cluster of ${p.clusterSize} (Members: ${p.affectedMembers?.join(", ")}). Weight: ${p.inheritanceWeight}`).join("\n")}

## Personal Risk Assessment (Genetic Load Map)
${riskScores.map((r: any) => `### ${r.disease} - RISK LEVEL: **${r.level.toUpperCase()}** (Score: ${r.score}%)
- **Clinical Evidence:** ${r.evidence}
- **Recommended Actions:**
  ${r.prevention?.map((tip: string) => `1. ${tip}`).join("\n  ")}`).join("\n\n")}

---
**PROVIDER ANNOTATIONS & NOTES:**
____________________________________________________________________________________
____________________________________________________________________________________
____________________________________________________________________________________
`,
      demoMode: true,
    });
  }

  try {
    const reportPrompt = `You are the Report Agent.
Take the current family health analysis data (patterns & risks) and generate two summaries:
1. A sophisticated, clinical-grade Doctor-Ready Summary formatted nicely in Markdown, adding a structured section specifically designed for doctors to sign, annotate, or prescribe screenings.
2. A warm, plain-language Urdu summary ("فیملی صحت کی مکمل تفصیل") suitable for sharing with family members over WhatsApp or printing.

Input data:
Patterns: ${JSON.stringify(patterns)}
Risks: ${JSON.stringify(riskScores)}
UserProfile: ${JSON.stringify(userProfile)}

Return a valid JSON object matching this schema:
{
  "doctorSummaryMarkdown": "Clinical report in markdown format",
  "urduSummary": "A warm Urdu plain text summary detailing the genetic risks and prevention guides"
}`;

    const response = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: reportPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      doctorSummaryMarkdown: parsed.doctorSummaryMarkdown || "",
      urduSummary: parsed.urduSummary || "",
      demoMode: false,
    });
  } catch (error: any) {
    console.error("Gemini Report Agent Error:", error);
    res.status(500).json({
      error: "Failed to compile the report",
      message: error.message,
    });
  }
});

async function startServer() {
  // Serve frontend assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express v4 fallback SPA routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
