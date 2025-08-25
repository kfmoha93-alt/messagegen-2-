import "./(styles)/globals.css";

export const metadata = {
  title: "MessageGen — WhatsApp & Email writer",
  description: "Génère des messages propres en quelques secondes (FR/IT/EN).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
