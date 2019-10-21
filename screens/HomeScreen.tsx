import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => navigation.navigate("Verify")}>
        <Text>Home</Text>
      </TouchableOpacity>
    </View>
  );
};
