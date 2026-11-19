import { useState } from "react";
import { mockDashboardStats } from "../data/mockDashboard";

import AppShell from "../components/layout/AppShell";
import Header from "../components/layout/Header";
import ObjectivesPage from "../components/objectives/ObjectivesPage";
import TasksPage from "../components/tasks/TasksPage";
import HomeDashboard from "../components/dashboard/HomeDashboard";
import TodayPage from "../components/dashboard/TodayPage";

type AppView = "home" | "tasks" | "objectives" | "today";

function App() {
  const [activeView, setActiveView] = useState<AppView>("home");

  return (
    <AppShell>
      <Header activeView={activeView} onChangeView={setActiveView} />

      {activeView === "home" ? (
        <HomeDashboard dashboardStats={mockDashboardStats} />
      ) : null}

      {activeView === "tasks" ? <TasksPage /> : null}
      {activeView === "objectives" ? <ObjectivesPage /> : null}
      {activeView === "today" ? <TodayPage /> : null}
    </AppShell>
  );
}

export default App;
