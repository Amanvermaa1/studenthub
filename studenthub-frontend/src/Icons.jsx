const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ size = 20, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...stroke}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function LogoMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.5 2.5 8 12 12.5 21.5 8 12 3.5Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M6 10.4v4.2c0 1.5 2.7 2.9 6 2.9s6-1.4 6-2.9v-4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M21.5 8v5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const ArrowRight = (p) => (
  <Svg {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
);

export const ArrowLeft = (p) => (
  <Svg {...p}>
    <path d="M20 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Svg>
);

export const Bulb = (p) => (
  <Svg {...p}>
    <path d="M9.5 18h5" />
    <path d="M10.5 21h3" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.1 1.1 1.8l.1.3h4.6l.1-.3c.1-.7.5-1.3 1.1-1.8A6 6 0 0 0 12 3Z" />
  </Svg>
);

export const Code = (p) => (
  <Svg {...p}>
    <path d="m8.5 7-5 5 5 5" />
    <path d="m15.5 7 5 5-5 5" />
    <path d="m13.5 4-3 16" />
  </Svg>
);

export const Users = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.2 6-5.2s6 1.9 6 5.2" />
    <path d="M16.5 5.4a3.2 3.2 0 0 1 0 5.7" />
    <path d="M18 14.4c2 .7 3 2.3 3 4.6" />
  </Svg>
);

export const Pen = (p) => (
  <Svg {...p}>
    <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3Z" />
    <path d="m14.5 7.5 3 3" />
  </Svg>
);

export const Search = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.2-4.2" />
  </Svg>
);

export const Cloud = (p) => (
  <Svg {...p}>
    <path d="M7 18.5a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 11.1a3.9 3.9 0 0 1-.9 7.4H7Z" />
  </Svg>
);

export const Plus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);

export const Home = (p) => (
  <Svg {...p}>
    <path d="m3.5 10.5 8.5-7 8.5 7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5V15h-5v5.5H5A1.5 1.5 0 0 1 3.5 19v-8.5Z" />
  </Svg>
);

export const Document = (p) => (
  <Svg {...p}>
    <path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V8l-4-4.5Z" />
    <path d="M14 3.5V8h4" />
    <path d="M9 13h6" />
    <path d="M9 16.5h4" />
  </Svg>
);

export const User = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20.5c0-3.7 3.4-6 7.5-6s7.5 2.3 7.5 6" />
  </Svg>
);

export const Logout = (p) => (
  <Svg {...p}>
    <path d="M9.5 20.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5h3.5" />
    <path d="m15.5 16.5 4.5-4.5-4.5-4.5" />
    <path d="M20 12H9.5" />
  </Svg>
);

export const Menu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </Svg>
);

export const Close = (p) => (
  <Svg {...p}>
    <path d="m6.5 6.5 11 11" />
    <path d="m17.5 6.5-11 11" />
  </Svg>
);

export const Eye = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOff = (p) => (
  <Svg {...p}>
    <path d="M10.7 6.2A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-3 3.7" />
    <path d="M6.4 7.8A17.3 17.3 0 0 0 2.5 12S6 18 12 18c1.4 0 2.7-.3 3.9-.9" />
    <path d="m4 4 16 16" />
  </Svg>
);

export const Mail = (p) => (
  <Svg {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.7 7.2 7.4 5.2a1.7 1.7 0 0 0 1.8 0l7.4-5.2" />
  </Svg>
);

export const Lock = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <path d="M12 14.5v2.5" />
  </Svg>
);

export const ChevronLeft = (p) => (
  <Svg {...p}>
    <path d="m14.5 6-6 6 6 6" />
  </Svg>
);

export const ChevronRight = (p) => (
  <Svg {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Svg>
);

export const Trash = (p) => (
  <Svg {...p}>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
    <path d="M6.5 7l.9 12.1A1.5 1.5 0 0 0 8.9 20.5h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
    <path d="M10.5 11v5.5" />
    <path d="M13.5 11v5.5" />
  </Svg>
);

export const Inbox = (p) => (
  <Svg {...p}>
    <path d="M5.6 4.5h12.8l2.6 8.6v5.4A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-5.4L5.6 4.5Z" />
    <path d="M3 13.1h4.6l1.4 2.4h6l1.4-2.4H21" />
  </Svg>
);

export const Check = (p) => (
  <Svg {...p}>
    <path d="m5.5 12.5 4.2 4.2 8.8-9.4" />
  </Svg>
);

export const Alert = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V13" />
    <path d="M12 16.3h.01" />
  </Svg>
);

export const Calendar = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3.5V6" />
    <path d="M16 3.5V6" />
  </Svg>
);

