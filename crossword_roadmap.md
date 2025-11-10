# Entwicklungs-Roadmap: EDU-PUZZLE
**Version**: 1.0  
**Geschätzte Gesamtdauer**: 8-9 Wochen  
**Arbeitsweise**: Solo-Entwickler, 20-30h/Woche

---

## Übersicht der Phasen

| Phase | Fokus | Dauer | Status |
|-------|-------|-------|--------|
| **Phase 0** | Setup & Grundlagen | 3-5 Tage | Geplant |
| **Phase 1** | MVP Core Features | 3-4 Wochen | Geplant |
| **Phase 2** | Premium Features | 1-2 Wochen | Geplant |
| **Phase 3** | Polish & Launch | 2-3 Wochen | Geplant |

---

## Phase 0: Setup & Grundlagen (3-5 Tage)

**Ziel**: Entwicklungsumgebung aufsetzen, grundlegende Architektur etablieren.

### 0.1 Projekt-Setup
**Priorität**: MUST  
**Geschätzt**: 4-6 Stunden

**Tasks**:
- [ ] Vite + React + TypeScript Projekt initialisieren
- [ ] Tailwind CSS konfigurieren
- [ ] Ordnerstruktur aufsetzen:
  ```
  src/
  ├── components/
  ├── pages/
  ├── contexts/
  ├── hooks/
  ├── services/
  ├── types/
  ├── utils/
  └── styles/
  ```
- [ ] ESLint + Prettier konfigurieren
- [ ] Git Repository initialisieren
- [ ] `.gitignore` einrichten

**Akzeptanzkriterien**:
- ✅ App startet auf localhost:5173
- ✅ TypeScript kompiliert ohne Fehler
- ✅ Tailwind funktioniert

---

### 0.2 Supabase Setup
**Priorität**: MUST  
**Geschätzt**: 3-4 Stunden

**Tasks**:
- [ ] Supabase Projekt erstellen
- [ ] Datenbank-Schema implementieren (siehe Spec Anhang A)
- [ ] Row Level Security Policies einrichten
- [ ] Supabase Client in React integrieren (`@supabase/supabase-js`)
- [ ] Environment Variables konfigurieren (`.env.local`)

**Akzeptanzkriterien**:
- ✅ Verbindung zu Supabase funktioniert
- ✅ Alle Tabellen erstellt
- ✅ RLS aktiviert und getestet

---

### 0.3 Vercel Deployment Setup
**Priorität**: SHOULD  
**Geschätzt**: 1-2 Stunden

**Tasks**:
- [ ] Vercel Account erstellen
- [ ] Git Repository mit Vercel verbinden
- [ ] Environment Variables in Vercel setzen
- [ ] Ersten Deployment testen

**Akzeptanzkriterien**:
- ✅ App deployed unter Vercel-URL
- ✅ Auto-Deploy bei Git Push funktioniert

---

### 0.4 Design System / UI Foundation
**Priorität**: SHOULD  
**Geschätzt**: 3-4 Stunden

**Tasks**:
- [ ] Farbpalette definieren (Primary, Secondary, Grays, Error, Success)
- [ ] Typography-Scale festlegen
- [ ] Basis-Komponenten erstellen:
  - `Button` (Primary, Secondary, Outline)
  - `Input` (Text, Email, Password)
  - `Card`
  - `Modal`
- [ ] Tailwind Config erweitern mit Custom Colors

**Akzeptanzkriterien**:
- ✅ Wiederverwendbare UI-Komponenten vorhanden
- ✅ Konsistentes Design

---

## Phase 1: MVP Core Features (3-4 Wochen)

**Ziel**: Funktionierende App mit Free-Trial und Basis-Rätsel-Funktionalität.

---

### 1.1 User Authentication
**Priorität**: MUST  
**Geschätzt**: 6-8 Stunden

**User Stories**:
- Als neuer User möchte ich mich registrieren können
- Als registrierter User möchte ich mich einloggen können
- Als eingeloggter User möchte ich mich ausloggen können

**Tasks**:
- [ ] Login-Page erstellen (`/login`)
- [ ] Registrierungs-Formular implementieren
  - Email + Password
  - Email-Validierung
  - Password-Stärke-Indikator
- [ ] Supabase Auth Integration
  - `signUp()`
  - `signInWithPassword()`
  - `signOut()`
- [ ] AuthContext erstellen
  - User-State global verfügbar
  - `trial_ends_at` laden
  - `is_premium` laden
- [ ] ProtectedRoute-Component
  - Redirect zu `/login` wenn nicht authentifiziert
- [ ] Email-Verifikation-Flow (Supabase automatisch)

**Akzeptanzkriterien**:
- ✅ User kann sich registrieren
- ✅ User erhält Verifikations-Email
- ✅ User kann sich einloggen
- ✅ User-Session bleibt erhalten (LocalStorage)
- ✅ `trial_ends_at` wird bei Registrierung gesetzt (+7 Tage)

