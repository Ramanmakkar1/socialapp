function invalidRequired(n: number): boolean {
  return !Number.isFinite(n) || n < 0;
}

function invalidOptional(n: number | undefined): boolean {
  if (n === undefined) return false;
  return !Number.isFinite(n) || n < 0;
}

export function engagementRate(input: {
  likes: number;
  comments: number;
  saves?: number;
  shares?: number;
  base: number;
}): number | null {
  const { likes, comments, base } = input;
  if (base <= 0) return null;
  if (invalidRequired(likes) || invalidRequired(comments) || invalidRequired(base)) return null;
  if (invalidOptional(input.saves) || invalidOptional(input.shares)) return null;

  const saves = input.saves ?? 0;
  const shares = input.shares ?? 0;
  const total = likes + comments + saves + shares;
  return Math.round((total / base) * 100 * 100) / 100;
}

export function averagePerPost(totalInteractions: number, posts: number): number | null {
  if (posts <= 0 || !Number.isFinite(totalInteractions) || !Number.isFinite(posts)) return null;
  if (totalInteractions < 0) return null;
  return Math.round((totalInteractions / posts) * 100) / 100;
}
