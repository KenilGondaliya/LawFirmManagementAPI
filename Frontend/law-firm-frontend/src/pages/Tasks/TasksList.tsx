// src/pages/Tasks/TasksList.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  FlagIcon,
  UserIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useTaskStore } from "../../stores/taskStore";
import { useMatterStore } from "../../stores/matterStore";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Card } from "../../components/UI/Card";
import { LoadingSpinner } from "../../components/Common/LoadingSpinner";
import { EmptyState } from "../../components/Common/EmptyState";

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export const TasksList: React.FC = () => {
  const navigate = useNavigate();
  const {
    tasks,
    isLoading,
    fetchTasks,
    fetchStats,
    stats,
    statuses,
    fetchStatuses,
    priorities,
    fetchPriorities,
  } = useTaskStore();
  const { matters, fetchMatters } = useMatterStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [matterFilter, setMatterFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchTasks({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      matterId: matterFilter || undefined,
    });
    fetchStats();
    fetchStatuses();
    fetchPriorities();
    fetchMatters({});
  }, [debouncedSearch, statusFilter, priorityFilter, matterFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
    setMatterFilter(null);
  };

  const hasActiveFilters =
    searchTerm || statusFilter || priorityFilter || matterFilter;

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return "No due date";
    const date = new Date(dueDate);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return (
      new Date(dueDate) < new Date() &&
      new Date(dueDate).toDateString() !== new Date().toDateString()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">
            Manage your tasks, deadlines, and to-dos
          </p>
        </div>
        <Button onClick={() => navigate("/tasks/create")}>
          <PlusIcon className="w-5 h-5 mr-2" />
          New Task
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="cursor-pointer" onClick={() => setStatusFilter("")}>
            <Card className="p-3 text-center hover:shadow-md">
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </Card>
          </div>

          <div
            className="cursor-pointer"
            onClick={() => setStatusFilter("Completed")}
          >
            <Card className="p-3 text-center hover:shadow-md">
              <p className="text-xl font-bold text-green-600">
                {stats.completed}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </Card>
          </div>

          <div
            className="cursor-pointer"
            onClick={() => setStatusFilter("In Progress")}
          >
            <Card className="p-3 text-center hover:shadow-md">
              <p className="text-xl font-bold text-blue-600">
                {stats.inProgress}
              </p>
              <p className="text-xs text-gray-500">In Progress</p>
            </Card>
          </div>

          <div className="cursor-pointer" onClick={() => setStatusFilter("")}>
            <Card className="p-3 text-center hover:shadow-md">
              <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-gray-500">Overdue</p>
            </Card>
          </div>

          <div className="cursor-pointer" onClick={() => setStatusFilter("")}>
            <Card className="p-3 text-center hover:shadow-md">
              <p className="text-xl font-bold text-orange-600">
                {stats.dueToday}
              </p>
              <p className="text-xs text-gray-500">Due Today</p>
            </Card>
          </div>

          <div className="cursor-pointer" onClick={() => setStatusFilter("")}>
            <Card className="p-3 text-center hover:shadow-md">
              <p className="text-xl font-bold text-purple-600">
                {stats.myTasks}
              </p>
              <p className="text-xs text-gray-500">My Tasks</p>
            </Card>
          </div>

          <div className="cursor-pointer" onClick={() => setStatusFilter("")}>
            <Card className="p-3 text-center hover:shadow-md">
              <p className="text-xl font-bold text-yellow-600">
                {stats.myPendingTasks}
              </p>
              <p className="text-xs text-gray-500">My Pending</p>
            </Card>
          </div>
        </div>
      )}

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters{" "}
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <XMarkIcon className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter("")}
                    className={`px-3 py-1 rounded-full text-sm ${statusFilter === "" ? "bg-primary-600 text-white" : "bg-gray-100"}`}
                  >
                    All
                  </button>
                  {statuses.map((status) => (
                    <button
                      key={status.id}
                      onClick={() => setStatusFilter(status.name)}
                      className={`px-3 py-1 rounded-full text-sm ${statusFilter === status.name ? "bg-primary-600 text-white" : "bg-gray-100"}`}
                    >
                      {status.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPriorityFilter("")}
                    className={`px-3 py-1 rounded-full text-sm ${priorityFilter === "" ? "bg-primary-600 text-white" : "bg-gray-100"}`}
                  >
                    All
                  </button>
                  {priorities.map((priority) => (
                    <button
                      key={priority.id}
                      onClick={() => setPriorityFilter(priority.name)}
                      className={`px-3 py-1 rounded-full text-sm ${priorityFilter === priority.name ? "bg-primary-600 text-white" : "bg-gray-100"}`}
                    >
                      {priority.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matter
                </label>
                <select
                  value={matterFilter || ""}
                  onChange={(e) =>
                    setMatterFilter(
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Matters</option>
                  {matters.map((matter) => (
                    <option key={matter.id} value={matter.id}>
                      {matter.matterNumber} - {matter.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {isLoading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to start tracking your work"
          buttonText="Create Task"
          onButtonClick={() => navigate("/tasks/create")}
          icon={<CheckCircleIcon className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="cursor-pointer"
              onClick={() => navigate(`/tasks/${task.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/tasks/${task.id}`);
                }
              }}
            >
              <Card className="p-4 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div
                    className="w-2 h-2 rounded-full mt-2"
                    style={{ backgroundColor: task.statusColor || "#9ca3af" }}
                  />

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {task.title}
                      </h3>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${priorityColors[task.priorityName]}`}
                      >
                        <FlagIcon className="w-3 h-3" />
                        {task.priorityName}
                      </span>

                      <span
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{
                          backgroundColor: task.statusColor
                            ? `${task.statusColor}20`
                            : "#f3f4f6",
                          color: task.statusColor || "#374151",
                        }}
                      >
                        {task.statusName}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {task.matterTitle && <span>📁 {task.matterTitle}</span>}
                      {task.contactName && <span>👤 {task.contactName}</span>}

                      {task.dueDate && (
                        <span
                          className={
                            isOverdue(task.dueDate)
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          <CalendarIcon className="w-3 h-3 inline mr-1" />
                          Due: {formatDueDate(task.dueDate)}
                        </span>
                      )}

                      {task.estimatedHours && (
                        <span>⏱️ {task.estimatedHours}h</span>
                      )}
                    </div>

                    {task.assignees?.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <UserIcon className="w-3 h-3 text-gray-400" />
                        <div className="flex -space-x-1">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <div
                              key={assignee.userId}
                              className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white"
                              title={
                                assignee.userName || `User ${assignee.userId}`
                              }
                            >
                              {assignee.userName?.charAt(0) || "U"}
                            </div>
                          ))}

                          {task.assignees.length > 3 && (
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 ring-2 ring-white">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {task.dueDate && isOverdue(task.dueDate) && (
                    <div className="flex-shrink-0">
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                        Overdue
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