**Abhängigkeiten**: 0.2 Supabase Setup

---

### 1.2 Dashboard & Listen-Verwaltung
**Priorität**: MUST  
**Geschätzt**: 8-10 Stunden

**User Stories**:
- Als User möchte ich eine neue Vokabelliste erstellen können
- Als User möchte ich alle meine Listen sehen
- Als User möchte ich eine Liste umbenennen können
- Als User möchte ich eine Liste löschen können

**Tasks**:
- [ ] Dashboard-Page erstellen (`/dashboard`)
  - Grid-Layout für Listen-Cards
  - "Neue Liste"-Button
- [ ] ListCard-Component
  - Zeigt Name, Sprachen, Anzahl Wörter
  - Edit- und Delete-Buttons
- [ ] CreateListModal-Component
  - Formular: Name, Target Language, Source Language
  - Dropdown für Sprachen (EN, DE, ES, FR, IT)
- [ ] CRUD-Operations für Listen
  - `createList()` (Supabase INSERT)
  - `getLists()` (Supabase SELECT mit RLS)
  - `updateList()` (Supabase UPDATE)
  - `deleteList()` (Supabase DELETE mit CASCADE)
- [ ] ListContext erstellen
  - Global State für Listen
  - CRUD-Functions

**Akzeptanzkriterien**:
- ✅ User sieht alle eigenen Listen
- ✅ User kann neue Liste erstellen
- ✅ User kann Liste bearbeiten
- ✅ User kann Liste löschen (mit Bestätigungs-Dialog)
- ✅ Leerer State zeigt hilfreichen Text

**Abhängigkeiten**: 1.1 Authentication

---

### 1.3 Wörter-Verwaltung
**Priorität**: MUST  
**Geschätzt**: 8-10 Stunden

**User Stories**:
- Als User möchte ich Wörter zu einer Liste hinzufügen können
- Als User möchte ich alle Wörter einer Liste sehen
- Als User möchte ich Wörter bearbeiten können
- Als User möchte ich Wörter löschen können

**Tasks**:
- [ ] ListView-Page erstellen (`/lists/:id`)
  - Header mit Listen-Name
  - "Wort hinzufügen"-Button
  - "Rätsel starten"-Button (zunächst disabled)
- [ ] WordTable-Component
  - Tabellarische Darstellung: Wort | Definition | Actions
  - Responsive (Mobile: Cards statt Tabelle)
  - Edit/Delete-Icons pro Zeile
- [ ] AddWordForm-Component
  - Inline-Form oder Modal
  - Felder: Word, Definition
  - Validierung (mind. 2 Zeichen)
- [ ] CRUD-Operations für Wörter
  - `createWord()` (Supabase INSERT)
  - `getWords(listId)` (Supabase SELECT mit list_id)
  - `updateWord()` (Supabase UPDATE)
  - `deleteWord()` (Supabase DELETE)

**Akzeptanzkriterien**:
- ✅ User kann Wörter zu Liste hinzufügen
- ✅ User sieht alle Wörter der Liste
- ✅ User kann Wörter bearbeiten (inline oder Modal)
- ✅ User kann Wörter löschen
- ✅ Minimum 5 Wörter nötig um Rätsel zu starten

**Abhängigkeiten**: 1.2 Dashboard

---

### 1.4 Kreuzworträtsel-Generierung (Template-basiert)
**Priorität**: MUST  
**Geschätzt**: 12-16 Stunden

**User Story**:
- Als User möchte ich aus meiner Vokabelliste ein Kreuzworträtsel generieren können

**Tasks**:

**Backend (Supabase Edge Function)**:
- [ ] Edge Function erstellen: `generate-puzzle`
- [ ] Authentifizierung prüfen (JWT-Token)
- [ ] Trial-Status prüfen (`trial_ends_at > NOW()`)
- [ ] Wörter aus Datenbank laden
  - Trial: 15-20 zufällige Wörter
  - Premium (später): SRS-basierte Auswahl
- [ ] Template-Generator implementieren:
  - [ ] 3-5 vordefinierte Grid-Layouts erstellen
    - Klein: 8x8 (5-8 Wörter)
    - Mittel: 10x10 (8-12 Wörter)
    - Groß: 12x12 (12-15 Wörter)
  - [ ] Slot-Matching-Algorithmus
    - Wörter nach Länge sortieren
    - Längste Wörter zuerst platzieren
    - Überschneidungen wo möglich
  - [ ] Nummerierung der Rätsel-Positionen
- [ ] Response formatieren (siehe Spec 4.1)
- [ ] Error-Handling (nicht genug Wörter, Timeout)

**Frontend**:
- [ ] Service-Function `generatePuzzle(listId)` erstellen
  - API-Call zu Edge Function
  - Error-Handling
  - Loading-State

