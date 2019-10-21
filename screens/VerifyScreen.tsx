import React, { useState } from "react";
import { View } from "react-native";
import { FaceDetectCamera } from "../components/FaceDetectCamera";
import { ActivityIndicator } from "@ant-design/react-native";

export const VerifyScreen = () => {
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  return (
    <View>
      <FaceDetectCamera onTakingPhoto={() => {}}>
        <ActivityIndicator
          size="large"
          toast
          text="Loading..."
          animating={isTakingPhoto}
        />
      </FaceDetectCamera>
    </View>
  );
};
