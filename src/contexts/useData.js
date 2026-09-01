import { useContext } from "react";
import { DataContext } from "./dataContextObj";

export const useData = () => useContext(DataContext);
