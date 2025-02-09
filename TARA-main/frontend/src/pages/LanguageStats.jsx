import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { RiLoader2Line } from "react-icons/ri";

const LanguageStats = ({ languageStats, loading, setLoading }) => {
  const chartOptions = {
    chart: {
      type: "column",
      height: "40%",
    },
    title: {
      text: "Language Task Statistics",
    },
    xAxis: {
      categories: languageStats.map((lang) => lang.LANGUAGE),
      title: {
        text: "Languages",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Tasks",
      },
    },
    series: [
      {
        name: "Total Tasks",
        data: languageStats.map((lang) => lang.TOTAL_TASKS),
        color: "#007bff",
      },
      {
        name: "Approved",
        data: languageStats.map((lang) => lang.APPROVED_COUNT),
        color: "#28a745",
      },
      {
        name: "Rejected",
        data: languageStats.map((lang) => lang.REJECTED_COUNT),
        color: "#dc2626",
      },
      {
        name: "Rewrites",
        data: languageStats.map((lang) => lang.BATCH_REWRITE_COUNT),
        color: "#9333ea",
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="container px-4 py-8">
      <div className="">
        {loading ? (
          <div>
            Loading Chart...
            <RiLoader2Line className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default LanguageStats;
