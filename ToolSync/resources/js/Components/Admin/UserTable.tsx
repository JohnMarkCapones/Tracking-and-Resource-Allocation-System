import { useState, useMemo } from 'react';

export type UserStatus = 'Active' | 'Inactive';
export type UserRole = 'Admin' | 'User';

export type User = {
    id: number;
    name: string;
    email: string;
    department: string;
    departmentId?: number | null;
    role: UserRole;
    status: UserStatus;
    activeBorrowings: number;
    totalBorrowings: number;
    joinedAt: string;
};

type UserTableProps = {
    users: User[];
    onEdit: (user: User) => void;
    onToggleStatus: (user: User) => void;
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
};

type SortKey = 'name' | 'department' | 'role' | 'status' | 'totalBorrowings';

function statusClasses(status: UserStatus): string {
    if (status === 'Active') {
        return 'bg-emerald-50 text-emerald-700';
    }

    return 'bg-gray-100 text-gray-500';
}

function roleClasses(role: UserRole): string {
    if (role === 'Admin') {
        return 'bg-purple-50 text-purple-700';
    }

    return 'bg-blue-50 text-blue-700';
}

export function UserTable({ users, onEdit, onToggleStatus, selectedIds, onSelectionChange }: UserTableProps) {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortKey>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const filteredAndSorted = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = users.filter((user) => {
            if (!query) return true;
            const haystack = `${user.name} ${user.email} ${user.department}`.toLowerCase();
            return haystack.includes(query);
        });

        return [...filtered].sort((a, b) => {
            const direction = sortDir === 'asc' ? 1 : -1;

            if (sortBy === 'totalBorrowings') {
                return (a.totalBorrowings - b.totalBorrowings) * direction;
            }

            const aValue = a[sortBy] as string;
            const bValue = b[sortBy] as string;
            return aValue.localeCompare(bValue) * direction;
        });
    }, [users, search, sortBy, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filteredAndSorted.slice(startIndex, startIndex + pageSize);

    const toggleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(key);
            setSortDir('asc');
        }
    };

    const allSelected = paginated.length > 0 && paginated.every((user) => selectedIds.includes(user.id));

    const toggleAll = () => {
        if (allSelected) {
            onSelectionChange(selectedIds.filter((id) => !paginated.some((user) => user.id === id)));
        } else {
            const newIds = paginated.map((user) => user.id).filter((id) => !selectedIds.includes(id));
            onSelectionChange([...selectedIds, ...newIds]);
        }
    };

    const toggleOne = (id: number) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((sid) => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center rounded-full bg-gray-50 px-3 py-1.5 text-xs text-gray-500 shadow-sm">
                    <svg className="mr-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-48 border-none bg-transparent text-xs outline-none placeholder:text-gray-400"
                    />
                </div>
                <p className="text-[11px] text-gray-500">{filteredAndSorted.length} users total</p>
            </div>

            <div className="max-h-[460px] overflow-x-auto overflow-y-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b bg-white/90 text-xs font-medium tracking-wide text-gray-500 uppercase backdrop-blur">
                        <tr>
                            <th className="py-3 pr-2">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            <th className="py-3 pr-4">
                                <button
                                    type="button"
                                    onClick={() => toggleSort('name')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                >
                                    User
                                    {sortBy === 'name' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            </th>
                            <th className="py-3 pr-4">
                                <button
                                    type="button"
                                    onClick={() => toggleSort('department')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                >
                                    Department
                                    {sortBy === 'department' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            </th>
                            <th className="py-3 pr-4">
                                <button
                                    type="button"
                                    onClick={() => toggleSort('role')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                >
                                    Role
                                    {sortBy === 'role' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            </th>
                            <th className="py-3 pr-4">
                                <button
                                    type="button"
                                    onClick={() => toggleSort('status')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                >
                                    Status
                                    {sortBy === 'status' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            </th>
                            <th className="py-3 pr-4">Active</th>
                            <th className="py-3 pr-4">
                                <button
                                    type="button"
                                    onClick={() => toggleSort('totalBorrowings')}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
                                >
                                    Total
                                    {sortBy === 'totalBorrowings' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            </th>
                            <th className="py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="align-middle text-xs text-gray-700">
                        {paginated.map((user, index) => {
                            const isSelected = selectedIds.includes(user.id);

                            return (
                                <tr
                                    key={user.id}
                                    className={`border-b last:border-0 ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } ${isSelected ? 'bg-blue-50' : ''} hover:bg-gray-100/80`}
                                >
                                    <td className="py-3 pr-2">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleOne(user.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-[11px] text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4">{user.department}</td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${roleClasses(user.role)}`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusClasses(user.status)}`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-center">{user.activeBorrowings}</td>
                                    <td className="py-3 pr-4 text-center">{user.totalBorrowings}</td>
                                    <td className="py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(user)}
                                                className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onToggleStatus(user)}
                                                className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                                                    user.status === 'Active'
                                                        ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                            >
                                                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredAndSorted.length > 0 && (
                <footer className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
                    <p>
                        Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(startIndex + pageSize, filteredAndSorted.length)}</span> of{' '}
                        <span className="font-semibold">{filteredAndSorted.length}</span> users
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span>
                            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
}
