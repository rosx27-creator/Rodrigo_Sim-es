
import React from 'react';
import { Player, PlayerType, Position } from '../types';
import { Trash2, User, UserCheck, Star, Shield, PersonStanding, Goal, Footprints } from 'lucide-react';

interface PlayerListProps {
  players: Player[];
  maxPlayers: number;
  onRemove: (id: string) => void;
  onToggleConfirm: (id: string) => void;
}

const PositionIcon = ({ position }: { position: Position }) => {
    switch(position) {
        case Position.GOLEIRO: return <Shield size={14} className="text-yellow-500" />;
        case Position.ZAGUEIRO: return <User size={14} className="text-blue-400" />;
        case Position.MEIO: return <Footprints size={14} className="text-green-400" />;
        case Position.ATACANTE: return <Goal size={14} className="text-red-400" />;
        default: return <User size={14} />;
    }
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, maxPlayers, onRemove, onToggleConfirm }) => {
  const isLimitReached = players.length >= maxPlayers;

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 shrink-0">
        <h3 className="text-lg font-bold text-white">Jogadores Confirmados</h3>
        <div className="flex items-center gap-2">
            <span className={`text-sm px-2 py-1 rounded border ${isLimitReached ? 'bg-red-900/30 border-red-500 text-red-200' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>
            Total: {players.length} / {maxPlayers}
            </span>
        </div>
      </div>
      
      {players.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          Nenhum jogador adicionado ainda.
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10 shadow-md">
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-700">
                <th className="p-4 bg-slate-900/95">Nome</th>
                <th className="p-4 bg-slate-900/95">Posição</th>
                <th className="p-4 bg-slate-900/95">Nível</th>
                <th className="p-4 bg-slate-900/95">Tipo</th>
                <th className="p-4 bg-slate-900/95">Status</th>
                <th className="p-4 text-right bg-slate-900/95">Ações</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group">
                  <td className="p-4">
                    <div className="font-medium text-white">{player.name}</div>
                    <div className="text-xs text-slate-500">{player.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <PositionIcon position={player.position} />
                        {player.position}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex">
                        {Array.from({length: player.level}).map((_, i) => (
                             <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />
                        ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${player.type === PlayerType.EFETIVO ? 'bg-indigo-900 text-indigo-300' : 'bg-orange-900 text-orange-300'}`}>
                        {player.type}
                    </span>
                  </td>
                  <td className="p-4">
                     <button 
                        onClick={() => onToggleConfirm(player.id)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-all ${
                            player.confirmed 
                            ? 'border-grass-500 text-grass-400 bg-grass-900/20' 
                            : 'border-slate-600 text-slate-500 hover:border-slate-400'
                        }`}
                     >
                        {player.confirmed ? <UserCheck size={12} /> : <PersonStanding size={12} />}
                        {player.confirmed ? 'Confirmado' : 'Pendente'}
                     </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {player.phone && (
                             <a 
                                href={`https://wa.me/${player.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-grass-400 hover:bg-grass-900/20 rounded-lg transition-colors"
                                title="Enviar mensagem"
                             >
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                             </a>
                        )}
                        <button
                            onClick={() => onRemove(player.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
