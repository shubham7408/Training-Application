import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ProjectProvider,
  useProjectContext,
} from "../../contextapi/allcontext";

const DeveloperCharts = () => {
  const [loading, setLoading] = useState(true);

  // Statistics for the current user
  const { userstats } = useProjectContext();
  useEffect(() => {
    if (userstats) {
      setLoading(false);
    }
  }, [userstats]);
  //console.log("userstats", userstats);
  const statCards = [
    {
      label: "Total Annotations",
      value: userstats.total1,
      color: "border-blue-600",
      bg: "bg-white",
    },
    {
      label: "Approved",
      value: userstats.approved1,
      color: "border-green-600",
      bg: "bg-white",
    },
    {
      label: "Pending Check",
      value: userstats.pending1,
      color: "border-yellow-400",
      bg: "bg-white",
    },
    {
      label: "Rejected",
      value: userstats.rejected1,
      color: "border-red-600",
      bg: "bg-white",
    },
    {
      label: "Rewrites",
      value: userstats.rewrites1,

      color: "border-purple-600",
      bg: "bg-white",
    },
  ];

  console.log("developer chart data: ",statCards);
  

  // Sample data for the line chart
  const chartData = [
    { name: "Week 1", annotations: userstats.total1 * 0.2 },
    { name: "Week 2", annotations: userstats.total1 * 0.4 },
    { name: "Week 3", annotations: userstats.total1 * 0.7 },
    { name: "Week 4", annotations: userstats.total1 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto mg ml-4 ml-40">
      <div className="rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Your Statistics Dashboard
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((userstats, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${userstats.color} ${userstats.bg}`}
          >
            <h3 className="text-sm text-gray-600 mb-2">{userstats.label}</h3>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? "..." : userstats.value || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Annotation Progress
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-gray-600">Loading chart...</div>
            </div>
          ) : (
            <LineChart width={600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="annotations"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Performance Metrics
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">Approval Rate</h3>
              <p
                className={`text-2xl font-bold ${
                  userstats.approvalRate1 < 90 ? "text-red-500" : "text-gray-900"
                }`}
              >
                {userstats.approvalRate1} %
              </p>
            </div>
            <div>
              <h3 className="text-sm text-gray-600 mb-2">Rejection Rate</h3>
              <p className="text-2xl font-bold text-gray-800">
                {userstats.rejectionRate1} %
              </p>
            </div>
            <div>
              <h3 className="text-sm text-gray-600 mb-2">Rewrite Rate</h3>
              <p className="text-2xl font-bold text-gray-800">
                {userstats.rewriteRate1} %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperCharts;
