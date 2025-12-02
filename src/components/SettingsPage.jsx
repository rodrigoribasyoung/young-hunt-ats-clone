import React, { useState } from 'react';
import { Building2, MapPin, Tag, Briefcase, Globe, GraduationCap, Heart, Plus, X, Layout, Database, Users } from 'lucide-react';

export default function SettingsPage({ 
  companies, onAddCompany, onDelCompany,
  cities, onAddCity, onDelCity,
  interestAreas, onAddInterest, onDelInterest,
  roles, onAddRole, onDelRole,
  origins, onAddOrigin, onDelOrigin,
  schooling, onAddSchooling, onDelSchooling,
  marital, onAddMarital, onDelMarital,
  onImportCSV, isImporting
}) {
  const [activeTab, setActiveTab] = useState('vagas'); // vagas, candidatos, sistema
  const [inputs, setInputs] = useState({});

  const handleAdd = (key, fn) => {
    if (inputs[key]) { fn(inputs[key]); setInputs({ ...inputs, [key]: '' }); }
  };

  const updateInput = (key, val) => setInputs(prev => ({ ...prev, [key]: val }));

  // Componente de Menu Lateral
  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === id ? 'bg-brand-orange text-white shadow-lg' : 'text-slate-400 hover:bg-brand-hover hover:text-white'}`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      
      {/* Sidebar de Configuração */}
      <div className="w-full md:w-64 bg-brand-card rounded-xl border border-brand-border p-4 h-fit">
        <h2 className="text-lg font-bold text-white mb-6 px-2">Configurações</h2>
        <div className="space-y-1">
          <TabButton id="vagas" label="Dados das Vagas" icon={Briefcase} />
          <TabButton id="candidatos" label="Dados dos Candidatos" icon={Users} />
          <TabButton id="sistema" label="Sistema & Importação" icon={Database} />
        </div>
      </div>

      {/* Área de Conteúdo */}
      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pb-20">
        
        {activeTab === 'vagas' && (
          <div className="grid lg:grid-cols-2 gap-6 animate-in fade-in">
            <ConfigBox title="Empresas / Clientes" icon={Building2} items={companies} val={inputs.company} setVal={v => updateInput('company', v)} onAdd={() => handleAdd('company', onAddCompany)} onDel={onDelCompany} />
            <ConfigBox title="Cidades / Locais" icon={MapPin} items={cities} val={inputs.city} setVal={v => updateInput('city', v)} onAdd={() => handleAdd('city', onAddCity)} onDel={onDelCity} />
            <ConfigBox title="Cargos / Roles" icon={Briefcase} items={roles} val={inputs.role} setVal={v => updateInput('role', v)} onAdd={() => handleAdd('role', onAddRole)} onDel={onDelRole} />
          </div>
        )}

        {activeTab === 'candidatos' && (
          <div className="grid lg:grid-cols-2 gap-6 animate-in fade-in">
            <ConfigBox title="Áreas de Interesse" icon={Tag} items={interestAreas} val={inputs.interest} setVal={v => updateInput('interest', v)} onAdd={() => handleAdd('interest', onAddInterest)} onDel={onDelInterest} />
            <ConfigBox title="Origens (Fontes)" icon={Globe} items={origins} val={inputs.origin} setVal={v => updateInput('origin', v)} onAdd={() => handleAdd('origin', onAddOrigin)} onDel={onDelOrigin} />
            <ConfigBox title="Nível Escolaridade" icon={GraduationCap} items={schooling} val={inputs.schooling} setVal={v => updateInput('schooling', v)} onAdd={() => handleAdd('schooling', onAddSchooling)} onDel={onDelSchooling} />
            <ConfigBox title="Estado Civil" icon={Heart} items={marital} val={inputs.marital} setVal={v => updateInput('marital', v)} onAdd={() => handleAdd('marital', onAddMarital)} onDel={onDelMarital} />
          </div>
        )}

        {activeTab === 'sistema' && (
          <div className="bg-brand-card p-6 rounded-xl border border-brand-border animate-in fade-in">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Database size={20} className="text-brand-cyan"/> Backup e Importação</h3>
            <p className="text-sm text-slate-400 mb-6">Importe dados legados via CSV caso a integração automática falhe.</p>
            <div className="relative inline-block">
               <input type="file" accept=".csv" onChange={onImportCSV} id="csvUpload" className="hidden" disabled={isImporting} />
               <label htmlFor="csvUpload" className={`cursor-pointer bg-brand-cyan text-brand-dark font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-cyan-400 transition-colors ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 {isImporting ? 'Processando...' : 'Selecionar Arquivo CSV'}
               </label>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const ConfigBox = ({ title, icon: Icon, items = [], val, setVal, onAdd, onDel, placeholder = "Adicionar novo..." }) => (
  <div className="bg-brand-card p-5 rounded-xl border border-brand-border shadow-sm flex flex-col h-[320px]">
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-brand-border">
      <Icon className="text-brand-orange" size={18}/> 
      <h3 className="font-bold text-white text-sm uppercase tracking-wide">{title}</h3>
    </div>
    <div className="flex gap-2 mb-3">
      <input 
        value={val || ''} 
        onChange={e => setVal(e.target.value)} 
        className="bg-brand-dark border border-brand-border p-2 rounded-lg flex-1 text-sm outline-none focus:border-brand-cyan text-white placeholder-slate-600" 
        placeholder={placeholder} 
        onKeyDown={(e) => e.key === 'Enter' && onAdd()}
      />
      <button onClick={onAdd} className="bg-brand-cyan text-brand-dark px-3 rounded-lg hover:bg-cyan-400 transition-colors"><Plus size={18}/></button>
    </div>
    <ul className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
      {items.map(i => (
        <li key={i.id} className="flex justify-between items-center bg-brand-dark/50 p-2 rounded-md text-sm text-slate-300 border border-transparent hover:border-brand-border group transition-all">
          <span className="truncate">{i.name}</span> 
          <button onClick={() => onDel(i.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
        </li>
      ))}
    </ul>
  </div>
);