import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { createId } from "../lib/utils";
import { formatCurrency } from "../lib/invoiceMath";
import type { CalculatedLineItem, LineItemInput } from "../types/invoice";
import { Tooltip } from "./Tooltip";

interface LineItemsEditorProps {
  items: LineItemInput[];
  calculatedLines: CalculatedLineItem[];
  currency: string;
  locale: string;
  onChange: (next: LineItemInput[]) => void;
}

const createEmptyLine = (): LineItemInput => ({
  id: createId(),
  service: "",
  description: "",
  amount: 0,
  children: [],
});

const cloneWithIds = (line: LineItemInput): LineItemInput => ({
  ...line,
  id: createId(),
  children: line.children.map(cloneWithIds),
});

const updateById = (
  items: LineItemInput[],
  targetId: string,
  updater: (item: LineItemInput) => LineItemInput,
): LineItemInput[] =>
  items.map((item) => {
    if (item.id === targetId) {
      return updater(item);
    }

    return {
      ...item,
      children: updateById(item.children, targetId, updater),
    };
  });

const deleteById = (items: LineItemInput[], targetId: string): LineItemInput[] =>
  items
    .filter((item) => item.id !== targetId)
    .map((item) => ({
      ...item,
      children: deleteById(item.children, targetId),
    }));

const duplicateById = (items: LineItemInput[], targetId: string): LineItemInput[] => {
  const result: LineItemInput[] = [];

  for (const item of items) {
    result.push({
      ...item,
      children: duplicateById(item.children, targetId),
    });
    if (item.id === targetId) {
      result.push(cloneWithIds(item));
    }
  }

  return result;
};

const addChildById = (
  items: LineItemInput[],
  targetId: string,
  child: LineItemInput,
): LineItemInput[] =>
  items.map((item) => {
    if (item.id === targetId) {
      return { ...item, children: [...item.children, child] };
    }

    return {
      ...item,
      children: addChildById(item.children, targetId, child),
    };
  });

const moveInArray = (
  items: LineItemInput[],
  targetId: string,
  direction: "up" | "down",
): LineItemInput[] => {
  const index = items.findIndex((item) => item.id === targetId);
  if (index !== -1) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return items;
    }
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    return next;
  }

  return items.map((item) => ({
    ...item,
    children: moveInArray(item.children, targetId, direction),
  }));
};

const mapCalculatedById = (lines: CalculatedLineItem[]): Map<string, CalculatedLineItem> => {
  const map = new Map<string, CalculatedLineItem>();
  const walk = (lineList: CalculatedLineItem[]) => {
    for (const line of lineList) {
      map.set(line.id, line);
      walk(line.children);
    }
  };
  walk(lines);
  return map;
};

interface LineRowProps {
  line: LineItemInput;
  depth: number;
  currency: string;
  locale: string;
  calculatedById: Map<string, CalculatedLineItem>;
  onChange: (next: LineItemInput[]) => void;
  rootItems: LineItemInput[];
}

const LineRow = ({
  line,
  depth,
  currency,
  locale,
  calculatedById,
  onChange,
  rootItems,
}: LineRowProps) => {
  const { t } = useTranslation();
  const calcLine = calculatedById.get(line.id);
  const hasChildren = line.children.length > 0;

  const updateField = <K extends keyof LineItemInput>(key: K, value: LineItemInput[K]) => {
    onChange(updateById(rootItems, line.id, (target) => ({ ...target, [key]: value })));
  };

  return (
    <>
      <tr className={clsx("lineRow", hasChildren && "lineRowParent")}>
        <td className="lineServiceCell" style={{ paddingLeft: `${depth * 18 + 8}px` }}>
          <input
            type="text"
            value={line.service}
            onChange={(event) => updateField("service", event.target.value)}
            placeholder={
              depth === 0 ? t("lineItems.servicePlaceholder") : t("lineItems.childServicePlaceholder")
            }
            aria-label={t("lineItems.service")}
          />
        </td>
        <td>
          <input
            type="text"
            value={line.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder={t("lineItems.descriptionPlaceholder")}
            aria-label={t("lineItems.description")}
          />
        </td>
        <td className="amountCell">
          {hasChildren ? (
            <>
              {formatCurrency(currency, calcLine?.total ?? 0, locale)}
              <div className="autoTag">{t("lineItems.autoFromChildren")}</div>
            </>
          ) : (
            <input
              type="number"
              min={0}
              step="0.01"
              value={line.amount}
              onChange={(event) => updateField("amount", Number(event.target.value))}
              aria-label={t("lineItems.amount")}
            />
          )}
        </td>
        <td>
          <div className="lineActionGroup">
            <button
              type="button"
              onClick={() => onChange(duplicateById(rootItems, line.id))}
              aria-label={t("a11y.duplicateLine")}
            >
              {t("lineItems.duplicate")}
            </button>
            <button
              type="button"
              onClick={() => onChange(moveInArray(rootItems, line.id, "up"))}
              aria-label={t("a11y.moveLineUp")}
            >
              {t("lineItems.moveUp")}
            </button>
            <button
              type="button"
              onClick={() => onChange(moveInArray(rootItems, line.id, "down"))}
              aria-label={t("a11y.moveLineDown")}
            >
              {t("lineItems.moveDown")}
            </button>
            <button
              type="button"
              className="dangerButton"
              onClick={() => onChange(deleteById(rootItems, line.id))}
              aria-label={t("a11y.deleteLine")}
            >
              {t("lineItems.delete")}
            </button>
          </div>
        </td>
      </tr>
      {line.children.map((child) => (
        <LineRow
          key={child.id}
          line={child}
          depth={depth + 1}
          currency={currency}
          locale={locale}
          calculatedById={calculatedById}
          onChange={onChange}
          rootItems={rootItems}
        />
      ))}
      <tr className="lineAddChildRow">
        <td colSpan={4} style={{ paddingLeft: `${(depth + 1) * 18 + 8}px` }}>
          <button
            type="button"
            className="lineAddChildButton"
            onClick={() => onChange(addChildById(rootItems, line.id, createEmptyLine()))}
            aria-label={t("a11y.addChild")}
          >
            {t("lineItems.addChild")}
          </button>
        </td>
      </tr>
    </>
  );
};

export const LineItemsEditor = ({
  items,
  calculatedLines,
  currency,
  locale,
  onChange,
}: LineItemsEditorProps) => {
  const { t } = useTranslation();
  const calculatedById = mapCalculatedById(calculatedLines);

  return (
    <section className="panel">
      <div className="panelHeader">
        <h3>
          {t("lineItems.title")}{" "}
          <Tooltip label="?" text={t("lineItems.tooltip")} />
        </h3>
        <button type="button" onClick={() => onChange([...items, createEmptyLine()])}>
          {t("lineItems.addService")}
        </button>
      </div>
      <div className="tableWrap">
        <table className="editorTable">
          <thead>
            <tr>
              <th scope="col">{t("lineItems.service")}</th>
              <th scope="col">{t("lineItems.description")}</th>
              <th scope="col">{t("lineItems.amount")}</th>
              <th scope="col">{t("lineItems.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="emptyCell">
                  {t("lineItems.empty")}
                </td>
              </tr>
            ) : (
              items.map((line) => (
                <LineRow
                  key={line.id}
                  line={line}
                  depth={0}
                  currency={currency}
                  locale={locale}
                  calculatedById={calculatedById}
                  onChange={onChange}
                  rootItems={items}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
