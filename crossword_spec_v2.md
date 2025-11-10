# Spezifikationsdokument: Crossword Vokabel-Trainer
**Codename**: EDU-PUZZLE  
**Version**: 2.0  
**Letzte Aktualisierung**: November 2024

---

## 1. Projekt-Übersicht

### 1.1 Zielsetzung
Entwicklung einer webbasierten Anwendung, die Nutzern das Lernen von Vokabeln und Begriffen durch individuell generierte Kreuzworträtsel ermöglicht.

### 1.2 Zielgruppe
- Internationale Lerner (Fokus: Englisch/Deutsch)
- Schüler, Studenten und Erwachsene
- Selbstlerner mit eigenen Vokabellisten

### 1.3 Kern-Innovation
Kombination von nutzer-generierten Inhalten mit einem intelligenten Spaced Repetition System (SRS), das automatisch aus dem Rätsel-Lösungsverhalten die Lernqualität ableitet.

### 1.4 Monetarisierung
**7-Tage-Trial-Modell**:
- Nutzer registrieren sich kostenlos
- 7 Tage voller Zugriff auf alle Features
- Nach 7 Tagen: Paywall für Premium-Features
- **Premium-Preis**: €4,99/Monat oder €49,99/Jahr

---

## 2. Technischer Stack & Architektur

### 2.1 Übersicht

| Bereich | Technologie | Zweck |
|---------|-------------|-------|
| **Frontend** | Vite + React + TypeScript | Schnelle Entwicklung, vertrauter Stack |
| **UI Styling** | Tailwind CSS | Utility-First CSS Framework |
| **Frontend Hosting** | Vercel | Einfaches Deployment, CDN, Domain-Management |
| **Backend** | Supabase Edge Functions | Serverless API-Endpunkte |
| **Datenbank** | Supabase (PostgreSQL) | Skalierbare Datenbank mit integrierter Auth |
| **Authentifizierung** | Supabase Auth | Email/Password, OAuth (Google, evtl. GitHub) |
| **Zahlungsabwicklung** | Stripe Billing | Abonnements, Webhooks, Rechnungsstellung |
| **Entwicklungssprache** | TypeScript | Typ-Sicherheit über gesamten Stack |

### 2.2 Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │   React App (Vite + TS)                          │  │
│  │   - Vokabellisten-Verwaltung                     │  │
│  │   - Rätsel-UI (Grid-basiert)                     │  │
│  │   - Performance-Tracking (Zeit, Fehler)          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                              │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  Supabase Auth   │  │   PostgreSQL Database    │    │
│  │  - Email/Pass    │  │   - users                │    │
│  │  - OAuth         │  │   - lists                │    │
│  └──────────────────┘  │   - words                │    │
│                        │   - user_word_progress   │    │
│  ┌──────────────────┐  │   - puzzle_sessions      │    │
│  │  Edge Functions  │  └──────────────────────────┘    │
│  │  - generate      │                                   │
│  │  - submit        │                                   │
│  │  - stripe-hook   │                                   │
│  └──────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    STRIPE                                │
│  - Subscription Management                               │
│  - Webhook Events (trial_end, payment_success)          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Datenbank-Schema (PostgreSQL)

### 3.1 Tabelle: `users`

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | UUID (PK) | Primärschlüssel, verknüpft mit Supabase Auth |
| `email` | TEXT | Email-Adresse (von Supabase Auth) |
| `is_premium` | BOOLEAN | Premium-Status (Default: false) |
| `trial_ends_at` | TIMESTAMP | Ende des 7-Tage-Trials |
| `stripe_customer_id` | TEXT (nullable) | Stripe Customer ID |
| `created_at` | TIMESTAMP | Registrierungsdatum |

**Policies**:
- Row Level Security (RLS) aktiviert
- User kann nur eigene Daten lesen/schreiben

---

### 3.2 Tabelle: `lists`

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | UUID (PK) | Primärschlüssel |
| `user_id` | UUID (FK) | Fremdschlüssel zu `users.id` |
| `name` | TEXT | Name der Liste (z.B. "Spanisch A1") |
| `target_language` | TEXT | Sprache (z.B. "es", "de", "en") |
| `source_language` | TEXT | Ausgangssprache (z.B. "de", "en") |
| `created_at` | TIMESTAMP | Erstellungsdatum |
| `updated_at` | TIMESTAMP | Letzte Änderung |

**Constraints**:
- `ON DELETE CASCADE` bei User-Löschung

---

