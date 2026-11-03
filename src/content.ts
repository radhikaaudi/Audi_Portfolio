// ─────────────────────────────────────────────────────────────
//  All portfolio copy lives here. Each cassette = one chapter.
//  Wrap words in **double stars** to highlight them on screen.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: "Radhika Audichya",
  firstName: "Radhika",
  lastName: "Audichya",
  role: "Software Development Engineer",
  company: "Hero Vired",
  education: "B.Tech CCE · LNMIIT Jaipur · 2022–26",
  // Live captions on the idle TV "dictate" this word by word (a nod to Wispr Flow).
  dictation: "Hi, I'm Radhika. I build software, I play games, and I always have a song on. Pick a tape.",
  email: "radhikaaudi11@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/radhikaaudi" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/radhika-audichya-813295255" },
    { label: "LeetCode", href: "https://leetcode.com/u/radhikaaudi11/" },
    { label: "Resume", href: "/Radhika_Audichya_Resume.pdf" },
  ],
};

export const photos = {
  // Oil-paint versions (Kuwahara filter) used across the illustrated design.
  paintedNight: { src: "/images/radhika-night-painted.jpg", alt: "Painted portrait of Radhika smiling at night under string lights" },
  paintedNeon: { src: "/images/radhika-neon-painted.jpg", alt: "Painted portrait of Radhika under a glowing neon sign" },
  // Small versions for little frames (film reel), so the page loads less.
  paintedNightSm: { src: "/images/radhika-night-painted-sm.jpg", alt: "Painted portrait of Radhika smiling at night" },
  paintedNeonSm: { src: "/images/radhika-neon-painted-sm.jpg", alt: "Painted portrait of Radhika under a neon sign" },
};


export type Project = {
  title: string;
  tagline: string;
  points: string[];
  stack: string[];
  event?: string; // hackathon / where it was built
  repo?: string; // GitHub
  live?: string; // deployed app
  demo?: string; // demo video
};

type Base = {
  id: string;
  side: "A" | "B";
  label: string; // handwritten on the cassette
  runtime: string;
  shell: string; // cassette body colour
  color: string; // label stripe + accent on screen
  kicker: string;
  title: string;
  titleItalic: string;
  body: string[];
};

export type Tape =
  | (Base & { kind: "story"; facts?: { label: string; value: string }[]; points?: string[] })
  | (Base & { kind: "projects"; projects: Project[]; skills: { group: string; items: string[] }[] })
  | (Base & { kind: "about"; photo: { src: string; alt: string }; loves: { label: string; value: string }[] })
  | (Base & { kind: "game" })
  | (Base & { kind: "contact" });

