// The bold look for the game hub and the party games (Rith, 17 Oct 2026):
// thick dark outlines, hard offset shadows and bright colors, in AROM's ink.

export const BOLD = {
  // A card with an outline and a hard shadow.
  card: "rounded-[26px] border-[2.5px] border-[#14221f] shadow-[5px_5px_0_0_#14221f]",
  // Smaller things: badges, stat boxes, chips.
  box: "rounded-2xl border-2 border-[#14221f] shadow-[3px_3px_0_0_#14221f]",
  pill: "rounded-full border-2 border-[#14221f]",
  // Buttons press down into their shadow.
  button:
    "rounded-full border-2 border-[#14221f] shadow-[3px_3px_0_0_#14221f] font-bold transition-[transform,box-shadow] duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0",
  // The warm cream for full screen games and end screens. Pages with the
  // sidebar use AROM's usual light background (bg-canvas) to match the app.
  page: "bg-[#FFF6E5]",
};

export const BOLD_COLORS = {
  green: "#2FA584",
  greenDeep: "#1F6F5B",
  coral: "#FF7A59",
  sun: "#FFD23F",
  lilac: "#B79BFF",
  sky: "#7CC8F8",
  ink: "#14221f",
  cream: "#FFF6E5",
};

// A soft dotted texture for colored cards.
export const DOTS = {
  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
  backgroundSize: "16px 16px",
};