**Akzeptanzkriterien**:
- ✅ API generiert Rätsel aus 5-20 Wörtern
- ✅ Generierung dauert <3 Sekunden
- ✅ Output folgt definiertem Interface (PuzzleOutput)
- ✅ Falls Generierung fehlschlägt: Sinnvolle Fehlermeldung

**Abhängigkeiten**: 1.3 Wörter-Verwaltung

**Hinweis**: Dies ist der komplexeste Task! Falls du Unterstützung beim Algorithmus brauchst, können wir ihn gemeinsam entwickeln.

---

### 1.5 Rätsel-UI (Spielen)
**Priorität**: MUST  
**Geschätzt**: 16-20 Stunden

**User Stories**:
- Als User möchte ich das generierte Rätsel ausfüllen können
- Als User möchte ich Hinweise sehen können
- Als User möchte ich meine Eingaben validieren lassen
- Als User möchte ich bei Bedarf Buchstaben aufdecken können

**Tasks**:

**PuzzleView-Page** (`/puzzle/:listId`):
- [ ] Layout erstellen (Desktop):
  - Links: Kreuzworträtsel-Grid (60% Breite)
  - Rechts: Hinweise + Controls (40% Breite)
- [ ] Loading-State während Generierung
- [ ] Error-State bei Generierungs-Fehler

**CrosswordGrid-Component**:
- [ ] Grid-Rendering (2D-Array von Cells)
- [ ] Cell-Component:
  - Schwarze Zellen (leer)
  - Weiße Zellen (editierbar)
  - Rätsel-Nummern (oben links in Zelle)
  - Buchstaben-Input (einzelnes Zeichen)
- [ ] Keyboard-Navigation:
  - Pfeiltasten: Navigation zwischen Zellen
  - Tab: Nächstes Wort
  - Buchstaben-Eingabe: Auto-Jump zur nächsten Zelle
  - Backspace: Zeichen löschen + zurück springen
- [ ] Wort-Highlighting:
  - Aktuelles Wort hervorheben
  - Click auf Zelle: Wort selektieren
  - Toggle Across/Down bei erneutem Click
- [ ] Fehler-Anzeige:
  - Falsche Buchstaben rot markieren (optional)

**CluesList-Component**:
- [ ] Zwei Sections: "Across" und "Down"
- [ ] Scrollbare Liste
- [ ] Aktives Wort hervorheben
- [ ] Click auf Hinweis: Springe zu Wort im Grid

**PuzzleControls-Component**:
- [ ] Timer (zählt hoch, Sekunden → MM:SS)
- [ ] "Buchstaben aufdecken"-Button
  - Modal: Welches Wort?
  - Deckt einen zufälligen fehlenden Buchstaben auf
  - Tracked für SRS-Berechnung
- [ ] "Lösung prüfen"-Button
  - Markiert falsche Buchstaben
  - Zeigt Fortschritt (X von Y Wörtern korrekt)
- [ ] "Rätsel abschließen"-Button
  - Nur aktiv wenn alles korrekt
  - Speichert Ergebnis

**Performance-Tracking**:
- [ ] Pro Wort tracken:
  - Start-Zeit (beim ersten Buchstaben)
  - End-Zeit (wenn Wort vollständig)
  - Anzahl Fehler (falsche Buchstaben)
  - Anzahl aufgedeckter Buchstaben
- [ ] State-Management für Tracking-Daten

**Akzeptanzkriterien**:
- ✅ User kann Rätsel vollständig ausfüllen
- ✅ Keyboard-Navigation funktioniert flüssig
- ✅ Timer läuft korrekt
- ✅ Hinweise sind übersichtlich dargestellt
- ✅ Fehler werden erkannt und angezeigt
- ✅ Performance-Daten werden getrackt

**Abhängigkeiten**: 1.4 Generierung

**Hinweis**: Dies ist der zeitintensivste Task! UI/UX ist hier entscheidend für User-Experience.

---

### 1.6 Trial-Logik & Paywall
**Priorität**: MUST  
**Geschätzt**: 4-6 Stunden

**User Stories**:
- Als Trial-User möchte ich sehen wie lange mein Trial noch läuft
- Als User nach Trial-Ende möchte ich zur Premium-Seite geleitet werden
- Als User möchte ich verstehen was Premium bietet

**Tasks**:
- [ ] Trial-Banner-Component
  - Zeigt verbleibende Tage an
  - Prominent im Dashboard
  - "Upgrade"-Button
- [ ] Paywall-Modal
  - Triggert bei abgelaufenem Trial
  - Erklärt Premium-Features
  - "Jetzt upgraden"-Button → `/pricing`
- [ ] API-Guard in Edge Functions
  - Prüft `trial_ends_at` und `is_premium`
  - Return 403 bei abgelaufenem Trial
- [ ] Frontend Error-Handling
  - Fängt 403-Response ab
  - Zeigt Paywall-Modal