export const tapes: Tape[] = [
  {
    id: "hello",
    kind: "about",
    side: "A",
    label: "hi, it's me",
    runtime: "C-46",
    shell: "#f4f0e6",
    color: "#d93a1f",
    kicker: "Tape 01 · Side A",
    title: "Hello,",
    titleItalic: "I'm Radhika",
    photo: photos.paintedNeon,
    body: [
      "I'm a software engineer who loves turning messy, real-world processes into **products that just work**: onboarding flows, payouts and voice-first AI.",
      "Away from the keyboard you'll find me **playing games** and **living inside my playlists**. That's why this whole site is a mixtape.",
      "TODO: where it all began. What first pulled you towards computers?",
    ],
    loves: [
      { label: "On repeat", value: "TODO: your current favourite song" },
      { label: "Playing", value: "TODO: the game you're hooked on" },
      { label: "Builds with", value: "TypeScript, Next.js, Supabase" },
    ],
  },
  {
    id: "lnmiit",
    kind: "story",
    side: "A",
    label: "LNMIIT days",
    runtime: "C-90",
    shell: "#7ea9d6",
    color: "#2d4fb5",
    kicker: "Tape 02 · LNMIIT, Jaipur · 2022–26",
    title: "Signals, meet",
    titleItalic: "software",
    body: [
      "Four years of **Communication and Computer Engineering** at the LNM Institute of Information Technology, where I learned how information travels and what we can build on top of it.",
      "Campus was never just classes. I was happiest in a room full of people building things at 3 a.m.",
    ],
    points: [
      "**Lead Organizer of LNMHACKS 7.0**, after contributing to LNMHacks 6.0: running the hackathon I used to compete in.",
      "**Core member of TEDx LNMIIT**, leading speaker outreach.",
      "Advanced to **Phase 2 of Myntra HackerRamp 2024**.",
    ],
    facts: [
      { label: "Degree", value: "B.Tech, CCE" },
      { label: "Years", value: "2022 – 2026" },
      { label: "Campus", value: "Jaipur, Rajasthan" },
    ],
  },
  {
    id: "celebal",
    kind: "story",
    side: "A",
    label: "summer '25",
    runtime: "C-30",
    shell: "#c9d6c4",
    color: "#4d7a5c",
    kicker: "Tape 03 · Celebal Technologies · Jun–Aug 2025",
    title: "The first",
    titleItalic: "real job",
    body: [
      "My first taste of shipping production code, as a **Frontend Development Trainee**, working remotely on scalable React applications.",
    ],
    points: [
      "Built responsive, component-driven React apps with API integrations, **cutting page load time by 40%**.",
      "Re-architected state management with modern React patterns, **reducing unnecessary re-renders by 35%**.",
    ],
    facts: [
      { label: "Role", value: "Frontend Dev Trainee" },
      { label: "Mode", value: "Remote" },
      { label: "Stack", value: "React.js" },
    ],
  },
  {
    id: "herovired",
    kind: "story",
    side: "A",
    label: "now playing",
    runtime: "C-90",
    shell: "#22242e",
    color: "#d93a1f",
    kicker: "Tape 04 · Hero Vired · Jan 2026 – now",
    title: "Shipping for",
    titleItalic: "real",
    body: [
      "As a **Software Development Engineer 1**, I architect a multi-tenant B2B2C SaaS platform used by **500+ channel partners** to discover, compare and enrol students across **25+ universities** and **200+ programs**.",
    ],
    points: [
      "Automated a **5-step KYC pipeline** (PAN, Aadhaar eKYC via DigiLocker, GST/UDYAM/CIN, bank verification, eSign agreements), **cutting onboarding time by 40%** for 200+ partners.",
      "Built **JWT auth with RBAC**, httpOnly sessions, silent token refresh and handshake-based **SSO** across two platforms, with granular permissions over 6+ modules.",
      "Added **AI legal-document extraction** (Groq) for Partnership Deeds, LLP Agreements and Trust Deeds, plus a notification worker on **Supabase Realtime**.",
      "Built a multi-university **commission and loan-earnings calculator** powering a payouts suite: rate cards, invoicing and student ledgers.",
      "Use **agentic AI workflows** for refactoring, migrations and debugging across a 100+ file TypeScript monorepo.",
    ],
    facts: [
      { label: "Stack", value: "Next.js · Fastify · Supabase" },
      { label: "Partners", value: "500+" },
      { label: "Onboarding", value: "40% faster" },
    ],
  },
  {
    id: "mixtape",
    kind: "projects",
    side: "B",
    label: "mixtape",
    runtime: "C-90",
    shell: "#e8c547",
    color: "#2d4fb5",
    kicker: "Tape 05 · The mixtape",
    title: "Things I've",
    titleItalic: "built",
    body: ["Straight from my GitHub: hackathon builds, AI agents and side projects, plus the instruments I play them on."],
    projects: [
      {
        title: "AuDict",
        tagline: "A hands-free photo editor: just say your edits.",
        event: "Wispr Flow × Hacker House Goa",
        points: [
          "Speak a whole sentence of edits (\"warmer, add grain, crop square\") and watch them happen. **No sliders, no mouse.**",
          "**Every line was written by dictating prompts with Wispr Flow** into Claude Code, never typed by hand.",
          "Understands any phrasing with **Claude Haiku 4.5**, with a large offline vocabulary as fallback. Bonus: SpokenCanvas, voice-painted generative art.",
        ],
        stack: ["JavaScript", "Canvas 2D", "Web Speech API", "Claude", "Wispr Flow"],
        repo: "https://github.com/radhikaaudi/AuDict",
      },
      {
        title: "Veriqo",
        tagline: "Verify any used car in 60 seconds, before you pay anyone.",
        event: "AI Builder Cup 2026",
        points: [
          "Upload car photos + a registration number and get an **evidence-backed report**: Gemini visual condition analysis + an official **VAHAN RC check**.",
          "Every finding is tagged with its **provenance** (observed, record, inferred, not checked) and feeds a transparent, deterministic **risk score**.",
          "Deployed on **Cloud Run** with Firebase and Firestore.",
        ],
        stack: ["Python", "TypeScript", "Gemini", "Firebase", "Cloud Run", "Docker"],
        repo: "https://github.com/radhikaaudi/Veriqo",
        live: "https://veriqo-api-920194228751.us-central1.run.app",
        demo: "https://youtu.be/B015EyHjXNM",
      },
      {
        title: "Redpen",
        tagline: "Grades a stack of handwritten answer sheets in minutes, and shows its working.",
        event: "Nebius × NVIDIA Global AI Hackathon",
        points: [
          "Reads student handwriting and marks every rubric point **with the student's own words as evidence**.",
          "Flags anything it's unsure about and tells the teacher **what the whole class misunderstood**.",
          "Runs on **NVIDIA Nemotron** via Nebius Token Factory. The teacher stays in charge of every mark.",
        ],
        stack: ["Python", "NVIDIA Nemotron", "Nebius", "Docker"],
        repo: "https://github.com/radhikaaudi/RedPen",
      },
      {
        title: "HaqSetu",
        tagline: "हक़ सेतु: from paper you can't read to the rights you're owed.",
        points: [
          "Turns **a spoken sentence and a photographed document**, in the user's own language, into a ready-to-file **Claim Dossier**.",
          "Decodes official papers, ranks the **welfare benefits** someone qualifies for (citing the exact rule) and fills the official form.",
          "LLM at the edges, a **deterministic rules engine** at the core. Voice-first React app in Hindi, Marathi and English.",
        ],
        stack: ["TypeScript", "React", "Node.js", "OpenAI"],
        repo: "https://github.com/radhikaaudi/HaqSetu",
      },
      {
        title: "Cadence",
        tagline: "Peace of mind for a parent living alone, with no camera inside.",
        event: "Amazon Build, Ship, Shape Hackathon · Ring track",
        points: [
          "Learns a household's normal **doorway rhythm** from Ring event metadata only (no faces, no indoor camera).",
          "Tells a caregiver, in plain language and with explicit uncertainty, when the day **deviates from routine**.",
          "Signed-webhook ingress, an accessible live dashboard with read-aloud, and **Amazon Bedrock** briefings.",
        ],
        stack: ["TypeScript", "React", "Vite", "Amazon Bedrock", "Ring"],
        repo: "https://github.com/radhikaaudi/Cadence",
      },
      {
        title: "DUE45",
        tagline: "An AI agent that gets small Indian businesses paid, using a law almost nobody uses.",
        points: [
          "Uses the **MSMED Act** and **Section 43B(h)** to recover overdue invoices plus statutory interest, without costing the client.",
          "Drafts polite, correctly-worded letters that turn the buyer's own finance team into an ally.",
          "Gemini agents with a **deterministic fallback for every call**, so a rate limit can't take down a demo.",
        ],
        stack: ["Next.js", "TypeScript", "Tailwind", "Gemini"],
        repo: "https://github.com/radhikaaudi/Buidl",
      },
      {
        title: "FoodBridge",
        tagline: "An autonomous agent that rescues surplus food before it spoils.",
        event: "AWS Agents for Humans Hackathon",
        points: [
          "Forecasts surplus, judges food safety, matches donations to the best nearby shelter and **dispatches a driver**, all on its own.",
          "Only pings a human coordinator for real decisions; tracks **meals delivered, money saved and CO₂ prevented**.",
        ],
        stack: ["Python", "Strands Agents", "Amazon Bedrock AgentCore"],
        repo: "https://github.com/radhikaaudi/FoodConnect",
      },
      {
        title: "LeakGuard",
        tagline: "An agent that catches revenue leakage and contract breaches.",
        points: [
          "Reads contracts, **reconciles them against real billing and usage** in Snowflake, and finds under-billing.",
          "Explains every gap with evidence, then **writes a recovery record and drafts a correction memo**.",
        ],
        stack: ["Python", "Snowflake Cortex", "SQL"],
        repo: "https://github.com/radhikaaudi/LeakGuard",
      },
      {
        title: "DefAttack",
        tagline: "An agentic fraud investigator: a prosecutor and a defender argue every alert.",
        event: "TigerGraph · Hacker House Goa 2026",
        points: [
          "Investigates alerts over a **transaction graph** and closed cases to decide the fraud type, its reach and the next best action.",
          "Auditable **likelihood-ratio updates** from prosecutor and defender passes, and it knows when to stop.",
        ],
        stack: ["Python", "TigerGraph"],
        repo: "https://github.com/radhikaaudi/Tribunal",
      },
      {
        title: "AcePrep Interview",
        tagline: "Practice interviews out loud with a voice AI interviewer.",
        points: [
          "Real-time voice interviews via **Vapi**, with speech-to-text and spoken replies.",
          "**OpenAI** generates role-specific questions, evaluates answers and gives feedback.",
          "Agentic follow-ups and live transcripts stored in **Firestore**.",
        ],
        stack: ["Next.js", "React", "Tailwind", "Firebase", "Vapi", "OpenAI"],
        repo: "https://github.com/radhikaaudi/AcePrep_Interview",
        live: "https://ace-prep-interview.vercel.app",
      },
      {
        title: "SafeShe",
        tagline: "A women's safety app with SOS, live GPS and safe routes.",
        points: [
          "One-tap **SOS** that broadcasts live location to trusted contacts.",
          "**K-Means clustering** on crime data to flag high-risk areas and suggest safer routes.",
          "Automated alert pipelines that **improved risk-analysis accuracy by 40%**.",
        ],
        stack: ["React Native", "Node.js", "Express", "MongoDB", "Firebase"],
        repo: "https://github.com/radhikaaudi/SheSafe",
        live: "https://she-safe-six.vercel.app",
      },
      {
        title: "Wishlist Bot & Style Box",
        tagline: "Outfit-building tools for Myntra, made with my LNMIIT team.",
        event: "Myntra HackerRamp · WeForShe 2024 (Phase 2)",
        points: [
          "**Wishlist Bot** mixes items in your wishlist into full outfits you can preview together.",
          "**Style Box** fills your cart with outfits from a simple preferences form and multi-image uploads.",
        ],
        stack: ["Python", "JavaScript", "HTML", "CSS"],
        repo: "https://github.com/radhikaaudi/Myntra_HackerRamp_WeForShe",
        live: "https://myntra-hackerramp-weforshe.onrender.com/",
      },
    ],
    skills: [
      { group: "Languages", items: ["C++", "JavaScript", "TypeScript", "Python", "Java"] },
      { group: "Frontend", items: ["React", "Next.js", "React Native", "HTML", "CSS"] },
      { group: "Backend", items: ["Node.js", "Express", "Fastify", "REST", "Supabase"] },
      { group: "Data", items: ["PostgreSQL", "MySQL", "MongoDB", "Firestore", "Snowflake", "TigerGraph"] },
      { group: "Cloud & AI", items: ["AWS", "Amazon Bedrock", "Google Cloud Run", "Docker", "OpenAI", "Claude", "Gemini", "Groq", "Agentic AI"] },
    ],
  },
  {
    id: "game",
    kind: "game",
    side: "B",
    label: "player 2",
    runtime: "∞",
    shell: "#d93a1f",
    color: "#e8c547",
    kicker: "Tape 06 · Insert coin",
    title: "Press",
    titleItalic: "start",
    body: ["I love games, so here's a tiny one. Catch the music notes with the tape and dodge the scribbles. 30 seconds, 3 lives."],
  },
  {
    id: "contact",
    kind: "contact",
    side: "B",
    label: "let's connect",
    runtime: "C-30",
    shell: "#b9c7d9",
    color: "#4d7a5c",
    kicker: "Tape 07 · Bonus track",
    title: "Let's",
    titleItalic: "connect",
    body: ["Got an idea, a role, or a song recommendation? Hit record."],
  },
];

