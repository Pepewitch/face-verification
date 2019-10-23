import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components/native";
import {
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  CameraRoll,
  Image
} from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import _ from "lodash";
import * as ImageManipulator from "expo-image-manipulator";
import { Modal, Button, ActivityIndicator } from "@ant-design/react-native";
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

const boundingPad = 8;

const BoundingBox = styled.View`
  position: absolute;
  top: ${props => props.face.bounds.origin.y - boundingPad};
  left: ${props => props.face.bounds.origin.x - boundingPad};
  width: ${props => props.face.bounds.size.width + 2 * boundingPad};
  height: ${props => props.face.bounds.size.height + 2 * boundingPad};
  border: ${props =>
    props.highlight
      ? props.alignment
        ? `4px solid rgba(0, 255, 0, 0.8)`
        : `4px solid rgba(255, 0, 0, 0.8)`
      : `2px solid rgba(0, 0, 255, 0.6)`};
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
  const detectFace = async imageUri => {
    const options = {
      mode: FaceDetector.Constants.Mode.fast,
      detectLandmarks: FaceDetector.Constants.Landmarks.all,
      runClassifications: FaceDetector.Constants.Classifications.none
    };
    return await FaceDetector.detectFacesAsync(imageUri, options);
  };
  return { faces, onFacesDetected, detectFace };
};

const crop = async (uri, bounds) => {
  const actions = [
    {
      crop: {
        originX: bounds.origin.x,
        originY: bounds.origin.y,
        width: bounds.size.width,
        height: bounds.size.height
      }
    }
  ];
  const saveOptions = {
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true
  };
  return ImageManipulator.manipulateAsync(uri, actions, saveOptions);
};

const resize = async uri => {
  const actions = [
    {
      resize: { width: 1000 }
    }
  ];
  const saveOptions = { format: ImageManipulator.SaveFormat.JPEG };
  return ImageManipulator.manipulateAsync(uri, actions, saveOptions);
};

const save = async uri => {
  return CameraRoll.saveToCameraRoll(uri);
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

export const FaceDetectCamera = ({ children, onTakingPhoto }) => {
  const { hasCameraPermission, hasCameraRollPermission } = usePermission();
  const { imageHeight, imageWidth, cameraRef, takePicture } = useCamera();
  const { faces, onFacesDetected, detectFace } = useFaceDetection();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  if (!hasCameraPermission) {
    return null;
  }
  const onPress = async () => {
    try {
      const photo = await takePicture();
      if (photo) {
        const resized = await resize(photo.uri);
        const { faces } = await detectFace(resized.uri);
        const biggestFace = _.maxBy(faces, face => face.bounds.size.width);
        if (biggestFace) {
          const croppedFace = await crop(resized.uri, biggestFace.bounds);
          const verified = await verify(biggestFace, croppedFace);
          alert(
            "Verify",
            <View>
              <Text style={{ alignSelf: "center" }}>
                Recognition ID: {verified.outputID}
              </Text>
              <Image
                style={{ width: 250, height: 250 }}
                resizeMode="contain"
                source={{ uri: croppedFace.uri }}
              />
            </View>,
            [
              {
                text: "Cancel",
                onPress: () => console.log("cancel"),
                style: "default"
              },
              { text: "OK", onPress: () => console.log("ok") }
            ]
          );
          if (hasCameraRollPermission) {
            await save(croppedFace.uri);
          }
        } else {
          alert("Verify", "Cannot detect face, please try again.", [
            { text: "OK", onPress: () => console.log("ok") }
          ]);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Verify", "Error occur.", [
        { text: "Close", onPress: () => console.log("ok") }
      ]);
    }
  };
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <View style={{ position: "relative" }}>
        <StyledCamera
          ref={cameraRef}
          width={imageWidth}
          height={imageHeight}
          ratio={"4:3"}
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