- [ ] Pricing-Page erstellen (`/pricing`)
  - Feature-Vergleich (Trial vs Premium)
  - Preis-Cards (Monatlich / Jährlich)
  - "Jetzt upgraden"-Button (zunächst Dummy)

**Akzeptanzkriterien**:
- ✅ Trial-Countdown wird angezeigt
- ✅ Nach Trial-Ende: API-Calls werden blockiert
- ✅ Paywall-Modal erscheint automatisch
- ✅ Pricing-Page ist ansprechend gestaltet

**Abhängigkeiten**: 1.1 Authentication

---

### 1.7 MVP Testing & Bug Fixes
**Priorität**: MUST  
**Geschätzt**: 6-8 Stunden

**Tasks**:
- [ ] End-to-End User-Flow testen:
  - Registrierung → Listen erstellen → Wörter hinzufügen → Rätsel spielen
- [ ] Edge Cases testen:
  - Sehr kurze Wörter (2-3 Buchstaben)
  - Sehr lange Wörter (12+ Buchstaben)
  - Listen mit <5 Wörtern
  - Listen mit >50 Wörtern
- [ ] Browser-Kompatibilität testen (Chrome, Firefox, Safari)
- [ ] Responsive Design prüfen (Desktop, Tablet, Mobile)
- [ ] Performance-Optimierung:
  - Lazy Loading für Komponenten
  - Debouncing bei Input-Feldern
  - Memoization bei teuren Berechnungen
- [ ] Bug-Liste erstellen und abarbeiten

**Akzeptanzkriterien**:
- ✅ Keine kritischen Bugs
- ✅ App läuft stabil auf allen Browsern
- ✅ Mobile-Ansicht ist benutzbar (auch wenn nicht optimal)

**Abhängigkeiten**: Alle vorherigen Tasks in Phase 1

---

## Phase 2: Premium Features (1-2 Wochen)

**Ziel**: Stripe-Integration und SRS-System implementieren.

---

### 2.1 Stripe Integration (Checkout)
**Priorität**: MUST  
**Geschätzt**: 6-8 Stunden

**User Story**:
- Als User möchte ich Premium kaufen können

**Tasks**:
- [ ] Stripe Account erstellen
- [ ] Produkte in Stripe anlegen:
  - "Premium Monthly" (€4,99/Monat)
  - "Premium Yearly" (€49,99/Jahr)
- [ ] Stripe Checkout Integration:
  - [ ] Frontend: "Jetzt upgraden"-Button implementieren
  - [ ] API-Endpoint erstellen: `create-checkout-session`
    - Erstellt Stripe Customer (falls nicht vorhanden)
    - Erstellt Checkout Session
    - Return Redirect-URL
  - [ ] Success-Page erstellen (`/success`)
    - "Danke für dein Abo"-Nachricht
    - Redirect zu Dashboard nach 3 Sekunden
  - [ ] Cancel-Page erstellen (`/cancel`)
    - "Kauf abgebrochen"-Nachricht
    - Zurück zu Pricing-Button

**Akzeptanzkriterien**:
- ✅ User kann zu Stripe Checkout geleitet werden
- ✅ Testmodus funktioniert (Stripe Test-Keys)
- ✅ Nach Zahlung: Redirect zurück zur App

**Abhängigkeiten**: 1.6 Pricing-Page

---

### 2.2 Stripe Webhook & Premium-Status
**Priorität**: MUST  
**Geschätzt**: 4-6 Stunden

**User Story**:
- Als bezahlender User möchte ich automatisch Premium-Zugang erhalten

**Tasks**:
- [ ] Edge Function erstellen: `stripe-webhook`
- [ ] Webhook-Verifizierung implementieren (Signatur-Check)
- [ ] Event-Handler:
  - [ ] `customer.subscription.created`
    - Finde User via `stripe_customer_id`
    - Setze `is_premium = TRUE`
  - [ ] `customer.subscription.deleted`
    - Setze `is_premium = FALSE`
  - [ ] `invoice.payment_failed`
    - (Optional) Email an User
- [ ] Webhook in Stripe Dashboard registrieren
- [ ] Testen mit Stripe CLI (`stripe listen --forward-to`)

**Akzeptanzkriterien**:
- ✅ Nach erfolgreicher Zahlung: `is_premium = true` in DB
- ✅ User sieht "Premium"-Badge im Dashboard
- ✅ Paywall-Modal erscheint nicht mehr
- ✅ Bei Abo-Kündigung: Premium-Status wird entfernt

**Abhängigkeiten**: 2.1 Checkout

---

### 2.3 SRS-System (Backend)
**Priorität**: MUST  
**Geschätzt**: 8-10 Stunden

**User Stories**:
- Als Premium-User möchte ich Wörter basierend auf meinem Lernfortschritt wiederholen
- Als Premium-User möchte ich sehen wann ich Wörter wieder lernen sollte

