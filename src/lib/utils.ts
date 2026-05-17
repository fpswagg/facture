export const createId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const portfolioFallback = "https://fpswagg.com";

export const portfolioUrl = (() => {
  const raw = import.meta.env.VITE_PORTFOLIO_URL;
  if (!raw || raw.trim().length === 0) {
    return portfolioFallback;
  }

  try {
    return new URL(raw).toString();
  } catch {
    return portfolioFallback;
  }
})();

export const portfolioLogoUrl = new URL("/logo.png", portfolioUrl).href;

const setLinkHref = (rel: string, href: string, type = "image/png") => {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.type = type;
  link.href = href;
};

export const applyPortfolioHeadIcons = (): void => {
  setLinkHref("icon", portfolioLogoUrl);
  setLinkHref("apple-touch-icon", portfolioLogoUrl);
};
