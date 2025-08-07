import { useState } from "react";
import { TwinProfile } from "@/services/api";
import TwinProfileList from "./TwinProfileList";
import TwinProfileForm from "./TwinProfileForm";
import TwinProfileDetails from "./TwinProfileDetails";

type ViewMode = "list" | "create" | "details";

interface TwinManagementPageProps {
  onStartChat?: (twin: TwinProfile) => void;
}

export default function TwinManagementPage({ onStartChat }: TwinManagementPageProps) {
  const [currentView, setCurrentView] = useState<ViewMode>("list");
  const [selectedTwinId, setSelectedTwinId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleViewTwin = (twinId: string) => {
    setSelectedTwinId(twinId);
    setCurrentView("details");
  };

  const handleCreateTwin = () => {
    setCurrentView("create");
  };

  const handleSaveComplete = () => {
    setCurrentView("list");
    setRefreshTrigger(prev => prev + 1); // Trigger refresh of list
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedTwinId(null);
  };

  const handleStartChat = (twin: TwinProfile) => {
    if (onStartChat) {
      onStartChat(twin);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {currentView === "list" && (
        <TwinProfileList
          onViewTwin={handleViewTwin}
          onCreate={handleCreateTwin}
          onStartChat={handleStartChat}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentView === "create" && (
        <TwinProfileForm
          onSave={handleSaveComplete}
          onCancel={handleBackToList}
        />
      )}

      {currentView === "details" && selectedTwinId && (
        <TwinProfileDetails
          twinId={selectedTwinId}
          onBack={handleBackToList}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}
