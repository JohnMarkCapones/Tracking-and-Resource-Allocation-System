import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/http';
import type { DepartmentApiItem } from '@/lib/apiTypes';

type Department = {
    id: number;
    name: string;
    memberCount: number;
    maxBorrowings: number;
    allowedCategories: string[];
};

type Role = {
    id: number;
    name: string;
    permissions: string[];
    userCount: number;
};

type DepartmentsResponse = { data: DepartmentApiItem[] };

const MOCK_ROLES: Role[] = [
    { id: 1, name: 'Admin', permissions: ['manage_tools', 'manage_users', 'approve_requests', 'view_reports', 'manage_settings'], userCount: 2 },
    { id: 2, name: 'Manager', permissions: ['approve_requests', 'view_reports'], userCount: 5 },
    { id: 3, name: 'Employee', permissions: ['borrow_tools', 'view_catalog'], userCount: 18 },
    { id: 4, name: 'Viewer', permissions: ['view_catalog'], userCount: 3 },
];

const PERMISSION_LABELS: Record<string, string> = {
    manage_tools: 'Manage Tools',
    manage_users: 'Manage Users',
    approve_requests: 'Approve Requests',
    view_reports: 'View Reports',
    manage_settings: 'Manage Settings',
    borrow_tools: 'Borrow Tools',
    view_catalog: 'View Catalog',
};

type Tab = 'departments' | 'roles';

export function UserGroupsPanel() {
    const [activeTab, setActiveTab] = useState<Tab>('departments');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles] = useState(MOCK_ROLES);

    useEffect(() => {
        let cancelled = false;

        apiRequest<DepartmentsResponse>('/api/departments')
            .then((res) => {
                if (cancelled) return;
                setDepartments(
                    (res.data ?? []).map((d) => ({
                        id: d.id,
                        name: d.name,
                        memberCount: 0,
                        maxBorrowings: 0,
                        allowedCategories: [],
                    })),
                );
            })
            .catch(() => {
                if (!cancelled) setDepartments([]);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="space-y-4">
            <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1 py-1 text-[11px] dark:bg-gray-700">
                <button
                    type="button"
                    onClick={() => setActiveTab('departments')}
                    className={`rounded-full px-3 py-1 font-medium ${activeTab === 'departments' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                >
                    Departments
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('roles')}
                    className={`rounded-full px-3 py-1 font-medium ${activeTab === 'roles' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                >
                    Roles & Permissions
                </button>
            </div>

            {activeTab === 'departments' && (
                <div className="space-y-3">
                    {departments.map((dept) => (
                        <div key={dept.id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{dept.name}</p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        {dept.memberCount} members · Max {dept.maxBorrowings} borrowings
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {dept.allowedCategories.map((cat) => (
                                            <span
                                                key={cat}
                                                className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button type="button" className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'roles' && (
                <div className="space-y-3">
                    {roles.map((role) => (
                        <div key={role.id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{role.name}</p>
                                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[9px] font-medium text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                                            {role.userCount} users
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {role.permissions.map((perm) => (
                                            <span
                                                key={perm}
                                                className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            >
                                                {PERMISSION_LABELS[perm] ?? perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button type="button" className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
