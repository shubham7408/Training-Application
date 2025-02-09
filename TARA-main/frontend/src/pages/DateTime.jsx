import React, { useState } from "react";
import { useProjectContext } from "../contextapi/allcontext";
const DateTimeSelector = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleStartDateChange,
    handleEndDateChange,
  } = useProjectContext();

  const formatToISO = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    // Convert to ISO string and keep only the needed precision
    return new Date(dateTimeStr).toISOString().slice(0, -5) + "Z";
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      <input
        type="datetime-local"
        value={startDate}
        onChange={handleStartDateChange}
        className="border rounded h-6 w-44 px-1 text-xs"
        step="0.001"
      />
      <span>-</span>
      <input
        type="datetime-local"
        value={endDate}
        onChange={handleEndDateChange}
        className="border rounded h-6 w-44 px-1 text-xs"
        step="0.001"
      />
      <div className="ml-2 text-xs">
        {startDate && <div>Start: {formatToISO(startDate)}</div>}
        {endDate && <div>End: {formatToISO(endDate)}</div>}
      </div>
    </div>
  );
};

export default DateTimeSelector;
