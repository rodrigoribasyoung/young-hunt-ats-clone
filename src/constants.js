// src/constants.js

export const PIPELINE_STAGES = [
  'Inscrito', 
  'Considerado', // Item 1: Novo estágio
  'Primeira Entrevista', 
  'Testes', 
  'Segunda Entrevista', 
  'Selecionado', 
  'Contratado',
  'Reprovado' // Movido para o final do array lógico, embora visualmente possa ser tratado diferente
];

export const STATUS_COLORS = {
  'Inscrito': 'bg-slate-700 text-slate-200 border-slate-600',
  'Considerado': 'bg-blue-900/40 text-blue-300 border-blue-700',
  'Primeira Entrevista': 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30',
  'Testes': 'bg-purple-900/40 text-purple-300 border-purple-700',
  'Segunda Entrevista': 'bg-brand-orange/20 text-brand-orange border-brand-orange/30',
  'Selecionado': 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  'Contratado': 'bg-green-900/40 text-green-300 border-green-700',
  'Reprovado': 'bg-red-900/40 text-red-300 border-red-700'
};