'use client'

import { useState } from 'react';
import { updateUserRole } from '@/app/actions/userActions';
import { Search } from 'lucide-react';

export default function UsersManager({ initialUsers }: { initialUsers: any[] }) {
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
        await updateUserRole(id, role as any);
        setLoadingMap(prev => ({ ...prev, [id]: false }));
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--mssn-green-dark)' }}>User Management</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        title="Search Users"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px' }}>Name</th>
                            <th style={{ padding: '16px' }}>Email</th>
                            <th style={{ padding: '16px' }}>Matric/Level</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <td style={{ padding: '16px', fontWeight: 500 }}>{user.firstName} {user.lastName} <br /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.category}</span></td>
                                <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{user.matricNumber || 'N/A'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.level ? `${user.level}L` : ''}</div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <select
                                        title={`Change role for ${user.firstName}`}
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={loadingMap[user.id]}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--glass-border)',
                                            background: user.role === 'super_admin' ? '#FEE2E2' : user.role === 'admin' ? '#FEF4C6' : user.role === 'coordinator' ? '#C6F6D5' : 'white',
                                            color: user.role === 'super_admin' ? '#9B2C2C' : user.role === 'admin' ? '#975A16' : user.role === 'coordinator' ? '#22543D' : 'inherit',
                                            fontWeight: 600,
                                            fontSize: '0.85rem'
                                        }}
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
