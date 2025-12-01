import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";

//holds form input values.
function CreateAccount({ navigation }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  //holds error messages
  const [error, setError] = useState("");

  //holds success message
  const [success, setSuccess] = useState("");

  //updates formData if any input changes.
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  //submit handler for registration
  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    //password confirmation check.
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://192.168.4.40:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration Failed");
        return;
      }

      //success + redirect
      setSuccess("Registration Successful! Redirecting...");
      setTimeout(() => {
        navigation.replace("Landing");
      }, 1000);
    } catch (err) {
      console.error("Registration Error:", err);
      setError("Network error. Make sure you're on the same Wi-Fi.");
    }
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Study Space to manage your bookings
          </Text>

          {!!error && <Text style={styles.error}>{error}</Text>}
          {!!success && <Text style={styles.success}>{success}</Text>}

          <TextInput
            placeholder="First Name"
            placeholderTextColor="#777"
            value={formData.first_name}
            onChangeText={(v) => handleChange("first_name", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#777"
            value={formData.last_name}
            onChangeText={(v) => handleChange("last_name", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Username"
            placeholderTextColor="#777"
            value={formData.username}
            onChangeText={(v) => handleChange("username", v)}
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#777"
            value={formData.email}
            onChangeText={(v) => handleChange("email", v)}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            secureTextEntry
            value={formData.password}
            onChangeText={(v) => handleChange("password", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#777"
            secureTextEntry
            value={formData.confirm_password}
            onChangeText={(v) => handleChange("confirm_password", v)}
            style={[styles.input, { marginBottom: 15 }]}
          />

          {/* REGISTER BUTTON (full gradient hitbox) */}
          <TouchableOpacity onPress={handleSubmit} style={{ width: "100%" }}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Register</Text>
            </View>
          </TouchableOpacity>

          {/* Back to login button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: "100%", marginTop: 10 }}
          >
            <View style={[styles.button, { backgroundColor: "#005fcc" }]}>
              <Text style={styles.buttonText}>Back to Login</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    width: "90%",
    maxWidth: 450,
    padding: 30,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 18,
    textAlign: "center",
    color: "#444",
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    color: "#000",
  },

  error: { color: "red", textAlign: "center", marginBottom: 10 },
  success: { color: "green", textAlign: "center", marginBottom: 10 },

  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#007bff",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CreateAccount;
