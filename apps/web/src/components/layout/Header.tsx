type AppView = "home" | "tasks" | "objectives";

type NavItem = {
  label: string;
  view: AppView;
};

type HeaderProps = {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
};

const navItems: NavItem[] = [
  {
    label: "Inicio",
    view: "home",
  },
  {
    label: "Tareas",
    view: "tasks",
  },
  {
    label: "Objetivos",
    view: "objectives",
  },
];

function Header({ activeView, onChangeView }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 pb-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
          Task Rain
        </h1>
      </div>

      <nav className="flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = activeView === item.view;

          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onChangeView(item.view)}
              className={
                isActive
                  ? "rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-zinc-950"
                  : "rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-50"
              }
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className="grid size-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-sm font-semibold text-emerald-300"
      >
        L
      </button>
    </header>
  );
}

export default Header;
