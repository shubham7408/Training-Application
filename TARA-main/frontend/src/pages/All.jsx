import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Treemap from "highcharts/modules/treemap";
import LanguageStats from "./LanguageStats";
import LocationStats from "./LocationStats";
import { useProjectContext } from "../contextapi/allcontext";

Treemap(Highcharts);

const LanguageCard = ({
  language,
  approvedCount,
  rejectedCount,
  rewriteCount,
  totalTasks,
}) => {
  const approvalRate = ((approvedCount / totalTasks) * 100).toFixed(2);
  const rejectionRate = ((rejectedCount / totalTasks) * 100).toFixed(2);
  const rewriteRate = ((rewriteCount / totalTasks) * 100).toFixed(2);

  return (
    <div className="bg-white border p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold">{language}</h3>
      <p>Approval Rate: {approvalRate}%</p>
      <p>Rejection Rate: {rejectionRate}%</p>
      <p>Rewrite Rate: {rewriteRate}%</p>
    </div>
  );
};

const All = () => {
  const [oneAnnotations, setOneAnnotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [languageStats, setLanguageStats] = useState([]);
  const [sortOrder, setSortOrder] = useState({ key: "approved", order: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(
    "PROJECT_P_CODING_EVALUATION"
  );
  const PROJECT_ROUTE = selectedProject === "ALL" ? "" : selectedProject;
  const totalTasks = 64165;
  const { projects } = useProjectContext();
  console.log("PROJECT_ROUTE", PROJECT_ROUTE);
  useEffect(() => {
    const fetchLanguageStats = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_URL
          }/api/getLanguageStats?projectRoute=${PROJECT_ROUTE}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLanguageStats(data);
      } catch (error) {
        console.error("Error fetching language stats:", error);
      }
    };

    fetchLanguageStats();
  }, [PROJECT_ROUTE]);
  console.log("languageStats", languageStats);
  // useEffect(() => {
  //   const fetchOneAnnotations = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch(
  //         `${import.meta.env.VITE_URL}/api/tasks/one-annotations`
  //       );
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       setOneAnnotations(data);
  //     } catch (error) {
  //       console.error("Error fetching project data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchOneAnnotations();
  // }, []);

  const colors = {
    c: "#1f77b4",
    "c#": "#ff7f0e",
    "c++": "#2ca02c",
    go: "#d62728",
    java: "#9467bd",
    javascript: "#8c564b",
    kotlin: "#e377c2",
    php: "#7f7f7f",
    python: "#bcbd22",
    ruby: "#17beff",
    rust: "#ffbb78",
    scala: "#98df8a",
    typescript: "#f7b6d2",
  };

  const data = languageStats.map((lang) => ({
    name: lang.LANGUAGE,
    value: lang.TOTAL_TASKS,
    color: colors[lang.LANGUAGE.toLowerCase()] || "#7f7f7f",
  }));

  const options1 = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: "400px",
    },
    title: {
      text: "Total Tasks: 64,165",
    },
    series: [
      {
        name: "Tasks",
        data: [
          {
            name: "Done Tasks",
            y: 0,
            color: "#d62728",
          },
          {
            name: "Done Tasks",
            y: totalTasks,
            color: "#2ca02c",
          },
        ],
      },
    ],
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.y}",
          style: {
            color: "black",
            textOutline: "none",
            fontWeight: "bold",
          },
          distance: 20,
          filter: {
            property: "percentage",
            operator: ">",
            value: 4,
          },
        },
        showInLegend: false,
      },
    },
    legend: {
      enabled: true,
      align: "right",
      verticalAlign: "middle",
      layout: "vertical",
    },
    credits: {
      enabled: false,
    },
  };

  const options2 = {
    chart: {
      backgroundColor: null,
    },
    series: [
      {
        type: "treemap",
        layoutAlgorithm: "squarified",
        data: data,
        dataLabels: {
          enabled: true,
          style: {
            color: "white",
            textOutline: "none",
            fontSize: "14px",
            textShadow: "1px 1px 2px rgba(0, 0, 0)",
          },
          formatter: function () {
            return `${this.point.name}: ${this.point.value}`;
          },
        },
      },
    ],
    title: {
      text: "Language Statistics",
    },
    credits: {
      enabled: false,
    },
  };

  const handleSort = (key) => {
    const order =
      sortOrder.key === key && sortOrder.order === "asc" ? "desc" : "asc";
    setSortOrder({ key, order });
  };

  const sortedLanguages = languageStats
    .map((lang) => ({
      ...lang,
      approvalRate: (lang.APPROVED_COUNT / lang.TOTAL_TASKS) * 100,
      rejectionRate: (lang.REJECTED_COUNT / lang.TOTAL_TASKS) * 100,
      rewriteRate: (lang.BATCH_REWRITE_COUNT / lang.TOTAL_TASKS) * 100,
    }))
    .filter((lang) =>
      lang.LANGUAGE.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortOrder.key) {
        case "approved":
          aValue = a.approvalRate;
          bValue = b.approvalRate;
          break;
        case "rejected":
          aValue = a.rejectionRate;
          bValue = b.rejectionRate;
          break;
        case "rewrite":
          aValue = a.rewriteRate;
          bValue = b.rewriteRate;
          break;
        default:
          aValue = a.approvalRate;
          bValue = b.approvalRate;
      }

      return sortOrder.order === "asc" ? aValue - bValue : bValue - aValue;
    });

  const filteredProjects = projects.filter(
    (project) => project.IS_ACTIVE === true
  );
  console.log("filteredProjects", filteredProjects);
  return (
    <div className="container mx-auto px-4 sm:px-8" data-aos="fade-right">
      <div className="py-8">
        <div className="ml-16 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 ml-[14vw] mb-8">
            More Statistics
          </h2>
          <center>
            <div className="mb-7 flex space-x-6 ml-60">
              {/* <button
                className={`px-4 py-2 rounded transition-transform duration-300
                     ${
                       selectedProject === "ALL"
                         ? "bg-blue-600 text-white scale-110"
                         : "bg-gray-200 text-gray-800"
                     }`}
                onClick={() => setSelectedProject("ALL")}
              >
                All
              </button> */}
              {filteredProjects.map((project) => (
                <button
                  key={project.PROJECT_ROUTE}
                  className={`px-4 py-2 rounded transition-transform duration-300
                     ${
                       selectedProject === project.PROJECT_ROUTE
                         ? "bg-blue-600 text-white scale-110"
                         : "bg-gray-200 text-gray-800"
                     }`}
                  onClick={() => setSelectedProject(project.PROJECT_ROUTE)}
                >
                  {project.PROJECT_TITLE}
                </button>
              ))}
            </div>
            <div className="w-[80vw]">
              {loading && (
                <div className="text-center">
                  Loading Done & Pending Tasks...
                </div>
              )}
              <LanguageStats
                languageStats={languageStats}
                loading={loading}
                setLoading={setLoading}
              />
            </div>
          </center>
          <center>
            <div className="w-[80vw]">
              <HighchartsReact highcharts={Highcharts} options={options2} />
            </div>
          </center>

          <hr />
          <div className="mt-8 mb-4 text-center">
            <input
              type="text"
              placeholder="🔍 Search Language"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 mb-4 mr-4 rounded-lg"
            />
            <button
              onClick={() => handleSort("approved")}
              className={`mr-2 py-2 px-4 rounded-lg text-white font-semibold ${
                sortOrder.key === "approved"
                  ? sortOrder.order === "asc"
                    ? "bg-blue-600"
                    : "bg-blue-800"
                  : "bg-blue-500"
              } hover:bg-blue-700 transition`}
            >
              Sort by Approval{" "}
              {sortOrder.key === "approved" &&
                (sortOrder.order === "asc" ? "↓" : "↑")}
            </button>

            <button
              onClick={() => handleSort("rejected")}
              className={`mr-2 py-2 px-4 rounded-lg text-white font-semibold ${
                sortOrder.key === "rejected"
                  ? sortOrder.order === "asc"
                    ? "bg-red-600"
                    : "bg-red-800"
                  : "bg-red-500"
              } hover:bg-red-700 transition`}
            >
              Sort by Rejection{" "}
              {sortOrder.key === "rejected" &&
                (sortOrder.order === "asc" ? "↓" : "↑")}
            </button>

            <button
              onClick={() => handleSort("rewrite")}
              className={`mr-2 py-2 px-4 rounded-lg text-white font-semibold ${
                sortOrder.key === "rewrite"
                  ? sortOrder.order === "asc"
                    ? "bg-green-600"
                    : "bg-green-800"
                  : "bg-green-500"
              } hover:bg-green-700 transition`}
            >
              Sort by Rewrite{" "}
              {sortOrder.key === "rewrite" &&
                (sortOrder.order === "asc" ? "↓" : "↑")}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {sortedLanguages.map((lang) => (
              <LanguageCard
                key={lang.LANGUAGE}
                language={lang.LANGUAGE}
                approvedCount={lang.APPROVED_COUNT}
                rejectedCount={lang.REJECTED_COUNT}
                rewriteCount={lang.BATCH_REWRITE_COUNT}
                totalTasks={lang.TOTAL_TASKS}
                data-aos="flip-left"
                data-aos-duration="1000"
              />
            ))}
          </div>
          <center>
            <div className="w-[80vw]">
              <h2 className="text-2xl font-semibold text-gray-800">
                Location Statistics
              </h2>
              <LocationStats />
            </div>
          </center>
        </div>
      </div>
    </div>
  );
};

export default All;
