import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

type QRCodeGeneratorProps = {
    /** URL slug for /tools/{slug}. If omitted, toolId is used (may not resolve). */
    toolSlug?: string | null;
    toolId: string;
    toolName: string;
    size?: number;
    showDownload?: boolean;
};

export function QRCodeGenerator({
    toolSlug,
    toolId,
    toolName,
    size = 200,
    showDownload = true,
}: QRCodeGeneratorProps) {
    const qrRef = useRef<HTMLDivElement>(null);
    const value = `${window.location.origin}/tools/${toolSlug ?? toolId}`;

    const handleDownload = () => {
        if (!qrRef.current) return;
        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = size * 2;
        canvas.height = size * 2;

        img.onload = () => {
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `qr-${toolId}.png`;
            link.href = pngUrl;
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow || !qrRef.current) return;

        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>QR Code - ${toolName}</title>
            <style>
                body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
                .label { margin-top: 16px; font-size: 18px; font-weight: 600; }
                .id { font-size: 14px; color: #666; margin-top: 4px; }
            </style>
            </head>
            <body>
                ${svgData}
                <div class="label">${toolName}</div>
                <div class="id">ID: ${toolId}</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="flex flex-col items-center">
            <div ref={qrRef} className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <QRCodeSVG value={value} size={size} level="H" includeMargin={true} />
            </div>
            <p className="mt-2 text-center text-xs font-medium text-gray-900 dark:text-white">{toolName}</p>
            <p className="text-center text-[10px] text-gray-500 dark:text-gray-400">ID: {toolId}</p>

            {showDownload && (
                <div className="mt-3 flex gap-2">
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M8 2V10M8 10L5 7M8 10L11 7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2 12V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        Download PNG
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6V2H12V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 12H2V7H14V12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 10H12V14H4V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Print
                    </button>
                </div>
            )}
        </div>
    );
}
