import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Plus, Clock, Layout as LayoutIcon, ChevronRight, Zap } from 'lucide-react';

interface Design {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  originalImageUrl: string;
}

export default function Dashboard() {
  const { user, userData } = useAuth();
  const [designs, setDesigns] = useState<Design[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'designs'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Design));
      setDesigns(data);
    });

    return unsubscribe;
  }, [user]);

  const trialDaysLeft = userData ? 5 - Math.floor((Date.now() - new Date(userData.trialStartDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl font-display font-black mb-3">Bonjour, {user?.displayName?.split(' ')[0]}!</h1>
          <p className="text-ink-muted text-lg">Vous avez <span className="text-white font-bold">{designs.length} designs</span> actifs dans votre espace.</p>
        </div>
        <Link to="/import" className="px-8 py-5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
          <Plus size={24} />
          Importer un Nouveau Design
        </Link>
      </header>

      {/* Trial Status Banner */}
      {userData && !userData.isPremium && (
        <div className="glass-premium rounded-3xl p-8 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent border-white/10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-inner">
              <Zap size={32} />
            </div>
            <div>
              <h3 className="font-black text-2xl mb-1">Essai gratuit en cours</h3>
              <p className="text-ink-muted text-lg">
                Il vous reste <span className="text-white font-black">{Math.max(0, trialDaysLeft)} jours</span> et <span className="text-white font-black">{5 - userData.generationsCount} générations</span>.
              </p>
            </div>
          </div>
          <Link to="/pricing" className="px-8 py-3.5 bg-white text-black text-base font-black rounded-xl hover:bg-ink transition-all shadow-xl active:scale-95">
            Passer au Premium
          </Link>
        </div>
      )}

      {/* Empty State */}
      {designs.length === 0 ? (
        <div className="glass-premium rounded-[3rem] p-24 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-ink-muted/30 mb-10">
            <LayoutIcon size={48} />
          </div>
          <h2 className="text-3xl font-black mb-6">Aucun design pour l'instant</h2>
          <p className="text-ink-muted text-xl max-w-md mb-12 leading-relaxed">
            Importez votre première source d'inspiration et laissez notre IA la répliquer avec vos propres personnalisations.
          </p>
          <Link to="/import" className="px-10 py-5 bg-primary text-white rounded-2xl font-black flex items-center gap-3 hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 active:scale-95">
            Commencer l'aventure
            <ChevronRight size={24} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {designs.map((design) => (
            <motion.div
              layout
              key={design.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-premium rounded-[2.5rem] overflow-hidden group hover:border-primary/40 transition-all border-white/5"
            >
              <div className="aspect-[16/10] bg-black overflow-hidden relative">
                <img 
                  src={design.originalImageUrl} 
                  alt={design.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${
                    design.status === 'completed' ? 'bg-green-500 text-black' : 'bg-primary text-white'
                  }`}>
                    {design.status === 'completed' ? 'Terminé' : design.status}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-black text-2xl mb-3 tracking-tight group-hover:text-primary transition-colors">{design.name}</h3>
                <div className="flex items-center gap-4 text-sm text-ink-muted mb-8 font-medium">
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {new Date(design.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <Link 
                  to={`/edit/${design.id}`} 
                  className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5"
                >
                  {design.status === 'completed' ? 'Voir le Résultat' : 'Continuer l\'Édition'}
                  <ChevronRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
