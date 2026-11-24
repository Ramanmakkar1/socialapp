// /app/create = the "Create" nav item: the ideas board (Ideas tab) with drafts; Templates is /app/templates.
// It renders the Publish page in its ideas view, so the composer, drafts and idea actions stay shared.
import PublishPage from "../publish/page";

export const metadata = { title: "Create" };

type Params = Awaited<Parameters<typeof PublishPage>[0]["searchParams"]>;

export default async function CreatePage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  return PublishPage({ searchParams: Promise.resolve({ ...params, view: "ideas" }) });
}
