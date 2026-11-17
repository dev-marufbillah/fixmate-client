/**
 * FixMate seed data — creates realistic connected data so the live site looks complete:
 * 1 admin, 2 technician accounts, 2 customers, 14 services (12+ approved across 7 categories),
 * bookings in every status (incl. one ready-to-pay and one already paid + payment record).
 *
 * Run from the client folder:  npm run seed
 * Requires .env.local (MONGODB_URI + BETTER_AUTH_SECRET) — same file Next.js uses.
 */
import fs from "fs";
import path from "path";
import { MongoClient, Collection } from "mongodb";

// ---------------------------------------------------------------------------
// 0) Load .env.local manually (the script runs outside of Next.js)
// ---------------------------------------------------------------------------
function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile();

const PASSWORD = "Fixmate123";
const DAYS = 86_400_000;
const now = Date.now();

// ---------------------------------------------------------------------------
// 1) Connect MongoDB (shared helper) + create indexes
// ---------------------------------------------------------------------------
async function getDb() {
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fixmate");
  await client.connect();
  return client.db();
}

// ---------------------------------------------------------------------------
// 2) Users via BetterAuth's own handler (guarantees password hashing works)
// ---------------------------------------------------------------------------
async function signUp(auth: any, name: string, email: string, role: string) {
  const res = await auth.handler(
    new Request("http://localhost/api/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password: PASSWORD, role }),
    })
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = JSON.stringify(body);
    if (msg.toLowerCase().includes("already")) return; // fine — exists
    // Duplicate users are fine on re-runs; anything else should be visible.
    if (!msg.toLowerCase().includes("exist") && !msg.toLowerCase().includes("duplicate")) {
      console.warn(`   ! sign-up issue for ${email}: ${msg.slice(0, 200)}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3) Seed content
// ---------------------------------------------------------------------------
const IMG = "/images/services";

const TECHS = [
  {
    name: "Rahim Uddin",
    email: "technician@fixmate.test",
    area: "Dhanmondi, Dhaka",
    bio: "7+ years in mobile & laptop hardware repair. Certified in micro-soldering and data recovery.",
  },
  {
    name: "Sabbir Khan",
    email: "technician2@fixmate.test",
    area: "Uttara, Dhaka",
    bio: "Home appliance specialist — AC, fridge and washing machine expert with factory-trained experience.",
  },
];

const CUSTOMERS = [
  { name: "Nusrat Jahan", email: "customer@fixmate.test", area: "Dhanmondi, Dhaka" },
  { name: "Tanvir Hasan", email: "customer2@fixmate.test", area: "Uttara, Dhaka" },
];

interface SeedService {
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: "Home Visit" | "Shop Drop-off";
  serviceArea: string;
  tech: number; // index into TECHS
  approvalStatus?: "pending" | "approved" | "rejected";
  ageDays: number;
}

const SERVICES: SeedService[] = [
  { title: "iPhone Screen Replacement (OLED)", category: "Smartphone", description: "Genuine-quality OLED panel replacement for iPhone 12–15. Includes frame inspection, adhesive reseal and 30-day workmanship warranty. Dead pixels and touch issues fixed on the spot.", image: `${IMG}/smartphone.jpg`, basePrice: 79, estimatedDuration: "2-3 hours", serviceMode: "Shop Drop-off", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 9 },
  { title: "Samsung Display & Touch Repair", category: "Smartphone", description: "Cracked glass or unresponsive touch? We replace Samsung displays with calibrated parts and test every sensor before handover.", image: `${IMG}/smartphone.jpg`, basePrice: 65, estimatedDuration: "2-4 hours", serviceMode: "Home Visit", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 8 },
  { title: "Laptop Full Service & Thermal Paste", category: "Laptop & PC", description: "Complete laptop servicing: internal dust cleaning, thermal paste renewal, fan check, hinge inspection and performance tuning. Fixes overheating and slowdowns.", image: `${IMG}/laptop.jpg`, basePrice: 45, estimatedDuration: "3-4 hours", serviceMode: "Shop Drop-off", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 7 },
  { title: "SSD Upgrade & OS Migration", category: "Laptop & PC", description: "Switch to blazing-fast SSD storage. We clone your OS and data, migrate everything safely and optimize boot times — usually under 3 hours.", image: `${IMG}/laptop.jpg`, basePrice: 55, estimatedDuration: "2-3 hours", serviceMode: "Shop Drop-off", serviceArea: "Mirpur, Dhaka", tech: 1, ageDays: 6 },
  { title: "Split AC Deep Servicing", category: "AC", description: "Full indoor + outdoor deep clean with eco-friendly chemicals, coil fin straightening, drainage check and cooling performance test. Beat the Dhaka heat.", image: `${IMG}/ac.jpg`, basePrice: 40, estimatedDuration: "2-3 hours", serviceMode: "Home Visit", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 6 },
  { title: "AC Gas Refill & Cooling Check", category: "AC", description: "Leaking or weak cooling? Pressure test, leak sealing and R-410A/R-32 gas refill with a 7-day cooling guarantee.", image: `${IMG}/ac.jpg`, basePrice: 35, estimatedDuration: "1-2 hours", serviceMode: "Home Visit", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 5 },
  { title: "Refrigerator Compressor Diagnosis", category: "Refrigerator", description: "Not cooling properly? Multimeter-based compressor, relay and thermostat diagnosis with a clear fix-or-replace recommendation — no guesswork.", image: `${IMG}/refrigerator.jpg`, basePrice: 60, estimatedDuration: "1-2 visits", serviceMode: "Home Visit", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 5 },
  { title: "Fridge Gas Leakage Repair", category: "Refrigerator", description: "Find and repair refrigerant leaks, replace damaged coils and recharge gas. Includes capillary tube inspection.", image: `${IMG}/refrigerator.jpg`, basePrice: 50, estimatedDuration: "3-5 hours", serviceMode: "Home Visit", serviceArea: "Mirpur, Dhaka", tech: 1, ageDays: 4 },
  { title: "LED TV Backlight Repair", category: "TV", description: "Screen dark or half-visible? We replace failed backlight strips on LED/4K TVs and recalibrate brightness uniformity.", image: `${IMG}/tv.jpg`, basePrice: 70, estimatedDuration: "4-6 hours", serviceMode: "Shop Drop-off", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 4 },
  { title: "Smart TV Software & HDMI Fix", category: "TV", description: "Firmware crashes, apps freezing, HDMI ports not detected? Firmware reflash, port reflow and smart-feature setup included.", image: `${IMG}/tv.jpg`, basePrice: 30, estimatedDuration: "1-2 hours", serviceMode: "Home Visit", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 3 },
  { title: "Washing Machine Drum & Belt Repair", category: "Washing Machine", description: "Noise, shake or no spin? Drum bearing check, belt replacement and full mechanical overhaul for top and front-load machines.", image: `${IMG}/washing.jpg`, basePrice: 45, estimatedDuration: "3-4 hours", serviceMode: "Home Visit", serviceArea: "Mirpur, Dhaka", tech: 1, ageDays: 3 },
  { title: "Home Electrical Wiring Safety Check", category: "Electrical", description: "Complete socket, breaker and earthing inspection with load testing. We flag fire hazards and fix loose connections on the spot.", image: `${IMG}/electrical.jpg`, basePrice: 50, estimatedDuration: "2-3 hours", serviceMode: "Home Visit", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 2 },
  // Pending examples (moderation queue)
  { title: "Ceiling Fan Installation & Repair", category: "Electrical", description: "New fan installation, speed regulator wiring, bearing noise repair and wobbling balance fixes for all fan brands.", image: `${IMG}/electrical.jpg`, basePrice: 25, estimatedDuration: "1 hour", serviceMode: "Home Visit", serviceArea: "Mirpur, Dhaka", tech: 0, ageDays: 1, approvalStatus: "pending" },
  { title: "Laptop Screen Replacement (All Brands)", category: "Laptop & PC", description: "Broken laptop display replaced with compatible HD/FHD panels for HP, Dell, Lenovo and Asus. Includes inverter and cable testing.", image: `${IMG}/laptop.jpg`, basePrice: 85, estimatedDuration: "3-4 hours", serviceMode: "Shop Drop-off", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 1, approvalStatus: "pending" },
];

interface SeedBooking {
  serviceIndex: number;
  customer: number;
  status: string;
  paymentStatus: "unpaid" | "paid";
  finalAmount?: number;
  ageDays: number;
  problem: string;
}

const BOOKINGS: SeedBooking[] = [
  { serviceIndex: 0, customer: 0, status: "requested", paymentStatus: "unpaid", ageDays: 0, problem: "iPhone 14 fell on the floor — display cracked on the top-left corner and touch is dead near that area. Need original-quality screen." },
  { serviceIndex: 4, customer: 1, status: "requested", paymentStatus: "unpaid", ageDays: 1, problem: "Split AC is not cooling since last week and the outdoor unit makes a strange rattling noise in the evening." },
  { serviceIndex: 6, customer: 0, status: "accepted", paymentStatus: "unpaid", ageDays: 2, problem: "Refrigerator stopped cooling properly — freezer works a bit but the lower compartment stays warm. Compressor seems to run constantly." },
  { serviceIndex: 2, customer: 1, status: "in-progress", paymentStatus: "unpaid", ageDays: 3, problem: "Laptop shuts down after 20 minutes of use. Fans are loud and the keyboard area gets very hot during charging." },
  { serviceIndex: 8, customer: 0, status: "completed", paymentStatus: "unpaid", finalAmount: 75, ageDays: 5, problem: "55-inch LED TV display is very dim — you can barely see the picture in daylight. Sounds and channels work fine." },
  { serviceIndex: 10, customer: 1, status: "completed", paymentStatus: "paid", finalAmount: 52, ageDays: 9, problem: "Washing machine stopped spinning and makes a grinding noise during the spin cycle. Water drains normally." },
  { serviceIndex: 1, customer: 0, status: "cancelled", paymentStatus: "unpaid", ageDays: 10, problem: "Samsung phone glass cracked slightly — decided to replace the phone instead, cancelling the request." },
  { serviceIndex: 5, customer: 1, status: "rejected", paymentStatus: "unpaid", ageDays: 11, problem: "AC gas refill needed urgently but the model is too old and parts are unavailable — technician rejected the job." },
];

// ---------------------------------------------------------------------------
// 4) Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("🌱 FixMate seed starting…");

  // BetterAuth config must be imported AFTER env is loaded
  const { auth } = await import(path.join(__dirname, "..", "src", "lib", "server", "auth"));
  const db = await getDb();
  const users = db.collection("user");
  const services = db.collection("services");
  const bookings = db.collection("bookings");
  const payments = db.collection("payments");

  // Indexes (mirror of the API server)
  await Promise.all([
    services.createIndex({ approvalStatus: 1, isAvailable: 1, createdAt: -1 }),
    services.createIndex({ technicianEmail: 1 }),
    bookings.createIndex({ customerEmail: 1, serviceId: 1, status: 1 }),
    bookings.createIndex({ technicianEmail: 1, status: 1 }),
    payments.createIndex({ stripeSessionId: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true }),
  ]);

  // ---- users ----
  console.log("👤 Creating users via BetterAuth…");
  await signUp(auth, "FixMate Admin", "admin@fixmate.test", "customer");
  for (const t of TECHS) await signUp(auth, t.name, t.email, "technician");
  for (const c of CUSTOMERS) await signUp(auth, c.name, c.email, "customer");

  // Admin role is never self-registered — promote manually (assignment-approved: seed)
  await users.updateOne(
    { email: "admin@fixmate.test" },
    { $set: { role: "admin", area: "Mirpur, Dhaka", phone: "+8801700000000" } }
  );
  for (const t of TECHS) {
    await users.updateOne({ email: t.email }, { $set: { area: t.area, bio: t.bio, image: null } });
  }

  // ---- services ----
  const existingCount = await services.countDocuments();
  let serviceDocs: any[] = [];
  if (existingCount >= 12) {
    serviceDocs = await services.find({}).toArray();
    console.log(`🛠️  Services already exist (${existingCount}) — reusing`);
  } else {
    console.log("🛠️  Inserting services…");
    const docs = SERVICES.map((s) => ({
      title: s.title,
      category: s.category,
      description: s.description,
      image: s.image,
      basePrice: s.basePrice,
      estimatedDuration: s.estimatedDuration,
      serviceMode: s.serviceMode,
      serviceArea: s.serviceArea,
      technicianName: TECHS[s.tech].name,
      technicianEmail: TECHS[s.tech].email,
      approvalStatus: s.approvalStatus || "approved",
      isAvailable: true,
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: new Date(now - s.ageDays * DAYS),
    }));
    const result = await services.insertMany(docs as any);
    serviceDocs = await services.find({}).toArray();
    console.log(`   inserted ${result.insertedCount} services`);
  }

  // ---- bookings ----
  const existingBookings = await bookings.countDocuments();
  if (existingBookings >= 5) {
    console.log(`📅 Bookings already exist (${existingBookings}) — skipping`);
  } else {
    console.log("📅 Inserting bookings across every status…");
    for (const b of BOOKINGS) {
      const svc = serviceDocs[b.serviceIndex] || serviceDocs[0];
      if (!svc) continue;
      const created = new Date(now - b.ageDays * DAYS);
      const history: { status: string; changedAt: Date }[] = [{ status: "requested", changedAt: created }];
      const order = ["requested", "accepted", "in-progress", "completed"];
      const stopAt =
        b.status === "cancelled" || b.status === "rejected"
          ? "requested"
          : b.status;
      const idx = order.indexOf(stopAt);
      if (idx > 0) {
        for (let i = 1; i <= idx; i++) {
          history.push({ status: order[i], changedAt: new Date(created.getTime() + i * 3600_000) });
        }
      }
      if (b.status === "cancelled" || b.status === "rejected") {
        history.push({ status: b.status, changedAt: new Date(created.getTime() + 7200_000) });
      }
      if (b.paymentStatus === "paid") {
        history.push({ status: "paid", changedAt: new Date(created.getTime() + 6 * 3600_000) });
      }

      const cust = CUSTOMERS[b.customer];
      const doc = {
        serviceId: String(svc._id),
        serviceTitle: svc.title,
        serviceImage: svc.image,
        category: svc.category,
        basePrice: svc.basePrice,
        finalAmount: b.finalAmount ?? svc.basePrice,
        technicianName: svc.technicianName,
        technicianEmail: svc.technicianEmail,
        customerName: cust.name,
        customerEmail: cust.email,
        customerPhone: "01712345678",
        address: b.customer === 0 ? "House 42, Road 9, Dhanmondi, Dhaka" : "House 7, Sector 4, Uttara, Dhaka",
        preferredDate: new Date(created.getTime() + 2 * DAYS),
        problemDescription: b.problem,
        status: b.status,
        paymentStatus: b.paymentStatus,
        statusHistory: history,
        createdAt: created,
      };
      const res = await bookings.insertOne(doc as any);

      // matching payment record for the paid job
      if (b.paymentStatus === "paid") {
        await payments.insertOne({
          bookingId: String(res.insertedId),
          serviceTitle: svc.title,
          customerName: cust.name,
          customerEmail: cust.email,
          technicianName: svc.technicianName,
          technicianEmail: svc.technicianEmail,
          amount: b.finalAmount ?? svc.basePrice,
          currency: "usd",
          transactionId: `ch_seed_${String(res.insertedId).slice(-10)}`,
          stripeSessionId: `cs_seed_${String(res.insertedId).slice(-10)}`,
          paymentStatus: "paid",
          paidAt: new Date(created.getTime() + 6 * 3600_000),
        });
      }
    }
    console.log(`   inserted ${BOOKINGS.length} bookings`);
  }

  // ---- ratings on a couple of paid/completed bookings ----
  await bookings.updateMany(
    { status: "completed", paymentStatus: "paid", rating: { $exists: false } },
    { $set: { rating: 5, review: "Excellent work — on time, tidy and fairly priced." } }
  );
  const rated = await bookings
    .aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: "$serviceId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ])
    .toArray();
  for (const r of rated) {
    await services.updateOne({ _id: r._id }, { $set: { ratingAvg: Math.round(r.avg * 10) / 10, ratingCount: r.count } });
  }

  console.log("");
  console.log("✅ Seed complete! Test accounts (all password: Fixmate123):");
  console.log("   🔑 Admin     admin@fixmate.test");
  console.log("   🔑 Technician technician@fixmate.test  /  technician2@fixmate.test");
  console.log("   🔑 Customer  customer@fixmate.test  /  customer2@fixmate.test");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
