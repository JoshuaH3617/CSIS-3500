import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";

function NavBar() {
  const navigation = useNavigation();
  const { fullName, setAuth } = useAuth();
  const displayName =
    fullName && fullName !== "undefined" ? fullName : "Profile";

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setAuth({ username: null, fullName: null, token: null });
    setOpen(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "Landing" }],
    });
  };

  return (
    <View style={styles.navWrapper} pointerEvents="box-none">

      {/* SOLID COLOR NAVBAR */}
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://previews.us-east-1.widencdn.com/preview/39977711/assets/asset-view/0e314e2d-6729-4171-9332-d3a5a48f18b7/thumbnail/eyJ3Ijo0ODAsImgiOjQ4MCwic2NvcGUiOiJhcHAifQ==?sig.ver=1&sig.keyId=us-east-1.20240821&sig.expires=1745445600&sig=xyKTxA4h23Sr-e_c5uRdn2riPEXQNBr_V0E4xMdU9vQ",
          }}
          resizeMode="contain"
          style={styles.logo}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("Bookings")}
          activeOpacity={0.7}
        >
          <View style={styles.bookingsButton}>
            <Text style={styles.bookingsText}>Bookings</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setOpen((o) => !o)}
        >
          <Text style={styles.profileName}>{displayName}</Text>
        </TouchableOpacity>
      </View>

      {open && (
        <View style={styles.dropdownWrapper} pointerEvents="auto">
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setOpen(false);
                navigation.navigate("Profile");
              }}
            >
              <Text style={styles.dropdownText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, styles.dropdownLogout]}
              onPress={handleLogout}
            >
              <Text style={styles.dropdownLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const NAV_COLOR = "#4A90E2"; // nice solid blue

const styles = StyleSheet.create({
  navWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 0,
    left: 0,
    right: 0,
    zIndex: 99999,
  },

  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: NAV_COLOR, // solid color now
  },

  logo: { height: 42, width: 42 },

  bookingsButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  bookingsText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#000",
  },

  profileName: {
    fontWeight: "700",
    fontSize: 17,
    color: "#000",
  },

  dropdownWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 60,
    right: 20,
    zIndex: 999999,
  },

  dropdown: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 10,
    minWidth: 180,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },

  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  dropdownText: { color: "#333", fontWeight: "500", fontSize: 16 },

  dropdownLogout: { borderTopWidth: 1, borderColor: "#e0e0e0" },

  dropdownLogoutText: {
    color: "#e63946",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default NavBar;
