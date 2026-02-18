/**
 * Export data to CSV and trigger download
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string, columns?: { key: string; label: string }[]): void {
    if (data.length === 0) return;

    const keys = columns ? columns.map((c) => c.key) : Object.keys(data[0]);
    const headers = columns ? columns.map((c) => c.label) : keys;

    const csvRows = [
        headers.join(','),
        ...data.map((row) =>
            keys
                .map((key) => {
                    const value = String(row[key] ?? '');
                    // Escape commas and quotes
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                })
                .join(','),
        ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to JSON and trigger download
 */
export function exportToJSON(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
}

/**
 * Parse CSV file into array of objects
 */
export function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() ?? '';
        });
        rows.push(row);
    }

    return rows;
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate a simple PDF table using jsPDF
 */
export async function exportToPDF(
    data: Record<string, unknown>[],
    filename: string,
    title: string,
    columns: { key: string; label: string }[],
): Promise<void> {
    if (data.length === 0 || columns.length === 0) {
        return;
    }

    const { default: jsPDF } = await import('jspdf');
    // Use landscape for better horizontal space when many columns are selected.
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginX = 14;
    const startY = 40;
    const headerHeight = 10;
    const rowHeight = 8;
    const cellPadding = 3;
    const maxColumnsPerPage = 6;

    const renderPageChrome = (): void => {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(title, marginX, 22);

        doc.setFontSize(10);
        doc.setTextColor(128);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, marginX, 30);
    };

    const renderHeader = (pageColumns: { key: string; label: string }[]): void => {
        const colWidth = (pageWidth - marginX * 2) / pageColumns.length;

        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(31, 41, 55);
        doc.rect(marginX, startY, pageWidth - marginX * 2, headerHeight, 'F');

        pageColumns.forEach((col, index) => {
            doc.text(col.label, marginX + index * colWidth + cellPadding, startY + 7, {
                maxWidth: colWidth - cellPadding * 2,
            });
        });
    };

    renderPageChrome();

    // Split columns into smaller groups so each page stays readable instead of cramming all columns into one table.
    for (let colStart = 0; colStart < columns.length; colStart += maxColumnsPerPage) {
        const pageColumns = columns.slice(colStart, colStart + maxColumnsPerPage);
        const colWidth = (pageWidth - marginX * 2) / pageColumns.length;

        if (colStart > 0) {
            doc.addPage();
            renderPageChrome();
        }

        renderHeader(pageColumns);
        doc.setTextColor(55, 65, 81);

        let y = startY + headerHeight;
        data.forEach((row, rowIndex) => {
            if (y > pageHeight - 20) {
                doc.addPage();
                renderPageChrome();
                renderHeader(pageColumns);
                y = startY + headerHeight;
            }

            if (rowIndex % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(marginX, y, pageWidth - marginX * 2, rowHeight, 'F');
            }

            pageColumns.forEach((col, index) => {
                const rawValue = String(row[col.key] ?? '');
                const truncated = rawValue.length > 40 ? `${rawValue.substring(0, 37)}…` : rawValue;

                doc.text(truncated, marginX + index * colWidth + cellPadding, y + 5, {
                    maxWidth: colWidth - cellPadding * 2,
                });
            });

            y += rowHeight;
        });
    }

    doc.save(`${filename}.pdf`);
}
