// src/pages/Tasks/TaskDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useTaskStore } from "../../stores/taskStore";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { LoadingSpinner } from "../../components/Common/LoadingSpinner";
import { Modal } from "../../components/UI/Modal";
import { Input } from "../../components/UI/Input";
import toast from "react-hot-toast";

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    selectedTask,
    isLoading,
    fetchTaskById,
    deleteTask,
    updateTaskStatus,
    clearSelectedTask,
    addComment,
    deleteComment,
    addAssignee,
    removeAssignee,
    statuses,
    fetchStatuses,
  } = useTaskStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showAddAssignee, setShowAddAssignee] = useState(false);
  const [newAssigneeId, setNewAssigneeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTaskById(parseInt(id));
      fetchStatuses();
    }
    return () => {
      clearSelectedTask();
    };
  }, [id]);

  const handleDelete = async () => {
    if (id) {
      const success = await deleteTask(parseInt(id));
      if (success) {
        navigate("/tasks");
      }
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (statusId: number) => {
    if (id) {
      // Ensure statusId is a number
      const numericStatusId = Number(statusId);
      console.log("Updating status to:", numericStatusId);
      await updateTaskStatus(parseInt(id), numericStatusId);
    }
  };

  const handleAddComment = async () => {
    if (id && newComment.trim()) {
      setIsSubmitting(true);
      await addComment(parseInt(id), newComment);
      setNewComment("");
      setShowAddComment(false);
      setIsSubmitting(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <Button onClick={() => navigate("/tasks")} className="mt-4">
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/tasks")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedTask.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                style={{
                  backgroundColor: selectedTask.priorityColor
                    ? `${selectedTask.priorityColor}20`
                    : "#fef3c7",
                  color: selectedTask.priorityColor || "#92400e",
                }}
              >
                <FlagIcon className="w-3 h-3" />
                {selectedTask.priorityName}
              </span>

              <span
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: selectedTask.statusColor
                    ? `${selectedTask.statusColor}20`
                    : "#f3f4f6",
                  color: selectedTask.statusColor || "#374151",
                }}
              >
                {selectedTask.statusName}
              </span>
              <select
                value={selectedTask.statusId}
                onChange={(e) => handleStatusChange(parseInt(e.target.value))}
                className="px-2 py-0.5 text-xs rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{
                  backgroundColor: selectedTask.statusColor
                    ? `${selectedTask.statusColor}20`
                    : "#f3f4f6",
                  color: selectedTask.statusColor || "#374151",
                }}
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/tasks/${id}/edit`)}
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {selectedTask.description || "No description provided."}
            </p>
          </Card>

          {/* Comments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Comments ({selectedTask.comments?.length || 0})
              </h3>
              <Button size="sm" onClick={() => setShowAddComment(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Comment
              </Button>
            </div>

            {selectedTask.comments && selectedTask.comments.length > 0 ? (
              <div className="space-y-4">
                {selectedTask.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">
                          {comment.userName?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {comment.userName || "User"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      {comment.userId === user?.id && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">{comment.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Task Details
            </h3>
            <div className="space-y-3">
              {selectedTask.matterTitle && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Matter</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedTask.matterTitle}
                  </span>
                </div>
              )}
              {selectedTask.contactName && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Contact</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedTask.contactName}
                  </span>
                </div>
              )}
              {selectedTask.dueDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Due Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(selectedTask.dueDate)}
                  </span>
                </div>
              )}
              {selectedTask.estimatedHours && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Estimated Hours</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedTask.estimatedHours}h
                  </span>
                </div>
              )}
              {selectedTask.completedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Completed At</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatDate(selectedTask.completedAt)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Assignees */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Assignees ({selectedTask.assignees?.length || 0})
              </h3>
              <Button size="sm" onClick={() => setShowAddAssignee(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />
                Assign
              </Button>
            </div>

            {selectedTask.assignees && selectedTask.assignees.length > 0 ? (
              <div className="space-y-2">
                {selectedTask.assignees.map((assignee) => (
                  <div
                    key={assignee.userId}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                        {assignee.userName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {assignee.userName || `User ${assignee.userId}`}
                        </p>
                        {assignee.isPrimary && (
                          <span className="text-xs text-primary-600">
                            Primary Assignee
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        removeAssignee(selectedTask.id, assignee.userId)
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No assignees</p>
            )}
          </Card>

          {/* Dates */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="text-gray-900">
                    {formatDateTime(selectedTask.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="text-gray-900">
                    {formatDateTime(selectedTask.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "
            <strong>{selectedTask.title}</strong>"? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Comment Modal */}
      <Modal
        isOpen={showAddComment}
        onClose={() => setShowAddComment(false)}
        title="Add Comment"
        size="md"
      >
        <div className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Write your comment here..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddComment(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddComment}
              isLoading={isSubmitting}
              disabled={!newComment.trim()}
            >
              Add Comment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Assignee Modal */}
      <Modal
        isOpen={showAddAssignee}
        onClose={() => setShowAddAssignee(false)}
        title="Add Assignee"
        size="md"
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="User ID"
            placeholder="Enter user ID to assign"
            value={newAssigneeId || ""}
            onChange={(e) =>
              setNewAssigneeId(e.target.value ? parseInt(e.target.value) : null)
            }
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddAssignee(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (id && newAssigneeId) {
                  addAssignee(parseInt(id), newAssigneeId);
                  setShowAddAssignee(false);
                  setNewAssigneeId(null);
                }
              }}
              disabled={!newAssigneeId}
            >
              Add Assignee
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
