import React, { useState, useEffect, Fragment, useRef, useMemo } from "react";
import { View, Text } from "react-native";
import { FaceDetectCamera } from "../components/FaceDetectCamera";
import { ActivityIndicator } from "@ant-design/react-native";
import { useNavigationParam } from "react-navigation-hooks";
import { usePermission } from "../hooks/usePermission";
import styled from "styled-components/native";
import { List } from "@ant-design/react-native";
import firebase from "firebase";
import { useDocument } from "react-firebase-hooks/firestore";

const Item = List.Item;
const Brief = Item.Brief;
const VerifyCamera = () => {
  const { hasCameraPermission } = usePermission();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  if (!hasCameraPermission) {
    return <Text>Cannot access camera.</Text>;
  }
  return (
    <FaceDetectCamera onTakingPhoto={() => {}}>
      <ActivityIndicator
        size="large"
        toast
        text="Loading..."
        animating={isTakingPhoto}
      />
    </FaceDetectCamera>
  );
};
const StyledList = styled(List)`
  align-self: stretch;
`;
const StyledScrollView = styled.ScrollView`
  padding: 24px 8px;
`;
const ExamineeTitle = styled.Text`
  font-size: 24px;
  margin-top: 8px;
  margin-bottom: 8px;
`;
const ExamineesList = ({ examinees, onSelect }) => {
  return (
    <StyledList>
      {examinees.map((examinee, index) => (
        <Item key={index} arrow="horizontal" onPress={() => onSelect(examinee)}>
          {examinee.name}
          <Brief>{`Permission: ${examinee.facePermission}`}</Brief>
        </Item>
      ))}
    </StyledList>
  );
};

export const VerifyScreen = () => {
  const room = useNavigationParam("room");
  const [snapshot, loading, error] = useDocument(room.examinees);
  const { examinees } = useMemo(() => (snapshot ? snapshot.data() : {}), [
    snapshot
  ]);
  if (error) {
    return <Text>{error.toString()}</Text>;
  }
  return (
    <StyledScrollView>
      <View style={{ flex: 1 }}>
        <ExamineeTitle>Examinees</ExamineeTitle>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          examinees && (
            <ExamineesList
              examinees={examinees}
              onSelect={() => {}}
            />
          )
        )}
        {/* <VerifyCamera /> */}
      </View>
    </StyledScrollView>
  );
};
