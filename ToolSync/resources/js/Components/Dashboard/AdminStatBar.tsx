type AdminMetrics = {
    totalTools: number;
    availableTools: number;
    borrowedTools: number;
    toolsUnderMaintenance: number;
    totalUsers: number;
    activeBorrowings: number;
};

type AdminStatBarProps = {
    metrics: AdminMetrics;
};

const statCardBase = 'flex items-center justify-between rounded-2xl px-4 py-3 text-white shadow-sm backdrop-blur-sm';

export function AdminStatBar({ metrics }: AdminStatBarProps) {
    return (
        <section className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 px-6 py-4 text-white shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-blue-100">System-wide overview</p>
                    <h2 className="mt-1 text-lg font-semibold">Fleet and borrowing at a glance</h2>
                </div>

                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-amber-300"
                >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 5H16M4 10H12M4 15H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    Export CSV
                </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Total tools</p>
                        <p className="mt-1 text-xl font-semibold">{metrics.totalTools}</p>
                        <p className="mt-1 text-[11px] text-emerald-200">▲ 12% vs last month</p>
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
                        <p className="mt-1 text-[11px] text-emerald-200">▲ 5 tools freed today</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/70">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 10.5L8.5 14L15 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Borrowed</p>
                        <p className="mt-1 text-xl font-semibold">{metrics.borrowedTools}</p>
                        <p className="mt-1 text-[11px] text-amber-200">▬ Stable vs last week</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/80">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 5H15V15H5V5Z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Under maintenance</p>
                        <p className="mt-1 text-xl font-semibold">{metrics.toolsUnderMaintenance}</p>
                        <p className="mt-1 text-[11px] text-rose-100">▲ 1 incident reported</p>
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
                        <p className="text-[11px] text-blue-100">Total users</p>
                        <p className="mt-1 text-xl font-semibold">{metrics.totalUsers}</p>
                        <p className="mt-1 text-[11px] text-emerald-200">▲ 3 new this month</p>
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

                <div className={`${statCardBase} bg-white/10`}>
                    <div>
                        <p className="text-[11px] text-blue-100">Active borrowings</p>
                        <p className="mt-1 text-xl font-semibold">{metrics.activeBorrowings}</p>
                        <p className="mt-1 text-[11px] text-amber-200">▼ 2 overdue resolved</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/80">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M5 8.5C5 6.565 6.565 5 8.5 5C9.484 5 10.38 5.422 11 6.105C11.62 5.422 12.516 5 13.5 5C15.435 5 17 6.565 17 8.5C17 11.545 13.5 14 11 15.5C8.5 14 5 11.545 5 8.5Z"
                                stroke="white"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}
