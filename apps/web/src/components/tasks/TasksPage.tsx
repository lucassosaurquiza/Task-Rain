import { useTasks } from "../../hooks/useTasks";
import { useObjectives } from "../../hooks/useObjectives";
import { incorporateTask } from "../../api/weeklyCommitments";

import TaskInput from "./TaskInput";
import TaskImportanceButton from "../dashboard/TaskImportanceButton";
import TaskObjectiveSelect from "./TaskObjectiveSelect";
import IncorporateTaskButton from "../dashboard/IncorporateTaskButton";

function TasksPage() {
  const {
    tasks,
    isLoading,
    error,
    addTask,
    changeTaskImportance,
    changeTaskObjective,
  } = useTasks();
  const {
    objectives,
    isLoading: isLoadingObjectives,
    error: objectivesError,
  } = useObjectives();

  return (
    <main className="flex flex-1 justify-center py-10">
      <section className="w-full max-w-5xl rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 md:p-8">
        <h2 className="text-3xl font-semibold text-zinc-50">
          Lluvia de tareas
        </h2>

        <p className="mt-3 text-sm text-zinc-400">
          Todo lo que tenés en mente, en un solo lugar.
        </p>
        {isLoadingObjectives && (
          <p role="status" className="mt-4 text-sm text-zinc-400">
            Cargando objetivos disponibles...
          </p>
        )}

        {objectivesError && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            No se pudieron cargar los objetivos. Recargá para volver a intentar.
          </p>
        )}
        {!isLoading && !error && <TaskInput onCreateTask={addTask} />}
        {isLoading ? (
          <p role="status" className="mt-6 text-zinc-400">
            Cargando tareas...
          </p>
        ) : error ? (
          <p role="alert" className="mt-6 text-red-400">
            {error}
          </p>
        ) : tasks.length === 0 ? (
          <p className="mt-6 text-zinc-400">Todavía no agregaste tareas.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="rounded-md border border-zinc-800 bg-zinc-950 p-4"
              >
                <p
                  className={
                    task.completedAt
                      ? "text-zinc-500 line-through"
                      : "text-zinc-100"
                  }
                >
                  {task.title}
                </p>

                <div className="mt-2 flex gap-3 text-xs text-zinc-400">
                  {task.isImportant && <span>Importante</span>}
                  {task.completedAt && <span>Completada</span>}
                </div>
                <TaskImportanceButton
                  taskId={task.id}
                  isImportant={task.isImportant}
                  onChangeImportance={changeTaskImportance}
                />
                {!isLoadingObjectives && !objectivesError && (
                  <TaskObjectiveSelect
                    taskId={task.id}
                    objectiveId={task.objectiveId}
                    objectives={objectives}
                    onChangeObjective={changeTaskObjective}
                  />
                )}
                <IncorporateTaskButton
                  taskId={task.id}
                  onIncorporate={incorporateTask}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default TasksPage;
