import fs from "fs";
import path from "path";

const APP_PATH = "F:/studenthub/studenthub-frontend/src/App.jsx";
const OUT_DIR = "F:/studenthub/studenthub-frontend/src";

const sections = [
  {
    out: "lib/format.js",
    lines: [41, 46],
    react: [],
    router: [],
    icons: [],
    shared: [
      "API",
      "formatDate",
      "initials",
      "Avatar",
      "notify",
      "sharePostLink",
      "FeedPost",
      "SkeletonCard",
      "PostView",
      "PublicProfile",
      "Profile",
      "Navbar",
      "LandingPage",
      "LoginPage",
      "RegisterPage",
      "HomePage",
      "MyPosts",
      "EditPost",
      "CreatePost",
      "ConfirmDialog",
      "ToastHost",
      "Toast",
      "ConfirmDialog",
      "initials",
      "Avatar",
      "formatDate",
      "notify",
      "sharePostLink",
    ],
  },
  {
    out: "components/Avatar.jsx",
    lines: [48, 63],
    react: [],
    router: [],
    icons: [],
    shared: [],
  },
  {
    out: "lib/share.js",
    lines: [65, 89],
    react: [],
    router: [],
    icons: [],
    shared: ["notify"],
  },
  {
    out: "components/Toast.jsx",
    lines: [91, 144],
    react: ["useState", "useEffect"],
    router: [],
    icons: ["Alert", "Check", "Close"],
    shared: [],
  },
  {
    out: "components/ConfirmDialog.jsx",
    lines: [145, 189],
    react: ["useEffect"],
    router: [],
    icons: ["Trash"],
    shared: [],
  },
  {
    out: "components/Navbar.jsx",
    lines: [804, 911],
    react: ["useState", "useEffect"],
    router: ["NavLink", "useNavigate"],
    icons: [
      "LogoMark",
      "Home",
      "Document",
      "User",
      "Plus",
      "Logout",
      "Menu",
      "Close",
      "ArrowRight",
    ],
    shared: ["initials", "Avatar"],
  },
  {
    out: "pages/Landing.jsx",
    lines: [912, 1080],
    react: [],
    router: ["useNavigate"],
    icons: [
      "LogoMark",
      "ArrowRight",
      "Check",
      "Bulb",
      "Code",
      "Users",
      "Pen",
      "Search",
      "Cloud",
    ],
    shared: [],
  },
  {
    out: "pages/Login.jsx",
    lines: [1081, 1192],
    react: ["useState"],
    router: ["useNavigate"],
    icons: ["LogoMark", "Alert", "Mail", "Lock", "Eye", "EyeOff", "ArrowRight"],
    shared: [],
  },
  {
    out: "pages/Register.jsx",
    lines: [1193, 1326],
    react: ["useState"],
    router: ["useNavigate"],
    icons: [
      "LogoMark",
      "Alert",
      "User",
      "Mail",
      "Lock",
      "Eye",
      "EyeOff",
      "ArrowRight",
    ],
    shared: [],
  },
  {
    out: "pages/Feed.jsx",
    lines: [1327, 1495],
    react: ["useRef", "useEffect"],
    router: ["useNavigate"],
    icons: ["Plus", "Search", "ChevronRight", "Inbox", "Check"],
    shared: ["FeedPost", "SkeletonCard"],
  },
  {
    out: "components/FeedPost.jsx",
    lines: [1496, 1632],
    react: [],
    router: [],
    icons: ["Calendar", "Heart", "Message", "Share", "Bookmark"],
    shared: ["Avatar", "formatDate", "sharePostLink"],
  },
  {
    out: "pages/Creat                     ePost.jsx",
    lines: [1633, 1801],
    react: ["useState"],
    router: ["useNavigate"],
    icons: ["ArrowRight", "Close", "ImageIcon"],
    shared: [],
  },
  {
    out: "pages/MyPosts.jsx",
    lines: [1802, 1884],
    react: [],
    router: ["useNavigate"],
    icons: ["Plus", "Pen", "Trash"],
    shared: ["FeedPost"],
  },
  {
    out: "pages/EditPost.jsx",
    lines: [1885, 2016],
    react: ["useState", "useEffect"],
    router: ["useParams", "useNavigate"],
    icons: ["ArrowRight"],
    shared: ["notify", "API"],
  },
  {
    out: "components/PostView.jsx",
    lines: [2017, 2343],
    react: ["useState", "useEffect"],
    router: ["useNavigate"],
    icons: ["Calendar", "Close", "Heart", "Message", "Share", "Bookmark"],
    shared: [
      "Avatar",
      "formatDate",
      "initials",
      "sharePostLink",
      "notify",
      "API",
    ],
  },
  {
    out: "components/PublicProfile.jsx",
    lines: [2344, 2532],
    react: ["useState", "useEffect"],
    router: ["useNavigate"],
    icons: ["ChevronLeft", "Inbox", "Heart", "Message"],
    shared: ["Avatar", "formatDate", "API"],
  },
  {
    out: "pages/Profile.jsx",
    lines: [2533, 2833],
    react: ["useState", "useEffect"],
    router: ["useNavigate"],
    icons: [
      "Users",
      "Pen",
      "Calendar",
      "Camera",
      "Document",
      "User",
      "Shield",
      "Alert",
      "Lock",
    ],
    shared: ["initials", "formatDate", "notify"],
  },
];

