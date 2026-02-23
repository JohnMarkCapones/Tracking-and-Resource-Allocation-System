import { useEffect, useRef, useState } from 'react';
import Modal from '@/Components/Modal';

type ReturnModalProps = {
    show: boolean;
    toolName: string;
    toolId: string;
    onClose: () => void;
    onSubmit: (data: { condition: string; notes: string; imageFiles: File[] }) => void;
};

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged', 'Functional'];

export function ReturnModal({ show, toolName, toolId, onClose, onSubmit }: ReturnModalProps) {
    const [condition, setCondition] = useState('Good');
    const [notes, setNotes] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const prevShowRef = useRef(false);

    const isProofRequired = condition === 'Fair' || condition === 'Poor' || condition === 'Damaged';

    const clearImageState = () => {
        setImageFiles([]);
        setImagePreviewUrls((prev) => {
            prev.forEach((url) => URL.revokeObjectURL(url));
            return [];
        });
    };

    useEffect(() => {
        if (show && !prevShowRef.current) {
            setCondition('Good');
            setNotes('');
            clearImageState();
            setSubmitError(null);
        }
        prevShowRef.current = show;
    }, [show]);

    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []).slice(0, 5);
        setImageFiles(files);
        setSubmitError(null);
        setImagePreviewUrls((prev) => {
            prev.forEach((url) => URL.revokeObjectURL(url));
            return files.map((file) => URL.createObjectURL(file));
        });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isProofRequired && imageFiles.length === 0) {
            setSubmitError('Please upload at least one photo proof for Fair, Poor, or Damaged returns.');
            return;
        }
        onSubmit({ condition, notes, imageFiles });
    };

    const handleClose = () => {
        setCondition('Good');
        setNotes('');
        clearImageState();
        setSubmitError(null);
        onClose();
    };

    return (
        <Modal show={show} maxWidth="md" onClose={handleClose}>
            <div className="overflow-hidden rounded-lg">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 px-6 py-4 text-white">
                    <h2 className="text-sm font-semibold">Return Tool</h2>
                    <p className="mt-1 text-[11px] text-emerald-100">
                        {toolName} ({toolId})
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 bg-white px-6 py-5">
                        <div>
                            <label className="mb-2 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Tool Condition</label>
                            <p className="mb-3 text-[11px] text-gray-500">Please assess the current condition of the tool.</p>
                            <div className="flex flex-wrap gap-2">
                                {CONDITIONS.map((cond) => (
                                    <button
                                        key={cond}
                                        type="button"
                                        onClick={() => setCondition(cond)}
                                        className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                                            condition === cond
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {cond}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="notes" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Notes (Optional)
                            </label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Any issues or comments about the tool..."
                            />
                        </div>

                        <div>
                            <label htmlFor="return-proof-images" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Condition Photos {isProofRequired ? '(Required)' : '(Optional)'}
                            </label>
                            <input
                                id="return-proof-images"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                onChange={handleImagesChange}
                                className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-1.5 file:text-[11px] file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="mt-1 text-[11px] text-gray-500">Upload up to 5 photos. JPG/PNG/WEBP, max 5MB each.</p>
                            {imagePreviewUrls.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {imagePreviewUrls.map((url, index) => (
                                        <div key={`preview-${index}`} className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                                            <img src={url} alt={`Return preview ${index + 1}`} className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {condition === 'Damaged' && (
                            <div className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                                <p className="font-semibold">Tool marked as damaged</p>
                                <p className="mt-1">Please provide details in notes. An admin will review and may schedule maintenance.</p>
                            </div>
                        )}

                        {submitError && (
                            <div className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] text-rose-700">{submitError}</div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                        >
                            Confirm Return
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
