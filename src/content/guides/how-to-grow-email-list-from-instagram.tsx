import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// General guidance, not legal advice. Platform and legal facts link to Meta's developer docs and the FTC.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          To grow your email list from Instagram, offer one specific free thing your audience wants (a checklist,
          template, discount or mini-course), ask people to comment a keyword or tap your bio link to get it, collect
          their email with clear consent before you send it, and follow up with a short welcome sequence so new
          subscribers know why they joined.
        </strong>
      </p>
      <p>
        Instagram is good at finding you an audience. It is less good at letting you keep it: reach changes, accounts
        get locked, and your followers only see what the feed decides to show them. An email list is the part you own.
        This guide covers how to pick a lead magnet, every place on Instagram to promote it, how to collect emails in
        DMs without being pushy, the legal basics, and a three-email welcome sequence you can copy.
      </p>
    </>
  ),
  sections: [
    {
      id: "why-email",
      title: "Why build an email list if you already have Instagram followers?",
      body: (
        <>
          <p>
            Followers are rented. Instagram decides who sees each post, and that changes every time the ranking
            changes. An email address is a direct line: when you send something, it lands in the inbox of everyone who
            signed up and stayed subscribed.
          </p>
          <ul>
            <li>
              <strong>You own it.</strong> If your account is hacked, restricted or loses reach, your list is still
              there.
            </li>
            <li>
              <strong>It sells better for launches.</strong> A product launch, a class with limited spots or a sale
              ending Friday all work better when you can tell people directly.
            </li>
            <li>
              <strong>It works across platforms.</strong> The same list serves you if you later grow on YouTube,
              LinkedIn or a podcast.
            </li>
          </ul>
          <p>
            None of this means leaving Instagram. Instagram is where people find you. Email is where you keep in touch.
          </p>
        </>
      ),
    },
    {
      id: "lead-magnet",
      title: "Step 1: pick a lead magnet people actually want",
      body: (
        <>
          <p>
            A lead magnet is the free thing someone gets for joining your list. The best ones are small, specific and
            useful today. &quot;My newsletter&quot; is not a lead magnet. &quot;The 7-day meal plan for under $50&quot;
            is.
          </p>
          <GuideTable
            caption="Lead magnet ideas by niche"
            head={["Niche", "Lead magnet idea", "Keyword"]}
            rows={[
              ["Fitness coach", "A 4-week beginner workout plan as a PDF", "PLAN"],
              ["Food creator", "A weekly shopping list for five quick dinners", "LIST"],
              ["Hair or beauty salon", "10% off a first booking plus an aftercare guide", "BOOK"],
              ["Online shop", "Early access to the next drop", "EARLY"],
              ["Business coach", "A one-page pricing worksheet", "PRICING"],
              ["Photographer", "Lightroom presets with a how-to video", "PRESETS"],
              ["Real estate agent", "A first-time buyer checklist for your city", "BUYER"],
              ["Personal finance", "A simple budget spreadsheet template", "BUDGET"],
            ]}
          />
          <h3>Three tests for a good lead magnet</h3>
          <ul>
            <li>
              <strong>Is it connected to what you sell?</strong> A budget template attracts people who might buy a
              finance course. A random giveaway attracts people who want free stuff.
            </li>
            <li>
              <strong>Can someone use it in under 15 minutes?</strong> Quick wins build trust faster than a 60-page
              ebook nobody finishes.
            </li>
            <li>
              <strong>Can you describe it in one line?</strong> If it needs a paragraph, it is too vague for a Reel
              caption.
            </li>
          </ul>
          <Callout kind="tip" title="Start with a question you get every week">
            <p>
              Look at your DMs. If people keep asking &quot;what do you use for X?&quot;, a list of what you use is your
              first lead magnet. You already know the demand is real.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "where-to-promote",
      title: "Step 2: promote it everywhere on your profile",
      body: (
        <>
          <p>
            One post about your freebie won&apos;t build a list. Put it in every place a new visitor might look.
          </p>
          <ul>
            <li>
              <strong>Bio link:</strong> make the lead magnet the first link people see. A{" "}
              <Link href="/instagram-link-in-bio">link-in-bio page</Link> lets you lead with it while keeping your shop
              and booking links underneath. See{" "}
              <Link href="/guides/link-in-bio-best-practices">link-in-bio best practices</Link> for how to order them.
            </li>
            <li>
              <strong>Story link stickers:</strong> mention the freebie in Stories once or twice a week and add a link
              sticker. Show the inside of it, not just the cover.
            </li>
            <li>
              <strong>Reels:</strong> end a related Reel with a spoken call to action: &quot;Comment PLAN and I&apos;ll
              send you the full workout plan.&quot;
            </li>
            <li>
              <strong>Carousel last slide:</strong> after teaching something, the last slide offers the full version:
              &quot;Want all 30? Comment LIST.&quot;
            </li>
            <li>
              <strong>Comment keyword:</strong> the highest-converting spot, because the person has already raised their
              hand.
            </li>
            <li>
              <strong>DM keyword:</strong> tell people they can also DM you the word. Some prefer that to commenting in
              public.
            </li>
            <li>
              <strong>Highlights:</strong> save the Stories about your freebie to a <Link href="/tools/instagram-highlight-cover-maker">highlight</Link> called &quot;Free
              guide&quot; so new visitors find it any time.
            </li>
          </ul>
          <p>
            Tag each link with UTM parameters so your analytics shows which spot sends sign-ups. The{" "}
            <Link href="/tools/instagram-utm-builder">Instagram UTM builder</Link> creates them in a few seconds.
          </p>
        </>
      ),
    },
    {
      id: "comment-to-dm",
      title: "Step 3: collect emails with comment-to-DM",
      body: (
        <>
          <p>
            Comment-to-DM is the most natural way to collect emails on Instagram. Someone comments your keyword, gets
            an automatic DM, and the DM asks for their email before sending the link. The conversation happens where
            they already are.
          </p>
          <h3>What Meta allows</h3>
          <p>
            Meta&apos;s API lets a professional account send{" "}
            <Ext href="https://developers.facebook.com/docs/instagram-platform/private-replies/">one private reply to a
            person who commented</Ext>, within 7 days of the comment. Once they reply, you have a{" "}
            <Ext href="https://developers.facebook.com/docs/messenger-platform/policy/policy-overview">24-hour messaging
            window</Ext> to continue the conversation. That fits the email flow well: the first DM asks, they reply with
            their email, and you send the link straight away.
          </p>
          <h3>A sample flow</h3>
          <Callout kind="example" title="Comment-to-DM email flow">
            <p>
              <strong>Caption:</strong> &quot;Comment PLAN and I&apos;ll DM you the free 4-week plan.&quot;
            </p>
            <p>
              <strong>Public reply:</strong> &quot;Sent to your DMs! 📩&quot;
            </p>
            <p>
              <strong>First DM:</strong> &quot;Hey! Here&apos;s how to get the plan: reply with your best email and
              I&apos;ll send it right over. You&apos;ll also get my weekly training email. Unsubscribe any time.&quot;
            </p>
            <p>
              <strong>After they reply:</strong> &quot;Thanks! Here&apos;s your plan 👉 [link]. Start with week 1, day 1
              tomorrow and tell me how it goes.&quot;
            </p>
          </Callout>
          <p>
            Notice the consent line. The first DM says plainly that they&apos;ll get a weekly email and can leave any
            time. That sentence costs you almost nothing and keeps the list clean.
          </p>
          <h3>Doing this in Poskoo</h3>
          <p>
            <Link href="/instagram-auto-dm">Poskoo&apos;s comment-to-DM automation</Link> sends the DM when someone
            comments your keyword and can ask for an email before the link goes out, using Meta&apos;s official API.
            Captured contacts land in your leads list, which you can export as a CSV for your email tool. Email capture
            in DMs is listed on the Pro plan, which is launching soon; check{" "}
            <Link href="/pricing">pricing</Link> for what each plan includes. The{" "}
            <Link href="/instagram-dm-lead-generation">Instagram DM lead generation</Link> page walks through the setup.
          </p>
        </>
      ),
    },
    {
      id: "landing-page-vs-dm",
      title: "Landing page or DM: where should people sign up?",
      body: (
        <>
          <p>
            Both work. They suit different moments.
          </p>
          <GuideTable
            caption="Sign-up in DMs vs on a landing page"
            head={["", "Collect in DMs", "Send to a landing page"]}
            rows={[
              ["Effort for the follower", "Low: type an email in a chat they already have open", "Higher: open a browser, fill a form"],
              ["Best for", "Comment and DM keywords on Reels and carousels", "Bio link, Story stickers, ads"],
              ["Explaining the offer", "A few lines only", "Room for images, details and FAQs"],
              ["Consent wording", "In the DM message", "Next to the form and in your email tool"],
              ["Where emails end up", "Your leads list, then export to your email tool", "Directly in your email tool"],
            ]}
          />
          <p>
            Many accounts use both: comment keywords for posts, a landing page for the bio link. If you send people from
            a DM to a landing page, keep the page as short as the promise. Someone who asked for a checklist should see
            a form and the word &quot;checklist&quot;, not your life story. If you want a quick way to open a DM from a
            button or website, the <Link href="/tools/instagram-dm-link-generator">Instagram DM link generator</Link>{" "}
            makes an ig.me link.
          </p>
        </>
      ),
    },
    {
      id: "consent-and-law",
      title: "Consent and the law: the basics",
      body: (
        <>
          <p>
            Collecting an email is easy. Using it properly is where people get into trouble. This is general
            information, not legal advice.
          </p>
          <h3>In the US: CAN-SPAM</h3>
          <p>
            The FTC&apos;s{" "}
            <Ext href="https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business">CAN-SPAM
            compliance guide</Ext> sets out the main rules for commercial email, including:
          </p>
          <ul>
            <li>Don&apos;t use false or misleading header information; your From name and address must identify you.</li>
            <li>Don&apos;t use deceptive subject lines.</li>
            <li>Include a valid physical postal address.</li>
            <li>Tell people how to opt out, and honour opt-out requests within 10 business days.</li>
            <li>You stay responsible even if an email tool or agency sends the messages for you.</li>
          </ul>
          <h3>Outside the US</h3>
          <p>
            Other countries have stricter consent rules, such as GDPR in the EU and UK and CASL in Canada, which can
            require clear opt-in consent before you send marketing email. If you have subscribers in those places, check
            the rules or get advice before you start sending.
          </p>
          <Callout kind="warning" title="Never add people without asking">
            <p>
              Commenting a keyword is a request for the freebie, not permission to email them forever. Say in the DM
              that they&apos;re joining your list, and use an email tool with a working unsubscribe link.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "welcome-sequence",
      title: "Step 4: send a 3-email welcome sequence",
      body: (
        <>
          <p>
            New subscribers are most interested in the first few days. A short welcome sequence turns a freebie download
            into a relationship. Set it up once in your email tool and it runs for every new sign-up.
          </p>
          <DayList
            days={[
              {
                title: "Email 1, right away: deliver and welcome.",
                body: (
                  <>
                    {" "}Subject: &quot;Your 4-week plan is inside&quot;. Link the freebie again, say who you are in two
                    lines, and tell them what you&apos;ll send and how often.
                  </>
                ),
              },
              {
                title: "Email 2, two days later: a quick win.",
                body: (
                  <>
                    {" "}Subject: &quot;The one mistake in week 1&quot;. Share one tip that helps them use the freebie,
                    and ask them to reply with their goal. Replies tell you what to make next.
                  </>
                ),
              },
              {
                title: "Email 3, five days later: your story and offer.",
                body: (
                  <>
                    {" "}Subject: &quot;Why I made this plan&quot;. Share why you do what you do, one result from a
                    client or customer, and a soft link to your paid product, service or booking page.
                  </>
                ),
              },
            ]}
          />
          <p>
            After the sequence, move them to your regular email. Weekly or every two weeks is plenty for most small
            accounts. Consistency matters more than frequency.
          </p>
        </>
      ),
    },
    {
      id: "post-ideas",
      title: "Five post ideas that grow a list",
      body: (
        <>
          <p>
            Some posts collect far more emails than others. These five tend to work because the freebie is the natural
            next step after watching or reading.
          </p>
          <ul>
            <li>
              <strong>The partial list:</strong> a carousel with 5 of your 30 tips, and the full 30 for anyone who
              comments the keyword.
            </li>
            <li>
              <strong>The behind-the-scenes tool:</strong> a Reel showing the template or spreadsheet you use every
              week, with the copy offered free.
            </li>
            <li>
              <strong>The mistake fix:</strong> show one common mistake and the fix, then offer a checklist that covers
              the rest.
            </li>
            <li>
              <strong>The result plus recipe:</strong> show a finished result (a meal, a room, a client win) and offer
              the exact steps as the download.
            </li>
            <li>
              <strong>The early access offer:</strong> for shops and launches, &quot;comment EARLY to get the link 24
              hours before everyone else&quot;.
            </li>
          </ul>
          <h3>Mistakes that keep lists small</h3>
          <ul>
            <li>Mentioning the freebie once and never again. Most followers missed that post.</li>
            <li>Asking for too much: name, email, phone and job title. An email is enough to start.</li>
            <li>A slow delivery. If the link doesn&apos;t arrive within a minute or two, people forget they asked.</li>
            <li>Collecting emails and then not writing for months. Send the welcome sequence, then keep a steady rhythm.</li>
          </ul>
        </>
      ),
    },
    {
      id: "measure",
      title: "How to measure what's working",
      body: (
        <>
          <p>Track three numbers for each post or placement:</p>
          <ul>
            <li>
              <strong>Link clicks:</strong> how many people opened the link from the DM, bio or Story.
            </li>
            <li>
              <strong>Leads per post:</strong> how many emails a single Reel or carousel collected. This shows which
              topics attract subscribers, not just views.
            </li>
            <li>
              <strong>Conversion:</strong> what share of commenters ended up giving an email. If many people comment but
              few reply with an email, rework the DM: make the ask clearer or the freebie more specific.
            </li>
          </ul>
          <p>
            Then look further down the funnel. Which posts brought subscribers who opened your emails and bought? Those
            are the topics to repeat. For the full keyword setup, templates and Meta&apos;s rules, read the{" "}
            <Link href="/guides/instagram-comment-to-dm-automation-guide">comment-to-DM automation playbook</Link>.
          </p>
          <InlineCta
            title="Turn your next post into email sign-ups"
            text="Pick a keyword, write the DM and send your freebie to everyone who comments. Start on the Free plan, no credit card."
            tool={{ href: "/instagram-dm-lead-generation", label: "See DM lead generation" }}
          />
        </>
      ),
    },
  ],
  sources: [
    { label: "Meta for Developers: Instagram private replies to comments", href: "https://developers.facebook.com/docs/instagram-platform/private-replies/" },
    { label: "Meta for Developers: Messenger Platform and IG Messaging API policy overview", href: "https://developers.facebook.com/docs/messenger-platform/policy/policy-overview" },
    { label: "FTC: CAN-SPAM Act compliance guide for business", href: "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business" },
  ],
};
