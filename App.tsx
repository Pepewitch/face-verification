import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { Text, Platform, StatusBar, TouchableOpacity } from "react-native";
import { FaceDetectCamera } from "./components/FaceDetectCamera";
import { AppLoading } from "expo";
import * as Font from "expo-font";
import { Provider } from "@ant-design/react-native";

const StyledView = styled.View`
  padding-top: ${Platform.OS === "ios" ? 0 : StatusBar.currentHeight}px;
  flex: 1;
  background-color: black;
`;

const antoutline = require("@ant-design/icons-react-native/fonts/antoutline.ttf");
const antfill = require("@ant-design/icons-react-native/fonts/antfill.ttf");

const loadFont = async () => {
  await Font.loadAsync({
    antoutline,
    antfill
  });
};

export default () => {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    loadFont().then(() => {
      setIsReady(true);
    });
  }, []);
  if (!isReady) return <AppLoading />;
  return (
    <Provider>
      <StyledView>
        <FaceDetectCamera />
      </StyledView>
    </Provider>
  );
};
