import React from 'react'
import { useNavigate } from 'react-router-dom'


const Argos = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 sm:px-8" data-aos="fade-right">
            <div className="py-8">
                <div className="mb-6">
                    <button
                        type="button"
                        className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                        onClick={() => navigate(-1)} // Go back to the previous page
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <center>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                            Image LLM
                        </h2>
                    </center>
                    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
                        <form className="space-y-6">
                            <button
                                type="button"
                                className="w-full py-3 bg-orange-600 text-white font-semibold rounded-md shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex justify-center items-center h-16"
                                onClick={() => navigate('/projects/DomainManagement/doc')}

                            >
                                Document Collections
                            </button>
                            <button
                                type="button"
                                className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-md shadow hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 flex justify-center items-center h-16"
                                onClick={() => navigate('projects/DomainManagement/doc/domains')}

                            >
                                QA
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Argos
