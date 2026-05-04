import React from 'react';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, Shield, Rocket } from 'lucide-react';

export default function PricingPage() {
  const { userData } = useAuth();

    const plans = [
    {
      name: 'Essai Gratuit',
      price: '0',
      period: '5 Jours',
      features: [
        '5 Générations par IA',
        '10 Imports de Design',
        'Analyse de Base',
        'Mockups de Prévisualisation'
      ],
      current: !userData?.isPremium,
      cta: 'Plan Actuel',
      icon: <Sparkles className="text-primary" />
    },
    {
      name: 'Premium',
      price: '19',
      period: 'Mois',
      features: [
        'Générations IA Illimitées',
        'Imports Illimités',
        'Extraction de Composants Avancée',
        'Export React & HTML/CSS',
        'Support Prioritaire'
      ],
      current: userData?.isPremium,
      cta: 'Devenir Premium',
      popular: true,
      icon: <Rocket className="text-secondary" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="text-center mb-24 relative">
        <h1 className="text-6xl font-display font-black mb-6 tracking-tight">Tarification simple et transparente</h1>
        <p className="text-ink-muted text-2xl max-w-2xl mx-auto leading-relaxed">Choisissez le plan qui correspond à votre ambition créative.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto relative">
        {plans.map((plan, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className={`relative p-12 rounded-[3.5rem] glass-premium border border-white/5 transition-all hover:scale-[1.03] ${plan.popular ? 'shadow-[0_0_80px_rgba(139,92,246,0.15)] ring-1 ring-primary/20' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">
                Le plus populaire
              </div>
            )}
            
            <div className="flex items-center gap-6 mb-10">
              <div className="w-14 h-14 glass-premium rounded-2xl flex items-center justify-center border-white/5 shadow-inner">
                {plan.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black font-display">{plan.name}</h3>
                <p className="text-ink-muted text-xs font-black uppercase tracking-widest opacity-60">{plan.period}</p>
              </div>
            </div>

            <div className="mb-10 items-baseline flex gap-2">
              <span className="text-6xl font-black tracking-tighter">{plan.price}€</span>
              <span className="text-ink-muted font-black text-sm uppercase tracking-widest">/{plan.period === 'Mois' ? 'mois' : 'offre'}</span>
            </div>

            <ul className="space-y-5 mb-12">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-4 text-sm font-black text-ink-muted/90 uppercase tracking-wide">
                  <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 border border-primary/20">
                    <Check size={14} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              disabled={plan.current}
              className={`w-full py-6 rounded-2xl font-black text-lg transition-all shadow-2xl ${
                plan.current 
                  ? 'bg-white/5 text-ink-muted/30 cursor-not-allowed border border-white/5' 
                  : 'bg-primary hover:bg-primary-dark text-white shadow-primary/25 active:scale-95'
              }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 glass-premium p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 bg-white/[0.01] border-dashed border-white/10 max-w-5xl mx-auto">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center text-primary shadow-inner border border-white/5">
            <Shield size={36} />
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-black font-display">Transactions Sécurisées</h4>
            <p className="text-ink-muted text-lg">Les paiements sont traités en toute sécurité via Stripe. Annulation possible à tout moment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