### 3.3 Tabelle: `words`

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | UUID (PK) | Primärschlüssel |
| `list_id` | UUID (FK) | Fremdschlüssel zu `lists.id` |
| `word` | TEXT | Das zu lernende Wort |
| `definition` | TEXT | Definition/Übersetzung (wird als Hinweis genutzt) |
| `language` | TEXT | Sprache des Wortes (z.B. "en", "de") |
| `created_at` | TIMESTAMP | Erstellungsdatum |

**Constraints**:
- `ON DELETE CASCADE` bei Listen-Löschung
- Index auf `list_id` für schnelle Abfragen

---

### 3.4 Tabelle: `user_word_progress` (SRS-Daten)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `user_id` | UUID (PK, FK) | Fremdschlüssel zu `users.id` |
| `word_id` | UUID (PK, FK) | Fremdschlüssel zu `words.id` |
| `due_date` | DATE | Nächstes Fälligkeitsdatum |
| `ease_factor` | NUMERIC(3,2) | SM-2 Ease Factor (Default: 2.5) |
| `interval_days` | INTEGER | Aktuelles Intervall in Tagen |
| `consecutive_correct` | INTEGER | Anzahl korrekter Wiederholungen in Folge |
| `last_reviewed` | TIMESTAMP | Zeitpunkt der letzten Überprüfung |
| `total_reviews` | INTEGER | Gesamtanzahl der Wiederholungen |

**Composite Primary Key**: (`user_id`, `word_id`)

**Constraints**:
- `ON DELETE CASCADE` bei User- oder Word-Löschung

---

### 3.5 Tabelle: `puzzle_sessions` (Optional für MVP)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | UUID (PK) | Primärschlüssel |
| `user_id` | UUID (FK) | Fremdschlüssel zu `users.id` |
| `list_id` | UUID (FK) | Fremdschlüssel zu `lists.id` |
| `created_at` | TIMESTAMP | Erstellungszeitpunkt |
| `completed_at` | TIMESTAMP (nullable) | Abschlusszeitpunkt |
| `words_used` | JSONB | Array der verwendeten `word_ids` |

**Zweck**: Tracking für Analytics, evtl. späteres "Rätsel fortsetzen"-Feature

---

## 4. API-Endpunkte (Supabase Edge Functions)

### 4.1 `POST /functions/v1/generate-puzzle`

**Beschreibung**: Generiert ein neues Kreuzworträtsel aus einer Vokabelliste.

#### Request Body
```typescript
{
  list_id: string; // UUID der Vokabelliste
}
```

#### Ablauf

1. **Authentifizierung prüfen**
   - Validiere JWT-Token von Supabase Auth
   - Hole `user_id`

2. **Trial/Premium-Status prüfen**
   - Prüfe `users.is_premium` ODER `users.trial_ends_at > NOW()`
   - Falls beides false: Return 403 "Trial abgelaufen"

3. **Wortauswahl**
   - **Premium-Nutzer**: 
     - Hole 15-20 Wörter mit `due_date <= TODAY()` aus `user_word_progress`
     - Falls <10 Wörter: Fülle mit neuen Wörtern auf
   - **Trial-Nutzer**: 
     - Hole 15-20 zufällige Wörter aus der Liste

4. **Rätsel-Generierung**
   - Rufe `generateCrossword(words)` auf (siehe Abschnitt 5)
   - Falls Generierung fehlschlägt: Retry mit weniger Wörtern (10, 8, 5)

5. **Session-Tracking** (optional)
   - Erstelle Eintrag in `puzzle_sessions`

6. **Response**
```typescript
{
  puzzle: {
    grid: string[][];
    words: PlacedWord[];
    dimensions: { rows: number; cols: number };
  };
  session_id: string; // UUID
}
```

#### Error Responses
- `401`: Nicht authentifiziert
- `403`: Trial abgelaufen, Premium erforderlich
- `404`: Liste nicht gefunden
- `500`: Generierung fehlgeschlagen

---

### 4.2 `POST /functions/v1/submit-solution`

**Beschreibung**: Nimmt die Lösung eines Rätsels entgegen und aktualisiert SRS-Daten (nur für Premium).

#### Request Body
```typescript
{
  session_id: string; // UUID der Puzzle-Session
  solutions: Array<{
    word_id: string;
    time_seconds: number; // Zeit für dieses Wort
    errors: number; // Anzahl Fehler
    revealed_letters: number; // Anzahl verwendeter Hinweise
    correct: boolean; // Endgültig richtig?
  }>;
}
```

#### Ablauf

