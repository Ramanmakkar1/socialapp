"use client";

import { useId, useMemo, useRef, useState } from "react";
import {
  Check, Copy, Heart, ImageIcon, Lightbulb, MessageCircle, MessageSquareQuote, PenLine, RefreshCw, Send, Smile, Sparkles, Target,
} from "lucide-react";
import { PLATFORM_LIMITS, foldCaption } from "@/lib/captionLimits";

export type Goal =
  | "Engagement"
  | "Sell a product"
  | "Announce"
  | "Educate"
  | "Behind the scenes"
  | "Giveaway";

export type Tone = "Friendly" | "Professional" | "Funny" | "Bold";

const GOALS: Goal[] = [
  "Engagement",
  "Sell a product",
  "Announce",
  "Educate",
  "Behind the scenes",
  "Giveaway",
];

const TONES: Tone[] = ["Friendly", "Professional", "Funny", "Bold"];

interface Template {
  hook: string;
  hookEmoji: string;
  body: (topic: string) => string[];
  cta: string;
  ctaEmoji: string;
  keywordCta: string;
}

// 6 varied template archetypes per goal x tone
const TEMPLATES: Record<Goal, Record<Tone, Template[]>> = {
  Engagement: {
    Friendly: [
      {
        hook: "Can we talk about something for a second?",
        hookEmoji: "✨ ",
        body: (t) => [
          `Lately I’ve been thinking a lot about ${t}.`,
          "It feels like everyone has a slightly different take on it.",
        ],
        cta: "What’s your experience been? Drop your thoughts below!",
        ctaEmoji: " 👇",
        keywordCta: "Comment CHAT and I'll DM you my favorite tips on this!",
      },
      {
        hook: "Quick check-in with everyone today:",
        hookEmoji: "👋 ",
        body: (t) => [
          `When it comes to ${t}, do you usually dive right in or take your time?`,
          "I used to do it the hard way until I changed my approach.",
        ],
        cta: "Tell me: which side are you on? Let’s compare notes in the comments.",
        ctaEmoji: " 💬",
        keywordCta: "Comment TIPS and I'll DM you my complete breakdown!",
      },
      {
        hook: "Unpopular opinion maybe, but hear me out:",
        hookEmoji: "💛 ",
        body: (t) => [
          `${t} doesn't have to be complicated or stressful.`,
          "Small, consistent steps make all the difference.",
        ],
        cta: "Do you agree or disagree? Let me know below!",
        ctaEmoji: " 💭",
        keywordCta: "Comment AGREE and I'll DM you the free starter checklist!",
      },
      {
        hook: "If you could change one thing right now, what would it be?",
        hookEmoji: "🌟 ",
        body: (t) => [
          `For me, mastering ${t} completely shifted the game.`,
          "Now I’m curious what everyone else is working toward.",
        ],
        cta: "Drop an emoji that matches your mood today!",
        ctaEmoji: " ⬇️",
        keywordCta: "Comment GOALS and I'll DM you our step-by-step workbook!",
      },
      {
        hook: "Real talk from my corner of the world today.",
        hookEmoji: "☕ ",
        body: (t) => [
          `We spend so much time stressing over ${t}.`,
          "What if we made it simple, fun, and manageable instead?",
        ],
        cta: "Tag a friend who needs a reminder about this today!",
        ctaEmoji: " ✨",
        keywordCta: "Comment GUIDE and I'll DM you the full guide directly!",
      },
      {
        hook: "This made my entire week and I had to share.",
        hookEmoji: "🙌 ",
        body: (t) => [
          `Someone asked me how I stay motivated with ${t}.`,
          "Honestly? It comes down to one simple routine that anyone can follow.",
        ],
        cta: "What keeps you inspired? Share your favorite tip below!",
        ctaEmoji: " 🚀",
        keywordCta: "Comment ROUTINE and I'll DM you my exact daily schedule!",
      },
    ],
    Professional: [
      {
        hook: "A strategic question for professionals in this space:",
        hookEmoji: "📊 ",
        body: (t) => [
          `How is your organization approaching ${t} this quarter?`,
          "The most effective teams treat it as an essential growth lever.",
        ],
        cta: "Share your perspective in the comments below.",
        ctaEmoji: " 📈",
        keywordCta: "Comment REPORT and I'll DM you the full benchmarking data!",
      },
      {
        hook: "The landscape is shifting faster than most teams realize.",
        hookEmoji: "🔍 ",
        body: (t) => [
          `When we evaluate high-performing workflows around ${t}, one pattern stands out:`,
          "Clarity and consistency beat complexity every single time.",
        ],
        cta: "How does your team navigate this? Let’s start a conversation.",
        ctaEmoji: " 💼",
        keywordCta: "Comment INSIGHT and I'll DM you our executive summary!",
      },
      {
        hook: "One observation from our latest industry review:",
        hookEmoji: "📌 ",
        body: (t) => [
          `Too many leaders overlook the true impact of ${t}.`,
          "Prioritizing the fundamentals creates sustainable, long-term leverage.",
        ],
        cta: "What has been the biggest factor in your team's success? Comment below.",
        ctaEmoji: " 💡",
        keywordCta: "Comment BLUEPRINT and I'll DM you the implementation framework!",
      },
      {
        hook: "Debate of the week for operators and founders:",
        hookEmoji: "⚖️ ",
        body: (t) => [
          `Should ${t} be centralized or distributed across teams?`,
          "We’ve seen both models work, but each brings distinct trade-offs.",
        ],
        cta: "Which model does your company use? Join the discussion below.",
        ctaEmoji: " 🤝",
        keywordCta: "Comment FRAMEWORK and I'll DM you our comparison matrix!",
      },
      {
        hook: "The difference between average and top-tier execution:",
        hookEmoji: "🎯 ",
        body: (t) => [
          `Most people treat ${t} as an afterthought.`,
          "Industry leaders design intentional systems around it from day one.",
        ],
        cta: "What is your top priority right now? Reply with your thoughts.",
        ctaEmoji: " ✍️",
        keywordCta: "Comment STRATEGY and I'll DM you our tactical roadmap!",
      },
      {
        hook: "Three questions every leader should ask right now:",
        hookEmoji: "📋 ",
        body: (t) => [
          `1. Where are the friction points in your process with ${t}?`,
          "2. Are your team members aligned on the key deliverables?",
        ],
        cta: "Which question resonates most with your current focus? Comment below.",
        ctaEmoji: " 🗣️",
        keywordCta: "Comment AUDIT and I'll DM you our team diagnostic checklist!",
      },
    ],
    Funny: [
      {
        hook: "Me: I’m going to have a very productive and chill day.",
        hookEmoji: "😅 ",
        body: (t) => [
          `Also me 10 minutes later: spiraling down a rabbit hole about ${t}.`,
          "Tell me I’m not the only one who does this on a daily basis.",
        ],
        cta: "Drop an emoji if you feel personally victimized by this.",
        ctaEmoji: " 💀",
        keywordCta: "Comment HELP and I'll DM you the sanity-saving shortcut!",
      },
      {
        hook: "There are two types of people in this world:",
        hookEmoji: "🍿 ",
        body: (t) => [
          `Those who have ${t} totally figured out, and those who are reading this.`,
          "Don’t worry, we meet on Thursdays and bring snacks.",
        ],
        cta: "Which camp are you in? Be brutally honest in the comments.",
        ctaEmoji: " 😂",
        keywordCta: "Comment SNACK and I'll DM you the cheat sheet so you look prepared!",
      },
      {
        hook: "Nobody warned me that adulthood would involve this much thinking about:",
        hookEmoji: "👀 ",
        body: (t) => [
          `Yes, specifically ${t}. Over and over again.`,
          "Where was this chapter in high school? Who approved this curriculum?",
        ],
        cta: "Rate your current energy level from 1 to 10 in the comments.",
        ctaEmoji: " 🔋",
        keywordCta: "Comment CHEAT and I'll DM you the lazy genius guide!",
      },
      {
        hook: "My toxic trait? Believing I can fix everything in 5 minutes.",
        hookEmoji: "🤡 ",
        body: (t) => [
          `Especially when it involves ${t}.`,
          "Three hours and 42 open browser tabs later... here we are.",
        ],
        cta: "How many tabs do you have open right now? Guess and comment below!",
        ctaEmoji: " 🖥️",
        keywordCta: "Comment TABS and I'll DM you the 3-minute fix!",
      },
      {
        hook: "Please tell me it’s not just me.",
        hookEmoji: "🙃 ",
        body: (t) => [
          `I planned to conquer ${t} by 9 AM this morning.`,
          "It’s now afternoon and I’ve mostly reorganized my playlist.",
        ],
        cta: "What is your go-to procrastination method? Expose yourself below.",
        ctaEmoji: " 🎧",
        keywordCta: "Comment FOCUS and I'll DM you the quick-start system!",
      },
      {
        hook: "Send help, caffeine, or both.",
        hookEmoji: "☕ ",
        body: (t) => [
          `Tried tackling ${t} without coffee today.`,
          "Zero stars, do not recommend. Absolute chaos.",
        ],
        cta: "Coffee, tea, or pure sheer panic? What powers your day? Comment below!",
        ctaEmoji: " ☕",
        keywordCta: "Comment COFFEE and I'll DM you the easy step-by-step breakdown!",
      },
    ],
    Bold: [
      {
        hook: "Stop scrolling and hear the truth most won't say:",
        hookEmoji: "🔥 ",
        body: (t) => [
          `If you’re still ignoring ${t}, you’re leaving massive growth on the table.`,
          "Excuses don’t build momentum. Decisive action does.",
        ],
        cta: "Are you ready to level up or stay comfortable? Comment your answer below.",
        ctaEmoji: " ⚡",
        keywordCta: "Comment ACTION and I'll DM you the exact battle-tested playbook!",
      },
      {
        hook: "Most people fail at this for one simple reason.",
        hookEmoji: "🚨 ",
        body: (t) => [
          `They overthink ${t} instead of executing with conviction.`,
          "The winners aren't smarter. They simply start before they feel ready.",
        ],
        cta: "What’s the one bold move you're making this week? Put it in the comments.",
        ctaEmoji: " 👊",
        keywordCta: "Comment EXECUTE and I'll DM you the no-nonsense action plan!",
      },
      {
        hook: "Let’s settle this once and for all.",
        hookEmoji: "💥 ",
        body: (t) => [
          `Half measures won’t get you where you want to go with ${t}.`,
          "Either commit 100% or stop wondering why nothing changes.",
        ],
        cta: "Ready to go all in? Drop a 🔥 in the comments right now.",
        ctaEmoji: " 🚀",
        keywordCta: "Comment ALLIN and I'll DM you the breakthrough checklist!",
      },
      {
        hook: "Hard pill to swallow today:",
        hookEmoji: "💣 ",
        body: (t) => [
          `Nobody is coming to save your progress with ${t}.`,
          "You have the tools, the time, and the capability. The rest is on you.",
        ],
        cta: "No more waiting. Drop a comment below if you're taking ownership today.",
        ctaEmoji: " 🏆",
        keywordCta: "Comment READY and I'll DM you the zero-fluff blueprint!",
      },
      {
        hook: "They said it couldn't be done in this market.",
        hookEmoji: "⚡ ",
        body: (t) => [
          `They said ${t} was too saturated, too slow, and too crowded.`,
          "They were wrong. Focus on raw value and nothing can slow you down.",
        ],
        cta: "Who’s building something unstoppable right now? Drop your flag below.",
        ctaEmoji: " 🚩",
        keywordCta: "Comment UNSTOPPABLE and I'll DM you the step-by-step strategy!",
      },
      {
        hook: "You don't need another opinion. You need execution.",
        hookEmoji: "🎯 ",
        body: (t) => [
          `Everyone has advice on ${t}, but few actually walk the walk.`,
          "Cut out the noise, lock in, and get the job done.",
        ],
        cta: "What is your single biggest target this month? Declare it below.",
        ctaEmoji: " 📢",
        keywordCta: "Comment WIN and I'll DM you the exact daily tracking template!",
      },
    ],
  },
  "Sell a product": {
    Friendly: [
      {
        hook: "Something special just landed and we’re so thrilled to share it!",
        hookEmoji: "🌿 ",
        body: (t) => [
          `Meet our newest favorite: ${t}.`,
          "Crafted with care, designed to make your daily routine so much easier and brighter.",
        ],
        cta: "Tap the link in bio to explore the collection before it sells out!",
        ctaEmoji: " 🛍️",
        keywordCta: "Comment SHOP and I'll DM you the direct link and a 15% off code!",
      },
      {
        hook: "Say hello to your new daily essential.",
        hookEmoji: "💖 ",
        body: (t) => [
          `If you’ve been searching for something better for ${t}, this is it.`,
          "Gentle, effective, and made with your everyday lifestyle in mind.",
        ],
        cta: "Head over to the link in bio to treat yourself today!",
        ctaEmoji: " ✨",
        keywordCta: "Comment LINK and I'll DM you the product page and special perks!",
      },
      {
        hook: "Here’s a little treat you definitely deserve this week:",
        hookEmoji: "🎁 ",
        body: (t) => [
          `We poured so much heart into creating ${t}.`,
          "It’s already helping so many people simplify their day-to-day.",
        ],
        cta: "Visit our bio link to see why everyone’s loving it!",
        ctaEmoji: " 👇",
        keywordCta: "Comment TREAT and I'll DM you an exclusive community discount!",
      },
      {
        hook: "The reviews are in and my heart is completely full!",
        hookEmoji: "🥺 ",
        body: (t) => [
          `Early customers are already raving about ${t}.`,
          "“It solved my biggest headache in under 24 hours” — actual message we got yesterday!",
        ],
        cta: "Ready to feel the difference? Link in bio to grab yours!",
        ctaEmoji: " 💫",
        keywordCta: "Comment GRAB and I'll DM you the VIP checkout link!",
      },
      {
        hook: "Made by someone who needed this as much as you do.",
        hookEmoji: "🌸 ",
        body: (t) => [
          `We couldn't find a solution for ${t} that checked all the boxes.`,
          "So we built it ourselves — high quality, transparent, and built to last.",
        ],
        cta: "Explore the full details via the link in our bio!",
        ctaEmoji: " 🏷️",
        keywordCta: "Comment DETAILS and I'll DM you full specifications and pricing!",
      },
      {
        hook: "Quick heads up before our first batch is gone!",
        hookEmoji: "⏰ ",
        body: (t) => [
          `Inventory for ${t} is moving much faster than expected.`,
          "Thank you so much to everyone who supported this launch!",
        ],
        cta: "Snag yours while supplies last at the link in bio.",
        ctaEmoji: " 📦",
        keywordCta: "Comment CART and I'll DM you a reserve link right now!",
      },
    ],
    Professional: [
      {
        hook: "Introducing the next evolution in efficiency and performance.",
        hookEmoji: "🚀 ",
        body: (t) => [
          `Engineered specifically for high demands: ${t}.`,
          "Streamline operations, reduce overhead, and deliver consistent results.",
        ],
        cta: "Schedule a walkthrough or request access via the link in bio.",
        ctaEmoji: " 🔗",
        keywordCta: "Comment DEMO and I'll DM you direct access to the live preview!",
      },
      {
        hook: "A high-leverage upgrade for serious operators.",
        hookEmoji: "💼 ",
        body: (t) => [
          `Optimizing ${t} shouldn't require stitching together multiple fragmented tools.`,
          "Our enterprise-ready solution delivers seamless integration out of the box.",
        ],
        cta: "Review technical specifications and pricing at the link in bio.",
        ctaEmoji: " 📊",
        keywordCta: "Comment PRICING and I'll DM you our full tier comparison sheet!",
      },
      {
        hook: "Designed to solve the primary bottleneck in your pipeline.",
        hookEmoji: "⚙️ ",
        body: (t) => [
          `When organizations scale, managing ${t} often becomes unsustainable.`,
          "This release automates the heavy lifting with precision reliability.",
        ],
        cta: "Explore enterprise licensing via the link in bio.",
        ctaEmoji: " 📑",
        keywordCta: "Comment ACCESS and I'll DM you a complimentary trial invite!",
      },
      {
        hook: "Measurable ROI from week one of deployment.",
        hookEmoji: "📈 ",
        body: (t) => [
          `Clients adopting ${t} report a 40% reduction in cycle time.`,
          "Built on proven architecture to scale effortlessly alongside your growth.",
        ],
        cta: "Read the case studies and book your onboarding call in bio.",
        ctaEmoji: " 🤝",
        keywordCta: "Comment CASESTUDY and I'll DM you the verified customer data!",
      },
      {
        hook: "Standardize your workflow with purpose-built tooling.",
        hookEmoji: "🎯 ",
        body: (t) => [
          `Why compromise on quality when implementing ${t}?`,
          "Get enterprise-grade security, dedicated support, and unmatched speed.",
        ],
        cta: "Visit our site via bio to review team licensing tiers.",
        ctaEmoji: " 🌐",
        keywordCta: "Comment ENTERPRISE and I'll DM you custom volume pricing!",
      },
      {
        hook: "Now officially open for new customer onboarding.",
        hookEmoji: "✅ ",
        body: (t) => [
          `We have expanded capacity for ${t} after a closed beta phase.`,
          "Accelerate your roadmap with zero setup friction.",
        ],
        cta: "Reserve your spot through the link in our bio today.",
        ctaEmoji: " 📥",
        keywordCta: "Comment ONBOARD and I'll DM you the fast-track activation link!",
      },
    ],
    Funny: [
      {
        hook: "Look, we both know your current setup is held together with tape.",
        hookEmoji: "🙈 ",
        body: (t) => [
          `Time to retire the chaos and meet ${t}.`,
          "Your future self will thank you (and maybe stop panicking).",
        ],
        cta: "Grab yours at the link in bio before you change your mind!",
        ctaEmoji: " 🛒",
        keywordCta: "Comment SAVEME and I'll DM you the link and a secret discount!",
      },
      {
        hook: "Shut up and take my money (except give it to us please).",
        hookEmoji: "💸 ",
        body: (t) => [
          `Finally, someone solved ${t} without making you read a 400-page manual.`,
          "It just works. Like magic, but with actual science.",
        ],
        cta: "Hit the link in bio before we come to our senses and raise prices.",
        ctaEmoji: " 🏃💨",
        keywordCta: "Comment MONEY and I'll DM you a coupon code immediately!",
      },
      {
        hook: "Things that won’t disappoint you: this product.",
        hookEmoji: "😌 ",
        body: (t) => [
          `We present: ${t}.`,
          "It won't cancel plans on you, forget your birthday, or make weird noises.",
        ],
        cta: "Link in bio to bring joy back into your life.",
        ctaEmoji: " ✨",
        keywordCta: "Comment YES and I'll DM you the fast checkout link!",
      },
      {
        hook: "My accountant told me not to hype this up too much.",
        hookEmoji: "🤐 ",
        body: (t) => [
          `Too bad: ${t} is genuinely the best thing we’ve ever made.`,
          "Even my skeptical grandma gave it two enthusiastic thumbs up.",
        ],
        cta: "Link in bio to grab yours before grandma orders them all.",
        ctaEmoji: " 👵",
        keywordCta: "Comment GRANDMA and I'll DM you the special order link!",
      },
      {
        hook: "Tired of suffering? Try this instead.",
        hookEmoji: "🙃 ",
        body: (t) => [
          `Life is hard enough without struggling over ${t}.`,
          "One click, zero regrets, maximum satisfaction.",
        ],
        cta: "Link in bio. Do it for your mental health.",
        ctaEmoji: " 🧘",
        keywordCta: "Comment RELIEF and I'll DM you the order link right away!",
      },
      {
        hook: "Warning: High risk of bragging to your friends after buying.",
        hookEmoji: "⚠️ ",
        body: (t) => [
          `Once you get your hands on ${t}, you can’t go back.`,
          "Side effects include smug satisfaction and effortless results.",
        ],
        cta: "Order via link in bio at your own risk of loving it too much.",
        ctaEmoji: " 💅",
        keywordCta: "Comment BRAG and I'll DM you the direct purchase link!",
      },
    ],
    Bold: [
      {
        hook: "The standard has officially been raised.",
        hookEmoji: "🔥 ",
        body: (t) => [
          `Introducing ${t} — engineered for those who refuse to settle for second best.`,
          "Unrivaled performance, flawless build quality, and unmatched output.",
        ],
        cta: "Claim yours now via the link in bio. Quantity is strictly limited.",
        ctaEmoji: " ⚡",
        keywordCta: "Comment CLAIM and I'll DM you guaranteed priority checkout!",
      },
      {
        hook: "Stop burning time on inferior alternatives.",
        hookEmoji: "🛑 ",
        body: (t) => [
          `If you take ${t} seriously, this is the only investment worth making.`,
          "Designed from the ground up to dominate the category.",
        ],
        cta: "Order directly at the link in bio before allocations close.",
        ctaEmoji: " 🎯",
        keywordCta: "Comment DOMINATE and I'll DM you the instant order link!",
      },
      {
        hook: "Built for creators and brands that play to win.",
        hookEmoji: "🏆 ",
        body: (t) => [
          `${t} delivers results where everything else fell short.`,
          "No compromises. No shortcuts. Just pure impact.",
        ],
        cta: "Secure yours at the link in bio right now.",
        ctaEmoji: " 💥",
        keywordCta: "Comment WINNER and I'll DM you the VIP allocation page!",
      },
      {
        hook: "The wait is over. The benchmark has arrived.",
        hookEmoji: "🚀 ",
        body: (t) => [
          `We redesigned how everyone thinks about ${t}.`,
          "Tested under extreme conditions. Proven to deliver every single time.",
        ],
        cta: "Tap link in bio to get yours before the first drop sells out.",
        ctaEmoji: " ⏳",
        keywordCta: "Comment DROP and I'll DM you the direct shop link immediately!",
      },
      {
        hook: "Don't settle for 'good enough' when perfection is available.",
        hookEmoji: "💎 ",
        body: (t) => [
          `${t} is crafted for people who demand uncompromising excellence.`,
          "Experience the difference of world-class design in action.",
        ],
        cta: "Shop the flagship release via the link in bio.",
        ctaEmoji: " 👑",
        keywordCta: "Comment LUXE and I'll DM you the direct private order link!",
      },
      {
        hook: "One purchase. Complete transformation.",
        hookEmoji: "⚡ ",
        body: (t) => [
          `Upgrade your experience with ${t} today.`,
          "Once you make the switch, there is simply no looking back.",
        ],
        cta: "Get yours now at the link in bio.",
        ctaEmoji: " 🛒",
        keywordCta: "Comment UPGRADE and I'll DM you the fast-track link + code!",
      },
    ],
  },
  Announce: {
    Friendly: [
      {
        hook: "We’ve been keeping a big secret, and it’s finally time to share!",
        hookEmoji: "🎉 ",
        body: (t) => [
          `We are officially launching ${t}!`,
          "Months of planning, late-night testing, and so much love went into this moment.",
        ],
        cta: "Celebrate with us in the comments! What are you most excited for?",
        ctaEmoji: " 🥳",
        keywordCta: "Comment LAUNCH and I'll DM you all the launch day perks!",
      },
      {
        hook: "Big news is here, and we couldn't wait another minute!",
        hookEmoji: "📣 ",
        body: (t) => [
          `Today marks the beginning of something special: ${t}.`,
          "Thank you to everyone in our community who cheered us on along the way.",
        ],
        cta: "Check out the full reveal at the link in bio!",
        ctaEmoji: " 💛",
        keywordCta: "Comment BIGNEWS and I'll DM you the full reveal video + link!",
      },
      {
        hook: "Grab your favorite drink because we have an update!",
        hookEmoji: "☕ ",
        body: (t) => [
          `It’s official: ${t} is finally happening!`,
          "We can’t wait to see how this brings everyone closer together.",
        ],
        cta: "Drop a celebration emoji below if you’ve been waiting for this!",
        ctaEmoji: " 🎊",
        keywordCta: "Comment PARTY and I'll DM you the celebration invite link!",
      },
      {
        hook: "Today feels like a dream come true.",
        hookEmoji: "✨ ",
        body: (t) => [
          `After months of dreaming, ${t} is live in the world.`,
          "We couldn’t have reached this milestone without your continuous support.",
        ],
        cta: "Tell us: how excited are you on a scale of 1 to 10? Comment below!",
        ctaEmoji: " 🌟",
        keywordCta: "Comment CELEBRATE and I'll DM you the special launch goodies!",
      },
      {
        hook: "A special milestone we want to share with all of you.",
        hookEmoji: "💌 ",
        body: (t) => [
          `We are thrilled to formally announce ${t}.`,
          "This is just chapter one of so many exciting things ahead.",
        ],
        cta: "Read our full letter to the community at the link in bio.",
        ctaEmoji: " 📖",
        keywordCta: "Comment LETTER and I'll DM you the founder's note and roadmap!",
      },
      {
        hook: "Surprise! We have a little announcement for you today.",
        hookEmoji: "🎈 ",
        body: (t) => [
          `Get ready for ${t} — coming your way starting right now!`,
          "We’re answering all your questions live today.",
        ],
        cta: "Ask your questions in the comments and we’ll reply to every single one!",
        ctaEmoji: " 💬",
        keywordCta: "Comment SURPRISE and I'll DM you early sneak peeks!",
      },
    ],
    Professional: [
      {
        hook: "Official Announcement: Strategic milestone reached.",
        hookEmoji: "📢 ",
        body: (t) => [
          `We are proud to announce the formal rollout of ${t}.`,
          "This initiative enhances operational scalability and client value across the board.",
        ],
        cta: "Read the official press release via the link in our bio.",
        ctaEmoji: " 📄",
        keywordCta: "Comment RELEASE and I'll DM you the full corporate briefing!",
      },
      {
        hook: "A significant development for our partners and clients:",
        hookEmoji: "🏛️ ",
        body: (t) => [
          `Today we are publishing our strategic update regarding ${t}.`,
          "Designed to align with industry benchmarks and deliver enterprise impact.",
        ],
        cta: "Access the complete briefing documentation at the link in bio.",
        ctaEmoji: " 📑",
        keywordCta: "Comment BRIEFING and I'll DM you the full executive deck!",
      },
      {
        hook: "Expanding our core infrastructure: What you need to know.",
        hookEmoji: "🏗️ ",
        body: (t) => [
          `We have successfully concluded phase one of ${t}.`,
          "This upgrade unlocks enhanced performance, reliability, and security.",
        ],
        cta: "Review our system notes and documentation in bio.",
        ctaEmoji: " 📊",
        keywordCta: "Comment SPECS and I'll DM you the full technical architecture overview!",
      },
      {
        hook: "We are pleased to introduce our newest company initiative.",
        hookEmoji: "🤝 ",
        body: (t) => [
          `Effective immediately, ${t} is available to all registered partners.`,
          "Our team is standing by to ensure seamless deployment and onboarding.",
        ],
        cta: "Contact your account representative or view details via bio.",
        ctaEmoji: " 💼",
        keywordCta: "Comment PARTNER and I'll DM you the partner onboarding pack!",
      },
      {
        hook: "Key quarterly milestone: Innovation meets execution.",
        hookEmoji: "🎯 ",
        body: (t) => [
          `Delivering on our product commitment: ${t} is now in production.`,
          "Built to support our growing ecosystem with zero compromises on quality.",
        ],
        cta: "Discover the new feature set through the link in bio.",
        ctaEmoji: " 🌐",
        keywordCta: "Comment FEATURE and I'll DM you the feature release matrix!",
      },
      {
        hook: "Important update regarding our upcoming roadmap:",
        hookEmoji: "🗓️ ",
        body: (t) => [
          `We are accelerating the timeline for ${t}.`,
          "Early access registration is now live for qualified organizations.",
        ],
        cta: "Submit your registration request via the link in bio.",
        ctaEmoji: " ✍️",
        keywordCta: "Comment EARLY and I'll DM you priority access registration!",
      },
    ],
    Funny: [
      {
        hook: "The worst kept secret on the internet is finally out.",
        hookEmoji: "🚨 ",
        body: (t) => [
          `Yes, we are actually doing ${t}.`,
          "Try to act surprised so our marketing team feels good about themselves.",
        ],
        cta: "Drop an Oscar-worthy shocked reaction in the comments!",
        ctaEmoji: " 😱",
        keywordCta: "Comment SHOCK and I'll DM you the secret link before anyone else!",
      },
      {
        hook: "Stop whatever you’re doing (unless you’re eating tacos).",
        hookEmoji: "🌮 ",
        body: (t) => [
          `Big news: ${t} is here!`,
          "We worked way too hard on this to let you scroll past without a double tap.",
        ],
        cta: "Show some love in the comments or we might cry.",
        ctaEmoji: " 🥺",
        keywordCta: "Comment TACO and I'll DM you the announcement treats!",
      },
      {
        hook: "Brace yourselves. News incoming.",
        hookEmoji: "📣 ",
        body: (t) => [
          `We finally did the thing: ${t}.`,
          "It only took 73 cups of coffee and several mild existential crises.",
        ],
        cta: "Drop your best reaction GIF description below!",
        ctaEmoji: " 🎬",
        keywordCta: "Comment THING and I'll DM you the link to see it first!",
      },
      {
        hook: "Can I get a drumroll please? 🥁",
        hookEmoji: "🥁 ",
        body: (t) => [
          `The rumors you made up in your head are true: ${t} is here.`,
          "We’re taking compliments, high-fives, and pizza delivery.",
        ],
        cta: "Comment your favorite pizza topping to celebrate with us.",
        ctaEmoji: " 🍕",
        keywordCta: "Comment PIZZA and I'll DM you the celebration discount code!",
      },
      {
        hook: "Breaking news from our headquarters (aka my living room):",
        hookEmoji: "📺 ",
        body: (t) => [
          `We just pressed the big red button on ${t}.`,
          "Everything is working smoothly and nothing caught fire. Huge win.",
        ],
        cta: "Send high fives in the comments below!",
        ctaEmoji: " ✋",
        keywordCta: "Comment LIVE and I'll DM you the link before the server crashes!",
      },
      {
        hook: "Look ma, we made it!",
        hookEmoji: "🚀 ",
        body: (t) => [
          `Announcing ${t} today!`,
          "My mom still doesn't understand what this means, but she’s proud anyway.",
        ],
        cta: "Drop some love in the comments for mom!",
        ctaEmoji: " ❤️",
        keywordCta: "Comment MOM and I'll DM you our celebratory welcome gift!",
      },
    ],
    Bold: [
      {
        hook: "This changes the entire playing field.",
        hookEmoji: "⚡ ",
        body: (t) => [
          `Today we officially unveil ${t}.`,
          "We promised disruption, and today we deliver without apology.",
        ],
        cta: "Witness the shift at the link in bio right now.",
        ctaEmoji: " 💥",
        keywordCta: "Comment SHIFT and I'll DM you the private launch manifesto!",
      },
      {
        hook: "Mark today on your calendar. Nothing stays the same.",
        hookEmoji: "🔥 ",
        body: (t) => [
          `We are launching ${t} — and rewriting the industry standard.`,
          "Those who move fast will capture the advantage. Don't be left behind.",
        ],
        cta: "Claim your early access through the link in bio.",
        ctaEmoji: " 🚀",
        keywordCta: "Comment FIRST and I'll DM you exclusive day-one access!",
      },
      {
        hook: "No more waiting. No more compromises.",
        hookEmoji: "💣 ",
        body: (t) => [
          `${t} is live.`,
          "We built what everyone else was too afraid to attempt.",
        ],
        cta: "Experience the breakthrough firsthand at the link in bio.",
        ctaEmoji: " 👑",
        keywordCta: "Comment REVOLUTION and I'll DM you the direct invite code!",
      },
      {
        hook: "The announcement you’ve been demanding is here.",
        hookEmoji: "🚨 ",
        body: (t) => [
          `Effective today: ${t} is in full motion.`,
          "Get ready to level up your entire workflow in one decisive move.",
        ],
        cta: "Step into the future via the link in our bio.",
        ctaEmoji: " 🌐",
        keywordCta: "Comment FUTURE and I'll DM you the master onboarding kit!",
      },
      {
        hook: "History isn't made by sitting on the sidelines.",
        hookEmoji: "🏆 ",
        body: (t) => [
          `We just went live with ${t}.`,
          "Decisive action produces decisive outcomes. The time is now.",
        ],
        cta: "Join the top 1% who take action today. Link in bio.",
        ctaEmoji: " ⚡",
        keywordCta: "Comment ACTION and I'll DM you the private rollout link!",
      },
      {
        hook: "We said we would deliver, and here it is.",
        hookEmoji: "🎯 ",
        body: (t) => [
          `The official release of ${t} is active across all channels.`,
          "Built with relentless precision for maximum market impact.",
        ],
        cta: "See the proof at the link in bio right now.",
        ctaEmoji: " 💎",
        keywordCta: "Comment IMPACT and I'll DM you the launch dossier!",
      },
    ],
  },
  Educate: {
    Friendly: [
      {
        hook: "Here’s a quick tip that changed everything for me:",
        hookEmoji: "💡 ",
        body: (t) => [
          `When you’re learning ${t}, start with small daily habits rather than cramming.`,
          "It removes the overwhelm and helps things stick naturally.",
        ],
        cta: "Save this post for later and let me know if this helps!",
        ctaEmoji: " 📌",
        keywordCta: "Comment LEARN and I'll DM you our free beginner cheat sheet!",
      },
      {
        hook: "Wish someone told me this when I first started:",
        hookEmoji: "🌱 ",
        body: (t) => [
          `The biggest misconception about ${t} is that you need hours every day.`,
          "In reality, 15 focused minutes can get you 80% of the results.",
        ],
        cta: "Have you tried this approach? Tell me in the comments below!",
        ctaEmoji: " 💬",
        keywordCta: "Comment GUIDE and I'll DM you our 15-minute daily breakdown!",
      },
      {
        hook: "Let’s break this down into 3 simple, easy-to-follow steps:",
        hookEmoji: "📝 ",
        body: (t) => [
          `Step 1: Focus on the foundation of ${t}.`,
          "Step 2: Practice consistently. Step 3: Review your progress weekly without self-judgment.",
        ],
        cta: "Bookmark this post so you can reference it whenever you need!",
        ctaEmoji: " ✨",
        keywordCta: "Comment STEPS and I'll DM you the printable PDF worksheet!",
      },
      {
        hook: "Quick tutorial for anyone trying to get better at this:",
        hookEmoji: "🌻 ",
        body: (t) => [
          `If ${t} feels confusing, try isolating one small part at a time.`,
          "Master that single element before adding anything new to your plate.",
        ],
        cta: "Which part feels hardest for you right now? Let's troubleshoot together below!",
        ctaEmoji: " 👇",
        keywordCta: "Comment HELP and I'll DM you personalized troubleshooting tips!",
      },
      {
        hook: "A gentle reminder for anyone practicing this week:",
        hookEmoji: "💛 ",
        body: (t) => [
          `Progress with ${t} is rarely linear.`,
          "Plateaus are totally normal. Keep showing up and trust your process.",
        ],
        cta: "Share this with someone who needs a little encouragement today!",
        ctaEmoji: " 🤝",
        keywordCta: "Comment MOTIVATE and I'll DM you our community habit tracker!",
      },
      {
        hook: "Did you know this simple trick?",
        hookEmoji: "🔍 ",
        body: (t) => [
          `Most beginners overlook this key detail when doing ${t}.`,
          "Adjusting just one variable often doubles your output immediately.",
        ],
        cta: "Drop a comment if you want a follow-up video on this topic!",
        ctaEmoji: " 🎥",
        keywordCta: "Comment TRICK and I'll DM you the behind-the-scenes video!",
      },
    ],
    Professional: [
      {
        hook: "Technical Deep Dive: Optimizing your operational workflow.",
        hookEmoji: "📊 ",
        body: (t) => [
          `When analyzing root-cause inefficiencies in ${t}, two primary factors emerge:`,
          "Inconsistent baseline metrics and a lack of standardized feedback loops.",
        ],
        cta: "Review our full methodology paper via the link in bio.",
        ctaEmoji: " 📑",
        keywordCta: "Comment STUDY and I'll DM you the peer-reviewed methodology paper!",
      },
      {
        hook: "Framework Breakdown: The three pillars of execution.",
        hookEmoji: "📐 ",
        body: (t) => [
          `To build enduring capacity around ${t}, structure your workflow systematically:`,
          "1. Input validation 2. Process automation 3. Rigorous outcome audits.",
        ],
        cta: "Download the complete framework diagram at the link in bio.",
        ctaEmoji: " 🔗",
        keywordCta: "Comment PILLARS and I'll DM you the high-resolution architecture diagram!",
      },
      {
        hook: "Key Industry Data: What top-quartile teams do differently.",
        hookEmoji: "📈 ",
        body: (t) => [
          `Recent benchmarks reveal that teams prioritizing ${t} achieve 3x higher retention.`,
          "The differentiator lies in proactive monitoring rather than reactive fixes.",
        ],
        cta: "Access the benchmark dataset and metrics through the link in bio.",
        ctaEmoji: " 💼",
        keywordCta: "Comment DATA and I'll DM you the comprehensive industry benchmark!",
      },
      {
        hook: "Best Practice Checklist for enterprise deployment:",
        hookEmoji: "📋 ",
        body: (t) => [
          `Before initiating any major shift in ${t}, verify these prerequisites:`,
          "Cross-functional sign-off, clear SLA definitions, and comprehensive audit logging.",
        ],
        cta: "Save this reference checklist for your next team sprint.",
        ctaEmoji: " 📌",
        keywordCta: "Comment CHECKLIST and I'll DM you our editable deployment checklist!",
      },
      {
        hook: "Case Analysis: Eliminating systemic friction.",
        hookEmoji: "🔬 ",
        body: (t) => [
          `In this case review, we examine how addressing ${t} unlocked 35% higher throughput.`,
          "Standardized documentation alone reduced support tickets significantly.",
        ],
        cta: "Read the comprehensive case study via the link in bio.",
        ctaEmoji: " 📖",
        keywordCta: "Comment CASE and I'll DM you the full PDF case study!",
      },
      {
        hook: "Strategic Brief: Mitigating risk in technical execution.",
        hookEmoji: "🛡️ ",
        body: (t) => [
          `Implementing changes in ${t} requires robust rollback safeguards.`,
          "Always test against staging datasets before executing in production environments.",
        ],
        cta: "Share this briefing with your engineering and product leads.",
        ctaEmoji: " 👥",
        keywordCta: "Comment SAFETY and I'll DM you our risk mitigation playbook!",
      },
    ],
    Funny: [
      {
        hook: "Today on ‘Things I learned the hard way so you don’t have to’:",
        hookEmoji: "🤦 ",
        body: (t) => [
          `Rule #1 of ${t}: Do NOT wing it at 2 AM with low battery.`,
          "Take notes, drink some water, and don't skip the basics like I did.",
        ],
        cta: "Save this so you don’t make my embarrassing mistakes!",
        ctaEmoji: " 😂",
        keywordCta: "Comment MISTAKE and I'll DM you my list of things NEVER to do!",
      },
      {
        hook: "A beginner’s guide to looking like you know what you’re doing:",
        hookEmoji: "🧐 ",
        body: (t) => [
          `Step 1: Nod thoughtfully whenever someone mentions ${t}.`,
          "Step 2: Secretly read our 2-minute summary. Step 3: Profit.",
        ],
        cta: "Tag someone who needs this fake-it-till-you-make-it guide!",
        ctaEmoji: " 🤫",
        keywordCta: "Comment GENIUS and I'll DM you the 2-minute cheat sheet!",
      },
      {
        hook: "Fun fact that will ruin your day (or make your life way easier):",
        hookEmoji: "🙃 ",
        body: (t) => [
          `You’ve probably been doing ${t} the complicated way all along.`,
          "There’s a shortcut button right in front of you. You're welcome.",
        ],
        cta: "Save this post and pretend you figured it out on your own.",
        ctaEmoji: " 🧠",
        keywordCta: "Comment SHORTCUT and I'll DM you the secret button shortcut!",
      },
      {
        hook: "How to explain this to a 5-year-old (or your boss):",
        hookEmoji: "🍼 ",
        body: (t) => [
          `Think of ${t} like putting dishes directly in the dishwasher instead of the sink.`,
          "One extra second now saves 30 minutes of regret later.",
        ],
        cta: "Did that analogy make sense? Drop an emoji below!",
        ctaEmoji: " 🍽️",
        keywordCta: "Comment ANALOGY and I'll DM you 5 more foolproof explanations!",
      },
      {
        hook: "I read the 60-page whitepaper so you don’t have to.",
        hookEmoji: "📚 ",
        body: (t) => [
          `Here is the entire summary regarding ${t} in one sentence:`,
          "Keep it simple, test early, and stop touching settings you don't understand.",
        ],
        cta: "Bookmark this and save yourself 4 hours of reading.",
        ctaEmoji: " ⏱️",
        keywordCta: "Comment CLIFFNOTES and I'll DM you the 1-page executive summary!",
      },
      {
        hook: "My brain trying to comprehend this on a Monday morning:",
        hookEmoji: "🥴 ",
        body: (t) => [
          `Turns out ${t} isn't witchcraft after all.`,
          "Just three basic principles wrapped in fancy terminology to scare beginners.",
        ],
        cta: "Drop a 🧙 in the comments if you thought it was magic too.",
        ctaEmoji: " 🔮",
        keywordCta: "Comment DEMYSTIFY and I'll DM you the jargon-free guide!",
      },
    ],
    Bold: [
      {
        hook: "Stop making this rookie mistake.",
        hookEmoji: "🛑 ",
        body: (t) => [
          `90% of people approach ${t} completely backwards.`,
          "They obsess over vanity metrics instead of mastering core fundamentals.",
        ],
        cta: "Save this post right now if you want to stay ahead of the curve.",
        ctaEmoji: " 📌",
        keywordCta: "Comment MISTAKES and I'll DM you the full breakdown of top errors!",
      },
      {
        hook: "The playbook they don't want you to see:",
        hookEmoji: "⚡ ",
        body: (t) => [
          `Here is the exact formula for mastering ${t} without wasting years:`,
          "Cut out the fluff, reverse-engineer top performers, and execute relentlessly.",
        ],
        cta: "Share this with someone who is ready for high-level execution.",
        ctaEmoji: " 🚀",
        keywordCta: "Comment PLAYBOOK and I'll DM you the complete formula!",
      },
      {
        hook: "Master this one skill and everything else gets easier.",
        hookEmoji: "🎯 ",
        body: (t) => [
          `Nothing moves the needle like command over ${t}.`,
          "While your competitors second-guess themselves, you'll be dominating.",
        ],
        cta: "Bookmark this post and build your competitive advantage.",
        ctaEmoji: " 🏆",
        keywordCta: "Comment SKILL and I'll DM you our advanced training syllabus!",
      },
      {
        hook: "Three harsh truths about learning this in today's market:",
        hookEmoji: "💣 ",
        body: (t) => [
          `1. General advice on ${t} is almost completely outdated.`,
          "2. Speed of iteration beats perfection. 3. Results are the only feedback that matters.",
        ],
        cta: "Agree or disagree? Drop your thoughts below.",
        ctaEmoji: " ✍️",
        keywordCta: "Comment TRUTHS and I'll DM you our modernized system guide!",
      },
      {
        hook: "Don't just participate. Own the category.",
        hookEmoji: "🔥 ",
        body: (t) => [
          `Here is how industry leaders dominate ${t} while others struggle:`,
          "They engineer repeatable systems and eliminate reliance on guesswork.",
        ],
        cta: "Save this blueprint for your next strategic planning session.",
        ctaEmoji: " 💼",
        keywordCta: "Comment BLUEPRINT and I'll DM you the full systems architecture!",
      },
      {
        hook: "The formula is simple. The discipline is rare.",
        hookEmoji: "⚡ ",
        body: (t) => [
          `Everyone wants the benefits of ${t}, but nobody wants the rep count.`,
          "Put in the focused work daily and the compound returns will take care of the rest.",
        ],
        cta: "Commit to the work. Drop a 🔥 below if you're executing today.",
        ctaEmoji: " 💥",
        keywordCta: "Comment DISCIPLINE and I'll DM you our daily habit audit sheet!",
      },
    ],
  },
  "Behind the scenes": {
    Friendly: [
      {
        hook: "A little peek behind the curtain of our daily madness!",
        hookEmoji: "👀 ",
        body: (t) => [
          `Here’s what really goes into working on ${t} behind the scenes.`,
          "Spilled coffee, brainstorm whiteboards, and lots of happy laughter.",
        ],
        cta: "What’s one thing you’ve always wondered about our process? Ask below!",
        ctaEmoji: " 💭",
        keywordCta: "Comment BEHIND and I'll DM you exclusive unedited studio clips!",
      },
      {
        hook: "Come spend a realistic work day with our team!",
        hookEmoji: "☕ ",
        body: (t) => [
          `Today was all about developing ${t} and tackling new ideas.`,
          "Not every day is glamorous, but building something meaningful makes it so worth it.",
        ],
        cta: "What does your typical day look like? Share in the comments!",
        ctaEmoji: " ✨",
        keywordCta: "Comment DAY and I'll DM you our team's favorite tools & routine!",
      },
      {
        hook: "Before the polished post, there was this messy draft:",
        hookEmoji: "📝 ",
        body: (t) => [
          `We went through 5 different versions of ${t} before finding what felt right.`,
          "Creative work takes patience, experiments, and a lot of editing.",
        ],
        cta: "Do you prefer the final polish or the messy creative process? Comment below!",
        ctaEmoji: " 🎨",
        keywordCta: "Comment DRAFT and I'll DM you the original sketches and concepts!",
      },
      {
        hook: "A quiet moment from the studio today.",
        hookEmoji: "🌿 ",
        body: (t) => [
          `Taking a step back while preparing ${t} to appreciate how far we've come.`,
          "Your messages and support keep our creative fire burning every single day.",
        ],
        cta: "Sending warmth your way today. Tell me what you're working on below!",
        ctaEmoji: " 💛",
        keywordCta: "Comment STUDIO and I'll DM you our studio playlist & workspace tour!",
      },
      {
        hook: "Things you don't usually see on Instagram:",
        hookEmoji: "📦 ",
        body: (t) => [
          `Packing, sorting, and fine-tuning every single detail of ${t}.`,
          "Hands-on effort goes into every piece we put out there.",
        ],
        cta: "Drop an emoji if you appreciate handmade and detail-oriented work!",
        ctaEmoji: " 🙌",
        keywordCta: "Comment PACK and I'll DM you the full packaging journey story!",
      },
      {
        hook: "Late night in the workshop tonight!",
        hookEmoji: "🌙 ",
        body: (t) => [
          `Putting the finishing touches on ${t}.`,
          "When you love what you build, the hours just fly right by.",
        ],
        cta: "Are you a morning person or a night owl? Let me know below!",
        ctaEmoji: " 🦉",
        keywordCta: "Comment NIGHT and I'll DM you our secret late-night project preview!",
      },
    ],
    Professional: [
      {
        hook: "Inside Our Process: How we build and iterate at scale.",
        hookEmoji: "🔬 ",
        body: (t) => [
          `Behind every release of ${t} lies an exhaustive quality assurance pipeline.`,
          "We stress-test edge cases before anything touches our production environment.",
        ],
        cta: "Read our engineering design notes through the link in bio.",
        ctaEmoji: " 📑",
        keywordCta: "Comment PROCESS and I'll DM you our technical design document!",
      },
      {
        hook: "An inside look at our cross-functional sprint planning:",
        hookEmoji: "📐 ",
        body: (t) => [
          `When our teams align around ${t}, we prioritize customer feedback loops first.`,
          "Data-driven prioritization keeps development agile and focused on impact.",
        ],
        cta: "Explore our product roadmap updates at the link in bio.",
        ctaEmoji: " 🌐",
        keywordCta: "Comment ROADMAP and I'll DM you our public product roadmap link!",
      },
      {
        hook: "Quality control standards behind our newest release:",
        hookEmoji: "🔍 ",
        body: (t) => [
          `Delivering excellence in ${t} requires strict adherence to compliance and security.`,
          "Every phase is audited to ensure stability for high-volume enterprise users.",
        ],
        cta: "Review our security and compliance overview via bio.",
        ctaEmoji: " 🛡️",
        keywordCta: "Comment AUDIT and I'll DM you our full compliance verification report!",
      },
      {
        hook: "A day in the life of our operations and product team:",
        hookEmoji: "💼 ",
        body: (t) => [
          `Managing continuous integration for ${t} across multi-region environments.`,
          "Consistent observability allows us to maintain 99.9% uptime seamlessly.",
        ],
        cta: "Interested in joining our team? View open roles in bio.",
        ctaEmoji: " 👥",
        keywordCta: "Comment CAREERS and I'll DM you direct referral links to our hiring team!",
      },
      {
        hook: "Retrospective Analysis: Key lessons from our recent deployment.",
        hookEmoji: "📊 ",
        body: (t) => [
          `Our post-mortem on ${t} highlighted two critical architectural wins.`,
          "Documenting lessons learned ensures ongoing organizational excellence.",
        ],
        cta: "Access the full post-mortem engineering article in bio.",
        ctaEmoji: " 📄",
        keywordCta: "Comment RETRO and I'll DM you our internal post-mortem summary!",
      },
      {
        hook: "Infrastructure deep dive: Scaling our core services.",
        hookEmoji: "⚙️ ",
        body: (t) => [
          `How our engineering team scaled ${t} to handle 10x traffic spikes.`,
          "Decoupled microservices and predictive caching eliminated latency spikes.",
        ],
        cta: "Read the technical infrastructure teardown in bio.",
        ctaEmoji: " 🔗",
        keywordCta: "Comment SCALE and I'll DM you the system architecture slides!",
      },
    ],
    Funny: [
      {
        hook: "Instagram vs. Reality: The uncensored edition.",
        hookEmoji: "🫣 ",
        body: (t) => [
          `What you see: A neat post about ${t}.`,
          "What actually happened: 14 retakes, a fallen ring light, and the dog barking at nothing.",
        ],
        cta: "Can anyone relate to the backstage chaos? Tell me below!",
        ctaEmoji: " 🐕",
        keywordCta: "Comment REALITY and I'll DM you the hilarious blooper reel!",
      },
      {
        hook: "This was not in the job description.",
        hookEmoji: "🙃 ",
        body: (t) => [
          `Currently attempting to troubleshoot ${t} with zero dignity remaining.`,
          "If anyone needs me, I will be staring blankly at the wall for 10 minutes.",
        ],
        cta: "Drop an F in the comments to pay respects.",
        ctaEmoji: " 🪦",
        keywordCta: "Comment BLOOPERS and I'll DM you the hilarious outtake video!",
      },
      {
        hook: "Behind the scenes of our very professional business meeting:",
        hookEmoji: "🍕 ",
        body: (t) => [
          `Meeting topic: ${t}.`,
          "Actual discussion: 80% debating lunch options, 20% panic-typing.",
        ],
        cta: "Be honest: what percentage of your meetings are about food? Comment below!",
        ctaEmoji: " 😂",
        keywordCta: "Comment MEETING and I'll DM you our secret team meme folder!",
      },
      {
        hook: "I promised myself I would stay calm today.",
        hookEmoji: "🤡 ",
        body: (t) => [
          `Then ${t} decided to test my patience at 9:02 AM.`,
          "Deep breaths and chocolate are currently keeping this ship afloat.",
        ],
        cta: "What is your emergency coping food? Tell me in the comments!",
        ctaEmoji: " 🍫",
        keywordCta: "Comment CHAOS and I'll DM you the unhinged outtakes!",
      },
      {
        hook: "Footage from our high-tech command center:",
        hookEmoji: "🎬 ",
        body: (t) => [
          `By command center I mean my kitchen table covered in sticky notes about ${t}.`,
          "It's not pretty, but the work gets done (eventually).",
        ],
        cta: "Rate my setup out of 10 in the comments below!",
        ctaEmoji: " ☕",
        keywordCta: "Comment SETUP and I'll DM you the raw photo tour!",
      },
      {
        hook: "My team asked me to act normal for this camera.",
        hookEmoji: "🤪 ",
        body: (t) => [
          `This is literally as normal as it gets while working on ${t}.`,
          "We take our craft seriously, but ourselves? Absolutely not.",
        ],
        cta: "Drop your goofiest emoji in the comments right now!",
        ctaEmoji: " 👾",
        keywordCta: "Comment FUN and I'll DM you our unedited team bloopers!",
      },
    ],
    Bold: [
      {
        hook: "We don't hide the grind. Here is the unvarnished truth.",
        hookEmoji: "🔥 ",
        body: (t) => [
          `Building ${t} took relentless execution, late nights, and zero excuses.`,
          "Most people only see the glory; this is the grit that built it.",
        ],
        cta: "Respect the grind? Drop a 🔥 in the comments.",
        ctaEmoji: " ⚡",
        keywordCta: "Comment GRIND and I'll DM you our raw founder journal entry!",
      },
      {
        hook: "While everyone was talking, we were executing.",
        hookEmoji: "🤫 ",
        body: (t) => [
          `Behind closed doors, we stripped down everything holding ${t} back.`,
          "The result speaks for itself. No shortcuts, no apologies.",
        ],
        cta: "Ready to see what true commitment looks like? Tap the link in bio.",
        ctaEmoji: " 👊",
        keywordCta: "Comment EXECUTION and I'll DM you the unfiltered building timeline!",
      },
      {
        hook: "Take a hard look at what standard-setting execution takes.",
        hookEmoji: "🎯 ",
        body: (t) => [
          `Every single component of ${t} was refined until it was flawless.`,
          "Mediocrity is a choice. We choose world-class every single day.",
        ],
        cta: "Double tap if you hold your work to the highest standard.",
        ctaEmoji: " 💎",
        keywordCta: "Comment STANDARD and I'll DM you our internal quality manifesto!",
      },
      {
        hook: "The work you do in private echoes in public.",
        hookEmoji: "💥 ",
        body: (t) => [
          `Months of unseen discipline went into perfecting ${t}.`,
          "When you commit fully to the process, the outcome takes care of itself.",
        ],
        cta: "Are you putting in the unseen reps? Comment below.",
        ctaEmoji: " 🏆",
        keywordCta: "Comment REPS and I'll DM you our daily accountability system!",
      },
      {
        hook: "They called it impossible. We built it anyway.",
        hookEmoji: "⚡ ",
        body: (t) => [
          `Behind the scenes of ${t}, we solved what competitors abandoned.`,
          "Relentless perseverance beats talent every day of the week.",
        ],
        cta: "Witness the breakthrough via the link in our bio.",
        ctaEmoji: " 🚀",
        keywordCta: "Comment PROOF and I'll DM you our original problem-solving breakdown!",
      },
      {
        hook: "No filters. No marketing spin. Just raw performance.",
        hookEmoji: "💣 ",
        body: (t) => [
          `Here is what actually happened when we stress-tested ${t}.`,
          "We broke it, rebuilt it stronger, and raised the bar permanently.",
        ],
        cta: "Drop a comment if you believe in bulletproof execution.",
        ctaEmoji: " 🛡️",
        keywordCta: "Comment BULLETPROOF and I'll DM you our stress-test telemetry data!",
      },
    ],
  },
  Giveaway: {
    Friendly: [
      {
        hook: "GIVEAWAY TIME! We want to give back to our amazing community!",
        hookEmoji: "🎁 ",
        body: (t) => [
          `We’re giving away one complete set of ${t} to say thank you for all your love.`,
          "Entering takes less than 30 seconds!",
        ],
        cta: "To enter: Like this post, tag a friend below, and make sure you’re following us!",
        ctaEmoji: " ✨",
        keywordCta: "Comment WIN and I'll DM you an instant bonus entry code!",
      },
      {
        hook: "Who wants to win something special today?",
        hookEmoji: "🎉 ",
        body: (t) => [
          `We’ve teamed up to gift one lucky follower our favorite: ${t}!`,
          "Open to everyone who loves great vibes and amazing treats.",
        ],
        cta: "Drop a comment telling us how you'd use it to enter! (Share to Stories for extra luck)",
        ctaEmoji: " 🍀",
        keywordCta: "Comment LUCKY and I'll DM you the official bonus entry link!",
      },
      {
        hook: "It’s our turn to spoil you!",
        hookEmoji: "💖 ",
        body: (t) => [
          `We’re celebrating by giving away ${t} to one wonderful human.`,
          "You deserve something nice this week, and we’re here to deliver.",
        ],
        cta: "Double tap and tag someone who deserves a treat to enter!",
        ctaEmoji: " 🌸",
        keywordCta: "Comment SPOIL and I'll DM you your exclusive giveaway confirmation!",
      },
      {
        hook: "Mystery gift unlocked: Giveaway alert!",
        hookEmoji: "🥳 ",
        body: (t) => [
          `One lucky winner is taking home ${t}!`,
          "We appreciate every single one of you and this is our way of saying thanks.",
        ],
        cta: "Enter now: Follow us, like this post, and leave your favorite emoji below!",
        ctaEmoji: " 🎈",
        keywordCta: "Comment GIFT and I'll DM you your secret double-entry pass!",
      },
      {
        hook: "Spread the joy: Win your dream prize package!",
        hookEmoji: "🌟 ",
        body: (t) => [
          `Enter our community celebration giveaway for ${t}.`,
          "Winner picked randomly and announced right here this Friday!",
        ],
        cta: "Tag your bestie below — unlimited entries allowed, so go wild!",
        ctaEmoji: " 👯",
        keywordCta: "Comment BESTIE and I'll DM you extra chances to win!",
      },
      {
        hook: "Flash giveaway! Don't miss your chance!",
        hookEmoji: "⏰ ",
        body: (t) => [
          `We’re giving away ${t} for the next 48 hours only!`,
          "Quick, easy, and completely free to participate.",
        ],
        cta: "Hit like, follow, and tell us your favorite color in the comments to enter!",
        ctaEmoji: " 🌈",
        keywordCta: "Comment FLASH and I'll DM you the instant flash entry confirmation!",
      },
    ],
    Professional: [
      {
        hook: "Executive Giveaway: Accelerate your business capabilities.",
        hookEmoji: "🏆 ",
        body: (t) => [
          `We are awarding one qualified professional an annual license for ${t}.`,
          "Designed to provide immediate leverage and streamline your daily operations.",
        ],
        cta: "To enter: Comment your primary operational goal below and follow our page.",
        ctaEmoji: " 💼",
        keywordCta: "Comment ENTERPRISE and I'll DM you the official registration link!",
      },
      {
        hook: "Complimentary License Allocation: Professional edition.",
        hookEmoji: "📊 ",
        body: (t) => [
          `In celebration of our latest milestone, we are gifting full access to ${t}.`,
          "Equip your organization with industry-leading tooling at zero cost.",
        ],
        cta: "Tag a colleague who could benefit from this solution to submit an entry.",
        ctaEmoji: " 🤝",
        keywordCta: "Comment LICENSE and I'll DM you the verified entry verification!",
      },
      {
        hook: "Strategic Grant Opportunity for early-stage founders and creators.",
        hookEmoji: "🚀 ",
        body: (t) => [
          `We are sponsoring one team with full implementation of ${t}.`,
          "Includes priority onboarding and dedicated quarterly strategy reviews.",
        ],
        cta: "Share your company's mission statement in the comments to qualify.",
        ctaEmoji: " 📝",
        keywordCta: "Comment GRANT and I'll DM you the application criteria document!",
      },
      {
        hook: "Professional Development Sweepstakes: Elevate your toolkit.",
        hookEmoji: "🎯 ",
        body: (t) => [
          `Win a comprehensive resource bundle and seat for ${t}.`,
          "Selected at random from verified industry practitioners.",
        ],
        cta: "Follow our page and comment your industry vertical to participate.",
        ctaEmoji: " 🔗",
        keywordCta: "Comment TOOLKIT and I'll DM you your participant registration code!",
      },
      {
        hook: "Industry Partner Giveaway: Q3 Technology Sponsorship.",
        hookEmoji: "🏛️ ",
        body: (t) => [
          `We are gifting one corporate deployment package for ${t}.`,
          "Value: Over $1,200 in software access and team onboarding.",
        ],
        cta: "Submit your entry by tagging an industry peer and following our account.",
        ctaEmoji: " 📑",
        keywordCta: "Comment SPONSOR and I'll DM you the corporate grant details!",
      },
      {
        hook: "Exclusive Access Opportunity for leaders and innovators.",
        hookEmoji: "💡 ",
        body: (t) => [
          `Receive unrestricted lifetime tier access to ${t}.`,
          "One recipient will be selected and notified through direct message.",
        ],
        cta: "Comment what you plan to build this quarter to enter.",
        ctaEmoji: " 📈",
        keywordCta: "Comment LIFETIME and I'll DM you the priority entry confirmation!",
      },
    ],
    Funny: [
      {
        hook: "Free stuff alert! (Because we know you love free stuff).",
        hookEmoji: "🚨 ",
        body: (t) => [
          `We’re giving away ${t} so you can finally stop complaining about not having it.`,
          "It’s free. It’s glorious. You want it.",
        ],
        cta: "Tag the cheapest friend you know in the comments to enter!",
        ctaEmoji: " 💀",
        keywordCta: "Comment FREESTUFF and I'll DM you a bonus entry and a meme!",
      },
      {
        hook: "My boss said this was a bad idea. Let’s prove them wrong.",
        hookEmoji: "😈 ",
        body: (t) => [
          `I’m literally giving away ${t} to one of you today.`,
          "Enter before management notices and cancels my fun.",
        ],
        cta: "Like this post and comment an alibi for me below!",
        ctaEmoji: " 🏃💨",
        keywordCta: "Comment ALIBI and I'll DM you the secret winner entry link!",
      },
      {
        hook: "Are you ready to win or are you going to keep scrolling?",
        hookEmoji: "👀 ",
        body: (t) => [
          `Win ${t} without selling your soul or doing 50 pushups.`,
          "Just regular internet rules: like, tag, and cross your fingers.",
        ],
        cta: "Tag someone who never wins anything so they have a shot!",
        ctaEmoji: " 🤞",
        keywordCta: "Comment LUCKYME and I'll DM you double odds on your entry!",
      },
      {
        hook: "Congratulations, you found the jackpot post!",
        hookEmoji: "🎰 ",
        body: (t) => [
          `Up for grabs: ${t}.`,
          "Actual retail value: Priceless (okay, maybe normal price, but it sounds cooler).",
        ],
        cta: "Comment your lucky number below to lock in your chance to win!",
        ctaEmoji: " 🎲",
        keywordCta: "Comment JACKPOT and I'll DM you the VIP raffle ticket!",
      },
      {
        hook: "Winning this > finding a $20 bill in an old jacket.",
        hookEmoji: "💵 ",
        body: (t) => [
          `We’re handing over ${t} to one lucky human.`,
          "Zero catches, zero fine print (except the standard legal stuff we must say).",
        ],
        cta: "Drop a GIF-worthy comment below to seal your entry!",
        ctaEmoji: " 🕺",
        keywordCta: "Comment CASH and I'll DM you an instant bonus ticket!",
      },
      {
        hook: "Do you want nice things? Because this is how you get nice things.",
        hookEmoji: "✨ ",
        body: (t) => [
          `Giving away ${t} because we love you more than our accountant does.`,
          "Takes 10 seconds to enter, lasts a lifetime of bragging rights.",
        ],
        cta: "Tag your squad in the comments below!",
        ctaEmoji: " 🥳",
        keywordCta: "Comment SQUAD and I'll DM you a group entry booster!",
      },
    ],
    Bold: [
      {
        hook: "MASSIVE GIVEAWAY: Elevate your entire setup right now.",
        hookEmoji: "🔥 ",
        body: (t) => [
          `We are putting up ${t} for one ambitious winner.`,
          "No fluff. No gimmicks. Only top-tier gear for those ready to execute.",
        ],
        cta: "To enter: Drop a 🔥 below, share this to Stories, and tag 2 competitors.",
        ctaEmoji: " ⚡",
        keywordCta: "Comment WINNER and I'll DM you the fast-track VIP entry code!",
      },
      {
        hook: "The ultimate giveaway for high performers.",
        hookEmoji: "🏆 ",
        body: (t) => [
          `We are giving away ${t} — the undisputed category leader.`,
          "Winner selected live. Step up and claim what belongs to you.",
        ],
        cta: "Comment your single biggest ambition this year to secure your entry.",
        ctaEmoji: " 👊",
        keywordCta: "Comment CLAIM and I'll DM you our secret bonus raffle ticket!",
      },
      {
        hook: "One winner. Complete category dominance.",
        hookEmoji: "💥 ",
        body: (t) => [
          `Win full access to ${t} and leave excuses behind forever.`,
          "Opportunity favors the bold. Don’t sleep on this drop.",
        ],
        cta: "Follow, like, and comment your declaration of intent below.",
        ctaEmoji: " 🚀",
        keywordCta: "Comment DOMINATE and I'll DM you the priority entry confirmation!",
      },
      {
        hook: "We’re raising the stakes: Premium giveaway alert.",
        hookEmoji: "💎 ",
        body: (t) => [
          `Giving away the flagship edition of ${t}.`,
          "Built for those who settle for nothing less than absolute victory.",
        ],
        cta: "Tag two leaders who belong at the top to qualify.",
        ctaEmoji: " 👑",
        keywordCta: "Comment FLAGSHIP and I'll DM you the VIP verification pass!",
      },
      {
        hook: "Ready to dominate? This is your entry point.",
        hookEmoji: "⚡ ",
        body: (t) => [
          `Enter now to take home ${t} at zero cost.`,
          "The tools make the craftsman. Get the ultimate edge right here.",
        ],
        cta: "Double tap and declare your goals in the comments right now.",
        ctaEmoji: " 🎯",
        keywordCta: "Comment EDGE and I'll DM you an instant bonus entry pass!",
      },
      {
        hook: "The most wanted giveaway of the season is LIVE.",
        hookEmoji: "💣 ",
        body: (t) => [
          `We are handing over ${t} to one determined follower.`,
          "Stop wishing. Take direct action and lock in your submission.",
        ],
        cta: "Comment below with why you deserve this win more than anyone else.",
        ctaEmoji: " 🏅",
        keywordCta: "Comment DESERVE and I'll DM you the certified double entry code!",
      },
    ],
  },
};

