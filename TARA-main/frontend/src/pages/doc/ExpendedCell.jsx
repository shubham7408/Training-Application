import React, { useState, useCallback } from 'react';

const ExpandableCell = ({ content, maxLength = 50, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  }, []);

  // Handle content conversion and validation
  const processContent = (content) => {
    if (content === null || content === undefined) return '';
    return String(content);
  };

  const processedContent = processContent(content);
  const contentLength = processedContent.length;

  // Return simple display if content is short or empty
  if (!processedContent || contentLength <= maxLength) {
    return <span className={className}>{processedContent}</span>;
  }

  const displayText = isExpanded 
    ? processedContent 
    : processedContent.slice(0, maxLength);

  return (
    <div className="group relative">
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="inline-block">
          {displayText}
          {!isExpanded && (
            <span className="text-gray-500">...</span>
          )}
        </span>
        <button
          onClick={handleToggle}
          className="text-blue-500 hover:text-blue-700 text-sm font-medium ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100"
          aria-label={isExpanded ? "Show less" : "Show more"}
        >
          {isExpanded ? (
            <span className="flex items-center">
              <span className="mr-1">▼</span>
              Less
            </span>
          ) : (
            <span className="flex items-center">
              <span className="mr-1">▶</span>
              More
            </span>
          )}
        </button>
      </div>
      {isExpanded && (
        <div 
          className="absolute top-0 left-0 z-10 bg-white shadow-lg rounded-md p-4 border border-gray-200 min-w-[200px] max-w-[400px] mt-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-[200px] overflow-y-auto">
            {processedContent}
          </div>
          <button
            onClick={handleToggle}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpandableCell;