import React, { useMemo } from "react";
import { Text } from "react-native";
import { ActivityIndicator } from "@ant-design/react-native";
import { useNavigationParam, useNavigation } from "react-navigation-hooks";
import styled from "styled-components/native";
import { List } from "@ant-design/react-native";
import { useDocument } from "react-firebase-hooks/firestore";
import { ScrollContainer } from "../components/ScrollContainer";
import { StatusIcon } from "../components/StatusIcon";

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

const ExamineesList = ({ examinees, room }) => {
  const { navigate } = useNavigation();
  return (
    <StyledList>
      {examinees
        .sort((a, b) => (a.seat > b.seat ? 1 : -1))
        .map((examinee, index) => (
          <Item
            key={index}
            arrow="horizontal"
            onPress={() =>
              navigate("Verify", { room, selectedExaminee: examinee })
            }
            thumb={<StatusIcon examinee={examinee} />}
          >
            {`${examinee.seat}. ${examinee.name}`}
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
        examinees && <ExamineesList examinees={examinees} room={room} />
      )}
    </ScrollContainer>
  );
};
