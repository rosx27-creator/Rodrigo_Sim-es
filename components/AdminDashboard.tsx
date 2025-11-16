
import React, { useState } from 'react';
import { UserAccount, PlanTier, PLAN_LIMITS } from '../types';
import { UserPlus, Trash2, LogOut, ShieldCheck, Users, Crown } from 'lucide-react';

interface AdminDashboardProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, onAddUser, onDeleteUser, onLogout }) => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(PlanTier.AMADOR);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserName) return;

    const newUser: UserAccount = {
      id: crypto.randomUUID(),
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      plan: selectedPlan,
      role: 'user'
    };

    onAddUser(newUser);
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserName('');
    alert('Usuário criado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-grass-500" /> Painel Administrativo
            </h1>
            <p className="text-slate-400 text-sm">Gerencie seus clientes e planos</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create User Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> Novo Cliente
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nome do Cliente</label>
                  <input 
                    type="text" 
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                    placeholder="Ex: João da Silva"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email de Acesso</label>
                  <input 
                    type="email" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                    placeholder="cliente@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Senha Provisória</label>
                  <input 
                    type="text" 
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                    placeholder="Senha123"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Plano Contratado</label>
                  <select 
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value as PlanTier)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                  >
                     {Object.values(PlanTier).map((plan) => (
                        <option key={plan} value={plan}>
                            {plan} ({PLAN_LIMITS[plan]} jogadores)
                        </option>
                     ))}
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
                >
                  Criar Conta
                </button>
              </form>
            </div>
          </div>

          {/* User List */}
          <div className="lg:col-span-2">
             <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-grass-400" /> Clientes Ativos
                    </h2>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                        {users.filter(u => u.role !== 'admin').length} Clientes
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Plano</th>
                                <th className="p-4">Senha</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.filter(u => u.role !== 'admin').length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        Nenhum cliente cadastrado.
                                    </td>
                                </tr>
                            )}
                            {users.map(user => (
                                user.role !== 'admin' && (
                                    <tr key={user.id} className="hover:bg-slate-700/30">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${
                                                user.plan === PlanTier.PROFISSIONAL ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600/30' : 
                                                user.plan === PlanTier.AMADOR ? 'bg-blue-900/30 text-blue-400 border-blue-600/30' : 
                                                'bg-slate-700 text-slate-300 border-slate-600'
                                            }`}>
                                                {user.plan === PlanTier.PROFISSIONAL && <Crown size={10} />}
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-slate-400">
                                            {user.password}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => onDeleteUser(user.id)}
                                                className="text-slate-400 hover:text-red-400 p-2 hover:bg-red-900/20 rounded transition-colors"
                                                title="Excluir usuário"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
