import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

//holds form imput values.
export default function CreateAccount() {
    const navigation = useNavigation();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    //holds error messages
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    //uupdates formData if any input changes.
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    //submits handler for registration form.
    const handleSubmit = async () => {
        setError("");

        //password confirmation chekc.
        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        //sends post request to /register endpoint
        try {
            const response = await fetch("http://192.168.4.40:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration Failed");
            } else {
                navigation.navigate("Landing");
            }
        } catch {
            setError("Registration Error");
        }
        setLoading(false);
    };

    return (
        <ImageBackground
      source={{ uri: "https://upload.wikimedia.org/wikipedia/en/thumb/0/08/Nova_Library_West.JPG/1200px-Nova_Library_West.JPG" }}
      style={styles.bg}
    >
      <View style={styles.box}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Study Space</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={formData.first_name}
          onChangeText={(t) => handleChange("first_name", t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={formData.last_name}
          onChangeText={(t) => handleChange("last_name", t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={formData.username}
          onChangeText={(t) => handleChange("username", t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(t) => handleChange("email", t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={formData.password}
          onChangeText={(t) => handleChange("password", t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={formData.confirm_password}
          onChangeText={(t) => handleChange("confirm_password", t)}
        />

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>Register</Text>
          </TouchableOpacity>
        )}

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: "center", alignItems: "center" },
  box: { width: "85%", padding: 20, backgroundColor: "white", borderRadius: 12 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center" },
  subtitle: { textAlign: "center", marginBottom: 20, color: "#555" },
  input: { backgroundColor: "#eee", padding: 10, borderRadius: 8, marginBottom: 14 },
  btn: { backgroundColor: "#1e90ff", padding: 12, borderRadius: 8, marginTop: 10 },
  btnText: { color: "white", textAlign: "center", fontWeight: "600" },
  error: { color: "red", marginBottom: 10, textAlign: "center" }
});
