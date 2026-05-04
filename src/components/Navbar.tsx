import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { LogOut, Layout as LayoutIcon, User as UserIcon } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center px-6 border-b border-white/5">
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/40 group-hover:rotate-12 transition-transform">
          AI
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-white">Design Replicator</span>
      </div>
      
      <div className="ml-auto flex items-center gap-8">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link flex items-center gap-2">
              <LayoutIcon size={18} />
              Tableau de bord
            </Link>
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary p-[1px]">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-white">
                  <UserIcon size={16} />
                </div>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="p-2 hover:bg-white/5 rounded-lg text-ink-muted hover:text-accent transition-colors"
                title="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/auth" className="nav-link">
              Connexion
            </Link>
            <Link to="/auth" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              Essayer Gratuitement
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
