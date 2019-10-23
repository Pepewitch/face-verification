import React, { useMemo } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import firebase from "../util/firebase";
import styled from "styled-components/native";
import { List } from "@ant-design/react-native";
import moment from "moment";
import { useCollectionOnce } from "react-firebase-hooks/firestore";
import { ScrollContainer } from "../components/ScrollContainer";

const Item = List.Item;
const Brief = Item.Brief;

const Container = styled(View)`
  flex: 1;
`;
const Title = styled(Text)`
  font-size: 32px;
  margin-top: 16px;
  margin-bottom: 16px;
`;

const StyledList = styled(List)`
  align-self: stretch;
`;

const ExamsList = ({ exams }) => {
  const { navigate } = useNavigation();
  return (
    <StyledList>
      {exams.map((exam, index) => (
        <Item
          key={index}
          arrow="horizontal"
          onPress={() => navigate("Room", { exam })}
        >
          {exam.title}
          <Brief>{moment(exam.date.toMillis()).format("DD MMM YYYY")}</Brief>
        </Item>
      ))}
    </StyledList>
  );
};

export const HomeScreen = () => {
  const [snapshot, loading, error] = useCollectionOnce(
    firebase.firestore().collection("exam")
  );
  const exams = useMemo(
    () => snapshot && snapshot.docs.map(doc => doc.data()),
    [snapshot]
  );
  if (error) {
    return (
      <Container>
        <Text>{error.toString()}</Text>
      </Container>
    );
  }
  return (
    <ScrollContainer>
      <Title>RightGuy.</Title>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <ExamsList exams={exams} />
      )}
    </ScrollContainer>
  );
};
