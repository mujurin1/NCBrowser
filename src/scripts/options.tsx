import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter, Link, Route, Routes } from "react-router-dom";
import { store } from "../scripts/app/store";
import { General } from "./components/options/General";
import { Yomiage } from "./components/options/Yomiage";
import { updateOptions } from "./features/ncbOptionsSlice";
import "../styles/options.css";

// ローカルストレージからオプションをロードする
store.dispatch(updateOptions());

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
        <Route path="/" element={<General />} />
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
