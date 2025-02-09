import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Treemap from 'highcharts/modules/treemap';

Treemap(Highcharts);

const LocationCard = ({ location, approvedCount, rejectedCount, pendingCount, totalTasks }) => {
    const approvalRate = ((approvedCount / totalTasks) * 100).toFixed(2);
    const rejectionRate = ((rejectedCount / totalTasks) * 100).toFixed(2);
    const pendingRate = ((pendingCount / totalTasks) * 100).toFixed(2);

    return (
        <div className="bg-white border p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold">{location}</h3>
            <p>Approval Rate: {approvalRate}%</p>
            <p>Rejection Rate: {rejectionRate}%</p>
            <p>Pending Rate: {pendingRate}%</p>
        </div>
    );
};

const LocationStats = () => {
    const [locationStats, setLocationStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const totalTasks = 64165;

    useEffect(() => {
        const fetchLocationStats = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_URL}/api/locationStats`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLocationStats(data);
            } catch (error) {
                console.error("Error fetching location stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocationStats();
    }, []);

    const sortedLocationStats = locationStats.map(loc => ({
        ...loc,
        approvalRate: ((loc.APPROVED / loc.TOTAL) * 100).toFixed(2),
        rejectionRate: ((loc.REJECTED / loc.TOTAL) * 100).toFixed(2),
        pendingRate: ((loc.PENDING / loc.TOTAL) * 100).toFixed(2),
    }));

    return (
        <div className="container mx-auto px-4 sm:px-8" data-aos="fade-right">
            <div className="py-8">
                <div className="mb-6">
                    
                    <center>
                        <div className="w-[80vw]">
                            {loading && <div className="text-center">Loading Location Data...</div>}
                        </div>
                    </center>

                    <hr />
                    <div className="mt-8 mb-4 text-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            {sortedLocationStats.map(loc => (
                                <LocationCard
                                    key={loc.LOCATION}
                                    location={loc.LOCATION}
                                    approvedCount={loc.APPROVED}
                                    rejectedCount={loc.REJECTED}
                                    pendingCount={loc.PENDING}
                                    totalTasks={loc.TOTAL}
                                    data-aos="flip-left"
                                    data-aos-duration="1000"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationStats;
