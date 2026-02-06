type ActivityType = 'request' | 'approved' | 'picked_up' | 'returned' | 'overdue' | 'maintenance' | 'created' | 'updated' | 'deleted';

type ActivityItem = {
    id: number;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: string;
    user?: string;
    toolName?: string;
};

type ActivityTimelineProps = {
    activities: ActivityItem[];
    maxItems?: number;
};

const typeConfig: Record<ActivityType, { color: string; icon: string }> = {
    request: { color: 'bg-blue-500', icon: 'M3 8L10 1L17 8M10 1V16' },
    approved: { color: 'bg-emerald-500', icon: 'M4 8L8 12L16 4' },
    picked_up: { color: 'bg-indigo-500', icon: 'M5 10L10 15L15 5' },
    returned: { color: 'bg-teal-500', icon: 'M10 2V14M4 8L10 14L16 8' },
    overdue: { color: 'bg-rose-500', icon: 'M10 4V10M10 14V14.01' },
    maintenance: { color: 'bg-amber-500', icon: 'M7 4L4 7L6 9L9 6M11 5L15 9L13 11L9 7' },
    created: { color: 'bg-purple-500', icon: 'M10 4V16M4 10H16' },
    updated: { color: 'bg-cyan-500', icon: 'M4 12L8 8L12 12L16 8' },
    deleted: { color: 'bg-gray-500', icon: 'M4 4L16 16M16 4L4 16' },
};

export function ActivityTimeline({ activities, maxItems }: ActivityTimelineProps) {
    const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

    return (
        <div className="space-y-0">
            {displayActivities.map((activity, index) => {
                const config = typeConfig[activity.type];
                const isLast = index === displayActivities.length - 1;

                return (
                    <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${config.color}`}>
                                <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d={config.icon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            {!isLast && <div className="h-full w-px bg-gray-200 dark:bg-gray-700" style={{ minHeight: '24px' }} />}
                        </div>
                        <div className={`${isLast ? 'pb-0' : 'pb-4'} flex-1`}>
                            <p className="text-xs font-medium text-gray-900 dark:text-white">{activity.title}</p>
                            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{activity.description}</p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
                                <span>{activity.timestamp}</span>
                                {activity.user && (
                                    <>
                                        <span>·</span>
                                        <span>{activity.user}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export const MOCK_USER_ACTIVITIES: ActivityItem[] = [
    {
        id: 1,
        type: 'request',
        title: 'Borrowing requested',
        description: 'Requested MacBook Pro 14" (LP-0001)',
        timestamp: '2 hours ago',
        toolName: 'MacBook Pro 14"',
    },
    {
        id: 2,
        type: 'approved',
        title: 'Request approved',
        description: 'Borrowing request for Oscilloscope approved',
        timestamp: '5 hours ago',
        toolName: 'Oscilloscope',
    },
    {
        id: 3,
        type: 'picked_up',
        title: 'Tool picked up',
        description: 'Picked up Dell XPS 15 from Room 204',
        timestamp: 'Yesterday',
        toolName: 'Dell XPS 15',
    },
    {
        id: 4,
        type: 'returned',
        title: 'Tool returned',
        description: 'Returned Canon EOS R6 in good condition',
        timestamp: '2 days ago',
        toolName: 'Canon EOS R6',
    },
    {
        id: 5,
        type: 'overdue',
        title: 'Overdue notice',
        description: 'HP LaserJet is 1 day overdue',
        timestamp: '3 days ago',
        toolName: 'HP LaserJet',
    },
];

export const MOCK_ADMIN_AUDIT: ActivityItem[] = [
    {
        id: 1,
        type: 'approved',
        title: 'Approved borrowing',
        description: 'Approved Jane Doe request for MacBook Pro',
        timestamp: '1 hour ago',
        user: 'Admin',
    },
    {
        id: 2,
        type: 'created',
        title: 'Tool added',
        description: 'Added new tool: Arduino Mega 2560 (AR-0005)',
        timestamp: '3 hours ago',
        user: 'Admin',
    },
    {
        id: 3,
        type: 'maintenance',
        title: 'Maintenance scheduled',
        description: 'Scheduled maintenance for 3D Printer',
        timestamp: '5 hours ago',
        user: 'Admin',
    },
    { id: 4, type: 'updated', title: 'User role changed', description: 'Changed John Smith role to Manager', timestamp: 'Yesterday', user: 'Admin' },
    { id: 5, type: 'deleted', title: 'Tool retired', description: 'Retired old oscilloscope (OS-0001)', timestamp: '2 days ago', user: 'Admin' },
    {
        id: 6,
        type: 'request',
        title: 'New borrowing request',
        description: 'Bob Williams requested Drill Press',
        timestamp: '2 days ago',
        user: 'Bob Williams',
    },
    {
        id: 7,
        type: 'returned',
        title: 'Tool returned',
        description: 'Carol Davis returned Multimeter (OK condition)',
        timestamp: '3 days ago',
        user: 'Carol Davis',
    },
];
