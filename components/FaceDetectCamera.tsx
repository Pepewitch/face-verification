import React, { useState, useEffect, useCallback } from "react";
import * as Permissions from "expo-permissions";
import styled from "styled-components/native";
import { View, Dimensions, TouchableOpacity, Text } from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import _ from "lodash";

const StyledCamera = styled(Camera)`
  width: ${props => props.width};
  height: ${props => props.height};
`;

const StyledTouchableOpacity = styled.TouchableOpacity`
  width: 64px;
  height: 64px;
  background-color: white;
  border-radius: 32;
  margin-top: 16px;
  border: 8px solid rgba(255, 255, 255, 0.5);
  align-self: center;
`;

const boundingPad = 8;

const BoundingBox = styled.View`
  position: absolute;
  top: ${props => props.face.bounds.origin.y - boundingPad};
  left: ${props => props.face.bounds.origin.x - boundingPad};
  width: ${props => props.face.bounds.size.width + 2 * boundingPad};
  height: ${props => props.face.bounds.size.height + 2 * boundingPad};
  border: 2px solid rgba(255, 0, 0, 0.8);
  border-radius: 8px;
`;

const useCameraPermission = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  useEffect(() => {
    Permissions.askAsync(Permissions.CAMERA).then(({ status }) => {
      setHasCameraPermission(status === "granted");
    });
  }, []);
  return hasCameraPermission;
};

const validateFace = face => {
  return (
    _.get(face, "bounds.origin.y") &&
    _.get(face, "bounds.origin.x") &&
    _.get(face, "bounds.size.width") &&
    _.get(face, "bounds.size.height")
  );
};

export const FaceDetectCamera = () => {
  const hasCameraPermission = useCameraPermission();
  const dimensions = Dimensions.get("window");
  const imageHeight = Math.round((dimensions.width * 4) / 3);
  const imageWidth = dimensions.width;
  const [faces, setFaces] = useState([]);
  const throttledSetFaces = useCallback(_.throttle(setFaces, 50), [setFaces]);
  const onFacesDetected = obj => {
    const { faces } = obj;
    throttledSetFaces(faces.filter(face => validateFace(face)));
  };
  if (!hasCameraPermission) {
    return null;
  }
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <View style={{ position: "relative" }}>
        <StyledCamera
          width={imageWidth}
          height={imageHeight}
          ratio={"4:3"}
          onFacesDetected={onFacesDetected}
          faceDetectorSettings={{
            mode: FaceDetector.Constants.Mode.fast,
            detectLandmarks: FaceDetector.Constants.Landmarks.none,
            runClassifications: FaceDetector.Constants.Classifications.none
          }}
        ></StyledCamera>
        {faces.map((face, index) => (
          <BoundingBox face={face} key={index} />
        ))}
      </View>
      <StyledTouchableOpacity />
    </View>
  );
};
