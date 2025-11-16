import React from 'react';
import { Team, Position } from '../types';
import { Shield, Share2 } from 'lucide-react';

interface TeamDisplayProps {
  teams: Team[];
  analysis: string;
}

export const TeamDisplay: React.FC<TeamDisplayProps> = ({ teams, analysis }) => {
  
  const getShareText = () => {
      let text = `⚽ *Times Definidos - PeladaPro* ⚽\n\n`;
      teams.forEach(team => {
          text += `*${team.name}* (Média: ${team.stats.avgLevel.toFixed(1)})\n`;
          team.players.forEach(p => {
              text += `▫️ ${p.name} (${p.position})\n`;
          });
          text += `\n`;
      });
      text += `_Organizado por IA_ 🤖`;
      return encodeURIComponent(text);
  };

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-white">Times Sorteados</h2>
        <a 
            href={`https://wa.me/?text=${getShareText()}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-grass-400 hover:text-grass-300 transition-colors"
        >
            <Share2 size={16} /> Compartilhar no Zap
        </a>
      </div>
      
      {analysis && (
        <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-lg text-indigo-200 text-sm italic">
            🤖 <strong>Análise da IA:</strong> {analysis}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {teams.map((team, idx) => (
          <div key={idx} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
            <div className="bg-slate-900/80 p-4 border-b border-slate-700">
              <h3 className="text-xl font-bold text-grass-400">{team.name}</h3>
              <div className="flex justify-between mt-1 text-xs text-slate-400">
                <span>{team.stats.totalPlayers} jogadores</span>
                <span>Força: {team.stats.avgLevel.toFixed(1)}</span>
              </div>
            </div>
            <div className="p-2 flex-1">
                <ul className="space-y-1">
                    {team.players.map((player) => (
                        <li key={player.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-700/50">
                            <span className="text-slate-200 font-medium text-sm truncate max-w-[120px]">{player.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase text-slate-500 tracking-wider">{player.position}</span>
                                <span className="text-xs bg-slate-700 text-yellow-500 px-1.5 rounded font-bold">{player.level}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};