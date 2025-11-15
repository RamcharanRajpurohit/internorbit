import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/common/Navigation";
import { toast } from "sonner";
import { getSession } from "@/integrations/supabase/client";
import {
  Bell,
  Check,
  Trash2,
  BriefcaseIcon,
  UserCheck,
  MessageSquare,
  TrendingUp,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URI;

interface Notification {
  id: string;
  type: "application" | "internship" | "message" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

const Notifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"student" | "company">("student");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const session = await getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get user role
      const roleResponse = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (roleResponse.ok) {
        const data = await roleResponse.json();
        setUserRole(data.profile?.role || "student");
      }

      // Load notifications from backend
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        // Fallback: Load from localStorage or show demo notifications
        const saved = localStorage.getItem("notifications");
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          // Demo notifications
          setNotifications([
            {
              id: "1",
              type: "application",
              title: "Application Status Updated",
              message: "Your application for Software Engineer Intern has been reviewed",
              read: false,
              createdAt: new Date().toISOString(),
              link: "/applications",
            },
            {
              id: "2",
              type: "internship",
              title: "New Internship Match",
              message: "3 new internships match your profile",
              read: false,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              link: "/search",
            },
          ]);
        }
      }
    } catch (error: any) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const session = await getSession();
      if (!session) return;

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      // Save to localStorage as fallback
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem("notifications", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const session = await getSession();
      if (!session) return;

      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      localStorage.setItem(
        "notifications",
        JSON.stringify(notifications.map((n) => ({ ...n, read: true })))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const session = await getSession();
      if (!session) return;

      await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      localStorage.setItem(
        "notifications",
        JSON.stringify(notifications.filter((n) => n.id !== id))
      );
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const clearAll = async () => {
    try {
      const session = await getSession();
      if (!session) return;

      await fetch(`${API_URL}/notifications`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      setNotifications([]);
      localStorage.removeItem("notifications");
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application":
        return <UserCheck className="w-5 h-5" />;
      case "internship":
        return <BriefcaseIcon className="w-5 h-5" />;
      case "message":
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role={userRole} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center relative">
                  <Bell className="w-6 h-6 text-primary-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-muted-foreground">
                    {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <Card className="p-4 shadow-card mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All ({notifications.length})
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("unread")}
                >
                  Unread ({unreadCount})
                </Button>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "You don't have any notifications yet"}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification, idx) => (
                <Card
                  key={notification.id}
                  className={`p-6 shadow-card hover:shadow-elevated transition-all cursor-pointer ${
                    !notification.read ? "border-l-4 border-l-primary" : ""
                  }`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id);
                    if (notification.link) navigate(notification.link);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.read
                          ? "bg-secondary"
                          : "bg-gradient-primary"
                      }`}
                    >
                      <span
                        className={
                          notification.read
                            ? "text-muted-foreground"
                            : "text-primary-foreground"
                        }
                      >
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge variant="default" className="flex-shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
