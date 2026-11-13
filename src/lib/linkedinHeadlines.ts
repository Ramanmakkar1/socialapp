export const HEADLINE_FORMULAS = [
  { id: "role-audience", label: "Role + audience" },
  { id: "result", label: "Result" },
  { id: "keywords", label: "Keywords" },
  { id: "mission", label: "Mission" },
  { id: "creator", label: "Creator" },
] as const;

export type HeadlineFormula = (typeof HEADLINE_FORMULAS)[number]["id"];
export type HeadlineFormulaFilter = HeadlineFormula | "all";

/** LinkedIn's hard headline limit. */
export const LINKEDIN_HEADLINE_MAX = 220;
/** Roughly how many headline characters stay visible in mobile feeds. */
export const LINKEDIN_HEADLINE_MOBILE_VISIBLE = 60;

export type HeadlineInput = {
  role: string;
  audience: string;
  result: string;
  skills: string;
};

const FALLBACK: HeadlineInput = {
  role: "Marketing Manager",
  audience: "B2B SaaS teams",
  result: "grow pipeline from LinkedIn",
  skills: "demand generation, LinkedIn strategy, content marketing",
};

type Fields = {
  role: string;
  audience: string;
  result: string;
  skills: string[];
};

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parseSkills(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((skill) => clean(skill))
        .filter(Boolean)
    ),
  ];
}

function fieldsFrom(input: HeadlineInput): Fields {
  const filled = {
    role: clean(input.role),
    audience: clean(input.audience),
    result: clean(input.result),
    skills: parseSkills(input.skills),
  };
  const empty =
    !filled.role && !filled.audience && !filled.result && filled.skills.length === 0;
  if (!empty) return filled;
  return {
    role: FALLBACK.role,
    audience: FALLBACK.audience,
    result: FALLBACK.result,
    skills: parseSkills(FALLBACK.skills),
  };
}

type Template = {
  needs: (keyof Fields)[];
  fill: (f: Fields) => string;
};

const TEMPLATES: Record<HeadlineFormula, Template[]> = {
  "role-audience": [
    { needs: ["role", "audience", "result"], fill: (f) => `${f.role} helping ${f.audience} ${f.result}` },
    { needs: ["role"], fill: (f) => (f.audience ? `${f.role} for ${f.audience}` : f.role) },
    { needs: ["role", "audience", "result"], fill: (f) => `${f.role} who helps ${f.audience} ${f.result}` },
    { needs: ["role", "audience", "result"], fill: (f) => `${f.role} · ${f.audience} · ${f.result}` },
  ],
  result: [
    { needs: ["role", "audience", "result"], fill: (f) => `I help ${f.audience} ${f.result} | ${f.role}` },
    { needs: ["role", "audience", "result"], fill: (f) => `${f.role} | I help ${f.audience} ${f.result}` },
    { needs: ["role", "audience", "result"], fill: (f) => `${f.result} for ${f.audience} — ${f.role}` },
    { needs: ["role", "audience", "result"], fill: (f) => `${f.audience}: ${f.result} with ${f.role}` },
  ],
  keywords: [
    { needs: ["role", "skills"], fill: (f) => `${f.role} | ${f.skills.slice(0, 3).join(" · ")}` },
    { needs: ["role", "skills"], fill: (f) => `${f.skills.slice(0, 3).join(" · ")} | ${f.role}` },
    { needs: ["role", "audience", "skills"], fill: (f) => `${f.role} for ${f.audience} | ${f.skills.slice(0, 2).join(" · ")}` },
    { needs: ["role", "audience", "skills"], fill: (f) => `${f.skills.slice(0, 2).join(" · ")} | ${f.role} helping ${f.audience}` },
  ],
  mission: [
    { needs: ["audience", "result"], fill: (f) => `Helping ${f.audience} ${f.result}` },
    { needs: ["audience", "result"], fill: (f) => `On a mission to help ${f.audience} ${f.result}` },
    { needs: ["role", "audience", "result"], fill: (f) => `${f.role} on a mission to help ${f.audience} ${f.result}` },
    { needs: ["role", "audience", "result"], fill: (f) => `Helping ${f.audience} ${f.result} | ${f.role}` },
  ],
  creator: [
    { needs: ["role", "result"], fill: (f) => `${f.role} sharing practical tips to ${f.result}` },
    { needs: ["audience", "result"], fill: (f) => `Creator helping ${f.audience} ${f.result}` },
    { needs: ["role", "audience", "result"], fill: (f) => `${f.role} creating content that helps ${f.audience} ${f.result}` },
    { needs: ["role", "audience", "result"], fill: (f) => `${f.role} sharing lessons on how to ${f.result} with ${f.audience}` },
  ],
};

function hasFields(fields: Fields, needs: (keyof Fields)[]): boolean {
  return needs.every((key) => {
    const value = fields[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
}

/** Fill the fixed headline templates for one formula, or every formula. */
export function generateHeadlines(
  input: HeadlineInput,
  formula: HeadlineFormulaFilter = "all"
): string[] {
  const fields = fieldsFrom(input);
  const formulas =
    formula === "all"
      ? HEADLINE_FORMULAS
      : HEADLINE_FORMULAS.filter((item) => item.id === formula);
  const headlines: string[] = [];
  for (const item of formulas) {
    for (const template of TEMPLATES[item.id]) {
      if (!hasFields(fields, template.needs)) continue;
      const headline = template.fill(fields).replace(/\s+/g, " ").trim();
      if (headline) headlines.push(headline);
    }
  }
  return [...new Set(headlines)];
}
