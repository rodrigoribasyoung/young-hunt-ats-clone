jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Briefcase, Settings, Plus, Search, 
  FileText, MapPin, ChevronRight, CheckCircle, Filter, 
  UserPlus, Trophy, Menu, X, LogOut, Lock, Loader2, Edit3, Trash2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut 
} from "firebase/auth";
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, serverTimestamp, query, orderBy 
} from "firebase/firestore";

// Imports Locais (Certifique-se que criou esses arquivos/pastas)
import TransitionModal from './components/modals/TransitionModal';
import SettingsPage from './components/SettingsPage';
import { PIPELINE_STAGES, STATUS_COLORS } from './constants'; 

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyD54i_1mQdEbS3ePMxhCkN2bhezjcq7xEg",
  authDomain: "young-talents-ats.firebaseapp.com",
  projectId: "young-talents-ats",
  storageBucket: "young-talents-ats.firebasestorage.app",
  messagingSenderId: "436802511318",
  appId: "436802511318:web:c7f103e4b09344f9bf4477"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Cores para gráficos
const COLORS = ['#fe5009', '#00bcbc', '#fb923c', '#22d3ee', '#f87171']; 

// --- LOGIN COMPONENT ---
const LoginScreen = ({ onLogin, error }) => (
  <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
    <div className="bg-brand-card rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-brand-border">
      <div className="w-20 h-20 bg-gradient-to-br from-brand-orange to-brand-cyan rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-orange/20">
        <Trophy size={40} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Young Talents</h1>
      <p className="text-slate-400 mb-8 font-light">Gestão de Talentos do Futuro</p>
      
      {error && (
        <div className="bg-red-900/20 text-red-400 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 justify-center text-left border border-red-900/50">
          <Lock size={16} className="shrink-0" /> 
          <span>{error}</span>
        </div>
      )}

      <button onClick={onLogin} className="w-full bg-white text-brand-dark font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-md transform hover:scale-[1.02]">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Entrar com Google
      </button>
    </div>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Dados Principais
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Dados de Configuração (Novos)
  const [interestAreas, setInterestAreas] = useState([]);
  const [roles, setRoles] = useState([]);

  // Estado de Transição (Novo - Item 6/7)
  const [pendingTransition, setPendingTransition] = useState(null);

  // Filtros Avançados (Item 6)
  const [filters, setFilters] = useState({
    period: 'all', 
    company: 'all',
    jobId: 'all',
    city: 'all',
    interestArea: 'all', // Novo filtro
    search: ''
  });

  // UI State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- AUTH ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoginError('');
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } catch (error) { console.error(error); setLoginError('Erro ao tentar fazer login.'); }
  };

  const handleLogout = () => signOut(auth);

  // --- DATA SYNC ---
  useEffect(() => {
    if (!user) return;
    try {
      // Listeners existentes
      const unsubJobs = onSnapshot(query(collection(db, 'jobs'), orderBy('createdAt', 'desc')), (s) => setJobs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubCandidates = onSnapshot(query(collection(db, 'candidates'), orderBy('createdAt', 'desc')), (s) => setCandidates(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubCompanies = onSnapshot(query(collection(db, 'companies'), orderBy('name')), (s) => setCompanies(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      const unsubCities = onSnapshot(query(collection(db, 'cities'), orderBy('name')), (s) => setCities(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      
      // Novos Listeners para Configurações
      const unsubInterests = onSnapshot(query(collection(db, 'interest_areas'), orderBy('name')), s => setInterestAreas(s.docs.map(d => ({id: d.id, ...d.data()}))));
      const unsubRoles = onSnapshot(query(collection(db, 'roles'), orderBy('name')), s => setRoles(s.docs.map(d => ({id: d.id, ...d.data()}))));

      return () => { 
        unsubJobs(); unsubCandidates(); unsubCompanies(); 
        unsubCities(); unsubInterests(); unsubRoles(); 
      };
    } catch (e) { console.error(e); }
  }, [user]);

  // --- LÓGICA DE FILTRO AVANÇADO (Item 6) ---
  const filteredData = useMemo(() => {
    let filteredJobs = jobs;
    let list = candidates;

    // Filtro de Vagas
    if (filters.company !== 'all') filteredJobs = filteredJobs.filter(j => j.company === filters.company);
    if (filters.city !== 'all') filteredJobs = filteredJobs.filter(j => j.location === filters.city);

    // Filtro de Candidatos
    // 1. Texto (Nome ou Email)
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(c => c.fullName?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s));
    }
    
    // 2. Vaga Específica
    if (filters.jobId !== 'all') list = list.filter(c => c.jobId === filters.jobId);
    
    // 3. Cidade
    if (filters.city !== 'all') list = list.filter(c => c.city === filters.city);

    // 4. Área de Interesse (Novo)
    if (filters.interestArea !== 'all') list = list.filter(c => c.interestAreas?.includes(filters.interestArea));

    // 5. Período (Novo)
    if (filters.period !== 'all') {
      const days = parseInt(filters.period);
      const now = new Date();
      list = list.filter(c => {
        if (!c.createdAt) return false;
        // Tenta converter Timestamp do Firebase ou usa Date direto
        const date = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
      });
    }

    return { jobs: filteredJobs, candidates: list };
  }, [jobs, candidates, filters]);

  // --- HANDLERS E TRANSIÇÕES (Item 7) ---

  const handleDragEnd = (candidateId, newStage) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || candidate.status === newStage) return;

    const currentStageIndex = PIPELINE_STAGES.indexOf(candidate.status);
    const newStageIndex = PIPELINE_STAGES.indexOf(newStage);
    const isConclusion = ['Selecionado', 'Contratado', 'Reprovado'].includes(newStage);
    
    let missingFields = [];

    // Regra 1: Mover de Inscrito (0) para Considerado (1) ou superior
    if (currentStageIndex <= 0 && newStageIndex >= 1) {
       if (!candidate.city) missingFields.push('city');
       if (!candidate.hasLicense) missingFields.push('hasLicense');
    }

    // Regra 2: Mover de Considerado (1) para Entrevista (2) ou superior
    // (Exceto se for reprovação direta, podemos debater, mas a regra diz 'para etapa 3')
    if (currentStageIndex <= 1 && newStageIndex >= 2 && !isConclusion) {
       if (!candidate.interestAreas) missingFields.push('interestAreas');
       if (!candidate.education) missingFields.push('education');
       if (!candidate.experience) missingFields.push('experience');
       if (!candidate.maritalStatus) missingFields.push('maritalStatus');
       if (!candidate.source) missingFields.push('source');
    }

    // Se houver pendências ou for conclusão, abre o modal
    if (missingFields.length > 0 || isConclusion) {
      setPendingTransition({
        candidate,
        toStage: newStage,
        missingFields,
        isConclusion
      });
    } else {
      // Movimento direto se não houver restrições
      updateDoc(doc(db, 'candidates', candidateId), { status: newStage });
    }
  };

  const confirmTransition = async (updatedData) => {
    if (!pendingTransition) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'candidates', pendingTransition.candidate.id), {
        ...updatedData,
        status: pendingTransition.toStage,
        updatedAt: serverTimestamp()
      });
      setPendingTransition(null);
    } catch (e) {
      alert("Erro ao atualizar transição.");
    } finally {
      setIsSaving(false);
    }
  };

  // Funções Auxiliares de Banco de Dados
  const handleSaveJob = async (data) => {
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'jobs'), { ...data, status: 'Aberta', createdAt: serverTimestamp(), createdBy: user.email });
      setIsJobModalOpen(false);
    } catch (e) { alert("Erro ao salvar."); } finally { setIsSaving(false); }
  };

  const handleDeleteItem = async (col, id) => {
     if(confirm('Tem certeza?')) await deleteDoc(doc(db, col, id));
  };

  const handleAddAux = async (col, name) => {
    if(name.trim()) await addDoc(collection(db, col), { name });
  };

  if (authLoading) return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-cyan gap-2"><Loader2 className="animate-spin" /> Carregando...</div>;
  if (!user) return <LoginScreen onLogin={handleGoogleLogin} error={loginError} />;

  return (
    <div className="flex min-h-screen bg-brand-dark font-sans text-slate-200">
      {/* --- SIDEBAR --- */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-brand-cardYZ border-r border-brand-border transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col bg-brand-card`}>
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-orange to-brand-cyan rounded-lg flex items-center justify-center"><Trophy size={18} className="text-white" /></div>
            Young Talents
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'pipeline', label: 'Pipeline', icon: Filter }, { id: 'jobs', label: 'Vagas', icon: Briefcase }, { id: 'candidates', label: 'Candidatos', icon: Users }, { id: 'settings', label: 'Configurações', icon: Settings }].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-slate-400 hover:bg-brand-hover hover:text-white'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-border bg-brand-dark/30">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-cyan flex items-center justify-center text-xs font-bold text-brand-dark truncate">{user.displayName?.charAt(0)}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate text-white">{user.displayName}</p><p className="text-xs text-slate-500 truncate">{user.email}</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 px-4 py-2 hover:bg-red-900/10 rounded"><LogOut size={14} /> Sair</button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-brand-card shadow-sm flex items-center justify-betweenWB border-b border-brand-border sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-200"><Menu size={24} /></button>
          <span className="font-bold text-white">Young Talents</span>
          <div className="w-6" /> 
        </div>

        {/* Global Filter Bar (Item 6) */}
        <div className="bg-brand-card border-b border-brand-border px-6 py-4 flex flex-col xl:flex-row gap-4 items-center justify-between shadow-sm z-10">
           <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
              <div className="relative w-full md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   placeholder="Buscar por nome ou e-mail..." 
                   className="pl-9 pr-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-sm w-full focus:ring-1 focus:ring-brand-cyan outline-none text-white placeholder-slate-500"
                   value={filters.search}
                   onChange={e => setFilters({...filters, search: e.target.value})}
                 />
              </div>

              {/* Filtros Dropdown */}
              <select className="border border-brand-border rounded-lg text-sm px-2 py-2 bg-brand-dark text-slate-200 outline-none max-w-[150px]" value={filters.jobId} onChange={e => setFilters({...filters, jobId: e.target.value})}>
                 <option value="all">Todas Vagas</option>
                 {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>

              <select className="border border-brand-border rounded-lg text-sm px-2 py-2 bg-brand-dark text-slate-200 outline-none max-w-[150px]" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})}>
                 <option value="all">Todas Cidades</option>
                 {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              <select className="border border-brand-border rounded-lg text-sm px-2 py-2 bg-brand-dark text-slate-200 outline-none max-w-[150px]" value={filters.interestArea} onChange={e => setFilters({...filters, interestArea: e.target.value})}>
                 <option value="all">Todas Áreas</option>
                 {interestAreas.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
              </select>

              <select className="border border-brand-border rounded-lg text-sm px-2 py-2 bg-brand-dark text-slate-200 outline-none max-w-[150px]" value={filters.period} onChange={e => setFilters({...filters, period: e.target.value})}>
                 <option value="all">Todo Período</option>
                 <option value="7">Últimos 7 dias</option>
                 <option value="30">Últimos 30 dias</option>
              </select>
           </div>

           <div className="text-xs text-brand-cyan font-medium border border-brand-cyan/20 px-3 py-1 rounded-full bg-brand-cyan/10 whitespace-nowrap">
              {filteredData.candidates.length} Talentos • {filteredData.jobs.length} Vagas
           </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-brand-dark custom-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full">
            {activeTab === 'dashboard' && <Dashboard filteredJobs={filteredData.jobs} filteredCandidates={filteredData.candidates} />}
            
            {activeTab === 'pipeline' && (
              <Pipeline 
                candidates={filteredData.candidates} 
                jobs={jobs}
                onDragEnd={handleDragEnd} 
                onEdit={(c) => setEditingCandidate(c)}
              />
            )}

            {activeTab === 'jobs' && (
              <JobsList 
                jobs={filteredData.jobs} 
                candidates={candidates} 
                onAdd={() => setIsJobModalOpen(true)} 
                onDelete={(id) => handleDeleteItem('jobs', id)} 
                onFilterPipeline={(id) => { setFilters({...filters, jobId: id}); setActiveTab('pipeline'); }}
              />
            )}

            {activeTab === 'candidates' && (
              <CandidatesList 
                candidates={filteredData.candidates} 
                jobs={jobs} 
                onAdd={() => setEditingCandidate({})} 
                onEdit={(c) => setEditingCandidate(c)}
                onDelete={(id) => handleDeleteItem('candidates', id)} 
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage 
                 companies={companies} onAddCompany={(n) => handleAddAux('companies', n)} onDelCompany={(id) => handleDeleteItem('companies', id)}
                 cities={cities} onAddCity={(n) => handleAddAux('cities', n)} onDelCity={(id) => handleDeleteItem('cities', id)}
                 interestAreas={interestAreas} onAddInterest={(n) => handleAddAux('interest_areas', n)} onDelInterest={(id) => handleDeleteItem('interest_areas', id)}
                 roles={roles} onAddRole={(n) => handleAddAux('roles', n)} onDelRole={(id) => handleDeleteItem('roles', id)}
              />
            )}
          </div>
        </main>
      </div>

      {/* --- MODALS --- */}
      {isJobModalOpen && (
        <JobModal 
          isOpen={isJobModalOpen} 
          onClose={() => setIsJobModalOpen(false)} 
          onSave={handleSaveJob} 
          companies={companies} 
          cities={cities} 
          isSaving={isSaving} 
        />
      )}
      
      {/* Modal de Edição de Candidato (Simplificado aqui, mas você pode usar o componente CandidateModal completo) */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
           <div className="bg-brand-card p-6 rounded-xl border border-brand-border w-full max-w-lg">
             <h3 className="text-xl font-bold mb-4">Edição Rápida (Placeholder)</h3>
             <p className="text-sm text-slate-400 mb-6">Para editar completamente, integre o componente <code>CandidateModal</code> atualizado.</p>
             <button onClick={() => setEditingCandidate(null)} className="bg-brand-orange px-4 py-2 rounded text-white">Fechar</button>
           </div>
        </div>
      )}

      {/* Novo Modal de Validação de Transição */}
      {pendingTransition && (
        <TransitionModal 
          transition={pendingTransition}
          onClose={() => setPendingTransition(null)}
          onConfirm={confirmTransition}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS (Mantidos do anterior para não quebrar, mas idealmente modularizados) ---

const Dashboard = ({ filteredJobs, filteredCandidates }) => {
  const activeJobs = filteredJobs.filter(j => j.status === 'Aberta').length;
  const hired = filteredCandidates.filter(c => c.status === 'Contratado').length;
  // Filtra apenas estágios ativos para o gráfico
  const graphStages = PIPELINE_STAGES.filter(s => s !== 'Reprovado');
  const stageData = graphStages.map(s => ({ name: s, count: filteredCandidates.filter(c => c.status === s).length }));
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Vagas Ativas" value={activeJobs} icon={Briefcase} color="text-brand-orange" bg="bg-brand-orange/10" />
        <StatCard label="Total Talentos" value={filteredCandidates.length} icon={Users} color="text-brand-cyan" bg="bg-brand-cyan/10" />
        <StatCard label="Em Processo" value={filteredCandidates.filter(c => c.status !== 'Inscrito' && c.status !== 'Contratado' && c.status !== 'Reprovado').length} icon={FileText} color="text-purple-400" bg="bg-purple-500/10" />
        <StatCard label="Contratados" value={hired} icon={CheckCircle} color="text-green-400" bg="bg-green-500/10" />
      </div>
      <div className="bg-brand-card p-6 rounded-xl shadow-lg border border-brand-border h-96">
          <h3 className="font-bold mb-4 text-white">Funil de Seleção</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxisFZ fontSize={12} stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} cursor={{fill: '#334155'}} />
              <Bar dataKey="count" fill="#fe5009" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente YAxis corrigido para evitar erro de referência
const YAxisFZ = (props) => <YAxis {...props} />;

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-brand-card p-6 rounded-xl shadow-lg border border-brand-border flex items-center gap-4 hover:border-brand-cyan/50 transition-colors">
    <div className={`p-3 rounded-lg ${bg}`}><Icon className={`w-6 h-6 ${color}`} /></div>
    <div><p className="text-sm text-slate-400 font-medium">{label}</p><p className="text-2xl font-bold text-white">{value}</p></div>
  </div>
);

const Pipeline = ({ candidates, jobs, onDragEnd, onEdit }) => {
  const [draggedId, setDraggedId] = useState(null);
  const handleDragStart = (e, id) => { setDraggedId(id); e.dataTransfer.effectAllowed = "move"; };
  const handleDrop = (e, stage) => { e.preventDefault(); if (draggedId) { onDragEnd(draggedId, stage); setDraggedId(null); } };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 min-w-max h-full">
          {PIPELINE_STAGES.map(stage => (
            <div 
              key={stage} 
              className="flex-1 flex flex-col bg-brand-card/50 rounded-xl p-2 min-w-[280px] w-[280px] border border-brand-border"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className={`font-semibold text-slate-200 mb-3 px-2 flex justify-between items-center bg-brand-hover p-2 rounded border-l-4 ${STATUS_COLORS[stage]?.split(' ')[2] || 'border-slate-500'}`}>
                <span className="truncate">{stage}</span>
                <span className="bg-brand-dark text-slate-300 px-2 py-0.5 rounded text-xs font-bold border border-brand-border">
                  {candidates.filter(c => c.status === stage).length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {candidates.filter(c => c.status === stage).map(c => {
                  const job = jobs.find(j => j.id === c.jobId);
                  return (
                    <div 
                      key={c.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, c.id)}
                      onClick={() => onEdit(c)}
                      className="bg-brand-card p-3 rounded-lg shadow-sm border border-brand-border hover:border-brand-cyan cursor-grab active:cursor-grabbing transition-all group relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold border border-brand-border">
                                {c.fullName?.charAt(0)}
                             </div>
                             <p className="font-bold text-slate-200 text-sm truncate max-w-[140px]">{c.fullName}</p>
                        </div>
                        <Edit3 size={14} className="text-slate-500 hover:text-brand-orange opacity-0 group-hover:opacity-100" />
                      </div>
                      <p className="text-xs text-brand-cyan bg-brand-cyan/10 inline-block px-1.5 py-0.5 rounded mb-2 font-medium truncate max-w-full">
                        {job?.title || 'Banco Geral'}
                      </p>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={10} /> {c.city || 'N/A'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const JobsList = ({ jobs, candidates, onAdd, onDelete, onFilterPipeline }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Vagas</h2><button onClick={onAdd} className="bg-brand-orange text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"><Plus size={18}/> Nova Vaga</button></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map(job => {
        const appCount = candidates.filter(c => c.jobId === job.id).length;
        return (
          <div key={job.id} className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-lg flex flex-col group hover:border-brand-orange/50 transition-colors">
            <div className="flex justify-between mb-4"><div className="p-2 bg-brand-dark rounded-lg"><Briefcase className="text-brand-orange" size={24}/></div><span className="text-xs bg-brand-cyan/20 text-brand-cyan px-2 py-1 rounded-full h-fit border border-brand-cyan/20">{job.status}</span></div>
            <h3 className="font-bold text-lg mb-1 text-white">{job.title}</h3>
            <p className="text-sm text-slate-400 mb-4">{job.company}</p>
            <div className="text-sm text-slate-500 space-y-1 mb-4 flex-1">
              <p className="flex items-center gap-2"><MapPin size={14}/> {job.location}</p>
              <p className="flex items-center gap-2 font-medium text-brand-cyan"><Users size={14}/> {appCount} Candidatos</p>
            </div>
            <div className="flex justify-between items-center border-t border-brand-border pt-4">
              <button onClick={() => onFilterPipeline(job.id)} className="text-brand-orange text-sm font-medium hover:underline flex items-center gap-1">Ver Pipeline <ChevronRight size={14}/></button>
              <button onClick={() => onDelete(job.id)} className="text-red-400 text-xs hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Excluir</button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const CandidatesList = ({ candidates, jobs, onAdd, onEdit, onDelete }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Banco de Talentos</h2><button onClick={onAdd} className="bg-brand-cyan text-brand-dark font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-400 transition-colors"><UserPlus size={18}/> Adicionar Talento</button></div>
    <div className="bg-brand-card rounded-xl border border-brand-border shadow-lg overflow-hidden">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="bg-brand-hover text-slate-200 font-medium"><tr><th className="px-6 py-4">Nome</th><th className="px-6 py-4">Vaga</th><th className="px-6 py-4">Cidade</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
        <tbody className="divide-y divide-brand-border">
          {candidates.map(c => (
            <tr key={c.id} className="hover:bg-brand-hover/50 cursor-pointer transition-colors" onClick={() => onEdit(c)}>
              <td className="px-6 py-4 font-medium flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white border border-brand-border">{c.fullName?.charAt(0)}</div>
                 <div>{c.fullName}<div className="text-xs text-slate-500 font-normal">{c.email}</div></div>
              </td>
              <td className="px-6 py-4">{jobs.find(j => j.id === c.jobId)?.title || <span className="text-slate-600 italic">Banco Geral</span>}</td>
              <td className="px-6 py-4">{c.city}</td>
              <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs border ${STATUS_COLORS[c.status] || 'bg-slate-700 text-white'}`}>{c.status}</span></td>
              <td className="px-6 py-4 text-right">
                <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="text-slate-500 hover:text-red-500 p-1"><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const JobModal = ({ onClose, onSave, companies, cities, isSaving }) => {
  const [d, setD] = useState({ title: '', company: '', location: '', roleType: 'Tempo Integral' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-brand-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-brand-border text-white">
        <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center"><h3 className="font-bold text-lg">Nova Vaga</h3><button onClick={onClose}><X size={20}/></button></div>
        <div className="p-6 space-y-4">
          <input className="w-full bg-brand-dark border border-brand-border p-2 rounded text-white" placeholder="Título do Cargo" value={d.title} onChange={e => setD({...d, title: e.target.value})} />
          <select className="w-full bg-brand-dark border border-brand-border p-2 rounded text-white" value={d.company} onChange={e => setD({...d, company: e.target.value})}><option value="">Empresa</option>{companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
          <select className="w-full bg-brand-dark border border-brand-border p-2 rounded text-white" value={d.location} onChange={e => setD({...d, location: e.target.value})}><option value="">Cidade</option>{cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
        </div>
        <div className="px-6 py-4 bg-brand-dark/50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white rounded">Cancelar</button>
          <button onClick={() => onSave(d)} disabled={isSaving || !d.title} className="bg-brand-orange text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 disabled:opacity-50">
            {isSaving && <Loader2 size={16} className="animate-spin" />} Salvar
          </button>
        </div>
      </div>
    </div>
  );
};