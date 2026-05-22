"use client";

import React, { useEffect, useState, useRef } from "react";

interface ProgressTrackerProps {
  jobId: string;
  onComplete: () => void;
  onFailure: (error: string) => void;
}

interface LogEntry {
  timestamp: string;
  status: string;
  step: string;
  message: string;
}

export default function ProgressTracker({ jobId, onComplete, onFailure }: ProgressTrackerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentStatus, setCurrentStatus] = useState<"pending" | "processing" | "completed" | "failed">("pending");
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId === "cached") {
      setCurrentStatus("completed");
      onComplete();
      return;
    }

    // Connect to FastAPI SSE stream (which is rewritten to http://localhost:8000/api/v1/receipts/status/{jobId})
    const eventSource = new EventSource(`/api/v1/receipts/status/${jobId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        const timestamp = data.timestamp 
          ? new Date(data.timestamp).toLocaleTimeString() 
          : new Date().toLocaleTimeString();

        const logEntry: LogEntry = {
          timestamp,
          status: data.status,
          step: data.step || "system",
          message: data.message,
        };

        setLogs((prevLogs) => [...prevLogs, logEntry]);

        if (data.status === "processing") {
          setCurrentStatus("processing");
        } else if (data.status === "completed") {
          setCurrentStatus("completed");
          eventSource.close();
          // Give the user a moment to see the completion log before switching views
          setTimeout(() => {
            onComplete();
          }, 1000);
        } else if (data.status === "failed") {
          setCurrentStatus("failed");
          eventSource.close();
          onFailure(data.message || "Extraction job failed.");
        }
      } catch (err) {
        console.error("Failed to parse SSE payload:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      setCurrentStatus("failed");
      eventSource.close();
      onFailure("Lost connection to progress update stream.");
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, onComplete, onFailure]);

  // Scroll to bottom on new log
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Helper to color code log status tags
  const getTagColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 border-green-500/30 bg-green-500/10";
      case "failed":
        return "text-red-400 border-red-500/30 bg-red-500/10";
      case "processing":
        return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
      default:
        return "text-slate-400 border-slate-500/30 bg-slate-500/10";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Status Card */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-3 w-3">
            {currentStatus === "processing" || currentStatus === "pending" ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </>
            ) : currentStatus === "completed" ? (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 capitalize">
              Job Status: {currentStatus}
            </h4>
            <p className="text-xs text-slate-500 font-mono">ID: {jobId}</p>
          </div>
        </div>

        {(currentStatus === "pending" || currentStatus === "processing") && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>AI Parsing...</span>
          </div>
        )}
      </div>

      {/* Terminal Console */}
      <div className="w-full rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-900/50">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs font-mono text-slate-500">extraction_agent.log</span>
          <div className="w-12"></div> {/* Spacer to center the title */}
        </div>

        {/* Terminal Logs */}
        <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">Awaiting connection to worker queue...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start space-x-2 text-slate-300">
                <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                <span
                  className={`px-1.5 py-0.2 rounded border text-[10px] uppercase font-semibold select-none ${getTagColor(
                    log.status
                  )}`}
                >
                  {log.step}
                </span>
                <span className="flex-1 break-words">{log.message}</span>
              </div>
            ))
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
