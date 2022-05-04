import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import { Provider } from "react-redux";

import App from "./components";
import store from "./state";

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
  document.getElementById("root")
);
