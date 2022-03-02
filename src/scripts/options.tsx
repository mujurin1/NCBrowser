import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter, Link, Route, Routes } from "react-router-dom";
import { store } from "../scripts/app/store";
import { Yomiage } from "./components/options/Yomiage";
import "../styles/options.css";
import { loadAllStorageThunk } from "./features/storageSlice";

// ローカルストレージからオプションをロードする
store.dispatch(loadAllStorageThunk());

const OptionNavBar = () => {
  return (
    <nav>
      <section>
        <div className="navContent">
          <div className="navLinks">
            <Link to="/">全般</Link>
            <Link to="/speech">読み上げ</Link>
          </div>
        </div>
      </section>
    </nav>
  );
};

const OptionComponent = () => {
  return (
    <>
      <OptionNavBar />
      <Routes>
        <Route path="/" element={<>NONE</>} />
        <Route path="/speech" element={<Yomiage />} />
        <Route path="*" element={<span>NOT FOUND</span>} />
      </Routes>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <OptionComponent />
      </HashRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
