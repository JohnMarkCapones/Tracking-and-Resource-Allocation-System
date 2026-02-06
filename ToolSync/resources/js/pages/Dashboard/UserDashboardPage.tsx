import { Head, usePage } from '@inertiajs/react';
import type { BorrowingHistoryItem } from '@/Components/Dashboard/BorrowingHistoryTable';
import { BorrowingHistoryTable } from '@/Components/Dashboard/BorrowingHistoryTable';
import type { SummaryData } from '@/Components/Dashboard/SummaryDonutChart';
import { SummaryDonutChart } from '@/Components/Dashboard/SummaryDonutChart';
import { WelcomeBanner } from '@/Components/Dashboard/WelcomeBanner';
import AppLayout from '@/Layouts/AppLayout';

type UserDashboardPageProps = {
    userName: string;
    totalTools: number;
    toolsUnderMaintenance: number;
    borrowedItemsCount: number;
    availableTools: number;
    borrowingHistory: BorrowingHistoryItem[];
    summary: SummaryData;
};

export default function UserDashboardPage() {
    const { userName, totalTools, toolsUnderMaintenance, borrowedItemsCount, availableTools, borrowingHistory, summary } =
        usePage<UserDashboardPageProps>().props;

    return (
        <AppLayout
            activeRoute="dashboard"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">Dashboard</p>
                    <h1 className="text-2xl font-semibold text-gray-900">System-wide overview and analytics</h1>
                </>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                <WelcomeBanner
                    userName={userName}
                    totalTools={totalTools}
                    toolsUnderMaintenance={toolsUnderMaintenance}
                    borrowedItemsCount={borrowedItemsCount}
                    availableTools={availableTools}
                />

                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                        <div className="space-y-6">
                            <BorrowingHistoryTable items={borrowingHistory} />

                            <section className="rounded-3xl bg-white p-6 shadow-sm">
                                <header className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Upcoming returns</h3>
                                        <p className="text-[11px] text-gray-500">Tools that are due in the next 7 days.</p>
                                    </div>
                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">2 due soon</span>
                                </header>
                                <ul className="space-y-3 text-xs text-gray-700">
                                    <li className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2">
                                        <div>
                                            <p className="font-semibold">LP-0001 · Laptop</p>
                                            <p className="text-[11px] text-gray-500">Due January 7, 2027</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                                        >
                                            Return now
                                        </button>
                                    </li>
                                    <li className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2">
                                        <div>
                                            <p className="font-semibold">PR-0011 · Projector</p>
                                            <p className="text-[11px] text-gray-500">Due Feb 2, 2026</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            View details
                                        </button>
                                    </li>
                                </ul>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <SummaryDonutChart data={summary} />

                            <section className="rounded-3xl bg-white p-6 shadow-sm">
                                <header className="mb-4 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900">Recent activity</h3>
                                    <span className="text-[11px] text-gray-500">Today</span>
                                </header>
                                <ol className="space-y-4 text-xs text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                                        <div>
                                            <p className="font-medium">LP-0001 returned</p>
                                            <p className="text-[11px] text-gray-500">You returned &quot;Design Laptop&quot; to the IT storage.</p>
                                            <p className="mt-1 text-[10px] text-gray-400">10:24 AM</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                                        <div>
                                            <p className="font-medium">PR-0011 borrowed</p>
                                            <p className="text-[11px] text-gray-500">You borrowed &quot;Conference Projector&quot; for Room A.</p>
                                            <p className="mt-1 text-[10px] text-gray-400">9:02 AM</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                                        <div>
                                            <p className="font-medium">Maintenance scheduled</p>
                                            <p className="text-[11px] text-gray-500">3 tools were scheduled for quarterly maintenance.</p>
                                            <p className="mt-1 text-[10px] text-gray-400">8:30 AM</p>
                                        </div>
                                    </li>
                                </ol>
                            </section>

                            <section className="rounded-3xl bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-sm font-semibold text-gray-900">Quick actions</h3>
                                <div className="grid gap-3 text-xs text-gray-700 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        className="flex flex-col items-start rounded-2xl bg-blue-50 px-4 py-3 text-left hover:bg-blue-100"
                                    >
                                        <span className="mb-1 text-xs font-semibold text-blue-800">Request tool</span>
                                        <span className="text-[11px] text-blue-900/80">Quickly submit a borrowing request to admins.</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="flex flex-col items-start rounded-2xl bg-rose-50 px-4 py-3 text-left hover:bg-rose-100"
                                    >
                                        <span className="mb-1 text-xs font-semibold text-rose-800">Report issue</span>
                                        <span className="text-[11px] text-rose-900/80">Flag damaged or missing tools for review.</span>
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
