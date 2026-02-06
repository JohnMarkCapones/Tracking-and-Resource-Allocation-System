import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import type { PropsWithChildren, ReactNode } from 'react';

type CollapsibleSectionProps = PropsWithChildren<{
    title: string;
    subtitle?: string;
    badge?: ReactNode;
    defaultOpen?: boolean;
}>;

export function CollapsibleSection({ title, subtitle, badge, defaultOpen = true, children }: CollapsibleSectionProps) {
    return (
        <Disclosure as="section" defaultOpen={defaultOpen}>
            {({ open }) => (
                <div className="rounded-3xl bg-white shadow-sm">
                    <DisclosureButton className="flex w-full items-center justify-between px-6 py-4 text-left">
                        <div className="flex items-center gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                                {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
                            </div>
                            {badge}
                        </div>
                        <svg
                            className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </DisclosureButton>
                    <DisclosurePanel className="px-6 pb-6">{children}</DisclosurePanel>
                </div>
            )}
        </Disclosure>
    );
}
