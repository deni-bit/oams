const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const User     = require('../models/User');
const Auction  = require('../models/Auction');
const Bid      = require('../models/Bid');

dotenv.config();

const users = [
  { name: 'Super Admin',    email: 'admin@oams.com',   password: 'Admin@1234',  role: 'admin'  },
  { name: 'James Okonkwo',  email: 'james@test.com',   password: '123456',      role: 'buyer'  },
  { name: 'Amina Hassan',   email: 'amina@test.com',   password: '123456',      role: 'buyer'  },
  { name: 'Denis Mwangi',   email: 'denis@test.com',   password: '123456',      role: 'buyer'  },
  { name: 'Sofia Reyes',    email: 'sofia@test.com',   password: '123456',      role: 'buyer'  },
  { name: 'Luca Bianchi',   email: 'luca@test.com',    password: '123456',      role: 'buyer'  },
  { name: 'Yuki Tanaka',    email: 'yuki@test.com',    password: '123456',      role: 'buyer'  },
];

const auctionTemplates = (adminId) => [
  // ── Watches ──
  {
    title: 'Rolex Submariner 1968',
    description: 'An exceptional vintage Rolex Submariner ref. 5513 from 1968. Original glossy dial, no-date configuration, and gilt printing in near-perfect condition. Comes with original bracelet and service records.',
    category: 'Watches', startingBid: 12000, currentBid: 15800,
    startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'),
    status: 'live', totalBids: 9, createdBy: adminId,
  },
  {
    title: 'Patek Philippe Calatrava 1960',
    description: 'Ultra-rare Patek Philippe Calatrava reference 2526 with original enamel dial. One of fewer than 200 known examples. Accompanied by original box and certificate of authenticity.',
    category: 'Watches', startingBid: 45000, currentBid: 62000,
    startDate: new Date('2026-01-15'), endDate: new Date('2026-09-30'),
    status: 'live', totalBids: 14, createdBy: adminId,
  },
  {
    title: 'Omega Speedmaster Apollo 11',
    description: 'Limited edition Omega Speedmaster commemorating the 50th anniversary of the Apollo 11 moon landing. Numbered edition 0847/1969. Unworn, full set with moonphase complication.',
    category: 'Watches', startingBid: 8000, currentBid: 9200,
    startDate: new Date('2026-03-01'), endDate: new Date('2026-06-30'),
    status: 'live', totalBids: 6, createdBy: adminId,
  },
  {
    title: 'Audemars Piguet Royal Oak 1972',
    description: 'First generation Royal Oak designed by Gerald Genta. Reference 5402 in stainless steel with the iconic integrated bracelet. Serviced 2024. Original documentation included.',
    category: 'Watches', startingBid: 30000, currentBid: 30000,
    startDate: new Date('2026-05-01'), endDate: new Date('2026-11-30'),
    status: 'upcoming', totalBids: 0, createdBy: adminId,
  },

  // ── Art ──
  {
    title: 'Abstract Oil — "Lagos at Dusk"',
    description: 'Large-format abstract oil on canvas by emerging Nigerian artist Chidi Okafor. 120x180cm. Vivid sunset palette capturing the energy of Lagos harbour. Exhibited at Tafeta Gallery, London 2024.',
    category: 'Art', startingBid: 3500, currentBid: 5100,
    startDate: new Date('2026-01-10'), endDate: new Date('2026-07-31'),
    status: 'live', totalBids: 7, createdBy: adminId,
  },
  {
    title: 'Bronze Sculpture — "The Negotiator"',
    description: 'Limited edition bronze sculpture by Tanzanian sculptor Amara Diallo. Edition 3/12. Height 45cm on marble plinth. Depicts two figures in dialogue — a commentary on modern diplomacy.',
    category: 'Art', startingBid: 6000, currentBid: 7400,
    startDate: new Date('2026-02-01'), endDate: new Date('2026-08-31'),
    status: 'live', totalBids: 5, createdBy: adminId,
  },
  {
    title: 'Watercolour Series — "Serengeti Seasons"',
    description: 'Set of four framed watercolours depicting the Serengeti across four seasons. Each 50x70cm, archival framing. Artist: Miriam Osei. Certificate of authenticity and provenance included.',
    category: 'Art', startingBid: 2000, currentBid: 2000,
    startDate: new Date('2026-06-01'), endDate: new Date('2026-12-31'),
    status: 'upcoming', totalBids: 0, createdBy: adminId,
  },
  {
    title: 'Digital Print — "Afrofuturism #7"',
    description: 'Archival pigment print on aluminium, edition 1/10. 90x90cm. Part of the celebrated Afrofuturism series by Dakar-based artist Ibrahima Fall. Acquired from Whatiftheworld Gallery, Cape Town.',
    category: 'Art', startingBid: 1800, currentBid: 2600,
    startDate: new Date('2025-06-01'), endDate: new Date('2025-12-31'),
    status: 'ended', totalBids: 8, createdBy: adminId,
  },

  // ── Electronics ──
  {
    title: 'Apple Mac Pro 2023 — M2 Ultra',
    description: 'Apple Mac Pro with M2 Ultra chip, 192GB unified memory, 8TB SSD. Configured with Afterburner card. Used for 6 months in a professional video production studio. AppleCare+ until 2027.',
    category: 'Electronics', startingBid: 7000, currentBid: 8500,
    startDate: new Date('2026-02-15'), endDate: new Date('2026-05-31'),
    status: 'live', totalBids: 11, createdBy: adminId,
  },
  {
    title: 'Sony A7R V Mirrorless Camera Kit',
    description: 'Sony Alpha A7R V body with 61MP full-frame sensor. Bundle includes: FE 24-70mm f/2.8 GM II, FE 85mm f/1.4 GM, three batteries, dual charger, and Pelican hard case. Under 3000 actuations.',
    category: 'Electronics', startingBid: 4500, currentBid: 5300,
    startDate: new Date('2026-01-20'), endDate: new Date('2026-06-30'),
    status: 'live', totalBids: 8, createdBy: adminId,
  },
  {
    title: 'Vintage IBM ThinkPad 701C "Butterfly"',
    description: 'Iconic IBM ThinkPad 701C with the legendary butterfly keyboard mechanism. Fully functional, serviced 2023. A piece of computing history — voted most innovative product of the century by Time magazine.',
    category: 'Electronics', startingBid: 1200, currentBid: 1900,
    startDate: new Date('2026-03-01'), endDate: new Date('2026-09-30'),
    status: 'live', totalBids: 13, createdBy: adminId,
  },
  {
    title: 'DJI Inspire 3 Drone — Full Kit',
    description: 'Professional DJI Inspire 3 cinema drone. Includes: 3x batteries, dual remote system, Zenmuse X9-8K Air camera, ND filter set, carrying case, and spare propellers. 12 flight hours logged.',
    category: 'Electronics', startingBid: 9000, currentBid: 9000,
    startDate: new Date('2026-05-15'), endDate: new Date('2026-11-15'),
    status: 'upcoming', totalBids: 0, createdBy: adminId,
  },

  // ── Jewelry ──
  {
    title: 'Victorian Diamond Brooch — 3.2ct',
    description: 'Exceptional Victorian-era diamond brooch in silver-topped gold setting. Central old-mine cut diamond of 3.2ct, surrounded by 28 rose-cut diamonds totalling 1.8ct. Accompanied by GIA certificate.',
    category: 'Jewelry', startingBid: 18000, currentBid: 23500,
    startDate: new Date('2026-01-05'), endDate: new Date('2026-07-05'),
    status: 'live', totalBids: 10, createdBy: adminId,
  },
  {
    title: 'Emerald & Gold Necklace — Art Deco',
    description: 'Art Deco necklace in 18k yellow gold set with 7 Colombian emeralds totalling 9.4ct and 142 diamonds totalling 3.1ct. Signed by Cartier Paris, circa 1925. Museum-quality piece with full provenance.',
    category: 'Jewelry', startingBid: 55000, currentBid: 71000,
    startDate: new Date('2026-02-01'), endDate: new Date('2026-10-31'),
    status: 'live', totalBids: 16, createdBy: adminId,
  },
  {
    title: 'Pearl Strand — South Sea 18mm',
    description: 'Exceptional South Sea pearl necklace, 47 perfectly matched white pearls averaging 18mm. 18k white gold clasp set with 0.85ct brilliant-cut diamond. Accompanied by GIA report and original box.',
    category: 'Jewelry', startingBid: 12000, currentBid: 14200,
    startDate: new Date('2025-09-01'), endDate: new Date('2025-12-31'),
    status: 'ended', totalBids: 7, createdBy: adminId,
  },

  // ── Vehicles ──
  {
    title: '1965 Ford Mustang Fastback',
    description: 'Numbers-matching 1965 Ford Mustang Fastback in Highland Green. 289ci V8, 4-speed manual, factory A/C delete. Fully restored to concours condition in 2022. 47,200 original miles. AACA certified.',
    category: 'Vehicles', startingBid: 65000, currentBid: 82000,
    startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'),
    status: 'live', totalBids: 12, createdBy: adminId,
  },
  {
    title: '1972 Lamborghini Miura SV',
    description: 'One of only 150 Miura SVs produced. V12 engine recently rebuilt by Lamborghini Polo Storico. Rosso Corsa over tan leather. Documented history from new. Last sold at RM Sotheby\'s 2019 for $2.1M.',
    category: 'Vehicles', startingBid: 1800000, currentBid: 2100000,
    startDate: new Date('2026-03-01'), endDate: new Date('2026-09-01'),
    status: 'live', totalBids: 4, createdBy: adminId,
  },
  {
    title: '2021 Porsche 911 GT3 Touring',
    description: 'Porsche 911 992 GT3 with Touring package in Shark Blue. 6-speed manual, no wing, full PPF and ceramic coating. 4,200 miles. Every factory option including front axle lift and chrono package.',
    category: 'Vehicles', startingBid: 185000, currentBid: 185000,
    startDate: new Date('2026-04-01'), endDate: new Date('2026-10-01'),
    status: 'upcoming', totalBids: 0, createdBy: adminId,
  },

  // ── Other ──
  {
    title: 'First Edition — "Things Fall Apart" 1958',
    description: 'First edition, first printing of Chinua Achebe\'s Things Fall Apart (Heinemann, 1958). Original cloth binding, dust jacket with minor edge wear. One of the rarest post-colonial literary artifacts in private hands.',
    category: 'Other', startingBid: 8000, currentBid: 11200,
    startDate: new Date('2026-01-15'), endDate: new Date('2026-08-15'),
    status: 'live', totalBids: 9, createdBy: adminId,
  },
  {
    title: 'Stradivarius Violin — "The Nachez" 1707',
    description: 'Authenticated Antonio Stradivari violin from 1707, known as "The Nachez". Recently restored by luthier workshops in Cremona. Accompanied by two contemporary bows and a custom flight case.',
    category: 'Other', startingBid: 900000, currentBid: 1250000,
    startDate: new Date('2026-02-01'), endDate: new Date('2026-11-30'),
    status: 'live', totalBids: 6, createdBy: adminId,
  },
  {
    title: 'Signed Ali vs Foreman Fight Poster 1974',
    description: 'Original promotional poster from the Rumble in the Jungle, Kinshasa 1974. Signed by both Muhammad Ali and George Foreman. JSA certified. Framed in UV-protective museum glass. One of 3 known signed examples.',
    category: 'Other', startingBid: 25000, currentBid: 38000,
    startDate: new Date('2025-07-01'), endDate: new Date('2025-12-31'),
    status: 'ended', totalBids: 15, createdBy: adminId,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    // Clear existing data
    await User.deleteMany({});
    await Auction.deleteMany({});
    await Bid.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    const admin  = createdUsers.find(u => u.role === 'admin');
    const buyers = createdUsers.filter(u => u.role === 'buyer');
    console.log(`Created ${createdUsers.length} users`);

    // Create auctions
    const auctions = await Auction.create(auctionTemplates(admin._id));
    console.log(`Created ${auctions.length} auctions`);

    // Create realistic bids for live/ended auctions
    const bidDocs = [];
    for (const auction of auctions) {
      if (auction.totalBids === 0) continue;

      let amount = auction.startingBid;
      const increment = Math.floor((auction.currentBid - auction.startingBid) / Math.max(auction.totalBids, 1));

      for (let i = 0; i < auction.totalBids; i++) {
        const bidder = buyers[i % buyers.length];
        amount += increment + Math.floor(Math.random() * 200);
        bidDocs.push({
          auction: auction._id,
          bidder:  bidder._id,
          amount:  Math.min(amount, auction.currentBid),
          status:  i === auction.totalBids - 1 ? 'active' : 'outbid',
          createdAt: new Date(Date.now() - (auction.totalBids - i) * 3600000),
        });
      }

      // Set highest bidder
      const lastBidder = buyers[(auction.totalBids - 1) % buyers.length];
      await Auction.findByIdAndUpdate(auction._id, { highestBidder: lastBidder._id });
    }

    await Bid.create(bidDocs);
    console.log(`Created ${bidDocs.length} bids`);

    console.log('\n✅ Seed complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin:   admin@oams.com / Admin@1234');
    console.log('  Buyers:  james@test.com / 123456');
    console.log('           amina@test.com / 123456');
    console.log('           denis@test.com / 123456');
    console.log('           sofia@test.com / 123456');
    console.log('           luca@test.com  / 123456');
    console.log('           yuki@test.com  / 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit();
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();