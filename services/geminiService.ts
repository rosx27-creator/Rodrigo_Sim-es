
import { GoogleGenAI } from "@google/genai";
import { Player, MatchDetails, SortResult, Team, Position } from "../types";

// Helper function to initialize AI only when needed.
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * SORTEIO MATEMÁTICO (SNAKE DRAFT)
 * Substitui a IA por um algoritmo determinístico que garante equilíbrio numérico.
 */
export const generateBalancedTeams = async (
  players: Player[],
  numberOfTeams: number
): Promise<SortResult> => {
  
  if (numberOfTeams < 2) numberOfTeams = 2;

  // 1. Inicializar os times vazios
  const teams: Team[] = Array.from({ length: numberOfTeams }, (_, i) => ({
    name: `Time ${i + 1}`,
    players: [],
    stats: { avgLevel: 0, totalPlayers: 0 }
  }));

  // 2. Separar Goleiros dos Jogadores de Linha
  const goalkeepers = players.filter(p => p.position === Position.GOLEIRO);
  const outfielders = players.filter(p => p.position !== Position.GOLEIRO);

  // 3. Função auxiliar para ordenar jogadores por Nível (Decrescente)
  const sortPlayers = (list: Player[]) => {
    return list.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level; // Maior nível primeiro
      return a.name.localeCompare(b.name);
    });
  };

  const sortedGKs = sortPlayers([...goalkeepers]);
  const sortedOutfielders = sortPlayers([...outfielders]);

  // 4. Distribuição de Goleiros
  sortedGKs.forEach((gk, index) => {
    const teamIndex = index % numberOfTeams;
    teams[teamIndex].players.push(gk);
  });

  // 5. Distribuição de Linha - Método "Snake"
  let teamIndex = 0;
  let direction = 1;

  sortedOutfielders.forEach((player) => {
    teams[teamIndex].players.push(player);
    teamIndex += direction;

    if (teamIndex >= numberOfTeams) {
      teamIndex = numberOfTeams - 1;
      direction = -1;
    } else if (teamIndex < 0) {
      teamIndex = 0;
      direction = 1;
    }
  });

  // 6. Estatísticas
  teams.forEach((team, i) => {
    team.name = `Time ${i + 1}`;
    const totalLevel = team.players.reduce((sum, p) => sum + p.level, 0);
    const count = team.players.length;
    team.stats = {
      avgLevel: count > 0 ? totalLevel / count : 0,
      totalPlayers: count
    };
  });

  return {
    teams,
    analysis: "Sorteio realizado utilizando o método matemático 'Snake Draft'. Jogadores ordenados por nível técnico e distribuídos alternadamente para garantir médias de habilidade idênticas."
  };
};

export const generateInviteMessage = async (match: MatchDetails): Promise<string> => {
  const cleanPhone = match.organizerPhone ? match.organizerPhone.replace(/\D/g, '') : '';
  const confirmLink = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Confirmo minha presença na pelada! ⚽")}`
    : "[Link Indisponível - Adicione o telefone do organizador]";

  // Fallback template in case AI fails
  const fallbackMessage = `⚽ *CONVITE OFICIAL - PELADAPRO* ⚽

📅 Data: ${match.date}
⏰ Hora: ${match.time}
📍 Local: ${match.location}

Bora jogar galera! Não fiquem de fora dessa.

👇 *Confirme sua presença no link abaixo:*
${confirmLink}`;

  try {
    const ai = getAI();
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Crie uma mensagem curta, divertida e empolgante para enviar no grupo de WhatsApp da pelada.
      
      Detalhes:
      - Data: ${match.date}
      - Hora: ${match.time}
      - Local: ${match.location}
      
      Instrução Obrigatória:
      Você DEVE incluir este link exato no final da mensagem para confirmação: ${confirmLink}
      
      A mensagem deve chamar a galera para clicar no link. Use emojis de futebol.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0.8
      }
    });

    return response.text || fallbackMessage;
  } catch (error) {
    console.error("Gemini API Error (Invite):", error);
    return fallbackMessage;
  }
};

export const generateReminderMessage = async (match: MatchDetails, players: Player[]): Promise<string> => {
  const confirmedNames = players.map(p => p.name).join(", ");
  
  const fallbackMessage = `⚠️ *LEMBRETE DE JOGO* ⚠️

Galera, é amanhã!

📅 Data: ${match.date}
⏰ Hora: ${match.time}
📍 Local: ${match.location}

Já confirmados: ${confirmedNames || "Ninguém ainda... Bora confirmar!"}

Quem ainda não confirmou, dá o sinal de vida! ⚽`;

  try {
    const ai = getAI();
    const model = "gemini-2.5-flash";
    
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
        maxOutputTokens: 300,
        temperature: 0.8
      }
    });

    return response.text || fallbackMessage;
  } catch (error) {
    console.error("Gemini API Error (Reminder):", error);
    return fallbackMessage;
  }
};
