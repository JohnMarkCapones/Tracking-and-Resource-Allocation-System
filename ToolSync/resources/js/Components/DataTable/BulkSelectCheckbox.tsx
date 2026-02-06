type BulkSelectCheckboxProps = {
    checked: boolean;
    indeterminate?: boolean;
    onChange: () => void;
    label?: string;
};

export function BulkSelectCheckbox({ checked, indeterminate = false, onChange, label = 'Select all' }: BulkSelectCheckboxProps) {
    return (
        <label className="relative flex cursor-pointer items-center">
            <input
                type="checkbox"
                checked={checked}
                ref={(el) => {
                    if (el) {
                        el.indeterminate = indeterminate && !checked;
                    }
                }}
                onChange={onChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                aria-label={label}
            />
            <span className="sr-only">{label}</span>
        </label>
    );
}
