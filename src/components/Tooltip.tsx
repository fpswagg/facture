import { useId } from "react";
import { useTranslation } from "react-i18next";

interface TooltipProps {
  label: string;
  text: string;
}

export const Tooltip = ({ label, text }: TooltipProps) => {
  const { t } = useTranslation();
  const tooltipId = useId();

  return (
    <span className="tooltipWrap">
      <button
        type="button"
        className="tooltipButton"
        aria-describedby={tooltipId}
        aria-label={t("a11y.tooltipHelp")}
      >
        {label}
      </button>
      <span id={tooltipId} role="tooltip" className="tooltipPanel">
        {text}
      </span>
    </span>
  );
};
