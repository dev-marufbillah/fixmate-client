/**
 * FixMate seed data — makes the live site look complete & realistic:
 *  • 5 accounts: 1 admin, 2 technicians, 2 customers (password: Fixmate123)
 *  • 25 services across all 7 categories (22 approved + 3 pending for the approval queue)
 *  • 18 bookings covering EVERY status (incl. 2 ready-to-pay "Pay Now" demos)
 *  • 6 paid jobs with payment records + ratings & review text (stars on service cards)
 *
 * Re-running is safe: demo collections are rebuilt only when the target counts change,
 * existing accounts are kept, and your own edits survive once counts match.
 *
 * Run from the client folder:  npm run seed
 * Requires .env.local (MONGODB_URI + BETTER_AUTH_SECRET) — the same file Next.js uses.
 */
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

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

async function getDb() {
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fixmate");
  await client.connect();
  return client.db();
}

// ---------------------------------------------------------------------------
// 1) Users via BetterAuth's own handler (guarantees password hashing works)
// ---------------------------------------------------------------------------
async function signUp(auth: any, name: string, email: string, role: string) {
  const res = await auth.handler(
    new Request("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({ name, email, password: PASSWORD, role }),
    })
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = JSON.stringify(body);
    if (/already|exist|duplicate/i.test(msg)) return;
    console.warn(`   ! sign-up issue for ${email}: ${msg.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// 2) Seed content
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
  // ── Smartphone ───────────────────────────────────────────────────────────
  { title: "iPhone Screen Replacement (OLED)", category: "Smartphone", description: "Genuine-quality OLED panel replacement for iPhone 12–15. Includes frame inspection, adhesive reseal and 30-day workmanship warranty. Dead pixels and touch issues fixed on the spot.", image: `${IMG}/smartphone.jpg`, basePrice: 79, estimatedDuration: "2-3 hours", serviceMode: "Shop Drop-off", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 12 },
  { title: "Samsung Display & Touch Repair", category: "Smartphone", description: "Cracked glass or unresponsive touch? We replace Samsung displays with calibrated parts and test every sensor, camera and proximity switch before handover.", image: `${IMG}/smartphone.jpg`, basePrice: 65, estimatedDuration: "2-4 hours", serviceMode: "Home Visit", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 11 },
  { title: "Phone Battery Replacement (All Brands)", category: "Smartphone", description: "Battery draining before lunch? New high-capacity cell with health calibration for Samsung, Xiaomi, Realme, Oppo and iPhone. Old cell safely recycled.", image: `${IMG}/smartphone.jpg`, basePrice: 29, estimatedDuration: "45-60 min", serviceMode: "Home Visit", serviceArea: "Mirpur, Dhaka", tech: 1, ageDays: 9 },
  { title: "Charging Port & Micro-Solder Repair", category: "Smartphone", description: "Loose charging, slow sync or a dead port? Board-level micro-soldering fixes damaged flexes, connectors and ICs — data-safe, no motherboard swap needed.", image: `${IMG}/smartphone.jpg`, basePrice: 45, estimatedDuration: "2-3 hours", serviceMode: "Shop Drop-off", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 7 },

  // ── Laptop & PC ──────────────────────────────────────────────────────────
  { title: "Laptop Full Service & Thermal Paste", category: "Laptop & PC", description: "Complete laptop servicing: internal dust cleaning, thermal paste renewal, fan check, hinge inspection and performance tuning. Fixes overheating and slowdowns.", image: `${IMG}/laptop.jpg`, basePrice: 45, estimatedDuration: "3-4 hours", serviceMode: "Shop Drop-off", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 10 },
  { title: "SSD Upgrade & OS Migration", category: "Laptop & PC", description: "Switch to blazing-fast SSD storage. We clone your OS and data, migrate everything safely and optimize boot times — usually under 3 hours.", image: `${IMG}/laptop.jpg`, basePrice: 55, estimatedDuration: "2-3 hours", serviceMode: "Shop Drop-off", serviceArea: "Mirpur, Dhaka", tech: 1, ageDays: 8 },
  { title: "Laptop Screen Replacement (All Brands)", category: "Laptop & PC", description: "Broken laptop display replaced with compatible HD/FHD panels for HP, Dell, Lenovo and Asus. Includes inverter and cable testing.", image: `${IMG}/laptop.jpg`, basePrice: 85, estimatedDuration: "3-4 hours", serviceMode: "Shop Drop-off", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 1, approvalStatus: "pending" },
  { title: "Virus Removal & OS Cleanup", category: "Laptop & PC", description: "Pop-ups, slowdowns or strange startup programs? Full malware sweep, browser cleanup, driver refresh and Windows/macOS tune-up with a fresh backup.", image: `${IMG}/laptop.jpg`, basePrice: 30, estimatedDuration: "2-3 hours", serviceMode: "Home Visit", serviceArea: "Gulshan, Dhaka", tech: 0, ageDays: 6 },

  // ── AC ───────────────────────────────────────────────────────────────────
  { title: "Split AC Deep Servicing", category: "AC", description: "Full indoor + outdoor deep clean with eco-friendly chemicals, coil fin straightening, drainage check and cooling performance test. Beat the Dhaka heat.", image: `${IMG}/ac.jpg`, basePrice: 40, estimatedDuration: "2-3 hours", serviceMode: "Home Visit", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 10 },
  { title: "AC Gas Refill & Cooling Check", category: "AC", description: "Leaking or weak cooling? Pressure test, leak sealing and R-410A/R-32 gas refill with a 7-day cooling guarantee.", image: `${IMG}/ac.jpg`, basePrice: 35, estimatedDuration: "1-2 hours", serviceMode: "Home Visit", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 9 },
  { title: "AC Installation & Uninstallation", category: "AC", description: "New split or window AC fitted safely with copper piping, vacuuming and gas-pressure test. Old unit removal and re-installation also included.", image: `${IMG}/ac.jpg`, basePrice: 55, estimatedDuration: "2-3 hours", serviceMode: "Home Visit", serviceArea: "Banani, Dhaka", tech: 1, ageDays: 5 },
  { title: "AC Not Turning On — Complete Diagnosis", category: "AC", description: "Dead unit? We trace PCB, capacitor, compressor and remote-receiver faults with a written diagnosis before any part is replaced — no surprise costs.", image: `${IMG}/ac.jpg`, basePrice: 30, estimatedDuration: "1-2 hours", serviceMode: "Home Visit", serviceArea: "Mohammadpur, Dhaka", tech: 0, ageDays: 4 },

  // ── Refrigerator ─────────────────────────────────────────────────────────
  { title: "Refrigerator Compressor Diagnosis", category: "Refrigerator", description: "Not cooling properly? Multimeter-based compressor, relay and thermostat diagnosis with a clear fix-or-replace recommendation — no guesswork.", image: `${IMG}/refrigerator.jpg`, basePrice: 60, estimatedDuration: "1-2 visits", serviceMode: "Home Visit", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 9 },
  { title: "Fridge Gas Leakage Repair", category: "Refrigerator", description: "Find and repair refrigerant leaks, replace damaged coils and recharge gas. Includes capillary tube inspection and 7-day cooling follow-up.", image: `${IMG}/refrigerator.jpg`, basePrice: 50, estimatedDuration: "3-5 hours", serviceMode: "Home Visit", serviceArea: "Mirpur, Dhaka", tech: 1, ageDays: 7 },
  { title: "Deep Freezer & Thermostat Repair", category: "Refrigerator", description: "Fridge freezing everything or not cooling at all? Thermostat recalibration, defrost timer replacement and airflow balancing for all major brands.", image: `${IMG}/refrigerator.jpg`, basePrice: 45, estimatedDuration: "2-3 hours", serviceMode: "Home Visit", serviceArea: "Old Dhaka, Dhaka", tech: 0, ageDays: 3 },

  // ── TV ───────────────────────────────────────────────────────────────────
  { title: "LED TV Backlight Repair", category: "TV", description: "Screen dark or half-visible? We replace failed backlight strips on LED/4K TVs and recalibrate brightness uniformity.", image: `${IMG}/tv.jpg`, basePrice: 70, estimatedDuration: "4-6 hours", serviceMode: "Shop Drop-off", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 8 },
  { title: "Smart TV Software & HDMI Fix", category: "TV", description: "Firmware crashes, apps freezing, HDMI ports not detected? Firmware reflash, port reflow and smart-feature setup included.", image: `${IMG}/tv.jpg`, basePrice: 30, estimatedDuration: "1-2 hours", serviceMode: "Home Visit", serviceArea: "Uttara, Dhaka", tech: 1, ageDays: 6 },
  { title: "TV Power Board & No-Display Repair", category: "TV", description: "TV won't turn on or shows no picture but has sound? Board-level repair of power supply, T-Con and mainboard with original-grade components.", image: `${IMG}/tv.jpg`, basePrice: 58, estimatedDuration: "3-5 hours", serviceMode: "Shop Drop-off", serviceArea: "Badda, Dhaka", tech: 1, ageDays: 2 },

  // ── Washing Machine ──────────────────────────────────────────────────────
  { title: "Washing Machine Drum & Belt Repair", category: "Washing Machine", description: "Noise, shake or no spin? Drum bearing check, belt replacement and full mechanical overhaul for top and front-load machines.", image: `${IMG}/washing.jpg`, basePrice: 45, estimatedDuration: "3-4 hours", serviceMode: "Home Visit", serviceArea: "Mirpur, Dhaka", tech: 1, ageDays: 7 },
  { title: "Washer Spin Motor Repair", category: "Washing Machine", description: "Drum won't spin or stops mid-cycle? Motor carbon-brush replacement, capacitor check and control-board testing for both auto and semi-auto machines.", image: `${IMG}/washing.jpg`, basePrice: 65, estimatedDuration: "3-5 hours", serviceMode: "Home Visit", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 5 },
  { title: "Washing Machine Installation & Piping", category: "Washing Machine", description: "New machine delivered? Stand leveling, inlet/outlet piping, first-run leak test and spin-cycle setup by a trained technician.", image: `${IMG}/washing.jpg`, basePrice: 35, estimatedDuration: "1-1.5 hours", serviceMode: "Home Visit", serviceArea: "Savar, Dhaka", tech: 1, ageDays: 1 },

  // ── Electrical ───────────────────────────────────────────────────────────
  { title: "Home Electrical Wiring Safety Check", category: "Electrical", description: "Complete socket, breaker and earthing inspection with load testing. We flag fire hazards and fix loose connections on the spot.", image: `${IMG}/electrical.jpg`, basePrice: 50, estimatedDuration: "2-3 hours", serviceMode: "Home Visit", serviceArea: "Dhanmondi, Dhaka", tech: 0, ageDays: 6 },
  { title: "Ceiling Fan Installation & Repair", category: "Electrical", description: "New fan installation, speed regulator wiring, bearing noise repair and wobbling balance fixes for all fan brands.", image: `${IMG}/electrical.jpg`, basePrice: 25, estimatedDuration: "1 hour", serviceMode: "Home Visit", serviceArea: "Mirpur, Dhaka", tech: 0, ageDays: 4 },
  // ── Pending moderation queue ─────────────────────────────────────────────
  { title: "Inverter & Home UPS Repair", category: "Electrical", description: "Inverter beeping or not taking charge? Battery health test, MOSFET/relay repair and full load test for home UPS and inverter systems.", image: `${IMG}/electrical.jpg`, basePrice: 75, estimatedDuration: "3-5 hours", serviceMode: "Shop Drop-off", serviceArea: "Gulshan, Dhaka", tech: 1, ageDays: 1, approvalStatus: "pending" },
  { title: "Electric Stove & Oven Repair", category: "Electrical", description: "Burner dead or oven not heating evenly? Element, thermostat and wiring repair for kitchen stoves, ovens and hobs of every brand.", image: `${IMG}/electrical.jpg`, basePrice: 40, estimatedDuration: "2-3 hours", serviceMode: "Home Visit", serviceArea: "Mohammadpur, Dhaka", tech: 0, ageDays: 1, approvalStatus: "pending" },
];

interface SeedBooking {
  serviceIndex: number;
  customer: number; // index into CUSTOMERS
  status: "requested" | "accepted" | "rejected" | "in-progress" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  finalAmount?: number;
  ageDays: number;
  problem: string;
  rating?: number;
  review?: string;
}

// Business-rule safe: a customer never has 2 ACTIVE bookings for the same service.
const BOOKINGS: SeedBooking[] = [
  // ── requested (cancellable by customer, accept/reject by technician) ─────
  { serviceIndex: 0, customer: 0, status: "requested", paymentStatus: "unpaid", ageDays: 0, problem: "iPhone 14 fell on the floor — display cracked on the top-left corner and touch is dead near that area. Need original-quality screen." },
  { serviceIndex: 8, customer: 1, status: "requested", paymentStatus: "unpaid", ageDays: 1, problem: "Split AC is not cooling since last week and the outdoor unit makes a strange rattling noise in the evening." },
  { serviceIndex: 2, customer: 0, status: "requested", paymentStatus: "unpaid", ageDays: 1, problem: "Battery drops from 80% to 20% in two hours even after a full factory reset. Phone also heats while charging." },
  // ── accepted ─────────────────────────────────────────────────────────────
  { serviceIndex: 12, customer: 0, status: "accepted", paymentStatus: "unpaid", ageDays: 2, problem: "Refrigerator stopped cooling properly — freezer works a bit but the lower compartment stays warm. Compressor seems to run constantly." },
  { serviceIndex: 10, customer: 1, status: "accepted", paymentStatus: "unpaid", ageDays: 2, problem: "New 1.5-ton split AC purchased — needs installation in the bedroom with 8 ft copper piping and outdoor unit mounting." },
  // ── in-progress ──────────────────────────────────────────────────────────
  { serviceIndex: 4, customer: 1, status: "in-progress", paymentStatus: "unpaid", ageDays: 3, problem: "Laptop shuts down after 20 minutes of use. Fans are loud and the keyboard area gets very hot during charging." },
  { serviceIndex: 18, customer: 0, status: "in-progress", paymentStatus: "unpaid", ageDays: 3, problem: "Washing machine stopped spinning and makes a grinding noise during the spin cycle. Water drains normally." },
  // ── completed + unpaid → live "Pay Now" demos ────────────────────────────
  { serviceIndex: 15, customer: 0, status: "completed", paymentStatus: "unpaid", finalAmount: 75, ageDays: 5, problem: "55-inch LED TV display is very dim — you can barely see the picture in daylight. Sounds and channels work fine." },
  { serviceIndex: 16, customer: 1, status: "completed", paymentStatus: "unpaid", finalAmount: 35, ageDays: 4, problem: "Smart TV apps freeze after a few minutes and Netflix keeps crashing. HDMI-2 is also not detecting the set-top box." },
  // ── completed + paid (payments + ratings & reviews) ──────────────────────
  { serviceIndex: 19, customer: 1, status: "completed", paymentStatus: "paid", finalAmount: 70, ageDays: 9, problem: "Washer stopped spinning and made a grinding noise during the spin cycle.", rating: 5, review: "Motor fixed in one visit and the price matched the quote exactly. Very professional." },
  { serviceIndex: 5, customer: 0, status: "completed", paymentStatus: "paid", finalAmount: 60, ageDays: 8, problem: "Old HDD laptop takes 6+ minutes to boot — want a full SSD migration with Windows clone.", rating: 5, review: "Boot time went from 6 minutes to 12 seconds. They even cloned all my files perfectly." },
  { serviceIndex: 9, customer: 1, status: "completed", paymentStatus: "paid", finalAmount: 40, ageDays: 11, problem: "AC gas refill needed — room never gets cold enough even on 16°C.", rating: 4, review: "Cooling is much better now. Took a little longer than promised but handled it politely." },
  { serviceIndex: 21, customer: 0, status: "completed", paymentStatus: "paid", finalAmount: 55, ageDays: 12, problem: "Old flat wiring check needed before renovating — worried about earthing and overloaded sockets.", rating: 5, review: "Found two dangerous loose connections no one noticed before. Worth every taka." },
  { serviceIndex: 3, customer: 1, status: "completed", paymentStatus: "paid", finalAmount: 40, ageDays: 10, problem: "Charging port loose — cable falls out and charging only works at an angle.", rating: 5, review: "Port rebuilt like new, plus they cleaned the speaker mesh for free. Highly recommend." },
  { serviceIndex: 7, customer: 0, status: "completed", paymentStatus: "paid", finalAmount: 30, ageDays: 13, problem: "Laptop infected with adware — constant pop-ups and browser redirects.", rating: 4, review: "All threats removed and the laptop feels quick again. Straightforward and honest service." },
  // ── cancelled / rejected ─────────────────────────────────────────────────
  { serviceIndex: 1, customer: 0, status: "cancelled", paymentStatus: "unpaid", ageDays: 10, problem: "Samsung phone glass cracked slightly — decided to replace the phone instead, cancelling the request." },
  { serviceIndex: 22, customer: 1, status: "cancelled", paymentStatus: "unpaid", ageDays: 13, problem: "Ceiling fan installation — plans changed, shifting to a new flat with pre-installed fans." },
  { serviceIndex: 13, customer: 1, status: "rejected", paymentStatus: "unpaid", ageDays: 11, problem: "Fridge gas refill urgently — model too old, spare coils unavailable, technician rejected the job." },
];

// ---------------------------------------------------------------------------
// 3) Main
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
    // note: the users collection email index is created by BetterAuth itself
  ]);

  // ---- users (kept across runs) ----
  console.log("👤 Creating users via BetterAuth…");
  const wanted = [
    ["FixMate Admin", "admin@fixmate.test", "customer"],
    ...TECHS.map((t) => [t.name, t.email, "technician"]),
    ...CUSTOMERS.map((c) => [c.name, c.email, "customer"]),
  ] as const;
  const present = new Set(
    (await users.find({ email: { $in: wanted.map(([, e]) => e) } }).toArray()).map((u) => u.email)
  );
  for (const [name, email, role] of wanted) {
    if (!present.has(email)) await signUp(auth, name, email, role);
  }

  // Admin role is never self-registered — promote manually (assignment-approved: seed)
  await users.updateOne(
    { email: "admin@fixmate.test" },
    { $set: { role: "admin", area: "Mirpur, Dhaka", phone: "+8801700000000" } }
  );
  for (const t of TECHS) {
    await users.updateOne({ email: t.email }, { $set: { area: t.area, bio: t.bio, image: null } });
  }

  // ---- services (rebuild only when the target set changed) ----
  const existingCount = await services.countDocuments();
  let serviceDocs: any[] = [];
  if (existingCount === SERVICES.length) {
    serviceDocs = await services.find({}).sort({ createdAt: 1 }).toArray();
    console.log(`🛠️  Services already match target (${existingCount}) — keeping yours`);
  } else {
    if (existingCount) await services.deleteMany({});
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
    serviceDocs = await services.find({}).sort({ createdAt: 1 }).toArray();
    const approved = await services.countDocuments({ approvalStatus: "approved" });
    console.log(`   inserted ${result.insertedCount} services (${approved} approved, ${result.insertedCount - approved} pending)`);
  }
  // Reorder serviceDocs to follow SERVICES order (bookings reference by index)
  const byTitle = new Map(serviceDocs.map((s) => [s.title, s]));
  serviceDocs = SERVICES.map((s) => byTitle.get(s.title)).filter(Boolean);

  // ---- bookings (rebuild with services so indexes stay consistent) ----
  const existingBookings = await bookings.countDocuments();
  if (existingBookings === BOOKINGS.length) {
    console.log(`📅 Bookings already match target (${existingBookings}) — keeping yours`);
  } else {
    if (existingBookings) {
      await bookings.deleteMany({});
      await payments.deleteMany({});
    }
    console.log("📅 Inserting bookings across every status…");
    for (const b of BOOKINGS) {
      const svc = serviceDocs[b.serviceIndex] || serviceDocs[0];
      if (!svc) continue;
      const created = new Date(now - b.ageDays * DAYS);
      const history: { status: string; changedAt: Date }[] = [{ status: "requested", changedAt: created }];
      const order = ["requested", "accepted", "in-progress", "completed"];
      const stopAt = b.status === "cancelled" || b.status === "rejected" ? "requested" : b.status;
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
      const doc: Record<string, unknown> = {
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
        customerPhone: b.customer === 0 ? "01712-345678" : "01819-876543",
        address: b.customer === 0 ? "House 42, Road 9, Dhanmondi, Dhaka" : "House 7, Sector 4, Uttara, Dhaka",
        preferredDate: new Date(created.getTime() + 2 * DAYS),
        problemDescription: b.problem,
        status: b.status,
        paymentStatus: b.paymentStatus,
        statusHistory: history,
        createdAt: created,
      };
      if (b.rating) doc.rating = b.rating;
      if (b.review) doc.review = b.review;
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
    console.log(`   inserted ${BOOKINGS.length} bookings (${BOOKINGS.filter((b) => b.paymentStatus === "paid").length} with payments)`);
  }

  // ---- ratings → average on services (stars on cards & details) ----
  const rated = await bookings
    .aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: "$serviceId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ])
    .toArray();
  for (const r of rated) {
    await services.updateOne({ _id: r._id }, { $set: { ratingAvg: Math.round(r.avg * 10) / 10, ratingCount: r.count } });
  }

  const sCount = await services.countDocuments();
  const bCount = await bookings.countDocuments();
  const pCount = await payments.countDocuments();
  console.log("");
  console.log("✅ Seed complete!");
  console.log(`   services=${sCount}  bookings=${bCount}  payments=${pCount}  rated-services=${rated.length}`);
  console.log("   Test accounts (all password: Fixmate123):");
  console.log("   🔑 Admin      admin@fixmate.test");
  console.log("   🔑 Technicians technician@fixmate.test  /  technician2@fixmate.test");
  console.log("   🔑 Customers  customer@fixmate.test  /  customer2@fixmate.test");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
