import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Subject, Difficulty, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestions = async (
  subject: Subject,
  difficulty: Difficulty,
  count: number 
): Promise<Question[]> => {
  const modelName = "gemini-3-flash-preview";

  let prompt = "";
  
  if (subject === Subject.ARITHMETIC) {
    prompt = `
      You are 'Shubham AptiMaster', a strict examiner for top-tier Indian Government Competitive Exams.
      Generate exactly ${count} unique Arithmetic questions. Difficulty: ${difficulty}.
      Distribution: Percentage, Average, Ratio, Partnership, P&L, Unitary, Time/Work, Time/Distance, Simplification, DI, Unit, Area, Interest, LCM/HCF, Ages.
      Context: Concepts must be tricky but solvable using Shubham Shortcuts.
    `;
  } else if (subject === Subject.REASONING) {
    prompt = `
      You are 'Shubham AptiMaster'. Generate exactly ${count} Reasoning questions. Difficulty: ${difficulty}.
      Distribution: Verbal (Syllogism, Blood Relations, Coding) and Non-Verbal (SVG figures for 5-8 questions).
    `;
  } else if (subject === Subject.THINKING) {
    prompt = `
      You are 'Shubham AptiMaster'. Generate exactly 2 high-level Cognitive Thinking questions. 
      Difficulty: ${difficulty}.
      
      Structure:
      Question 1: Problem Solving (Situation-based Mock). A real-world administrative or ethical dilemma found in Civil Services or Management exams.
      Question 2: Critical Thinking. Logic-heavy analysis involving assumptions, inferences, or strengthening/weakening arguments.
      
      Special Requirements:
      - For each question, provide a 'strategyRules' list (3-4 bullet points on HOW to approach this specific type of thinking problem).
      - For each question, provide 2 'hints' that guide the user without revealing the answer.
      - Ensure the situations are complex and require deep analytical power.
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
        systemInstruction: "You are a competitive exam setter. Output raw JSON only. Focus on strengthening cognition and analytical power."
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const questions = JSON.parse(jsonText) as Question[];
    return questions.map((q, index) => ({ ...q, id: index }));
  } catch (error) {
    console.error("GenAI Error:", error);
    throw new Error("Exam generation failed.");
  }
};