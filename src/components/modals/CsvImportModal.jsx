import React, { useState } from 'react';
import { UploadCloud, X, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { CSV_FIELD_MAPPING_OPTIONS } from '../../constants';

export default function CsvImportModal({ isOpen, onClose, onImportData }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Options
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importMode, setImportMode] = useState('skip'); // 'skip', 'overwrite', 'duplicate'

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text =evt.target.result;
      const lines = text.split('\n');
      if (lines.length > 0) {
        // Simple CSV parser logic
        const head = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        setHeaders(head);
        
        const data = lines.slice(1).map(line => {
            if(!line.trim()) return null;
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row = {};
            head.forEach((h, i) => row[h] = values[i]);
            return row;
        }).filter(Boolean);
        
        setParsedData(data);
        
        // ... dentro de handleFileUpload, após ler as linhas ...

        setParsedData(data);
        
        // Auto-guess mapping (Lógica Melhorada para seus campos)
        const initialMap = {};
        head.forEach(h => {
            const lowerH = h.toLowerCase().trim();
            
            // Tenta encontrar correspondência exata ou aproximada na lista de constantes
            const foundOption = CSV_FIELD_MAPPING_OPTIONS.find(opt => 
                opt.label.toLowerCase() === lowerH || 
                lowerH.includes(opt.label.toLowerCase())
            );

            if (foundOption) {
                initialMap[h] = foundOption.value;
            } else {
                // Fallbacks genéricos caso o nome mude um pouco
                if(lowerH.includes('nome')) initialMap[h] = 'fullName';
                else if(lowerH.includes('mail')) initialMap[h] = 'email';
                else if(lowerH.includes('cel') || lowerH.includes('whatsapp')) initialMap[h] = 'phone';
                else if(lowerH.includes('cidade')) initialMap[h] = 'city';
                else if(lowerH.includes('currículo') || lowerH.includes('cv')) initialMap[h] = 'cvUrl';
            }
        });
        setMapping(initialMap);
        setStep(2);

      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleMapChange = (header, systemField) => {
    setMapping(prev => ({...prev, [header]: systemField}));
  };

  const finishImport = () => {
    const finalCandidates = parsedData.map(row => {
        const candidate = {};
        Object.keys(mapping).forEach(header => {
            if(mapping[header]) {
                candidate[mapping[header]] = row[header];
            }
        });
        // Default fields
        candidate.status = 'Inscrito';
        candidate.createdAt = new Date().toISOString();
        candidate.imported = true;
        return candidate;
    });

    onImportData(finalCandidates, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-brand-card rounded-xl shadow-2xl w-full max-w-2xl border border-brand-border flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-dark/50">
           <h3 className="font-bold text-xl text-white">Importação em Massa (CSV)</h3>
           <button onClick={onClose}><X className="text-slate-400 hover:text-white"/></button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
           {step === 1 && (
             <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-brand-border rounded-xl bg-brand-dark/30 hover:bg-brand-dark/50 transition-colors">
                <UploadCloud size={48} className="text-brand-cyan mb-4"/>
                <p className="text-white font-medium mb-2">Arraste seu arquivo CSV ou clique para selecionar</p>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="fileInput"/>
                <label htmlFor="fileInput" className="bg-brand-orange text-white px-4 py-2 rounded cursor-pointer hover:bg-orange-600">Escolher Arquivo</label>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-4">
                <p className="text-slate-300 text-sm mb-4">Vincule as colunas do seu arquivo aos campos do sistema:</p>
                {headers.map(header => (
                    <div key={header} className="grid grid-cols-2 gap-4 items-center border-b border-brand-border pb-2">
                        <span className="text-white text-sm font-medium">{header}</span>
                        <div className="flex items-center gap-2">
                           <ArrowRight size={14} className="text-slate-500"/>
                           <select 
                             className="bg-brand-dark border border-brand-border rounded p-2 text-sm text-white w-full focus:border-brand-cyan outline-none"
                             value={mapping[header] || ''}
                             onChange={e => handleMapChange(header, e.target.value)}
                           >
                              <option value="">Ignorar Coluna</option>
                              {CSV_FIELD_MAPPING_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                           </select>
                        </div>
                    </div>
                ))}
             </div>
           )}

           {step === 3 && (
             <div className="space-y-6">
                <div className="bg-brand-cyan/10 border border-brand-cyan/30 p-4 rounded-lg flex gap-3 items-start">
                    <CheckCircle className="text-brand-cyan shrink-0 mt-1" size={20}/>
                    <div>
                        <h4 className="text-white font-bold text-sm">Pronto para importar!</h4>
                        <p className="text-brand-cyan text-sm">{parsedData.length} candidatos encontrados.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-white text-sm font-bold uppercase">Como tratar duplicados? (pelo e-mail)</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 bg-brand-dark border border-brand-border rounded cursor-pointer hover:border-brand-orange">
                            <input type="radio" name="mode" value="skip" checked={importMode === 'skip'} onChange={() => setImportMode('skip')} className="accent-brand-orange"/>
                            <div>
                                <span className="block text-white text-sm font-bold">Pular (Manter atual)</span>
                                <span className="block text-slate-400 text-xs">Se o candidato já existir, não faz nada.</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-brand-dark border border-brand-border rounded cursor-pointer hover:border-brand-orange">
                            <input type="radio" name="mode" value="overwrite" checked={importMode === 'overwrite'} onChange={() => setImportMode('overwrite')} className="accent-brand-orange"/>
                            <div>
                                <span className="block text-white text-sm font-bold">Substituir / Atualizar</span>
                                <span className="block text-slate-400 text-xs">Atualiza os dados do candidato existente com os novos.</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-brand-dark border border-brand-border rounded cursor-pointer hover:border-brand-orange">
                            <input type="radio" name="mode" value="duplicate" checked={importMode === 'duplicate'} onChange={() => setImportMode('duplicate')} className="accent-brand-orange"/>
                            <div>
                                <span className="block text-white text-sm font-bold">Duplicar</span>
                                <span className="block text-slate-400 text-xs">Cria um novo registro mesmo se já existir.</span>
                            </div>
                        </label>
                    </div>
                </div>
             </div>
           )}
        </div>

        <div className="p-6 border-t border-brand-border flex justify-between bg-brand-dark/30">
           {step > 1 && <button onClick={() => setStep(s => s-1)} className="text-slate-400 hover:text-white px-4">Voltar</button>}
           {step < 3 ? (
             <button 
                onClick={() => setStep(s => s+1)} 
                disabled={!file}
                className="ml-auto bg-brand-cyan text-brand-dark font-bold px-6 py-2 rounded hover:bg-cyan-400 disabled:opacity-50"
             >
                Próximo
             </button>
           ) : (
             <button 
                onClick={finishImport} 
                className="ml-auto bg-brand-orange text-white font-bold px-6 py-2 rounded hover:bg-orange-600"
             >
                Confirmar Importação
             </button>
           )}
        </div>
      </div>
    </div>
  );
}