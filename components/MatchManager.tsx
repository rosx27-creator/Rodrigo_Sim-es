
import React, { useState } from 'react';
import { Match, MatchDetails } from '../types';
import { Calendar, Plus, Copy, Trash2, X, ChevronRight, CalendarDays, CheckCircle } from 'lucide-react';

interface MatchManagerProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  activeMatchId: string;
  onSelectMatch: (id: string) => void;
  onCreateMatch: () => void;
  onDeleteMatch: (id: string) => void;
  onReplicateMatch: (months: number) => void;
}

export const MatchManager: React.FC<MatchManagerProps> = ({
  isOpen,
  onClose,
  matches,
  activeMatchId,
  onSelectMatch,
  onCreateMatch,
  onDeleteMatch,
  onReplicateMatch
}) => {
  const [showReplicateOptions, setShowReplicateOptions] = useState(false);

  if (!isOpen) return null;

  // Sort matches by date
  const sortedMatches = [...matches].sort((a, b) => {
    if (!a.details.date) return 1;
    if (!b.details.date) return -1;
    return new Date(a.details.date).getTime() - new Date(b.details.date).getTime();
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Data não definida';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CalendarDays className="text-grass-400" /> Agenda de Partidas
            </h2>
            <p className="text-slate-400 text-sm mt-1">Gerencie seus jogos e replique agendamentos</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            {/* Sidebar / Action Area */}
            <div className="p-6 bg-slate-900/50 border-r border-slate-700 md:w-1/3 flex flex-col gap-4 overflow-y-auto">
                <button
                    onClick={onCreateMatch}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus size={18} /> Nova Partida
                </button>

                <div className="border-t border-slate-700 my-2"></div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        <Copy size={14} /> Replicar Atual
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                        Cria jogos semanais futuros copiando a lista de jogadores (sem confirmação).
                    </p>
                    
                    {!showReplicateOptions ? (
                        <button 
                            onClick={() => setShowReplicateOptions(true)}
                            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded border border-slate-600 transition-colors"
                        >
                            Configurar Replicação
                        </button>
                    ) : (
                        <div className="space-y-2 animate-fade-in">
                            {[1, 2, 3, 4, 5, 6].map(months => (
                                <button
                                    key={months}
                                    onClick={() => {
                                        if(confirm(`Confirmar criação de jogos semanais pelos próximos ${months} meses?`)) {
                                            onReplicateMatch(months);
                                            setShowReplicateOptions(false);
                                        }
                                    }}
                                    className="w-full py-2 px-3 text-left text-xs text-slate-300 hover:bg-slate-700 rounded flex justify-between items-center transition-colors"
                                >
                                    <span>Por {months} {months === 1 ? 'Mês' : 'Meses'}</span>
                                    <ChevronRight size={12} />
                                </button>
                            ))}
                            <button 
                                onClick={() => setShowReplicateOptions(false)}
                                className="text-xs text-red-400 hover:text-red-300 w-full text-center mt-2 underline"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Match List */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-800">
                <h3 className="text-lg font-bold text-white mb-4">Seus Jogos ({matches.length})</h3>
                
                <div className="space-y-3">
                    {sortedMatches.map(match => {
                        const isActive = match.id === activeMatchId;
                        return (
                            <div 
                                key={match.id}
                                onClick={() => onSelectMatch(match.id)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                                    isActive 
                                    ? 'bg-grass-900/20 border-grass-500 shadow-md shadow-grass-900/20' 
                                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            isActive ? 'bg-grass-500 text-white' : 'bg-slate-800 text-slate-500'
                                        }`}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                {formatDate(match.details.date)}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
                                                <span>{getDayOfWeek(match.details.date)}</span>
                                                <span>•</span>
                                                <span>{match.details.time || '--:--'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400">Jogadores</div>
                                            <div className="font-bold text-slate-200">{match.players.length}</div>
                                        </div>
                                        {isActive && <CheckCircle size={20} className="text-grass-500" />}
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                                    <span className="text-xs text-slate-500 truncate max-w-[200px]">
                                        {match.details.location || 'Local não definido'}
                                    </span>
                                    
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteMatch(match.id);
                                        }}
                                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Excluir partida"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
