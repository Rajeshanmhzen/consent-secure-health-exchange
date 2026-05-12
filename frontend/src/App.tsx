import { Outlet } from "react-router-dom";
import Header from "./components/shared/Header";

function App() {

  return (
    <>
    <div className='min-h-screen'>
      <Header />
      <div>
      <Outlet />
      </div>
      {/* <Footer /> */}
    </div>
    </>
  );
}

export default App;