const INSTAGRAM_CAPTION_LIMIT = 2200;
// Instagram's feed shows roughly the first 125 characters before "… more".
const FOLD_AT = PLATFORM_LIMITS.instagram.foldAt ?? 125;

const field =
  "min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base outline-none focus:border-[var(--poskoo-violet)] focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]/30";
const ghostBtn =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const toggle =
  "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm font-medium has-[:checked]:border-[var(--poskoo-violet)] has-[:checked]:bg-[var(--poskoo-band)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--poskoo-violet)]";

function Switch({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={`relative inline-flex h-6 w-10 flex-none rounded-full transition-colors ${on ? "bg-[var(--poskoo-violet)]" : "bg-[var(--poskoo-line)]"}`}>
      <i className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </span>
  );
}

export default function CaptionGeneratorTool({ platform = "instagram" }: { platform?: "instagram" | "tiktok" | "facebook" | "linkedin" | "pinterest" | "x" }) {
  const isTikTok = platform === "tiktok";
  const isFacebook = platform === "facebook";
  const isLinkedIn = platform === "linkedin";
  const isPinterest = platform === "pinterest";
  const isX = platform === "x";
  const platformName = isTikTok ? "TikTok" : isFacebook ? "Facebook" : isLinkedIn ? "LinkedIn" : isPinterest ? "Pinterest" : isX ? "X" : "Instagram";
  const captionLimit = isPinterest ? 500 : isX ? 280 : isTikTok ? 4000 : isFacebook ? 63206 : isLinkedIn ? 3000 : INSTAGRAM_CAPTION_LIMIT;
  const noun = isLinkedIn || isX ? "post" : isPinterest ? "description" : "caption";
  const foldAt = isX ? 280 : isFacebook ? 125 : isLinkedIn ? 210 : FOLD_AT;
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState<Goal>("Engagement");
  const [tone, setTone] = useState<Tone>("Friendly");
  const [addEmojis, setAddEmojis] = useState(true);
  const [addCommentCta, setAddCommentCta] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const useCommentCta = addCommentCta && platform === "instagram";

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topicId = useId();
  const goalId = useId();
  const toneId = useId();
  const emojisId = useId();
  const commentCtaId = useId();
  const baseId = useId();

  // Generate captions based on templates
  const captions = useMemo(() => {
    const rawTemplates = TEMPLATES[goal][tone];
    const cleanedTopic = topic.trim() || "my newest project";

    // Shuffle deterministic order based on shuffleKey
    const list = [...rawTemplates];
    if (shuffleKey > 0) {
      // Simple seeded shuffle
      let seed = shuffleKey;
      for (let i = list.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor((seed / 233280) * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }

    return list.slice(0, 6).map((tmpl) => {
      const hookPart = addEmojis
        ? `${tmpl.hookEmoji}${tmpl.hook}`
        : tmpl.hook;
      const bodyLines = tmpl.body(cleanedTopic);

      let ctaPart = "";
      if (useCommentCta) {
        ctaPart = addEmojis
          ? `${tmpl.ctaEmoji ? tmpl.ctaEmoji.trim() + " " : ""}${tmpl.keywordCta}`
          : tmpl.keywordCta;
      } else {
        ctaPart = addEmojis
          ? `${tmpl.cta}${tmpl.ctaEmoji}`
          : tmpl.cta;
      }

      // Joined with real line breaks
      const fullText = [hookPart, ...bodyLines, ctaPart].join("\n\n");
      let text = fullText.replace(/Instagram/g, platformName);
      if (isFacebook) text = text.replace(/link in (my |the )?bio/gi, "link below");
      if (isLinkedIn) text = text.replace(/link in bio/gi, "link in the comments");
      if (isPinterest) {
        const toPinterest = (value: string) =>
          value.replace(/Instagram/g, "Pinterest").replace(/link in (my |the )?bio/gi, "tap the Pin for the link");
        text = toPinterest(fullText);
        let n = bodyLines.length;
        while (text.length > 500 && n > 1) {
          n -= 1;
          text = toPinterest([hookPart, ...bodyLines.slice(0, n), ctaPart].join("\n\n"));
        }
        if (text.length > 500) text = text.slice(0, 500);
      }
      if (isX) {
        text = text.replace(/link in bio/gi, "link below");
        if (text.length > 280) {
          const cut = text.slice(0, 279);
          const lastSpace = cut.lastIndexOf(" ");
          text = `${(lastSpace > 180 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
        }
      }
      return text;
    });
  }, [goal, tone, topic, addEmojis, useCommentCta, isFacebook, isLinkedIn, isPinterest, isX, platformName, shuffleKey]);

  async function handleCopy(index: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      setCopiedId(index);
      timerRef.current = setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      setCopiedId(null);
    }
  }

  function handleRegenerate() {
    setShuffleKey((prev) => prev + 1);
    setExpanded(false);
  }

  // At-a-glance stats, all derived from the captions above.
  const current = Math.min(selected, captions.length - 1);
  const selectedText = captions[current] ?? "";
  const lengths = captions.map((c) => c.length);
  const avgLength = lengths.length ? Math.round(lengths.reduce((s, n) => s + n, 0) / lengths.length) : 0;
  const shortest = lengths.length ? Math.min(...lengths) : 0;
  const longest = lengths.length ? Math.max(...lengths) : 0;
  const hookFits = captions.filter((c) => c.split("\n\n")[0].length <= foldAt).length;
  const fold = foldCaption(selectedText, foldAt);
  const selectedWords = selectedText.split(/\s+/).filter(Boolean).length;
  const usingDefaultTopic = !topic.trim();

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Controls */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 sm:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr]">
        <div className="min-w-0 sm:col-span-2 xl:col-span-1">
          <label htmlFor={topicId} className="block text-sm font-semibold">
            Topic or product
          </label>
          <div className="relative mt-2">
            <Lightbulb aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]" />
            <input
              id={topicId}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. productivity habits, my new ceramic mugs, digital marketing guide"
              className={`${field} pl-10`}
            />
          </div>
        </div>

        <div className="min-w-0">
          <label htmlFor={goalId} className="block text-sm font-semibold">
            Goal
          </label>
          <div className="relative mt-2">
            <Target aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]" />
            <select
              id={goalId}
              value={goal}
              onChange={(e) => setGoal(e.target.value as Goal)}
              className={`${field} pl-10`}
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="min-w-0">
          <label htmlFor={toneId} className="block text-sm font-semibold">
            Tone
          </label>
          <div className="relative mt-2">
            <MessageSquareQuote aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]" />
            <select
              id={toneId}
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className={`${field} pl-10`}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid min-w-0 gap-2 sm:col-span-2 sm:grid-cols-2 xl:col-span-3">
          <label htmlFor={emojisId} className={toggle}>
            <span className="inline-flex items-center gap-2">
              <Smile className="h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
              Add emojis
            </span>
            <input
              id={emojisId}
              type="checkbox"
              checked={addEmojis}
              onChange={(e) => setAddEmojis(e.target.checked)}
              className="sr-only"
            />
            <Switch on={addEmojis} />
          </label>

          {platform === "instagram" && (
            <label htmlFor={commentCtaId} className={toggle}>
              <span className="inline-flex min-w-0 items-center gap-2">
                <MessageCircle className="h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
                Add a comment-keyword CTA (Auto-DM style)
              </span>
              <input
                id={commentCtaId}
                type="checkbox"
                checked={addCommentCta}
                onChange={(e) => setAddCommentCta(e.target.checked)}
                className="sr-only"
              />
              <Switch on={addCommentCta} />
            </label>
          )}
        </div>
      </div>

      {/* Summary */}
      <div role="region" aria-labelledby={`${baseId}-sum`} className="min-w-0">
        <h3 id={`${baseId}-sum`} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />
          Your {noun} drafts
          <span className="rounded-md bg-[var(--poskoo-band)] px-2 py-0.5 text-xs font-semibold text-[var(--poskoo-violet)]">{goal} · {tone}</span>
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className={kpi}>
            <p className={kpiLabel}>Drafts</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{captions.length}</p>
            <p className="mt-1 text-xs text-[#3d3450]">Regenerate to reshuffle the order.</p>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>Avg. length</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{avgLength}<span className="text-base font-medium text-[#5f5873]"> chars</span></p>
            <p className="mt-1 text-xs tabular-nums text-[#3d3450]">Range {shortest}–{longest} of {captionLimit.toLocaleString("en-US")}.</p>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>Hook before “more”</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{hookFits}<span className="text-base font-medium text-[#5f5873]"> / {captions.length}</span></p>
            <div className="mt-2 flex gap-0.5" aria-hidden="true">
              {captions.map((_, i) => (
                <i key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < hookFits ? "var(--poskoo-green)" : "var(--poskoo-line)" }} />
              ))}
            </div>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>Call to action</p>
            <p className="mt-1 text-2xl font-bold text-[var(--poskoo-ink)]">{useCommentCta ? "Keyword" : "Standard"}</p>
            <p className="mt-1 text-xs text-[#3d3450]">{useCommentCta ? "Comment a word, get a DM." : isPinterest ? "Save, click or visit the link." : isLinkedIn ? "Comment, tag or link in the comments." : isX ? "Reply, repost or follow the link." : "Comment, tag or link in bio."}</p>
          </div>
        </div>
        {usingDefaultTopic && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm text-[#3d3450]">
            <PenLine className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
            <span>Add your topic or product above. Until then, the drafts use “my newest project” as a placeholder.</span>
          </p>
        )}
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Results */}
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 sm:p-4">
          <p className="mb-3 text-sm text-[#5f5873]">Pick a draft to preview it, or copy any card directly.</p>
          <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3" aria-label={`Generated ${noun}s`}>
            {captions.map((captionText, index) => {
              const charCount = captionText.length;
              const isOver = charCount > captionLimit;
              const isCopied = copiedId === index;
              const isSelected = current === index;
              const [hook, ...rest] = captionText.split("\n\n");

              return (
                <li
                  key={index}
                  className={`flex min-w-0 flex-col justify-between rounded-2xl border bg-[var(--poskoo-paper)] transition ${isSelected ? "border-[var(--poskoo-violet)] shadow-[0_0_0_1px_var(--poskoo-violet)]" : "border-[var(--poskoo-line)] hover:border-[#bdb4cf]"}`}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Preview ${noun} ${index + 1}`}
                    onClick={() => { setSelected(index); setExpanded(false); }}
                    className="block min-h-[7rem] w-full rounded-t-2xl p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--poskoo-violet)]"
                  >
                    <span className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">
                      <span className={`grid h-6 w-6 place-items-center rounded-full text-xs tabular-nums ${isSelected ? "bg-[var(--poskoo-ink)] text-white" : "bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]"}`}>{index + 1}</span>
                      {isSelected ? "In preview" : "Draft"}
                    </span>
                    <span className="block whitespace-pre-line break-words text-sm leading-relaxed text-[#3d3450]">
                      <b className="font-semibold text-[var(--poskoo-ink)]">{hook}</b>
                      {rest.length > 0 && `\n\n${rest.join("\n\n")}`}
                    </span>
                  </button>

                  <div className="mx-4 flex items-center justify-between gap-3 border-t border-[var(--poskoo-line)] py-3">
                    <span className="min-w-0 flex-1">
                      <span
                        className={`text-xs font-medium tabular-nums ${
                          isOver ? "text-[var(--poskoo-coral)]" : "text-[#3d3450]"
                        }`}
                      >
                        {charCount}/{captionLimit} chars
                      </span>
                      <span className="mt-1 block h-1 max-w-[9rem] overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
                        <i className="block h-full rounded-full bg-[var(--poskoo-green)]" style={{ width: `${Math.min(100, (charCount / captionLimit) * 100)}%` }} />
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopy(index, captionText)}
                      aria-label={isCopied ? "Copied" : `Copy ${noun} ${index + 1}`}
                      className={`inline-flex min-h-11 flex-none items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--poskoo-violet)] ${isCopied ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-ink)]"}`}
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Primary action + live preview */}
        <aside aria-labelledby={`${baseId}-prev`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <button
            type="button"
            onClick={() => handleCopy(current, selectedText)}
            disabled={!selectedText}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copiedId === current ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copiedId === current ? "Copied" : `Copy ${noun} ${current + 1}`}
          </button>
          <button type="button" onClick={handleRegenerate} className={`${ghostBtn} w-full`}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Regenerate
          </button>
          <span className="sr-only" aria-live="polite">{copiedId !== null ? "Copied to clipboard" : ""}</span>

          <div>
            <h4 id={`${baseId}-prev`} className="flex items-center justify-between gap-2 text-sm font-semibold">
              Feed preview
              <span className="text-xs font-medium tabular-nums text-[#5f5873]">{selectedText.length} chars · {selectedWords} words</span>
            </h4>
            <div className="mt-2 overflow-hidden rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-sm">
              <div className="flex items-center gap-2 p-3">
                <span className="h-7 w-7 rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]" aria-hidden="true"><span className="block h-full w-full rounded-full border-2 border-white bg-[var(--poskoo-band)]" /></span>
                <span className="text-xs font-semibold">your_account</span>
              </div>
              <div className="grid aspect-[16/7] place-items-center lg:aspect-[4/3] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--poskoo-violet)_22%,transparent),color-mix(in_srgb,var(--poskoo-peach)_35%,transparent))]" aria-hidden="true">
                <ImageIcon className="h-8 w-8 text-white/80" />
              </div>
              <div className="flex gap-3 px-3 pt-2.5 text-[var(--poskoo-ink)]" aria-hidden="true">
                <Heart className="h-5 w-5" /><MessageCircle className="h-5 w-5" /><Send className="h-5 w-5" />
              </div>
              <p className="max-h-72 overflow-y-auto whitespace-pre-line break-words p-3 pt-2 leading-5" aria-live="polite">
                <span className="font-semibold">your_account</span>{" "}
                {expanded || !fold.folded ? selectedText : fold.preview}
                {fold.folded && !expanded && (
                  <>
                    {"… "}
                    <button type="button" onClick={() => setExpanded(true)} className="min-h-6 font-medium text-[#5f5873] underline-offset-2 hover:underline">more</button>
                  </>
                )}
              </p>
            </div>
            <p className="mt-2 text-xs text-[#5f5873]">
              {isTikTok
                ? "Only the first line or so shows over the video before “more”. Keep the hook short."
                : isFacebook
                  ? "About the first 125 characters show before “See more” on mobile. Put the point first."
                  : isPinterest
                    ? `About the first ${foldAt} characters show before “… more” on Pinterest. That cut-off varies by device.`
                    : isX
                    ? "A post is capped at 280 characters on X, so long drafts are trimmed. Keep the point first."
                    : isLinkedIn
                    ? `About the first ${foldAt} characters show before “…see more” on LinkedIn. That cut-off varies by device.`
                    : `About the first ${foldAt} characters show before “… more” in the feed. That cut-off varies by device.`}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