1. **Authentifizierung & Validierung**
   - Validiere JWT-Token
   - Prüfe, ob `session_id` zum User gehört
   - Validiere Eingaben (time < 600s, errors >= 0, etc.)

2. **Premium-Check**
   - Falls nicht Premium: Return 200 (speichere aber keine SRS-Daten)

3. **SRS-Berechnung** (nur Premium)
   - Für jedes Wort in `solutions`:
     - Berechne `q` (Quality-Score 0-5) basierend auf Performance (siehe Abschnitt 6)
     - Rufe `calculateSRS(word, q)` auf (siehe Abschnitt 6)
     - Update `user_word_progress`

4. **Session abschließen**
   - Setze `puzzle_sessions.completed_at = NOW()`

5. **Response**
```typescript
{
  success: true;
  words_updated: number; // Anzahl aktualisierter SRS-Einträge
  next_review_date: string; // Nächstes Fälligkeitsdatum
}
```

---

### 4.3 `POST /functions/v1/stripe-webhook`

**Beschreibung**: Verarbeitet Stripe-Webhook-Events zur Synchronisation des Premium-Status.

#### Ablauf

1. **Webhook-Verifizierung**
   - Prüfe Stripe-Signatur mit `STRIPE_WEBHOOK_SECRET`

2. **Event-Handling**
   - **`customer.subscription.created`**:
     - Hole `customer_id` → finde User via `stripe_customer_id`
     - Setze `users.is_premium = TRUE`
   
   - **`customer.subscription.updated`**:
     - Prüfe `status` (active, past_due, canceled)
     - Update `users.is_premium` entsprechend
   
   - **`customer.subscription.deleted`**:
     - Setze `users.is_premium = FALSE`
   
   - **`invoice.payment_failed`**:
     - Optional: Email an User senden
     - Ggf. `is_premium` auf false nach 3 Fehlversuchen

3. **Response**
```typescript
{ received: true }
```

---

## 5. Kreuzworträtsel-Generierung (Blackbox)

### 5.1 Interface-Definition

```typescript
interface WordInput {
  id: string;
  word: string;
  clue: string;
  language: string;
}

interface PlacedWord {
  id: string;
  word: string;
  clue: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  number: number; // Rätsel-Nummer
}

interface PuzzleOutput {
  grid: string[][];
  words: PlacedWord[];
  dimensions: { rows: number; cols: number };
}

function generateCrossword(words: WordInput[]): PuzzleOutput | null;
```

### 5.2 Algorithmus-Strategie

#### MVP-Phase: Template-basiert
- 5-10 vordefinierte Grid-Layouts (verschiedene Größen)
- Wörter werden nach Länge sortiert und in passende Slots eingefügt
- **Vorteil**: Generierung <1 Sekunde, einfach zu implementieren
- **Nachteil**: Weniger Variation, nicht optimal ausgefüllt

#### Post-MVP: Constraint-basiert mit Backtracking
- Dynamische Platzierung mit Überschneidungen
- Backtracking bei Sackgassen
- **Vorteil**: Bessere Qualität, natürlichere Rätsel
- **Nachteil**: Komplexer, 2-5 Sekunden Generierung

### 5.3 Generierungs-Parameter

- **Min. Wörter**: 5
- **Max. Wörter**: 20
- **Max. Grid-Größe**: 15x15
- **Timeout**: 10 Sekunden (dann Fallback zu kleinerem Rätsel)

---

## 6. Spaced Repetition System (SRS)

### 6.1 Automatische Qualitäts-Bewertung (q-Score)

Die Qualitätsstufe `q` (0-5) wird automatisch aus dem Nutzerverhalten abgeleitet:

| q-Score | Bedingungen | Beschreibung |
|---------|-------------|--------------|
| **0** | `correct = false` ODER `revealed_letters > 50%` | Falsch oder zu viel Hilfe |
| **3** | `correct = true` UND (`time > P75` ODER `errors >= 3` ODER `revealed_letters >= 50%`) | Geraten/Schwierig |
| **4** | `correct = true` UND `time` zwischen P25-P75 UND `errors 1-2` | Zögerlich |
| **5** | `correct = true` UND `time < P25` UND `errors = 0` UND `revealed_letters <= 10%` | Perfekt |

**Hinweis**: P25/P75 = 25./75. Perzentil der Zeit-Verteilung (wird aus historischen Daten berechnet)

#### Vereinfachte MVP-Version (ohne Perzentile)

