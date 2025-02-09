import Aos from "aos";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useLocation, useParams } from "react-router-dom";
import Admin from "../components/Admin";
import { toast } from "react-toastify";

// Create the context
const ProjectContext = createContext();

// Helper function to format email to name (same as in original component)
const formatEmailToName = (email) => {
  return email
    .split("@")[0]
    .replace(/\./g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Provider component
export const ProjectProvider = ({ children }) => {
  const [statsCount, setStatsCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const match = location.pathname.match(/\/projects\/([^\/]+)/);
  const projectRoute = match ? match[1] : "";
  const [userData, setUserData] = useState([]);
  const [filteredUserData, setFilteredUserData] = useState([]);
  const [filteredUserData1, setFilteredUserData1] = useState([]);

  const [userId, setUserId] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedLocationForAssignlist, setSelectedLocationForAssignlist] =
    useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [individualTaskAssignments, setIndividualTaskAssignments] = useState(
    {}
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentProject, setCurrentProject] = useState(null);
  const [globalTaskAssignment, setGlobalTaskAssignment] = useState(0);
  const [locations, setLocations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [languageCounts, setLanguageCounts] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQuery1, setSearchQuery1] = useState("");
  const [selectedLocation1, setSelectedLocation1] = useState("All");
  const [selectedLanguage1, setSelectedLanguage1] = useState("all");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usersDetails, SetUsersDetails] = useState();
  const [isLoadingForTask, setIsLoadingForTask] = useState(false);
  // Debug log for pathname
  // Re-run the effect whenever the pathname changes
  // Fetch user stats and top/bottom performers
  const [projects, setProjects] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState([]);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL}/api/projects`
        );
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects && projectRoute) {
      const project = projects.find((p) => p.PROJECT_ROUTE === projectRoute);
      setCurrentProject(project);
    }
  }, [projects, projectRoute]);
  const fetchUserStats = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_URL
        }/api/fetchAssignedTasks?projectRoute=${projectRoute}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const processedData = data
        .map((user) => {
          const { UPDATED_BY_MAIL, APPROVED_COUNT, REJECTED_COUNT } = user;
          // Safeguard against invalid counts
          const approvedCount = parseInt(APPROVED_COUNT, 10) || 0;
          const rejectedCount = parseInt(REJECTED_COUNT, 10) || 0;
          const totalTasks = approvedCount + rejectedCount;
          const approvalRate =
            totalTasks > 0
              ? ((approvedCount / totalTasks) * 100).toFixed(2)
              : "0.00";
          return {
            email: UPDATED_BY_MAIL,
            approved: approvedCount,
            rejected: rejectedCount,
            approvalRate: parseFloat(approvalRate),
          };
        })
        .filter((user) => user.approved > 4);

      // Sorting data by approval rate in descending order

      const sortedData = processedData.sort(
        (a, b) => b.approvalRate - a.approvalRate
      );
      //console.log("sortedData", sortedData);
      // Extracting top 3 performers
      const top = sortedData.slice(0, 3);
      // Extracting bottom 3 performers
      const bottom = sortedData.slice(-3);
      // Setting state with processed data

      setTopPerformers(top);
      setBottomPerformers(bottom);
      setUserStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };
  // Fetch project stats count
  const fetchStatsCount = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_URL
        }/api/tasks/all-stats-count?projectRoute=${projectRoute}`
      );
      const data = await res.json();
      // console.log("fetchStatsCount", data);
      setStatsCount(data);
    } catch (error) {
      console.error("Error fetching project stats count:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data
  const fetchProjectData = async () => {
    setLoading(true);
    await Promise.all([fetchUserStats(), fetchStatsCount()]);
  };

  // Initial data fetch
  useEffect(() => {
    if (projectRoute) {
      fetchProjectData();
      fetchDevelopers();
    }
  }, [projectRoute]);
  
  const GetAssignTaskCount = async (projectId, userId, taskCount) => {
    const url = `${
      import.meta.env.VITE_URL
    }/api/fetchGetAssignTaskCount?projectRoute=${projectRoute}&userId=${userId}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching assigned task count:", error);
      throw error;
    }
  };
  const fetchLeaderboardData = async (projectRoute) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_URL
        }/api/fetchAssignedTasks?projectRoute=${projectRoute}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const processedData = data
        .map((user) => {
          const {
            UPDATED_BY_MAIL,
            APPROVED_COUNT,
            TOTAL_TASKS,
            REJECTED_COUNT,
            PENDING_TO_COMPLETE,
            PENDING_CHECK,
            BATCH_REWRITE_COUNT,
          } = user;
          const approvalRate =
            APPROVED_COUNT + REJECTED_COUNT > 0
              ? (
                  (APPROVED_COUNT / (APPROVED_COUNT + REJECTED_COUNT)) *
                  100
                ).toFixed(2)
              : 0;
          return {
            email: UPDATED_BY_MAIL,
            approved: APPROVED_COUNT,
            total: TOTAL_TASKS,
            pendingCheck: PENDING_CHECK,
            pendingToComplete: PENDING_TO_COMPLETE,
            rejected: REJECTED_COUNT,
            rewrite: BATCH_REWRITE_COUNT,
            approvalRate: parseFloat(approvalRate),
          };
        })
        .filter((user) => user.approved > 10) // Filter users with more than 10 approved tasks
        .sort((a, b) => b.approvalRate - a.approvalRate)
        .slice(0, 10); // Get top 10 performers

      return processedData;
    } catch (error) {
      console.error(
        `Error fetching leaderboard data for projectRoute=${projectRoute}:`,
        error
      );
      return [];
    }
  };
  // Derived value
  const approved = statsCount[0]?.APPROVED_COUNT || 0;
  const rewrites = statsCount[0]?.BATCH_REWRITE_COUNT || 0;
  const rejected = statsCount[0]?.REJECTED_COUNT || 0;
  const total = statsCount[0]?.TOTAL_TASKS || 0;
  const PendingCheck = statsCount[0]?.PENDING_CHECK || 0;
  const PendingToComplete = statsCount[0]?.PENDING_TO_COMPLETE || 0;

  // Calculation of rates
  const approvalRate =
    total > 0 ? ((approved / (total - PendingCheck)) * 100).toFixed(2) : 0;
  const rejectionRate =
    total > 0 ? ((rejected / (total - PendingCheck)) * 100).toFixed(2) : 0;
  const rewriteRate =
    total > 0 ? ((rewrites / (total - PendingCheck)) * 100).toFixed(2) : 0;

  // Prepare stats for rendering
  const stats = [
    {
      label: "Total Annotations",
      value: total,
      color: "border-blue-600",
      bg: "bg-blue-300",
    },
    {
      label: "Approved",
      value: approved,
      color: "border-green-600",
      bg: "bg-green-300",
    },
    {
      label: "Pending Check",
      value: PendingCheck,
      color: "border-yellow-400",
      bg: "bg-red-300",
    },
    {
      label: "Pending To Complete",
      value: PendingToComplete,
      color: "border-yellow-600",
      bg: "bg-yellow-300",
    },
    {
      label: "Rejected",
      value: rejected,
      color: "border-red-600",
      bg: "bg-red-300",
    },
    {
      label: "Rewrite",
      value: rewrites,
      color: "border-purple-600",
      bg: "bg-purple-300",
    },
  ];

  // Prepare chart options
  const chartOptions = {
    chart: {
      type: "column",
      height: "60%",
    },
    title: {
      text: "Project Task Statistics",
    },
    series: [
      {
        name: "Tasks",
        data: [
          { name: "Total Tasks", y: total, color: "#007bff" },
          { name: "Approved", y: approved, color: "#28a745" },
          { name: "PendingCheck", y: PendingCheck, color: "#FFDE4D" },
          { name: "Rejected", y: rejected, color: "#dc2626" },
          { name: "Rewrites", y: rewrites, color: "#9333ea" },
          { name: "PendingToComplete", y: PendingToComplete, color: "#9333ea" },
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  };
  useEffect(() => {
    Aos.init();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Admin context funtion
  const [userstats, setUserStats] = useState({
    total1: 0,
    approved1: 0,
    pending1: 0,
    rejected1: 0,
    rewrites1: 0,
    approvalRate1: 0,
    rejectionRate1: 0,
    rewriteRate1: 0,
  });
  useEffect(() => {
    const getProjectData = async () => {
      if (!projects || !projectRoute) return;

      try {
        // Find the current project
        const currentProject = projects.find(
          (p) => p.PROJECT_ROUTE === projectRoute
        );
        if (!currentProject) {
          console.error("Project not found");
          return;
        }

        // Now we have the project_id, call fetchData
        await fetchData(currentProject.PROJECT_ID);
      } catch (error) {
        console.error("Error getting project data:", error);
      }
    };

    getProjectData();
  }, [projects, projectRoute]);
  const fetchData = async (project_id) => {
    try {
      // Fetch Assigned Tasks
      const tasksResponse = await fetch(
        `${
          import.meta.env.VITE_URL
        }/api/fetchAssignedTasks?projectRoute=${projectRoute}`
      );
      if (!tasksResponse.ok) {
        throw new Error(`HTTP error! status: ${tasksResponse.status}`);
      }

      const tasksData = await tasksResponse.json();
      const currentUserData = tasksData.find(
        (item) => item.UPDATED_BY_MAIL === user?.email
      );

      if (currentUserData) {
        const total1 = Number(currentUserData.TOTAL_TASKS) || 0;
        const approved1 = Number(currentUserData.APPROVED_COUNT) || 0;
        const rejected1 = Number(currentUserData.REJECTED_COUNT) || 0;
        const pending1 = Number(currentUserData.NULL_COUNT) || 0;
        const rewrites1 = Number(currentUserData.BATCH_REWRITE_COUNT);
        const approvalRate1 = Number(currentUserData.APPROVED_PERCENTAGE);
        const rejectionRate1 = Number(currentUserData.REJECTED_PERCENTAGE);

        setUserStats({
          total1,
          approved1,
          pending1,
          rejected1,
          rewrites1,
          approvalRate1,
          rejectionRate1,
          rewriteRate1: total1 ? ((rewrites1 / total1) * 100).toFixed(1) : 0,
        });
      }

      setUserData(currentUserData);
      const uniqueLocations = [
        ...new Set(tasksData.map((user) => user.LOCATION)),
      ];
      setLocations(uniqueLocations);
      setUserData(tasksData);
      setFilteredUserData(tasksData);

      // Fetch Languages with the project_id
      const languagesResponse = await fetch(
        `${import.meta.env.VITE_URL}/api/languages?project_id=${project_id}`
      );
      if (!languagesResponse.ok) {
        throw new Error(`HTTP error! status: ${languagesResponse.status}`);
      }
      const languagesData = await languagesResponse.json();

      setTotalTasks(languagesData.tasksAvailable);
      const languagesArray = Object.entries(languagesData.languages).map(
        ([lang, count]) => ({
          language: lang,
          count: count,
        })
      );

      setLanguageCounts(languagesArray);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    }
  };

  // useEffect(() => {
  //   if (projectRoute) {

  //   }
  // }, [projectRoute]);
  // Filtering Logic
  useEffect(() => {
    let filtered = [...userData];
    filtered = filterByLocation(filtered, selectedLocation);
    filtered = filterByLanguage(filtered, selectedLanguage);
    filtered = filtered.filter((developer) => {
      const email = developer.UPDATED_BY_MAIL || "";
      return email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    setFilteredUserData(filtered);
  }, [userData, selectedLocation, selectedLanguage, searchQuery, projectRoute]);
  // Utility Functions
  const filterByLocation = (data, location) => {
    if (location === "All") return data;
    return data.filter((d) => d.LOCATION === location);
  };

  const filterByLanguage = (data, language) => {
    if (!language || language === "all") return data;
    return data.filter((d) => d.SKILLSETS && d.SKILLSETS.includes(language));
  };

  // Task Assignment Handlers

  useEffect(() => {
    let filtered = [...developers];
    filtered = filterByLocation1(filtered, selectedLocation1);
    filtered = filterByLanguage1(filtered, selectedLanguage1);
    filtered = filtered.filter((developer) => {
      const email = developer.USER_EMAIL || "";
      return email.toLowerCase().includes(searchQuery1.toLowerCase());
    });

    setFilteredUserData1(filtered);
  }, [
    developers,
    selectedLocation1,
    selectedLanguage1,
    searchQuery1,
    projectRoute,
  ]);
  const filterByLocation1 = (data, location) => {
    if (location === "All") return data;
    return data.filter((d) => d.LOCATION === location);
  };

  const filterByLanguage1 = (data, language) => {
    if (!language || language === "all") return data;
    return data.filter((d) => d.SKILLSETS && d.SKILLSETS.includes(language));
  };
  // Task Assignment Handlers

  //---------------------------------------------------------------------------------------------

  const handleIndividualTaskAssignment = (userId, value) => {
    const numValue = parseInt(value) || 0;

    if (numValue < 0 || numValue > 40) {
      toast.error("Please enter a value between 0 and 40.");
      return;
    }
    setIndividualTaskAssignments((prev) => ({
      ...prev,
      [userId]: parseInt(value) || 0,
    }));
  };
  const handleGlobalTaskAssignment = (value) => {
    const numValue = parseInt(value) || 0;

    if (filteredUserData1.length > totalTasks) {
      toast.error(
        "Error: The number of developers exceeds the total tasks available. Please assign individually."
      );
      return;
    }

    if (numValue < 0 || numValue > 40) {
      toast.error("Please enter a value between 0 and 40.");
      return;
    }

    setGlobalTaskAssignment(numValue);

    const newAssignments = {};
    filteredUserData1.forEach((d) => {
      newAssignments[d.USER_ID] = numValue;
    });
    setIndividualTaskAssignments(newAssignments);
  };

  // Task Assignment Method
  const assignTasks = async (project_id) => {
    setIsLoadingForTask(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const taskAssignments = {};
    const language = selectedLanguage;
    taskAssignments[language] = {};
    filteredUserData1.forEach((d) => {
      taskAssignments[language][d.USER_EMAIL] =
        individualTaskAssignments[d.USER_ID] || "0";
    });

    const finalTask = {
      role: user.role,
      data: taskAssignments,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_URL}/api/assignTasks?project_id=${project_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalTask),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      fetchData(project_id);
      setIsLoadingForTask(false);
      toast.success("Tasks assigned successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign tasks.");
    } finally {
    }
  };

  // develper context

  // Context provider component

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAnnotations, setUserAnnotations] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [comments, setComments] = useState({});
  const [options, setOptions] = useState({});

  // Check for existing user in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Fetch user annotations
  const fetchUserAnnotations = async () => {
    try {
      if (!user || !user.email || !user.role) {
        throw new Error("User information not found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/userAnnotations?email=${user.email}`,
        {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserAnnotations(data);
      setFilteredTasks(data);

      const userId = data[0]?.USER_ID;
      setUserId(userId);

      // Update only localStorage, not state
      if (userId) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUserData = {
          ...currentUser,
          user_id: userId,
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }
    } catch (error) {
      console.error("Error fetching user annotations:", error);
    }
  };

  const GetUser = async () => {
    try {
      if (!user || !user.email || !user.role) {
        throw new Error("User information not found");
      }
      const response = await fetch(`${import.meta.env.VITE_URL}/api/users`, {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      SetUsersDetails(data); // Initialize filteredTasks with all tasks
    } catch (error) {
      console.error("Error fetching usersData:", error);
    }
  };

  // Update task status and comments
  const updateTask = async (task) => {
    const userFromStorage = JSON.parse(localStorage.getItem("user"));
    const body = {
      role: userFromStorage.role,
      taskid: task.TASK_ID,
      status: options[task.TASK_ID] || task.STATUS,
      comment: comments[task.TASK_ID] || "",
    };

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_URL
        }/api/userAnnotation?projectRoute=${projectRoute}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();

      const updatedTasks = userAnnotations.map((t) =>
        t.TASK_ID === task.TASK_ID
          ? {
              ...t,
              STATUS: data.newStatus || task.STATUS,
              COMMENT: comments[task.TASK_ID] || "",
            }
          : t
      );
      setUserAnnotations(updatedTasks);

      toast.success("Task given for Review successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  // Search and filter tasks
  useEffect(() => {
    const filtered = userAnnotations.filter(
      (task) =>
        task.TASK_ID.toString().includes(searchQuery) ||
        (task.COMMENT_BY_REVIEWER &&
          task.COMMENT_BY_REVIEWER.toLowerCase().includes(
            searchQuery.toLowerCase()
          )) ||
        (comments[task.TASK_ID] &&
          comments[task.TASK_ID]
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );
    setFilteredTasks(filtered);
  }, [searchQuery, userAnnotations, comments]);

  // Login function
  const login = (userData) => {
    console.log("USER DATA ", userData);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.clear();
  };

  const handleOptionChange = (taskId, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [taskId]: value,
    }));
  };

  const handleCommentChange = (taskId, value) => {
    setComments((prevComments) => ({
      ...prevComments,
      [taskId]: value,
    }));
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    if (user && !user.user_id) {
      fetchUserAnnotations();
    }
  }, [user]);
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // If end date is before start date, update end date
    if (endDate && newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // If start date is after end date, update start date
    if (startDate && newEndDate < startDate) {
      setStartDate(newEndDate);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/getDevelopers`,
        {
          credentials: "include",
          method: "POST",
          body: JSON.stringify({
            role: "Admin",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setDevelopers(data);
      setFilteredDevelopers(data);
    } catch (error) {
      console.error("Error fetching user annotations:", error);
    }
  };

  // Context value
  const contextValue = useMemo(() => {
    return {
      // Data
      userstats,
      statsCount,
      loading,
      topPerformers,
      bottomPerformers,

      // Derived values
      approved,
      rewrites,
      rejected,
      PendingCheck,
      PendingToComplete,
      total,
      approvalRate,
      rejectionRate,
      rewriteRate,
      user,
      GetUser,

      // Helper functions
      formatEmailToName,
      fetchProjectData,
      stats,
      chartOptions,
      fetchStatsCount,
      fetchLeaderboardData,
      // Admin function
      userData,
      setUserData,
      filteredUserData,
      setFilteredUserData,
      filteredUserData1,
      selectedLocation,
      setSelectedLocation,
      selectedLocationForAssignlist,
      setSelectedLocationForAssignlist,
      selectedLanguage,
      setSelectedLanguage,
      individualTaskAssignments,
      setIndividualTaskAssignments,
      globalTaskAssignment,
      setGlobalTaskAssignment,
      locations,
      languages,
      languageCounts,
      totalTasks,
      searchQuery,
      isLoading,
      setIsLoading,
      error,

      // Methods
      handleIndividualTaskAssignment,
      handleGlobalTaskAssignment,
      assignTasks,
      filterByLocation,
      filterByLanguage,
      setUser,
      // developer context

      isAuthenticated,
      login,
      logout,

      // Task-related methods and states
      userAnnotations,
      filteredTasks,

      setSearchQuery,
      comments,
      setComments,
      options,
      setOptions,
      updateTask,
      handleOptionChange,
      handleCommentChange,
      fetchUserAnnotations,
      usersDetails,
      projects,
      isLoadingForTask,
      setIsLoadingForTask,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      handleStartDateChange,
      handleEndDateChange,
      developers,
      setDevelopers,
      filteredDevelopers,
      setFilteredDevelopers,
      setSelectedLocation1,
      setSelectedLanguage1,
      selectedLanguage1,
      selectedLocation1,
      setSearchQuery1,
    };
  }, [
    userstats,
    statsCount,
    loading,
    topPerformers,
    bottomPerformers,
    approved,
    rewrites,
    rejected,
    PendingCheck,
    PendingToComplete,
    total,
    approvalRate,
    rejectionRate,
    rewriteRate,
    user,
    projects,
    GetUser,
    formatEmailToName,
    fetchProjectData,
    stats,
    chartOptions,
    fetchStatsCount,
    userData,
    filteredUserData,
    filteredUserData1,
    selectedLocation,
    selectedLanguage,
    individualTaskAssignments,
    globalTaskAssignment,
    locations,
    languages,
    languageCounts,
    totalTasks,
    searchQuery,
    isLoading,
    error,
    handleIndividualTaskAssignment,
    handleGlobalTaskAssignment,
    assignTasks,
    filterByLocation,
    filterByLanguage,

    isAuthenticated,
    login,
    logout,
    isLoadingForTask,
    setIsLoadingForTask,
    // Task-related methods and states
    userAnnotations,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    comments,
    setComments,
    options,
    setOptions,

    updateTask,
    handleOptionChange,
    handleCommentChange,
    fetchUserAnnotations,
    usersDetails,
    projects,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleStartDateChange,
    handleEndDateChange,
    developers,
    setDevelopers,
    filteredDevelopers,
    setFilteredDevelopers,
    searchQuery1,
    setSearchQuery1,
    selectedLocationForAssignlist,
    setSelectedLocationForAssignlist,
    setSelectedLocation1,
    setSelectedLanguage1,
    selectedLanguage1,
    selectedLocation1,
    filteredUserData1,
  ]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
};
