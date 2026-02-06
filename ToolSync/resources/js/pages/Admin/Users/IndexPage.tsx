import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { UserTable, type User } from '@/Components/Admin/UserTable';
import { EmptyState } from '@/Components/EmptyState';
import { toast } from '@/Components/Toast';
import AppLayout from '@/Layouts/AppLayout';
import { apiRequest } from '@/lib/http';

type AdminUsersPageProps = {
    users: User[];
};

export default function IndexPage() {
    const { users: initialUsers } = usePage<AdminUsersPageProps>().props;

    const [users, setUsers] = useState<User[]>(initialUsers);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        let cancelled = false;

        apiRequest<{ data: User[] }>('/api/admin/users')
            .then((response) => {
                if (!cancelled) {
                    setUsers(response.data);
                }
            })
            .catch(() => {
                // We keep the initial Inertia-provided data if the API call fails.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleEdit = (user: User) => {
        toast(`Edit user: ${user.name}`, { icon: '✏️' });
    };

    const handleToggleStatus = async (user: User) => {
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

        try {
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));

            await apiRequest<{ message: string }>(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                body: {
                    status: newStatus === 'Active' ? 'ACTIVE' : 'INACTIVE',
                },
            });

            if (newStatus === 'Active') {
                toast.success(`${user.name} has been activated`);
            } else {
                toast(`${user.name} has been deactivated`, { icon: '⚠️' });
            }
        } catch (error) {
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u)));
            const message = error instanceof Error ? error.message : 'Failed to update user status.';
            toast.error(message);
        }
    };

    const updateStatusForIds = async (ids: number[], targetStatus: 'ACTIVE' | 'INACTIVE') => {
        if (ids.length === 0) return;

        const makeOptimisticStatus = targetStatus === 'ACTIVE' ? 'Active' : 'Inactive';

        setUsers((prev) =>
            prev.map((user) => (ids.includes(user.id) ? { ...user, status: makeOptimisticStatus as User['status'] } : user)),
        );

        try {
            await Promise.all(
                ids.map((id) =>
                    apiRequest<{ message: string }>(`/api/admin/users/${id}`, {
                        method: 'PUT',
                        body: { status: targetStatus },
                    }),
                ),
            );

            toast.success(
                targetStatus === 'ACTIVE'
                    ? `${ids.length} users have been activated`
                    : `${ids.length} users have been deactivated`,
            );
        } catch (error) {
            // On failure, trigger a refetch to get authoritative server state.
            try {
                const response = await apiRequest<{ data: User[] }>('/api/admin/users');
                setUsers(response.data);
            } catch {
                // If even refetch fails, leave optimistic state and surface error.
            }

            const message = error instanceof Error ? error.message : 'Failed to update some user statuses.';
            toast.error(message);
        } finally {
            setSelectedIds([]);
        }
    };

    const handleBulkActivate = () => {
        void updateStatusForIds(selectedIds, 'ACTIVE');
    };

    const handleBulkDeactivate = () => {
        void updateStatusForIds(selectedIds, 'INACTIVE');
    };

    const activeUsers = users.filter((u) => u.status === 'Active').length;
    const totalBorrowings = users.reduce((acc, u) => acc + u.activeBorrowings, 0);

    return (
        <AppLayout
            variant="admin"
            activeRoute="admin-users"
            header={
                <>
                    <p className="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">User management</p>
                    <h1 className="text-2xl font-semibold text-gray-900">Manage system users and permissions</h1>
                </>
            }
        >
            <Head title="User Management" />

            <div className="space-y-6">
                <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">User overview</p>
                        <p className="text-sm text-gray-700">
                            {users.length} users registered. <span className="text-emerald-600">{activeUsers} active</span>, {totalBorrowings} active
                            borrowings.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                toast('Invite user feature coming soon!', {
                                    icon: '📧',
                                })
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            Invite User
                        </button>
                    </div>
                </section>

                {selectedIds.length > 0 && (
                    <section className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 text-sm">
                        <p className="text-blue-800">
                            <span className="font-semibold">{selectedIds.length}</span> {selectedIds.length === 1 ? 'user' : 'users'} selected
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleBulkActivate}
                                className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50"
                            >
                                Activate
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkDeactivate}
                                className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-medium text-amber-600 hover:bg-amber-50"
                            >
                                Deactivate
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </section>
                )}

                {users.length === 0 ? (
                    <EmptyState
                        icon={
                            <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
                                <path
                                    d="M8 32C8 26.4772 13.3726 22 20 22C26.6274 22 32 26.4772 32 32"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        }
                        title="No users found"
                        description="Get started by inviting your first user to the system."
                        action={{
                            label: 'Invite First User',
                            onClick: () =>
                                toast('Invite user feature coming soon!', {
                                    icon: '📧',
                                }),
                        }}
                    />
                ) : (
                    <UserTable
                        users={users}
                        onEdit={handleEdit}
                        onToggleStatus={handleToggleStatus}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                    />
                )}
            </div>
        </AppLayout>
    );
}
