import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { MessageSquare, Send, X, Copy, Check, Loader2 } from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onGenerateMessage: () => Promise<string>;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, players, onGenerateMessage }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      onGenerateMessage()
        .then(text => setMessage(text))
        .catch(() => setMessage("Olá! Não esqueça do jogo amanhã."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, onGenerateMessage]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-orange-400" /> Central de Cobrança
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
           {/* Message Editor */}
           <div className="mb-6 space-y-2">
              <label className="text-sm text-slate-400 font-medium">Mensagem do Lembrete (IA)</label>
              <div className="relative">
                {isLoading ? (
                    <div className="w-full h-32 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 gap-2">
                        <Loader2 className="animate-spin" /> Criando mensagem persuasiva...
                    </div>
                ) : (
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    />
                )}
                <button 
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors border border-slate-600"
                    title="Copiar texto"
                >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
           </div>

           {/* Player List */}
           <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
                Jogadores Confirmados ({players.length})
              </h3>
              
              {players.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">Ninguém confirmou ainda para cobrar.</p>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {players.map(player => (
                        <div key={player.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-200">{player.name}</span>
                                <span className="text-xs text-slate-500">{player.phone}</span>
                            </div>
                            {player.phone && (
                                <a
                                    href={`https://wa.me/${player.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-green-900/20"
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