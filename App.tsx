import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { Platform, StatusBar } from "react-native";
import { AppLoading } from "expo";
import * as Font from "expo-font";
import { Provider } from "@ant-design/react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { HomeScreen } from "./screens/HomeScreen";
import { VerifyScreen } from "./screens/VerifyScreen";

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

const AppNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    Verify: {
      screen: VerifyScreen
    }
  },
  {
    initialRouteName: "Home",
    headerMode: "none",
    navigationOptions: {
      headerVisible: false
    }
  }
);

const AppContainer = createAppContainer(AppNavigator);

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
        <AppContainer />
      </StyledView>
    </Provider>
  );
};
