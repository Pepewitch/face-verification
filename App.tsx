import React, { useState } from "react";
import styled from "styled-components/native";
import { Text, Platform, StatusBar, TouchableOpacity } from "react-native";
import { FaceDetectCamera } from "./components/FaceDetectCamera";

const StyledView = styled.View`
  padding-top: ${Platform.OS === "ios" ? 0 : StatusBar.currentHeight}px;
  flex: 1;
  background-color: black;
`;

export default () => {
  return (
    <StyledView>
      <FaceDetectCamera />
    </StyledView>
  );
};
