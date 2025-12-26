import { useState } from 'react';
import api from '../api/axios';

const SubmissionForm = ({ problemId, onSubmissionCreated }) => {
    const [formData, setFormData] = useState({
        approach: '',
        thoughtProcess: '',
        pseudocode: '',
        code: '',
        timeComplexity: '',
        spaceComplexity: '',
        optimizationNotes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/submissions', {
                problem: problemId,
                ...formData,
            });

            // Reset form
            setFormData({
                approach: '',
                thoughtProcess: '',
                pseudocode: '',
                code: '',
                timeComplexity: '',
                spaceComplexity: '',
                optimizationNotes: '',
            });

            if (onSubmissionCreated) {
                onSubmissionCreated();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit solution');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>📝</span> Submit Your Solution
            </h3>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                    <label htmlFor="approach" className="block text-sm font-medium text-gray-700">Approach *</label>
                    <textarea
                        id="approach"
                        name="approach"
                        value={formData.approach}
                        onChange={handleChange}
                        rows="3"
                        required
                        placeholder="Describe your approach in brief"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm resize-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="thoughtProcess" className="block text-sm font-medium text-gray-700">Thought Process *</label>
                    <textarea
                        id="thoughtProcess"
                        name="thoughtProcess"
                        value={formData.thoughtProcess}
                        onChange={handleChange}
                        rows="4"
                        required
                        placeholder="Explain how you arrived at this solution"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm resize-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="pseudocode" className="block text-sm font-medium text-gray-700">Pseudocode</label>
                    <textarea
                        id="pseudocode"
                        name="pseudocode"
                        value={formData.pseudocode}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Write pseudocode (optional)"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm font-mono resize-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code *</label>
                    <textarea
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        rows="10"
                        required
                        placeholder="Paste your solution code"
                        className="w-full px-4 py-3 bg-gray-900 text-gray-300 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm font-mono resize-y"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label htmlFor="timeComplexity" className="block text-sm font-medium text-gray-700">Time Complexity *</label>
                        <input
                            type="text"
                            id="timeComplexity"
                            name="timeComplexity"
                            value={formData.timeComplexity}
                            onChange={handleChange}
                            required
                            placeholder="e.g., O(n log n)"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="spaceComplexity" className="block text-sm font-medium text-gray-700">Space Complexity *</label>
                        <input
                            type="text"
                            id="spaceComplexity"
                            name="spaceComplexity"
                            value={formData.spaceComplexity}
                            onChange={handleChange}
                            required
                            placeholder="e.g., O(1)"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="optimizationNotes" className="block text-sm font-medium text-gray-700">Optimization Notes</label>
                    <textarea
                        id="optimizationNotes"
                        name="optimizationNotes"
                        value={formData.optimizationNotes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Any optimization ideas or alternative approaches (optional)"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm resize-none"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 hover:shadow-violet-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                        </>
                    ) : (
                        <span>Submit Solution</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SubmissionForm;
