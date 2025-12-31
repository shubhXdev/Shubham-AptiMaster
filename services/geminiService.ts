import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Subject, Difficulty, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestions = async (
  subject: Subject,
  difficulty: Difficulty,
  count: number // Arithmetic: 12, Reasoning: 25
): Promise<Question[]> => {
  const modelName = "gemini-3-flash-preview";

  let prompt = "";
  
  if (subject === Subject.ARITHMETIC) {
    prompt = `
      You are 'Shubham AptiMaster', a strict examiner for top-tier Indian Government Competitive Exams (SSC CGL, IBPS PO, UPSC CSAT).
      Generate exactly ${count} (12) unique, high-quality Arithmetic questions.
      Difficulty: ${difficulty}.
      
      MANDATORY TOPIC DISTRIBUTION (1 Question from each, fill remaining with high-weightage topics like DI or Simplification):
      1. Percentage
      2. Average
      3. Ratio & Proportion
      4. Partnership
      5. Profit and Loss
      6. Unitary Method
      7. Time and Work
      8. Time and Distance
      9. Simplification
      10. Data Interpretation (Create a text-based Caselet or simple tabular data in the question text).

      Context: Questions must be conceptually tricky but solvable within 30-45 seconds using shortcuts.
      Do not use complex LaTeX. Use plain text.
    `;
  } else {
    prompt = `
      You are 'Shubham AptiMaster', a strict examiner for Indian Government Exams.
      Generate exactly ${count} (25) unique Reasoning questions.
      Difficulty: ${difficulty}.
      
      MANDATORY RULES:
      1. **Topic Mix**: Include both Verbal (Syllogism, Blood Relations, Coding-Decoding) and **Non-Verbal** (Series, Analogies, Odd One Out, Mirror Images).
      2. **Non-Verbal Questions (Important)**: For at least 5-8 questions (Series, Figure Counting, Mirror Images), you MUST provide a visual representation. 
         - Since you are a text AI, you must generate a **clean, simple SVG code string** in the 'figureSVG' field.
         - The SVG should draw the 'Problem Figures' and the 'Answer Figures' (labeled A, B, C, D) inside one canvas.
         - Use white or light-colored strokes (stroke="currentColor" or stroke="#e4e4e7") suitable for a dark background.
         - If a question has a figure, the 'options' array should simply be ["Figure A", "Figure B", "Figure C", "Figure D"].
      3. **Uniqueness**: Do not repeat logic consecutively.
      
      Context: Solvable within 30 seconds avg.
    `;
  }

  const questionSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        topic: { type: Type.STRING, description: "The specific topic of the question" },
        text: { type: Type.STRING, description: "The question text. For non-verbal, say 'Study the figure below and select the correct option:'" },
        figureSVG: { 
          type: Type.STRING, 
          description: "Optional. A complete, valid <svg> string for non-verbal reasoning questions. Must include viewBox. Stroke colors should be light/white." 
        },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "An array of 4 possible answers. For non-verbal, use ['A', 'B', 'C', 'D']"
        },
        correctAnswerIndex: { 
          type: Type.INTEGER, 
          description: "The index (0-3) of the correct answer" 
        },
        explanation: { 
          type: Type.STRING, 
          description: "Detailed step-by-step solution using short-cut methods suitable for exams." 
        }
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
        systemInstruction: "You are a competitive exam setter. Output raw JSON only. For non-verbal reasoning, ensure SVGs are valid and visible on dark backgrounds."
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const questions = JSON.parse(jsonText) as Question[];
    
    return questions.map((q, index) => ({
      ...q,
      id: index // Re-index to ensure safety
    }));

  } catch (error) {
    console.error("GenAI Error:", error);
    throw new Error("Exam generation failed. Please try again.");
  }
};
