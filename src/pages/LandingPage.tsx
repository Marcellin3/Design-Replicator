import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-40 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-premium rounded-full text-primary text-xs font-black tracking-widest mb-10 border-primary/20">
            <Sparkles size={14} />
            MOTEUR DE DESIGN IA NOUVELLE GÉNÉRATION
          </div>
          <h1 className="font-display font-black text-6xl md:text-8xl leading-[1.1] mb-10 tracking-tight">
            Transformez <span className="italic text-primary">chaque design</span> <br /> 
            en votre propre création avec <span className="text-gradient">Gemini AI</span>
          </h1>
          <p className="text-ink-muted text-lg md:text-2xl max-w-3xl mx-auto mb-16 leading-relaxed">
            Importez une image, décrivez votre vision et obtenez un design unique en quelques secondes. 
            Le pont ultime entre l'inspiration et la création.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/auth" className="w-full sm:w-auto px-10 py-5 bg-white text-black hover:bg-white/90 rounded-2xl font-black flex items-center justify-center gap-3 text-xl shadow-2xl transition-all hover:scale-105 active:scale-95">
              Démarrer l'Essai Gratuit
              <ArrowRight size={22} />
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto px-10 py-5 glass-premium rounded-2xl font-black flex items-center justify-center gap-3 text-xl transition-all hover:bg-white/5 active:scale-95">
              Voir les Tarifs
            </Link>
          </div>
        </motion.div>

        {/* Visual Demo Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          className="mt-32 relative max-w-6xl mx-auto aspect-video rounded-[3rem] overflow-hidden glass-premium p-6 shadow-[0_0_100px_rgba(139,92,246,0.1)]"
        >
          <div className="w-full h-full bg-surface rounded-[2rem] flex items-center justify-center overflow-hidden border border-white/5">
            <div className="grid grid-cols-2 w-full h-full">
              <div className="border-r border-white/5 p-12 flex flex-col justify-center gap-6 text-left bg-black/20">
                <span className="text-xs uppercase tracking-[0.2em] text-ink-muted font-black opacity-50">Inspiration</span>
                <div className="space-y-4">
                  <div className="h-6 w-3/4 bg-white/5 rounded-full" />
                  <div className="h-48 w-full bg-white/10 rounded-2xl border border-white/5" />
                  <div className="h-6 w-1/2 bg-white/5 rounded-full" />
                </div>
              </div>
              <div className="p-12 flex flex-col justify-center gap-6 text-left relative overflow-hidden bg-primary/5">
                <div className="absolute inset-0 bg-primary/20 blur-[100px]" />
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-black relative">Répliqué par l'IA</span>
                <div className="space-y-4 relative">
                  <div className="h-6 w-3/4 bg-primary/20 rounded-full" />
                  <div className="h-48 w-full bg-primary/30 rounded-2xl border border-primary/40 shadow-2xl shadow-primary/20" />
                  <div className="h-6 w-1/2 bg-primary/20 rounded-full" />
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.5)] border-4 border-background rotate-12">
              <Zap size={32} className="text-white" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-32 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { icon: <Layers />, title: "Analyse Structurelle", desc: "Notre IA décompose les sections, composants et styles avec une précision chirurgicale." },
            { icon: <Sparkles />, title: "Prompts Intelligents", desc: "Dites simplement 'Rends-le plus moderne'—l'IA comprend votre intention créative." },
            { icon: <ShieldCheck />, title: "Export Haute Qualité", desc: "Obtenez des mockups haute résolution prêts à être présentés à vos clients." }
          ].map((f, i) => (
            <div key={i} className="p-10 glass-premium rounded-[2.5rem] hover:border-primary/50 transition-colors group">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-2xl font-black mb-6 font-display tracking-tight">{f.title}</h3>
              <p className="text-ink-muted leading-relaxed text-lg">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
