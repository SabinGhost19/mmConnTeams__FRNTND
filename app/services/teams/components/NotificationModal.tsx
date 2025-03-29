// components/TeamsLanding/NotificationModal.tsx
import React from "react";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  teamId?: string;
  teamName?: string;
  isRead: boolean;
  actions?: string[];
}

interface NotificationModalProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (notificationId: number) => void;
  onJoinTeam: (teamId: number, notificationId: number) => void;
  onRejectTeamInvite: (teamId: number, notificationId: number) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onJoinTeam,
  onRejectTeamInvite,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Notificări</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-gray-600">Nu ai notificări noi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">
                      {notification.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.date).toLocaleString("ro-RO", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1 text-sm">
                    {notification.message}
                  </p>

                  {notification.type === "joinTeam" && notification.teamId && (
                    <div className="mt-3 flex justify-end space-x-3">
                      <button
                        onClick={() =>
                          onRejectTeamInvite(
                            notification.teamId!,
                            notification.id
                          )
                        }
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Respinge
                      </button>
                      <button
                        onClick={() =>
                          onJoinTeam(notification.teamId!, notification.id)
                        }
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Alătură-te echipei
                      </button>
                    </div>
                  )}

                  {!notification.isRead && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Marchează ca citită
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
