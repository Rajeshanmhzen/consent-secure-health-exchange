import { Outlet } from "react-router-dom";
import Header from "./components/shared/Header";

function App() {

  return (
    <>
      <Header />
      <div>
      <Outlet />
      </div>
      {/* <Footer /> */}
    </>
  );
}

export default App;
