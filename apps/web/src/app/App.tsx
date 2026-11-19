import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { useState } from "react";
import { isTaskArray } from "../utils/taskGuards";
import { mockTasks } from "../data/mockTasks";
import { mockDashboardStats } from "../data/mockDashboard";
import type { Task } from "../types/task";

import AppShell from "../components/layout/AppShell";
import Header from "../components/layout/Header";
import ObjectivesPage from "../components/objectives/ObjectivesPage";
import TasksPage from "../components/tasks/TasksPage";
import HomeDashboard from "../components/dashboard/HomeDashboard";
import TodayPage from "../components/dashboard/TodayPage";

type AppView = "home" | "tasks" | "objectives" | "today";

function createTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    status: "brain_dump",
    createdAt: new Date().toISOString(),
  };
}

function App() {
  const [activeView, setActiveView] = useState<AppView>("home");
  const [tasks, setTasks] = useLocalStorageState<Task[]>(
    "task-rain:tasks",
    mockTasks,
    isTaskArray,
  );

  const unorganizedTaskCount = tasks.filter(
    (task) => task.status === "brain_dump",
  ).length;

  function handleCreateTask(title: string) {
    const task = createTask(title);

    setTasks((currentTasks) => [task, ...currentTasks]);

    return task;
  }

  function handleUndoCreateTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  }

  return (
    <AppShell>
      <Header activeView={activeView} onChangeView={setActiveView} />

      {activeView === "home" ? (
        <HomeDashboard
          dashboardStats={mockDashboardStats}
          unorganizedTaskCount={unorganizedTaskCount}
          onCreateTask={handleCreateTask}
          onUndoCreateTask={handleUndoCreateTask}
          onOpenTasks={() => setActiveView("tasks")}
        />
      ) : null}
      {activeView === "tasks" ? <TasksPage /> : null}
      {activeView === "objectives" ? <ObjectivesPage /> : null}
      {activeView === "today" ? <TodayPage /> : null}
    </AppShell>
  );
}

export default App;
