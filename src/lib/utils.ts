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
