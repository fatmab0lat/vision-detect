
import {Linking,TouchableOpacity,Alert,Image,StyleSheet,Platform,View,Text,Button} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import ImageResizer from 'react-native-image-resizer';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { asyncStorageIO, bundleResourceIO } from "@tensorflow/tfjs-react-native";
import * as FileSystem from 'expo-file-system';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  //const [image, setImage] = useState<string| null>(null);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<tf.GraphModel  | tf.LayersModel | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [image, setImage] = useState<{ assets: ImagePicker.ImagePickerAsset[] } | null>(null);

  // useEffect(() => {
  //   tf.ready().then(async () => {
  //     setLoading(false);
  //   });
  // })

  useEffect(() => {
    tf.ready().then(async () => {
      setLoading(false);
    }).catch(error => console.error("Error initializing TensorFlow:", error));
  }, []);
  
  useEffect(() => {
    if (!loading) {
      loadModel()
    }
  }, [loading])

/*   useEffect(() => {
    // Uygulamanın yüklendiğini simüle etmek için bir setTimeout kullanabilirsiniz
    setTimeout(() => setLoading(false), 3000); // 3 saniye sonra yüklemeyi bitir
  }, []); */
  const loadModel = async () => {
    try {
      const modelJson = require("../../assets/model/model.json");
      const modelWeights = require("../../assets/model/group1-shard1of1.bin");
      const modelIo = bundleResourceIO(modelJson, modelWeights)
      const loadedModel = await tf.loadLayersModel(modelIo);
      //console.log(loadedModel);
      setModel(loadedModel);
      console.log("[+] Model Loaded")
      
    } catch (error) {
      console.error('Error loading model:', error); 
    }
    
  };

  const checkPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return newStatus === "granted";
    }
    return true;
  };

  const resizeImage = async (uri: string, width: number, height: number): Promise<string | null> => {
    try {
      const response = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width, height } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      console.log(`${response.height} x ${response.width} img`);
      return response.uri;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const chooseFile = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      Alert.alert(
        "İzin Gerekli!!",
        "Galeriye erişim için izin gerekli! Lütfen uygulama ayarlarından etkinleştiriniz.",
        [
          { text: "İptal", style: "cancel" },
          { text: "Ayarlar", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Optional: allows the user to edit the selected image
      aspect: [4, 3], // Optional: aspect ratio for the edited image
      quality: 1,
    });
  
    if (!response.canceled && response.assets && response.assets.length > 0) {
      const resizedUri = await resizeImage(response.assets[0].uri, 320, 320);
      if (resizedUri) {
        console.log(resizedUri);
        setImage({ assets: [{ uri: resizedUri, width: 0, height: 0 }] });
        // Optionally classify image
        classifyImage(resizedUri);
      }
    } else if (response.canceled) {
      console.log('User cancelled image picker');
    } 
  };

  

  const checkCameraPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      return newStatus === "granted";
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await checkCameraPermissions();
    if (!hasPermission) {
      Alert.alert(
        "İzin Gerekli!",
        "Kameraya erişim izni gerekli! Lütfen uygulama ayarlarından etkinleştiriniz.",
        [
          { text: "İptal", style: "cancel" },
          { text: "Ayarlar", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const response = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Optional: allows the user to edit the selected image
      aspect: [4, 3], // Optional: aspect ratio for the edited image
      quality: 1,
    });
 
    if (!response.canceled && response.assets && response.assets.length > 0) {
      const resizedUri = await resizeImage(response.assets[0].uri, 320, 320);
      if (resizedUri) {
        console.log(resizedUri);
        setImage({ assets: [{ uri: resizedUri, width: 0, height: 0 }] });
        // Optionally classify image
        classifyImage(resizedUri);
      }
    } else if (response.canceled) {
      console.log('User cancelled image picker');
    } 
  };  


  const classifyImage = async (uri: string) => {
    try {
      if (!model) {
        throw new Error("Model is not loaded");
      }
  
      // Resize the image using ImageManipulator
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 32, height: 32 } }],
        { format: ImageManipulator.SaveFormat.JPEG }
      );
  
      const response = await fetch(manipResult.uri);
      const imageData = await response.arrayBuffer();
      const imageTensor = decodeJpeg(new Uint8Array(imageData));
  
      // Normalize the image tensor
      const normalizedImageTensor = imageTensor.div(255.0);
  
      // Expand dimensions to match model input shape [1, 32, 32, 3]
      const inputTensor = normalizedImageTensor.expandDims(0);
  
      // Make predictions using the model
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const predictedIndex = prediction.argMax(-1).dataSync()[0];
      const labels = ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"];
      setPrediction(labels[predictedIndex]);
    } catch (error) {
      console.error("Error classifying image:", error);
    }
  };
  
  if (loading) {
    // Yükleme ekranını göster
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={colorScheme == "light" ? lightStyle.text : darkStyle.text}>
          「 Vision Detect 」
        </Text>
      </View>
    );
  }
    
  return (
    <SafeAreaView
      style={
        colorScheme == "light" ? lightStyle.container : darkStyle.container
      }
    >
      <Text style={colorScheme == "light" ? lightStyle.title : darkStyle.title}>
        「 Vision Detect 」
      </Text>
      {image && <Image style={styles.imageStyle} source={{ uri: image.assets[0].uri }} />}
      {prediction && (
        <Text style={colorScheme === "light" ? lightStyle.text : darkStyle.text}>
          {`${prediction}`}
        </Text>
      )}
      {/* <Image style={styles.imageStyle} source={{ uri: image || "" }} />
      <Text>{`Nesne:`}</Text> */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={
            colorScheme == "light"
              ? lightStyle.buttonLeft
              : darkStyle.buttonLeft
          }
          onPress={chooseFile}
        >
          <Text
            style={
              colorScheme == "light"
                ? lightStyle.buttonLabel
                : darkStyle.buttonLabel
            }
          >
            Galeri
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={colorScheme == "light" ? lightStyle.button : darkStyle.button}
          onPress={openCamera}
        >
          <Text
            style={
              colorScheme == "light"
                ? lightStyle.buttonLabel
                : darkStyle.buttonLabel
            }
          >
            Kamera
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageStyle: {
    height: "70%",
    width: "80%",
    resizeMode: "contain",
    alignSelf: "center",
  },
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
});

const lightStyle = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexGrow: 2,
    backgroundColor: "#f0fcfc",
    gap: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "200",
    paddingTop: 60,
    color: "green",
  },
  text: {
    fontSize: 32,
    color: "#424242",
    textAlign: "center",
    fontWeight: "800",
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    height: "35%",
    backgroundColor: "blue",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 7,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "200",
    color: "black",
  },
  buttonLeft: {
    backgroundColor: "#f0fcfc",
    height: "35%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    borderRadius: 7,
    marginRight: 50,
  },
});

const darkStyle = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexGrow: 2,
    backgroundColor: "#424242",
    gap: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "200",
    paddingTop: 60,
    color: "#fcfcfc",
  },
  text: {
    fontSize: 48,
    color: "white",
    textAlign: "center",
    fontWeight: "200",
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    backgroundColor: "#f0fcfc",
    height: "35%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    borderRadius: 7,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "black",
  },
  buttonLeft: {
    backgroundColor: "#f0fcfc",
    height: "35%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    borderRadius: 7,
    marginRight: 50,
  },
});