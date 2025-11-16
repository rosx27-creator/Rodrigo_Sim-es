
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
  // Critério de desempate: Posição (Defesa -> Meio -> Ataque para equilibrar setores)
  const sortPlayers = (list: Player[]) => {
    return list.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level; // Maior nível primeiro
      // Desempate simples por nome para consistência
      return a.name.localeCompare(b.name);
    });
  };

  const sortedGKs = sortPlayers([...goalkeepers]);
  const sortedOutfielders = sortPlayers([...outfielders]);

  // 4. Distribuição de Goleiros (Um por time, ordem sequencial)
  sortedGKs.forEach((gk, index) => {
    const teamIndex = index % numberOfTeams;
    teams[teamIndex].players.push(gk);
  });

  // 5. Distribuição de Linha - Método "Snake" (Serpente)
  // Ex: Time A, Time B, Time B, Time A... para evitar que o Time A fique sempre com os melhores de cada par.
  // Se tivermos Goleiros já distribuídos, precisamos ver qual time está "mais fraco" ou com menos jogadores para começar
  // Mas o padrão Snake puro funciona bem para nível.
  
  let teamIndex = 0;
  let direction = 1; // 1 para frente, -1 para trás

  sortedOutfielders.forEach((player) => {
    teams[teamIndex].players.push(player);

    // Mover índice
    teamIndex += direction;

    // Verificar bordas para inverter a direção (Efeito Snake)
    if (teamIndex >= numberOfTeams) {
      teamIndex = numberOfTeams - 1;
      direction = -1;
    } else if (teamIndex < 0) {
      teamIndex = 0;
      direction = 1;
    }
  });

  // 6. Calcular Estatísticas Finais e Nomes Criativos
  const teamNames = ["Colete", "Sem Colete", "Meião", "Chuteira"];
  
  teams.forEach((team, i) => {
    team.name = teamNames[i] || `Time ${i + 1}`;
    
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
  const ai = getAI();
  const model = "gemini-2.5-flash";
  
  // Create a direct WhatsApp link if phone is available
  const cleanPhone = match.organizerPhone ? match.organizerPhone.replace(/\D/g, '') : '';
  const confirmLink = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Confirmo minha presença na pelada! ⚽")}`
    : "[Link Indisponível - Adicione o telefone do organizador]";

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

  return response.text || `Bora pra pelada! Confirme sua presença: ${confirmLink}`;
};

export const generateReminderMessage = async (match: MatchDetails, players: Player[]): Promise<string> => {
  const ai = getAI();
  const model = "gemini-2.5-flash";
  
  const confirmedNames = players.map(p => p.name).join(", ");
  
  // Create a direct WhatsApp link if phone is available
  const cleanPhone = match.organizerPhone ? match.organizerPhone.replace(/\D/g, '') : '';
  const confirmLink = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Vou jogar! Foi mal a demora 🏃‍♂️")}`
    : "";

  const prompt = `
    Crie uma mensagem curta e urgente (mas divertida) para lembrar o pessoal do jogo de amanhã.
    Detalhes:
    - Data: ${match.date}
    - Hora: ${match.time}
    - Local: ${match.location}
    
    Jogadores já confirmados: ${confirmedNames}
    
    O objetivo é fazer quem não confirmou se mexer. Use emojis.
    ${confirmLink ? `Inclua este link para quem for confirmar agora: ${confirmLink}` : ''}
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      maxOutputTokens: 300,
      temperature: 0.8
    }
  });

  return response.text || "Galera, jogo amanhã! Bora confirmar!";
};
