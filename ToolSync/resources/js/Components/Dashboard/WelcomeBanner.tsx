type WelcomeBannerProps = {
    userName: string;
    totalTools: number;
    toolsUnderMaintenance: number;
    borrowedItemsCount: number;
};

export function WelcomeBanner({
    userName,
    totalTools,
    toolsUnderMaintenance,
    borrowedItemsCount,
}: WelcomeBannerProps) {
    return (
        <section className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 px-8 py-6 text-white shadow-md">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-medium text-blue-100">
                        Welcome back, {userName}!
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                        Here&apos;s what&apos;s happening with your tools today
                    </h2>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <p className="text-xs text-blue-100">Total Tools</p>
                        <p className="mt-2 text-2xl font-semibold">
                            {totalTools}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <p className="text-xs text-blue-100">
                            Tools Under Maintenance
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {toolsUnderMaintenance}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <p className="text-xs text-blue-100">Borrowed Items</p>
                        <p className="mt-2 text-2xl font-semibold">
                            {borrowedItemsCount}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