**Tasks**:

**Edge Function: `generate-puzzle` erweitern**:
- [ ] Premium-Check: `is_premium = TRUE`?
- [ ] Falls Premium: SRS-basierte Wortauswahl
  - [ ] Query: `SELECT * FROM user_word_progress WHERE user_id = X AND due_date <= TODAY() LIMIT 20`
  - [ ] Falls <10 Wörter fällig: Fülle mit neuen Wörtern auf
    - Wörter die noch nicht in `user_word_progress` sind
  - [ ] Initialisiere neue Wörter in `user_word_progress`:
    - `due_date = heute`
    - `ease_factor = 2.5`
    - `consecutive_correct = 0`

**Edge Function: `submit-solution` erstellen**:
- [ ] Request-Body validieren (siehe Spec 4.2)
- [ ] Für jedes Wort in `solutions`:
  - [ ] Berechne `q` (Quality-Score 0-5)
    - Implementiere `calculateQuality()` (siehe Spec 6.1)
  - [ ] Berechne neues SRS-Intervall
    - Implementiere `calculateSRS()` (siehe Spec 6.2)
  - [ ] Update `user_word_progress`
    - `due_date`, `ease_factor`, `interval_days`, `consecutive_correct`
    - `last_reviewed = NOW()`
    - `total_reviews++`
- [ ] Return: Anzahl aktualisierter Wörter + nächstes due_date

**Frontend**:
- [ ] Submit-Button im PuzzleView
  - Sammelt Performance-Daten pro Wort
  - API-Call zu `submit-solution`
- [ ] Success-Modal nach Submit
  - "Gut gemacht! Nächste Wiederholung: [Datum]"
  - Zeigt Statistik (X korrekt, Y schwierig)

**Akzeptanzkriterien**:
- ✅ Premium-User bekommen Wörter basierend auf `due_date`
- ✅ Nach Rätsel-Lösung: SRS-Daten werden aktualisiert
- ✅ Intervalle werden korrekt nach SM-2 berechnet
- ✅ Falsche Antworten reseten das Intervall

**Abhängigkeiten**: 2.2 Premium-Status, 1.5 Rätsel-UI

---

### 2.4 Dashboard für Premium-User
**Priorität**: SHOULD  
**Geschätzt**: 4-6 Stunden

**User Story**:
- Als Premium-User möchte ich meinen Lernfortschritt sehen

**Tasks**:
- [ ] Dashboard erweitern mit Statistik-Section (nur für Premium):
  - [ ] Karten:
    - "Heute fällig": Anzahl Wörter mit `due_date = heute`
    - "Diese Woche": Anzahl Wörter mit `due_date <= heute + 7 Tage`
    - "Gelernt gesamt": COUNT(*) in `user_word_progress`
  - [ ] Button: "Jetzt lernen" (filtert Listen mit fälligen Wörtern)
- [ ] Query-Function: `getDueWordsCount()`
- [ ] Optional: Mini-Chart (z.B. Fortschritt über Zeit)

**Akzeptanzkriterien**:
- ✅ Premium-User sieht Statistik-Karten
- ✅ "Jetzt lernen"-Button funktioniert
- ✅ Zahlen werden korrekt aus DB geladen

**Abhängigkeiten**: 2.3 SRS-System

---

## Phase 3: Polish & Launch (2-3 Wochen)

**Ziel**: Qualität verbessern, Launch-Vorbereitung, erste User gewinnen.

---

### 3.1 Verbesserter Rätsel-Algorithmus
**Priorität**: SHOULD  
**Geschätzt**: 12-16 Stunden

**Ziel**: Von Template-basiert zu Constraint-basiert mit Backtracking.

**Tasks**:
- [ ] Algorithmus-Research:
  - Constraint Satisfaction Problem (CSP)
  - Backtracking mit Heuristiken
- [ ] Neuen Generator implementieren:
  - [ ] Startpunkt: Längstes Wort horizontal platzieren
  - [ ] Rekursiv weitere Wörter platzieren:
    - Prüfe Überschneidungen (gemeinsame Buchstaben)
    - Backtrack bei Sackgasse
  - [ ] Heuristiken für bessere Performance:
    - Most Constrained Variable First
    - Least Constraining Value First
- [ ] Timeout-Mechanismus (10 Sekunden max)
- [ ] Fallback zu Template bei Timeout
- [ ] A/B-Test vorbereiten (beide Algorithmen parallel)

**Akzeptanzkriterien**:
- ✅ Bessere Grid-Auslastung (mehr Wörter passen)
- ✅ Natürlichere Rätsel-Struktur
- ✅ Generierung dauert <5 Sekunden (90% der Fälle)

**Abhängigkeiten**: 1.4 Template-Generator (zum Vergleich)

**Hinweis**: Kann auch nach Launch iterativ verbessert werden!

