import { useContext } from "react";
import { AuthContext } from "./authContextObj";

export const useAuth = () => useContext(AuthContext);
