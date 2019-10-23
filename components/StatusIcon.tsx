import React from "react";
import { AntDesign } from "@expo/vector-icons";

export const StatusIcon = ({ examinee }) => {
  switch (examinee.status) {
    case "NOT_CHECKED":
      return (
        <AntDesign
          name="minuscircleo"
          style={{ marginRight: 16 }}
          size={32}
          color="#CCC"
        />
      );
    case "PASS":
      return (
        <AntDesign
          name="checkcircleo"
          style={{ marginRight: 16 }}
          size={32}
          color="green"
        />
      );
    case "NOT_PASS":
      return (
        <AntDesign
          name="closecircleo"
          style={{ marginRight: 16 }}
          size={32}
          color="red"
        />
      );
    default:
      return null;
  }
};
