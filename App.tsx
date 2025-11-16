
import React, { useState, useEffect } from 'react';
import { MatchDetails, Player, SortResult, PlanTier, PLAN_LIMITS, UserAccount } from './types';
import { MatchSetup } from './components/MatchSetup';
import { PlayerForm } from './components/PlayerForm';
import { PlayerList } from './components/PlayerList';
import { TeamDisplay } from './components/TeamDisplay';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { ReminderModal } from './components/ReminderModal';
import { EditPlayerModal } from './components/EditPlayerModal';
import { NotificationToast, Notification } from './components/NotificationToast';
import { generateBalancedTeams, generateInviteMessage, generateReminderMessage } from './services/geminiService';
import { Trophy, Sparkles, MessageCircle, Loader2, LogOut, User, Crown, Bell } from 'lucide-react';

const DEFAULT_ADMIN: UserAccount = {
    id: 'admin-001',
    name: 'Administrador',
    email: 'admin@peladapro.com',
    password: 'admin123', // In production, use hashed passwords
    plan: PlanTier.PROFISSIONAL,
    role: 'admin'
};

const App: React.FC = () => {
  // --- AUTH & USER MANAGEMENT ---
  const [users, setUsers] = useState<UserAccount[]>(() => {
      try {
          const savedUsers = localStorage.getItem('pelada_users');
          return savedUsers ? JSON.parse(savedUsers) : [DEFAULT_ADMIN];
      } catch {
          return [DEFAULT_ADMIN];
      }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Check for existing session
  useEffect(() => {
    const savedSessionId = localStorage.getItem('pelada_session_id');
    if (savedSessionId) {
        const foundUser = users.find(u => u.id === savedSessionId);
        if (foundUser) {
            setCurrentUser(foundUser);
        }
    }
  }, []); 

  // Save users whenever they change
  useEffect(() => {
      localStorage.setItem('pelada_users', JSON.stringify(users));
  }, [users]);

  const handleLogin = (user: UserAccount) => {
    localStorage.setItem('pelada_session_id', user.id);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('pelada_session_id');
    setCurrentUser(null);
  };

  const handleAddUser = (newUser: UserAccount) => {
      setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
      if (confirm('Tem certeza que deseja excluir este usuário?')) {
          setUsers(prev => prev.filter(u => u.id !== userId));
      }
  };


  // --- APP LOGIC (MATCH) ---
  const getStorageKey = (key: string) => currentUser ? `${key}_${currentUser.id}` : key;

  // State for Match Details
  const [matchDetails, setMatchDetails] = useState<MatchDetails>({
    date: '', time: '', location: '', organizerPhone: '', teamsCount: 2
  });

  // State for Players
  const [players, setPlayers] = useState<Player[]>([]);

  // State for Editing
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // State for Notifications
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
      setNotification({ message, type, id: Date.now() });
  };

  // Load user-specific data
  useEffect(() => {
      if (currentUser && currentUser.role !== 'admin') {
          try {
            const savedMatch = localStorage.getItem(getStorageKey('pelada_match_details'));
            if (savedMatch) setMatchDetails(JSON.parse(savedMatch));
            else setMatchDetails({ date: '', time: '', location: '', organizerPhone: '', teamsCount: 2 });

            const savedPlayers = localStorage.getItem(getStorageKey('pelada_players'));
            if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
            else setPlayers([]);

            setSortResult(null);
          } catch (e) {
              console.error("Error loading user data", e);
          }
      }
  }, [currentUser]);

  // Persist Data
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
        localStorage.setItem(getStorageKey('pelada_match_details'), JSON.stringify(matchDetails));
    }
  }, [matchDetails, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
        localStorage.setItem(getStorageKey('pelada_players'), JSON.stringify(players));
    }
  }, [players, currentUser]);

  // Logic for Reminders (Is the match tomorrow?)
  const [isMatchTomorrow, setIsMatchTomorrow] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  useEffect(() => {
    if (matchDetails.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Correctly parse "YYYY-MM-DD" to local time
        const [year, month, day] = matchDetails.date.split('-').map(Number);
        const matchDate = new Date(year, month - 1, day);
        
        const diffTime = matchDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            setIsMatchTomorrow(true);
        } else {
            setIsMatchTomorrow(false);
        }
    }
  }, [matchDetails.date]);


  // State for Generated Teams
  const [sortResult, setSortResult] = useState<SortResult | null>(null);
  
  // Loading States
  const [isSorting, setIsSorting] = useState(false);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  // Handlers
  const handleAddPlayer = (player: Player) => {
    if (!currentUser) return;
    const maxPlayers = PLAN_LIMITS[currentUser.plan];
    
    if (players.length >= maxPlayers) {
      alert(`Seu plano ${currentUser.plan} permite apenas ${maxPlayers} jogadores. Contate o administrador para upgrade.`);
      return;
    }
    setPlayers(prev => [...prev, player]);
    showNotification(`${player.name} adicionado com sucesso!`);
  };

  const handleEditPlayer = (player: Player) => {
      setEditingPlayer(player);
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
      setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
      showNotification("Jogador atualizado com sucesso!");
      setEditingPlayer(null);
  };

  const handleRemovePlayer = (id: string) => {
    if(confirm('Tem certeza que deseja remover este jogador?')) {
        setPlayers(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleToggleConfirm = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

    const newStatus = !player.confirmed;
    
    setPlayers(prev => prev.map(p => 
        p.id === id ? { ...p, confirmed: newStatus } : p
    ));

    if (newStatus) {
        showNotification(`${player.name} confirmou presença! ⚽`, 'success');
    }
  };

  const handleSortTeams = async () => {
    const confirmedPlayers = players.filter(p => p.confirmed);
    if (confirmedPlayers.length < matchDetails.teamsCount * 2) {
      alert(`Precisa de pelo menos ${matchDetails.teamsCount * 2} jogadores confirmados para sortear.`);
      return;
    }

    setIsSorting(true);
    try {
      const result = await generateBalancedTeams(confirmedPlayers, matchDetails.teamsCount);
      setSortResult(result);
      showNotification("Times sorteados com sucesso!", 'success');
    } catch (error) {
      console.error("Erro ao sortear:", error);
      alert("Erro ao conectar com a IA para sorteio. Verifique sua chave de API ou tente novamente.");
    } finally {
      setIsSorting(false);
    }
  };

  const handleGenerateInvite = async () => {
    if (!matchDetails.date || !matchDetails.time || !matchDetails.location) {
      alert("Preencha os detalhes da partida primeiro!");
      return;
    }
    
    setIsGeneratingInvite(true);
    try {
        const message = await generateInviteMessage(matchDetails);
        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
    } catch (error) {
        console.error(error);
        alert("Erro ao gerar convite.");
    } finally {
        setIsGeneratingInvite(false);
    }
  };

  const handleOpenReminders = () => {
      setIsReminderModalOpen(true);
  };

  // --- RENDER ---

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
      return <AdminDashboard users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} onLogout={handleLogout} />;
  }

  const getPlanBadgeColor = () => {
      switch(currentUser.plan) {
          case PlanTier.PROFISSIONAL: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
          case PlanTier.AMADOR: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
          default: return 'bg-slate-700 text-slate-400 border-slate-600';
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />

      {/* Edit Player Modal */}
      {editingPlayer && (
          <EditPlayerModal 
            isOpen={!!editingPlayer}
            onClose={() => setEditingPlayer(null)}
            player={editingPlayer}
            onSave={handleUpdatePlayer}
          />
      )}

      {/* Reminder Modal */}
      {isReminderModalOpen && (
        <ReminderModal 
            isOpen={isReminderModalOpen}
            onClose={() => setIsReminderModalOpen(false)}
            players={players.filter(p => p.confirmed)}
            onGenerateMessage={() => generateReminderMessage(matchDetails, players.filter(p => p.confirmed))}
        />
      )}

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-grass-500 to-grass-700 rounded-lg flex items-center justify-center shadow-lg shadow-grass-500/20">
                    <Trophy className="text-white w-6 h-6" />
                </div>
                <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-white leading-none">PeladaPro AI</h1>
                    <span className="text-xs text-grass-400 font-medium">Organizador Inteligente</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 {/* Plan Badge */}
                 <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded uppercase border ${getPlanBadgeColor()}`}>
                    {currentUser.plan === PlanTier.PROFISSIONAL && <Crown size={12} />}
                    {currentUser.plan}
                 </div>

                 <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700">
                    <User size={14} />
                    {currentUser.name}
                 </div>
                 
                 {/* Reminder Bell */}
                 <button
                    onClick={handleOpenReminders}
                    className={`relative px-3 py-2 rounded-lg flex items-center justify-center transition-colors border ${
                        isMatchTomorrow 
                        ? 'bg-orange-900/30 text-orange-400 border-orange-500/50 animate-pulse shadow-lg shadow-orange-500/10' 
                        : 'bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600'
                    }`}
                    title={isMatchTomorrow ? "Enviar Lembretes (Jogo Amanhã!)" : "Lembretes"}
                 >
                    <Bell size={16} className={isMatchTomorrow ? 'fill-orange-400' : ''} />
                    {isMatchTomorrow && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                    )}
                 </button>

                 <button
                    onClick={handleGenerateInvite}
                    disabled={isGeneratingInvite}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors border border-slate-600"
                    title="Criar Convite WhatsApp"
                 >
                    {isGeneratingInvite ? <Loader2 className="animate-spin w-4 h-4" /> : <MessageCircle className="w-4 h-4 text-green-400" />}
                    <span className="hidden sm:inline">Convite</span>
                 </button>

                 <button
                    onClick={handleLogout}
                    className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                    title="Sair"
                 >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Sair</span>
                 </button>
            </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Top Grid: Details and Add Player */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
                <MatchSetup details={matchDetails} onChange={setMatchDetails} />
                
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl border border-indigo-500/30">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        Sorteio IA
                    </h3>
                    <p className="text-sm text-indigo-200 mb-4">
                        Use o Gemini para equilibrar os times baseados em nível, posição e tipo de jogador.
                    </p>
                    <button
                        onClick={handleSortTeams}
                        disabled={isSorting}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isSorting ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                Analisando Jogadores...
                            </>
                        ) : (
                            <>
                                <Trophy className="w-5 h-5" />
                                Sortear Times Agora
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="lg:col-span-2">
                <PlayerForm onAddPlayer={handleAddPlayer} />
                <PlayerList 
                    players={players} 
                    maxPlayers={PLAN_LIMITS[currentUser.plan]}
                    onRemove={handleRemovePlayer} 
                    onToggleConfirm={handleToggleConfirm}
                    onEdit={handleEditPlayer}
                />
            </div>
        </div>

        {/* Results Section */}
        {sortResult && (
            <div id="results" className="scroll-mt-24">
                <div className="border-t border-slate-700 pt-8">
                     <TeamDisplay teams={sortResult.teams} analysis={sortResult.analysis} />
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;