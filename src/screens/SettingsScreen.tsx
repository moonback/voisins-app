import { motion } from 'framer-motion';
import { ArrowLeft, Bell, ChevronRight, Globe, HelpCircle, Lock, Moon, Shield, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';

type PreferenceItemProps = {
  icon: typeof Bell;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

type ActionItemProps = {
  icon: typeof Bell;
  label: string;
  description: string;
  value?: string;
};

function PreferenceItem({ icon: Icon, label, description, enabled, onToggle }: PreferenceItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function ActionItem({ icon: Icon, label, description, value = 'Bientot' }: ActionItemProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400">{value}</span>
        <ChevronRight className="h-5 w-5 text-slate-300" />
      </div>
    </button>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: false,
    darkMode: false,
    locationSharing: true,
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }

    loadProfile();
  }, [user]);

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex h-full flex-col overflow-y-auto bg-slate-50 pb-8"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 pb-5 pt-12">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Parametres</h1>
            <p className="mt-1 text-sm text-slate-500">Gerez vos preferences et votre compte.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
              <UserCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Compte</h2>
              <p className="text-sm text-slate-500">Informations principales de votre profil.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nom</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur' : 'Chargement...'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{user?.email || 'Non renseigne'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mode de compte</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {profile?.role === 'provider' ? 'Realisateur' : profile?.role === 'client' ? 'Client' : 'Hybride'}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 px-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Preferences</h2>
          </div>

          <div className="space-y-3">
            <PreferenceItem
              icon={Bell}
              label="Notifications push"
              description="Recevez des alertes instantanees pour vos missions et messages."
              enabled={preferences.pushNotifications}
              onToggle={() => togglePreference('pushNotifications')}
            />
            <PreferenceItem
              icon={Globe}
              label="Emails de suivi"
              description="Recevez un recapitulatif important par email."
              enabled={preferences.emailNotifications}
              onToggle={() => togglePreference('emailNotifications')}
            />
            <PreferenceItem
              icon={Moon}
              label="Mode sombre"
              description="Prepare l'interface pour un affichage plus confortable."
              enabled={preferences.darkMode}
              onToggle={() => togglePreference('darkMode')}
            />
            <PreferenceItem
              icon={Shield}
              label="Partage de localisation"
              description="Ameliore les suggestions et les recherches a proximite."
              enabled={preferences.locationSharing}
              onToggle={() => togglePreference('locationSharing')}
            />
          </div>
        </section>

        <section>
          <div className="mb-3 px-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Securite et aide</h2>
          </div>

          <div className="space-y-3">
            <ActionItem
              icon={Lock}
              label="Mot de passe"
              description="Mettez a jour la securite de votre compte."
            />
            <ActionItem
              icon={Shield}
              label="Confidentialite"
              description="Consultez les regles de visibilite et de protection."
            />
            <ActionItem
              icon={HelpCircle}
              label="Aide et support"
              description="Trouvez des reponses rapides pour utiliser l'application."
            />
          </div>
        </section>
      </div>
    </motion.div>
  );
}
