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
      ton
