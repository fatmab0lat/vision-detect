import { Image, StyleSheet, Platform, View, Text, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState, useEffect } from "react";

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Uygulamanın yüklendiğini simüle etmek için bir setTimeout kullanabilirsiniz
    setTimeout(() => setLoading(false), 3000); // 3 saniye sonra yüklemeyi bitir
  }, []);

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
      <Button title="Galeri"></Button>
      <Button title="Kamera"></Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
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
  text: {
    fontSize: 32,
    color: "#424242",
    textAlign: "center",
    fontWeight: "800",
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    color: "red",
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
  text: {
    fontSize: 48,
    color: "#f0fcfc",
    textAlign: "center",
    fontWeight: "800",
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    color: "red",
  },
});
