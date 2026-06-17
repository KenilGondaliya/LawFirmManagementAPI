// src/pages/Documents/SharedDocuments.tsx - Complete fixed version

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentIcon,
  EyeIcon,
  ShareIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useDocumentStore } from "../../stores/documentStore";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { LoadingSpinner } from "../../components/Common/LoadingSpinner";
import { EmptyState } from "../../components/Common/EmptyState";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import api from "../../services/api";

interface SharedDocument {
  id: number;
  documentId: number;
  documentTitle: string;
  documentFileName: string;
  sharedBy: string;
  sharedByEmail: string;
  sharedWithEmail: string;
  permission: string;
  shareToken: string;
  sharedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export const SharedDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/documents/shared-with-me");
      console.log("Shared documents response:", response.data);

      // Ensure we always have an array
      const documents = Array.isArray(response.data) ? response.data : [];
      setSharedDocuments(documents);

      if (documents.length === 0) {
        console.log("No shared documents found");
      }
    } catch (error: any) {
      console.error("Failed to fetch shared documents:", error);
      toast.error(
        error.response?.data?.message || "Failed to load shared documents",
      );
      setSharedDocuments([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSharedDocuments();
    toast.success("Refreshed shared documents");
  };

  const handleViewDocument = (documentId: number) => {
    navigate(`/documents/${documentId}`);
  };

  const handleDownload = async (shareToken: string, fileName: string) => {
    try {
      const response = await api.get(
        `/documents/shared/download/${shareToken}`,
        {
          responseType: "blob",
        },
      );
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (error) {
      console.error("Failed to download:", error);
      toast.error("Failed to download document");
    }
  };

  const getPermissionBadge = (permission: string) => {
    const colors: Record<string, string> = {
      VIEW: "bg-blue-100 text-blue-700",
      EDIT: "bg-green-100 text-green-700",
      COMMENT: "bg-purple-100 text-purple-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[permission] || "bg-gray-100 text-gray-700"}`}
      >
        {permission}
      </span>
    );
  };

  const getStatusBadge = (expiresAt?: string) => {
    if (!expiresAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
          <CheckCircleIcon className="w-3 h-3" />
          Active
        </span>
      );
    }
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    if (expiryDate < now) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
          <XCircleIcon className="w-3 h-3" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
        <ClockIcon className="w-3 h-3" />
        Expires {formatDistanceToNow(expiryDate, { addSuffix: true })}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shared with Me</h1>
          <p className="text-gray-500 mt-1">
            Documents that others have shared with you
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          isLoading={isRefreshing}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {sharedDocuments.length}
          </p>
          <p className="text-sm text-gray-500">Total Shared</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {sharedDocuments.filter((d) => d.isActive).length}
          </p>
          <p className="text-sm text-gray-500">Active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {sharedDocuments.filter((d) => !d.isActive).length}
          </p>
          <p className="text-sm text-gray-500">Expired</p>
        </Card>
      </div>

      {/* Shared Documents List */}
      {sharedDocuments.length > 0 ? (
        <div className="space-y-4">
          {sharedDocuments.map((doc) => (
            <Card key={doc.id} className="p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <DocumentIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {doc.documentTitle}
                      </h3>
                      {getPermissionBadge(doc.permission)}
                      {getStatusBadge(doc.expiresAt)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {doc.documentFileName}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>Shared by: {doc.sharedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="w-3 h-3" />
                        <span>{doc.sharedByEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>
                          Shared{" "}
                          {formatDistanceToNow(new Date(doc.sharedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDocument(doc.documentId)}
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(doc.shareToken, doc.documentFileName)
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No shared documents"
          description="When someone shares a document with you, it will appear here"
          icon={<ShareIcon className="w-12 h-12 text-gray-400" />}
          buttonText="Go to Documents"
          onButtonClick={() => navigate("/documents")}
        />
      )}
    </div>
  );
};
