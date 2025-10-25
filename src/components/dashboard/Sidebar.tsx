import { ChevronLeft, ChevronRight, Folder, File } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileItem {
  name: string;
  notificationCount?: number;
  dueDate?: string;
}

interface FolderItem {
  name: string;
  icon?: typeof Folder;
  notificationCount?: number;
  subfolders?: FolderItem[];
  files?: FileItem[];
}

const folders: FolderItem[] = [
  { 
    name: "Work", 
    notificationCount: 3,
    files: [
      { name: "Berkeley_Research_Resume.pdf" },
      { name: "NDA_Draft_v2.docx" },
      { name: "Job_Application_Meta.pdf", notificationCount: 1, dueDate: "Due in 5 days" },
    ]
  },
  { 
    name: "Medical", 
    notificationCount: 1,
    files: [
      { name: "Health_Insurance_2024.pdf" },
      { name: "Vaccination_Records.pdf" },
    ]
  },
  {
    name: "Financial",
    notificationCount: 5,
    subfolders: [
      { 
        name: "Taxes", 
        notificationCount: 2,
        files: [
          { name: "W2_2024.pdf" },
          { name: "Tax_Form_2024.pdf", notificationCount: 2, dueDate: "Due in 45 days" },
        ]
      },
      { 
        name: "Paychecks",
        files: [
          { name: "Paycheck_Jan_2025.pdf" },
          { name: "Paycheck_Feb_2025.pdf" },
        ]
      },
    ],
    files: [
      { name: "Bank_Statement_Jan.pdf" },
      { name: "Credit_Report_2024.pdf" },
    ]
  },
  { 
    name: "Rent",
    files: [
      { name: "Lease_Agreement.pdf" },
      { name: "Rent_Receipt_Feb.pdf" },
    ]
  },
  { 
    name: "Car",
    files: [
      { name: "Car_Insurance_Policy.pdf" },
      { name: "Registration_2025.pdf" },
    ]
  },
  { 
    name: "Legal",
    notificationCount: 1,
    files: [
      { name: "Passport_Scan.pdf", notificationCount: 1, dueDate: "Expires in 3 months" },
      { name: "Birth_Certificate.pdf" },
    ]
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ collapsed, onToggleCollapse }: SidebarProps) => {
  const navigate = useNavigate();
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["Financial"]);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderName)
        ? prev.filter((f) => f !== folderName)
        : [...prev, folderName]
    );
  };

  const handleFileClick = (file: FileItem, folderName: string) => {
    navigate("/action", { 
      state: { 
        fileName: file.name, 
        folderName,
        dueDate: file.dueDate 
      } 
    });
  };

  return (
    <div
      className={cn(
        "h-screen bg-surface border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-14" : "w-52"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!collapsed && <h2 className="font-semibold text-foreground">Library</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {folders.map((folder) => (
          <div key={folder.name} className="mb-1">
            <button
              onClick={() => toggleFolder(folder.name)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent/10 hover:border-accent border border-transparent transition-all relative"
            >
              <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm flex-1 text-left">{folder.name}</span>
                  {folder.notificationCount && (
                    <span className="h-5 w-5 flex items-center justify-center text-xs bg-destructive text-destructive-foreground rounded-full animate-pulse-glow">
                      {folder.notificationCount}
                    </span>
                  )}
                </>
              )}
              {collapsed && folder.notificationCount && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse-glow" />
              )}
            </button>

            {!collapsed && expandedFolders.includes(folder.name) && (
              <div className="ml-6 mt-1 space-y-1 animate-accordion-down">
                {folder.files?.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => handleFileClick(file, folder.name)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent/10 hover:border-accent border border-transparent transition-all relative"
                  >
                    <File className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm flex-1 text-left text-muted-foreground truncate">
                      {file.name}
                    </span>
                    {file.notificationCount && (
                      <span className="h-5 w-5 flex items-center justify-center text-xs bg-destructive text-destructive-foreground rounded-full flex-shrink-0">
                        {file.notificationCount}
                      </span>
                    )}
                  </button>
                ))}
                
                {folder.subfolders?.map((subfolder) => (
                  <div key={subfolder.name} className="space-y-1">
                    <button
                      onClick={() => toggleFolder(subfolder.name)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent/10 hover:border-accent border border-transparent transition-all relative"
                    >
                      <Folder className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm flex-1 text-left text-muted-foreground">
                        {subfolder.name}
                      </span>
                      {subfolder.notificationCount && (
                        <span className="h-5 w-5 flex items-center justify-center text-xs bg-destructive text-destructive-foreground rounded-full">
                          {subfolder.notificationCount}
                        </span>
                      )}
                    </button>
                    
                    {expandedFolders.includes(subfolder.name) && subfolder.files && (
                      <div className="ml-4 space-y-1">
                        {subfolder.files.map((file) => (
                          <button
                            key={file.name}
                            onClick={() => handleFileClick(file, `${folder.name}/${subfolder.name}`)}
                            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent/10 hover:border-accent border border-transparent transition-all relative"
                          >
                            <File className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm flex-1 text-left text-muted-foreground truncate">
                              {file.name}
                            </span>
                            {file.notificationCount && (
                              <span className="h-5 w-5 flex items-center justify-center text-xs bg-destructive text-destructive-foreground rounded-full flex-shrink-0">
                                {file.notificationCount}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};