---

### 3.2 Mehrsprachigkeit (i18n)
**Priorität**: SHOULD  
**Geschätzt**: 6-8 Stunden

**User Story**:
- Als deutscher User möchte ich die App-Oberfläche auf Deutsch sehen

**Tasks**:
- [ ] i18n-Library integrieren (z.B. `react-i18next`)
- [ ] Übersetzungs-Dateien erstellen:
  - `en.json` (Englisch - Standard)
  - `de.json` (Deutsch)
- [ ] Alle UI-Texte durch Translation-Keys ersetzen
  - Buttons, Labels, Fehlermeldungen, etc.
- [ ] Language-Switcher im Header
  - Speichert Präferenz in LocalStorage
- [ ] Wichtigste Seiten übersetzen:
  - Landing, Login, Dashboard, Pricing

**Akzeptanzkriterien**:
- ✅ User kann Sprache umschalten (EN ↔ DE)
- ✅ Alle UI-Texte sind übersetzt
- ✅ Sprach-Präferenz bleibt erhalten

**Abhängigkeiten**: Keine (kann parallel gemacht werden)

---

### 3.3 Landing Page & Marketing
**Priorität**: MUST  
**Geschätzt**: 8-12 Stunden

**Ziel**: Erste User gewinnen.

**Tasks**:
- [ ] Landing-Page gestalten (`/`):
  - [ ] Hero-Section:
    - Catchy Headline (z.B. "Learn Vocabulary Through Crosswords")
    - Subheadline (Value Proposition)
    - CTA-Button: "Start Learning Free"
  - [ ] Features-Section (3-4 Vorteile):
    - "Your Own Vocabulary"
    - "Smart Repetition"
    - "Fun & Engaging"
  - [ ] How-It-Works (3 Schritte mit Icons)
  - [ ] Pricing-Teaser
  - [ ] Final CTA
- [ ] Screenshot/GIF vom Rätsel einbauen
- [ ] SEO-Optimierung:
  - Meta-Tags (Title, Description)
  - Open Graph für Social Sharing
- [ ] Domain registrieren (z.B. vocabcross.com)
- [ ] Vercel-Projekt auf Custom Domain umstellen

**Akzeptanzkriterien**:
- ✅ Landing-Page sieht professionell aus
- ✅ Klare Value Proposition
- ✅ CTA-Buttons führen zu Registrierung
- ✅ Domain ist live

**Abhängigkeiten**: Keine (kann früh gemacht werden)

---

### 3.4 Onboarding-Flow
**Priorität**: SHOULD  
**Geschätzt**: 4-6 Stunden

**User Story**:
- Als neuer User möchte ich verstehen wie die App funktioniert

**Tasks**:
- [ ] Welcome-Modal nach erster Registrierung
  - "Willkommen bei EDU-PUZZLE!"
  - 3 Schritte: Listen erstellen → Wörter hinzufügen → Rätsel spielen
  - "Los geht's"-Button
- [ ] Guided Tour (Optional):
  - Tooltips bei erster Nutzung
  - Highlight wichtiger Buttons
  - Library: `react-joyride` oder `intro.js`
- [ ] Empty-States verbessern:
  - "Du hast noch keine Listen" → CTA: "Erste Liste erstellen"
  - "Füge mindestens 5 Wörter hinzu" → Fortschrittsbalken

**Akzeptanzkriterien**:
- ✅ Neuer User versteht schnell wie die App funktioniert
- ✅ Activation-Rate steigt (User erstellt erste Liste)

**Abhängigkeiten**: 1.2 Dashboard

---

### 3.5 Analytics & Monitoring
**Priorität**: SHOULD  
**Geschätzt**: 3-4 Stunden

**Ziel**: Verstehen wie User die App nutzen.

**Tasks**:
- [ ] Analytics-Tool wählen:
  - **Empfehlung**: Plausible (DSGVO-konform, einfach)
  - Alternative: Google Analytics 4
- [ ] Events tracken:
  - `user_registered`
  - `list_created`
  - `puzzle_generated`
  - `puzzle_completed`
  - `premium_purchased`
- [ ] Integration einbauen (Script-Tag im HTML)
- [ ] Custom Events im Code platzieren
- [ ] Dashboard-Zugriff einrichten
- [ ] Optional: Error-Tracking mit Sentry
  - Frontend-Fehler automatisch loggen
  - Sourcemaps für besseres Debugging

**Akzeptanzkriterien**:
- ✅ Pageviews werden getrackt
- ✅ Wichtige Events werden erfasst
- ✅ Analytics-Dashboard ist zugänglich

**Abhängigkeiten**: Keine (kann jederzeit integriert werden)

---

### 3.6 Performance-Optimierung
**Priorität**: SHOULD  
**Geschätzt**: 4-6 Stunden

