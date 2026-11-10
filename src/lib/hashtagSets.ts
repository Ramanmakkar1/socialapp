type Tiers = { broad: string[]; mid: string[]; niche: string[] };
export type HashtagMix = "balanced" | "broad" | "niche";

// Hand-curated starting points, not live popularity or reach rankings.
export const HASHTAG_SETS: Record<string, Tiers> = {
  fitness: {
    broad: ["fitness", "workout", "health", "exercise", "wellness", "training", "gym", "motivation", "strength", "sport"],
    mid: ["strengthtraining", "fitnessjourney", "gymroutine", "workoutideas", "fitnesstips", "personaltraining", "homeworkout", "mobilitytraining", "weighttraining", "activehabits"],
    niche: ["kettlebellworkout", "barbelltraining", "bodyweightcircuit", "beginnerstrength", "squatform", "deadliftpractice", "resistancebandworkout", "dumbbellroutine", "postworkoutstretch", "functionalstrength"],
  },
  food: {
    broad: ["food", "cooking", "recipes", "foodie", "homemade", "baking", "dinner", "lunch", "breakfast", "dessert"],
    mid: ["homecooking", "easyrecipes", "mealprep", "weeknightdinner", "seasonalcooking", "foodphotography", "recipeideas", "comfortfood", "freshingredients", "familymeals"],
    niche: ["onepotrecipes", "sheetpandinner", "sourdoughbaking", "plantbasedlunch", "freezermealprep", "smallbatchbaking", "pantryrecipes", "homemadepasta", "overnightoats", "roastedvegetables"],
  },
  travel: {
    broad: ["travel", "adventure", "explore", "vacation", "nature", "outdoors", "landscape", "holiday", "wanderlust", "tourism"],
    mid: ["travelplanning", "weekendgetaway", "roadtrip", "slowtravel", "citybreak", "traveltips", "hikingadventures", "budgettravel", "solotravel", "familytravel"],
    niche: ["carryonpacking", "scenictrainride", "coastalroadtrip", "mountainitinerary", "walkablecities", "localmarketfinds", "campingchecklist", "sunrisehike", "offseasontravel", "selfguidedtour"],
  },
  "real-estate": {
    broad: ["realestate", "homes", "property", "house", "design", "architecture", "interiors", "investment", "community", "living"],
    mid: ["househunting", "homebuying", "homeselling", "openhouse", "propertytour", "realestatetips", "firsttimebuyer", "homestaging", "neighborhoodguide", "listingphotos"],
    niche: ["condowalkthrough", "starterhomes", "townhouseliving", "prelistingchecklist", "curbappealideas", "downsizingtips", "buyerconsultation", "relocationguide", "closingdayprep", "stagingasmallspace"],
  },
  "beauty-salon": {
    broad: ["beauty", "hair", "skincare", "makeup", "salon", "nails", "style", "selfcare", "cosmetics", "haircare"],
    mid: ["salonlife", "hairinspiration", "skincareroutine", "nailart", "makeuptips", "haircolor", "beautyroutine", "hairstylist", "manicureideas", "beautytips"],
    niche: ["balayagecare", "curlyhaircut", "blondemaintenance", "gelnaildesign", "scalpcareroutine", "bridalhairtrial", "browshaping", "silkpresscare", "livedincolor", "fringestyling"],
  },
  photography: {
    broad: ["photography", "photo", "art", "creative", "portrait", "landscape", "camera", "visuals", "nature", "design"],
    mid: ["portraitphotography", "streetphotography", "photoediting", "naturallight", "phototips", "composition", "filmphotography", "productphotography", "photowalk", "behindthelens"],
    niche: ["windowlightportrait", "goldenhourportraits", "flatlaystyling", "offcameraflash", "longexposurephoto", "macrodetails", "manualfocuslens", "blackandwhiteportrait", "studiolightsetup", "contactsheet"],
  },
  "small-business": {
    broad: ["business", "entrepreneur", "smallbusiness", "community", "shopping", "creative", "marketing", "design", "handmade", "startup"],
    mid: ["shopsmall", "businessowner", "smallbusinesslife", "brandstory", "customerexperience", "productlaunch", "independentbusiness", "makerscommunity", "businessplanning", "shoplocal"],
    niche: ["packinganorder", "marketstallsetup", "smallbatchproducts", "makersprocess", "behindtheshop", "restockday", "customerthankyou", "popuppreparation", "handmadepackaging", "founderdiary"],
  },
  coaching: {
    broad: ["coaching", "growth", "learning", "goals", "mindset", "leadership", "career", "business", "wellbeing", "development"],
    mid: ["lifecoaching", "careercoaching", "leadershipskills", "goalsetting", "personaldevelopment", "coachingtips", "businesscoaching", "mindsetpractice", "professionaldevelopment", "accountability"],
    niche: ["weeklygoalreview", "careertransitionplan", "valuesexercise", "leadershipreflection", "boundarysettingtips", "coachingquestions", "habittrackingideas", "firsttimemanager", "interviewconfidence", "actionplanning"],
  },
  fashion: {
    broad: ["fashion", "style", "outfit", "clothing", "design", "shopping", "accessories", "streetwear", "wardrobe", "ootd"],
    mid: ["outfitideas", "personalstyle", "capsulewardrobe", "slowfashion", "vintagestyle", "everydaystyle", "stylingtips", "seasonalstyle", "wardrobeessentials", "outfitdetails"],
    niche: ["linenoutfitideas", "thriftedoutfit", "workwearcapsule", "denimstyling", "monochromelook", "layeringoutfits", "petitestyling", "statementaccessories", "wardroberestyling", "sneakeroutfit"],
  },
  ecommerce: {
    broad: ["ecommerce", "shopping", "business", "retail", "products", "design", "entrepreneur", "brand", "marketing", "onlineshop"],
    mid: ["productdiscovery", "onlineboutique", "productlaunch", "retailbusiness", "brandbuilding", "customerexperience", "productdemo", "shopindependent", "productdetails", "giftideas"],
    niche: ["unboxingdetails", "productcareguide", "sizeguidetips", "bundleideas", "newcollectionpreview", "orderpacking", "materialspotlight", "productcomparison", "restockpreview", "giftwrappingideas"],
  },
  restaurant: {
    broad: ["restaurant", "food", "dining", "foodie", "chef", "cooking", "lunch", "dinner", "dessert", "drinks"],
    mid: ["localdining", "restaurantlife", "menupreview", "chefspecial", "seasonalmenu", "brunchspot", "dinnerplans", "independentrestaurant", "kitchenstories", "foodpresentation"],
    niche: ["tastingmenupreview", "pastaspecial", "woodfiredkitchen", "chefstableexperience", "lunchspecials", "weekendbrunchmenu", "housemadedessert", "seasonalstarter", "openkitchenview", "signaturedish"],
  },
  wedding: {
    broad: ["wedding", "love", "celebration", "flowers", "photography", "style", "design", "bride", "groom", "party"],
    mid: ["weddingplanning", "weddinginspiration", "bridalstyle", "weddingflowers", "weddingdetails", "weddingvenue", "engagementphotos", "weddingdecor", "weddingphotography", "weddingideas"],
    niche: ["microwedding", "ceremonybackdrop", "tablescapedetails", "bridalbouquetideas", "firstlookphotos", "gardenweddingideas", "weddingtimelinetips", "elopementplanning", "vowbookdetails", "receptionlighting"],
  },
  pets: {
    broad: ["pets", "dogs", "cats", "animals", "puppy", "kitten", "petcare", "doglife", "catlife", "companions"],
    mid: ["dogtraining", "petgrooming", "adoptedpets", "petphotography", "dogwalking", "catenrichment", "puppytraining", "petfriendly", "petaccessories", "animalcompanions"],
    niche: ["looseleashpractice", "puppysocialisation", "catenrichmentideas", "scentgamesfordogs", "groomingroutine", "rescuedogdiary", "indoorcatplay", "seniorpetcare", "dogpuzzletoys", "kittenplaytime"],
  },
  "tech-saas": {
    broad: ["tech", "software", "startup", "business", "design", "technology", "product", "coding", "innovation", "digital"],
    mid: ["saas", "productdesign", "softwaredevelopment", "userexperience", "startuplife", "buildinpublic", "productupdates", "webdevelopment", "founderjourney", "workflowautomation"],
    niche: ["onboardingdesign", "featurewalkthrough", "changelogupdate", "dashboarddesign", "apidesigntips", "usabilitytesting", "saasproductdemo", "customerfeedbackloop", "releasenotes", "nocodeworkflow"],
  },
  "local-services": {
    broad: ["business", "local", "community", "homes", "services", "maintenance", "repair", "garden", "property", "craftsmanship"],
    mid: ["localbusiness", "homeservices", "propertymaintenance", "homeimprovement", "skilledtrades", "professionalcleaning", "landscapingideas", "repairservice", "neighborhoodbusiness", "servicebusiness"],
    niche: ["guttercleaningtips", "lawncareroutine", "taprepair", "endofleasecleaning", "hedgetrimming", "tilegroutcleaning", "seasonalhomecheck", "deckmaintenancetips", "windowcleaningday", "gardenbedprep"],
  },
};

