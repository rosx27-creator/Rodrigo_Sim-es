
import React, { useState, useEffect } from 'react';
import { Player, MatchDetails } from '../types';
import { MessageSquare, Send, X, Copy, Check, Loader2, Share2, Users } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'invite' | 'reminder';
  matchDetails: MatchDetails;
  players: Player[]; // For reminder list
  onGenerateMessage: () => Promise<string>;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  matchDetails,
  players, 
  onGenerateMessage 
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      onGenerateMessage()
        .then(text => setMessage(text))
        .catch(() => setMessage("Erro ao gerar mensagem. Tente novamente."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, onGenerateMessage]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareGroup = () => {
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {mode === 'invite' ? (
                <><Share2 className="text-grass-400" /> Criar Convite</>
            ) : (
                <><MessageSquare className="text-orange-400" /> Cobrar Presença</>
            )}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
           {/* Message Editor */}
           <div className="mb-6 space-y-2">
              <label className="text-sm text-slate-400 font-medium">
                  {mode === 'invite' ? 'Mensagem para o Grupo' : 'Mensagem de Cobrança'}
              </label>
              <div className="relative">
                {isLoading ? (
                    <div className="w-full h-40 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-slate-500 gap-2 border border-slate-700">
                        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" /> 
                        <span>Criando mensagem inteligente...</span>
                    </div>
                ) : (
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-40 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-sans text-sm leading-relaxed"
                    />
                )}
                {!isLoading && (
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors border border-slate-600"
                        title="Copiar texto"
                    >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                )}
              </div>
           </div>

           {/* Actions based on Mode */}
           {mode === 'invite' ? (
               <div className="flex flex-col gap-4">
                   <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-sm text-slate-400">
                       <p>📢 Clique no botão abaixo para abrir o WhatsApp e selecionar o grupo da pelada para enviar o convite.</p>
                   </div>
                   <button
                        onClick={handleShareGroup}
                        disabled={isLoading}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                   >
                       <Share2 className="w-5 h-5" />
                       Compartilhar no WhatsApp
                   </button>
               </div>
           ) : (
               <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} /> Jogadores ({players.length})
                    </h3>
                    <span className="text-xs text-slate-500">Clique para enviar individualmente</span>
                  </div>
                  
                  {players.length === 0 ? (
                      <p className="text-slate-500 text-center py-8 bg-slate-900/30 rounded-lg border border-slate-700 border-dashed">
                          Nenhum jogador listado para esta ação.
                      </p>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {players.map(player => (
                            <div key={player.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors group">
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-medium text-slate-200 truncate">{player.name}</span>
                                    <span className="text-xs text-slate-500">{player.phone || "Sem telefone"}</span>
                                </div>
                                {player.phone && (
                                    <a
                                        href={`https://wa.me/${player.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-slate-700 group-hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                                        title="Enviar Cobrança"
                                    >
                                        <Send size={16} />
                                    </a>
                                )}
                            </div>
                        ))}
                      </div>
                  )}
               </div>
           )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
            >
                Fechar
            </button>
        </div>

      </div>
    </div>
  );
};
