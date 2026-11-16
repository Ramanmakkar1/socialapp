import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// Platform rules are taken from Meta's developer documentation (linked in sources).
// No invented statistics: results are described as things to measure, not promised numbers.

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>
          Instagram comment-to-DM automation sends a private message to anyone who comments a chosen keyword on your
          post or Reel. To run it well, use a Business or Creator account connected through Meta&apos;s official API,
          pick one short keyword per offer, send a helpful DM with the link, and stay inside Meta&apos;s rules: one
          private reply per comment, within 7 days, and follow-ups only after the person writes back.
        </strong>
      </p>
      <p>
        This playbook covers the whole setup: how the official API works and what it allows, how to choose keywords
        people will actually type, DM templates you can copy, when to ask for a follow or an email, the mistakes that
        get accounts in trouble, and how to tell whether it is working. It ends with a step-by-step setup in Poskoo.
      </p>
      <p>
        If you are still comparing tools, our{" "}
        <Link href="/guides/best-instagram-auto-dm-tools-2026">comparison of Instagram auto-DM tools</Link> lists prices
        and limits side by side. This guide is about running the automation once you have one.
      </p>
    </>
  ),
  sections: [
    {
      id: "how-it-works",
      title: "How does Instagram comment-to-DM automation work?",
      body: (
        <>
          <p>
            The flow has four steps. You publish a post that asks people to comment a keyword. Someone comments it. Your
            tool sees the comment through Meta&apos;s API and checks it against your rule. If it matches, the tool sends
            that person a private message, usually with a link, a file or a question.
          </p>
          <p>
            Meta calls this a <strong>private reply</strong>: a business answering a public comment with a message in
            the commenter&apos;s inbox. It is a normal, documented feature of the Instagram API, not a workaround.
          </p>
          <h3>The rules Meta sets</h3>
          <p>
            These come from Meta&apos;s own developer documentation, so every legitimate tool works within them:
          </p>
          <ul>
            <li>
              <strong>Professional accounts only.</strong> Private replies are available to Instagram Business and
              Creator accounts. Switching a personal account is free in the Instagram app.
            </li>
            <li>
              <strong>One private reply per comment, within 7 days.</strong> According to Meta&apos;s{" "}
              <Ext href="https://developers.facebook.com/docs/instagram-platform/private-replies/">private replies
              documentation</Ext>, you can send a single message to a person about their comment, and it must go out
              within 7 days of the comment.
            </li>
            <li>
              <strong>Follow-ups need a reply first.</strong> Once the person answers your DM, a standard messaging
              window opens. Meta&apos;s{" "}
              <Ext href="https://developers.facebook.com/docs/messenger-platform/policy/policy-overview">messaging
              policy</Ext> says that window lasts 24 hours for most user actions.
            </li>
            <li>
              <strong>Say it is automated where required.</strong> Meta&apos;s{" "}
              <Ext href="https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api">Instagram
              messaging docs</Ext> require automated chat experiences to disclose that they are automated when the law
              requires it, and recommend doing so anyway.
            </li>
          </ul>
          <Callout kind="warning" title="Never hand over your password">
            <p>
              A tool that uses the official API connects through Meta&apos;s login screen. If a service asks for your
              Instagram password or works by &quot;logging in as you&quot;, it is scraping, and that is how accounts get
              limited.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "choose-keywords",
      title: "How to choose keywords people will type",
      body: (
        <>
          <p>
            The keyword is the whole user experience. If it is long, unclear or easy to misspell, people comment
            something close and get nothing. Good keywords share four traits: they are short, they say what the person
            gets, they are not common words, and they read well in capitals.
          </p>
          <GuideTable
            caption="Keyword ideas by use case"
            head={["Use case", "Keyword", "Variants to add", "What the DM sends"]}
            rows={[
              ["Free guide or checklist", "GUIDE", "GUIDES, guide pls", "Link to the PDF or page"],
              ["Product from the post", "SHOP", "LINK, LINKS", "Product page with a UTM tag"],
              ["Pricing question", "PRICE", "PRICES, COST", "Price list or booking page"],
              ["Discount", "CODE", "DISCOUNT", "The code and where to use it"],
              ["Event or webinar", "JOIN", "SIGNUP, SEAT", "Registration link"],
              ["Recipe or template", "RECIPE", "RECIPES, TEMPLATE", "Full recipe or template file"],
              ["Booking a call", "CALL", "BOOK", "Calendar link and a short question"],
            ]}
          />
          <h3>Plan for variants</h3>
          <p>
            People type plurals, add emoji or write the keyword in a sentence. In Poskoo a rule can hold up to 10
            keywords, so add the obvious variations (GUIDE and GUIDES, LINK and LINKS) instead of hoping everyone types
            it your way.
          </p>
          <h3>Exact or contains?</h3>
          <p>
            <strong>Contains</strong> fires when the keyword appears as its own word anywhere in the comment, so
            &quot;can I get the GUIDE please&quot; works. <strong>Exact</strong> fires only when the whole comment is
            the keyword. Use contains by default. Switch to exact when your keyword is an everyday word, such as
            &quot;YES&quot; or &quot;LOVE&quot;, that would otherwise trigger on ordinary comments.
          </p>
          <p>
            Before you publish, paste a few realistic comments into the{" "}
            <Link href="/tools/instagram-comment-keyword-tester">comment keyword tester</Link> to see which ones would
            match.
          </p>
          <Callout kind="tip" title="Say the keyword three times">
            <p>
              Put it in the first line of the caption, on the cover or first frame, and out loud in a Reel. People skim,
              and a keyword buried at the end of a caption gets missed.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "dm-templates",
      title: "DM templates you can copy",
      body: (
        <>
          <p>
            A good automated DM reads like a quick note from a person: it thanks them, delivers what was promised in
            the first two lines, and gives one easy next step. Keep it short. The link is the point.
          </p>
          <p>
            Poskoo replaces <code>{"{{username}}"}</code> with the commenter&apos;s handle and <code>{"{{link}}"}</code>{" "}
            with your URL. A short public reply under the comment (&quot;Sent, check your DMs&quot;) also helps, because
            it shows other viewers the offer is real.
          </p>
          <Callout kind="example" title="1. Free guide">
            <p>
              Hey {"{{username}}"}, thanks for commenting! Here&apos;s the 5-step pricing guide: {"{{link}}"}
            </p>
            <p>Which step are you stuck on right now? Reply and I&apos;ll point you to the right page.</p>
            <p>
              <strong>Public reply:</strong> Sent to your DMs!
            </p>
          </Callout>
          <Callout kind="example" title="2. Product link">
            <p>
              Hi {"{{username}}"}! Here&apos;s the linen shirt from the video: {"{{link}}"}
            </p>
            <p>It runs slightly large, so most people size down. Any questions about fit or shipping, just reply here.</p>
            <p>
              <strong>Public reply:</strong> Link is in your inbox.
            </p>
          </Callout>
          <Callout kind="example" title="3. Price request">
            <p>
              Hey {"{{username}}"}, thanks for asking. Our 1:1 sessions start at the prices on this page: {"{{link}}"}
            </p>
            <p>If you tell me what you&apos;re working on, I can suggest the right package.</p>
            <p>
              <strong>Public reply:</strong> Just sent you the details.
            </p>
          </Callout>
          <Callout kind="example" title="4. Event signup">
            <p>
              You&apos;re in, {"{{username}}"}! Grab your seat for Thursday&apos;s free workshop here: {"{{link}}"}
            </p>
            <p>It starts at 6 pm ET and the replay goes to everyone who registers.</p>
            <p>
              <strong>Public reply:</strong> Signup link sent!
            </p>
          </Callout>
          <p>
            Preview how a message will look in the inbox with the free{" "}
            <Link href="/tools/instagram-comment-to-dm-preview">comment-to-DM preview tool</Link>, or browse ready-made{" "}
            <Link href="/instagram-auto-dm/templates">auto-DM templates</Link> for lead magnets, products and events.
          </p>
          <Callout kind="tip" title="End with a question">
            <p>
              Your first DM is the one private reply Meta allows for that comment. A question gives the person a reason to
              answer, and their answer opens the window for a real conversation.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "follow-and-email",
      title: "Should you ask for a follow or an email first?",
      body: (
        <>
          <p>
            Gates turn a comment into something more lasting, but every extra step loses some people. Use them on
            purpose.
          </p>
          <h3>Follow gate</h3>
          <p>
            With <strong>Require follow</strong>, the link is only sent once the person follows you. It works best
            when most commenters are new viewers from a Reel that travelled outside your audience. Say it in the
            caption (&quot;Follow and comment BONUS&quot;) so nobody feels tricked.
          </p>
          <h3>Email capture</h3>
          <p>
            With <strong>Ask for email first</strong>, the first DM asks for an email address, and the link arrives once
            they reply with it. Poskoo saves the address in Leads with the post and keyword that brought it in, and you
            can export the list as a CSV. Email capture in DMs is listed with the Pro plan, which is launching soon, so
            check <Link href="/pricing">pricing</Link> for what your plan includes.
          </p>
          <p>
            If you collect emails for marketing, follow the law where you and your subscribers live. In the US the FTC&apos;s{" "}
            <Ext href="https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business">CAN-SPAM
            guide</Ext> covers the basics, such as honest sender details and an easy way to unsubscribe.
          </p>
          <GuideTable
            caption="Which gate to use"
            head={["Goal", "Gate", "Why"]}
            rows={[
              ["Grow followers from a viral Reel", "Require follow", "Turns one-time viewers into followers."],
              ["Build a list you own", "Ask for email", "An email list does not depend on reach."],
              ["Sell a product today", "No gate", "Fewer steps means more clicks to the shop."],
              ["Answer price questions", "No gate", "People asking for prices want a fast answer."],
            ]}
          />
        </>
      ),
    },
    {
      id: "what-not-to-do",
      title: "What not to do",
      body: (
        <>
          <p>
            Automation makes good habits faster and bad habits louder. Avoid these:
          </p>
          <ul>
            <li>
              <strong>Messaging people who didn&apos;t ask.</strong> Only reply to people who commented or messaged
              first. Cold DMs at scale are spam, whatever tool sends them.
            </li>
            <li>
              <strong>Promising one thing and sending another.</strong> If the caption says &quot;free checklist&quot;,
              do not send a sales page. People report messages that feel like a bait and switch.
            </li>
            <li>
              <strong>Unrelated keywords.</strong> &quot;Comment YES for a surprise&quot; on every post trains people to
              comment without reading. It also fills your comments with one word, which tells new viewers nothing.
            </li>
            <li>
              <strong>Buying comments or joining comment pods.</strong> Fake comments trigger your automation, cost you
              DMs and add nothing. Instagram&apos;s{" "}
              <Ext href="https://creators.instagram.com/recommendations-and-Originality">recommendation guidelines</Ext>{" "}
              are built to reward original content people actually respond to.
            </li>
            <li>
              <strong>Sending several messages in a row.</strong> Meta allows one private reply per comment. Put
              everything important in that one message.
            </li>
            <li>
              <strong>Hiding the robot.</strong> A short line such as &quot;(automated reply, a human reads every
              answer)&quot; keeps trust and meets Meta&apos;s disclosure guidance.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "posts-that-get-keyword-comments",
      title: "Which posts get the most keyword comments?",
      body: (
        <>
          <p>
            The automation only works if people comment. The posts that pull keyword comments usually promise
            something specific that is too long or too useful to fit in the caption.
          </p>
          <h3>Formats that fit</h3>
          <ul>
            <li>
              <strong>The teaser Reel:</strong> show the result (a finished room, a recipe, a dashboard) and offer the
              full steps by DM.
            </li>
            <li>
              <strong>The carousel with a missing slide:</strong> give five tips and offer the full checklist or
              template as the sixth.
            </li>
            <li>
              <strong>The product post:</strong> show the item in use and offer the link, sizes or price by DM.
            </li>
            <li>
              <strong>The event post:</strong> announce a workshop, live or launch and send the signup link.
            </li>
          </ul>
          <h3>Caption lines you can adapt</h3>
          <Callout kind="example" title="Sample calls to action">
            <p>&quot;Comment GUIDE and I&apos;ll send you the full 7-step checklist.&quot;</p>
            <p>&quot;Want the template I used? Comment TEMPLATE and it&apos;s yours.&quot;</p>
            <p>&quot;Comment SHOP for the link, it&apos;s back in stock in all sizes.&quot;</p>
            <p>&quot;Comment JOIN to save your seat for Thursday&apos;s free class.&quot;</p>
          </Callout>
          <p>
            Each line names the keyword, says what the person gets and makes it feel quick. Avoid vague promises such as
            &quot;comment for a surprise&quot;: people comment more when they know exactly what arrives in their inbox.
          </p>
        </>
      ),
    },
    {
      id: "measure-results",
      title: "How to measure whether it works",
      body: (
        <>
          <p>
            Comments alone are not the goal. Track the funnel from comment to outcome:
          </p>
          <GuideTable
            caption="Comment-to-DM funnel metrics"
            head={["Metric", "What it tells you", "If it is low"]}
            rows={[
              ["Keyword comments", "Did the offer and call to action land?", "Make the offer more specific; show the keyword on screen."],
              ["DMs sent", "Did the rule match what people typed?", "Add variants; switch exact to contains."],
              ["Link clicks", "Was the DM clear and the link worth it?", "Put the link in the first two lines."],
              ["Leads or sales", "Did the destination convert?", "Fix the landing page, not the DM."],
            ]}
          />
          <p>
            Poskoo counts DMs sent, link clicks and leads collected per rule and per post on the Activity page. For
            clicks in your own analytics, add UTM tags to the link with the free{" "}
            <Link href="/tools/instagram-utm-builder">Instagram UTM builder</Link>. To estimate what a campaign could
            bring in, try the <Link href="/tools/instagram-comment-to-dm-calculator">comment-to-DM calculator</Link>.
          </p>
          <Callout kind="tip" title="Compare like with like">
            <p>
              Judge a keyword post against your other posts in the same format, not against your best post ever. Keep a
              simple note of keyword, offer, comments and clicks for each campaign so patterns show up after a few
              weeks.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "setup-in-poskoo",
      title: "Set it up in Poskoo, step by step",
      body: (
        <>
          <p>
            Here is the full setup. It takes about ten minutes the first time and two minutes after that.
          </p>
          <DayList
            days={[
              {
                title: "Step 1: Connect Instagram.",
                body: (
                  <>
                    {" "}Connect a Business or Creator account through Meta&apos;s official login and allow message
                    access. Poskoo never asks for your password.
                  </>
                ),
              },
              {
                title: "Step 2: Create a rule.",
                body: (
                  <>
                    {" "}Open Auto-DM and click New automation, or start from a template. Name the rule after the offer
                    so you can find it later.
                  </>
                ),
              },
              {
                title: "Step 3: Add keywords.",
                body: (
                  <>
                    {" "}Type up to 10 keywords separated by commas and choose contains or exact match. Test them in the{" "}
                    <Link href="/tools/instagram-comment-keyword-tester">keyword tester</Link>.
                  </>
                ),
              },
              {
                title: "Step 4: Pick triggers.",
                body: (
                  <>
                    {" "}Tick comments on your posts, replies to your Stories, or both. A keyword sent in a DM can also
                    trigger the reply, once per conversation.
                  </>
                ),
              },
              {
                title: "Step 5: Write the DM.",
                body: (
                  <>
                    {" "}Write up to 1,000 characters with the {"{{username}}"} and {"{{link}}"} tokens and paste your
                    link. Optionally tick Ask for email first or Require follow.
                  </>
                ),
              },
              {
                title: "Step 6: Attach it to a post and publish.",
                body: (
                  <>
                    {" "}Pick an existing post or Reel, or schedule a new one with the{" "}
                    <Link href="/instagram-scheduler">Instagram scheduler</Link>. A rule attached to a scheduled post
                    switches on when the post goes live.
                  </>
                ),
              },
            ]}
          />
          <p>
            The Free plan includes 500 auto-DMs a month, which is plenty to test a few keyword posts. If something
            doesn&apos;t fire, the <Link href="/help/auto-dm-instagram-comments">auto-DM setup help</Link> and the{" "}
            <Link href="/help/instagram-auto-dm-not-working">troubleshooting page</Link> cover the usual causes.
          </p>
          <InlineCta
            title="Send your link to everyone who comments"
            text="Connect Instagram, add a keyword rule and Poskoo DMs every matching commenter through Meta's official API. Free plan, no credit card."
            tool={{ href: "/instagram-auto-dm", label: "See Instagram auto-DM" }}
          />
        </>
      ),
    },
  ],
  sources: [
    { label: "Meta for Developers: Instagram private replies", href: "https://developers.facebook.com/docs/instagram-platform/private-replies/" },
    { label: "Meta for Developers: Messenger Platform and IG Messaging API policy", href: "https://developers.facebook.com/docs/messenger-platform/policy/policy-overview" },
    { label: "Meta for Developers: Instagram messaging API", href: "https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api" },
    { label: "Instagram Creators: Recommendations and originality", href: "https://creators.instagram.com/recommendations-and-Originality" },
    { label: "FTC: CAN-SPAM Act compliance guide for business", href: "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business" },
  ],
};