function clean(tag: string): string {
  return tag.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9_]/g, "");
}

// Stable FNV-style hash gives each niche a repeatable order without Math.random.
function rank(value: string): number {
  let seed = 2166136261;
  for (const char of value) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return seed >>> 0;
}

export function buildHashtags(niche: string, opts: { count: number; mix: HashtagMix; extra?: string }): string[] {
  const sets = Object.hasOwn(HASHTAG_SETS, niche) ? HASHTAG_SETS[niche] : undefined;
  if (!sets) return [];
  const count = Number.isNaN(opts.count) ? 0 : Math.max(0, Math.min(30, Math.floor(opts.count)));
  const words = (opts.extra ?? "").trim().split(/\s+/).map(clean).filter(Boolean);
  const result = [...new Set([clean(words.join("")), words.length > 1 ? words[0] : ""].filter(Boolean))].slice(0, count);
  const tiers = ["broad", "mid", "niche"] as const;
  const pools = tiers.map((tier) => [...new Set(sets[tier].map(clean).filter(Boolean))]
    .sort((a, b) => rank(`${niche}:${a}`) - rank(`${niche}:${b}`) || a.localeCompare(b)));
  const weights = opts.mix === "broad" ? [3, 1.5, 1] : opts.mix === "niche" ? [1, 1.5, 3] : [1, 1, 1];
  const used = [0, 0, 0];
  while (result.length < count) {
    const available = pools.map((pool) => pool.filter((tag) => !result.includes(tag)));
    const next = tiers.map((_, i) => i).filter((i) => available[i].length > 0)
      .sort((a, b) => weights[b] / (used[b] + 1) - weights[a] / (used[a] + 1) || a - b)[0];
    if (next === undefined) break;
    result.push(available[next][0]);
    used[next]++;
  }
  return result;
}

