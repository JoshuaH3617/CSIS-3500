//holds all imports used in this component.
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image,
TouchableOpacity,} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

//navbar for mobile screens
const NavBar = () => {
  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState("Profile");
  const [open, setOpen] = useState(false);

  //loads fullName from storage (mobile version of localStorage)
  useEffect(() => {
    const loadName = async () => {
      try {
        const fullName = await AsyncStorage.getItem("fullName");
        if (fullName && fullName !== "undefined") {
          setDisplayName(fullName);
        } else {
          setDisplayName("Profile");
        }
      } catch (err) {
        setDisplayName("Profile");
      }
    };
    loadName();
  }, []);

  //logout handling + clearing async storage
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["username", "fullName", "token"]);
    } catch (err) {
      // optional: add error logging
    }
    setOpen(false);
    navigation.navigate("Landing");
  };

  return (
    <View style={styles.navBar}>
      <Image
        source={{
          uri: "https://previews.us-east-1.widencdn.net/preview/39977711/assets/asset-view/0e314e2d-6729-4171-9332-d3a5a48f18b7/thumbnail/eyJ3Ijo0ODAsImgiOjQ4MCwic2NvcGUiOiJhcHAifQ==?sig.ver=1&sig.keyId=us-east-1.20240821&sig.expires=1745445600&sig=xyKTxA4h23Sr-e_c5uRdn2riPEXQNBr_V0E4xMdU9vQ",
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.bookingsButton}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Bookings")}
      >
        <Text style={styles.bookingsButtonText}>Bookings</Text>
      </TouchableOpacity>

      <View style={styles.menuWrapper}>
        <TouchableOpacity onPress={() => setOpen((prev) => !prev)}>
          <Text style={styles.displayName}>{displayName}</Text>
        </TouchableOpacity>

        {open && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              onPress={() => {
                setOpen(false);
                navigation.navigate("Profile");
              }}
              style={styles.dropdownItem}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownItemText}>My Bookings</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.dropdownItem}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#a8c7ff",
    zIndex: 1000,
  },
  logo: {
    height: 42,
    width: 42,
  },
  bookingsButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  bookingsButtonText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#000",
  },
  menuWrapper: {
    position: "relative",
  },
  displayName: {
    fontWeight: "700",
    fontSize: 17,
    color: "#000",
    marginLeft: 24,
  },
  dropdown: {
    position: "absolute",
    top: 32,
    right: 0,
    minWidth: 160,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 4,
    overflow: "hidden",
    zIndex: 10,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 15,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#eee",
  },
  logoutText: {
    color: "#e63946",
    fontWeight: "500",
    fontSize: 15,
  },
});

export default NavBar;
