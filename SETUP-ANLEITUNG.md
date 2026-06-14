# Deployment-Anleitung: analyse.luca-calicchio.com

## Schritt 1: GitHub Account (kostenlos)
1. Gehe zu https://github.com und erstelle einen Account
2. Klicke "New Repository" → Name: `astrosophie-tool`
3. Stelle auf "Public" und erstelle das Repo

## Schritt 2: Dateien hochladen
1. Lade `index.html` und `netlify.toml` in das GitHub-Repo hoch
2. Klicke auf "Add file" → "Upload files"
3. Commit mit "App hochladen"

## Schritt 3: Netlify verbinden (kostenlos)
1. Gehe zu https://netlify.com
2. "Start for free" → mit GitHub einloggen
3. "New site from Git" → dein Repo auswählen
4. Deploy! → Du bekommst eine URL wie `https://amazing-star-123456.netlify.app`

## Schritt 4: Eigene Domain (analyse.luca-calicchio.com)
1. In Netlify → Site Settings → Domain management
2. "Add custom domain" → `analyse.luca-calicchio.com` eingeben
3. Netlify zeigt dir einen CNAME-Record:
   - Name: `analyse`
   - Ziel: `amazing-star-123456.netlify.app`

## Schritt 5: Wix DNS konfigurieren
1. In Wix → Einstellungen → Domains → DNS-Einträge
2. Neuen CNAME-Eintrag hinzufügen:
   - Host: `analyse`
   - Ziel: (Netlify-URL von Schritt 4)
3. DNS-Propagierung: 1-24 Stunden

## Schritt 6: In Wix-Homepage einbinden
Option A – Button (empfohlen):
- Auf deiner Wix-Startseite einen grossen Button hinzufügen
- Link: `https://analyse.luca-calicchio.com`
- Text: "✦ Kostenlose Erstanalyse – Jetzt starten"

Option B – iFrame (nahtlos):
- Wix-Editor → "+Hinzufügen" → "Einbetten" → "Website einbetten"
- URL: `https://analyse.luca-calicchio.com`
- Volle Breite, min. 700px Höhe

## Resultat
- App live unter: https://analyse.luca-calicchio.com
- Nahtlos im selben Branding wie deine Website
- Koordinaten 100% präzise via OpenStreetMap/Nominatim