export type SavedHashtagGroup = {
  id: string;
  name: string;
  hashtags: string[];
  created_at?: Date | string;
};

/** Accepts whitespace or comma-separated tags, with or without the leading #. */
export function parseHashtagGroup(input: string | string[] | null | undefined): string[] {
  const values = Array.isArray(input) ? input : (input ?? "").split(/[\s,]+/);
  const tags = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().replace(/^#+/, "").toLocaleLowerCase())
    .filter((value) => /^[\p{L}\p{N}_]*[\p{L}_][\p{L}\p{N}_]*$/u.test(value));
  return [...new Set(tags)];
}

export function hashtagGroupValidationError(name: string, hashtags: string[]): string | null {
  if (!name.trim()) return "Give the hashtag group a name.";
  if (name.trim().length > 80) return "Hashtag group names must be 80 characters or fewer.";
  if (hashtags.length === 0) return "Add at least one valid hashtag.";
  if (hashtags.length > 30) return "Use up to 30 hashtags per group.";
  if (hashtags.some((tag) => tag.length > 100)) return "Each hashtag must be 100 characters or fewer.";
  return null;
}

/** One-click insertion keeps existing text and never duplicates a hashtag already present. */
export function insertHashtags(caption: string, hashtags: string[]): string {
  const existing = new Set(
    [...caption.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((match) => match[1].toLocaleLowerCase()),
  );
  const additions = parseHashtagGroup(hashtags).filter((tag) => !existing.has(tag));
  if (additions.length === 0) return caption;
  const suffix = additions.map((tag) => `#${tag}`).join(" ");
  return caption.trim() ? `${caption.trimEnd()}\n\n${suffix}` : suffix;
}
