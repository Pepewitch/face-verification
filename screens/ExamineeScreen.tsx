import React, { useMemo, useState, Fragment } from "react";
import { Text, TouchableOpacity } from "react-native";
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
const ResetButton = styled.TouchableOpacity`
  padding: 8px;
  border-radius: 4px;
  background: #eee;
`

const ExamineesList = ({ examinees, room }) => {
  const { navigate } = useNavigation();
  const [resetting, setResetting] = useState(false);
  const reset = async seat => {
    setResetting(true);
    const currentIndex = examinees.findIndex(e => e.seat === seat);
    examinees[currentIndex].status = "NOT_CHECKED";
    const examineesRef: firebase.firestore.DocumentReference = room.examinees;
    await examineesRef.update({ examinees });
    setResetting(false);
  };
  return (
    <Fragment>
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
              extra={
                examinee.status !== "NOT_CHECKED" && (
                  <ResetButton
                    onPress={() => {
                      reset(examinee.seat);
                    }}
                  >
                    <Text>Reset</Text>
                  </ResetButton>
                )
              }
            >
              {`${examinee.seat}. ${examinee.name}`}
              <Brief>{`Permission: ${examinee.facePermission}`}</Brief>
            </Item>
          ))}
      </StyledList>
      <ActivityIndicator
        size="large"
        toast
        text="Resetting..."
        animating={resetting}
      />
    </Fragment>
  );
};

export const ExamineeScreen = () => {
  const room = useNavigationParam("room");
  const exam = useNavigationParam("exam");
  const [snapshot, loading, error] = useDocument(room.examinees);
  const { examinees } = useMemo(() => (snapshot ? snapshot.data() : {}), [
    snapshot
  ]);
  if (error) {
    return <Text>{error.toString()}</Text>;
  }
  return (
    <ScrollContainer>
      <ExamineeTitle>
        {`${exam.title} - Building ${room.building} (${room.room})`}
      </ExamineeTitle>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        examinees && <ExamineesList examinees={examinees} room={room} />
      )}
    </ScrollContainer>
  );
};