```typescript
function calculateQuality(solution: Solution, word: Word): number {
  const { correct, time_seconds, errors, revealed_letters } = solution;
  const word_length = word.word.length;
  
  // Falsch oder zu viel Hilfe
  if (!correct || revealed_letters / word_length > 0.5) {
    return 0;
  }
  
  // Perfekt: schnell, keine Fehler, wenig Hilfe
  if (time_seconds < word_length * 2 && errors === 0 && revealed_letters <= 1) {
    return 5;
  }
  
  // Zögerlich: moderate Performance
  if (time_seconds < word_length * 4 && errors <= 2) {
    return 4;
  }
  
  // Schwierig: langsam oder viele Fehler
  return 3;
}
```

### 6.2 SM-2 Algorithmus

Basiert auf dem SuperMemo 2 Algorithmus.

#### Variablen
- `EF` = Ease Factor (Leichtigkeitsfaktor, Default: 2.5)
- `n` = Anzahl aufeinanderfolgender korrekter Antworten
- `I` = Intervall in Tagen

#### Formeln

**1. Ease Factor Update** (nur bei q >= 3)
```
EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
EF' = max(1.3, EF')  // Minimum-Wert
```

**2. Intervall-Berechnung**
```
Wenn q < 3:
  I = 1 Tag
  n = 0  // Reset
  
Wenn q >= 3:
  Wenn n = 0:  I = 1 Tag
  Wenn n = 1:  I = 6 Tage
  Wenn n > 1:  I = round(I_alt * EF')
  n = n + 1
```

**3. Nächstes Due Date**
```
due_date = heute + I Tage
```

#### TypeScript-Implementation

```typescript
interface SRSData {
  ease_factor: number;
  interval_days: number;
  consecutive_correct: number;
  due_date: Date;
}

function calculateSRS(currentData: SRSData, q: number): SRSData {
  let { ease_factor, interval_days, consecutive_correct } = currentData;
  
  // Update Ease Factor (nur bei q >= 3)
  if (q >= 3) {
    ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    ease_factor = Math.max(1.3, ease_factor);
  }
  
  // Berechne Intervall
  if (q < 3) {
    interval_days = 1;
    consecutive_correct = 0;
  } else {
    consecutive_correct++;
    
    if (consecutive_correct === 1) {
      interval_days = 1;
    } else if (consecutive_correct === 2) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
  }
  
  // Berechne Due Date
  const due_date = new Date();
  due_date.setDate(due_date.getDate() + interval_days);
  
  return {
    ease_factor,
    interval_days,
    consecutive_correct,
    due_date
  };
}
```

---

## 7. Frontend-Struktur

### 7.1 Pages/Routes

| Route | Komponente | Beschreibung | Auth erforderlich |
|-------|-----------|--------------|-------------------|
| `/` | `Landing` | Marketing-Page | Nein |
| `/login` | `Login` | Login/Registrierung | Nein |
| `/dashboard` | `Dashboard` | Übersicht Listen | Ja |
| `/lists/:id` | `ListView` | Vokabeln einer Liste | Ja |
| `/puzzle/:listId` | `PuzzleView` | Rätsel-Interface | Ja |
| `/settings` | `Settings` | Account-Einstellungen | Ja |
| `/pricing` | `Pricing` | Upgrade zu Premium | Ja |

### 7.2 Komponenten-Hierarchie

```
App
├── AuthProvider (Context)
│   └── ProtectedRoute
│       ├── Dashboard
│       │   ├── ListCard (mehrfach)
│       │   └── CreateListModal
│       ├── ListView
│       │   ├── WordTable
│       │   └── AddWordForm
│       └── PuzzleView
│           ├── CrosswordGrid
│           │   └── Cell (2D-Array)
│           ├── CluesList
│           │   ├── AcrossClues
│           │   └── DownClues
│           └── PuzzleControls
└── PaywallModal
```

### 7.3 State Management

**Strategie**: React Context API für globalen State, lokaler State für Komponenten.

**Contexts**:
- `AuthContext`: User, Session, is_premium, trial_ends_at
- `ListContext`: Listen-CRUD-Operationen
- `PuzzleContext`: Aktuelles Rätsel, Grid-State, Timer

---

## 8. Monetarisierung & Geschäftsmodell

### 8.1 Trial-Logik

```
User registriert sich
  → trial_ends_at = now() + 7 Tage
  → Voller Zugriff auf alle Features

Nach 7 Tagen:
  → Bei jedem API-Call: Prüfe trial_ends_at
  → Falls abgelaufen UND nicht is_premium:
      → Return 403 "Trial expired"
      → Frontend zeigt Paywall-Modal
```

### 8.2 Pricing-Strategie

