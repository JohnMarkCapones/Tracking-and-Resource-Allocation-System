import { Link } from '@inertiajs/react';

type WelcomeBannerProps = {
    userName: string;
    totalTools: number;
    toolsUnderMaintenance: number;
    borrowedItemsCount: number;
    availableTools: number;
};

export function WelcomeBanner({ userName, totalTools, toolsUnderMaintenance, borrowedItemsCount, availableTools }: WelcomeBannerProps) {
    const borrowedDisplay = borrowedItemsCount === 0 ? 'None' : borrowedItemsCount;

    return (
        <section className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 px-8 py-6 text-white shadow-md">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-md">
                    <p className="text-sm font-medium text-blue-100">Welcome back, {userName}!</p>
                    <h2 className="mt-2 text-xl font-semibold">Here&apos;s what&apos;s happening with your tools today</h2>
                    <Link
                        href="/tools"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        Borrow new tool
                    </Link>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="group rounded-2xl bg-white/10 px-4 py-3 shadow-sm transition hover:bg-white/15 hover:shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-100">Total tools</p>
                                <p className="mt-1 text-2xl font-semibold">{totalTools}</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-800/60">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4 7.5L10 4L16 7.5L10 11L4 7.5Z"
                                        stroke="white"
                                        strokeWidth="1.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path d="M4 12.5L10 16L16 12.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-blue-100">+8 vs last month</p>
                    </div>

                    <div className="group rounded-2xl bg-orange-400/20 px-4 py-3 shadow-sm transition hover:bg-orange-400/30 hover:shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-orange-50">Under maintenance</p>
                                <p className="mt-1 text-2xl font-semibold">{toolsUnderMaintenance}</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M9 3.5L4 10H9L8 16.5L14 9.5H9L9 3.5Z"
                                        stroke="white"
                                        strokeWidth="1.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-orange-50">+1 vs last week</p>
                    </div>

                    <div className="group rounded-2xl bg-sky-400/25 px-4 py-3 shadow-sm transition hover:bg-sky-400/35 hover:shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-sky-50">Borrowed items</p>
                                <p className="mt-1 text-2xl font-semibold">{borrowedDisplay}</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 5H15V15H5V5Z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 8H12" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-sky-50">-3 returned today</p>
                    </div>

                    <div className="group rounded-2xl bg-emerald-400/25 px-4 py-3 shadow-sm transition hover:bg-emerald-400/35 hover:shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-emerald-50">Available tools</p>
                                <p className="mt-1 text-2xl font-semibold">{availableTools}</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 10.5L8.5 14L15 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-emerald-50">82% utilization</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
