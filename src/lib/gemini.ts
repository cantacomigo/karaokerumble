import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface VideoMetadata {
  title: string;
  description: string;
  views?: string;
  likes?: string;
}

/**
 * Generates growth tips based on video performance and metadata
 */
export async function generateGrowthTips(metadata: VideoMetadata): Promise<string> {
  if (!apiKey) {
    return "API Key do Gemini não configurada. Por favor, adicione VITE_GEMINI_API_KEY ao seu arquivo .env.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Você é um coach vocal e especialista em produção musical. 
      Sua missão é ajudar usuários do sistema "Cante Comigo" a escolherem os melhores playbacks e melhorarem sua técnica vocal.
      Analise os seguintes metadados de vídeo e forneça 3 dicas práticas para aumentar o engajamento e visualizações.
      
      Título: ${metadata.title}
      Descrição: ${metadata.description}
      Visualizações Atuais: ${metadata.views || "0"}
      Likes Atuais: ${metadata.likes || "0"}
      
      Responda em Português brasileiro, de forma concisa e profissional, usando bullet points.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro ao gerar dicas com Gemini:", error);
    return "Não foi possível gerar dicas de crescimento no momento. Tente novamente mais tarde.";
  }
}

/**
 * Optimizes video title and description
 */
export async function optimizeMetadata(title: string, description: string): Promise<{ title: string, description: string }> {
  if (!apiKey) throw new Error("API Key do Gemini não encontrada");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Otimize o título e a descrição abaixo para categorizar esse playback corretamente no sistema "Cante Comigo". 
      Garanta que o tom e o estilo musical estejam claros.
      Retorne APENAS um objeto JSON com as chaves "title" e "description".
      
      Título Original: ${title}
      Descrição Original: ${description}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { title, description };
  } catch (error) {
    console.error("Erro ao otimizar metadados:", error);
    return { title, description };
  }
}
