import React, { useState, useEffect } from "react";
import { format, isToday, parseISO } from "date-fns";
let today = format(new Date(), "yyyy-MM-dd");
const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [dateRange, setDateRange] = useState({
    fromDate: today,
    toDate: today,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs(today, today);
  }, []);

  const fetchLogs = async (fromDate = "", toDate = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      const url = `${import.meta.env.VITE_URL}/api/logs${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);
      const data = await response.json();
      setLogs(data);
      console.log(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newDateRange = {
      ...dateRange,
      [name]: value,
    };
    setDateRange(newDateRange);

    // Only fetch if both dates are selected or both are empty
    if (
      (newDateRange.fromDate && newDateRange.toDate) ||
      (!newDateRange.fromDate && !newDateRange.toDate)
    ) {
      fetchLogs(newDateRange.fromDate, newDateRange.toDate);
    }
  };

  const showTodayLogs = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setDateRange({
      fromDate: today,
      toDate: today,
    });
    fetchLogs(today, today);
  };

  const clearFilters = () => {
    setDateRange({
      fromDate: "",
      toDate: "",
    });
    fetchLogs();
  };

  return (
    <div className="container mx-auto px-4 sm:px-8" data-aos="fade-right">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Task Assignment Logs
          </h2>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">From:</span>
              <input
                type="date"
                name="fromDate"
                value={dateRange.fromDate}
                onChange={handleDateChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600">To:</span>
              <input
                type="date"
                name="toDate"
                value={dateRange.toDate}
                onChange={handleDateChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={showTodayLogs}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Today's Logs
            </button>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredLogs.length} logs
            {loading && <span className="ml-2">Loading...</span>}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading logs...
              </div>
            ) : (
              <>
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Timestamp</p>
                        <p className="font-medium text-gray-900">
                          {format(
                            parseISO(log.ASSIGNTIMESTAMP),
                            "MMM dd, yyyy HH:mm:ss"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Assigned To</p>
                        <p className="font-medium text-gray-900">
                          {log.ASSIGN_ID}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Tasks</p>
                        <p className="font-medium text-gray-900">
                          {log.TOTAL_TASK_ASSIGN}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Task IDs</p>
                        <p className="font-medium text-gray-900">
                          {log.TASKS.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredLogs.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    No logs found for the selected date range
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
