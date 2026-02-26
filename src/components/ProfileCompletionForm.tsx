'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/app/actions/updateUser';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProfileCompletionForm({ user }: { user: any }) {
    // Derive initial category from existing user data
    const initialType = user?.category === 'student' && user?.isMuslim ? 'muslim_student' : user?.category === 'others' ? 'others' : '';
    const [userType, setUserType] = useState<'muslim_student' | 'others' | ''>(initialType);
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
                    <label>Category</label>
                    <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value as 'muslim_student' | 'others')}
                        title="Select Category"
                        required
                    >
                        <option value="" disabled>Select Category</option>
                        <option value="muslim_student">Muslim Student</option>
                        <option value="others">Others (Staff, Guest, Non-Muslim)</option>
                    </select>
                </div>

                {/* Extra fields only for Muslim Students */}
                {userType === 'muslim_student' && (
                    <>
                        <div>
                            <label>Matric Number</label>
                            <input type="text" name="matricNumber" placeholder="e.g. 210000000" defaultValue={user?.matricNumber || ""} />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label>Level</label>
                                <select name="level" required defaultValue={user?.level || ""} title="Select Level">
                                    <option value="" disabled>Select Level</option>
                                    <option value="100">100 Level</option>
                                    <option value="200">200 Level</option>
                                    <option value="300">300 Level</option>
                                    <option value="400">400 Level</option>
                                    <option value="500">500 Level</option>
                                    <option value="Alumni">Alumni</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label>Department</label>
                                <select name="department" required defaultValue={user?.department || ""} title="Select Department">
                                    <option value="" disabled>Select Department</option>
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
                                    <optgroup label="Faculty of Engineering">
                                        <option value="Electronics and Computer Engineering">Electronics &amp; Computer Eng.</option>
                                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                                        <option value="Chemical Engineering">Chemical Engineering</option>
                                        <option value="Aerospace Engineering">Aerospace Engineering</option>
                                        <option value="Civil Engineering">Civil Engineering</option>
                                        <option value="Industrial and Systems Engineering">Industrial &amp; Systems Eng.</option>
                                    </optgroup>
                                    <optgroup label="Other">
                                        <option value="Diploma">Diploma</option>
                                    </optgroup>
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
