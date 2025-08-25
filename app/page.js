'use client';
import React, { useEffect, useMemo, useState } from 'react';

const QUOTA = 20;
const LS_KEY = 'mg_credits_v1';

export default function Page() {
  return <App />;
}

function App() {
  const [intent, setIntent] = useState('prise_rdv');
  const [lang, setLang] = useState('fr');
  const [tone, setTone] = useState('poli');
  const [details, setDetails] = useState('');
  const [result, setResult] = useState('');
  const [credits, setCredits] = useState(QUOTA);
  const [showPaywall, setShowPaywall] = useState(false);

  // Init crédits depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved !== null) setCredits(Math.max(0, parseInt(saved, 10)));
      else localStorage.setItem(LS_KEY, String(QUOTA));
    } catch {}
  }, []);

  // Persister à chaque changement
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, String(credits)); } catch {}
  }, [credits]);

  const examples = useMemo(() => ([
    {
      label: 'RDV chez le physio vendredi',
      intent: 'prise_rdv',
      lang: 'fr',
      tone: 'poli',
      details:
        "Demander un rendez-vous ce vendredi après 16h, expliquer que je fais la rééducation de l'avant-bras après chirurgie, dispo aussi lundi matin",
    },
    {
      label: "Email hôpital – suivi liste d'attente",
      intent: 'suivi',
      lang: 'fr',
      tone: 'professionnel',
      details:
        "Relancer poliment pour savoir quand commence la rééducation. Dire que je suis en infortunio et que la mobilité est limitée (supination difficile)",
    },
    {
      label: 'Scusa per il ritardo (IT)',
      intent: 'excuse',
      lang: 'it',
      tone: 'amical',
      details:
        'Mi dispiace per aver risposto tardi, sono in riabilitazione. Proporre di sentirci domani pomeriggio',
    },
    {
      label: "Négocier prix d'un service",
      intent: 'negociation',
      lang: 'fr',
      tone: 'ferme',
      details:
        "Dire que j'apprécie l'offre à 120€, mais mon budget est 90€; proposer 100€ se fait questa settimana",
    },
  ]), []);

  function spendOneCredit() {
    if (credits <= 0) {
      setShowPaywall(true);
      return false;
    }
    setCredits((c) => Math.max(0, c - 1));
    if (credits - 1 <= 0) setShowPaywall(true);
    return true;
  }

  function generateMessage() {
    if (!spendOneCredit()) return;
    const txt = craft({ intent, lang, tone, details: details.trim() });
    setResult(txt);
  }

  function copyToClipboard() {
    if (!result) return;
    navigator.clipboard.writeText(result);
  }

  const waLink = useMemo(() => `https://wa.me/?text=${encodeURIComponent(result)}`, [result]);

  return (
    <div className="min-h-screen w-full text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">MessageGen — Assistant WhatsApp & Email</h1>
          <p className="mt-1 text-sm text-slate-600">
            20 messages gratuits. Ensuite, passe à la version Pro pour un usage illimité.
          </p>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Badge>Crédits: {credits}/{QUOTA}</Badge>
          <Badge>{langLabel(lang)}</Badge>
          <Badge>Ton: {toneLabel(tone)}</Badge>
        </div>

        <Card>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <LabeledSelect label="Intention" value={intent} onChange={setIntent} options={[
                { value: 'prise_rdv', label: labelByLang(lang, { fr: 'Prise de RDV', it: 'Appuntamento', en: 'Book appt.' }) },
                { value: 'suivi', label: labelByLang(lang, { fr: 'Suivi / Relance', it: 'Follow-up', en: 'Follow-up' }) },
                { value: 'excuse', label: labelByLang(lang, { fr: 'Excuse / Retard', it: 'Scuse / Ritardo', en: 'Apology' }) },
                { value: 'demande_info', label: labelByLang(lang, { fr: "Demande d'info", it: 'Richiesta info', en: 'Ask info' }) },
                { value: 'negociation', label: labelByLang(lang, { fr: 'Négociation', it: 'Negoziazione', en: 'Negotiation' }) },
                { value: 'remerciement', label: labelByLang(lang, { fr: 'Remerciement', it: 'Ringraziamento', en: 'Thanks' }) },
              ]} />

              <LabeledSelect label="Langue" value={lang} onChange={setLang} options={[
                { value: 'fr', label: 'Français' },
                { value: 'it', label: 'Italiano' },
                { value: 'en', label: 'English' },
              ]} />

              <LabeledSelect label="Ton" value={tone} onChange={setTone} options={[
                { value: 'poli', label: toneLabel('poli') },
                { value: 'neutre', label: toneLabel('neutre') },
                { value: 'amical', label: toneLabel('amical') },
                { value: 'professionnel', label: toneLabel('professionnel') },
                { value: 'ferme', label: toneLabel('ferme') },
              ]} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Détails (qui, quoi, quand, contraintes)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={placeholderByLang(lang)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 outline-none ring-0 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                rows={5}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PrimaryButton onClick={generateMessage} disabled={credits <= 0}>
                {credits > 0 ? 'Générer' : 'Crédits épuisés'}
              </PrimaryButton>
              <button
                onClick={copyToClipboard}
                disabled={!result}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Copier
              </button>
              <a
                href={result ? waLink : undefined}
                target="_blank"
                rel="noreferrer"
                className={`rounded-2xl border px-4 py-2 text-sm ${result ? 'border-emerald-300 hover:bg-emerald-50' : 'cursor-not-allowed opacity-50'}`}
              >
                Ouvrir WhatsApp
              </a>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Message</label>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Ton message généré apparaîtra ici…"
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                rows={10}
              />
              <p className="mt-2 text-xs text-slate-500">
                Astuce: personnalise la salutation et ajoute un créneau précis. Le bouton WhatsApp colle le texte automatiquement.
              </p>
            </div>
          </div>
        </Card>

        {/* Bouton reset (tests) */}
        <button
          onClick={() => { setCredits(QUOTA); setShowPaywall(false); }}
          className="fixed bottom-4 left-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs shadow"
          title="Réinitialiser les crédits (test)"
        >
          Réinitialiser (test)
        </button>
      </div>

      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
    </div>
  );
}