export const Image = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.7" />
    <path d="m4.5 17.5 4.7-4.7 3.3 3.3 3-3 4.5 4.5" />
  </Svg>
);

export const Sparkle = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
    <path d="M18.5 4v3" />
    <path d="M17 5.5h3" />
  </Svg>
);

export const Layers = (p) => (
  <Svg {...p}>
    <path d="m12 3.5 8.5 4.6L12 12.7 3.5 8.1 12 3.5Z" />
    <path d="m3.5 12.4 8.5 4.6 8.5-4.6" />
    <path d="m3.5 16.6 8.5 4.6 8.5-4.6" />
  </Svg>
);

export const Message = (p) => (
  <Svg {...p}>
    <path d="M20.5 11.6a7.6 7.6 0 0 1-8.2 7.6 8.8 8.8 0 0 1-2.6-.4L4.6 20.4l1.5-4.3a7.6 7.6 0 0 1 3.7-12.5 7.6 7.6 0 0 1 10.7 8Z" />
  </Svg>
);

export const Camera = (p) => (
  <Svg {...p}>
    <path d="M3 9.5A1.5 1.5 0 0 1 4.5 8h2.6l1.4-2.1h7l1.4 2.1h2.6A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-8Z" />
    <circle cx="12" cy="13.3" r="3.3" />
  </Svg>
);

export const Shield = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 5 6v6c0 4 3 7.2 7 8.5 4-1.3 7-4.5 7-8.5V6l-7-2.5Z" />
    <path d="m9.3 12.2 1.9 1.9 3.6-3.9" />
  </Svg>
);

export const Heart = (p) => (
  <Svg {...p}>
    <path d="M12 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.6 4.6 0 0 1 6.6 0l.7.7.7-.7a4.6 4.6 0 0 1 6.6 0 4.8 4.8 0 0 1 0 6.8Z" />
  </Svg>
);

export const Bookmark = (p) => (
  <Svg {...p}>
    <path d="M6.5 4h11a1 1 0 0 1 1 1v15.2l-6.5-4-6.5 4V5a1 1 0 0 1 1-1Z" />
  </Svg>
);

export const Share = (p) => (
  <Svg {...p}>
    <path d="M21 3 10.5 13.5" />
    <path d="M21 3l-6.8 18-3.7-7.5L3 9.8Z" />
  </Svg>
);

export const Dots = (p) => (
  <Svg {...p}>
    <circle cx="5.5" cy="12" r="1.3" />
    <circle cx="12" cy="12" r="1.3" />
    <circle cx="18.5" cy="12" r="1.3" />
  </Svg>
);

export const Fire = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
    <path d="M18.5 4v3" />
    <path d="M17 5.5h3" />
  </Svg>
);

export const Award = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 5.5v6" />
    <path d="M9 12h6" />
    <path d="M12 18.5V16" />
  </Svg>
);

export const UserCheck = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="3.8" />
    <path d="M4.5 20.5c0-3.7 3.4-6 7.5-6s7.5 2.3 7.5 6" />
    <path d="m15.5 13.5 2.5 2.5 4.5-5" />
  </Svg>
);

export const Sparkles = (p) => (
  <Svg {...p}>
    <path d="M12 3v1m0 16v1m9-9h-1m-16 0h-1m12.7-10.7l-.7.7m-10.6 0l-.7.7m10.6 10.6l-.7-.7m-10.6 0l-.7-.7" />
    <path d="M18 7v1m0 8v1m-3-3h1m-6 0h1m13.5-3.5l-.7.7m-10.6 0l-.7.7m10.6 10.6l-.7-.7m-10.6 0l-.7-.7" />
  </Svg>
);

export const Zap = (p) => (
  <Svg {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);

export const FileText = (p) => (
  <Svg {...p}>
    <path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V8l-4-4.5Z" />
    <path d="M9 13h6" />
    <path d="M9 16.5h4" />
  </Svg>
);

export const Edit = (p) => (
  <Svg {...p}>
    <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3Z" />
    <path d="m14.5 7.5 3 3" />
  </Svg>
);

export const Tag = (p) => (
  <Svg {...p}>
    <path d="M6.5 4h11a1 1 0 0 1 1 1v15.2l-6.5-4-6.5 4V5a1 1 0 0 1 1-1Z" />
  </Svg>
);

export const Bell = (p) => (
  <Svg {...p}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

export const UserPlus = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="3.8" />
    <path d="M4.5 20.5c0-3.7 3.4-6 7.5-6s7.5 2.3 7.5 6" />
    <path d="M18 14.5v4" />
    <path d="M16 16.5h4" />
  </Svg>
);
