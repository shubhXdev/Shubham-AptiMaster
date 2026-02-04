import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Subject, Difficulty, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Systematic Topic List for Serieswise Rotation
const ARITHMETIC_TOPICS = [
  "Percentage", "Profit and Loss", "Interest (SI/CI)", "Ratio & Proportion", 
  "Average", "Ages", "Partnership", "Time and Work", "Time and Distance", 
  "Simplification", "LCM and HCF", "Unitary Method", "Mensuration (Area/Volume)", 
  "Data Interpretation", "Number System (Unit Digit)"
];

export const generateQuestions = async (
  subject: Subject,
  difficulty: Difficulty,
  count: number,
  attemptCount: number // Added to drive serieswise rotation per attempt
): Promise<Question[]> => {
  const modelName = "gemini-3-flash-preview";
  
  // Use a random mission ID + attempt count to force total uniqueness per click
  const missionId = Math.random().toString(36).substring(7).toUpperCase();
  
  // Calculate starting topic for "Serieswise" rotation based on total attempts
  // This ensures that Attempt 1 starts with Topic A, Attempt 2 with Topic B, etc.
  const startTopicIndex = attemptCount % ARITHMETIC_TOPICS.length;
  const rotatedTopics = [
    ...ARITHMETIC_TOPICS.slice(startTopicIndex),
    ...ARITHMETIC_TOPICS.slice(0, startTopicIndex)
  ];

  let prompt = "";
  
  if (subject === Subject.ARITHMETIC) {
    prompt = `
      CURRENT MISSION: #${attemptCount + 1} | SESSION_ID: ${missionId}.
      You are 'Shubham AptiMaster'. Generate ${count} (16) UNIQUE Arithmetic questions.
      
      SERIESWISE ROTATION RULE:
      This is Attempt #${attemptCount + 1}. You must rotate the primary focus.
      Prioritize topics in this specific series for this attempt: ${rotatedTopics.join(", ")}.
      
      STRICT UNIQUENESS RULES:
      1. This is a NEW attempt. NEVER repeat scenarios, names, or values from previous generated sets.
      2. Use complex, realistic competitive exam values (avoid simple 10/20/50).
      3. Create fresh scenarios based on modern industry, trade, or governance.
      4. Ensure exactly one question from each of the rotated topics listed above to cover the syllabus systematically.
      5. The solution must be solvable in 30s using a 'Shubham Shortcut' logic explained in the explanation.
    `;
  } else if (subject === Subject.REASONING) {
    prompt = `
      CURRENT MISSION: #${attemptCount + 1} | SESSION_ID: ${missionId}.
      Generate ${count} (25) Reasoning questions. Difficulty: ${difficulty}.
      Include 8 Non-Verbal questions with distinct SVG figures.
      Change the logic patterns entirely for this attempt. Vary coding logic, blood relation complexity, and seating arrangement constraints.
    `;
  } else if (subject === Subject.THINKING) {
    prompt = `
      CURRENT MISSION: #${attemptCount + 1} | SESSION_ID: ${missionId}.
      Generate 2 ELITE Cognitive Power questions.
      
      QUESTION 1 (Situation Mock): 
      Provide a fresh administrative dilemma. The user must analyze 4 possible actions.
      
      QUESTION 2 (Critical Thinking): 
      A complex logical argument or scientific hypothesis. The user must identify the hidden assumption or weakening fact.
      
      REQUIRED:
      - 'strategyRules': 3 specific logical steps to decode this type of problem.
      - 'hints': 2 subtle nudges that encourage 'lateral thinking' without giving away the answer.
    `;
  }

  const questionSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        topic: { type: Type.STRING },
        text: { type: Type.STRING },
        figureSVG: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING },
        hints: { type: Type.ARRAY, items: { type: Type.STRING } },
        strategyRules: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["id", "text", "options", "correctAnswerIndex", "explanation", "topic"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        systemInstruction: `You are 'Shubham AptiMaster', a high-stakes competitive exam setter. 
        Mission context: Attempt #${attemptCount + 1}. 
        Your absolute priority is NO REPETITION. Every 'Mission Start' click must feel like a brand-new, unseen exam paper.
        For Arithmetic, follow the serieswise rotation strictly.`
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const questions = JSON.parse(jsonText) as Question[];
    return questions.map((q, index) => ({ ...q, id: index }));
  } catch (error) {
    console.error("GenAI Error:", error);
    throw new Error("Failed to construct the New Mission. Please retry.");
  }
};