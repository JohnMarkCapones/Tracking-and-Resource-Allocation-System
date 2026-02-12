import { useEffect, useState } from 'react';
import type { User, UserRole, UserStatus } from '@/Components/Admin/UserTable';
import Modal from '@/Components/Modal';
import PasswordInput from '@/Components/PasswordInput';

export type UserDepartmentOption = {
    id: number;
    name: string;
};

export type UserFormData = {
    name: string;
    email: string;
    departmentId: number | null;
    role: UserRole;
    status: UserStatus;
    password: string;
};

type UserFormModalProps = {
    show: boolean;
    user: User | null;
    departments: UserDepartmentOption[];
    saving: boolean;
    onClose: () => void;
    onSave: (data: UserFormData) => void;
};

const ROLE_OPTIONS: UserRole[] = ['Admin', 'User'];
const STATUS_OPTIONS: UserStatus[] = ['Active', 'Inactive'];

export function UserFormModal({ show, user, departments, saving, onClose, onSave }: UserFormModalProps) {
    const isEditing = user !== null;
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        departmentId: null,
        role: 'User',
        status: 'Active',
        password: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

    useEffect(() => {
        if (!show) {
            return;
        }

        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                departmentId: user.departmentId ?? null,
                role: user.role,
                status: user.status,
                password: '',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                departmentId: null,
                role: 'User',
                status: 'Active',
                password: '',
            });
        }

        setErrors({});
    }, [show, user]);

    const validate = (): boolean => {
        const nextErrors: Partial<Record<keyof UserFormData, string>> = {};

        if (!formData.name.trim()) nextErrors.name = 'Name is required.';
        if (!formData.email.trim()) nextErrors.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email.';

        if (!isEditing && formData.password.length < 8) {
            nextErrors.password = 'Password must be at least 8 characters.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        onSave({
            ...formData,
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password.trim(),
        });
    };

    return (
        <Modal show={show} maxWidth="xl" onClose={onClose}>
            <div className="overflow-hidden rounded-lg">
                <div className="bg-gradient-to-r from-slate-900 to-blue-600 px-6 py-4 text-white">
                    <h2 className="text-sm font-semibold">{isEditing ? 'Edit User' : 'Invite User'}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 bg-white px-6 py-5">
                        <div>
                            <label htmlFor="user-name" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Full name
                            </label>
                            <input
                                id="user-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.name ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-gray-50'
                                }`}
                                placeholder="e.g., Juan Dela Cruz"
                            />
                            {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="user-email" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                Email
                            </label>
                            <input
                                id="user-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.email ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-gray-50'
                                }`}
                                placeholder="name@company.com"
                            />
                            {errors.email && <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-1">
                                <label htmlFor="user-role" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                    Role
                                </label>
                                <select
                                    id="user-role"
                                    value={formData.role}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {ROLE_OPTIONS.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-1">
                                <label htmlFor="user-status" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                    Status
                                </label>
                                <select
                                    id="user-status"
                                    value={formData.status}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as UserStatus }))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-1">
                                <label htmlFor="user-department" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                    Department
                                </label>
                                <select
                                    id="user-department"
                                    value={formData.departmentId ?? ''}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            departmentId: e.target.value ? Number(e.target.value) : null,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Unassigned</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="user-password" className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                                {isEditing ? 'New password (optional)' : 'Temporary password'}
                            </label>
                            <PasswordInput
                                id="user-password"
                                value={formData.password}
                                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.password ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-gray-50'
                                }`}
                                placeholder={isEditing ? 'Leave blank to keep current password' : 'At least 8 characters'}
                            />
                            {errors.password && <p className="mt-1 text-[11px] text-rose-600">{errors.password}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
