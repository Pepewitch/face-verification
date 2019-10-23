import React from "react";
import styled from "styled-components/native";
import { ScrollView } from "react-native";

const Container = styled.View`
  flex: 1;
  padding: 24px 8px;
  align-self: stretch;
  align-items: center;
`;

export const ScrollContainer = ({ children, ...rest }) => {
  return (
    <ScrollView {...rest}>
      <Container>{children}</Container>
    </ScrollView>
  );
};
