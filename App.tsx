import React, { useState, useEffect } from 'react';
import { MatchDetails, Player, SortResult, PlanTier, PLAN_LIMITS, UserAccount, Match } from './types';
import { MatchSetup } from './components/MatchSetup';
import { PlayerForm } from './components/PlayerForm';
import { PlayerList } from './components/PlayerList';
import { TeamDisplay } from './components/TeamDisplay';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { WhatsAppModal } from './components/WhatsAppModal';
import { EditPlayerModal } from './components/EditPlayerModal';
import { ImportListModal } from './components/ImportListModal';
import { MatchManager } from './components/MatchManager';
import { NotificationToast, Notification } from './components/NotificationToast';
import { generateBalancedTeams, generateInviteMessage, generateReminderMessage } from './services/geminiService';
import { Trophy, MessageCircle, Loader2, LogOut, User, Crown, Bell, Calculator, CalendarDays } from 'lucide-react';

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

  // Logic to restore database from file
  const handleRestoreDatabase = (backupData: any) => {
    try {
        // 1. Restore Users
        if (backupData.users && Array.isArray(backupData.users)) {
            setUsers(backupData.users);
            localStorage.setItem('pelada_users', JSON.stringify(backupData.users));
        }
        
        // 2. Restore App Data (Matches, etc)
        if (backupData.appData) {
            Object.entries(backupData.appData).forEach(([key, value]) => {
                // Security check: only restore app specific keys
                if (key.startsWith('pelada_')) {
                     localStorage.setItem(key, value as string);
                }
            });
        }
        
        alert('Backup restaurado com sucesso! O sistema será reiniciado para aplicar as alterações.');
        window.location.reload();
    } catch (error) {
        console.error("Restore error:", error);
        alert('Erro ao processar o arquivo de backup. Verifique se o arquivo é válido.');
    }
  };


  // --- APP LOGIC (MATCH MANAGEMENT) ---
  const getStorageKey = (key: string) => currentUser ? `${key}_${currentUser.id}` : key;

  // State for All Matches
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string>('');
  const [isMatchManagerOpen, setIsMatchManagerOpen] = useState(false);

  // Load user-specific data and migrate if necessary
  useEffect(() => {
      if (currentUser && currentUser.role !== 'admin') {
          try {
            const savedMatches = localStorage.getItem(getStorageKey('pelada_matches'));
            
            if (savedMatches) {
                const parsedMatches = JSON.parse(savedMatches);
                setMatches(parsedMatches);
                // Select most recent or first match
                if (parsedMatches.length > 0) {
                    const sorted = [...parsedMatches].sort((a: Match, b: Match) => b.createdAt - a.createdAt);
                    setActiveMatchId(sorted[0].id);
                }
            } else {
                // Migration Logic: Check for old single-match data
                const oldMatchDetails = localStorage.getItem(getStorageKey('pelada_match_details'));
                const oldPlayers = localStorage.getItem(getStorageKey('pelada_players'));

                if (oldMatchDetails) {
                    const details = JSON.parse(oldMatchDetails);
                    const players = oldPlayers ? JSON.parse(oldPlayers) : [];
                    const newId = crypto.randomUUID();
                    
                    const initialMatch: Match = {
                        id: newId,
                        details,
                        players,
                        createdAt: Date.now()
                    };
                    setMatches([initialMatch]);
                    setActiveMatchId(newId);
                } else {
                    // No data at all, create blank match
                    createNewMatch();
                }
            }
          } catch (e) {
              console.error("Error loading user data", e);
              createNewMatch();
          }
      }
  }, [currentUser]);

  // Persist Data
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && matches.length > 0) {
        localStorage.setItem(getStorageKey('pelada_matches'), JSON.stringify(matches));
    }
  }, [matches, currentUser]);

  // Helper to create a new blank match
  const createNewMatch = () => {
      const newId = crypto.randomUUID();
      const newMatch: Match = {
          id: newId,
          details: { date: '', time: '', location: '', organizerPhone: '', teamsCount: 2 },
          players: [],
          createdAt: Date.now()
      };
      setMatches(prev => [...prev, newMatch]);
      setActiveMatchId(newId);
      return newId;
  };

  // Get Active Match Data safely
  const activeMatch = matches.find(m => m.id === activeMatchId) || matches[0] || {
      id: 'temp', details: { date: '', time: '', location: '', organizerPhone: '', teamsCount: 2 }, players: [], createdAt: 0
  };

  // Update Active Match Helpers
  const updateActiveMatchDetails = (newDetails: MatchDetails) => {
      setMatches(prev => prev.map(m => m.id === activeMatchId ? { ...m, details: newDetails } : m));
  };

  const updateActiveMatchPlayers = (newPlayers: Player[]) => {
      setMatches(prev => prev.map(m => m.id === activeMatchId ? { ...m, players: newPlayers } : m));
  };

  const handleDeleteMatch = (id: string) => {
      if (matches.length <= 1) {
          alert("Você precisa ter pelo menos uma partida.");
          return;
      }
      if (confirm("Tem certeza que deseja excluir esta partida?")) {
          const newMatches = matches.filter(m => m.id !== id);
          setMatches(newMatches);
          if (activeMatchId === id) {
              setActiveMatchId(newMatches[0].id);
          }
      }
  };

  const handleReplicateMatch = (months: number) => {
      if (!activeMatch.details.date) {
          alert("Defina uma data para a partida atual antes de replicar.");
          return;
      }

      const startDate = new Date(activeMatch.details.date);
      const newMatches: Match[] = [];
      const weeksToCreate = months * 4; // Approx

      for (let i = 1; i <= weeksToCreate; i++) {
          const nextDate = new Date(startDate);
          nextDate.setDate(startDate.getDate() + (i * 7)); // Add 7 days per week

          const dateStr = nextDate.toISOString().split('T')[0]; // YYYY-MM-DD

          // Clone players but reset confirmation
          const clonedPlayers = activeMatch.players.map(p => ({
              ...p,
              confirmed: false
          }));

          newMatches.push({
              id: crypto.randomUUID(),
              details: {
                  ...activeMatch.details,
                  date: dateStr
              },
              players: clonedPlayers,
              createdAt: Date.now() + i
          });
      }

      setMatches(prev => [...prev, ...newMatches]);
      showNotification(`${newMatches.length} novas partidas criadas com sucesso!`, 'success');
  };

  // --- UI STATE ---
  
  // State for Editing
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  // State for Import
  const [importModalOpen, setImportModalOpen] = useState(false);

  // State for Notifications
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
      setNotification({ message, type, id: Date.now() });
  };

  // Logic for Reminders (Is the match tomorrow?)
  const [isMatchTomorrow, setIsMatchTomorrow] = useState(false);
  
  // Unified WhatsApp Modal State
  const [whatsAppModal, setWhatsAppModal] = useState<{
    isOpen: boolean;
    mode: 'invite' | 'reminder';
  }>({ isOpen: false, mode: 'invite' });

  useEffect(() => {
    if (activeMatch.details.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Correctly parse "YYYY-MM-DD" to local time
        const [year, month, day] = activeMatch.details.date.split('-').map(Number);
        const matchDate = new Date(year, month - 1, day);
        
        const diffTime = matchDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            setIsMatchTomorrow(true);
        } else {
            setIsMatchTomorrow(false);
        }
    }
  }, [activeMatch.details.date]);


  // State for Generated Teams
  const [sortResult, setSortResult] = useState<SortResult | null>(null);
  const [isSorting, setIsSorting] = useState(false);

  // Handlers
  const handleAddPlayer = (player: Player) => {
    if (!currentUser) return;
    const maxPlayers = PLAN_LIMITS[currentUser.plan];
    
    if (activeMatch.players.length >= maxPlayers) {
      alert(`Seu plano ${currentUser.plan} permite apenas ${maxPlayers} jogadores. Contate o administrador para upgrade.`);
      return;
    }
    updateActiveMatchPlayers([...activeMatch.players, player]);
    showNotification(`${player.name} adicionado com sucesso!`);
  };

  const handleEditPlayer = (player: Player) => {
      setEditingPlayer(player);
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
      updateActiveMatchPlayers(activeMatch.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
      showNotification("Jogador atualizado com sucesso!");
      setEditingPlayer(null);
  };

  const handleRemovePlayer = (id: string) => {
    if(confirm('Tem certeza que deseja remover este jogador?')) {
        updateActiveMatchPlayers(activeMatch.players.filter(p => p.id !== id));
    }
  };

  const handleToggleConfirm = (id: string) => {
    const player = activeMatch.players.find(p => p.id === id);
    if (!player) return;

    const newStatus = !player.confirmed;
    
    updateActiveMatchPlayers(activeMatch.players.map(p => 
        p.id === id ? { ...p, confirmed: newStatus } : p
    ));

    if (newStatus) {
        showNotification(`${player.name} confirmou presença! ⚽`, 'success');
    }
  };

  const handleBulkConfirm = (names: string[]) => {
      if (names.length === 0) return;

      let confirmedCount = 0;
      const updatedPlayers = activeMatch.players.map(player => {
          // Check if player name matches any in the list (simple partial match case-insensitive)
          const isMatch = names.some(name => 
              player.name.toLowerCase().includes(name.toLowerCase()) || 
              name.toLowerCase().includes(player.name.toLowerCase())
          );
          
          if (isMatch && !player.confirmed) {
              confirmedCount++;
              return { ...player, confirmed: true };
          }
          return player;
      });

      updateActiveMatchPlayers(updatedPlayers);
      setImportModalOpen(false);
      showNotification(`${confirmedCount} jogadores confirmados pela lista!`, 'success');
  };

  const handleSortTeams = async () => {
    const confirmedPlayers = activeMatch.players.filter(p => p.confirmed);
    
    if (confirmedPlayers.length < 2) {
      alert(`Precisa de pelo menos 2 jogadores confirmados para realizar um sorteio.`);
      return;
    }

    setIsSorting(true);
    setTimeout(async () => {
        try {
            const result = await generateBalancedTeams(confirmedPlayers, activeMatch.details.teamsCount);
            setSortResult(result);
            showNotification("Times sorteados com sucesso!", 'success');
            
            setTimeout(() => {
                const resultsElement = document.getElementById('results');
                if (resultsElement) {
                    resultsElement.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);

        } catch (error) {
            console.error("Erro ao sortear:", error);
            alert("Erro ao realizar o sorteio.");
        } finally {
            setIsSorting(false);
        }
    }, 800);
  };

  const handleOpenInvite = () => {
      if (!activeMatch.details.date || !activeMatch.details.time || !activeMatch.details.location) {
          alert("Preencha os detalhes da partida primeiro!");
          return;
      }
      setWhatsAppModal({ isOpen: true, mode: 'invite' });
  };

  const handleOpenReminders = () => {
      setWhatsAppModal({ isOpen: true, mode: 'reminder' });
  };

  // --- RENDER ---

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
      return (
        <AdminDashboard 
            users={users} 
            onAddUser={handleAddUser} 
            onDeleteUser={handleDeleteUser} 
            onLogout={handleLogout} 
            onRestore={handleRestoreDatabase}
        />
      );
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

      {/* Modals */}
      {editingPlayer && (
          <EditPlayerModal 
            isOpen={!!editingPlayer}
            onClose={() => setEditingPlayer(null)}
            player={editingPlayer}
            onSave={handleUpdatePlayer}
          />
      )}

      <ImportListModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleBulkConfirm}
      />

      <MatchManager
        isOpen={isMatchManagerOpen}
        onClose={() => setIsMatchManagerOpen(false)}
        matches={matches}
        activeMatchId={activeMatchId}
        onSelectMatch={(id) => { setActiveMatchId(id); setIsMatchManagerOpen(false); setSortResult(null); }}
        onCreateMatch={() => { const id = createNewMatch(); setActiveMatchId(id); setIsMatchManagerOpen(false); setSortResult(null); }}
        onDeleteMatch={handleDeleteMatch}
        onReplicateMatch={handleReplicateMatch}
      />

      {whatsAppModal.isOpen && (
        <WhatsAppModal
            isOpen={whatsAppModal.isOpen}
            onClose={() => setWhatsAppModal({ ...whatsAppModal, isOpen: false })}
            mode={whatsAppModal.mode}
            matchDetails={activeMatch.details}
            players={whatsAppModal.mode === 'reminder' ? activeMatch.players.filter(p => p.confirmed) : []}
            onGenerateMessage={() => 
                whatsAppModal.mode === 'invite' 
                    ? generateInviteMessage(activeMatch.details)
                    : generateReminderMessage(activeMatch.details, activeMatch.players.filter(p => p.confirmed))
            }
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
                 {/* Match Manager Button */}
                 <button
                    onClick={() => setIsMatchManagerOpen(true)}
                    className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                 >
                    <CalendarDays size={16} />
                    <span className="hidden sm:inline">Agenda</span>
                 </button>

                 <div className={`hidden md:flex items-center gap-1 text-xs font-bold px-2 py-1 rounded uppercase border ${getPlanBadgeColor()}`}>
                    {currentUser.plan === PlanTier.PROFISSIONAL && <Crown size={12} />}
                    {currentUser.plan}
                 </div>
                 
                 <button
                    onClick={handleOpenReminders}
                    className={`relative px-3 py-2 rounded-lg flex items-center justify-center transition-colors border ${
                        isMatchTomorrow 
                        ? 'bg-orange-900/30 text-orange-400 border-orange-500/50 animate-pulse shadow-lg shadow-orange-500/10' 
                        : 'bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600'
                    }`}
                    title={isMatchTomorrow ? "Enviar Lembretes (Jogo Amanhã!)" : "Lembretes e Cobranças"}
                 >
                    <Bell size={16} className={isMatchTomorrow ? 'fill-orange-400' : ''} />
                 </button>

                 <button
                    onClick={handleOpenInvite}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors border border-slate-600"
                    title="Criar Convite WhatsApp"
                 >
                    <MessageCircle className="w-4 h-4 text-green-400" />
                 </button>

                 <button
                    onClick={handleLogout}
                    className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                    title="Sair"
                 >
                    <LogOut size={16} />
                 </button>
            </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Top Grid: Details and Add Player */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
                <MatchSetup details={activeMatch.details} onChange={updateActiveMatchDetails} />
                
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl border border-indigo-500/30">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-yellow-400" />
                        Sorteio Equilibrado
                    </h3>
                    <p className="text-sm text-indigo-200 mb-4">
                        Distribuição matemática baseada em nível técnico, posição e goleiros.
                    </p>
                    <button
                        onClick={handleSortTeams}
                        disabled={isSorting}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isSorting ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                Calculando...
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
                    players={activeMatch.players} 
                    maxPlayers={PLAN_LIMITS[currentUser.plan]}
                    onRemove={handleRemovePlayer} 
                    onToggleConfirm={handleToggleConfirm}
                    onEdit={handleEditPlayer}
                    onImportClick={() => setImportModalOpen(true)}
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