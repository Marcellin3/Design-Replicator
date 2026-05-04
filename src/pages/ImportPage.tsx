import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';

export default function ImportPage() {
  const { user, userData } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Auto-set name from filename
    if (!name) {
      setName(file.name.split('.')[0].replace(/[-_]/g, ' '));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!user || !preview) return;
    
    // Check trial limits
    if (userData && !userData.isPremium && userData.importsCount >= 10) {
      alert("Import limit reached for free trial.");
      return;
    }

    setIsUploading(true);
    try {
      const designData = {
        ownerId: user.uid,
        name: name || 'Untitled Design',
        status: 'draft',
        originalImageUrl: preview, // Note: In production use Storage
        createdAt: new Date().toISOString(),
        prompt: '',
        generatedCode: '',
        analysis: {}
      };

      const docRef = await addDoc(collection(db, 'designs'), designData);
      
      // Update user stats (simplified)
      // Note: In real app, increment atomicaly
      
      navigate(`/edit/${docRef.id}`);
    } catch (error) {
      console.error('Error creating design:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-ink-muted hover:text-ink mb-12 transition-all hover:-translate-x-1"
      >
        <ChevronLeft size={20} />
        Retour au Tableau de Bord
      </button>

      <div className="mb-14">
        <h1 className="text-5xl font-display font-black mb-4 tracking-tight">Importer un Design</h1>
        <p className="text-ink-muted text-xl">Téléchargez une capture d'écran ou une image d'un design qui vous inspire.</p>
      </div>

      <div className="space-y-10">
        {!preview ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="aspect-video glass-premium rounded-[3rem] border-2 border-dashed border-white/5 hover:border-primary/50 flex flex-col items-center justify-center p-12 transition-all cursor-pointer group bg-white/[0.01]"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
              <Upload size={40} />
            </div>
            <h3 className="text-3xl font-black mb-4 font-display">Glissez & Déposez ici</h3>
            <p className="text-ink-muted mb-10 text-center max-w-xs text-lg">
              Supporte JPG, PNG et WEBP. Les captures haute résolution fonctionnent mieux.
            </p>
            <button className="px-10 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black flex items-center gap-3 transition-all border border-white/10 active:scale-95">
              <ImageIcon size={24} />
              Choisir un Fichier
            </button>
            <input 
              id="file-input" 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            <div className="aspect-video glass-premium rounded-[3rem] overflow-hidden relative group border border-white/5 shadow-2xl">
              <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => setPreview(null)}
                  className="px-8 py-3 bg-white text-black font-black rounded-xl shadow-2xl hover:scale-105 transition-all"
                >
                  Changer l'image
                </button>
              </div>
            </div>

            <div className="glass-premium p-10 rounded-[2.5rem] space-y-8 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
              <div className="space-y-3">
                <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em] ml-2">Nom du Projet</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Landing Page Moderne"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-6 outline-none focus:border-primary/40 text-2xl font-black transition-all placeholder:text-ink-muted/30"
                />
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isUploading}
                className="w-full py-6 bg-primary hover:bg-primary-dark text-white rounded-[1.5rem] font-black text-2xl flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(139,92,246,0.3)] disabled:opacity-50 transition-all active:scale-95"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {isUploading ? 'Analyse en cours...' : 'Analyser avec l\'IA'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
