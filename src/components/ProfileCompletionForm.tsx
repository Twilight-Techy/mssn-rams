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
        <div className="glass-card p-8 max-w-[600px] mx-auto">
            <h2 className="mb-2">Complete Your Profile</h2>
            <p className="text-secondary mb-8">
                Please provide a few more details to set up your RAMS account.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Category Toggle */}
                <div>
                    <label>Category</label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={category === 'student'}
                                onChange={() => setCategory('student')}
                                className="w-auto"
                            />
                            Student
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={category === 'others'}
                                onChange={() => setCategory('others')}
                                className="w-auto"
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

                        <div className="flex gap-4">
                            <div className="flex-1">
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
                            <div className="flex-1">
                                <label>Department</label>
                                <input type="text" name="department" placeholder="e.g. Computer Science" />
                            </div>
                        </div>
                    </>
                )}

                {/* Common Fields */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label>Gender</label>
                        <select name="gender" required defaultValue={user?.gender || ""} title="Select Gender">
                            <option value="" disabled>Select Gender</option>
                            <option value="brother">Brother (Male)</option>
                            <option value="sister">Sister (Female)</option>
                        </select>
                    </div>
                    <div className="flex-1">
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
