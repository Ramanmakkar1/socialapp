import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// Sources (all opened while writing, November 2026).
const SRC = {
  recTips: "https://creators.instagram.com/blog/instagram-recommendations-eligibility-tips-creators",
  hashtagLimit: "https://www.socialmediatoday.com/news/instagram-implements-new-limits-on-hashtag-use/808309/",
  altText: "https://help.instagram.com/iphone-app/503708446705527",
  igIndexing: "https://www.tubefilter.com/2025/07/18/instagram-indexing-update-google-search-results/",
  igIndexingRules: "https://www.afaqs.com/news/digital/search-engines-can-now-index-public-content-from-instagram-9483796",
  tiktokRecs: "https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you",
  ytHashtags: "https://support.google.com/youtube/answer/6390658",
  ytCaptions: "https://support.google.com/youtube/answer/2734796",
  pinTrends: "https://trends.pinterest.com/",
  googleTrends: "https://trends.google.com/trends/",
};

export const body: GuideBody = {
  intro: (
    <>
      <p>
        People don&apos;t only scroll anymore. They type &quot;easy dinner for two&quot; into TikTok, &quot;salon
        near me&quot; into Instagram and &quot;how to fix a leaky tap&quot; into YouTube. Every one of those searches
        is a chance for a stranger to find you without a lucky push from the feed.
      </p>
      <p>
        Social media SEO is how you take that chance. <strong>It comes down to using the words your audience
        searches for in the places each app reads, then posting enough on one topic that the app trusts you with
        it.</strong> This guide covers where those places are on Instagram, TikTok, YouTube, Pinterest and LinkedIn,
        how your posts can show up on Google, and how to tell if it&apos;s working.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-it-is",
      title: "What social media SEO means in 2026",
      body: (
        <>
          <p>There are two layers, and both matter:</p>
          <ul>
            <li>
              <strong>In-app search.</strong> Every big platform has a search bar. It matches what people type against
              the text it can read from your profile and posts, then ranks results by how people respond.
            </li>
            <li>
              <strong>Search engines.</strong> Public posts and profiles from several platforms can appear in Google
              results, so a good Reel or video can bring in searchers who never opened the app.
            </li>
          </ul>
          <p>
            Instagram says it plainly in its <Ext href={SRC.recTips}>tips for creators</Ext>: &quot;Search results are
            matched by text, so make sure you&apos;re including relevant keywords.&quot; TikTok has said the video
            information it uses for recommendations{" "}
            <Ext href={SRC.tiktokRecs}>&quot;might include details like captions, sounds, and hashtags&quot;</Ext>.
            Text is the bridge between what you make and what people search.
          </p>
          <Callout kind="tip" title="Keywords get you considered. Engagement gets you ranked.">
            <p>
              The right words make your post eligible to show up. Whether it stays near the top depends on whether
              people watch, save, share and tap through. SEO doesn&apos;t replace good content; it helps good content
              get found.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "find-keywords",
      title: "Find the words people actually search",
      body: (
        <>
          <p>You don&apos;t need a paid tool to start. Spend 20 minutes on this before you write a single caption:</p>
          <ol>
            <li>
              <strong>Use autocomplete.</strong> Type your topic into the search bar of each app and note the
              suggestions. They are built from real searches.
            </li>
            <li>
              <strong>Read the comments.</strong> Questions under popular posts in your niche are search terms in
              disguise: &quot;does this work for curly hair?&quot;, &quot;what&apos;s the cheapest option?&quot;
            </li>
            <li>
              <strong>Check seasons.</strong> Compare phrasings in <Ext href={SRC.googleTrends}>Google Trends</Ext>, and
              for visual topics like decor, recipes or style, browse <Ext href={SRC.pinTrends}>Pinterest Trends</Ext>.
            </li>
            <li>
              <strong>Write how people talk.</strong> &quot;Meal prep for night shift&quot; beats
              &quot;nutritional planning solutions&quot;. Add your city if you serve locals.
            </li>
          </ol>
          <p>
            End up with one main phrase per post and two or three close variations. That&apos;s enough. Repeating
            the same keyword ten times reads as spam to people and to apps.
          </p>
        </>
      ),
    },
    {
      id: "platform-by-platform",
      title: "Where to put keywords on each platform",
      body: (
        <>
          <GuideTable
            caption="Where each platform reads your text"
            head={["Platform", "Most important spots", "Also helps"]}
            rows={[
              ["Instagram", "Name field, handle, bio, captions", "Alt text, on-screen text, a few specific hashtags"],
              ["TikTok", "Captions, on-screen text, what you say", "Hashtags, sounds"],
              ["YouTube", "Title, description, spoken words", "Captions, chapters, a few hashtags"],
              ["Pinterest", "Pin title and description, board names", "Image text, the page you link to"],
              ["LinkedIn", "Headline, About section, post text", "Job titles, skills, company page"],
            ]}
          />

          <h3>Instagram</h3>
          <p>
            Instagram&apos;s <Ext href={SRC.recTips}>creator tips</Ext> list the spots: a handle or profile name
            &quot;related to the content of your posts&quot;, a bio with &quot;keywords about who you are and what your
            profile is about&quot;, and keywords and hashtags in captions, &quot;not the comments&quot;.
          </p>
          <ul>
            <li>
              <strong>Name field:</strong> this is separate from your handle. &quot;Maya | Vegan Meal Prep&quot; tells
              search what you cover. Brainstorm options with the{" "}
              <Link href="/tools/instagram-bio-generator">bio generator</Link>.
            </li>
            <li>
              <strong>Captions:</strong> put the main phrase in the first line, where it also works as a hook. Draft
              with the <Link href="/tools/instagram-caption-generator">caption generator</Link>, then make it sound like
              you.
            </li>
            <li>
              <strong>Alt text:</strong> you can write your own under Advanced settings when posting (see{" "}
              <Ext href={SRC.altText}>Instagram Help</Ext>). Describe the image for people using screen readers. If it
              naturally includes your topic, good, but write for people first.
            </li>
            <li>
              <strong>On-screen text:</strong> a short title on your Reel (&quot;3 low-light plants&quot;) helps
              viewers decide to stay and repeats your topic.
            </li>
          </ul>

          <h3>TikTok</h3>
          <p>
            Say your keyword out loud in the first seconds, show it as on-screen text and use it in the caption.
            TikTok confirms captions, sounds and hashtags are part of the <Ext href={SRC.tiktokRecs}>video
            information</Ext> it looks at. Many creators also turn on auto captions so the spoken words are visible as
            text for viewers watching on mute.
          </p>

          <h3>YouTube</h3>
          <p>
            YouTube is a search engine first. Put the phrase people search in the title, explain the video in the
            first lines of the description and add chapters for longer videos.{" "}
            <Ext href={SRC.ytCaptions}>Subtitles and captions</Ext> help you reach viewers who are deaf or hard of
            hearing and people who speak other languages, so add them or correct the automatic ones.
          </p>

          <h3>Pinterest</h3>
          <p>
            Pinterest works more like Google than like a feed: pins can keep getting found long after you post. Write a
            clear, keyword-led pin title and description, file pins on boards named for the topic, and link to a page
            that delivers what the pin promises.
          </p>

          <h3>LinkedIn</h3>
          <p>
            Your headline does most of the work in people search. &quot;Bookkeeper for Calgary trades
            businesses&quot; is easier to find than &quot;Helping businesses thrive&quot;. Use the same words in your
            About section and in posts, and keep your job title plain.
          </p>
        </>
      ),
    },
    {
      id: "hashtags",
      title: "The real role of hashtags now",
      body: (
        <>
          <p>
            Hashtags used to be the main way to get found. Today they are labels, not a reach boost, and platforms are
            cutting down on stuffing.
          </p>
          <ul>
            <li>
              <strong>Instagram:</strong> in December 2025 Instagram began limiting posts and Reels to{" "}
              <Ext href={SRC.hashtagLimit}>five hashtags in the caption</Ext>. Adam Mosseri had said earlier that
              hashtags don&apos;t increase reach but are &quot;a great way to let people know what a post is about&quot;.
            </li>
            <li>
              <strong>YouTube:</strong> if a video has <Ext href={SRC.ytHashtags}>more than 60 hashtags</Ext>, YouTube
              ignores all of them, and unrelated or misleading hashtags can get a video removed.
            </li>
            <li>
              <strong>TikTok:</strong> hashtags are one input among several. A few accurate ones help; a wall of
              trending tags that don&apos;t match the video doesn&apos;t.
            </li>
          </ul>
          <Callout kind="example" title="Five tags, used well">
            <p>
              For a Reel about low-light houseplants: #houseplants #lowlightplants #plantcare #apartmentplants
              #plantsforbeginners. Specific, on topic, no filler. The free{" "}
              <Link href="/tools/instagram-hashtag-generator">hashtag generator</Link> suggests sets like this from a
              topic.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "google-indexing",
      title: "Getting your social posts into Google",
      body: (
        <>
          <p>
            Since <strong>10 July 2025</strong>, Instagram allows search engines to show public photos and videos from
            eligible accounts, covering posts and Reels from 1 January 2020 onward (
            <Ext href={SRC.igIndexing}>Tubefilter</Ext>). Coverage of the rollout says eligible accounts are public
            professional (business or creator) accounts run by people over 18, and that you can opt out in your
            privacy settings (<Ext href={SRC.igIndexingRules}>afaqs</Ext>).
          </p>
          <p>What that means in practice:</p>
          <ul>
            <li>
              <strong>Switch to a professional account</strong> if you want your public posts to be eligible, and
              check the search engine setting under account privacy.
            </li>
            <li>
              <strong>Write captions that make sense out of context.</strong> On Google, your caption&apos;s first line
              is often all a searcher sees. &quot;Sooo good&quot; tells them nothing. &quot;15-minute garlic noodles
              for two&quot; does.
            </li>
            <li>
              <strong>Think in topics Google users search.</strong> How-tos, comparisons, local spots and reviews are
              the kind of posts people look for outside the app.
            </li>
          </ul>
          <p>
            Public YouTube videos and many public TikTok videos also show up in Google results, so the same rule
            applies: clear titles and descriptions that say exactly what the video covers.
          </p>
          <Callout kind="tip" title="Give searchers somewhere to go next">
            <p>
              A searcher who lands on one post should find a clear next step on your profile. A{" "}
              <Link href="/instagram-link-in-bio">link in bio page</Link> with your best resources, offers and booking
              link turns that visit into a click.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "profile-checklist",
      title: "Profile optimization checklist",
      body: (
        <>
          <p>Your profile is the page searchers judge you by. Go through this once per platform:</p>
          <GuideTable
            caption="Profile checklist"
            head={["Item", "What good looks like"]}
            rows={[
              ["Handle", "Short, easy to spell, related to your name or topic"],
              ["Name field", "Your name plus your main keyword"],
              ["Bio or headline", "Who you help, with what, and where if you are local"],
              ["Link", "A page with your best next steps, tagged so you can track clicks"],
              ["Highlights or playlists", "Grouped by topic, named with words people search"],
              ["Pinned posts", "Your three most useful posts on your main topic"],
              ["Consistency", "The same core words on every platform, so people recognise you"],
            ]}
          />
          <p>
            Tag the links in your profiles with the <Link href="/tools/instagram-utm-builder">UTM builder</Link> so
            your website analytics show which platform sent each visit.
          </p>
        </>
      ),
    },
    {
      id: "content-clusters",
      title: "Build content clusters, not one-off posts",
      body: (
        <>
          <p>
            Apps and search engines both learn what you are about from patterns. One post about sourdough won&apos;t
            make you the sourdough account. Twenty will. A content cluster is a set of posts around one main topic,
            each aimed at a different search.
          </p>
          <Callout kind="example" title="A cluster for a local dog trainer">
            <p>
              <strong>Main topic:</strong> puppy training in Edmonton.
              <br />
              <strong>Posts:</strong> how to stop puppy biting, crate training the first week, leash pulling fixes,
              best off-leash parks in Edmonton, what a puppy class covers, puppy training cost questions answered.
            </p>
          </Callout>
          <DayList
            days={[
              {
                title: "Pick one main topic.",
                body: <> The thing you want to be found for, in the words customers use.</>,
              },
              {
                title: "List 10 to 20 questions around it.",
                body: <> From autocomplete, comments, DMs and the questions customers ask you in person.</>,
              },
              {
                title: "Give each question its own post.",
                body: <> One question, one answer, the question&apos;s words in the first line of the caption.</>,
              },
              {
                title: "Link them together.",
                body: <> Group them in a highlight, playlist or board, and point to related posts in captions.</>,
              },
              {
                title: "Repurpose across platforms.",
                body: (
                  <>
                    {" "}A Reel can become a TikTok, a YouTube Short and a pin. Rewrite the caption for each app&apos;s
                    search habits.
                  </>
                ),
              },
            ]}
          />
          <p>
            Clusters are easier when you plan a month at a time. With Poskoo you can schedule the same series to
            Instagram, Facebook Pages, Threads, YouTube, LinkedIn, <Link href="/bluesky-scheduler">Bluesky</Link> and <Link href="/mastodon-scheduler">Mastodon</Link> from one calendar, and adjust
            each caption per platform (TikTok and Pinterest are waiting on platform approval). See the{" "}
            <Link href="/youtube-scheduler">YouTube scheduler</Link> and{" "}
            <Link href="/linkedin-scheduler">LinkedIn scheduler</Link> for details.
          </p>
          <InlineCta
            title="Plan a month of keyword-led posts"
            text="Schedule one content cluster across your channels from a single calendar. Free plan, no credit card."
            tool={{ href: "/tools/social-media-content-calendar", label: "Free content calendar" }}
          />
        </>
      ),
    },
    {
      id: "measure",
      title: "How to measure social SEO results",
      body: (
        <>
          <p>SEO is slow, so judge it over weeks, not days. Watch these signals:</p>
          <ul>
            <li>
              <strong>Non-follower reach.</strong> Instagram Insights splits reach between followers and
              non-followers. Keyword-led posts should pull more non-followers over time.
            </li>
            <li>
              <strong>Traffic sources.</strong> YouTube Analytics shows how many views come from YouTube search and
              which search terms brought them. Other apps show similar breakdowns in their creator tools.
            </li>
            <li>
              <strong>Profile visits and link clicks.</strong> If searchers like what they find, they visit your
              profile and tap your link. Tagged links show this in your website analytics.
            </li>
            <li>
              <strong>Google results.</strong> Search your main phrases on Google every few weeks and note whether
              your posts or profile appear.
            </li>
            <li>
              <strong>Saves and shares.</strong> They show a post is useful enough to come back to, which is what
              people searching want.
            </li>
          </ul>
          <p>
            Keep a simple monthly log: top five posts by non-follower reach, the keyword each one used, and what you
            will make next. The free <Link href="/tools/social-media-analytics-report">analytics report template</Link>{" "}
            and <Link href="/tools/instagram-engagement-rate-calculator">engagement rate calculator</Link> help you
            compare months.
          </p>
        </>
      ),
    },
    {
      id: "mistakes",
      title: "Social SEO mistakes to avoid",
      body: (
        <ul>
          <li>
            <strong>Keyword stuffing.</strong> A caption that repeats the same phrase reads as spam. Use it once or
            twice, naturally.
          </li>
          <li>
            <strong>Clever but vague captions.</strong> Jokes are fine after the first line. The first line should say
            what the post is.
          </li>
          <li>
            <strong>Hashtags in the comments.</strong> Instagram&apos;s own advice is to keep keywords and hashtags in
            the caption.
          </li>
          <li>
            <strong>Changing topics every week.</strong> Apps can&apos;t learn what you are about if you don&apos;t
            stick to anything.
          </li>
          <li>
            <strong>Copying other people&apos;s posts.</strong> Reposted content is limited in recommendations on
            Instagram. Make your own version.
          </li>
          <li>
            <strong>Forgetting the next step.</strong> Getting found is half the job. Give people a reason to follow,
            click or message you.
          </li>
        </ul>
      ),
    },
  ],
  sources: [
    { label: "Instagram for Creators: What creators need to know about recommendations", href: SRC.recTips },
    { label: "Social Media Today: Instagram implements new limits on hashtag use (December 2025)", href: SRC.hashtagLimit },
    { label: "Instagram Help Center: Add alt text to a post", href: SRC.altText },
    { label: "Tubefilter: Instagram indexing update and Google search results (July 2025)", href: SRC.igIndexing },
    { label: "afaqs: Search engines can now index public content from Instagram (July 2025)", href: SRC.igIndexingRules },
    { label: "TikTok Newsroom: How TikTok recommends videos #ForYou", href: SRC.tiktokRecs },
    { label: "YouTube Help: Hashtags on YouTube", href: SRC.ytHashtags },
    { label: "YouTube Help: Add subtitles and captions", href: SRC.ytCaptions },
    { label: "Pinterest Trends", href: SRC.pinTrends },
    { label: "Google Trends", href: SRC.googleTrends },
  ],
};