// Entries on the liner-notes timeline (scroll section under the tape desk).
export type Frame = { tag: string; title: string; line: string; photo?: string };

export const reel: Frame[] = [
  { tag: "2022", title: "LNMIIT", line: "B.Tech in Communication & Computer Engineering begins." },
  { tag: "♪", title: "", line: "", photo: photos.paintedNightSm.src },
  { tag: "campus", title: "TEDx LNMIIT", line: "Core member, leading speaker outreach." },
  { tag: "campus", title: "LNMHacks 6.0", line: "Contributor, then I was hooked on hackathons." },
  { tag: "2024", title: "Myntra HackerRamp", line: "Advanced to Phase 2." },
  { tag: "▶", title: "", line: "", photo: photos.paintedNeonSm.src },
  { tag: "campus", title: "LNMHACKS 7.0", line: "Lead Organizer." },
  { tag: "build", title: "SafeShe", line: "SOS, live GPS and crime-aware safe routes." },
  { tag: "build", title: "AcePrep", line: "A voice AI interviewer." },
  { tag: "2025", title: "Celebal Technologies", line: "Frontend trainee, 40% faster page loads." },
  { tag: "♪", title: "", line: "", photo: photos.paintedNightSm.src },
  { tag: "2026", title: "Hero Vired", line: "SDE 1 on a SaaS platform for 500+ partners." },
  { tag: "2026", title: "Graduated", line: "Class of 2026, LNMIIT." },
  { tag: "next", title: "Your team?", line: "The next frame is unwritten." },
];

