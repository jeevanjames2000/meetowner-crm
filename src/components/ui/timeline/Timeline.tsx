import React from "react";
import { CheckCircle, Clock } from "lucide-react";

const allDesignationOptions = [
  { value: "1", text: "Builder" },
  { value: "2", text: "Sales Manager" },
  { value: "3", text: "Telecaller" },
  { value: "4", text: "Marketing Agent" },
];

export interface TimelineEvent {
  label: string;
  timestamp: string;
  status: "completed" | "pending";
  description?: string;
  nextAction?: string;
  current?: boolean;
  updatedEmpType?: string | number
  updatedEmpId?: string;
  updatedEmpPhone?: string;
  updatedEmpName?: string;
}

const Timeline: React.FC<{ data?: TimelineEvent[] }> = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No timeline data available.
      </p>
    );
  }

  const getDesignation = (empType?: string | number) => {
    if (!empType) return "Unknown Designation";
    const designation = allDesignationOptions.find(
      (emp) => emp.value === empType.toString()
    )?.text;
    return designation || "Unknown Designation";
  };

 const formatTimestampToIST = (timestamp: string): string => {
  try {
    let utcDate: Date;

    // Case 1: If backend sends "ISO ExtraTime"
    if (timestamp.includes(" ")) {
      const [isoPart, extraTime] = timestamp.split(" ");
      if (extraTime) {
        // Merge into a single ISO string
        const baseDate = new Date(isoPart);
        if (isNaN(baseDate.getTime())) return "Invalid Date";

        const [h, m, s] = extraTime.split(":").map(Number);
        baseDate.setUTCHours(h);
        baseDate.setUTCMinutes(m);
        baseDate.setUTCSeconds(s);

        utcDate = baseDate;
      } else {
        utcDate = new Date(isoPart);
      }
    } else {
      // Case 2: Proper ISO timestamp
      utcDate = new Date(timestamp);
    }

    if (isNaN(utcDate.getTime())) {
      console.error("Invalid Date detected for timestamp:", timestamp);
      return "Invalid Date";
    }

    // Convert to IST
    return utcDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error parsing timestamp:", timestamp, error);
    return "Invalid Date";
  }
};
  return (
    <ol className="relative border-l border-blue-600 dark:border-blue-600">
      {data.map((event, index) => (
        <li key={index} className="mb-10 ml-6">
          <span className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-white ring-4 ring-white dark:ring-gray-900">
            {event.status === "completed" || event.current ? (
              <CheckCircle size={14} />
            ) : (
              <Clock size={14} />
            )}
          </span>
          <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900 dark:text-white">
            {event.label}
            {event.current && (
              <span className="ml-2 text-green-600 text-xs font-medium">
                (Current)
              </span>
            )}
          </h3>
           <time className="block mb-2 text-xs text-gray-400 dark:text-gray-500">
            {formatTimestampToIST(event.timestamp)}
          </time>
          {event.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {event.description}
            </p>
          )}
          {event.nextAction && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {event.nextAction}
            </p>
          )}
          {event.updatedEmpType &&
            getDesignation(event.updatedEmpType) !== "Unknown Designation" && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {getDesignation(event.updatedEmpType)}
              </p>
            )}
          {event.updatedEmpName && event.updatedEmpPhone && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {event.updatedEmpName} | {event.updatedEmpPhone}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
};

export default Timeline;
