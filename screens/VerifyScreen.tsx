import React, { useState, useMemo } from "react";
import styled from "styled-components/native";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FaceDetectCamera } from "../components/FaceDetectCamera";
import { ActivityIndicator, Modal } from "@ant-design/react-native";
import { useNavigationParam, useNavigation } from "react-navigation-hooks";
import { usePermission } from "../hooks/usePermission";
import * as FaceDetector from "expo-face-detector";
import * as ImageManipulator from "expo-image-manipulator";
import _ from "lodash";
import { useDocument } from "react-firebase-hooks/firestore";

const { alert } = Modal;

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background: black;
  color: white;
`;

const WhiteText = styled.Text`
  color: white;
`;

const Header = styled.View`
  position: absolute;
  top: 0;
  flex-direction: row;
  padding: 16px 16px 0 16px;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

const SkipButton = styled.TouchableOpacity`
  padding: 8px 16px;
  background-color: #333;
  border-radius: 8px;
`;

const RedBoldText = styled.Text`
  color: red;
  font-weight: bolder;
`;

const NoPermission = () => {
  return <RedBoldText>{`NO PERMISSION`}</RedBoldText>;
};

const detectFace = async imageUri => {
  const options = {
    mode: FaceDetector.Constants.Mode.fast,
    detectLandmarks: FaceDetector.Constants.Landmarks.all,
    runClassifications: FaceDetector.Constants.Classifications.none
  };
  return await FaceDetector.detectFacesAsync(imageUri, options);
};

const crop = async (uri, bounds) => {
  return ImageManipulator.manipulateAsync(
    uri,
    [
      {
        crop: {
          originX: bounds.origin.x,
          originY: bounds.origin.y,
          width: bounds.size.width,
          height: bounds.size.height
        }
      }
    ],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
};

const verify = async (face, croppedFace) => {
  const originX = face["bounds"]["origin"]["x"];
  const originY = face["bounds"]["origin"]["y"];

  const leftEyeX = face["leftEyePosition"]["x"] - originX;
  const leftEyeY = face["leftEyePosition"]["y"] - originY;

  const rightEyeX = face["rightEyePosition"]["x"] - originX;
  const rightEyeY = face["rightEyePosition"]["y"] - originY;

  const noseX = face["noseBasePosition"]["x"] - originX;
  const noseY = face["noseBasePosition"]["y"] - originY;

  const leftMouthX = face["leftMouthPosition"]["x"] - originX;
  const leftMouthY = face["leftMouthPosition"]["y"] - originY;

  const rightMouthX = face["rightMouthPosition"]["x"] - originX;
  const rightMouthY = face["rightMouthPosition"]["y"] - originY;

  const data = {
    faceImg: croppedFace.base64,
    landmarks: [
      [leftEyeX, leftEyeY],
      [rightEyeX, rightEyeY],
      [noseX, noseY],
      [leftMouthX, leftMouthY],
      [rightMouthX, rightMouthY]
    ]
  };

  const output = await fetch(
    "https://rightguy-nauehecpba-an.a.run.app/classify",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  const verified = await output.json();
  return verified;
};

const VerifyOutput = ({ verified, examinee }) => {
  const same = verified.outputID.trim() === examinee.examineeId.trim();
  return (
    <View>
      <Text style={{ alignSelf: "center" }}>
        Recognition ID: {verified.outputID}
      </Text>
      <Text style={{ alignSelf: "center" }}>
        Examinee ID: {examinee.examineeId}
      </Text>
      <Text style={{ alignSelf: "center", color: same ? "green" : "red" }}>
        {same ? "Correct" : "Wrong"}
      </Text>
    </View>
  );
};

const VerifyCamera = ({ examinee, onVerify }) => {
  const { hasCameraPermission } = usePermission();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const onTakingPhoto = async photo => {
    setIsTakingPhoto(true);
    const { faces } = await detectFace(photo.uri);
    const biggestFace = _.maxBy(faces, face => face.bounds.size.width);
    if (biggestFace) {
      const croppedFace = await crop(photo.uri, biggestFace.bounds);
      const verified = await verify(biggestFace, croppedFace);
      alert(
        "Verify",
        <VerifyOutput verified={verified} examinee={examinee} />,
        [
          {
            text: "NOT PASS",
            onPress: () => onVerify("NOT_PASS"),
            style: "default"
          },
          { text: "PASS", onPress: () => onVerify("PASS") }
        ]
      );
    } else {
      alert("Verify", "Cannot detect face, please try again.", [
        { text: "OK", onPress: () => console.log("ok") }
      ]);
    }
    setIsTakingPhoto(false);
  };

  if (!hasCameraPermission) {
    return <Text>Cannot access camera.</Text>;
  }
  return (
    <FaceDetectCamera onTakingPhoto={onTakingPhoto}>
      <ActivityIndicator
        size="large"
        toast
        text="Loading..."
        animating={isTakingPhoto}
      />
    </FaceDetectCamera>
  );
};

export const VerifyScreen = () => {
  const room = useNavigationParam("room");
  const selectedExaminee = useNavigationParam("selectedExaminee");
  const [snapshot, loading, error] = useDocument(room.examinees);
  const { examinees } = useMemo(() => (snapshot ? snapshot.data() : {}), [
    snapshot
  ]);
  const navigation = useNavigation();
  const [verifying, setVerifying] = useState(false);
  const setNext = seat => {
    const next = examinees.find(e => e.seat === seat);
    if (!next) {
      navigation.goBack();
    } else {
      navigation.setParams({
        room,
        selectedExaminee: next
      });
    }
  };
  const onVerify = async status => {
    setVerifying(true);
    const currentIndex = examinees.findIndex(
      e => e.examineeId === selectedExaminee.examineeId
    );
    const currentSeat = examinees[currentIndex].seat;
    examinees[currentIndex].status = status;
    const examineesRef: firebase.firestore.DocumentReference = room.examinees;
    await examineesRef.update({ examinees });
    setNext(currentSeat + 1);
  };
  const skip = () => {
    setNext(selectedExaminee.seat + 1);
  };
  if (error) {
    return <Text>{error.toString()}</Text>;
  }
  if (loading) {
    return (
      <Container>
        <WhiteText>Preparing...</WhiteText>
      </Container>
    );
  }
  return (
    <Container>
      <Header>
        <View>
          <WhiteText>{`${selectedExaminee.seat}. ${selectedExaminee.name}`}</WhiteText>
          <WhiteText>{`${selectedExaminee.examineeId} - ${selectedExaminee.status}`}</WhiteText>
          {!selectedExaminee.facePermission && <NoPermission />}
        </View>
        <SkipButton onPress={skip}>
          <WhiteText>Skip ></WhiteText>
        </SkipButton>
      </Header>
      <VerifyCamera examinee={selectedExaminee} onVerify={onVerify} />
      <ActivityIndicator
        size="large"
        toast
        text="Loading..."
        animating={verifying}
      />
    </Container>
  );
};
