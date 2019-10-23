import React, { useMemo } from "react";
import { Text } from "react-native";
import { ActivityIndicator } from "@ant-design/react-native";
import { useNavigationParam, useNavigation } from "react-navigation-hooks";
import styled from "styled-components/native";
import { List } from "@ant-design/react-native";
import { useDocument } from "react-firebase-hooks/firestore";
import { AntDesign } from "@expo/vector-icons";
import { ScrollContainer } from "../components/ScrollContainer";

const Item = List.Item;
const Brief = Item.Brief;

const StyledList = styled(List)`
  align-self: stretch;
`;
const ExamineeTitle = styled.Text`
  font-size: 24px;
  margin-top: 8px;
  margin-bottom: 8px;
  align-self: flex-start;
`;

const ExamineesList = ({ examinees }) => {
  const { navigate } = useNavigation();
  const renderThumb = examinee => {
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
  return (
    <StyledList>
      {examinees.map((examinee, index) => (
        <Item
          key={index}
          arrow="horizontal"
          onPress={() => navigate("Verify", { examinees, from: examinee })}
          thumb={renderThumb(examinee)}
        >
          {examinee.name}
          <Brief>{`Permission: ${examinee.facePermission}`}</Brief>
        </Item>
      ))}
    </StyledList>
  );
};

export const ExamineeScreen = () => {
  const room = useNavigationParam("room");
  const [snapshot, loading, error] = useDocument(room.examinees);
  const { examinees } = useMemo(() => (snapshot ? snapshot.data() : {}), [
    snapshot
  ]);
  if (error) {
    return <Text>{error.toString()}</Text>;
  }
  return (
    <ScrollContainer>
      <ExamineeTitle>Examinees</ExamineeTitle>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        examinees && <ExamineesList examinees={examinees} />
      )}
    </ScrollContainer>
  );
};
