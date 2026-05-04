import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeImage, generateReplicatedImage } from '../lib/gemini';
import { 
  Loader2, Sparkles, Download, 
  ChevronLeft, Layout, Palette, Type as TypeIcon,
  Play, ImageIcon, CheckCircle, AlertTriangle, Eye, ImagePlus, X, Upload
} from 'lucide-react';

export default function EditorPage() {
  const { designId } = useParams();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'inspiration' | 'result'>('inspiration');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesign = async () => {
      if (!designId) return;
      const docRef = doc(db, 'designs', designId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setDesign({ id: snap.id, ...data });
        
        // Auto-analyze if status is draft
        if (data.status === 'draft') {
          handleAutoAnalyze(snap.id, data.originalImageUrl);
        }

        // If already completed, show result tab
        if (data.status === 'completed') {
          setActiveTab('result');
        }
      }
      setLoading(false);
    };
    fetchDesign();
  }, [designId]);

  const handleAutoAnalyze = async (id: string, imageUrl: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeImage(imageUrl);
      await updateDoc(doc(db, 'designs', id), {
        status: 'analyzing',
        analysis: analysis
      });
      setDesign((prev: any) => ({ ...prev, status: 'analyzing', analysis }));
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReferenceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReferenceImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt || !design || !designId) return;

    // Trial limits
    if (userData && !userData.isPremium && userData.generationsCount >= 5) {
      alert("Limite de génération atteinte. Passez au Premium pour continuer.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await generateReplicatedImage(design.originalImageUrl, design.analysis, prompt, referenceImage);
      
      const docRef = doc(db, 'designs', designId);
      await updateDoc(docRef, {
        status: 'completed',
        prompt: prompt,
        generatedImageUrl: imageUrl
      });
      
      // Increment user generation count
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          generationsCount: increment(1)
        });
      }

      setDesign((prev: any) => ({ ...prev, status: 'completed', generatedImageUrl: imageUrl, prompt }));
      setActiveTab('result');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Une erreur est survenue lors de la génération. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (userData && !userData.isPremium) {
      const trialDaysLeft = 5 - Math.floor((Date.now() - new Date(userData.trialStartDate).getTime()) / (1000 * 60 * 60 * 24));
      if (trialDaysLeft <= 0) {
        setIsExpired(true);
      }
    }
  }, [userData]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  if (isExpired && !userData?.isPremium) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full glass-premium p-12 rounded-[3rem] text-center space-y-8 border-white/5">
          <div className="w-24 h-24 bg-accent/10 text-accent rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-4xl font-display font-black">Essai Expiré</h2>
          <p className="text-ink-muted text-lg leading-relaxed">
            Votre essai gratuit de 5 jours est terminé. Passez à la version **Premium** pour débloquer la puissance illimitée de notre IA.
          </p>
          <div className="pt-6 flex flex-col gap-4">
             <Link to="/pricing" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all hover:scale-105">
              Passer au Premium
            </Link>
            <Link to="/dashboard" className="text-sm text-ink-muted hover:text-white font-black uppercase tracking-widest transition-colors">
              Retour au Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!design) return <div className="p-20 text-center bg-background h-screen flex items-center justify-center font-display text-2xl font-black">Design introuvable.</div>;

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-4 overflow-hidden bg-background">
      {/* Left Sidebar: Analysis & Instructions */}
      <aside className="lg:col-span-1 border-r border-white/5 bg-surface/30 p-8 overflow-y-auto space-y-10 custom-scrollbar">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-ink-muted hover:text-primary mb-6 transition-all hover:-translate-x-1 font-black uppercase tracking-widest text-[10px]">
          <ChevronLeft size={16} /> Retour
        </button>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-ink-muted">Analyse du Design</h3>
            {isAnalyzing && <Loader2 className="animate-spin text-primary" size={14} />}
          </div>
          
          <div className="space-y-4">
            <div className="glass-premium p-5 rounded-2xl space-y-4 border-white/5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                <Layout size={14} /> Structure
              </div>
              <div className="flex flex-wrap gap-2">
                {design.analysis?.layout?.map((l: string, i: number) => (
                  <span key={i} className="text-[9px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md uppercase font-black text-ink-muted/80">{l}</span>
                )) || <span className="text-[10px] italic text-ink-muted/40 font-medium">Analyse en cours...</span>}
              </div>
            </div>

            <div className="glass-premium p-5 rounded-2xl space-y-4 border-white/5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary">
                <Palette size={14} /> Palette
              </div>
              <div className="flex gap-2.5">
                {design.analysis?.colors?.map((c: string, i: number) => (
                  <div key={i} className="w-7 h-7 rounded-lg border border-white/10 shadow-lg" style={{ backgroundColor: c }} title={c} />
                )) || <span className="text-[10px] italic text-ink-muted/40 font-medium">Scan des couleurs...</span>}
              </div>
            </div>

            <div className="glass-premium p-5 rounded-2xl space-y-4 border-white/5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-accent">
                <TypeIcon size={14} /> Typo
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed font-medium">
                {design.analysis?.typography || "Détection en cours..."}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6 pt-10 border-t border-white/5">
          <div className="flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] text-ink-muted mb-4 leading-none">
            <Sparkles size={14} className="text-primary" />
            Configuration IA
          </div>
          
          <div className="space-y-5">
            <div className="relative group">
               <label className="text-[9px] font-black text-ink-muted uppercase tracking-[0.2em] ml-2 mb-2 block">Instructions de Modification</label>
               <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: 'Change les couleurs en violet néon, adopte un style brutaliste et minimaliste...'"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 pb-16 text-sm min-h-[180px] outline-none focus:border-primary/40 transition-all resize-none shadow-inner placeholder:text-ink-muted/30 font-medium leading-relaxed"
                />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="pointer-events-auto">
                    {!referenceImage ? (
                      <button 
                        onClick={() => document.getElementById('ref-upload')?.click()}
                        className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] text-ink-muted transition-all border border-white/5 hover:border-primary/30"
                      >
                        <ImagePlus size={14} className="text-primary" />
                        Ajouter une image
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 pl-1 pr-3 py-1 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-md">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                          <img src={referenceImage} className="w-full h-full object-cover" alt="Ref" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-primary tracking-tighter">Image active</span>
                        <button onClick={() => setReferenceImage(null)} className="p-1 text-primary hover:text-accent transition-colors ml-1">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-[10px] font-black text-ink-muted/20 uppercase tracking-widest hidden sm:block">
                    {prompt.length} chars
                  </div>
                </div>
              </div>
              <input 
                id="ref-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleReferenceFile} 
              />
            </div>

            {error && (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-3 animate-shake">
                <AlertTriangle size={18} className="text-accent shrink-0 mt-0.5" />
                <p className="text-[11px] text-accent font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-5 bg-primary hover:bg-primary-dark text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 disabled:opacity-30 transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)] active:scale-95 text-lg"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Play size={20} fill="currentColor" />}
              {isGenerating ? 'Calcul en cours...' : 'Générer le Design'}
            </button>
          </div>
          
          <div className="flex flex-col gap-2.5 mt-6">
            <span className="text-[9px] font-black text-ink-muted uppercase tracking-[0.2em] ml-2">Suggestions Rapides</span>
            {['Dark Mode Premium', 'Esthétique Apple', 'Style Cyberpunk', 'Minimalisme Extrême'].map((s, i) => (
              <button key={i} onClick={() => setPrompt(s)} className="text-left text-[11px] font-bold bg-white/[0.03] hover:bg-white/[0.08] p-3 rounded-xl text-ink-muted hover:text-white transition-all border border-white/5">
                {s}
              </button>
            ))}
          </div>
        </section>
      </aside>

      {/* Main Preview Area */}
      <main className="lg:col-span-3 bg-background flex flex-col relative">
        <div className="absolute inset-0 bg-primary/5 blur-[150px] pointer-events-none" />
        
        {/* Toolbar */}
        <div className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-surface/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('inspiration')}
              className={`h-full flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all relative ${activeTab === 'inspiration' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-white'}`}
            >
              <Eye size={16} /> Inspiration
            </button>
            <button 
              onClick={() => setActiveTab('result')}
              disabled={!design.generatedImageUrl}
              className={`h-full flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all disabled:opacity-10 relative ${activeTab === 'result' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-white'}`}
            >
              <ImagePlus size={16} /> Résultat IA
            </button>
          </div>
          
          <div className="flex items-center gap-4">
             {design.status === 'completed' && (
              <a 
                href={design.generatedImageUrl} 
                download={`ai-design-premium-${designId}.png`}
                className="px-6 py-3 glass-premium rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 transition-all text-white border-white/5 shadow-xl"
              >
                <Download size={18} />
                Exporter
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-12 relative flex items-center justify-center bg-transparent">
          <AnimatePresence mode="wait">
            {activeTab === 'inspiration' ? (
              <motion.div 
                key="inspiration"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl w-full"
              >
                <div className="relative glass-premium rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] group border-white/10">
                  <img 
                    src={design.originalImageUrl} 
                    alt="Original Inspiration" 
                    className="w-full h-auto object-contain max-h-[65vh] mx-auto opacity-90 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/40 to-transparent flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform">
                    <span className="font-display font-black text-2xl">Image Source</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink-muted">Inspiration d'origine</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl w-full"
              >
                {design.status === 'completed' ? (
                  <div className="relative glass-premium rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(139,92,246,0.3)] border-white/10">
                    <img 
                      src={design.generatedImageUrl} 
                      alt="Generated Result" 
                      className="w-full h-auto object-contain max-h-[65vh] mx-auto shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-8 right-8 bg-primary text-white px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl animate-pulse">
                      Généré par l'IA
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video glass-premium rounded-[4rem] flex flex-col items-center justify-center gap-10 p-24 text-center border-white/5 bg-white/[0.01]">
                    {isGenerating ? (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary blur-[40px] opacity-40 animate-pulse" />
                          <Sparkles className="text-primary relative" size={80} />
                          <Loader2 className="absolute -top-4 -right-4 animate-spin text-secondary" size={32} />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-4xl font-display font-black">Réplication en cours...</h3>
                          <p className="text-ink-muted text-xl max-w-md mx-auto leading-relaxed">Nous distillons votre vision pour créer un design parfaitement équilibré.</p>
                        </div>
                        <div className="w-80 h-3 bg-white/5 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                            initial={{ width: "0%" }}
                            animate={{ width: "98%" }}
                            transition={{ duration: 25, ease: "linear" }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] flex items-center justify-center text-ink-muted/30 border border-white/5">
                          <ImageIcon size={48} />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-3xl font-display font-black">Prêt à Générer</h3>
                          <p className="text-ink-muted text-xl max-w-sm mx-auto leading-relaxed">
                            Configurez vos instructions à gauche pour lancer la réplication premium.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