// ─────────────────────────────────────────────────────────────
//  Fav songs, shown on the "let's connect" tape as a Spotify shelf.
//  Just paste each song's Spotify link (Share → Copy Song Link).
//  Title / artist / cover are fetched from Spotify automatically;
//  fill them in by hand only if you want to override.
// ─────────────────────────────────────────────────────────────
export type Song = { spotify: string; title?: string; artist?: string; year?: string; cover?: string };

export const favSongs: Song[] = [
  { spotify: "https://open.spotify.com/track/6q4GmJDbiZ7viOqLHP76cs", title: "Rang Jo Lagyo", cover: "/images/covers/rang-jo-lagyo.jpg", artist: "Atif Aslam, Shreya Ghoshal", year: "2013" },
  { spotify: "https://open.spotify.com/track/0syOUYP5JefSP0DNi3hAX8", title: "Taaron Se", cover: "/images/covers/taaron-se.jpg", artist: "Arpit Bala", year: "2025" },
  { spotify: "", title: "Farak Nahi Padta", cover: "/images/covers/farak-nahi-padta-khoslaraghu.jpg", artist: "KhoslaRaghu", year: "2025" }, // TODO: paste exact Spotify track link to play it inline
  { spotify: "https://open.spotify.com/track/3WOo7mrrumxk4qfTbM9qPk", title: "Aap Ki Aankhon Mein Kuch", cover: "/images/covers/aap-ki-aankhon-mein-kuch.jpg", artist: "Kishore Kumar, Lata Mangeshkar", year: "1978" },
];

// The pinned note on the connect card.
export const connectNote =
  "if you made it all the way to this tape, we should probably talk. i'm always up for building something new, swapping song recs, or a long chat about games. say hi ♡";

// Background theme that plays while the "let's connect" tape is open.
// Uses the official YouTube upload (YouTube's embed lets us play just a section on loop).
// start / end are in seconds of the full song: 1:06 → 1:41.
export const connectTheme = {
  title: "Yeh Duniya",
  artist: "Curtain Blue",
  youtube: ["-A_r9MKHPLw", "SuqdFNp4xuc"], // official audio (Warner Music India), then a fallback upload
  start: 66, // 1:06
  end: 101, // 1:41
  volume: 40, // 0–100
};
