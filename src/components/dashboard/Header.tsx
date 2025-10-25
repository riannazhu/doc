import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const notifications = [
  {
    id: 1,
    message: "Your passport will expire in 3 months",
    priority: "urgent",
    color: "destructive",
    fileName: "Passport_Scan.pdf",
    folderName: "Legal",
    dueDate: "Expires in 3 months",
  },
  {
    id: 2,
    message: "Tax Form 2024 due in 45 days",
    priority: "high",
    color: "warning",
    fileName: "Tax_Form_2024.pdf",
    folderName: "Financial/Taxes",
    dueDate: "Due in 45 days",
  },
  {
    id: 3,
    message: "Job Application - Meta due in 5 days",
    priority: "urgent",
    color: "destructive",
    fileName: "Job_Application_Meta.pdf",
    folderName: "Work",
    dueDate: "Due in 5 days",
  },
];

export const Header = () => {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    navigate("/action", {
      state: {
        fileName: notification.fileName,
        folderName: notification.folderName,
        dueDate: notification.dueDate,
        message: notification.message,
      },
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-end px-6 gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-destructive text-destructive-foreground rounded-full animate-pulse-glow">
              {notifications.length}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-surface border-border">
          <div className="p-2 font-semibold">Notifications</div>
          <DropdownMenuSeparator />
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className="p-3 cursor-pointer hover:bg-accent/10 hover:border-accent border border-transparent transition-all"
            >
              <div className="flex gap-3 items-start">
                <div
                  className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                    notification.color === "destructive"
                      ? "bg-destructive"
                      : notification.color === "warning"
                      ? "bg-warning"
                      : "bg-success"
                  }`}
                />
                <p className="text-sm flex-1">{notification.message}</p>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate("/timeline")}
            className="justify-center text-accent hover:bg-accent/10"
          >
            View Timeline
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-surface border-border">
          <div className="px-2 py-1.5 text-sm">
            <div className="font-semibold">Rianna Zhu</div>
            <div className="text-xs text-muted-foreground">riannazhu@berkeley.edu</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="hover:bg-accent/10">Edit Profile</DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-accent/10">My Info</DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-accent/10">Notifications</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="hover:bg-accent/10 text-destructive"
          >
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};