'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/app/actions/updateUser';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProfileCompletionForm({ user }: { user: any }) {
    const [userType, setUserType] = useState<'muslim_student' | 'others'>('muslim_student');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        // Auto-map userType to the DB fields
        if (userType === 'muslim_student') {
            formData.append('category', 'student');
            formData.append('isMuslim', 'true');
        } else {
            formData.append('category', 'others');
            formData.append('isMuslim', 'false');
        }

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

                {/* Simplified Category Toggle */}
                <div>
                    <label>I am a...</label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={userType === 'muslim_student'}
                                onChange={() => setUserType('muslim_student')}
                                className="w-auto"
                            />
                            Muslim Student
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={userType === 'others'}
                                onChange={() => setUserType('others')}
                                className="w-auto"
                            />
                            Others (Staff, Guest, Non-Muslim)
                        </label>
                    </div>
                </div>

                {/* Extra fields only for Muslim Students */}
                {userType === 'muslim_student' && (
                    <>
                        <div>
                            <label>Matric Number</label>
                            <input type="text" name="matricNumber" placeholder="e.g. 210000000" />
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
                                <select name="department" required defaultValue={user?.department || ""} title="Select Department">
                                    <option value="" disabled>Select Department</option>
                                    <option value="Electronics and Computer Engineering">Electronics and Computer Engineering</option>
                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                    <option value="Aerospace Engineering">Aerospace Engineering</option>
                                    <option value="Chemical and Polymer Engineering">Chemical and Polymer Engineering</option>
                                    <option value="Others">Others</option>
                                </select>
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
