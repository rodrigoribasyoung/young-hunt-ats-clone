// src/components/modals/TransitionModal.jsx
import React, { useState } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';

export default function TransitionModal({ transition, onClose, onConfirm }) {
  // transition contém: { candidate, toStage, missingFields, isConclusion }
  
  // Estado local para preencher os campos que faltam
  const [data, setData] = useState({
    feedback: '',
    returnSent: false,
    ...transition.candidate // Pré-carrega dados existentes
  });

  const handleSave = () => {
    // Validação básica se for conclusão
    if (transition.isConclusion && !data.feedback) {
      alert("O feedback/motivo é obrigatório nesta etapa.");
      return;
    }
    
    // Passa os dados atualizados de volta
    onConfirm(data);
  };

  // Mapeamento de nomes de campos para rótulos legíveis
  const fieldLabels = {
    city: 'Cidade',
    hasLicense: 'Possui CNH?',
    interestAreas: 'Áreas de Interesse',
    education: 'Formação Acadêmica',
    experience: 'Experiência Anterior',
    maritalStatus: 'Estado Civil',
    source: 'Onde encontrou (Fonte)'
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-brand-card rounded-xl shadow-2xl w-full max-w-md border border-brand-orange animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-brand-orange/10">
          <h3 className="font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-brand-orange" />
            Movimentação Necessária
          </h3>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white" /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-300">
            Para mover <strong>{transition.candidate.fullName}</strong> para <strong>{transition.toStage}</strong>, preencha os dados obrigatórios:
          </p>

          {/* Campos Faltantes (Item 6) */}
          {transition.missingFields.map(field => (
            <div key={field}>
              <label className="block text-xs font-bold text-brand-cyan uppercase mb-1.5">{fieldLabels[field] || field}</label>
              {field === 'hasLicense' ? (
                 <select 
                    className="w-full bg-brand-dark border border-brand-border p-2 rounded text-white text-sm"
                    value={data[field] || ''}
                    onChange={e => setData({...data, [field]: e.target.value})}
                 >
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                 </select>
              ) : (
                <input 
                  className="w-full bg-brand-dark border border-brand-border p-2 rounded text-white text-sm"
                  value={data[field] || ''}
                  onChange={e => setData({...data, [field]: e.target.value})}
                />
              )}
            </div>
          ))}

          {/* Item 7: Feedback e Retorno para Selecionado/Reprovado */}
          {transition.isConclusion && (
            <div className="space-y-4 pt-2 border-t border-brand-border">
               <div>
                  <label className="block text-xs font-bold text-brand-cyan uppercase mb-1.5">Motivo / Feedback</label>
                  <textarea 
                    className="w-full bg-brand-dark border border-brand-border p-2 rounded text-white text-sm h-24"
                    placeholder="Descreva o motivo da aprovação ou reprovação..."
                    value={data.feedback}
                    onChange={e => setData({...data, feedback: e.target.value})}
                  />
               </div>
               <div className="flex items-center gap-2 bg-brand-dark p-3 rounded border border-brand-border">
                  <input 
                    type="checkbox" 
                    id="returnSent"
                    className="w-4 h-4 accent-brand-orange"
                    checked={data.returnSent}
                    onChange={e => setData({...data, returnSent: e.target.checked})}
                  />
                  <label htmlFor="returnSent" className="text-sm text-white cursor-pointer select-none">
                    Confirmo que o retorno (feedback) foi enviado ao candidato.
                  </label>
               </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-brand-dark/50 flex justify-end gap-2 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white rounded text-sm">Cancelar</button>
          <button onClick={handleSave} className="bg-brand-orange text-white px-4 py-2 rounded text-sm font-bold hover:bg-orange-600 flex items-center gap-2">
            <Save size={16} /> Salvar e Mover
          </button>
        </div>
      </div>
    </div>
  );
}