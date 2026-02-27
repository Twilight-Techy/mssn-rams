'use client'

import { useState } from 'react';
import { toggleServedStatus, searchUsersForAttendance, markManualAttendance, registerOfflineUser } from '@/app/actions/attendanceActions';
import { toggleBlacklist } from '@/app/actions/userActions';
import { Search, Undo2, Check, UserPlus, X, AlertCircle, Ban, ShieldCheck } from 'lucide-react';


export default function LiveFeed({ initialRecords }: { initialRecords: { id: string, status: string, checkInTime: string, servedAt?: string | null, user: { id: string, firstName: string | null, lastName: string | null, matricNumber: string | null, gender: string | null, level: string | null, classification: string | null, isMuslim: boolean | null, category: string | null, isBlacklisted?: boolean } }[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'marked' | 'served'>('all');
    const [filterCategory, setFilterCategory] = useState<'all' | 'muslim_student' | 'others'>('all');
    const [filterGender, setFilterGender] = useState<'all' | 'brother' | 'sister'>('all');
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});


    const filteredRecords = initialRecords.filter(r => {
        const matchesSearch = (r.user.firstName + ' ' + r.user.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.user.matricNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
        const matchesCategory = filterCategory === 'all' ||
            (filterCategory === 'muslim_student' && r.user.isMuslim === true && r.user.category === 'student') ||
            (filterCategory === 'others' && r.user.category === 'others');
        const matchesGender = filterGender === 'all' || r.user.gender?.toLowerCase() === filterGender;
        return matchesSearch && matchesStatus && matchesCategory && matchesGender;
    });

    const handleToggle = async (id: string, currentStatus: 'marked' | 'served') => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        await toggleServedStatus(id, currentStatus);
        setLoadingMap(prev => ({ ...prev, [id]: false }));
        // router.refresh() occurs implicitly from server action revalidatePath
    };

    const handleBlacklistToggle = async (userId: string, currentStatus: boolean) => {
        setLoadingMap(prev => ({ ...prev, [userId + '_bl']: true }));
        await toggleBlacklist(userId, !currentStatus);
        setLoadingMap(prev => ({ ...prev, [userId + '_bl']: false }));
    };

    // Manual Attendance State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<{ id: string, firstName: string | null, lastName: string | null, matricNumber: string | null, level: string | null }[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [markingUserId, setMarkingUserId] = useState<string | null>(null);

    // Offline Registration State
    const [showOfflineForm, setShowOfflineForm] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [offlineData, setOfflineData] = useState<{
        firstName: string; lastName: string; email: string; matricNumber: string; gender: 'Brother' | 'Sister'; level: string; classification: string;
    }>({
        firstName: '', lastName: '', email: '', matricNumber: '', gender: 'Brother', level: '100', classification: 'full_time_undergraduate'
    });

    const handleUserSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setUserSearchQuery(query);
        if (query.length < 2) {
            setUserSearchResults([]);
            return;
        }

        setSearchingUsers(true);
        const results = await searchUsersForAttendance(query);
        setUserSearchResults(results);
        setSearchingUsers(false);
        setShowOfflineForm(results.length === 0 && query.length > 3);
    };

    const handleMarkManual = async (userId: string) => {
        setMarkingUserId(userId);
        const res = await markManualAttendance(userId);
        setMarkingUserId(null);

        if (res.success) {
            setIsModalOpen(false);
            setUserSearchQuery('');
            setUserSearchResults([]);
        } else {
            alert(res.error || 'Failed to mark attendance');
        }
    };

    const handleOfflineRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        const res = await registerOfflineUser(offlineData);
        setIsRegistering(false);

        if (res.success) {
            setIsModalOpen(false);
            setUserSearchQuery('');
            setShowOfflineForm(false);
            setOfflineData({ firstName: '', lastName: '', email: '', matricNumber: '', gender: 'Brother', level: '100', classification: 'full_time_undergraduate' });
        } else {
            alert(res.error || 'Failed to register offline user');
        }
    };

    const getDescriptiveCount = () => {
        const count = filteredRecords.length;
        let noun = 'records';
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

        let statusStr = 'Checked In';
        if (filterStatus === 'marked') statusStr = 'To Serve';
        else if (filterStatus === 'served') statusStr = 'Served';

        return `${count} ${noun} ${statusStr}`;
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-h1 text-mssn-green-dark">Live Attendance</h1>
                <div className="flex flex-col sm:flex-row gap-4 admin-filters">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-outline border-mssn-green text-mssn-green py-2 px-4 whitespace-nowrap flex items-center gap-2"
                    >
                        <UserPlus size={18} /> Manual Check-in
                    </button>
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'marked' | 'served')}
                            className="py-2 px-3 pr-8 border border-black-10 rounded-lg bg-white text-sm"
                            title="Filter by Status"
                            aria-label="Filter by Status"
                        >
                            <option value="all">All Status</option>
                            <option value="marked">To Serve (Marked)</option>
                            <option value="served">Served</option>
                        </select>
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
                            placeholder="Search Name or Matric..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full xl:w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <span className="text-sm font-semibold bg-mssn-green-10 text-mssn-green px-4 py-2 rounded-lg border border-mssn-green-20 shadow-sm block w-full text-center">
                    {getDescriptiveCount()}
                </span>
            </div>

            <div className="glass-card p-0 overflow-hidden table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Attendee</th>
                            <th>Matric/Class</th>
                            <th>Check-in</th>
                            <th>Status</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-secondary">No attendees found.</td></tr>
                        ) : filteredRecords.map(record => (
                            <tr key={record.id} className={record.user.isBlacklisted ? 'blacklisted-row' : record.status === 'served' ? 'bg-black-02' : 'bg-transparent'}>
                                <td data-label="Attendee">
                                    <div className="font-semibold">{record.user.firstName} {record.user.lastName}</div>
                                    <div className="text-sm text-secondary">{record.user.gender ? record.user.gender.charAt(0).toUpperCase() + record.user.gender.slice(1) : ''}</div>
                                </td>
                                <td data-label="Matric & Class">
                                    <div>{record.user.matricNumber || 'N/A'}</div>
                                    <div className="text-sm text-secondary">
                                        {record.user.classification ? record.user.classification.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''}
                                        {record.user.level ? ` (${record.user.level}${record.user.level.includes('Diploma') ? '' : 'L'})` : ''}
                                    </div>
                                </td>
                                <td data-label="Check-in" className="text-secondary text-sm">
                                    {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td data-label="Status">
                                    <button
                                        onClick={() => handleBlacklistToggle(record.user.id, record.user.isBlacklisted!)}
                                        disabled={loadingMap[record.user.id + '_bl']}
                                        className={`btn-sm flex items-center gap-1 ${record.user.isBlacklisted ? 'btn-blacklisted' : 'btn-active-user'}`}
                                        title={record.user.isBlacklisted ? 'Unblacklist user' : 'Blacklist user'}
                                    >
                                        {loadingMap[record.user.id + '_bl'] ? '...' : record.user.isBlacklisted ? (
                                            <><Ban size={14} /> Blacklisted</>
                                        ) : (
                                            <><ShieldCheck size={14} /> Active</>
                                        )}
                                    </button>
                                </td>
                                <td data-label="" className="text-right">
                                    {record.status === 'marked' ? (
                                        <button
                                            onClick={() => handleToggle(record.id, record.status as 'marked' | 'served')}
                                            disabled={loadingMap[record.id]}
                                            className="btn-primary py-2 px-4 text-sm"
                                        >
                                            {loadingMap[record.id] ? '...' : <><Check size={16} /> Serve</>}
                                        </button>
                                    ) : (
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-success font-semibold text-sm flex items-center gap-1">
                                                <Check size={14} /> SERVED
                                            </span>
                                            <button
                                                onClick={() => handleToggle(record.id, record.status as 'marked' | 'served')}
                                                disabled={loadingMap[record.id]}
                                                className="btn-outline py-2 px-3 text-sm border-gray text-secondary"
                                                title="Undo Serve"
                                            >
                                                {loadingMap[record.id] ? '...' : <><Undo2 size={14} /> Undo</>}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Manual Check-in Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-black-05 flex justify-between items-center">
                            <h2 className="text-xl">Manual Check-in</h2>
                            <button onClick={() => { setIsModalOpen(false); setShowOfflineForm(false); }} className="text-secondary hover:text-black" title="Close Modal" aria-label="Close Modal">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 bg-glass-bg">
                            <div className="relative w-full mb-6">
                                <Search size={18} className="absolute left-3 top-50 translate-y-50-rev text-secondary" />
                                <input
                                    type="text"
                                    placeholder="Search student by name or matric..."
                                    value={userSearchQuery}
                                    onChange={handleUserSearch}
                                    className="pl-10 w-full"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {searchingUsers ? (
                                    <div className="text-center p-4 text-secondary">Searching...</div>
                                ) : showOfflineForm ? (
                                    <div className="bg-white p-4 rounded-xl border border-black-05 mt-2 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex items-start gap-3 mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                            <p><strong>User not found!</strong> You can fast-track their registration right now. If they use exact same email later, NextAuth will automatically merge this offline profile into their real Google account!</p>
                                        </div>
                                        <form onSubmit={handleOfflineRegistration} className="flex flex-col gap-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <input required type="text" placeholder="First Name" value={offlineData.firstName} onChange={e => setOfflineData({ ...offlineData, firstName: e.target.value })} className="w-full" />
                                                <input required type="text" placeholder="Last Name" value={offlineData.lastName} onChange={e => setOfflineData({ ...offlineData, lastName: e.target.value })} className="w-full" />
                                            </div>
                                            <input required type="email" placeholder="Student's Real Email Address" value={offlineData.email} onChange={e => setOfflineData({ ...offlineData, email: e.target.value })} className="w-full" />
                                            <input type="text" placeholder="Matric Number (Optional)" value={offlineData.matricNumber} onChange={e => setOfflineData({ ...offlineData, matricNumber: e.target.value })} className="w-full" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <select title="Gender" aria-label="Select Gender" value={offlineData.gender} onChange={e => setOfflineData({ ...offlineData, gender: e.target.value as 'Brother' | 'Sister' })} className="w-full p-3 rounded-lg border border-black-10 bg-transparent text-black">
                                                    <option value="Brother">Brother</option>
                                                    <option value="Sister">Sister</option>
                                                </select>
                                                <select title="Classification" aria-label="Select Classification" value={offlineData.classification} onChange={e => setOfflineData({ ...offlineData, classification: e.target.value })} className="w-full p-3 rounded-lg border border-black-10 bg-transparent text-black">
                                                    <option value="full_time_undergraduate">Full Time Undergrad</option>
                                                    <option value="diploma">Diploma</option>
                                                    <option value="part_time">Part Time</option>
                                                    <option value="pds">PDS</option>
                                                </select>
                                            </div>
                                            <button type="submit" disabled={isRegistering} className="btn-primary w-full mt-2">
                                                {isRegistering ? 'Registering...' : 'Register & Mark Present'}
                                            </button>
                                        </form>
                                    </div>
                                ) : userSearchResults.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {userSearchResults.map(u => {
                                            const isAlreadyHere = initialRecords.some(r => r.user.matricNumber === u.matricNumber && r.user.firstName === u.firstName);
                                            return (
                                                <div key={u.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-black-05">
                                                    <div>
                                                        <div className="font-semibold text-sm">{u.firstName} {u.lastName}</div>
                                                        <div className="text-xs text-secondary">{u.matricNumber || 'No Matric'} • {u.level || '?'}L</div>
                                                    </div>
                                                    {isAlreadyHere ? (
                                                        <span className="text-xs font-semibold text-mssn-green px-2 py-1 bg-success-light rounded-full">Checked In</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleMarkManual(u.id)}
                                                            disabled={markingUserId === u.id}
                                                            className="btn-primary py-1.5 px-3 text-xs"
                                                        >
                                                            {markingUserId === u.id ? 'Adding...' : 'Mark Present'}
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : userSearchQuery.length > 0 ? (
                                    <div className="text-center p-4 text-secondary text-sm">Type a longer name to search, or keep typing to show Offline Registration...</div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
