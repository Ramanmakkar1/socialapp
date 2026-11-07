export const NICHES = [
  { id: "coach", label: "Coach" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "restaurant", label: "Restaurant" },
  { id: "fitness", label: "Fitness" },
  { id: "beauty", label: "Beauty" },
  { id: "realestate", label: "Real estate" },
  { id: "creator", label: "Creator" },
  { id: "agency", label: "Agency" },
] as const;

export type NicheId = (typeof NICHES)[number]["id"];

export const FORMATS = ["reel", "carousel", "story", "post"] as const;
export type Format = (typeof FORMATS)[number];

export type Idea = {
  title: string;
  format: Format;
  hook: string;
  captionStarter: string;
};

export const POST_IDEAS: Record<NicheId, Idea[]> = {
  coach: [
    {
      title: "3 mistakes new clients make in week one",
      format: "carousel",
      hook: "If you just started working with a coach, this one is for you",
      captionStarter:
        "Most clients come in with the same three blind spots. Slide 2 is the one that stings the most. Save this for your first session.",
    },
    {
      title: "A day in my life as a coach",
      format: "reel",
      hook: "People think coaching is just coffee chats. It is not.",
      captionStarter:
        "Here is what a real coaching day looks like, from the first client call to the evening review.",
    },
    {
      title: "The question I ask every new client",
      format: "post",
      hook: "One question tells me more than a 90-minute discovery call",
      captionStarter:
        "It is not 'what are your goals?' Here is what I actually ask, and why it changes the whole engagement.",
    },
    {
      title: "Before and after: a client's 90-day plan",
      format: "carousel",
      hook: "Same person, 90 days apart. Here is what changed.",
      captionStarter:
        "With permission, here is the exact plan we built together. The system matters more than the motivation.",
    },
    {
      title: "Answer to a DM: is coaching worth it?",
      format: "story",
      hook: "You asked, so here is my honest answer",
      captionStarter:
        "Coaching is worth it when you are paying for accountability, not inspiration. Here is how to tell the difference.",
    },
    {
      title: "5 signs you are ready to hire a coach",
      format: "carousel",
      hook: "You do not need a crisis to need a coach",
      captionStarter:
        "If two of these five hit home, it is time. Number 4 surprises most people.",
    },
  ],
  ecommerce: [
    {
      title: "Packing an order in real time",
      format: "reel",
      hook: "You ordered at 9:02. Here is what happened next.",
      captionStarter:
        "From cart to doorstep in under 60 seconds of video. This is why we pack every order by hand.",
    },
    {
      title: "How we price our products (honestly)",
      format: "carousel",
      hook: "Everyone asks why it costs what it costs. Here is the math.",
      captionStarter:
        "Materials, labor, shipping, and the margin we need to keep the lights on. Slide by slide, no fluff.",
    },
    {
      title: "The product our customers repurchase most",
      format: "post",
      hook: "We looked at a year of orders. This one wins.",
      captionStarter:
        "Here is why this product keeps selling, and what customers tell us they love about it.",
    },
    {
      title: "Behind the scenes: how a new product is made",
      format: "reel",
      hook: "From sketch to shelf in 30 seconds",
      captionStarter:
        "Every product we launch starts as a napkin sketch. Here is the full journey.",
    },
    {
      title: "Customer photo of the week",
      format: "story",
      hook: "You tagged us. We are featuring you.",
      captionStarter:
        "This customer's photo made our whole week. Tag us in yours for a chance to be featured.",
    },
    {
      title: "3 ways to style our best-seller",
      format: "carousel",
      hook: "One product, three completely different looks",
      captionStarter:
        "Our best-seller does more than you think. Here are three ways our customers use it.",
    },
  ],
  restaurant: [
    {
      title: "Behind the pass: 15-second plating Reel",
      format: "reel",
      hook: "This is how your order leaves our kitchen",
      captionStarter:
        "Every plate that leaves the pass gets this treatment. Come watch it happen.",
    },
    {
      title: "The dish our regulars order every time",
      format: "post",
      hook: "Some guests order the same thing on every single visit",
      captionStarter:
        "Here is the dish that keeps them coming back, and the story behind how it ended up on the menu.",
    },
    {
      title: "What $20 gets you at our restaurant",
      format: "carousel",
      hook: "Budget challenge: one person, $20, full menu",
      captionStarter:
        "We built a complete meal for under $20. Here is exactly what you get, plate by plate.",
    },
    {
      title: "Meet the chef",
      format: "reel",
      hook: "The person who decides what you eat this week",
      captionStarter:
        "Our chef tastes every dish before it leaves the kitchen. Meet the person behind the menu.",
    },
    {
      title: "Tonight's special, 24 hours early",
      format: "story",
      hook: "You get the menu before anyone else",
      captionStarter:
        "Tomorrow's special is a surprise. Here is a hint, and the first guests to mention it get a dessert.",
    },
    {
      title: "How we source our ingredients",
      format: "carousel",
      hook: "Your plate starts at the farm, not the freezer",
      captionStarter:
        "We buy from local farms and fishers we know by name. Here is the supply chain behind your favorite dish.",
    },
  ],
  fitness: [
    {
      title: "3 exercises you are probably doing wrong",
      format: "reel",
      hook: "Number 2 is the one that is quietly hurting your form",
      captionStarter:
        "Small form fixes, big injury prevention. Watch the correction for each one.",
    },
    {
      title: "A full 20-minute home workout",
      format: "carousel",
      hook: "No gym, no equipment, no excuses",
      captionStarter:
        "Follow along slide by slide. Two rounds and you are done.",
    },
    {
      title: "What I eat in a day as a trainer",
      format: "reel",
      hook: "Clients ask for this every week. Here it is.",
      captionStarter:
        "Real food, no shakes required. This is what fueling training actually looks like.",
    },
    {
      title: "The progress check that changed my mindset",
      format: "post",
      hook: "It was not the scale. It was this.",
      captionStarter:
        "Progress is not always visible in the mirror. Here is what I track instead, and why it matters more.",
    },
    {
      title: "Form check: squat deep-dive",
      format: "story",
      hook: "Send us your squat and we will break it down",
      captionStarter:
        "Use the question sticker to send a clip. We will pick three to review in tomorrow's story.",
    },
    {
      title: "5 mobility moves for desk workers",
      format: "carousel",
      hook: "Your back will thank you in five minutes a day",
      captionStarter:
        "Five moves, one minute each. Do them at your desk between meetings.",
    },
  ],
  beauty: [
    {
      title: "5-minute morning routine, start to finish",
      format: "reel",
      hook: "The exact routine I do before work, every day",
      captionStarter:
        "No 20-step routine. Just the steps that actually matter, in the order that matters.",
    },
    {
      title: "Products I actually repurchase",
      format: "carousel",
      hook: "My shelf is full. These are the only ones I reorder",
      captionStarter:
        "After a year of testing, these are the products that earned a permanent spot.",
    },
    {
      title: "Before and after: a full glam in 30 minutes",
      format: "reel",
      hook: "Timed. No cuts. Watch the full transformation",
      captionStarter:
        "From bare face to event-ready in 30 minutes. The technique is in the transition.",
    },
    {
      title: "How to fix common makeup mistakes",
      format: "carousel",
      hook: "If your foundation looks cakey, start at slide 2",
      captionStarter:
        "Five fixes for the most common mistakes we see in the chair, with the exact technique for each.",
    },
    {
      title: "Client glow-up: the bridal trial",
      format: "post",
      hook: "She walked in nervous. Watch her walk out.",
      captionStarter:
        "Bridal trials are where the trust is built. Here is the full look we created together.",
    },
    {
      title: "What is in my makeup bag right now",
      format: "story",
      hook: "Tap to see every product, with links",
      captionStarter:
        "Everything I am using this month, in one story. Use the link sticker to grab your favorites.",
    },
  ],
  realestate: [
    {
      title: "3 things to check before you tour a home",
      format: "carousel",
      hook: "Agents do not always point these out. Check them yourself",
      captionStarter:
        "Three red flags you can spot in the first five minutes of any showing. Number 3 costs buyers the most.",
    },
    {
      title: "Walkthrough: a home that just hit the market",
      format: "reel",
      hook: "New on the market. Here is what it looks like inside",
      captionStarter:
        "A full walkthrough of the newest listing in our area. DM me for the address and showing times.",
    },
    {
      title: "What your home is actually worth",
      format: "post",
      hook: "The online estimate is not your number. Here is how we price",
      captionStarter:
        "We price homes on recent comparable sales, not algorithms. Here is the process, step by step.",
    },
    {
      title: "First-time buyer: your 5-step checklist",
      format: "carousel",
      hook: "The order matters. Most people do step 3 too early",
      captionStarter:
        "Pre-approval before house hunting, not after. Here is the exact sequence that keeps you from overpaying.",
    },
    {
      title: "Open house this weekend",
      format: "story",
      hook: "You do not need an appointment. Just show up",
      captionStarter:
        "We are hosting an open house this Saturday. Here is the time, the address, and what to expect.",
    },
    {
      title: "The neighborhood guide nobody asks for",
      format: "reel",
      hook: "Where to eat, what to avoid, and the best coffee",
      captionStarter:
        "Living here is the job perk. Here is the local guide I wish someone had given me.",
    },
  ],
  creator: [
    {
      title: "5 content ideas you can film in one afternoon",
      format: "carousel",
      hook: "Batch a week of content in 3 hours",
      captionStarter:
        "One location, one outfit, five posts. Here is the exact batch plan.",
    },
    {
      title: "The hook that stopped my worst scroll",
      format: "reel",
      hook: "I tested 10 hooks. This one won by a mile",
      captionStarter:
        "The first second decides everything. Here is the hook formula I use now.",
    },
    {
      title: "A day in my life as a full-time creator",
      format: "reel",
      hook: "The unfiltered version, including the boring parts",
      captionStarter:
        "It is not all filming and posting. Here is what a real day looks like, 9am to 9pm.",
    },
    {
      title: "3 tools I use every single day",
      format: "post",
      hook: "If I lost these, my content would stop",
      captionStarter:
        "Three tools that do the heavy lifting. Number 2 is free.",
    },
    {
      title: "Follower question: how do I stay consistent?",
      format: "story",
      hook: "You asked. Here is the honest answer",
      captionStarter:
        "Consistency is not a personality trait. It is a system. Here is mine, in three steps.",
    },
    {
      title: "What I would do if I started from zero today",
      format: "carousel",
      hook: "No audience, no budget. Here is the plan",
      captionStarter:
        "If I deleted my account today, this is exactly how I would rebuild it in 90 days.",
    },
  ],
  agency: [
    {
      title: "The brief we got wrong (and what it taught us)",
      format: "post",
      hook: "We missed the mark on this one. Here is the full story",
      captionStarter:
        "Every agency has a project that went sideways. Ours taught us a lesson we now build into every kickoff.",
    },
    {
      title: "How we scope a project in 30 minutes",
      format: "carousel",
      hook: "The framework we use before we ever quote a price",
      captionStarter:
        "Three questions separate a clear project from a scope-creep nightmare. Here is the framework.",
    },
    {
      title: "Behind the scenes: a campaign launch week",
      format: "reel",
      hook: "72 hours before launch, this is what we are doing",
      captionStarter:
        "Launch week looks chaotic from the outside. Here is the actual checklist that keeps it on track.",
    },
    {
      title: "5 signs your brand needs a rebrand",
      format: "carousel",
      hook: "Number 4 is the one founders ignore the longest",
      captionStarter:
        "A rebrand is not a logo refresh. Here are the five signals that it is time.",
    },
    {
      title: "Client result: what changed after 90 days",
      format: "post",
      hook: "Same team, same budget. Different results",
      captionStarter:
        "Here is what we changed in the first 90 days, and the numbers that followed. Shared with the client's permission.",
    },
    {
      title: "Ask us anything: strategy Q&A",
      format: "story",
      hook: "Send your hardest marketing question",
      captionStarter:
        "Use the question sticker. We will answer the best ones in this week's stories, on camera.",
    },
  ],
};

/** Deterministic PRNG (mulberry32): the same seed always gives the same sequence. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickIdeas(
  nicheId: string,
  opts: { format?: string; count?: number; seed?: number } = {},
): Idea[] {
  const { format, count = 6, seed = 1 } = opts;
  const niche: NicheId = NICHES.some((n) => n.id === nicheId) ? (nicheId as NicheId) : "creator";
  let ideas = POST_IDEAS[niche];
  if (format) {
    ideas = ideas.filter((idea) => idea.format === format);
  }
  const rand = mulberry32(seed);
  const shuffled = [...ideas];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/** Plain text for copying: one idea per block. */
export function ideasToText(ideas: Idea[]): string {
  return ideas
    .map(
      (idea) =>
        `${idea.title}\nFormat: ${idea.format}\nHook: ${idea.hook}\nCaption starter: ${idea.captionStarter}`,
    )
    .join("\n\n");
}
