/**
 * roadmaps.js — static milestone data for each degree key.
 * Each milestone: { label, t (0→1 curve position), color (hex), subtext }
 * This is seeded into MongoDB (Roadmap collection) on first request.
 */

const ROADMAPS = {
  'B.Com': [
    { label: '🎓 B.Com Enrolled',      t: 0.02, color: '#a78bfa', subtext: 'Your Journey Begins' },
    { label: '📚 Accountancy 101',      t: 0.14, color: '#818cf8', subtext: 'Debits, Credits & Ledgers' },
    { label: '💼 First Internship',     t: 0.27, color: '#60a5fa', subtext: 'Gain Real Experience' },
    { label: '📊 Junior Accountant',    t: 0.40, color: '#34d399', subtext: '₹4–6 LPA Avg Salary' },
    { label: '🏦 GST Certification',    t: 0.53, color: '#f472b6', subtext: 'Indirect Tax Mastery' },
    { label: '📈 CFA Level 1',          t: 0.66, color: '#fb923c', subtext: 'Global Finance Edge' },
    { label: '🎓 MBA Finance',          t: 0.79, color: '#c084fc', subtext: 'IIM / Top B-School' },
    { label: '👑 CFO / Director',       t: 0.94, color: '#ffd700', subtext: '₹40–80 LPA+' },
  ],

  'BBA': [
    { label: '🎓 BBA Enrolled',         t: 0.02, color: '#34d399', subtext: 'Business Foundations' },
    { label: '📋 Marketing Basics',     t: 0.14, color: '#6ee7b7', subtext: '4Ps, STP & Branding' },
    { label: '💼 Sales Internship',     t: 0.27, color: '#fbbf24', subtext: 'Client-Facing Role' },
    { label: '📊 Brand Executive',      t: 0.40, color: '#f59e0b', subtext: '₹3–5 LPA Entry' },
    { label: '🏢 Product Manager',      t: 0.53, color: '#60a5fa', subtext: 'Agile & Roadmapping' },
    { label: '🎓 MBA / PGDM',           t: 0.66, color: '#a78bfa', subtext: 'Top B-School Track' },
    { label: '🌐 Business Director',    t: 0.79, color: '#f472b6', subtext: '₹20–50 LPA' },
    { label: '👑 CEO / Entrepreneur',   t: 0.94, color: '#ffd700', subtext: 'Build Your Own Empire' },
  ],

  'B.Tech': [
    { label: '🎓 B.Tech Enrolled',      t: 0.02, color: '#60a5fa', subtext: 'CS / ECE / Mech…' },
    { label: '📐 Data Structures',      t: 0.14, color: '#38bdf8', subtext: 'Algorithms & Complexity' },
    { label: '💻 First Hackathon',      t: 0.27, color: '#818cf8', subtext: 'Build, Ship & Win' },
    { label: '🏢 SDE Internship',       t: 0.40, color: '#34d399', subtext: 'FAANG / Startups' },
    { label: '⚙️  Full-Stack Dev',      t: 0.53, color: '#a78bfa', subtext: '₹8–18 LPA' },
    { label: '☁️  Cloud / DevOps',      t: 0.66, color: '#f59e0b', subtext: 'AWS / GCP Certified' },
    { label: '🧠 Senior Engineer',      t: 0.79, color: '#f472b6', subtext: '₹25–55 LPA' },
    { label: '👑 CTO / Tech Lead',      t: 0.94, color: '#ffd700', subtext: 'Lead the Architecture' },
  ],

  'BSc': [
    { label: '🎓 BSc Enrolled',         t: 0.02, color: '#6ee7b7', subtext: 'Physics / Chem / Math' },
    { label: '🔬 Lab Research I',       t: 0.14, color: '#34d399', subtext: 'Core Scientific Method' },
    { label: '📊 Statistics & R',       t: 0.27, color: '#60a5fa', subtext: 'Data Analysis Skills' },
    { label: '🏫 Research Internship',  t: 0.40, color: '#818cf8', subtext: 'IITs / Research Labs' },
    { label: '🎓 MSc / MTech',          t: 0.53, color: '#c084fc', subtext: 'Specialise Deeper' },
    { label: '📡 Data Scientist',       t: 0.66, color: '#fb923c', subtext: '₹10–22 LPA' },
    { label: '🧪 Senior Researcher',    t: 0.79, color: '#f472b6', subtext: 'Publications & Patents' },
    { label: '👑 Professor / Scientist',t: 0.94, color: '#ffd700', subtext: 'National / Global Impact' },
  ],

  'BA': [
    { label: '🎓 BA Enrolled',          t: 0.02, color: '#f472b6', subtext: 'Arts / Humanities Begin' },
    { label: '✍️  Creative Writing',    t: 0.14, color: '#e879f9', subtext: 'Essays, Fiction & Poetry' },
    { label: '🗣️  Debate & Comms',      t: 0.27, color: '#c084fc', subtext: 'Public Speaking Edge' },
    { label: '📰 Media Internship',     t: 0.40, color: '#a78bfa', subtext: 'Journalism / PR' },
    { label: '🎬 Content Creator',      t: 0.53, color: '#818cf8', subtext: '₹4–10 LPA' },
    { label: '🏛️  Civil Services',      t: 0.66, color: '#fb923c', subtext: 'UPSC IAS / IPS Track' },
    { label: '🎓 MA / LLB',            t: 0.79, color: '#fbbf24', subtext: 'Postgrad Specialisation' },
    { label: '👑 IAS / Author / MP',    t: 0.94, color: '#ffd700', subtext: 'Public Leadership' },
  ],

  'MBBS': [
    { label: '🩺 MBBS Enrolled',        t: 0.02, color: '#f87171', subtext: 'NEET Qualifier!' },
    { label: '🦴 Anatomy Year 1',       t: 0.14, color: '#fb923c', subtext: 'Foundation of Medicine' },
    { label: '🏥 Clinical Rotations',   t: 0.27, color: '#fbbf24', subtext: 'Real Ward Experience' },
    { label: '💊 Internship (1 yr)',    t: 0.40, color: '#34d399', subtext: 'All Departments' },
    { label: '🩻 Residency / PG',       t: 0.53, color: '#60a5fa', subtext: 'MD / MS Specialisation' },
    { label: '🔬 Super-Speciality',     t: 0.66, color: '#818cf8', subtext: 'DM / M.Ch' },
    { label: '🏨 Consultant Doctor',    t: 0.79, color: '#c084fc', subtext: '₹20–80 LPA' },
    { label: '👑 HOD / Surgeon',        t: 0.94, color: '#ffd700', subtext: 'Medical Excellence' },
  ],

  'BFA': [
    { label: '🎨 BFA Enrolled',         t: 0.02, color: '#e879f9', subtext: 'Fine Arts Begin' },
    { label: '🖌️  Drawing Fundamentals',t: 0.14, color: '#f472b6', subtext: 'Form, Light & Perspective' },
    { label: '🖼️  First Exhibition',    t: 0.27, color: '#c084fc', subtext: 'Showcase Your Work' },
    { label: '💻 Digital Art / UI',     t: 0.40, color: '#818cf8', subtext: 'Figma & Adobe Suite' },
    { label: '🎬 Motion Graphics',      t: 0.53, color: '#60a5fa', subtext: 'After Effects & Blender' },
    { label: '🏢 Art Director',         t: 0.66, color: '#34d399', subtext: '₹8–18 LPA' },
    { label: '🌐 Creative Agency',      t: 0.79, color: '#f59e0b', subtext: 'Lead Visual Identity' },
    { label: '👑 Creative Director',    t: 0.94, color: '#ffd700', subtext: 'Global Creative Vision' },
  ],

  'LLB': [
    { label: '⚖️  LLB Enrolled',        t: 0.02, color: '#f59e0b', subtext: 'Law School Begins' },
    { label: '📜 Constitutional Law',   t: 0.14, color: '#fbbf24', subtext: 'Rights & Governance' },
    { label: '🏛️  Moot Court',          t: 0.27, color: '#fb923c', subtext: 'Argue, Win, Repeat' },
    { label: '⚖️  Junior Advocate',     t: 0.40, color: '#f472b6', subtext: 'District / High Court' },
    { label: '🏢 Corporate Lawyer',     t: 0.53, color: '#a78bfa', subtext: '₹8–20 LPA' },
    { label: '🎓 LLM Specialisation',   t: 0.66, color: '#818cf8', subtext: 'IPR / Criminal / Tax' },
    { label: '🏛️  Senior Advocate',     t: 0.79, color: '#60a5fa', subtext: 'Supreme Court Track' },
    { label: '👑 Judge / Legal Eagle',  t: 0.94, color: '#ffd700', subtext: 'Highest Legal Office' },
  ],

  'B.Arch': [
    { label: '🏗️  B.Arch Enrolled',     t: 0.02, color: '#34d399', subtext: 'JEE / NATA Qualifier' },
    { label: '📐 Design Studio I',      t: 0.14, color: '#6ee7b7', subtext: 'Sketching & CAD' },
    { label: '🏙️  Urban Planning',      t: 0.27, color: '#60a5fa', subtext: 'Cities of Tomorrow' },
    { label: '🏢 Architecture Intern',  t: 0.40, color: '#818cf8', subtext: 'Real Project Exposure' },
    { label: '🖥️  BIM & Revit',         t: 0.53, color: '#a78bfa', subtext: 'Industry Software' },
    { label: '🌿 Sustainable Design',   t: 0.66, color: '#c084fc', subtext: 'Green Buildings' },
    { label: '🏗️  Project Architect',   t: 0.79, color: '#f59e0b', subtext: '₹10–25 LPA' },
    { label: '👑 Principal Architect',  t: 0.94, color: '#ffd700', subtext: 'Iconic Structures' },
  ],

  'BSc Agriculture': [
    { label: '🌱 BSc Agri Enrolled',    t: 0.02, color: '#4ade80', subtext: 'Soil, Seeds & Systems' },
    { label: '🔬 Soil Science',         t: 0.14, color: '#22c55e', subtext: 'NPK & Microbiology' },
    { label: '🌾 Farm Internship',      t: 0.27, color: '#86efac', subtext: 'Real Field Work' },
    { label: '📊 Agri Analytics',       t: 0.40, color: '#34d399', subtext: 'Precision Farming' },
    { label: '🏢 Agri Company',         t: 0.53, color: '#60a5fa', subtext: 'IFFCO / Corteva' },
    { label: '🎓 MSc Agri / MBA',       t: 0.66, color: '#818cf8', subtext: 'Postgrad Specialise' },
    { label: '🌍 Agri Scientist',       t: 0.79, color: '#f59e0b', subtext: 'ICAR / Research Labs' },
    { label: '👑 Chief Agri Officer',   t: 0.94, color: '#ffd700', subtext: 'Feed the Nation' },
  ],
};

module.exports = ROADMAPS;
