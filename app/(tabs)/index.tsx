import {
  Linking,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
//import * as Permissions from 'expo-permissions';
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Uygulamanın yüklendiğini simüle etmek için bir setTimeout kullanabilirsiniz
    setTimeout(() => setLoading(false), 3000); // 3 saniye sonra yüklemeyi bitir
  }, []);

  const checkPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return newStatus === "granted";
    }
    return true;
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
    });
    if (!response.canceled && response.assets && response.assets.length > 0) {
      setImage(response.assets[0].uri);
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
    });
    if (!response.canceled && response.assets && response.assets.length > 0) {
      setImage(response.assets[0].uri);
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
      <Image style={styles.imageStyle} source={{ uri: image || "" }} />
      <Text>{`Nesne:`}</Text>
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
