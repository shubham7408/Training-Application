import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Announcement = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error('Message is required');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_URL}/api/createAnnouncement`, {
                msg: message,
                time: new Date().toISOString(),
            });

            if (response.status === 200) {
                toast.success('Announcement created successfully!');
                setMessage('');
            }
        } catch (error) {
            toast.error('Failed to create announcement, try again later');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-8" data-aos="fade-right">
            <div className="py-8">
                <div className="mb-6">
                    <center>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                            Create a New Announcement
                        </h2>
                    </center>
                    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="message" className="block text-md font-semibold text-gray-700">Message:</label>
                                <textarea
                                    name="message"
                                    id="message"
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                                    placeholder="Enter important message"
                                    required
                                    value={message}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 ${loading ? 'bg-gray-400' : 'bg-blue-600'} text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Announcement;