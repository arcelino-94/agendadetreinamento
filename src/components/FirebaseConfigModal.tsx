import React, { useState } from 'react';
import { X, Database, CheckCircle2, Copy, Check, Server, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_FIREBASE_CONFIG } from '../lib/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isFirebaseConnected, firebaseConfig, setFirebaseConfig } = useApp();
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'hosting'>('status');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form local states
  const currentConfig = firebaseConfig || DEFAULT_FIREBASE_CONFIG;
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain);
  const [projectId, setProjectId] = useState(currentConfig.projectId);
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket);
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId);
  const [appId, setAppId] = useState(currentConfig.appId);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseConfig({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRestoreDefault = () => {
    setApiKey(DEFAULT_FIREBASE_CONFIG.apiKey);
    setAuthDomain(DEFAULT_FIREBASE_CONFIG.authDomain);
    setProjectId(DEFAULT_FIREBASE_CONFIG.projectId);
    setStorageBucket(DEFAULT_FIREBASE_CONFIG.storageBucket);
    setMessagingSenderId(DEFAULT_FIREBASE_CONFIG.messagingSenderId);
    setAppId(DEFAULT_FIREBASE_CONFIG.appId);
    setFirebaseConfig(DEFAULT_FIREBASE_CONFIG);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const codeSnippet = `<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";

  const firebaseConfig = {
    apiKey: "${apiKey}",
    authDomain: "${authDomain}",
    projectId: "${projectId}",
    storageBucket: "${storageBucket}",
    messagingSenderId: "${messagingSenderId}",
    appId: "${appId}",
    measurementId: "G-FGQCYY9TZ7"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Projeto Firebase: <span className="font-mono text-amber-600 dark:text-amber-400">{projectId}</span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Sincronização Firestore & Hospedagem Firebase Hosting
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-1.5 rounded-md text-center transition-all ${
              activeTab === 'status'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Status & Conectividade
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 rounded-md text-center transition-all ${
              activeTab === 'config'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Credenciais SDK
          </button>
          <button
            onClick={() => setActiveTab('hosting')}
            className={`flex-1 py-1.5 rounded-md text-center transition-all ${
              activeTab === 'hosting'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Hospedar (Hosting)
          </button>
        </div>

        {/* Content */}
        {activeTab === 'status' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Firestore Conectado: agenda-treinamento-dtm</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-tight">
                Sua aplicação está sincronizada em tempo real com o banco de dados Firebase no projeto <strong className="font-mono">agenda-treinamento-dtm</strong>.
              </p>
            </div>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px]">
                <span>ID do Projeto:</span>
                <strong className="font-mono text-slate-900 dark:text-white">{projectId}</strong>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px]">
                <span>Domínio de Autenticação:</span>
                <strong className="font-mono text-slate-900 dark:text-white">{authDomain}</strong>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px]">
                <span>Storage Bucket:</span>
                <strong className="font-mono text-slate-900 dark:text-white">{storageBucket}</strong>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px]">
                <span>Coleção Ativa:</span>
                <strong className="font-mono text-indigo-600 dark:text-indigo-400">/treinamentos_td/main_state</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-2.5 text-xs">
            {savedSuccess && (
              <div className="p-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Configurações salvas com sucesso!</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Project ID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">App ID</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 font-mono text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Auth Domain</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Storage Bucket</label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleRestoreDefault}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restaurar agenda-treinamento-dtm</span>
              </button>

              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-all shadow-2xs"
              >
                Salvar Configurações
              </button>
            </div>
          </form>
        )}

        {activeTab === 'hosting' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-1.5 text-indigo-900 dark:text-indigo-200 font-bold">
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Instruções para Hospedagem no Firebase Hosting</span>
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-tight">
                Para hospedar seu aplicativo no Firebase Hosting sob o projeto <strong className="font-mono">agenda-treinamento-dtm</strong>, execute os passos abaixo no terminal:
              </p>
            </div>

            <div className="space-y-2 font-mono text-[11px] bg-slate-950 text-slate-200 p-3 rounded-lg overflow-x-auto relative">
              <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800 font-sans">
                <span>Comandos de Deploy Firebase</span>
                <button
                  onClick={copySnippet}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-sans"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Snippet'}</span>
                </button>
              </div>

              <p className="text-emerald-400"># 1. Gerar Build de Produção</p>
              <p className="text-white">npm run build</p>
              
              <p className="text-emerald-400 pt-1"># 2. Login & Inicialização no Firebase</p>
              <p className="text-white">npx firebase-tools login</p>
              <p className="text-white">npx firebase-tools init hosting --project {projectId}</p>

              <p className="text-emerald-400 pt-1"># 3. Fazer Deploy para Produção</p>
              <p className="text-white">npx firebase-tools deploy --only hosting</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>URL de Produção Estimada:</span>
              <a
                href={`https://${projectId}.web.app`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center space-x-1 hover:underline"
              >
                <span>https://{projectId}.web.app</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-2xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
