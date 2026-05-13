// src/pages/Calendar/EventView.tsx - Simplified version using store
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  BriefcaseIcon,
  UserIcon,
  ClockIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useCalendarStore } from '../../stores/calendarStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/UI/Modal';
import toast from 'react-hot-toast';

interface ExtendedAttendee {
  userId: number;
  userName: string;
  attendeeType: string;
  responseStatus: string;
}

export const EventView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedEvent, 
    isLoading, 
    fetchEventById, 
    deleteEvent, 
    clearSelectedEvent,
    getUserName,
    getUserById 
  } = useCalendarStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attendeesWithNames, setAttendeesWithNames] = useState<ExtendedAttendee[]>([]);

  useEffect(() => {
    if (id) {
      fetchEventById(parseInt(id));
    }
    return () => {
      clearSelectedEvent();
    };
  }, [id]);

  // Load attendee names when selectedEvent changes
  useEffect(() => {
    const loadAttendeeNames = async () => {
      if (selectedEvent?.attendees && selectedEvent.attendees.length > 0) {
        const enriched = await Promise.all(
          selectedEvent.attendees.map(async (attendee) => {
            let userName = getUserById(attendee.userId)?.fullName;
            if (!userName) {
              userName = await getUserName(attendee.userId);
            }
            return {
              ...attendee,
              userName: userName || `User ${attendee.userId}`,
            };
          })
        );
        setAttendeesWithNames(enriched);
      } else {
        setAttendeesWithNames([]);
      }
    };

    loadAttendeeNames();
  }, [selectedEvent, getUserName, getUserById]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const success = await deleteEvent(parseInt(id));
      if (success) {
        navigate('/calendar');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAttendanceResponse = async (status: string) => {
    toast.success(`Event ${status.toLowerCase()}`);
    if (id) {
      await fetchEventById(parseInt(id));
    }
  };

  const getEventTypeIcon = () => {
    if (!selectedEvent) return '📌';
    switch (selectedEvent.eventType) {
      case 'MEETING': return '👥';
      case 'COURT': return '⚖️';
      case 'DEADLINE': return '⏰';
      case 'APPOINTMENT': return '📅';
      default: return '📌';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('default', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('default', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserInitials = (userName: string) => {
    return userName.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Event not found</p>
        <Button onClick={() => navigate('/calendar')} className="mt-4">
          Back to Calendar
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
            onClick={() => navigate('/calendar')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{getEventTypeIcon()}</div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h1>
              {selectedEvent.isAllDay && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  All Day
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1">{selectedEvent.eventType}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/calendar/events/${id}/edit`)}>
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Event Details Card */}
      <Card>
        <div className="space-y-6">
          {/* Date and Time */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-gray-900 font-medium">{formatDate(selectedEvent.startDateTime)}</p>
              </div>
            </div>
            {!selectedEvent.isAllDay && (
              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-gray-900 font-medium">
                    {formatTime(selectedEvent.startDateTime)} - {formatTime(selectedEvent.endDateTime)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          {selectedEvent.location && (
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900">{selectedEvent.location}</p>
              </div>
            </div>
          )}

          {/* Related Matter */}
          {selectedEvent.matterTitle && (
            <div className="flex items-start gap-3">
              <BriefcaseIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Related Matter</p>
                <p className="text-gray-900">{selectedEvent.matterTitle}</p>
              </div>
            </div>
          )}

          {/* Related Contact */}
          {selectedEvent.contactName && (
            <div className="flex items-start gap-3">
              <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Related Contact</p>
                <p className="text-gray-900">{selectedEvent.contactName}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {selectedEvent.description && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 font-medium">Description</p>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
            </div>
          )}

          {/* Attendees */}
          {attendeesWithNames.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UsersIcon className="w-5 h-5 text-gray-400" />
                <h3 className="font-medium text-gray-900">Attendees ({attendeesWithNames.length})</h3>
              </div>
              <div className="space-y-2">
                {attendeesWithNames.map((attendee) => (
                  <div
                    key={attendee.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                        {getUserInitials(attendee.userName)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attendee.userName}</p>
                        <p className="text-xs text-gray-500 capitalize mt-1">{attendee.attendeeType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {attendee.responseStatus === 'ACCEPTED' && (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircleIcon className="w-4 h-4" /> Accepted
                        </span>
                      )}
                      {attendee.responseStatus === 'DECLINED' && (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <XCircleIcon className="w-4 h-4" /> Declined
                        </span>
                      )}
                      {attendee.responseStatus === 'TENTATIVE' && (
                        <span className="flex items-center gap-1 text-yellow-600 text-sm">
                          <QuestionMarkCircleIcon className="w-4 h-4" /> Tentative
                        </span>
                      )}
                      {attendee.responseStatus === 'PENDING' && (
                        <span className="flex items-center gap-1 text-gray-500 text-sm">
                          <ClockIcon className="w-4 h-4" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button onClick={() => handleAttendanceResponse('ACCEPTED')} className="flex-1">
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button variant="outline" onClick={() => handleAttendanceResponse('TENTATIVE')} className="flex-1">
              <QuestionMarkCircleIcon className="w-4 h-4 mr-2" />
              Maybe
            </Button>
            <Button variant="outline" onClick={() => handleAttendanceResponse('DECLINED')} className="flex-1">
              <XCircleIcon className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Event">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "<strong>{selectedEvent.title}</strong>"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};