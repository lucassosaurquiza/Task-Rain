import AppShell from '../components/layout/AppShell'
import Header from '../components/layout/Header'


function App() {
  return<>

    <AppShell>
      <Header />
      <main className="flex flex-1 items-center justify-center py-10">
        <section className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 p-8">
          <p className="text-sm font-medium text-emerald-400">Inicio</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Paneo general de tus tareas
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Esta pantalla va a mostrar cómo venís con tus tareas, tus días
            activos, tus días inactivos y el avance hacia tus objetivos.
          </p>
        </section>
      </main>
    </AppShell>

  </>
}

export default App;