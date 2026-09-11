// Theme Clerk's embedded form with our own tokens (CSS variables, so it
// tracks light/dark automatically) instead of shipping as an unstyled
// default widget dropped onto the page. Typed structurally (inferred)
// rather than importing Clerk's Appearance type, which isn't hoisted
// as a directly resolvable package here.
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--color-accent)",
    colorBackground: "var(--color-surface-raised)",
    colorText: "var(--color-ink)",
    colorTextSecondary: "var(--color-ink-muted)",
    colorInputBackground: "var(--color-background)",
    colorInputText: "var(--color-ink)",
    colorDanger: "var(--color-danger)",
    borderRadius: "10px",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    card: "shadow-none border border-[var(--color-border)] rounded-lg",
    headerTitle: "text-[var(--color-ink)] font-semibold",
    headerSubtitle: "text-[var(--color-ink-muted)]",
    socialButtonsBlockButton:
      "border border-[var(--color-border)] hover:bg-[var(--color-surface)]",
    dividerLine: "bg-[var(--color-border)]",
    dividerText: "text-[var(--color-ink-subtle)]",
    formFieldLabel: "text-[var(--color-ink)]",
    formFieldInput:
      "border border-[var(--color-border)] focus:border-[var(--color-accent)]",
    formButtonPrimary:
      "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-none normal-case text-[14px]",
    footerActionLink: "text-[var(--color-accent-ink)] hover:underline",
    identityPreviewEditButton: "text-[var(--color-accent-ink)]",
  },
};
