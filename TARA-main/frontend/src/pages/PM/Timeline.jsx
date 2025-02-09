import React, { useState, useEffect, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { GrClose } from "react-icons/gr";
import { FiLoader } from "react-icons/fi";

import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday,
} from "date-fns";
import { FiSearch } from "react-icons/fi";
import { MdOutlineCalendarMonth } from "react-icons/md";

const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, options]);

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:w-72">
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 pr-10 border border-gray-300 rounded-lg shadow-sm 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
                     text-md transition-all duration-200"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <div
          data-aos="fade-down"
          className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg 
                       border border-gray-200 max-h-60 overflow-y-auto"
        >
          <div
            className="p-3 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSelect("All Projects")}
          >
            All Projects
          </div>
          {filteredOptions.map((option) => (
            <div
              key={option}
              className={`p-3 cursor-pointer transition-colors duration-150
                           ${value === option ? "bg-blue-50 text-blue-600" : ""}
                           hover:bg-gray-100`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [animate, setAnimate] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("All Projects");

  const locales = { "en-US": enUS };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const uniqueProjects = [...new Set(events.map((event) => event.project))];
      setProjects(uniqueProjects);
    }
  }, [events]);

  useEffect(() => {
    filterEvents();
  }, [selectedProject, events]);

  const filterEvents = () => {
    if (selectedProject === "All Projects") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(
        events.filter((event) => event.project === selectedProject)
      );
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_URL}/api/getTasks`);
      const data = await response.json();
      const formattedEvents = data.map((task) => ({
        id: task.TASK_ID,
        title: task.TASK_NAME,
        start: new Date(task.START_DATE),
        end: new Date(task.END_DATE),
        project: task.PROJECT_NAME,
        status: task.TASK_STATUS,
        email: task.USER_EMAIL,
      }));
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (action) => {
    switch (action) {
      case "PREV":
        switch (view) {
          case "month":
            setCurrentDate(subMonths(currentDate, 1));
            break;
          case "week":
            setCurrentDate(subWeeks(currentDate, 1));
            break;
          case "day":
            setCurrentDate(subDays(currentDate, 1));
            break;
        }
        break;
      case "NEXT":
        switch (view) {
          case "month":
            setCurrentDate(addMonths(currentDate, 1));
            break;
          case "week":
            setCurrentDate(addWeeks(currentDate, 1));
            break;
          case "day":
            setCurrentDate(addDays(currentDate, 1));
            break;
        }
        break;
      case "TODAY":
        setCurrentDate(new Date());
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#22c55e";
      case "in progress":
        return "#facc15";
      case "not started":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const dayPropGetter = (date) => {
    if (isToday(date)) {
      return {
        className: "bg-blue-200",
        style: {
          backgroundColor: "#bfdbfe",
        },
      };
    }
    return {};
  };

  const eventStyleGetter = (event) => {
    const isSelected = selectedEvent?.id === event.id;
    const style = {
      backgroundColor: getStatusColor(event.status),
      color: ["completed", "not started"].includes(event.status?.toLowerCase())
        ? "#ffffff"
        : "#000000",
      border: "1px solid #444444",
      borderRadius: "4px",
      padding: "2px 2px",
      fontSize: "0.85rem",
      fontWeight: "600",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      margin: "2px 0",
      opacity: isSelected ? 0.9 : 1,
      transform: isSelected ? "scale(1.02)" : "scale(1)",
      boxShadow: isSelected
        ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
        : "0 2px 4px rgba(0, 0, 0, 0.1)",
      cursor: "pointer",
      backdropFilter: "blur(4px)",
      animation: "fadeSlideIn 0.3s ease-out",
    };
    return { style };
  };

  const CustomDayHeader = ({ date }) => (
    <div className="text-center p-2 bg-gradient-to-b from-blue-50 to-white rounded-t-lg">
      <div className="text-lg font-semibold text-gray-800">
        {format(date, "EEEE")}
      </div>
      <div className="text-3xl font-bold text-blue-600">
        {format(date, "d")}
      </div>
      <div className="text-sm text-gray-600">{format(date, "MMMM yyyy")}</div>
    </div>
  );

  const CustomTimeSlot = ({ value }) => (
    <div className="text-sm text-gray-600 font-medium hover:bg-blue-50 transition-colors duration-200">
      {format(value, "h:mm a")}
    </div>
  );

  const CustomToolbar = ({ onView, label }) => (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:transform active:scale-95"
            onClick={() => handleNavigate("TODAY")}
          >
            <FaRegCalendarAlt className="h-4 w-4" />
            <span>Today</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              className="bg-white text-blue-600 p-3 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-md active:transform active:scale-95 border border-blue-100"
              onClick={() => handleNavigate("PREV")}
            >
              <FaChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="bg-white text-blue-600 p-3 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-md active:transform active:scale-95 border border-blue-100"
              onClick={() => handleNavigate("NEXT")}
            >
              <FaChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-med text-gray-800">
          {label}
        </h2>

        <div className="flex space-x-3">
          {["month", "week", "day"].map((viewName) => (
            <button
              key={viewName}
              className={`px-5 py-2 rounded-lg transition-all duration-300 ${view === viewName
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white transform scale-105 shadow-lg"
                : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-100"
                }`}
              onClick={() => onView(viewName)}
            >
              {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ProjectFilter = () => (
    <div className="flex items-center gap-4 mb-6 px-4">
      <SearchableDropdown
        options={projects}
        value={selectedProject}
        onChange={setSelectedProject}
        placeholder="Search projects..."
      />
      {selectedProject && (
        <div className="hidden md:block">
          <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-blue-700 font-medium">
              Selected: {selectedProject}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6" data-aos="fade-down"
      data-aos-duration="500"
      data-aos-easing="ease-in-out">
      <div className="flex items-center justify-center mb-6">
        <MdOutlineCalendarMonth className="h-8 w-8 text-blue-600 mr-2" />
        <h1 className="text-2xl font-med text-gray-800">Project Timeline</h1>
      </div>
      <div className="max-w-[1400px] mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl space-y-6 p-4">
        <ProjectFilter />

        <div
          className={`transition-all duration-300${animate ? "opacity-0 scale-95" : "opacity-100"
            }`}
        >
          {loading ? (
            <div className="flex justify-center items-center h-[600px]">
              <div className="text-center space-y-4">
                <FiLoader className="h-14 w-14 text-blue-600 animate-spin mx-auto" />
                <p className="text-gray-600">Loading your timeline...</p>
              </div>
            </div>
          ) : (
            <BigCalendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 700 }}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              onSelectEvent={setSelectedEvent}
              views={["month", "week", "day"]}
              popup
              length={3}
              selectable
              step={30}
              showMultiDayTimes
              date={currentDate}
              onNavigate={handleNavigate}
              view={view}
              onView={setView}
              components={{
                toolbar: CustomToolbar,
                day: {
                  header: CustomDayHeader,
                },
              }}
              className="custom-calendar"
              formats={{
                eventTimeRangeFormat: () => null,
              }}
              messages={{
                showMore: (total) => `+${total} more`,
              }}
            />
          )}
        </div>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <GrClose className="h-6 w-6" />
              </button>

              <h2 className="text-2xl font-bold mb-6 text-blue-600 pr-8">
                {selectedEvent.title}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Project:</span>
                  <span className="text-gray-600">{selectedEvent.project}</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: getStatusColor(selectedEvent.status),
                      color: ["completed", "not started"].includes(
                        selectedEvent.status?.toLowerCase()
                      )
                        ? "#ffffff"
                        : "#000000",
                    }}
                  >
                    {selectedEvent.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">
                    Assigned to:
                  </span>
                  <span className="text-gray-600">{selectedEvent.email}</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg space-x-1">
                  <span className="font-semibold text-gray-700">From</span>
                  <span className="text-gray-600">
                    {format(selectedEvent.start, "PPP")}
                  </span>
                  <b className="text-gray-700">to</b>
                  <span className="text-gray-600">
                    {format(selectedEvent.end, "PPP")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .custom-calendar {
          padding: 5px;
          transition: all 0.3s ease;
        }

        .rbc-month-row {
          min-height: 90px !important;
          overflow: visible !important;
        }

        .rbc-event {
          padding: 4px 4px !important;
          min-height: 20px !important;
          font-size: 0.85rem !important;
          line-height: 1.0 !important;
        }
          
        .rbc-time-content {
          background: linear-gradient(to right, #ffffff, #f8fafc);
          border-top: 1px solid #e5e7eb;
        }

        .rbc-timeslot-group {
          border-bottom: 1px solid #f3f4f6;
          min-height: 60px;
          transition: all 0.2s ease;
        }

        .rbc-timeslot-group:hover {
          background-color: #f8fafc;
          transform: scale(1.005);
        }

        .rbc-event {
          animation: fadeSlideIn 0.3s ease-out;
        }

        .rbc-header {
          padding: 8px 8px;
          font-weight: 600;
          color: #1e293b;
          background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
          border-bottom: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .rbc-header:hover {
          background: linear-gradient(to bottom, #f1f5f9, #e2e8f0);
        }

        .rbc-header + .rbc-header {
          border-left: 1px solid #e2e8f0;
        }

        .rbc-today {
          background: linear-gradient(
            45deg,
            #eff6ff 0%,
            #dbeafe 100%
          ) !important;
          animation: todayPulse 2s infinite;
        }

        .rbc-time-header-content {
          border-left: 1px solid #e2e8f0;
          font-weight: 500;
        }

        .rbc-time-content > * + * > * {
          border-left: 1px solid #e2e8f0;
        }

        .rbc-time-gutter .rbc-timeslot-group {
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .rbc-time-gutter .rbc-timeslot-group:hover {
          color: #1e293b;
          background-color: #f8fafc;
        }

        .rbc-current-time-indicator {
          height: 2px;
          background: linear-gradient(to right, #3b82f6, #60a5fa);
          opacity: 0.7;
          position: absolute;
          z-index: 3;
          left: 0;
          right: 0;
          pointer-events: none;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes todayPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.2);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Timeline;
