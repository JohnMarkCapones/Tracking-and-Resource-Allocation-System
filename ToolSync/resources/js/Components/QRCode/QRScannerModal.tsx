import { useState } from 'react';
import Modal from '@/Components/Modal';

type QRScannerModalProps = {
    show: boolean;
    onClose: () => void;
    onScan: (toolId: string) => void;
};

export function QRScannerModal({ show, onClose, onScan }: QRScannerModalProps) {
    const [manualInput, setManualInput] = useState('');
    const [mode, setMode] = useState<'camera' | 'manual'>('manual');

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput.trim()) {
            onScan(manualInput.trim());
            setManualInput('');
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scan QR Code</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Scan a tool's QR code to quickly view its details</p>

                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        onClick={() => setMode('camera')}
                        className={`flex-1 rounded-lg py-2 text-xs font-medium ${
                            mode === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Camera
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('manual')}
                        className={`flex-1 rounded-lg py-2 text-xs font-medium ${
                            mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Enter ID
                    </button>
                </div>

                {mode === 'camera' ? (
                    <div className="mt-4">
                        <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-900">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-500" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
                                    <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M8 32H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M36 16H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M36 32H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M16 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M32 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M16 36V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M32 36V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <p className="mt-2 text-xs text-gray-400">Point your camera at a tool QR code</p>
                                <p className="mt-1 text-[10px] text-gray-500">Camera access requires HTTPS</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleManualSubmit} className="mt-4">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Tool ID</label>
                        <input
                            type="text"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="e.g., LP-0001"
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                            type="submit"
                            className="mt-3 w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            Look Up Tool
                        </button>
                    </form>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full rounded-full border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                >
                    Cancel
                </button>
            </div>
        </Modal>
    );
}
