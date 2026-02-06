import { Link } from '@inertiajs/react';

type BottomNavItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
};

type BottomNavProps = {
    items: BottomNavItem[];
};

export function BottomNav({ items }: BottomNavProps) {
    return (
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white lg:hidden">
            <div className="flex items-center justify-around py-2">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 px-3 py-1 ${
                            item.isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${item.isActive ? 'bg-blue-100' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
