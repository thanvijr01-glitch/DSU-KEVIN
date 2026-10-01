const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Available Gemini models in order of preference
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
];

async function analyzeProject(description) {
  const prompt = `
You are a technical project-role analyzer.

Analyze the following hackathon/project description.

Project:
${description}

Identify the technical skills required to build this project.

For each skill:
- Give the skill name
- Give an importance score from 1 to 10
- Give a short reason

Only include skills that are actually relevant to the project.

Return the result as JSON.
`;

  let lastError;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              skills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                    importance: {
                      type: "integer",
                    },
                    reason: {
                      type: "string",
                    },
                  },
                  required: ["name", "importance", "reason"],
                },
              },
            },
            required: ["skills"],
          },
        },
      });

      console.log(`Success with ${model}`);
      return JSON.parse(response.text);
    } catch (error) {
      lastError = error;
      console.log(`${model} failed: ${error.message || error}`);

      if (error.status === 404) {
        // Model name not supported in this API version, try next
        continue;
      }

      if (error.status !== 503) {
        // Continue fallback instead of hard-crashing on single model failure
        continue;
      }

      console.log("Model is temporarily unavailable. Trying next model...");
      await sleep(1000);
    }
  }

  // Fallback heuristic if API models are unreachable
  console.warn("All Gemini models failed. Utilizing local technical analyzer fallback.");
  return extractProjectSkillsFallback(description);
}

/**
 * Robust fallback project analyzer if Gemini API quota/network is unavailable
 */
function extractProjectSkillsFallback(description = '') {
  const desc = description.toLowerCase();
  const skills = [];

  if (desc.includes("crop") || desc.includes("image") || desc.includes("vision") || desc.includes("drone") || desc.includes("detect")) {
    skills.push({ name: "Computer Vision", importance: 10, reason: "Image and pattern detection required." });
    skills.push({ name: "Python", importance: 9, reason: "Primary language for model training and processing." });
    skills.push({ name: "Machine Learning", importance: 9, reason: "Model inference and disease classification." });
  }
  if (desc.includes("map") || desc.includes("drone") || desc.includes("gis") || desc.includes("geospatial")) {
    skills.push({ name: "Geospatial Data Analysis", importance: 8, reason: "Spatial mapping and drone coordinates." });
  }
  if (desc.includes("web") || desc.includes("platform") || desc.includes("frontend") || desc.includes("dashboard")) {
    skills.push({ name: "React", importance: 7, reason: "Interactive web dashboard." });
  }
  if (desc.includes("api") || desc.includes("backend") || desc.includes("server")) {
    skills.push({ name: "Node.js", importance: 7, reason: "Backend API and data processing." });
  }

  if (skills.length === 0) {
    skills.push({ name: "Python", importance: 8, reason: "Core application logic." });
    skills.push({ name: "Full-Stack Development", importance: 7, reason: "System implementation." });
  }

  return { skills };
}

/**
 * Verify candidate skills using actual code/module contributions
 * Solves:
 * 1. Low contribution forks
 * 2. Cosmetic / README commits
 */
async function verifySkillsFromContributions({
  repositoryName = "",
  languages = [],
  topics = [],
  isFork = false,
  parentRepo = null,
  userCommits = 0,
  personalContribution = 100,
  codeRatio = 0,
  docRatio = 0,
  isCosmeticOnly = false,
  modulesContributed = [],
  sampleCommitMessages = []
}) {
  const prompt = `
You are KEVIN's technical skill authenticator.
Your job is to analyze what technical skills are ACTUALLY demonstrated by a candidate's personal contributions to a GitHub repository.

CRITICAL ASSESSMENT RULES:
1. Do NOT assume that because the repository contains a certain technology, the candidate has that skill.
2. Evaluate the student's ACTUAL personal work:
   - Repository: ${repositoryName}
   - Is Fork: ${isFork} (Parent: ${parentRepo || 'None'})
   - Personal Contribution: ${personalContribution}% (${userCommits} commits)
   - Code vs Docs: ${codeRatio}% Code files vs ${docRatio}% Documentation/Config files
   - Cosmetic-Only Contributor: ${isCosmeticOnly}
   - Modules Modified by Candidate: ${modulesContributed.join(', ') || 'root files'}
   - Candidate's Commit Messages: ${sampleCommitMessages.slice(0, 5).join(' | ') || 'Standard commit activity'}
3. If isCosmeticOnly is TRUE (or candidate only edited README/markdown/configs):
   - Evidence confidence MUST be "weak" (< 25%).
   - Explain clearly that candidate only contributed to documentation/formatting, NOT the technical logic.
4. If isFork is TRUE and personalContribution is low (< 20%):
   - Evidence confidence MUST be "weak" (< 30%).
   - Explain that most code originated from upstream parent repository (${parentRepo || 'upstream'}).
5. If candidate modified core code files (e.g. model training, data pipeline, frontend components):
   - Evidence confidence is "strong" (75-95%) or "moderate" (40-74%).

Return JSON with:
- verifiedSkills: array of {
    name: string,
    confidence: number (0 to 100),
    evidenceLevel: 'strong' | 'moderate' | 'weak',
    reason: string
  }
- overallSummary: string (concise explanation for hiring/team-matching)
`;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              verifiedSkills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    confidence: { type: "number" },
                    evidenceLevel: { type: "string", enum: ["strong", "moderate", "weak"] },
                    reason: { type: "string" }
                  },
                  required: ["name", "confidence", "evidenceLevel", "reason"]
                }
              },
              overallSummary: { type: "string" }
            },
            required: ["verifiedSkills", "overallSummary"]
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      if (error.status === 404) continue;
      // If error occurs, continue to next model or fallback
      continue;
    }
  }

  // Heuristic verification fallback
  return verifySkillsFallback({
    repositoryName,
    languages,
    topics,
    isFork,
    parentRepo,
    userCommits,
    personalContribution,
    codeRatio,
    docRatio,
    isCosmeticOnly,
    modulesContributed
  });
}

