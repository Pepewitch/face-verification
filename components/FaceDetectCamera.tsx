import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components/native";
import { View, Dimensions, CameraRoll } from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import _ from "lodash";
import { Modal } from "@ant-design/react-native";
import { usePermission } from "../hooks/usePermission";

const { alert } = Modal;

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
  opacity: ${props => (props.disabled ? 0.2 : 1)};
`;

const boundingPad = 4;

const BoundingBox = styled.View`
  position: absolute;
  top: ${props => props.face.bounds.origin.y - boundingPad};
  left: ${props => props.face.bounds.origin.x - boundingPad};
  width: ${props => props.face.bounds.size.width + 2 * boundingPad};
  height: ${props => props.face.bounds.size.height + 2 * boundingPad};
  border: ${props =>
    props.highlight
      ? props.alignment
        ? `2px solid rgba(0, 255, 0, 0.8)`
        : `2px solid rgba(255, 0, 0, 0.8)`
      : `1px solid rgba(0, 0, 255, 0.6)`};
  border-radius: 8px;
`;

const Backdrop = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
`;

const validateFace = face => {
  return (
    _.get(face, "bounds.origin.y") &&
    _.get(face, "bounds.origin.x") &&
    _.get(face, "bounds.size.width") &&
    _.get(face, "bounds.size.height") &&
    _.get(face, "rollAngle") &&
    _.get(face, "yawAngle")
  );
};

const useCamera = () => {
  const dimensions = Dimensions.get("window");
  const imageHeight = Math.round((dimensions.width * 4) / 3);
  const imageWidth = dimensions.width;
  const cameraRef = useRef(null);
  const takePicture = async () => {
    if (cameraRef.current) {
      const camera = cameraRef.current;
      const photo = await camera.takePictureAsync();
      return photo;
    }
    return null;
  };
  return { imageHeight, imageWidth, cameraRef, takePicture };
};

const useFaceDetection = () => {
  const [faces, setFaces] = useState([]);
  const throttledSetFaces = useCallback(_.throttle(setFaces, 50), [setFaces]);
  const onFacesDetected = obj => {
    const { faces } = obj;
    throttledSetFaces(faces.filter(face => validateFace(face)));
  };

  return { faces, onFacesDetected };
};

export const FaceDetectCamera = ({ children, onTakingPhoto }) => {
  const { hasCameraPermission } = usePermission();
  const { imageHeight, imageWidth, cameraRef, takePicture } = useCamera();
  const { faces, onFacesDetected } = useFaceDetection();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  if (!hasCameraPermission) {
    return null;
  }
  const onPress = async () => {
    try {
      setIsTakingPhoto(true);
      const photo = await takePicture();
      if (photo) {
        onTakingPhoto(photo);
      }
      setIsTakingPhoto(false);
    } catch (error) {
      console.error(error);
      alert("Taking photo", "Error occur.", [
        { text: "Close", onPress: () => console.log("ok") }
      ]);
      setIsTakingPhoto(false);
    }
  };
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <View style={{ position: "relative" }}>
        <StyledCamera
          ref={cameraRef}
          width={imageWidth}
          height={imageHeight}
          ratio="4:3"
          pictureSize="1280x720"
          onFacesDetected={onFacesDetected}
          faceDetectorSettings={{
            mode: FaceDetector.Constants.Mode.fast,
            detectLandmarks: FaceDetector.Constants.Landmarks.none,
            runClassifications: FaceDetector.Constants.Classifications.none
          }}
        />
        {faces.map((face, index) => (
          <BoundingBox
            highlight={face === _.maxBy(faces, face => face.bounds.size.width)}
            alignment={
              // Math.abs(face.rollAngle) < 15 && Math.abs(face.yawAngle) < 15
              true
            }
            face={face}
            key={index}
          />
        ))}
        {isTakingPhoto && <Backdrop />}
      </View>
      <StyledTouchableOpacity disabled={isTakingPhoto} onPress={onPress} />
      {children}
    </View>
  );
};
