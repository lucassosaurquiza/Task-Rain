const navItems = ['Inicio', 'Tareas', 'Objetivos']


function Header() {
  return(
    <>
    <header className="flex items-center justify-between border-b border-zinc-500 pb-5">
      <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Task Rain</h1>
      </div>

    <nav>
      {navItems.map((item)=>(
        <button
        key={item}
        type="button"
        className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-50">
          {item}
        </button>
      ))}
    </nav>

    <button type="button"
    className="grid size-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-sm font-semibold text-emerald-300">L</button>
    </header>
    </>
  )
}

export default Header