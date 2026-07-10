type AppShellProps = {
children: React.ReactNode
}


function AppShell ({children}: AppShellProps){
  return(
    <>
    <div className="min-h-screen bg-zinc-800 text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-5">
        {children}
      </div>
    </div>
    </>
  )
}


export default AppShell