import { toast } from "sonner";

type CellValue = string | number | Date | null | undefined;

/** How a column's numbers or dates show in Excel. Values stay real numbers/dates, so they sort and sum. */
export type ExcelFormat = "number" | "percent" | "date" | "datetime";

export interface ExcelColumn<T> {
    header: string;
    value: (row: T) => CellValue;
    format?: ExcelFormat;
}

/** One sheet, already turned into cells so sheets with different row types can share one workbook. */
export interface ExcelSheet {
    name: string;
    headers: string[];
    formats: (ExcelFormat | undefined)[];
    rows: CellValue[][];
}

const NUM_FMT: Record<ExcelFormat, string> = {
    number: "#,##0",
    percent: "0.0%",
    date: "d mmm yyyy",
    datetime: "d mmm yyyy hh:mm",
};

export function excelSheet<T>(name: string, columns: ExcelColumn<T>[], rows: T[]): ExcelSheet {
    return {
        // Excel allows 31 characters and no : \ / ? * [ ] in a sheet name.
        name: name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31),
        headers: columns.map((c) => c.header),
        formats: columns.map((c) => c.format),
        rows: rows.map((row) => columns.map((c) => c.value(row))),
    };
}

/**
 * Excel stores dates without a time zone and exceljs writes them as UTC, so shift timestamps to keep the
 * local wall-clock time. A plain "YYYY-MM-DD" is already a calendar day.
 */
function toCell(value: CellValue, format?: ExcelFormat): CellValue {
    if (value === null || value === undefined || value === "") return null;
    if (format === "date" || format === "datetime") {
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00Z`);
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return format === "date"
            ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
            : new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
    }
    return value;
}

/** Roughly how wide a cell shows, for sizing the column. */
function shownLength(value: CellValue, format?: ExcelFormat): number {
    if (value === null || value === undefined) return 0;
    if (format === "date") return 11;
    if (format === "datetime") return 17;
    if (typeof value === "number") return format === "percent" ? 7 : value.toLocaleString("en-US").length;
    return String(value).length;
}

/**
 * Builds an .xlsx file and downloads it. exceljs is large, so it's only loaded on the first export.
 * The file name gets today's date, e.g. advertisers-2026-11-16.xlsx.
 */
export async function downloadExcel(baseName: string, sheets: ExcelSheet[]): Promise<boolean> {
    try {
        const mod = await import("exceljs");
        const ExcelJS = (mod as unknown as { default?: typeof mod }).default ?? mod;
        const workbook = new ExcelJS.Workbook();
        workbook.created = new Date();

        for (const sheet of sheets) {
            const ws = workbook.addWorksheet(sheet.name, { views: [{ state: "frozen", ySplit: 1 }] });
            ws.columns = sheet.headers.map((header, i) => {
                const longest = Math.max(header.length, ...sheet.rows.map((r) => shownLength(r[i], sheet.formats[i])));
                const format = sheet.formats[i];
                return { header, width: Math.min(Math.max(longest + 2, 8), 60), style: format ? { numFmt: NUM_FMT[format] } : {} };
            });
            sheet.rows.forEach((r) => ws.addRow(r.map((v, i) => toCell(v, sheet.formats[i]))));

            const head = ws.getRow(1);
            head.font = { bold: true };
            head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F1EE" } };
            if (sheet.rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.headers.length } };
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const now = new Date();
        const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${baseName}-${stamp}.xlsx`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return true;
    } catch (error) {
        toast.error("Couldn't export", { description: error instanceof Error ? error.message : undefined });
        return false;
    }
}
