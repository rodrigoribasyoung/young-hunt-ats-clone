// src/components/SettingsPage.jsx
import React, { useState } from 'react';
import { Building2, MapPin, Tag, Briefcase, Mail, X, Plus } from 'lucide-react';

export default function SettingsPage({ 
  companies, onAddCompany, onDelCompany,
  cities, onAddCity, onDelCity,
  interestAreas, onAddInterest, onDelInterest,
  roles, onAddRole, onDelRole
}) {
  const [inputs, setInputs] = useState({ company: '', city: '', interest: '', role: '' });

  const handleAdd = (key, fn) => {
    if (inputs[key]) { fn(inputs[key]); setInputs({ ...inputs, [key]: '' }); }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Configurações do Sistema</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Empresas e Cidades (Já existiam) */}
        <ConfigBox title="Empresas" icon={Building2} items={companies} val={inputs.company} setVal={v => setInputs({...inputs, company: v})} onAdd={() => handleAdd('company', onAddCompany)} onDel={onDelCompany} />
        <ConfigBox title="Cidades / Locais" icon={MapPin} items={cities} val={inputs.city} setVal={v => setInputs({...inputs, city: v})} onAdd={() => handleAdd('city', onAddCity)} onDel={onDelCity} />
        
        {/* Item 5: Áreas e Cargos */}
        <ConfigBox title="Áreas de Interesse" icon={Tag} items={interestAreas} val={inputs.interest} setVal={v => setInputs({...inputs, interest: v})} onAdd={() => handleAdd('interest', onAddInterest)} onDel={onDelInterest} placeholder="Ex: Comercial, Tech..." />
        <ConfigBox title="Cargos / Roles" icon={Briefcase} items={roles} val={inputs.role} setVal={v => setInputs({...inputs, role: v})} onAdd={() => handleAdd('role', onAddRole)} onDel={onDelRole} placeholder="Ex: Analista Jr, Estagiário..." />
        
        {/* Item 9: Templates de Email (Placeholder) */}
        <div className="md:col-span-2 bg-brand-card p-6 rounded-xl border border-brand-border shadow-lg opacity-75">
           <h3 className="font-bold flex items-center gap-2 mb-4 text-white">
             <Mail className="text-brand-cyan"/> Templates de E-mail (Em Breve)
           </h3>
           <p className="text-sm text-slate-400">Este módulo permitirá configurar disparos automáticos para cada etapa do funil.</p>
           <button disabled className="mt-4 bg-slate-700 text-slate-400 px-4 py-2 rounded text-sm cursor-not-allowed">Configurar Templates</button>
        </div>
      </div>
    </div>
  );
}

const ConfigBox = ({ title, icon: Icon, items, val, setVal, onAdd, onDel, placeholder = "Adicionar novo..." }) => (
  <div className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-lg">
    <h3 className="font-bold flex items-center gap-2 mb-4 text-white"><Icon className="text-brand-cyan"/> {title}</h3>
    <div className="flex gap-2 mb-4">
      <input 
        value={val} 
        onChange={e => setVal(e.target.value)} 
        className="bg-brand-dark border border-brand-border p-2 rounded flex-1 text-sm outline-none focus:border-brand-orange text-white" 
        placeholder={placeholder} 
        onKeyDown={(e) => e.key === 'Enter' && onAdd()}
      />
      <button onClick={onAdd} className="bg-brand-orange text-white px-3 rounded text-sm hover:bg-orange-600"><Plus size={18}/></button>
    </div>
    <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
      {items.map(i => (
        <li key={i.id} className="flex justify-between items-center bg-brand-dark p-2 rounded text-sm text-slate-300 border border-brand-border group">
          {i.name} 
          <button onClick={() => onDel(i.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
        </li>
      ))}
    </ul>
  </div>
);