function Paywall({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold">Crédits épuisés</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tu as utilisé tes 20 messages gratuits. Passe à <strong>MessageGen Pro</strong> pour un usage illimité.
        </p>
        <div className="mt-4 flex gap-2">
          {/* TODO: remplacer par Stripe Checkout */}
          <a
            href="#subscribe"
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            S’abonner
          </a>
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm"
          >
            Plus tard
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">Prix suggéré : 4,99€/mois.</p>
      </div>
    </div>
  );
}

function Card({ children }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{children}</div>;
}
function Badge({ children }) {
  return (
    <span className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm md:w-auto">
      {children}
    </span>
  );
}
function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-2 text-sm font-medium text-white shadow-sm transition active:scale-[.99] ${
        disabled ? 'cursor-not-allowed bg-slate-400' : 'bg-slate-900 hover:brightness-110'
      }`}
    >
      {children}
    </button>
  );
}
function LabeledSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-slate-200 bg-white p-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
function labelByLang(current, map) { return current in map ? map[current] : map.fr ?? Object.values(map)[0]; }
function toneLabel(key) {
  return ({ poli:'Poli', neutre:'Neutre', amical:'Amical', professionnel:'Professionnel', ferme:'Ferme' }[key] || key);
}
function langLabel(key) { return ({ fr:'Français', it:'Italiano', en:'English' }[key] || key); }
function placeholderByLang(l) {
  switch (l) {
    case 'fr': return "Décris ta situation: qui contacter, but, contraintes (ex: vendredi après 16h), infos utiles…";
    case 'it': return "Descrivi la situazione: chi contattare, obiettivo, vincoli (es: venerdì dopo le 16), info utili…";
    default: return "Describe your situation: who to contact, goal, constraints, helpful info…";
  }
}
function craft({ intent, lang, tone, details }) {
  const salutation = salutationByLang(lang, tone);
  const closing = closingByLang(lang, tone);
  const body = bodyByIntent(intent, lang, tone, details);
  return `${salutation}\n\n${body}\n\n${closing}`.trim();
}
function salutationByLang(lang, tone) {
  if (lang === 'it') return tone === 'amical' ? 'Ciao,' : 'Buongiorno,';
  if (lang === 'en') return tone === 'amical' ? 'Hi,' : 'Hello,';
  return tone === 'amical' ? 'Coucou,' : 'Bonjour,';
}
function closingByLang(lang, tone) {
  if (lang === 'it') return ({ amical:'Grazie mille!', poli:'Grazie in anticipo per il riscontro.', neutre:'Grazie e a presto.', professionale:'Resto a disposizione. Cordiali saluti.', ferme:'Attendo un riscontro entro oggi. Cordiali saluti.' }[tone] || 'Grazie.');
  if (lang === 'en') return ({ amical:'Thanks a lot!', poli:'Thanks in advance for your reply.', neutre:'Thanks and speak soon.', professionale:'Kind regards.', ferme:'I look forward to your reply today.' }[tone] || 'Thanks.');
  return ({ amical:'Merci beaucoup !', poli:"Merci d'avance pour votre retour.", neutre:'Merci et à bientôt.', professionnel:'Bien cordialement.', ferme:"Dans l'attente d'un retour aujourd'hui, merci." }[tone] || 'Merci.');
}
function bodyByIntent(intent, lang, tone, details) {
  const d = details ? ` ${details}` : '';
  const M = {
    fr: {
      prise_rdv: "Je souhaite prendre un rendez-vous." + d + " Pourriez-vous me proposer un créneau ?",
      suivi: "Je me permets de vous recontacter concernant mon dossier." + d + " Auriez-vous une mise à jour ?",
      excuse: "Désolé pour le retard de réponse." + d + " Merci de votre compréhension.",
      demande_info: "J'aurais besoin de quelques informations, s'il vous plaît." + d,
      negociation: "Merci pour votre proposition. Serait-il possible d'ajuster le tarif ?" + d,
      remerciement: "Merci pour votre aide et votre disponibilité." + d,
    },
    it: {
      prise_rdv: "Vorrei fissare un appuntamento." + d + " Potete propormi un orario disponibile?",
      suivi: "Scrivo per avere un aggiornamento sul mio caso." + d + " Avete novità?",
      excuse: "Scusa per il ritardo nella risposta." + d + " Grazie per la comprensione.",
      demande_info: "Avrei bisogno di alcune informazioni, per favore." + d,
      negociation: "Grazie per l'offerta. Sarebbe possibile rivedere il prezzo?" + d,
      remerciement: "Grazie per l'aiuto e la disponibilità." + d,
    },
    en: {
      prise_rdv: "I'd like to book an appointment." + d + " Do you have any availability?",
      suivi: "I'm following up on my case." + d + " Any update?",
      excuse: "Sorry for the late reply." + d + " Thanks for understanding.",
      demande_info: "I'd need a few details, please." + d,
      negociation: "Thanks for your offer. Would a lower price be possible?" + d,
      remerciement: "Thanks for your help and availability." + d,
    },
  };
  return M[lang]?.[intent] || M.fr.prise_rdv;
}
