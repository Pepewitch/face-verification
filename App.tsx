import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { Platform, StatusBar, YellowBox, View, StyleSheet } from "react-native";
import { AppLoading } from "expo";
import * as Font from "expo-font";
import { Provider } from "@ant-design/react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { HomeScreen } from "./screens/HomeScreen";
import { VerifyScreen } from "./screens/VerifyScreen";
import { fromRight } from "react-navigation-transitions";
import { RoomScreen } from "./screens/RoomScreen";
import { ExamineeScreen } from "./screens/ExamineeScreen";
YellowBox.ignoreWarnings(["Setting a timer"]);

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

const gestureResponseDistance = { horizontal: 9999, vertical: 25 };

const AppNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    Room: {
      screen: RoomScreen,
      navigationOptions: {
        gestureResponseDistance
      }
    },
    Examinee: {
      screen: ExamineeScreen,
      navigationOptions: {
        gestureResponseDistance
      }
    },
    Verify: {
      screen: VerifyScreen,
      navigationOptions: {
        gestureResponseDistance
      }
    }
  },
  {
    initialRouteName: "Home",
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: true
    },
    navigationOptions: {
      headerVisible: false,
      header: null
    },
    transitionConfig: () => fromRight()
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
