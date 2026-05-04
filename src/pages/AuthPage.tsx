import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12 relative overflow-hidden bg-background">
      {/* Premium Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full animate-pulse delay-1000 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full glass-premium p-10 rounded-[3rem] border-white/10 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-3xl mx-auto flex items-center justify-center text-white font-black text-3xl mb-8 shadow-[0_0_40px_rgba(139,92,246,0.4)] rotate-12 transition-transform hover:rotate-0">
            AI
          </div>
          <h2 className="text-4xl font-display font-black mb-4 tracking-tighter">
            {isLogin ? 'Bon retour' : 'Créer un compte'}
          </h2>
          <p className="text-ink-muted text-lg leading-relaxed">
            {isLogin ? 'Connectez-vous pour continuer votre voyage créatif' : 'Commencez votre essai gratuit de 5 jours dès aujourd\'hui'}
          </p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-4 py-4.5 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all active:scale-95 shadow-xl"
          >
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
            Continuer avec Google
          </button>
          
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black"><span className="bg-background px-6 text-ink-muted/50">OU</span></div>
          </div>

          <div className="space-y-5 opacity-40 grayscale pointer-events-none">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] ml-2">Email</label>
              <input type="email" placeholder="nom@exemple.com" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-primary/40 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] ml-2">Mot de passe</label>
              <input type="password" placeholder="••••••••" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-primary/40 transition-colors" />
            </div>
          </div>

          <button className="w-full py-5 glass-premium text-ink-muted font-black rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed border-white/5 uppercase tracking-widest text-xs">
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'Se Connecter' : 'S\'Inscrire'} (Bientôt)
          </button>
          
          <p className="text-center text-sm text-ink-muted mt-10">
            {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-black hover:underline transition-all">
              {isLogin ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
