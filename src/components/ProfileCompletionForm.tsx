'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/app/actions/updateUser';

export default function ProfileCompletionForm({ user }: { user: any }) {
    const [category, setCategory] = useState(user?.category || 'student');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append('category', category);

        await updateUserProfile(formData);
        setLoading(false);
    }

    return (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Complete Your Profile</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Please provide a few more details to set up your RAMS account.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Category Toggle */}
                <div>
                    <label>Category</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                checked={category === 'student'}
                                onChange={() => setCategory('student')}
                                style={{ width: 'auto' }}
                            />
                            Student
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                checked={category === 'others'}
                                onChange={() => setCategory('others')}
                                style={{ width: 'auto' }}
                            />
                            Others (Staff/Guest)
                        </label>
                    </div>
                </div>

                {/* Conditional Fields based on Student */}
                {category === 'student' && (
                    <>
                        <div>
                            <label>Are you a Muslim Student?</label>
                            <select name="isMuslim" required defaultValue="true" title="Are you a Muslim?">
                                <option value="true">Yes, I am</option>
                                <option value="false">No, I am not</option>
                            </select>
                        </div>

                        <div>
                            <label>Matric Number</label>
                            <input type="text" name="matricNumber" placeholder="e.g. 21/0000000" />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label>Level</label>
                                <select name="level" required title="Select Level">
                                    <option value="">Select Level</option>
                                    <option value="100">100 Level</option>
                                    <option value="200">200 Level</option>
                                    <option value="300">300 Level</option>
                                    <option value="400">400 Level</option>
                                    <option value="500">500 Level</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Department</label>
                                <input type="text" name="department" placeholder="e.g. Computer Science" />
                            </div>
                        </div>
                    </>
                )}

                {/* Common Fields */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label>Gender</label>
                        <select name="gender" required defaultValue={user?.gender || ""} title="Select Gender">
                            <option value="" disabled>Select Gender</option>
                            <option value="brother">Brother (Male)</option>
                            <option value="sister">Sister (Female)</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Phone Number</label>
                        <input type="tel" name="phoneNumber" placeholder="08000000000" required defaultValue={user?.phoneNumber || ""} />
                    </div>
                </div>

                <button type="submit" className="btn-primary mt-4" disabled={loading}>
                    {loading ? 'Saving Profile...' : 'Complete Profile'}
                </button>
            </form>
        </div>
    );
}
