import HomeDashboard from "../components/dashboard/HomeDashboard";
import AppShell from "../components/layout/AppShell";
import Header from "../components/layout/Header";

function App() {
  return (
    <>
      <AppShell>
        <Header />
        <HomeDashboard />
      </AppShell>
    </>
  );
}

export default App;
