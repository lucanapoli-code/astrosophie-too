# Test-Bericht: Zeitzonen- & Häuserberechnung

**Ergebnis: 1268 / 1268 Tests bestanden (100%)**

## Was wurde geändert

### 1. Bug behoben: Denver/Mountain-Time
Die alte Fallback-Logik prüfte die "Zentral"-Zeitzonen-Box (Texas/Kansas)
VOR der "Mountain"-Box (Denver/Colorado). Da sich die Längengrad-Bereiche
überlappen, wurde Denver fälschlich mit Central-Time-Offset berechnet
statt mit Mountain Time. Reihenfolge korrigiert.

### 2. Arizona-Sonderfall
Arizona (Phoenix) beobachtet ganzjährig KEINE Sommerzeit. Das war vorher
nicht abgebildet — jetzt fest verankert (-7 das ganze Jahr).

### 3. Echte IANA-Zeitzonen statt Schätz-Heuristik
Für alle 150+ Städte in der Datenbank wird jetzt die im Browser eingebaute
Zeitzonen-Datenbank (Intl/IANA) verwendet statt eigener Sommerzeit-Regeln.
Das behandelt automatisch korrekt:
- Länder ohne Sommerzeit
- Südhalbkugel (umgekehrte Sommerzeit-Monate)
- Historische Regeländerungen innerhalb der jeweiligen Zone

Für Orte ausserhalb der 150-Städte-Datenbank (Live-Geocoding) bleibt die
Fallback-Heuristik aktiv (mit den obigen Bugfixes).

### 4. Polarkreis-Absicherung
Placidus ist oberhalb von 66°33' Breite (Polarkreise) mathematisch
undefiniert. Die App fängt das jetzt ab und wechselt automatisch auf
Whole-Sign-Häuser statt eine verzerrte/falsche Zahl auszugeben. Der Nutzer
wird im Formular mit einem Hinweis informiert.

## Test-Abdeckung

- **Teil A** (1176 Tests): Alle 168 Städte × 7 Jahrzehnte (1950–2026) —
  keine NaN, keine Exceptions, gültige Häuser 1–12
- **Teil B** (8 Tests): Bekannte Sommerzeit-Sonderfälle (Arizona, Denver,
  Zürich, Sydney — Süd-/Nordhalbkugel-Umkehrung)
- **Teil C** (10 Tests): Polarkreis-Grenzfälle (Tromsø, Spitzbergen,
  Utqiagvik/Alaska, Antarktis) + Kontrollfall (Zürich löst KEINEN
  Fallback aus)
- **Teil D** (3 Tests): Exakte Sommerzeit-Umstellungstage (Zürich)
- **Teil E** (4 Tests): Schaltjahr 29. Februar 2024
- **Teil F** (2 Tests): Mitternachts-Rollover (Tokyo, Los Angeles)

## Bekannte, bewusst nicht "gelöste" Grenzfälle

- **Mehrdeutige Lokalzeit am Umstellungstag** (z.B. 02:30 Uhr am Tag der
  Uhrenumstellung): Diese Zeit existiert real ZWEIMAL. Es gibt keine
  einzig richtige Antwort ohne zusätzliche Nutzerangabe — die App liefert
  einen der beiden gültigen Werte, keinen Fehler.
- **Vor-1970-Zeitzonendaten** für Orte ausserhalb der festen Städte-Liste:
  Laut IANA-Datenbank selbst sind Vor-1970-Regeln in vielen Ländern
  unzuverlässig dokumentiert (siehe separater Recherche-Bericht). Das ist
  eine Grenze der verfügbaren Daten weltweit, nicht spezifisch dieser App.

## Dateien
- `index.html` — aktualisierte App
- `run_tests.js` — Testsuite (im Browser über `runAllTests()` ausführbar)
