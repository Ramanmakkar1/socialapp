import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import { ASSISTANT_GUIDES } from "@/lib/aiAssistantGuides";
import { AiAssistantGuidePage } from "@/components/AiAssistantGuidePage";

const guide = ASSISTANT_GUIDES.chatgpt;

export const metadata: Metadata = withSocial({
  title: { absolute: guide.title },
  description: guide.description,
  alternates: { canonical: guide.path },
});

export default function SchedulePostsWithChatgptPage() {
  return <AiAssistantGuidePage slug={guide.slug} />;
}
