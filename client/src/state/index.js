import { createStore } from "redux";
import reducer from "./reducer";

const store = createStore(reducer, ["Use Redux"]);

export default store;
