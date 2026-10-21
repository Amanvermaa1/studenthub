/* =====================================================
   STATIC PAGE CONTENT
   About · Privacy · Terms · Guidelines · Help · Contact
   ===================================================== */

export const staticPages = {
  about: {
    title: "About StudentHub",
    subtitle:
      "A student-led knowledge network built so that the answers you need are already there.",
    updated: "Last updated 12 October 2026",
    sections: [
      {
        heading: "Why we built this",
        body: [
          "Every semester, thousands of students ask the same questions in a dozen different group chats, and every one of those answers gets lost in a scroll. Notes live in notebooks, code snippets live in somebody's private notes app, and revision material is scattered across drives nobody can find again.",
          "StudentHub puts all of it in one place: searchable, attachable, threaded and free. We wanted a place where asking a question is normal, where an answer from a senior is worth more than a textbook paragraph, and where nobody has to pay to read the solution.",
        ],
      },
      {
        heading: "What we believe",
        body: [
          "Knowledge should compound. Every answer written once should be findable forever, by the hundredth person who needs it. That is why we built for search first, for archiving rather than deleting, and for owning your own content — you can edit or remove anything you post, whenever you want.",
          "We also believe a study community should be calm. There are no engagement metrics here, no infinite feed and no ads. Trending is about what people are actually asking, not what keeps you scrolling.",
        ],
      },
      {
        heading: "Who we are",
        body: [
          "StudentHub is run by a small team of students and engineers who met while building study tools for their own batches. We work with university communities to run workshops, onboard new cohorts and keep the content quality high.",
          "The product is free and always will be for students. If your college wants to onboard a whole department, get in touch and we will set it up for you.",
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    subtitle:
      "What we collect, why we collect it, and the control you keep over your data.",
    updated: "Last updated 12 October 2026",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "Account information: your name, email address, a hashed password, an optional profile photo and an optional bio. We never store your password in a readable form.",
          "Content you create: posts, comments, replies, uploaded files, tags, bookmarks and the reactions you leave. This is the core of the service and it stays yours.",
          "Usage data: which pages you open, which posts you read, search terms you type and basic device/browser information. We use this to keep the service fast and to find broken features — never to sell your attention.",
        ],
      },
      {
        heading: "How we use your information",
        body: [
          "To run the service: authenticating you, rendering your profile, serving your posts and comments, delivering notifications and storing your attachments.",
          "To improve the service: understanding which subjects get asked about most, spotting search queries that return nothing useful, and measuring how fast pages load.",
          "To keep the community safe: enforcing our community guidelines, responding to abuse reports and blocking accounts that break the rules.",
        ],
      },
      {
        heading: "Files and third parties",
        body: [
          "Uploaded images and documents are stored on Cloudinary, which serves them through a global CDN. Cloudinary processes these files on our behalf under a data processing agreement and does not use them for its own purposes.",
          "We do not run advertising trackers, and we do not embed third-party advertising pixels. If we ever introduce analytics that require cookies, we will ask you first.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can edit your profile, change your email, delete any post or comment, and permanently delete your account at any time. Deleting your account removes your posts and comments from public view and schedules your personal data for erasure from our backups within 30 days.",
          "You can also export a copy of your data — posts, comments, profile and attachments — by emailing the privacy team. We respond to every request within 30 days.",
        ],
      },
      {
        heading: "Security",
        body: [
          "Passwords are hashed with bcrypt. Traffic is served over TLS. Access to production data is limited to the engineers who need it, and all access is logged.",
          "No system is perfect. If you find a vulnerability, report it to security@studenthub.app and we will fix it before disclosing it publicly.",
        ],
      },
    ],
  },

  terms: {
    title: "Terms of Service",
    subtitle:
      "The rules for using StudentHub. Short version: be decent, be useful, own your content.",
    updated: "Last updated 12 October 2026",
    sections: [
      {
        heading: "Your account",
        body: [
          "You need an accurate email address to register. One account per person — please do not operate multiple accounts to game likes, saves or trending.",
          "You are responsible for keeping your password to yourself and for everything that happens under your account. Tell us immediately if you think someone else has access to it.",
        ],
      },
      {
        heading: "Your content stays yours",
        body: [
          "You keep ownership of everything you post. You grant StudentHub a worldwide, non-exclusive, royalty-free licence to host, store, reproduce and display your content so the service can work — that licence ends when you delete the content or close your account.",
          "We never claim ownership of your posts and we never sell them to anyone.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "Post only material you have the right to share, and only material that is legal in your jurisdiction. Do not upload anything pirated, copyrighted without permission, or containing another person's private information.",
          "No spam, no self-promotion dressed up as an answer, no harassment, no hate speech, and no attempts to disrupt the service — including scraping, automation that ignores rate limits, or attempting to gain unauthorised access to any system.",
        ],
      },
      {
        heading: "Moderation",
        body: [
          "We may remove content that breaks these terms or our community guidelines, and we may suspend accounts that repeatedly break them. We try to act on every valid report within 24 hours.",
          "If we remove your content, we will normally tell you why. If we think we made a mistake, you can appeal by contacting us.",
        ],
      },
      {
        heading: "The service is free",
        body: [
          "StudentHub is provided free of charge. We do not sell premium features and there is no paid tier. If we ever introduce something paid, it will be optional and clearly marked — the core experience stays free.",
          "Because the service is free, we cannot promise uninterrupted availability. We aim for high uptime and will publish status updates at /help#status when something is degraded.",
        ],
      },
      {
        heading: "Changes to these terms",
        body: [
          "If we make a material change, we will update the date at the top of this page and notify active members by email before the change takes effect. Continuing to use StudentHub after that means you accept the updated terms.",
        ],
      },
    ],
  },

  guidelines: {
    title: "Community Guidelines",
    subtitle:
      "How we keep StudentHub useful, welcoming and worth coming back to.",
    updated: "Last updated 12 October 2026",
    sections: [
      {
        heading: "Be generous with what you know",
        body: [
          "Answer the question that was asked. If someone's problem is vague, ask one clarifying question before writing a long answer. A correct answer that nobody can use is not a good answer.",
          "When you are wrong, say so plainly and correct it. Everyone here was new once.",
        ],
      },
      {
        heading: "No academic dishonesty",
        body: [
          "Do not post exam questions that are currently live, leaked papers or content that is meant to be confidential. Sharing explanations and worked examples is encouraged; sharing answers to an ongoing assessment is not.",
          "If you spot content that breaks this rule, report it and we will remove it quickly.",
        ],
      },
      {
        heading: "Keep it on topic",
        body: [
          "This is a study community. Off-topic chat, memes, recruitment posts and self-promotion get removed. If you want to advertise something, contact us — we have a place for that.",
          "Do not repost the same content repeatedly, and do not drop promotional links without context. It is spam, and it is the fastest way to lose an account.",
        ],
      },
      {
        heading: "Be kind, no exceptions",
        body: [
          "No harassment, hate speech, slurs, threats or personal attacks — not in posts, not in comments, not in direct messages. Disagree with the idea, never with the person.",
          "Students of every background, gender, ability, religion and level of experience are welcome here. Harassment of any kind is removed and the account is usually suspended.",
        ],
      },
      {
        heading: "Report problems",
        body: [
          "Use the report action on any post or comment, or email us. Reports are reviewed by a human within 24 hours. Anonymous reports are fine — we will still act on them if we can verify the content.",
        ],
      },
    ],
  },

  help: {
    title: "Help Centre",
    subtitle: "Answers to the things people ask us most often.",
    updated: "Last updated 12 October 2026",
    sections: [
      {
        heading: "Account and sign in",
        body: [
          "I did not get the verification email — check your spam folder, then wait a couple of minutes and resend from the login page.",
          "I forgot my password — use the 'forgot password' link on the sign-in screen. Reset links expire after 30 minutes.",
          "I want to change my email — open Profile → Settings and update it. You will be asked to re-verify the new address.",
        ],
      },
      {
        heading: "Posts, comments and search",
        body: [
          "How do I format my post? — Markdown is supported: **bold**, *italic*, `code`, fenced code blocks with language tags for highlighting, tables, block quotes and horizontal rules. Hashtags become searchable tags automatically.",
          "Why can't I find my post? — the search index refreshes within a few seconds. If it is still missing, check that you are not signed in as a different account, then try searching by exact title.",
          "Can I edit or delete a post? — yes, from the post's own menu. Deleting is permanent and removes your comments with it.",
        ],
      },
      {
        heading: "Attachments",
        body: [
          "What can I upload? — images (JPG, PNG, GIF, WebP), documents (PDF, DOC, DOCX, XLS, PPT), plain text and archives (ZIP), up to 10 MB per file.",
          "Why did my upload fail? — the file was over the size limit, the format was not supported, or the connection dropped mid-upload. Try a smaller file or a more reliable connection.",
        ],
      },
      {
        heading: "Status",
        body: [
          "Service status — StudentHub is operating normally. When there is an incident we post an update here and on the community page. For the live feed of status, check this page first, then reach out via the contact form if you are affected.",
        ],
      },
    ],
  },

  contact: {
    title: "Contact Us",
    subtitle:
      "Talk to the team — support, university onboarding, partnerships or feedback.",
    updated: "We reply within one working day",
    sections: [
      {
        heading: "General support",
        body: [
          "Email support@studenthub.app for anything that does not fit below. The address reaches a real person — we do not use bots, and we do not hide behind a ticket number.",
          "For a faster answer, include your account email, what you were doing, what you expected and what happened instead, plus a screenshot if there is an error message.",
        ],
      },
      {
        heading: "Report abuse or content",
        body: [
          "Use the report action on the post or comment wherever possible — it attaches the content and the reporter's context automatically.",
          "If a report involves a threat of harm, contact us directly and mark it urgent in the subject line.",
        ],
      },
      {
        heading: "Universities and colleges",
        body: [
          "We onboard departments and student bodies for free: verified campus email domains, seeded subject folders, branded announcement channels and a workshop for your cohort.",
          "Email universities@studenthub.app with your institution name, the number of students you expect to onboard and the subjects you cover.",
        ],
      },
      {
        heading: "Press and partnerships",
        body: [
          "For press kits, partnerships, sponsorships or speaking enquiries, email hello@studenthub.app.",
        ],
      },
    ],
  },
};

export default staticPages;