**Tasks**:
- [ ] Lighthouse-Audit durchführen
- [ ] Optimierungen:
  - [ ] Lazy Loading für Routes (`React.lazy()`)
  - [ ] Code-Splitting (Vite macht das automatisch)
  - [ ] Image-Optimierung (falls vorhanden)
  - [ ] Font-Loading optimieren
  - [ ] Unnötige Re-Renders vermeiden (`useMemo`, `useCallback`)
- [ ] Bundle-Size analysieren (`npm run build` + Bundle Analyzer)
- [ ] Supabase-Queries optimieren:
  - Indexes prüfen
  - Nur benötigte Felder selektieren
  - Pagination für große Listen

**Akzeptanzkriterien**:
- ✅ Lighthouse-Score >90 (Performance)
- ✅ First Contentful Paint <1.5s
- ✅ Time to Interactive <3s

**Abhängigkeiten**: Alle Features fertig

---

### 3.7 Beta-Testing & Feedback
**Priorität**: MUST  
**Geschätzt**: 1 Woche (parallel zu Entwicklung)

**Tasks**:
- [ ] 5-10 Beta-Tester rekrutieren:
  - Freunde, Familie, Online-Communities (Reddit: r/languagelearning)
- [ ] Feedback-Mechanismus einbauen:
  - Feedback-Button im Dashboard
  - Google Form oder Typeform
- [ ] Test-Szenarien definieren:
  - Registrierung bis erste Rätsel-Lösung
  - Edge Cases testen lassen
- [ ] Feedback sammeln und priorisieren
- [ ] Kritische Bugs fixen
- [ ] UX-Verbesserungen basierend auf Feedback

**Akzeptanzkriterien**:
- ✅ Mind. 5 Beta-Tester haben App durchgespielt
- ✅ Feedback-Liste priorisiert
- ✅ Kritische Issues behoben

**Abhängigkeiten**: MVP fertig (Phase 1)

---

### 3.8 Launch-Vorbereitung
**Priorität**: MUST  
**Geschätzt**: 4-6 Stunden

**Tasks**:
- [ ] Checkliste abarbeiten:
  - [ ] Alle Features funktionieren
  - [ ] Keine kritischen Bugs
  - [ ] Stripe ist im Live-Modus (nicht Test)
  - [ ] Environment Variables (Production) sind gesetzt
  - [ ] Email-Templates (Supabase) sind angepasst
  - [ ] Terms of Service geschrieben
  - [ ] Privacy Policy geschrieben (DSGVO)
  - [ ] Impressum (falls erforderlich)
- [ ] Social Media vorbereiten:
  - [ ] Twitter/X Account (optional)
  - [ ] LinkedIn Post vorbereiten
  - [ ] Reddit Posts für r/SideProject, r/languagelearning
  - [ ] Product Hunt Launch vorbereiten (optional)
- [ ] Launch-Announcement schreiben
- [ ] Support-Email einrichten (z.B. support@vocabcross.com)

**Akzeptanzkriterien**:
- ✅ App ist production-ready
- ✅ Legal Docs sind live
- ✅ Launch-Plan steht

**Abhängigkeiten**: Alle anderen Phase-3-Tasks

---

## Anhang: Technische Details

### A.1 Empfohlene Libraries

| Zweck | Library | Warum? |
|-------|---------|--------|
| UI Components | Tailwind CSS | Utility-First, schnell |
| Forms | React Hook Form | Performance, weniger Re-Renders |
| Validation | Zod | TypeScript-native Validation |
| API Client | Supabase JS | Official Client |
| i18n | react-i18next | Industry Standard |
| Routing | React Router v6 | De-facto Standard |
| Analytics | Plausible | DSGVO-konform, einfach |
| Error Tracking | Sentry (optional) | Best-in-class Monitoring |

### A.2 Dateistruktur (Empfehlung)

```
src/
├── components/
│   ├── ui/                  # Wiederverwendbare UI-Komponenten
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── auth/                # Auth-spezifische Komponenten
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── ListCard.tsx
│   │   └── CreateListModal.tsx
│   ├── lists/
│   │   ├── WordTable.tsx
│   │   └── AddWordForm.tsx
│   └── puzzle/
│       ├── CrosswordGrid.tsx
│       ├── Cell.tsx
│       ├── CluesList.tsx
│       └── PuzzleControls.tsx
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── ListView.tsx
│   ├── PuzzleView.tsx
│   ├── Pricing.tsx
│   └── Settings.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── ListContext.tsx
│   └── PuzzleContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useLists.ts
│   └── usePuzzle.ts
├── services/
│   ├── supabase.ts          # Supabase Client Init
│   ├── auth.service.ts
│   ├── lists.service.ts
│   ├── words.service.ts
│   └── puzzle.service.ts
├── types/
│   ├── database.types.ts    # Supabase auto-generated
│   ├── puzzle.types.ts
│   └── srs.types.ts
├── utils/
│   ├── validators.ts
│   ├── formatters.ts
│   └── constants.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

### A.3 Git Workflow (Empfehlung)

```
main          ← Production (deployed)
  ↑
