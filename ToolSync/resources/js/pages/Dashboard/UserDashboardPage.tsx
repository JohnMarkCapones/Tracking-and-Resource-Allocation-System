import AppLayout from '@/Layouts/AppLayout';
import type {
    BorrowingHistoryItem,
    BorrowingHistoryStatus,
} from '@/Components/Dashboard/BorrowingHistoryTable';
import { BorrowingHistoryTable } from '@/Components/Dashboard/BorrowingHistoryTable';
import type { SummaryData } from '@/Components/Dashboard/SummaryDonutChart';
import { SummaryDonutChart } from '@/Components/Dashboard/SummaryDonutChart';
import { WelcomeBanner } from '@/Components/Dashboard/WelcomeBanner';
import { Head, usePage } from '@inertiajs/react';

type UserDashboardPageProps = {
    userName: string;
    totalTools: number;
    toolsUnderMaintenance: number;
    borrowedItemsCount: number;
    borrowingHistory: BorrowingHistoryItem[];
    summary: SummaryData;
};

export default function UserDashboardPage() {
    const {
        userName,
        totalTools,
        toolsUnderMaintenance,
        borrowedItemsCount,
        borrowingHistory,
        summary,
    } = usePage<UserDashboardPageProps>().props;

    return (
        <AppLayout
            activeRoute="dashboard"
            header={
                <>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                        Dashboard
                    </p>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        System-wide overview and analytics
                    </h1>
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
                />

                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900">
                        Recent Activity
                    </h2>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                        <BorrowingHistoryTable items={borrowingHistory} />
                        <SummaryDonutChart data={summary} />
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

