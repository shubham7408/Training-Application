import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { RiLoader2Line } from "react-icons/ri";
import { useLocation } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Reviewer from "../components/Reviewer";
import Developer from "../components/Developer";
import Admin from "../components/Admin";
import { useProjectContext } from "../contextapi/allcontext";
import DateRangeSelector from "./DateTime";

const Project = () => {
  const {
    projects,
    userStats,
    statsCount,
    loading,
    topPerformers,
    bottomPerformers,

    // Derived values
    approved,
    rewrites,
    rejected,
    pending,
    total,
    approvalRate,
    rejectionRate,
    rewriteRate,
    user,
    // Helper functions
    formatEmailToName,
    fetchProjectData,
    stats,
    chartOptions,
    fetchStatsCount,
  } = useProjectContext();

  const location = useLocation();
  const currentRoute = location.pathname.split("/")[2]; // Extract the last part of the path

  const project = projects && projects.length > 0 
  ? projects.find((p) => p.PROJECT_ROUTE === currentRoute) 
  : null;

  if (!projects || projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RiLoader2Line className="animate-spin text-4xl text-gray-600" />
        <span className="ml-2 text-gray-600">Loading Project...</span>
      </div>
    );
  }

  return (
    <>
      <center>
        <h1 className="mt-8" data-aos="flip-left">
          <a
            href="https://notlabel-studio.toloka-test.ai/projects/1033/"
            target="_blank"
            className="text-center text-2xl sm:text-1xl md:text-2xl lg:text-2.5xl font-med mb-8"
          >
            {/* {project ? project.PROJECT_TITLE : "Project not found"} */}
            {project.PROJECT_TITLE === "Claude AI"
              ? "STEM Data Plan"
              : project.PROJECT_TITLE}
          </a>
        </h1>
      </center>
      <div className="flex justify-end mt-4">
        <DateRangeSelector />
      </div>
      <div className="container mx-auto px-4 py-8 w-full">
        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 ml-[10vw]">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md p-6 border-l-[7px] ${stat.color}`}
              data-aos="zoom-in"
            >
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
        {/* Graph Section */}
        <div
          className="container w-auto max-w-full mx-auto mt-12"
          data-aos="fade-down"
          data-aos-duration="2500"
        >
          <div className="ml-12 graph flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Chart */}
            <div className="w-auto max-w-full">
              {loading ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Loading Chart...</p>
                  <img
                    src="https://media.tenor.com/1rwOYKmmEN4AAAAj/loading.gif"
                    className="mx-auto h-20"
                    alt="Loading"
                  />
                </div>
              ) : (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartOptions}
                />
              )}
            </div>

            {/* Metrics */}
            <div className="flex flex-col items-center justify-between gap-10">
              <div className="flex flex-col items-center">
                <h3 className="text-gray-600 text-sm mb-2">Approval Rate</h3>
                <p
                  className={`text-3xl font-semibold ${
                    approvalRate <= 90 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {loading ? (
                    <img
                      src="https://i.gifer.com/ZKZg.gif"
                      className="h-10"
                      alt="Loading"
                    />
                  ) : (
                    `${approvalRate}`
                  )}
                  <sub className="text-xl font-semibold ml-1">%</sub>
                </p>
              </div>

              <div className="flex flex-col items-center">
                <h3 className="text-gray-600 text-sm mb-2">Rejection Rate</h3>
                <p className="text-3xl font-semibold text-red-600">
                  {loading ? (
                    <img
                      src="https://i.gifer.com/ZKZg.gif"
                      className="h-10"
                      alt="Loading"
                    />
                  ) : (
                    `${rejectionRate}`
                  )}
                  <sub className="text-xl font-semibold ml-1">%</sub>
                </p>
              </div>

              <div className="flex flex-col items-center">
                <h3 className="text-gray-600 text-sm mb-2">Rewrite Rate</h3>
                <p className="text-3xl font-semibold text-gray-900">
                  {loading ? (
                    <img
                      src="https://i.gifer.com/ZKZg.gif"
                      className="h-10"
                      alt="Loading"
                    />
                  ) : (
                    `${rewriteRate}`
                  )}
                  <sub className="text-xl font-semibold ml-1">%</sub>
                </p>
              </div>
            </div>

            <div
              className="bg-white rounded-lg shadow-md p-6 border-l-[7px] border-green-600  w-full sm:w-[50%] lg:w-[40%]"
              data-aos="zoom-in"
            >
              <h3 className="text-gray-600 text-md font-medium mb-2">
                <b>Top 3</b> Performers
              </h3>
              {topPerformers.length > 0 ? (
                topPerformers.map((performer, index) => (
                  <p key={index} className="text-xl font-bold text-gray-900">
                    {index + 1}. {formatEmailToName(performer.email)} -{" "}
                    {performer.approvalRate}%
                  </p>
                ))
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>

            {/* Bottom 3 Performers */}
            <div
              className="bg-white rounded-lg shadow-md p-6 border-l-[7px] border-blue-600 w-full sm:w-[50%] lg:w-[40%]"
              data-aos="zoom-in"
            >
              <h3 className="text-gray-600 text-md font-medium mb-2">
                <b>Bottom 3</b> Performers
              </h3>
              {bottomPerformers.length > 0 ? (
                bottomPerformers.map((performer, index) => (
                  <p key={index} className="text-xl font-bold text-gray-900">
                    {index + 1}. {formatEmailToName(performer.email)} -{" "}
                    {performer.approvalRate}%
                  </p>
                ))
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      

      {(() => {
        if (user.role === "Reviewer") {
          return (
            <div className="mt-8 w-[80vw] ml-[10vw]" data-aos="fade-down">
              <Reviewer />
            </div>
          );
        }
        return null;
      })()}

      {(() => {
        if (user.role === "Developer") {
          return (
            <div className="mt-0 w-[80vw] ml-[10vw]" data-aos="fade-down">
              <div className="overflow-x-auto"></div>
              <Developer />
            </div>
          );
        }
        return null;
      })()}

      {(() => {
        if (user.role === "Admin") {
          return (
            <div className="mt-8 w-100vw ml-64" data-aos="fade-down">
              <div className="overflow-x-auto"></div>
              <Admin />
            </div>
          );
        }
        return null;
      })()}
    </>
  );
};

export default Project;
