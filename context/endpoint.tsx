import React, { createContext, useMemo } from "react";
import { useDocument } from "react-firebase-hooks/firestore";
import firebase from "../util/firebase";

const defaultEndpoint = {
  path: "https://rightguy-nauehecpba-an.a.run.app/classify"
};
export const endpointContext = createContext(defaultEndpoint);

export const EndpointProvider = ({ children }) => {
  const [snapshot, loading, error] = useDocument(
    firebase.firestore().doc("config/endpoint")
  );
  const value = useMemo(() => {
    if (snapshot) {
      return (snapshot.data() || defaultEndpoint) as { path: string };
    }
    return defaultEndpoint;
  }, [snapshot]);
  return (
    <endpointContext.Provider value={value}>
      {children}
    </endpointContext.Provider>
  );
};
