
import { GoogleGenAI, Type } from "@google/genai";
import { Player, MatchDetails, SortResult } from "../types";

// Initialize Gemini client
// Note: In a real production app, this key should be proxied securely.
// Here we assume process.env.API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBalancedTeams = async (
  players: Player[],
  numberOfTeams: number
): Promise<SortResult> => {
  
  const model = "gemini-2.5-flash";

  const prompt = `
    Você é um técnico de futebol experiente e matemático.
    Sua tarefa é dividir a lista de jogadores fornecida em ${numberOfTeams} times EQUILIBRADOS.
    
    Critérios de equilíbrio:
    1. Nível técnico (level de 1 a 5): A média de habilidade dos times deve ser muito próxima.
    2. Posições: Distribua Goleiros uniformemente primeiro. Tente balancear Defesa, Meio e Ataque.
    3. Tipo (Efetivo/Convidado): Tente misturar convidados e efetivos para não criar "panelinhas", mas a prioridade é o equilíbrio técnico.
    
    Lista de Jogadores (JSON):
    ${JSON.stringify(players.map(p => ({ id: p.id, name: p.name, pos: p.position, lvl: p.level, type: p.type })))}
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      systemInstruction: "Retorne apenas JSON válido seguindo o schema. Seja rigoroso com o equilíbrio.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          teams: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Nome criativo para o time (ex: Time A, Coletes, Sem Colete)" },
                playerIds: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "IDs dos jogadores neste time" 
                },
                avgLevel: { type: Type.NUMBER, description: "Média de nível deste time" }
              },
              required: ["name", "playerIds", "avgLevel"]
            }
          },
          analysis: {
            type: Type.STRING,
            description: "Uma breve explicação de por que esses times estão equilibrados."
          }
        },
        required: ["teams", "analysis"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  // Map IDs back to full player objects
  const teams = data.teams.map((t: any) => ({
    name: t.name,
    players: t.playerIds.map((id: string) => players.find(p => p.id === id)!).filter(Boolean),
    stats: {
      avgLevel: t.avgLevel,
      totalPlayers: t.playerIds.length
    }
  }));

  return {
    teams,
    analysis: data.analysis
  };
};

export const generateInviteMessage = async (match: MatchDetails): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Crie uma mensagem curta, divertida e empolgante para enviar no grupo de WhatsApp da pelada.
    Detalhes:
    - Data: ${match.date}
    - Hora: ${match.time}
    - Local: ${match.location}
    
    A mensagem deve chamar a galera para confirmar presença clicando no link. Use emojis de futebol.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      maxOutputTokens: 200,
      temperature: 0.8
    }
  });

  return response.text || "Bora pra pelada! Confirme sua presença.";
};

export const generateReminderMessage = async (match: MatchDetails, players: Player[]): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const confirmedNames = players.map(p => p.name).join(", ");

  const prompt = `
    Crie uma mensagem curta e urgente (mas divertida) para lembrar o pessoal do jogo de amanhã.
    Detalhes:
    - Data: ${match.date}
    - Hora: ${match.time}
    - Local: ${match.location}
    
    Jogadores já confirmados: ${confirmedNames}
    
    O objetivo é fazer quem não confirmou se mexer. Use emojis.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      maxOutputTokens: 250,
      temperature: 0.8
    }
  });

  return response.text || "Galera, jogo amanhã! Bora confirmar!";
};