| Plan | Preis | Features |
|------|-------|----------|
| **Trial** | Kostenlos (7 Tage) | Alle Features unlimitiert |
| **Premium** | €4,99/Monat oder €49,99/Jahr | Unbegrenzte Rätsel, SRS-System, zukünftige Features |

**Upgrade-Flow**:
1. User klickt "Upgrade to Premium"
2. Redirect zu Stripe Checkout
3. Nach erfolgreicher Zahlung: Webhook → `is_premium = true`
4. User wird zurück zur App redirected

---

## 9. Sicherheit & Datenschutz

### 9.1 Authentifizierung
- Supabase Auth mit Row Level Security (RLS)
- JWT-Tokens für API-Authentifizierung
- Email-Verifikation vor erstem Login

### 9.2 DSGVO-Compliance
- **Datensparsamkeit**: Nur notwendige Daten speichern
- **Löschung**: `ON DELETE CASCADE` in allen FK-Beziehungen
- **Export**: User kann alle Daten als JSON exportieren (zukünftiges Feature)
- **Cookie-Banner**: Nur essenzielle Cookies (Session)

### 9.3 Input-Validierung
- Server-seitige Validierung aller Inputs
- XSS-Schutz durch React (escaped by default)
- SQL-Injection-Schutz durch Supabase (prepared statements)

---

## 10. Deployment & DevOps

### 10.1 Deployment-Pipeline

```
Git Push (main branch)
  → GitHub Actions
    → Linting (ESLint)
    → Type-Check (TypeScript)
    → Build (Vite)
  → Vercel Deploy (automatisch)
```

### 10.2 Umgebungen

| Env | Branch | URL | Zweck |
|-----|--------|-----|-------|
| **Development** | `dev` | localhost:5173 | Lokale Entwicklung |
| **Staging** | `staging` | staging.app.com | Testing vor Production |
| **Production** | `main` | app.com | Live-System |

### 10.3 Environment Variables

**Frontend** (.env):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
```

**Backend** (Supabase Secrets):
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 11. Analytics & Monitoring

### 11.1 KPIs (für spätere Implementierung)

- **Acquisition**: Registrierungen/Tag
- **Activation**: % User die 1. Rätsel lösen
- **Retention**: 7-Tage-Retention, 30-Tage-Retention
- **Revenue**: Conversion Rate (Trial → Premium), MRR
- **Engagement**: Ø Rätsel/User/Tag

### 11.2 Error Tracking

- Supabase Logs für Backend-Errors
- Console-Logging für Frontend (später: Sentry)

---

## 12. Roadmap (Phasen-Übersicht)

### Phase 1: MVP (Wochen 1-4)
- ✅ User Authentication
- ✅ Listen- & Wörter-Verwaltung
- ✅ Template-basierte Rätsel-Generierung
- ✅ Basic Rätsel-UI
- ✅ 7-Tage-Trial-Logik

### Phase 2: Premium Features (Wochen 5-6)
- ✅ Stripe-Integration
- ✅ SRS-System
- ✅ Premium-Paywall

### Phase 3: Quality & Features (Wochen 7-9)
- ✅ Verbesserter Generierungs-Algorithmus
- ✅ Statistiken & Analytics
- ✅ Mehrsprachigkeit (EN + DE)
- ✅ Performance-Optimierung

---

## 13. Offene Fragen & Entscheidungen

| Frage | Status | Notizen |
|-------|--------|---------|
| Finaler App-Name | Offen | "EDU-PUZZLE" ist Arbeitstitel |
| Domain | Offen | z.B. vocabcross.com, learnwords.app |
| Finale Pricing-Struktur | Tentativ | €4,99/Monat, könnte A/B-getestet werden |
| Template-Layouts | Offen | 5-10 Layouts, Design-Phase |
| Perzentil-Berechnung für q-Score | Offen | MVP: Vereinfachte Schwellwerte |

---

## Anhang A: Datenbank-Initialisierung (SQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (ergänzt Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lists table
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_language TEXT NOT NULL,
  source_language TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Words table
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_words_list_id ON words(list_id);

-- User word progress (SRS)
CREATE TABLE user_word_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  ease_factor NUMERIC(3,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  consecutive_correct INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP,
  total_reviews INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, word_id)
);

-- Puzzle sessions (optional)
CREATE TABLE puzzle_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  words_used JSONB
);

-- Row Level Security Policies
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own lists" ON lists
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own lists" ON lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- (Weitere Policies analog für andere Tabellen)
```

---

**Ende des Spezifikationsdokuments**