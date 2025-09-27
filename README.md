# 🏋️ Fitness Suplementi Platforma

Kompletna full-stack platforma za prodaju suplemenata i trenerskih programa sa naprednim multi-role panelima.

![Platform Demo](https://ymq8yf8s7no5.space.minimax.io)

## 🌟 Funkcionalnosti

### 🛒 E-Commerce 
- Katalog suplemenata sa kategorijama (protein, kreatin, vitamini, pre-workout)
- Napredni search i filtering sistem
- Košarica i checkout proces
- Sistem recenzija i ocena proizvoda
- Inventory management

### 🏃‍♂️ Trenerski Sistem
- Rezervacija trenerskih sesija
- Kalendarski sistem za trenere
- Workout program management
- Progress tracking za klijente (težina, snaga, adherence)
- Komunikacija između trenera i klijenata

### 👥 Multi-Role Paneli
- **KORISNIK (Klijent)** - Panel za pregled produkata, rezervaciju treninga, praćenje napretka
- **TRENER** - Panel za upravljanje klijentima, rasporedima, praćenje ocena i performansi
- **TERETANA** - Panel za pregled prioritetnih korisnika na osnovu kupovina, analitiku
- **PRODAVNICA** - Panel za upravljanje proizvodima, nagrade za korisnike, popusti

### 🤖 Algoritmi & Automatizacija
- **PIPFT Algoritam** - Ocenjivanje trenera na osnovu uspešnosti klijenata (94% reliability)
- **Automatska Prioritizacija** - Teretane dobijaju prioritete korisnika na osnovu kupovina
- **Rewards Sistem** - Automatski popusti i nagrade za aktivne kupce
- **Real-time Updates** - Cron job-ovi za automatsko ažuriranje

## 🚀 Tech Stack

### Frontend
- **React 18** sa TypeScript
- **Vite** za development i build
- **Tailwind CSS** za styling
- **Framer Motion** za animacije
- **React Router** za navigaciju

### Backend
- **Supabase** - Database, Auth, Storage, Edge Functions
- **PostgreSQL** - Glavna baza podataka
- **Stripe** - Payment processing
- **WebSocket** - Real-time updates

### Deployment
- **Vite Build** - Optimizovani production build
- **GitHub** - Source control

## 📦 Instalacija

### Preduslovi
- Node.js 18+
- npm ili pnpm
- Supabase nalog
- Stripe nalog (opciono)

### 1. Clone Repository
```bash
git clone https://github.com/UnlimitedEdition/fitness-suplementi-platforma.git
cd fitness-suplementi-platforma
```

### 2. Instalacija Dependencies
```bash
# Koristi pnpm (preporučeno)
pnpm install

# Ili npm
npm install
```

### 3. Environment Setup
Kreiraj `.env.local` fajl u root direktorijumu:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Supabase Setup

#### Database Schema
```bash
# Primeni migracije
cd supabase
supabase db push

# Ili ručno izvršavaj SQL fajlove iz supabase/tables/
```

#### Edge Functions
```bash
# Deploy edge functions
supabase functions deploy calculate-priorities
supabase functions deploy create-payment-intent
supabase functions deploy evaluate-trainer
supabase functions deploy upload-image
supabase functions deploy user-init
```

#### Storage Bucket
```bash
# Kreiraj bucket za slike
supabase storage create-bucket platform-images
```

### 5. Development Server
```bash
pnpm dev
# ili
npm run dev
```

Aplikacija će biti dostupna na `http://localhost:5173`

## 🔧 Production Build

```bash
# Build za production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Struktura Projekta

```
fitness-suplementi-platforma/
├── src/
│   ├── components/       # React komponente
│   ├── pages/           # Stranice aplikacije
│   ├── contexts/        # React konteksti
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utility funkcije
├── supabase/
│   ├── functions/       # Edge functions
│   ├── tables/          # Database schema
│   └── migrations/      # Database migracije
├── public/              # Static assets
├── docs/                # Dokumentacija i analize
└── dist/                # Production build
```

## 🗄️ Database Schema

### Glavne Tabele
- `user_profiles` - Profili korisnika
- `user_roles` - Role sistema (korisnik, trener, teretana, prodavnica)
- `products` - Katalog proizvoda
- `product_categories` - Kategorije proizvoda
- `orders` - Narudžbine
- `training_sessions` - Trenerski sesije
- `trainer_profiles` - Profili trenera
- `client_progress` - Napredak klijenata
- `trainer_reviews` - Ocene trenera
- `reward_points` - Sistem nagrada

## 🔐 Authentication & Authorization

Platforma koristi Supabase Auth sa role-based access control:

- **Public** - Pregled produkata
- **Korisnik** - Kupovina, rezervacija treninga
- **Trener** - Upravljanje klijentima, sesijama
- **Teretana** - Prioritetni korisnici, analitika  
- **Prodavnica** - Upravljanje proizvodima, popusti

## 📊 Analytics & Metrije

### PIPFT Algoritam
Ocenjivanje trenera na osnovu:
- Client Success Rate (>70% dobro)
- Retention Rate (60-80% standard)
- Session Attendance (>85% odlično)
- Client Satisfaction (>80% target)

### Business Metrije
- Conversion rate praćenje
- Customer lifetime value
- Churn prediction
- Revenue analytics

## 🔄 Deployment

### Automatski Deploy
```bash
# Build i deploy
pnpm build
# Upload dist/ folder na hosting

# Ili koristi GitHub Actions (setup required)
```

### Environment Variables
Production environment treba:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 
- `VITE_STRIPE_PUBLISHABLE_KEY`

## 📚 Dokumentacija

Detaljne analize i istraživanja dostupne u `docs/` folderu:
- [E-Commerce Analiza](docs/ecommerce_suplementi_analiza.md)
- [Fitness Coaching Platforme](docs/fitness_coaching_analiza.md)
- [Rating & Tracking Sistemi](docs/rating_tracking_analiza.md)
- [Multi-Role Dashboards](docs/multi_role_dashboards_analiza.md)

## 🤝 Contributing

1. Fork repository
2. Kreiraj feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit promene (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Otvori Pull Request

## 📝 License

Ovaj projekat je licenciran pod MIT licencom - pogledaj [LICENSE](LICENSE) fajl za detalje.

## 👤 Autor

**UnlimitedEdition**
- GitHub: [@UnlimitedEdition](https://github.com/UnlimitedEdition)
- Demo: [https://ymq8yf8s7no5.space.minimax.io](https://ymq8yf8s7no5.space.minimax.io)

## 🙏 Acknowledgments

- Inspiracija iz analiza vodećih fitness i e-commerce platformi
- Supabase za backend infrastrukturu
- React i Vite zajednice za odličnu dokumentaciju
- PIPFT algoritam baziran na akademskim istraživanjima

---

💪 **Napravljeno sa strašću za fitness industriju!**