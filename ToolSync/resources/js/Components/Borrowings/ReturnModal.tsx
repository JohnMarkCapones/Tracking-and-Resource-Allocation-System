import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { ImageGallery, type ImageGalleryEntry } from '@/Components/ImageGallery/ImageGallery';
import Modal from '@/Components/Modal';

type ReturnModalProps = {
    show: boolean;
    toolName: string;
    toolId: string;
    onClose: () => void;
    onSubmit: (data: { condition: string; notes: string; imageFiles: File[] }) => void;
};

type SelectedImage = {
    id: string;
    file: File;
    previewUrl: string;
};

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged', 'Functional'];
const MAX_IMAGES = 5;

function createSelectedImage(file: File): SelectedImage {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
    };
}

export function ReturnModal({ show, toolName, toolId, onClose, onSubmit }: ReturnModalProps) {
    const [condition, setCondition] = useState('Good');
    const [notes, setNotes] = useState('');
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const prevShowRef = useRef(false);
    const selectedImagesRef = useRef<SelectedImage[]>([]);

    const isProofRequired = condition === 'Fair' || condition === 'Poor' || condition === 'Damaged';

    useEffect(() => {
        selectedImagesRef.current = selectedImages;
    }, [selectedImages]);

    useEffect(() => {
        return () => {
            selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        };
    }, []);

    const clearImageState = () => {
        setSelectedImages((prev) => {
            prev.forEach((image) => URL.revokeObjectURL(image.previewUrl));
            return [];
        });
    };

    const resetState = () => {
        setCondition('Good');
        setNotes('');
        clearImageState();
        setSubmitError(null);
        setIsDragActive(false);
    };

    useEffect(() => {
        if (show && !prevShowRef.current) {
            resetState();
        }
        prevShowRef.current = show;
    }, [show]);

    const appendImageFiles = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        const slotsLeft = Math.max(0, MAX_IMAGES - selectedImages.length);
        const accepted = imageFiles.slice(0, slotsLeft).map(createSelectedImage);

        if (accepted.length > 0) {
            setSelectedImages((prev) => [...prev, ...accepted]);
        }

        if (imageFiles.length > slotsLeft) {
            setSubmitError(`You can upload up to ${MAX_IMAGES} photos.`);
        } else {
            setSubmitError(null);
        }
    };

    const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
        appendImageFiles(Array.from(event.target.files ?? []));
        event.target.value = '';
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
        appendImageFiles(Array.from(event.dataTransfer.files ?? []));
    };

    const removeImage = (imageId: string) => {
        setSelectedImages((prev) => {
            const target = prev.find((image) => image.id === imageId);
            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((image) => image.id !== imageId);
        });
        setSubmitError(null);
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (isProofRequired && selectedImages.length === 0) {
            setSubmitError('Please upload at least one photo proof for Fair, Poor, or Damaged returns.');
            return;
        }

        onSubmit({
            condition,
            notes,
            imageFiles: selectedImages.map((image) => image.file),
        });
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const previewItems: ImageGalleryEntry[] = selectedImages.map((image, index) => ({
        id: image.id,
        src: image.previewUrl,
        alt: `Return preview ${index + 1}`,
        actionLabel: 'Remove image',
        actionAriaLabel: `Remove return image ${index + 1}`,
        actionTitle: 'Remove image',
        onAction: () => removeImage(image.id),
    }));

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
                            <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Condition Photos {isProofRequired ? '(Required)' : '(Optional)'}
                            </label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`rounded-xl border border-dashed px-4 py-4 text-center transition-colors ${
                                    isDragActive
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-gray-300 bg-gray-50'
                                }`}
                            >
                                <p className="text-xs text-gray-700">Drag and drop up to {MAX_IMAGES} images here</p>
                                <p className="mt-1 text-[11px] text-gray-500">or choose files manually</p>
                                <label
                                    htmlFor="return-proof-images"
                                    className="mt-3 inline-flex cursor-pointer items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                                >
                                    Select photos
                                </label>
                                <input
                                    id="return-proof-images"
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    multiple
                                    onChange={handleImagesChange}
                                    className="sr-only"
                                />
                            </div>
                            <p className="mt-1 text-[11px] text-gray-500">Upload up to 5 photos. JPG/PNG/WEBP, max 5MB each.</p>

                            <div className="mt-2">
                                <ImageGallery
                                    items={previewItems}
                                    emptyText="No photos selected yet."
                                    sizeClassName="h-16 w-16"
                                />
                            </div>
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
