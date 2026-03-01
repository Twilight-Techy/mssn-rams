'use client'

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateUserRole, toggleBlacklist, updateUserDetails, deleteUser } from '@/app/actions/userActions';
import { Search, Ban, ShieldCheck, Edit, Trash2, X } from 'lucide-react';

type User = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    matricNumber: string | null;
    level: string | null;
    classification: string | null;
    category: string | null;
    isBlacklisted: boolean;
    gender: string | null;
    isMuslim: boolean | null;
    department: string | null;
    phoneNumber: string | null;
};

export default function UsersManager({ initialUsers }: { initialUsers: User[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<'all' | 'muslim_student' | 'others'>('all');
    const [filterGender, setFilterGender] = useState<'all' | 'brother' | 'sister'>('all');
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [users, setUsers] = useState(initialUsers);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        firstName: '', lastName: '', matricNumber: '', gender: 'brother', classification: 'full_time_undergraduate', level: '100', category: 'muslim_student', department: '', phoneNumber: ''
    });

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Portal Mount State
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Client-side filtering for quick response
    // Client-side filtering for quick response
    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.matricNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' ||
            (filterCategory === 'muslim_student' && u.isMuslim === true && u.category === 'student') ||
            (filterCategory === 'others' && u.category === 'others');
        const matchesGender = filterGender === 'all' || u.gender?.toLowerCase() === filterGender;

        return matchesSearch && matchesCategory && matchesGender;
    });

    const getDescriptiveCount = () => {
        const count = filteredUsers.length;
        let noun = 'Users';
        if (filterCategory === 'muslim_student') {
            if (filterGender === 'brother') noun = 'Muslim Brothers';
            else if (filterGender === 'sister') noun = 'Muslim Sisters';
            else noun = 'Muslim Students';
        } else if (filterCategory === 'others') {
            if (filterGender === 'brother') noun = 'Male Others';
            else if (filterGender === 'sister') noun = 'Female Others';
            else noun = 'Others';
        } else {
            if (filterGender === 'brother') noun = 'Brothers';
            else if (filterGender === 'sister') noun = 'Sisters';
        }
        return `${count} ${noun}`;
    };

    const handleRoleChange = async (id: string, role: string) => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        const result = await updateUserRole(id, role as "super_admin" | "admin" | "coordinator" | "user");
        if (result?.success) {
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
        }
        setLoadingMap(prev => ({ ...prev, [id]: false }));
    };

    const handleBlacklistToggle = async (id: string, currentStatus: boolean) => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        const result = await toggleBlacklist(id, !currentStatus);
        if (result?.success) {
            setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlacklisted: !currentStatus } : u));
        }
        setLoadingMap(prev => ({ ...prev, [id]: false }));
    };

    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        const id = userToDelete.id;

        setLoadingMap(prev => ({ ...prev, [id + '_del']: true }));
        const result = await deleteUser(id);
        if (result?.success) {
            setUsers(prev => prev.filter(u => u.id !== id));
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } else {
            alert(result?.error || 'Failed to delete user.');
        }
        setLoadingMap(prev => ({ ...prev, [id + '_del']: false }));
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        const initialCategory = user.category === 'student' && user.isMuslim ? 'muslim_student' : user.category === 'others' ? 'others' : 'muslim_student';

        setEditForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            matricNumber: user.matricNumber || '',
            gender: user.gender || 'brother',
            classification: user.classification || 'full_time_undergraduate',
            level: user.level || '100',
            category: initialCategory,
            department: user.department || '',
            phoneNumber: user.phoneNumber || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setLoadingMap(prev => ({ ...prev, [editingUser.id + '_edit']: true }));
        const result = await updateUserDetails(editingUser.id, editForm);

        if (result?.success) {
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
            setIsEditModalOpen(false);
        } else {
            alert(result?.error || 'Failed to update user details.');
        }
        setLoadingMap(prev => ({ ...prev, [editingUser.id + '_edit']: false }));
    };

    return (
        <div>
            <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 admin-header">
                    <div>
                        <h1 className="text-h1 text-mssn-green-dark">User Management</h1>
                        <p className="text-secondary mt-1">{getDescriptiveCount()}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 admin-filters">
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filterGender}
                                onChange={(e) => setFilterGender(e.target.value as 'all' | 'brother' | 'sister')}
                                className="py-2 px-3 pr-8 border border-black-10 rounded-lg bg-white text-sm"
                                title="Filter by Gender"
                                aria-label="Filter by Gender"
                            >
                                <option value="all">All Genders</option>
                                <option value="brother">Brothers</option>
                                <option value="sister">Sisters</option>
                            </select>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value as 'all' | 'muslim_student' | 'others')}
                                className="py-2 px-3 pr-8 border border-black-10 rounded-lg bg-white text-sm"
                                title="Filter by Category"
                                aria-label="Filter by Category"
                            >
                                <option value="all">All Categories</option>
                                <option value="muslim_student">Muslim Students</option>
                                <option value="others">Others (Staff/Guest)</option>
                            </select>
                        </div>
                        <div className="relative w-full sm:w-300 xl:w-auto">
                            <Search size={18} className="absolute left-3 top-50 translate-y-50-rev text-secondary" />
                            <input
                                type="text"
                                title="Search Users"
                                placeholder="Search Name, Matric, or Email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full xl:w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-0 overflow-hidden table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Matric/Class</th>
                                <th>Status & Role</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-secondary">No users found.</td></tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} className={user.isBlacklisted ? 'blacklisted-row' : ''}>
                                    <td data-label="Name" className="font-medium">
                                        {user.firstName} {user.lastName} <br />
                                        <span className="text-xs text-secondary">{user.category ? user.category.charAt(0).toUpperCase() + user.category.slice(1) : ''}</span>
                                    </td>
                                    <td data-label="Email" className="text-secondary text-sm">{user.email}</td>
                                    <td data-label="Matric/Class">
                                        <div className="text-sm">{user.matricNumber || 'N/A'}</div>
                                        <div className="text-xs text-secondary">
                                            {user.classification ? user.classification.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''}
                                            {user.level ? ` (${user.level}${user.level.includes('Diploma') ? '' : 'L'})` : ''}
                                        </div>
                                    </td>
                                    <td data-label="Status & Role">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleBlacklistToggle(user.id, user.isBlacklisted)}
                                                disabled={loadingMap[user.id]}
                                                className={`btn-sm flex items-center justify-center gap-1 ${user.isBlacklisted ? 'btn-blacklisted' : 'btn-active-user'}`}
                                                title={user.isBlacklisted ? 'Unblacklist user' : 'Blacklist user'}
                                            >
                                                {loadingMap[user.id] ? '...' : user.isBlacklisted ? (
                                                    <><Ban size={14} /> Blacklisted</>
                                                ) : (
                                                    <><ShieldCheck size={14} /> Active</>
                                                )}
                                            </button>
                                            <select
                                                title={`Change role for ${user.firstName}`}
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={loadingMap[user.id]}
                                                className="py-1 px-2 rounded-md border border-gray font-medium text-xs bg-white text-primary outline-none focus:border-mssn-green"
                                            >
                                                <option value="user">USER</option>
                                                <option value="coordinator">COORDINATOR</option>
                                                <option value="admin">ADMIN</option>
                                                <option value="super_admin">SUPER ADMIN</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td data-label="Actions" className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-mssn-green bg-mssn-green-10 hover:bg-mssn-green/20 rounded-lg transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                disabled={loadingMap[user.id + '_del']}
                                                className="p-2 text-error bg-error-light hover:bg-error/20 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Edit User Modal */}
                {mounted && isEditModalOpen && editingUser && createPortal(
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header">
                                <div>
                                    <h2 className="text-xl font-bold text-mssn-green-dark">Edit User Profile</h2>
                                    <p className="text-sm text-secondary">{editingUser.email}</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-secondary hover:text-black transition-colors" title="Close Modal" aria-label="Close Modal">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-secondary">First Name</label>
                                            <input required type="text" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} className="w-full" title="First Name" placeholder="First Name" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-secondary">Last Name</label>
                                            <input required type="text" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full" title="Last Name" placeholder="Last Name" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-secondary">Category</label>
                                            <select value={editForm.category} onChange={e => {
                                                setEditForm({ ...editForm, category: e.target.value });
                                                if (e.target.value !== 'muslim_student') setEditForm(prev => ({ ...prev, classification: '', department: '', level: '' }));
                                            }} className="w-full p-3 rounded-lg border border-black-10 bg-white" title="Category" aria-label="Category">
                                                <option value="muslim_student">Muslim Student</option>
                                                <option value="others">Others (Staff, Guest, Non-Muslim)</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-secondary">Gender</label>
                                            <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} className="w-full p-3 rounded-lg border border-black-10 bg-white" title="Gender" aria-label="Gender">
                                                <option value="brother">Brother (Male)</option>
                                                <option value="sister">Sister (Female)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-secondary">Phone Number</label>
                                            <input type="tel" value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} className="w-full" title="Phone Number" placeholder="08000000000" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-secondary">Matric Number</label>
                                            <input type="text" value={editForm.matricNumber} onChange={e => setEditForm({ ...editForm, matricNumber: e.target.value })} className="w-full" title="Matric Number" placeholder="Matric Number" />
                                        </div>
                                    </div>

                                    {editForm.category === 'muslim_student' && (
                                        <>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-sm font-medium text-secondary">Classification</label>
                                                <select value={editForm.classification} onChange={e => setEditForm({ ...editForm, classification: e.target.value })} className="w-full p-3 rounded-lg border border-black-10 bg-white" title="Classification" aria-label="Classification">
                                                    <option value="" disabled>Select Classification</option>
                                                    <option value="full_time_undergraduate">Full Time Undergraduate</option>
                                                    <option value="diploma">Diploma</option>
                                                    <option value="part_time">Part Time</option>
                                                    <option value="masters">Masters</option>
                                                    <option value="pds">PDS</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {(editForm.classification === 'full_time_undergraduate' || editForm.classification === 'diploma') && (
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-sm font-medium text-secondary">Level/Year</label>
                                                        <select value={editForm.level} onChange={e => setEditForm({ ...editForm, level: e.target.value })} className="w-full p-3 rounded-lg border border-black-10 bg-white" title="Level/Year" aria-label="Level/Year">
                                                            <option value="" disabled>Select Level</option>
                                                            {editForm.classification === 'full_time_undergraduate' ? (
                                                                <>
                                                                    <option value="100">100 Level</option>
                                                                    <option value="200">200 Level</option>
                                                                    <option value="300">300 Level</option>
                                                                    <option value="400">400 Level</option>
                                                                    <option value="500">500 Level</option>
                                                                </>
                                                            ) : editForm.classification === 'diploma' ? (
                                                                <>
                                                                    <option value="Diploma I">Diploma I</option>
                                                                    <option value="Diploma II">Diploma II</option>
                                                                </>
                                                            ) : null}
                                                        </select>
                                                    </div>
                                                )}
                                                {editForm.classification === 'full_time_undergraduate' && (
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-sm font-medium text-secondary">Department</label>
                                                        <select value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} className="w-full p-3 rounded-lg border border-black-10 bg-white" title="Department" aria-label="Department">
                                                            <option value="" disabled>Select Department</option>
                                                            <optgroup label="Faculty of Engineering">
                                                                <option value="Electronics and Computer Engineering">Electronics &amp; Computer Eng.</option>
                                                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                                                <option value="Chemical Engineering">Chemical Engineering</option>
                                                                <option value="Aerospace Engineering">Aerospace Engineering</option>
                                                                <option value="Civil Engineering">Civil Engineering</option>
                                                                <option value="Industrial and Systems Engineering">Industrial &amp; Systems Eng.</option>
                                                            </optgroup>
                                                            <optgroup label="School of Agriculture">
                                                                <option value="Animal Science">Animal Science</option>
                                                                <option value="Crop Production">Crop Production</option>
                                                                <option value="Agricultural Economics and Farm Management">Agric. Economics &amp; Farm Mgmt</option>
                                                                <option value="Agricultural Extension">Agricultural Extension</option>
                                                            </optgroup>
                                                            <optgroup label="Faculty of Environmental Science">
                                                                <option value="Quantity Surveying">Quantity Surveying</option>
                                                                <option value="Fine Art">Fine Art</option>
                                                                <option value="Industrial Design">Industrial Design</option>
                                                                <option value="Survey and Geo Informatics">Survey &amp; Geo Informatics</option>
                                                                <option value="Urban and Rural Planning">Urban &amp; Rural Planning</option>
                                                                <option value="Estate Management">Estate Management</option>
                                                                <option value="Environmental Management">Environmental Management</option>
                                                                <option value="Architecture">Architecture</option>
                                                            </optgroup>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-4 flex gap-3 justify-end border-t border-black-10 pt-4">
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-outline border-secondary text-secondary px-6">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={loadingMap[editingUser.id + '_edit']} className="btn-primary px-8">
                                            {loadingMap[editingUser.id + '_edit'] ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
                {/* Delete Confirmation Modal */}
                {mounted && isDeleteModalOpen && userToDelete && createPortal(
                    <div className="modal-overlay">
                        <div className="modal-container modal-container-sm">
                            <div className="modal-body text-center">
                                <div className="w-16 h-16 bg-error-light text-error rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-mssn-green-dark mb-2">Delete User?</h2>
                                <p className="text-sm text-secondary mb-6">
                                    Are you sure you want to completely delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>? This action cannot be undone.
                                </p>

                                <div className="flex gap-3 justify-center w-full mt-4">
                                    <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="btn-outline w-full modal-btn">
                                        Cancel
                                    </button>
                                    <button type="button" onClick={confirmDelete} disabled={loadingMap[userToDelete.id + '_del']} className="btn-danger w-full modal-btn">
                                        {loadingMap[userToDelete.id + '_del'] ? 'Deleting...' : 'Yes, Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
}
