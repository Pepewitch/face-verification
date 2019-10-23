import { useState, useEffect } from "react";
import * as Permissions from "expo-permissions";

export const usePermission = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(null);
  useEffect(() => {
    Permissions.askAsync(Permissions.CAMERA).then(({ status }) => {
      setHasCameraPermission(status === "granted");
    });
    Permissions.askAsync(Permissions.CAMERA_ROLL).then(({ status }) => {
      setHasCameraRollPermission(status === "granted");
    });
  }, []);
  return { hasCameraPermission, hasCameraRollPermission };
};