const ICON_NAMES = [
  "LogoMark",
  "ArrowRight",
  "ArrowLeft",
  "Bulb",
  "Code",
  "Users",
  "Pen",
  "Search",
  "Cloud",
  "Plus",
  "Home",
  "Document",
  "User",
  "Logout",
  "Menu",
  "Close",
  "Eye",
  "EyeOff",
  "Mail",
  "Lock",
  "ChevronLeft",
  "ChevronRight",
  "Trash",
  "Inbox",
  "Check",
  "Alert",
  "Calendar",
  "Image",
  "ImageIcon",
  "Sparkle",
  "Layers",
  "Message",
  "Camera",
  "Shield",
  "Heart",
  "Bookmark",
  "Share",
  "Dots",
];

async function extract() {
  const content = fs.readFileSync(APP_PATH, "utf8");
  const lines = content.split("\n");

  // Ensure output directories exist
  const dirs = ["lib", "components", "pages"];
  for (const d of dirs) {
    const p = path.join(OUT_DIR, d);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }

  for (const sec of sections) {
    const [start, end] = sec.lines;
    const bodyLines = lines.slice(start - 1, end);
    const body = bodyLines.join("\n");

    // Detect react hooks used
    const detectedReact = new Set(sec.react);
    const hookMatches = body.match(
      /\b(useState|useEffect|useRef|useCallback|useMemo|useNavigate|useParams|useLocation|useSearchParams)\b/g,
    );
    if (hookMatches) {
      for (const h of hookMatches) detectedReact.add(h);
    }

    // Detect icons used (whole word)
    const detectedIcons = new Set(sec.icons);
    for (const ic of ICON_NAMES) {
      const alias = ic === "ImageIcon" ? "Image" : null;
      const pattern = alias
        ? new RegExp(`\\b${ic}\\b|\\b${alias}\\b`)
        : new RegExp(`\\b${ic}\\b`);
      if (pattern.test(body)) detectedIcons.add(ic);
    }

    // Detect shared identifiers used (whole word)
    const detectedShared = new Set();
    const SHARED_MAP = {
      API: "../api/client.js",
      formatDate: "../lib/format.js",
      initials: "../components/Avatar.jsx",
      Avatar: "../components/Avatar.jsx",
      notify: "../components/Toast.jsx",
      sharePostLink: "../lib/share.js",
      FeedPost: "../components/FeedPost.jsx",
      SkeletonCard: "../pages/Feed.jsx",
      PostView: "../components/PostView.jsx",
      PublicProfile: "../components/PublicProfile.jsx",
      Profile: "../pages/Profile.jsx",
      Navbar: "../components/Navbar.jsx",
      LandingPage: "../pages/Landing.jsx",
      LoginPage: "../pages/Login.jsx",
      RegisterPage: "../pages/Register.jsx",
      HomePage: "../pages/Feed.jsx",
      MyPosts: "../pages/MyPosts.jsx",
      EditPost: "../pages/EditPost.jsx",
      CreatePost: "../pages/CreatePost.jsx",
      ConfirmDialog: "../components/ConfirmDialog.jsx",
      ToastHost: "../components/Toast.jsx",
      Toast: "../components/Toast.jsx",
    };
    for (const [id, p] of Object.entries(SHARED_MAP)) {
      if (new RegExp(`\\b${id}\\b`).test(body)) detectedShared.add(id);
    }

    // Build imports
    const importLines = [];

    // React
    if (detectedReact.size > 0) {
      importLines.push(
        `import { ${Array.from(detectedReact).sort().join(", ")} } from "react";`,
      );
    }

    // React-router
    if (sec.router.length > 0) {
      importLines.push(
        `import { ${sec.router.sort().join(", ")} } from "react-router-dom";`,
      );
    }

    // Icons
    if (detectedIcons.size > 0) {
      const iconImports = Array.from(detectedIcons)
        .sort()
        .map((ic) => {
          if (ic === "ImageIcon") return "Image as ImageIcon";
          return ic;
        })
        .join(", ");
      importLines.push(`import { ${iconImports} } from "../Icons.jsx";`);
    }

    // Shared
    const sharedImports = new Map();
    for (const id of detectedShared) {
      const p = SHARED_MAP[id];
      if (p) {
        if (!sharedImports.has(p)) sharedImports.set(p, []);
        sharedImports.get(p).push(id);
      }
    }
    for (const [p, ids] of sharedImports) {
      importLines.push(`import { ${ids.sort().join(", ")} } from "${p}";`);
    }

    // Remove empty lines at start of body
    const trimmedBody = body.replace(/^\n+/, "").replace(/\n+$/, "\n");

    const fileContent = `${importLines.join("\n")}\n\n${trimmedBody}`;
    const outPath = path.join(OUT_DIR, sec.out);
    fs.writeFileSync(outPath, fileContent);
    console.log(
      `Created ${sec.out} (${bodyLines.length} lines, ${importLines.length} imports)`,
    );
  }
}

extract().catch((e) => {
  console.error(e);
  process.exit(1);
});
