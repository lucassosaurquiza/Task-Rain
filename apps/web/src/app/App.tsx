import { useState } from "react";
import HomeDashboard from "../components/dashboard/HomeDashboard";
import AppShell from "../components/layout/AppShell";
import Header from "../components/layout/Header";
import TasksPage from "../components/tasks/TasksPage";

type AppView = "home" | "tasks" | "objectives";

function App() {
  const [activeView, setActiveView] = useState<AppView>("home");

  return (
    <AppShell>
      <Header activeView={activeView} onChangeView={setActiveView} />

      {activeView === "home" ? <HomeDashboard /> : null}
      {activeView === "tasks" ? <TasksPage /> : null}
      {activeView === "objectives" ? (
        <main className="flex flex-1 items-center justify-center py-10">
          <section className="w-full max-w-5xl rounded-lg border border-zinc-800 bg-zinc-900/60 p-8">
            <p className="text-sm font-medium text-emerald-400">Objetivos</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
              Objetivos principales
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Esta vista va a conectar tus tareas diarias con objetivos más
              grandes.
            </p>
          </section>
        </main>
      ) : null}
    </AppShell>
  );
}

export default App;
