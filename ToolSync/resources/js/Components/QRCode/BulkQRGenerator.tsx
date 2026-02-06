import { QRCodeSVG } from 'qrcode.react';

type Tool = {
    id: number;
    name: string;
    toolId: string;
};

type BulkQRGeneratorProps = {
    tools: Tool[];
    onClose: () => void;
};

export function BulkQRGenerator({ tools, onClose }: BulkQRGeneratorProps) {
    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const qrItems = tools
            .map(
                (tool) => `
            <div class="qr-item">
                <div class="qr-placeholder" data-url="${window.location.origin}/tools/${tool.id}">[QR: ${tool.toolId}]</div>
                <div class="label">${tool.name}</div>
                <div class="id">ID: ${tool.toolId}</div>
            </div>
        `,
            )
            .join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>QR Codes - Bulk Print</title>
            <style>
                body { margin: 0; padding: 20px; font-family: sans-serif; }
                .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .qr-item { text-align: center; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; }
                .qr-placeholder { width: 120px; height: 120px; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 4px; font-size: 10px; color: #9ca3af; }
                .label { margin-top: 8px; font-size: 14px; font-weight: 600; }
                .id { font-size: 12px; color: #666; }
                @media print { .grid { grid-template-columns: repeat(3, 1fr); } }
            </style>
            </head>
            <body><div class="grid">${qrItems}</div></body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Generate QR Codes ({tools.length} tools)</h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handlePrintAll}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        Print All
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tools.map((tool) => (
                    <div key={tool.id} className="flex flex-col items-center rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                        <QRCodeSVG value={`${window.location.origin}/tools/${tool.id}`} size={120} level="H" includeMargin={true} />
                        <p className="mt-2 text-center text-xs font-medium text-gray-900 dark:text-white">{tool.name}</p>
                        <p className="text-center text-[10px] text-gray-500 dark:text-gray-400">ID: {tool.toolId}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