/**
 * Deterministic heuristic skill verification fallback
 */
function verifySkillsFallback({
  repositoryName = "",
  languages = [],
  topics = [],
  isFork = false,
  parentRepo = null,
  userCommits = 0,
  personalContribution = 100,
  codeRatio = 0,
  docRatio = 0,
  isCosmeticOnly = false,
  modulesContributed = []
}) {
  const verifiedSkills = [];
  const candidateTech = [...new Set([...languages, ...topics])];

  // Case 1: Cosmetic / README only Loophole
  if (isCosmeticOnly || codeRatio < 15) {
    for (const tech of candidateTech.slice(0, 3)) {
      verifiedSkills.push({
        name: tech,
        confidence: 18,
        evidenceLevel: "weak",
        reason: `Candidate touched ${docRatio}% documentation/markdown files. No verified code contributions to ${tech} logic.`
      });
    }
    return {
      verifiedSkills,
      overallSummary: `Low technical evidence: contributions are limited to documentation/formatting with minimal code changes.`
    };
  }

  // Case 2: Low Contribution Fork Loophole
  if (isFork && personalContribution < 20) {
    for (const tech of candidateTech.slice(0, 3)) {
      verifiedSkills.push({
        name: tech,
        confidence: 22,
        evidenceLevel: "weak",
        reason: `Repository is forked from ${parentRepo || 'upstream'}. Candidate only authored ${personalContribution}% of commits.`
      });
    }
    return {
      verifiedSkills,
      overallSummary: `Low originality evidence: forked repository with ${personalContribution}% personal contribution.`
    };
  }

  // Case 3: Genuine Active Contributor
  const confidence = Math.min(95, Math.round(50 + (personalContribution * 0.25) + (codeRatio * 0.2)));
  const evidenceLevel = confidence >= 70 ? "strong" : "moderate";

  for (const tech of candidateTech.slice(0, 4)) {
    verifiedSkills.push({
      name: tech,
      confidence,
      evidenceLevel,
      reason: `Verified ${codeRatio}% code contributions across modules: ${modulesContributed.slice(0, 3).join(', ') || 'core'}.`
    });
  }

  return {
    verifiedSkills,
    overallSummary: `Verified ${evidenceLevel} evidence: candidate authored ${personalContribution}% of commits with high code concentration.`
  };
}

async function chatWithPlatformAI(userMessage, chatHistory = []) {
  const systemPrompt = `
You are the official AI Assistant for KEVIN (Knowledge Evaluation and Verification Interactive Network), a hackathon team-building platform.
Your ONLY purpose is to answer questions about the KEVIN platform, its features (AI Matcher, GitHub synchronization, Skill Verification, Team building, Hackathon directory), and how to use it.
If the user asks anything unrelated to KEVIN, hackathons, team building, or the platform features, you MUST politely refuse to answer and redirect them to asking about KEVIN.
Do not provide general coding help unless it's specifically about integrating with KEVIN's features.
Keep your answers concise, friendly, and helpful.
`;

  // Filter out the initial greeting to avoid 'model' -> 'model' conflict
  // and exclude the very last user message from history because we append it manually.
  const previousHistory = chatHistory.filter((msg, idx) => 
    idx !== 0 && idx !== chatHistory.length - 1
  );

  const formattedHistory = previousHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Understood. I will strictly act as the KEVIN platform assistant. Hi there! I am your KEVIN assistant. Ask me anything about the platform, AI Matcher, or GitHub integrations!' }] },
          ...formattedHistory,
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      });

      return response.text;
    } catch (error) {
      if (error.status === 404) continue;
      continue; // Try next model
    }
  }

  return "I'm currently experiencing high traffic. Please try asking your question again in a moment!";
}

module.exports = {
  analyzeProject,
  verifySkillsFromContributions,
  verifySkillsFallback,
  chatWithPlatformAI
};