staging       ← Testing vor Production
  ↑
dev           ← Hauptentwicklung
  ↑
feature/xyz   ← Feature-Branches
```

**Commit-Messages-Konvention**:
```
feat: Add puzzle generation algorithm
fix: Resolve authentication bug
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify SRS calculation
test: Add tests for puzzle generator
chore: Update dependencies
```

---

## Anhang B: Priorisierung (MoSCoW)

### MUST (Essentiell für Launch)
- ✅ User Authentication (1.1)
- ✅ Listen-Verwaltung (1.2)
- ✅ Wörter-Verwaltung (1.3)
- ✅ Rätsel-Generierung (1.4)
- ✅ Rätsel-UI (1.5)
- ✅ Trial-Logik (1.6)
- ✅ Stripe Integration (2.1, 2.2)
- ✅ SRS-System (2.3)
- ✅ Landing Page (3.3)
- ✅ Launch-Prep (3.8)

### SHOULD (Wichtig, aber nicht kritisch)
- ✅ Premium Dashboard (2.4)
- ✅ Verbesserter Algorithmus (3.1)
- ✅ Mehrsprachigkeit (3.2)
- ✅ Onboarding (3.4)
- ✅ Analytics (3.5)
- ✅ Performance-Optimierung (3.6)

### COULD (Nice-to-have)
- Export-Funktion (CSV/PDF)
- Statistik-Dashboard mit Charts
- Dark Mode
- Social Sharing (Rätsel teilen)
- Achievements/Gamification
- Mobile App (React Native)

### WON'T (Nicht jetzt)
- Vorgefertigte Vokabellisten (Lizenzierung zu komplex)
- Multiplayer-Modus
- AI-generierte Definitionen
- Spracherkennung/Aussprache

---

## Anhang C: Zeitplan (Optimistisch vs. Realistisch)

### Optimistischer Zeitplan (20-25h/Woche)

| Phase | Wochen |
|-------|--------|
| Phase 0 | 0.5 Wochen |
| Phase 1 | 3 Wochen |
| Phase 2 | 1.5 Wochen |
| Phase 3 | 2 Wochen |
| **Total** | **7 Wochen** |

### Realistischer Zeitplan (mit Buffer)

| Phase | Wochen | Notizen |
|-------|--------|---------|
| Phase 0 | 1 Woche | Setup dauert immer länger |
| Phase 1 | 4 Wochen | Rätsel-UI ist zeitintensiv |
| Phase 2 | 2 Wochen | Stripe-Testing braucht Zeit |
| Phase 3 | 3 Wochen | Parallel: Beta-Testing |
| **Total** | **10 Wochen** | ~2.5 Monate |

**Empfehlung**: Plane mit dem realistischen Zeitplan, aber arbeite nach dem optimistischen. So hast du Buffer für unvorhergesehene Probleme.

---

## Anhang D: Ressourcen & Dokumentation

### Tutorials & Docs
- **Vite**: https://vitejs.dev/guide/
- **React**: https://react.dev/learn
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs/checkout/quickstart
- **Tailwind CSS**: https://tailwindcss.com/docs

### Nützliche Tools
- **Supabase CLI**: Lokale Entwicklung & Migrations
- **Stripe CLI**: Webhook-Testing lokal
- **React DevTools**: Browser Extension
- **Postman/Insomnia**: API-Testing

### Community & Support
- **Supabase Discord**: https://discord.supabase.com
- **r/reactjs**: Reddit Community
- **Stack Overflow**: Für spezifische Probleme

---

## Anhang E: Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Rätsel-Algorithmus zu komplex | Mittel | Hoch | Template-basiert als Fallback |
| Schlechte Conversion Rate | Hoch | Mittel | A/B-Testing, Pricing anpassen |
| Performance-Probleme bei Skalierung | Niedrig | Hoch | Supabase skaliert automatisch |
| DSGVO-Verstöße | Niedrig | Hoch | Legal Docs von Anwalt prüfen lassen |
| Stripe-Integration buggy | Mittel | Hoch | Intensive Tests mit Test-Mode |
| Scope Creep | Hoch | Mittel | Strikt an Roadmap halten, Features nach Launch |

---

## Nächste Schritte

1. **Review dieser Roadmap** - Gibt es Tasks die fehlen oder unklar sind?
2. **Priorisierung finalisieren** - Stimmen die MUST/SHOULD/COULD für dich?
3. **Phase 0 starten** - Setup ist das Fundament!
4. **Wöchentliche Check-ins** - Fortschritt tracken, Blocker identifizieren

**Bereit loszulegen?** Lass uns mit Phase 0 beginnen! 🚀

---

**Ende der Roadmap**