// screens/Landing.js

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../AuthContext";

function Landing({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const { setAuth } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage({
        text: "Username/email and password are required.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const resp = await fetch("http://192.168.4.40:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: username, password }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setMessage({
          text: data.message || "Invalid credentials.",
          type: "error",
        });
      } else {
        setAuth({
          username: data.username,
          fullName: data.fullName,
          token: data.token,
        });

        setMessage({
          text: "Login successful! Redirecting…",
          type: "success",
        });

        setTimeout(() => navigation.replace("Bookings"), 800);
      }
    } catch (e) {
      setMessage({
        text: "Network error. Are you connected to the same Wi-Fi?",
        type: "error",
      });
    }

    setLoading(false);
  };

  return (
    <ImageBackground
      source={{
        uri: "https://upload.wikimedia.org/wikipedia/en/thumb/0/08/Nova_Library_West.JPG/1200px-Nova_Library_West.JPG",
      }}
      style={styles.bg}
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={styles.center}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Study Room Portal</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <TextInput
            placeholder="Username or Email"
            placeholderTextColor="#777"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 12 }} />
          ) : (
            <>
              {/* LOGIN BUTTON */}
              <TouchableOpacity onPress={handleLogin} style={{ width: "100%" }}>
                <LinearGradient colors={["#6db3ff", "#1e90ff"]} style={styles.button}>
                  <Text style={styles.buttonText}>Login</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* CREATE ACCOUNT BUTTON */}
              <TouchableOpacity
                onPress={() => navigation.navigate("CreateAccount")}
                style={{ width: "100%", marginTop: 12 }}
              >
                <LinearGradient
                  colors={["#6db3ff", "#1e90ff"]}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Create Account</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {!!message.text && (
            <Text
              style={[
                styles.message,
                message.type === "success" ? styles.success : styles.error,
              ]}
            >
              {message.text}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    width: "90%",
    maxWidth: 420,
    padding: 30,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    alignItems: "center",
  },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 8, color: "#000" },
  subtitle: { fontSize: 15, marginBottom: 18, color: "#444" },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#fff",
    color: "#000",
  },

  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  message: { marginTop: 16, fontSize: 15, textAlign: "center" },
  success: { color: "green" },
  error: { color: "red" },
});

export default Landing;
