const objectiveContent = [
  {
    title: "Objetivos anuales",
    description:
      "Las metas principales que querés alcanzar durante el año.",
  },
  {
    title: "Tareas relacionadas",
    description:
      "Las tareas importantes y diarias que contribuyen a cada objetivo.",
  },
  {
    title: "Progreso",
    description:
      "El porcentaje de avance calculado a partir de las tareas completadas.",
  },
];

function ObjectivesPage() {
  return (
    <main className="flex flex-1 items-center justify-center py-10">
      <section className="w-full max-w-5xl rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 md:p-8">
        <div>
          <p className="text-sm font-medium text-emerald-400">Objetivos</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            Definí tus objetivos anuales
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Tus objetivos representan las metas que querés alcanzar. Las tareas
            que realices durante el año van a alimentar su porcentaje de
            progreso.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {objectiveContent.map((item, index) => (
            <article
              key={item.title}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"
            >
              <span className="grid size-8 place-items-center rounded-full bg-emerald-400/10 text-sm font-semibold text-emerald-300">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-100">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-center">
          <p className="text-sm font-semibold text-zinc-200">
            Próximo paso: registrar el primer objetivo
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            En el siguiente sprint esta sección permitirá crear objetivos,
            relacionarlos con tareas y calcular su avance automáticamente.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ObjectivesPage;
