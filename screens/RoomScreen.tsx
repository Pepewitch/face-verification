import React, { useState, useEffect } from "react";
import { Text } from "react-native";
import { ActivityIndicator } from "@ant-design/react-native";
import { useNavigationParam, useNavigation } from "react-navigation-hooks";
import styled from "styled-components/native";
import { List } from "@ant-design/react-native";
import firebase from "firebase";
import { ScrollContainer } from "../components/ScrollContainer";

const Item = List.Item;
const Brief = Item.Brief;
const StyledList = styled(List)`
  align-self: stretch;
`;
const RoomTitle = styled.Text`
  font-size: 24px;
  margin-top: 8px;
  margin-bottom: 8px;
  align-self: flex-start;
`;
const useRooms = roomsRef => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  useEffect(() => {
    setLoading(true);
    Promise.all(
      roomsRef.map((room: firebase.firestore.DocumentReference) => room.get())
    )
      .then(docs => {
        setRooms(
          docs
            .map((doc: any) => doc.data())
            .sort((a, b) =>
              a.building + a.room > b.building + b.room ? 1 : -1
            )
        );
        setLoading(false);
      })
      .catch(e => {
        setError(e);
        setLoading(false);
      });
  }, []);
  return { rooms, loading, error };
};

const RoomsList = ({ rooms, exam }) => {
  const { navigate } = useNavigation();
  return (
    <StyledList>
      {rooms.map((room, index) => (
        <Item
          key={index}
          arrow="horizontal"
          onPress={() => navigate("Examinee", { exam, room })}
        >
          {`Building ${room.building}`}
          <Brief>{room.room}</Brief>
        </Item>
      ))}
    </StyledList>
  );
};

export const RoomScreen = () => {
  const exam = useNavigationParam("exam");
  const { rooms, loading, error } = useRooms(exam.rooms);
  if (error) {
    return <Text>{error.toString()}</Text>;
  }
  return (
    <ScrollContainer>
      <RoomTitle>{exam.title}</RoomTitle>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <RoomsList exam={exam} rooms={rooms} />
      )}
    </ScrollContainer>
  );
};
