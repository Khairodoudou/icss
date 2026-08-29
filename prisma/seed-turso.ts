/**
 * seed-turso.ts
 * Seeds initial data directly into Turso Cloud via @libsql/client.
 * Run with:
 * $env:TURSO_DATABASE_URL="libsql://..."; $env:TURSO_AUTH_TOKEN="eyJ..."; npx ts-node --esm prisma/seed-turso.ts
 */

import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

if (!url || !authToken) {
  console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.')
  process.exit(1)
}

const db = createClient({ url, authToken })

function cuid(): string {
  return 'c' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

async function main() {
  console.log('\n🌱 Seeding Turso database...\n')

  // ── 1. Admin user ────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('123456789', 10)
  const adminId = cuid()
  await db.execute({
    sql: `INSERT OR REPLACE INTO "User" (id, name, email, password, role, status, phone, company, updatedAt)
          VALUES (?, 'Admin ICSS', 'admin@gmail.com', ?, 'ADMIN', 'ACTIVE', '+213 555 000 000', 'ICSS Platform', datetime('now'))`,
    args: [adminId, adminPassword],
  })
  console.log('  ✅ Admin user: admin@gmail.com / 123456789')

  // ── 2. Demo client user ──────────────────────────────────────────────────
  const clientPassword = await bcrypt.hash('123456789', 10)
  const clientId = cuid()
  await db.execute({
    sql: `INSERT OR REPLACE INTO "User" (id, name, email, password, role, status, phone, company, updatedAt)
          VALUES (?, 'Anis Bensalem', 'anis@gmail.com', ?, 'USER', 'ACTIVE', '+213 666 111 222', 'StartupDZ', datetime('now'))`,
    args: [clientId, clientPassword],
  })
  console.log('  ✅ Client user:  anis@gmail.com / 123456789')

  // ── 3. Subscription plans ────────────────────────────────────────────────
  const plans = [
    {
      id: cuid(),
      name: 'FREE',
      price: 0,
      features: JSON.stringify([
        'الوصول إلى الخدمات',
        'تصفح البرامج التدريبية',
        'الدعم عبر البريد الإلكتروني',
        'متابعة الطلبات الأساسية',
      ]),
    },
    {
      id: cuid(),
      name: 'STARTUP',
      price: 2000,
      features: JSON.stringify([
        'الوصول لجميع الخدمات',
        'الحجوزات مشمولة',
        'خصومات حصرية على البرامج',
        'متابعة الطلبات الكاملة',
        'دعم ذو أولوية',
      ]),
    },
    {
      id: cuid(),
      name: 'PREMIUM',
      price: 5000,
      features: JSON.stringify([
        'جميع مزايا ستارتب',
        'تدريب شخصي مخصص 1-على-1',
        'الوصول لخبراء معتمدين',
        'أولوية كاملة في الحجوزات',
        'تقرير أداء شهري مخصص',
      ]),
    },
  ]

  for (const plan of plans) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO "SubscriptionPlan" (id, name, price, billingPeriod, features, isActive, updatedAt)
            VALUES (?, ?, ?, 'MONTHLY', ?, 1, datetime('now'))`,
      args: [plan.id, plan.name, plan.price, plan.features],
    })
  }
  console.log('  ✅ 3 subscription plans created')

  // ── 4. Services ──────────────────────────────────────────────────────────
  const services = [
    {
      id: cuid(),
      title: 'Coaching Stratégique',
      description: 'Sessions individuelles pour définir et affiner votre stratégie business, identifier vos forces et accélérer votre croissance.',
      price: 15000,
      duration: '3 sessions × 90 min',
      category: 'Business Coaching',
    },
    {
      id: cuid(),
      title: 'Pitch & Fundraising',
      description: 'Préparation complète de votre pitch deck, entraînement à la présentation et stratégie pour lever des fonds.',
      price: 25000,
      duration: '5 sessions × 60 min',
      category: 'Fundraising',
    },
    {
      id: cuid(),
      title: 'Business English',
      description: 'Maîtrisez l\'anglais des affaires pour communiquer efficacement avec des partenaires internationaux.',
      price: 18000,
      duration: '8 sessions × 60 min',
      category: 'Business English',
    },
    {
      id: cuid(),
      title: 'Digital Marketing',
      description: 'Stratégie de marketing digital, gestion des réseaux sociaux, et optimisation de votre présence en ligne.',
      price: 20000,
      duration: '4 sessions × 90 min',
      category: 'Marketing',
    },
  ]

  for (const svc of services) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO "Service" (id, title, description, price, duration, category, isActive, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      args: [svc.id, svc.title, svc.description, svc.price, svc.duration, svc.category],
    })
  }
  console.log(`  ✅ ${services.length} services created`)

  // ── 5. Programs ──────────────────────────────────────────────────────────
  const programs = [
    {
      id: cuid(),
      title: 'Programme Accélération Startup',
      description: 'Programme intensif de 3 mois pour valider votre MVP, structurer votre business model et préparer votre levée de fonds.',
      price: 85000,
      duration: '3 mois',
      level: 'Intermédiaire',
      sessions: 12,
    },
    {
      id: cuid(),
      title: 'Leadership & Management',
      description: 'Développez vos compétences de leadership pour manager votre équipe et piloter votre croissance.',
      price: 45000,
      duration: '6 semaines',
      level: 'Avancé',
      sessions: 6,
    },
  ]

  for (const prog of programs) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO "Program" (id, title, description, price, duration, level, sessions, isActive, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      args: [prog.id, prog.title, prog.description, prog.price, prog.duration, prog.level, prog.sessions],
    })
  }
  console.log(`  ✅ ${programs.length} programs created`)

  // ── Summary ──────────────────────────────────────────────────────────────
  const tables = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  console.log('\n📋 Database summary:')
  for (const row of tables.rows) {
    const count = await db.execute(`SELECT COUNT(*) as c FROM "${row.name}"`)
    console.log(`   • ${row.name}: ${count.rows[0].c} rows`)
  }

  console.log('\n✅ Turso database seeded successfully!\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
