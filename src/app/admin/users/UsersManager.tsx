'use client'

import { useState } from 'react';
import { updateUserRole } from '@/app/actions/userActions';
import { Search } from 'lucide-react';

export default function UsersManager({ initialUsers }: { initialUsers: { id: string, email: string, firstName: string | null, lastName: string | null, role: string, matricNumber: string | null, level: string | null, category: string | null }[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    // Client-side filtering for quick response
    const filteredUsers = initialUsers.filter(u =>
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.matricNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRoleChange = async (id: string, role: string) => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        await updateUserRole(id, role as "super_admin" | "admin" | "coordinator" | "user");
        setLoadingMap(prev => ({ ...prev, [id]: false }));
    };

    return (
        <div>
            <div className="flex justify-between items-center gap-4 mb-8 admin-header">
                <h1 className="text-h1 text-mssn-green-dark">User Management</h1>
                <div className="relative w-300">
                    <Search size={18} className="absolute left-3 top-50 translate-y-50-rev text-secondary" />
                    <input
                        type="text"
                        title="Search Users"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="glass-card p-0 overflow-hidden table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Matric/Level</th>
                            <th className="text-right">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan={4} className="p-12 text-center text-secondary">No users found.</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="font-medium">
                                    {user.firstName} {user.lastName} <br />
                                    <span className="text-xs text-secondary">{user.category ? user.category.charAt(0).toUpperCase() + user.category.slice(1) : ''}</span>
                                </td>
                                <td className="text-secondary text-sm">{user.email}</td>
                                <td>
                                    <div className="text-sm">{user.matricNumber || 'N/A'}</div>
                                    <div className="text-xs text-secondary">{user.level ? `${user.level}L` : ''}</div>
                                </td>
                                <td className="text-right">
                                    <select
                                        title={`Change role for ${user.firstName}`}
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={loadingMap[user.id]}
                                        className="py-1.5 px-3 rounded-lg border border-gray font-medium text-sm bg-white text-primary outline-none focus:border-mssn-green"
                                    >
                                        <option value="user">USER</option>
                                        <option value="coordinator">COORDINATOR</option>
                                        <option value="admin">ADMIN</option>
                                        <option value="super_admin">SUPER ADMIN</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
