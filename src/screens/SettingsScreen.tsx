import { motion } from 'framer-motion';
import { ArrowLeft, Bell, ChevronRight, Globe, HelpCircle, Lock, Moon, Shield, UserCircle2, MapPin, BadgeCheck, CalendarDays, Sparkles, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';

type ProfileData = {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: 'client' | 'provider' | 'both' | null;
  rating?: number | null;
  reviews_count?: number | null;
  missions_completed?: number | null;
  skills?: string[] | null;
  address?: string | null;
  is_available?: boolean | null;
  created_at?: string | null;
};

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

function getRoleLabel(role?: ProfileData['role']) {
  if (role === 'provider') return 'Realisateur';
  if (role === 'client') return 'Client';
  return 'Hybride';
}

type ProfileFormState = {
  first_name: string;
  last_name: string;
  avatar_url: string;
  bio: string;
  role: 'client' | 'provider' | 'both';
  address: string;
  is_available: boolean;
  skillsText: string;
};

export function SettingsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: false,
    darkMode: false,
    locationSharing: true,
  });
  const [form, setForm] = useState<ProfileFormState>({
    first_name: '',
    last_name: '',
    avatar_url: '',
    bio: '',
    role: 'client',
    address: '',
    is_available: true,
    skillsText: '',
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data as ProfileData);
    }

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!profile) return;

    setForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      avatar_url: profile.avatar_url || '',
      bio: profile.bio || '',
      role: profile.role || 'client',
      address: profile.address || '',
      is_available: profile.is_available !== false,
      skillsText: profile.skills?.join(', ') || '',
    });
  }, [profile]);

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);
    setSaveMessage(null);

    const payload = {
      id: user.id,
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      bio: form.bio.trim() || null,
      role: form.role,
      address: form.address.trim() || null,
      is_available: form.is_available,
      skills: form.skillsText
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      setSaveMessage(error.message);
      setSavingProfile(false);
      return;
    }

    setProfile(data as ProfileData);
    setSaveMessage('Profil mis a jour avec succes.');
    setSavingProfile(false);
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50">
              <UserCircle2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Modifier mon profil</h2>
              <p className="text-sm text-slate-500">Mettez a jour les champs de la table `profiles` visibles dans l'application.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Prenom</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  placeholder="Votre prenom"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Nom</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">URL avatar</label>
              <input
                type="text"
                value={form.avatar_url}
                onChange={(e) => setForm((current) => ({ ...current, avatar_url: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Bio</label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                placeholder="Parlez un peu de vous et de vos services..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Mode de compte</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((current) => ({ ...current, role: e.target.value as ProfileFormState['role'] }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >
                  <option value="client">Client</option>
                  <option value="provider">Realisateur</option>
                  <option value="both">Hybride</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Adresse</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  placeholder="Ville, quartier..."
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Competences</label>
              <input
                type="text"
                value={form.skillsText}
                onChange={(e) => setForm((current) => ({ ...current, skillsText: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                placeholder="Bricolage, Jardinage, Menage"
              />
              <p className="mt-1 text-xs text-slate-500">Separez les competences par des virgules.</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Disponibilite</p>
                <p className="mt-1 text-xs text-slate-500">Indique si vous etes disponible pour de nouvelles missions.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, is_available: !current.is_available }))}
                aria-pressed={form.is_available}
                className={`relative h-7 w-12 rounded-full transition-colors ${form.is_available ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${form.is_available ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {saveMessage && (
              <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                saveMessage.includes('succes')
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  : 'border-rose-100 bg-rose-50 text-rose-700'
              }`}>
                {saveMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? 'Enregistrement...' : 'Enregistrer mon profil'}
            </button>
          </div>
        </section>

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
                {getRoleLabel(profile?.role)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Disponibilite</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {profile?.is_available !== false ? 'Disponible pour de nouvelles missions' : 'Indisponible actuellement'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Adresse</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{profile?.address || 'Non renseignee'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Membre depuis</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : 'Non disponible'}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50">
              <BadgeCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Resume du profil</h2>
              <p className="text-sm text-slate-500">Informations disponibles actuellement dans votre base de donnees.</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Note</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{(profile?.rating || 0).toFixed(1)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Avis</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{profile?.reviews_count || 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Missions</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{profile?.missions_completed || 0}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">Bio</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {profile?.bio || "Aucune bio enregistree pour le moment."}
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">Competences</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile?.skills && profile.skills.length > 0 ? profile.skills : ['Aucune competence renseignee']).map((skill, index) => (
                <span key={`${skill}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                  {skill}
                </span>
              ))}
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

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <CalendarDays className="h-4 w-4" />
            <h2 className="text-sm font-bold uppercase tracking-wide">Champs BDD relies au profil</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Cette interface affiche maintenant les champs `bio`, `address`, `is_available`, `rating`, `reviews_count`,
            `missions_completed`, `skills` et `created_at` venant de la table `profiles`.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
