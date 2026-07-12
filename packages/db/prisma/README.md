# 🗄️ Kingdom of Bees - Database Schema

**Database:** PostgreSQL (Supabase)
**ORM:** Prisma
**Version:** 1.0
**Total Tables:** 60+

---

## 📊 Schema Organization

### **Phase 1 - MVP (Core Tables)**

#### A. User Management (5 tables)
- `UserProfile` - User accounts and profiles
- `ApiaryMembership` - Apiary team members
- `UserNotificationSettings` - Notification preferences
- `Notification` - User notifications
- `UserActivityLog` - Activity tracking

#### B. Apiary Management (3 tables)
- `Apiary` - Apiary/beeyards
- `ApiaryLocationHistory` - Location tracking (for migratory)
- `ApiaryEquipmentLog` - Equipment inventory logs

#### C. Hive Management (5 tables)
- `Hive` - Bee hives
- `HiveFrame` - Individual frames
- `HiveSuper` - Supers (second story)
- `HiveHistory` - Hive event history
- `BaladiHiveAssessment` - Traditional hive assessments

#### D. Inspections (4 tables)
- `Inspection` - Hive inspections
- `InspectionFinding` - Findings/issues
- `InspectionAction` - Actions taken
- `InspectionFrameDetail` - Frame-by-frame details

---

### **Phase 2 - Advanced Features**

#### E. Queens & Nuclei (4 tables)
- `Queen` - Queen bees
- `QueenRearingCycle` - Queen breeding cycles
- `Nucleus` - Nucleus colonies
- `QueenCell` - Queen cells (for royal jelly)

#### F. Feeding (3 tables)
- `FeedingRecord` - Feeding history
- `FeedingRecommendation` - AI recommendations
- `FeedingSchedule` - Feeding schedules

#### G. Diseases (4 tables)
- `DiseaseLibrary` - Disease encyclopedia
- `DiseaseRecord` - Disease occurrences
- `TreatmentPlan` - Treatment plans
- `DiseaseMapEntry` - Community disease map

#### H. Harvest (5 tables)
- `HarvestRecord` - General harvest records
- `HoneyHarvest` - Honey harvest details
- `PollenHarvest` - Pollen harvest details
- `RoyalJellyProduction` - Royal jelly production
- `HarvestRecommendation` - Harvest recommendations

#### I. Operations (4 tables)
- `SplitOperation` - Hive splits
- `MergeOperation` - Hive merges
- `ConsolidationOperation` - Hive consolidation
- `SwarmEvent` - Swarm events

#### J. Plants (4 tables)
- `PlantLibrary` - Central plant database
- `LocalPlant` - Local plant records
- `ForageAssessment` - Forage capacity assessments
- `PlantObservation` - Plant observations

#### K. Weather (3 tables)
- `WeatherData` - Weather records
- `WeatherForecast` - Weather forecasts
- `WeatherImpact` - Weather impact events

---

### **Phase 3 - Advanced (Future)**

#### L. Marketplace (2 tables - Deferred)
- `MarketplaceListing` - Product listings
- `FinancialTransaction` - Transactions

#### M. Sync & System (7 tables)
- `SyncEvent` - Sync events
- `OfflineQueue` - Offline operation queue
- `BackupHistory` - Backup logs
- `SystemSetting` - System settings
- `AIRecommendationLog` - AI recommendation logs
- `Alert` - System alerts
- `AppFeedback` - User feedback
- `SearchHistory` - Search history

---

## 🔐 Security

### Row Level Security (RLS)
All tables implement Supabase RLS policies to ensure:
- Users can only access their own data
- Apiary members can access apiary data based on permissions
- Public data (plant library, disease library) is read-only

### Authentication
- Supabase Auth for user management
- JWT tokens for API authentication
- Role-based access control (Owner, Worker, Viewer)

---

## 📝 Key Relationships

```
UserProfile
├─ owns → Apiary (1:Many)
├─ member of → Apiary via ApiaryMembership (Many:Many)
├─ performs → Inspection (1:Many)
└─ receives → Notification (1:Many)

Apiary
├─ has → Hive (1:Many)
├─ has → Nucleus (1:Many)
├─ has → LocalPlant (1:Many)
└─ has → WeatherData (1:Many)

Hive
├─ has → HiveFrame (1:Many)
├─ has → HiveSuper (1:Many)
├─ has → Inspection (1:Many)
├─ has → FeedingRecord (1:Many)
├─ has → HoneyHarvest (1:Many)
└─ has → Queen (1:1)

Queen
├─ mother of → Queen (1:Many)
├─ produced in → QueenRearingCycle
└─ lives in → Hive or Nucleus
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd packages/db
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
DATABASE_URL="postgresql://user:pass@host:port/dbname"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Push Schema to Database
```bash
npx prisma db push
```

Or create migration:
```bash
npx prisma migrate dev --name init
```

### 5. Seed Database (Optional)
```bash
npx prisma db seed
```

---

## 📊 Schema Statistics

- **Total Models:** 60+
- **Total Enums:** 40+
- **Relationships:** 150+
- **Indexes:** 100+
- **Unique Constraints:** 30+

---

## 🔄 Migration Strategy

### Development
```bash
npx prisma migrate dev
```

### Production
```bash
npx prisma migrate deploy
```

### Reset Database (Caution!)
```bash
npx prisma migrate reset
```

---

## 📖 Documentation

- **Prisma Docs:** https://www.prisma.io/docs
- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## 🐛 Troubleshooting

### Issue: Prisma Client not generating
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Issue: Migration conflicts
```bash
npx prisma migrate resolve --applied <migration_name>
```

### Issue: Database connection
Check `.env` file and database accessibility

---

**Last Updated:** December 18, 2025
**Schema Version:** 1.0.0

