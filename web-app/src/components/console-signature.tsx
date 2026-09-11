"use client";

import { useEffect } from "react";

// A hidden-but-learnable detail for the curious: anyone who opens devtools
// finds a signature, not a wall of framework noise. Guarded at module scope
// so React 19 dev-mode's double effect invocation doesn't print it twice.
let printed = false;

export function ConsoleSignature() {
  useEffect(() => {
    if (printed) return;
    printed = true;
    console.log(
      "%cAgenticForge",
      "font-size:20px;font-weight:700;color:#c2410c;padding:4px 0;"
    );
    console.log(
      "%cSomeone spent way too long on this. Poke around.",
      "color:#71717a;font-size:12px;"
    );
    console.log(
      "%chttps://github.com/PathakSiddhant/AgenticForge",
      "color:#a1a1aa;font-size:11px;"
    );
  }, []);

  return null;
}
