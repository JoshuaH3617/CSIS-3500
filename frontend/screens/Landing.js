import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ImageBackground, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from "../AuthContext";

export default function Landing() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigation = useNavigation();

    const { setAuth } = useContext(AuthContext);

    //handles login API call.
    const handleLogin = async () => {
        if (!username || !password) {
            setMessage('Username/email and password are required.');
            return;
        }
        setLoading(true);
        setMessage("");

        try {
            //post to login endpoint.
            const resp = await fetch('http://192.168.4.40:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail: username, password })
            });

            const data = await resp.json();

            if (!resp.ok) {
                setMessage(data.message || 'Invalid credentials.');
            } else {
                //store token + username + full name
                setAuth({
                    username: data.username,
                    fullName: data.fullName,
                    token: data.token
                });

                navigation.navigate("Bookings");
            }
        } catch {
            setMessage('Error logging in. Try again.');
        }

        setLoading(false);
    }

    return (
    <ImageBackground
      source={{ uri: "https://upload.wikimedia.org/wikipedia/en/thumb/0/08/Nova_Library_West.JPG/1200px-Nova_Library_West.JPG" }}
      style={styles.bg}
    >
      <View style={styles.box}>
        <Text style={styles.title}>Study Room Portal</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Username or Email"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <TouchableOpacity style={styles.btn} onPress={handleLogin}>
              <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.navigate("CreateAccount")}
            >
              <Text style={styles.btnText}>Create Account</Text>
            </TouchableOpacity>
          </>
        )}

        {message ? <Text style={styles.error}>{message}</Text> : null}
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
  btn: { backgroundColor: "#1e90ff", padding: 12, borderRadius: 8, marginBottom: 10 },
  btnText: { color: "white", textAlign: "center", fontWeight: "600" },
  error: { color: "red", marginTop: 10, textAlign: "center" }
});
