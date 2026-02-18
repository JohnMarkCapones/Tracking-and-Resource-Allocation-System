type AdminMetrics = {
    totalTools: number;
    availableTools: number;
    returnedCount: number;
    toolsUnderMaintenance: number;
    totalUsers: number;
    activeBorrowings: number;
    reservedCount: number;
};

type AdminStatBarProps = {
    metrics: AdminMetrics;
    onExportCsv?: () => void;
};

const statCardBase = 'flex items-center justify-between rounded-2xl px-4 py-3 text-white shadow-sm backdrop-blur-sm';

export function AdminStatBar({ metrics, onExportCsv }: AdminStatBarProps) {
    const returnedDisplay = metrics.returnedCount === 0 ? 'None' : metrics.returnedCount;
    const activeBorrowingsDisplay = metrics.activeBorrowings === 0 ? 'None' : metrics.activeBorrowings;
    const reservedDisplay = metrics.reservedCount === 0 ? 'None' : metrics.reservedCount;

    return (
        <section className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 px-6 py-4 text-white shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-blue-100">System-wide overview</p>
                    <h2 className="mt-1 text-lg font-semibold">Fleet and borrowing at a glance</h2>
                </div>

                <button
                    type="button"
                    onClick={onExportCsv}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-amber-300"
                >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 5H16M4 10H12M4 15H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    Export CSV
                </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-7">
                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Total tools</p>
                        <p className="mt-1 text-xl font-semibold">{metrics.totalTools}</p>
                        <p className="mt-1 text-[11px] text-blue-200">across all categories</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 7.5L10 4L16 7.5L10 11L4 7.5Z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Available</p>
                        <p className="mt-1 text-xl font-semibold">{metrics.availableTools}</p>
                        <p className="mt-1 text-[11px] text-emerald-200">ready to borrow</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/70">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 10.5L8.5 14L15 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Active borrowings</p>
                        <p className="mt-1 text-xl font-semibold">{activeBorrowingsDisplay}</p>
                        <p className="mt-1 text-[11px] text-amber-200">currently checked out</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/80">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 5H15V15H5V5Z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 8H12" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Reserved</p>
                        <p className="mt-1 text-xl font-semibold">{reservedDisplay}</p>
                        <p className="mt-1 text-[11px] text-violet-200">pending / upcoming</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/80">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="5" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4" />
                            <path d="M4 8.5H16" stroke="white" strokeWidth="1.4" />
                            <path d="M8 3V5.5M12 3V5.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Under maintenance</p>
                        <p className="mt-1 text-xl font-semibold">{metrics.toolsUnderMaintenance}</p>
                        <p className="mt-1 text-[11px] text-rose-100">not borrowable</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/80">
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

                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Returned</p>
                        <p className="mt-1 text-xl font-semibold">{returnedDisplay}</p>
                        <p className="mt-1 text-[11px] text-sky-200">in last 30 days</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/80">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 7L10 12L8 10" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 14L4 16" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Total users</p>
                        <p className="mt-1 text-xl font-semibold">{metrics.totalUsers}</p>
                        <p className="mt-1 text-[11px] text-blue-200">registered</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="7" r="2.5" stroke="white" strokeWidth="1.4" />
                            <path
                                d="M5.5 14C6.4 12.7 8.05 12 10 12C11.95 12 13.6 12.7 14.5 14"
                                stroke="white"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}
