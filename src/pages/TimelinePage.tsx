import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const timelineItems = [
  {
    id: 1,
    title: "Tax Form 2024",
    category: "Financial/Taxes",
    dueDate: "Due in 45 days",
    priority: "high",
    date: "April 15, 2025",
  },
  {
    id: 2,
    title: "Job Application - Meta",
    category: "Work",
    dueDate: "Due in 5 days",
    priority: "urgent",
    date: "March 10, 2025",
  },
  {
    id: 3,
    title: "Passport Renewal",
    category: "Legal",
    dueDate: "Expires in 3 months",
    priority: "urgent",
    date: "June 5, 2025",
  },
  {
    id: 4,
    title: "Health Insurance Renewal",
    category: "Medical",
    dueDate: "Due in 2 months",
    priority: "medium",
    date: "May 1, 2025",
  },
  {
    id: 5,
    title: "Car Registration",
    category: "Car",
    dueDate: "Due in 90 days",
    priority: "medium",
    date: "June 5, 2025",
  },
];

export default function TimelinePage() {
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      case "high":
        return "bg-warning/10 border-warning/20 text-warning";
      default:
        return "bg-success/10 border-success/20 text-success";
    }
  };

  const handleItemClick = (item: typeof timelineItems[0]) => {
    navigate("/action", {
      state: {
        fileName: item.title,
        folderName: item.category,
        dueDate: item.dueDate,
        message: `${item.title} - ${item.dueDate}`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="h-8 w-8 text-accent" />
            <div>
              <h1 className="text-3xl font-bold">Timeline</h1>
              <p className="text-muted-foreground">Your upcoming deadlines and tasks</p>
            </div>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {timelineItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative pl-16 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-4 top-4 h-5 w-5 rounded-full border-4 border-background ${
                      item.priority === "urgent"
                        ? "bg-destructive"
                        : item.priority === "high"
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                  />

                  <button
                    onClick={() => handleItemClick(item)}
                    className="w-full bg-surface border border-border rounded-xl p-6 hover:border-accent hover:bg-accent/5 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                            {item.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              item.priority
                            )}`}
                          >
                            {item.priority === "urgent" && <AlertCircle className="inline h-3 w-3 mr-1" />}
                            {item.dueDate}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{item.date}</span>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 mt-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Click any item to view available actions and let Doc help you complete tasks efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}