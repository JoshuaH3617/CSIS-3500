import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import NavBar from "./NavBar";
import { useAuth } from "../AuthContext";

function Bookings() {
  const { username: currentUser, fullName: currentUserFullName, token } =
    useAuth();

  const timeSlots = useMemo(
    () => [
      "08:00","08:30","09:00","09:30","10:00",
      "10:30","11:00","11:30","12:00","12:30",
      "13:00","13:30","14:00","14:30","15:00",
      "15:30","16:00","16:30","17:00",
    ],
    []
  );

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const dateOptions = useMemo(() => {
    const list = [];
    for (let i = 0; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push({
        value: d.toISOString().split("T")[0],
        label: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      });
    }
    return list;
  }, []);

  const getFirstFutureSlot = (date) => {
    const now = new Date();
    for (const slot of timeSlots) {
      if (new Date(`${date}T${slot}:00`) > now) return slot;
    }
    return timeSlots[0];
  };

  const [bookingDate, setBookingDate] = useState(minDate);
  const [selectedTime, setSelectedTime] = useState(getFirstFutureSlot(minDate));
  const [selectedFloor, setSelectedFloor] = useState("2");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingName, setBookingName] = useState("");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    setSelectedRoom(null);

    try {
      const resp = await fetch(
        `http://192.168.4.40:5000/rooms?floor=${selectedFloor}&time=${selectedTime}&date=${bookingDate}`
      );
      const data = await resp.json();
      setAvailableRooms(resp.ok ? data.rooms : []);
    } catch (err) {
      setAvailableRooms([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedFloor, selectedTime, bookingDate]);

  const handleBookingSubmit = async () => {
    if (!selectedRoom) return;

    const effectiveName =
      currentUserFullName && currentUserFullName !== "undefined"
        ? currentUserFullName
        : bookingName;

    const payload = {
      room: selectedRoom.room,
      floor: selectedFloor,
      bookingTime: selectedTime,
      bookingDate,
      userName: currentUser,
      fullName: effectiveName,
    };

    setSubmitting(true);

    try {
      const resp = await fetch("http://192.168.4.40:5000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        setBookingConfirmation(
          `Booking Successful!\nName: ${effectiveName}\nDate: ${bookingDate}\nTime: ${selectedTime}\nRoom: ${selectedRoom.room}`
        );
        fetchRooms();
      }
    } catch {}

    setSubmitting(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <NavBar />

      <ImageBackground
        source={{
          uri: "https://bpb-us-e1.wpmucdn.com/sites.nova.edu/dist/c/2/files/2016/01/DSC_00371.jpg",
        }}
        style={[styles.bg, styles.iosFix]}
      >
        {/* 🔹 NO overlay blocking touches */}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Study Room Bookings</Text>

          {/* CONTROLS */}
          <View style={styles.controlsContainer}>
            {/* Floors */}
            <View style={styles.controlSection}>
              <Text style={styles.controlLabel}>Floor</Text>
              <View style={styles.rowWrap}>
                {["2", "3", "4"].map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setSelectedFloor(f)}
                    style={[
                      styles.chip,
                      selectedFloor === f && styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedFloor === f && styles.chipTextSelected,
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time */}
            <View style={styles.controlSection}>
              <Text style={styles.controlLabel}>Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.rowWrap}>
                  {timeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => setSelectedTime(slot)}
                      style={[
                        styles.chip,
                        selectedTime === slot && styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedTime === slot && styles.chipTextSelected,
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Date */}
            <View style={styles.controlSection}>
              <Text style={styles.controlLabel}>Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.rowWrap}>
                  {dateOptions.map((d) => (
                    <TouchableOpacity
                      key={d.value}
                      onPress={() => setBookingDate(d.value)}
                      style={[
                        styles.chip,
                        bookingDate === d.value && styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          bookingDate === d.value && styles.chipTextSelected,
                        ]}
                      >
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* ROOMS */}
          <Text style={styles.sectionHeader}>Available Rooms</Text>

          {loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.roomsGrid}>
              {availableRooms.map((r) => (
                <TouchableOpacity
                  key={r.room}
                  style={styles.roomCard}
                  onPress={() => setSelectedRoom(r)}
                >
                  <Text style={styles.roomTitle}>🦈 {r.room}</Text>
                  <Text style={styles.roomStatus}>Available</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* BOOKING CARD */}
          {selectedRoom && (
            <View style={styles.bookingCard}>
              <Text style={styles.bookingTitle}>Book {selectedRoom.room}</Text>
              <Text style={styles.bookingDetails}>
                Floor {selectedFloor} | {bookingDate} | {selectedTime}
              </Text>

              {currentUser ? (
                <Text style={styles.bookingAs}>
                  Booking as:{" "}
                  <Text style={styles.bold}>{currentUserFullName}</Text>
                </Text>
              ) : (
                <View>
                  <Text style={styles.label}>Your Name</Text>
                  <TextInput
                    style={styles.inputName}
                    placeholder="Enter your name"
                    value={bookingName}
                    onChangeText={setBookingName}
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleBookingSubmit}
              >
                <Text style={styles.confirmText}>
                  {submitting ? "Processing…" : "Confirm Booking"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!!bookingConfirmation && (
            <Text style={styles.confirmationText}>{bookingConfirmation}</Text>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  iosFix: { paddingTop: Platform.OS === "ios" ? 40 : 0 },

  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
      marginTop: Platform.OS === "ios" ? 80 : 40,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#fff",
    marginBottom: 20,
  },

  controlsContainer: { marginBottom: 24 },
  controlSection: { marginBottom: 16 },
  controlLabel: { color: "#fff", fontSize: 17, fontWeight: "600" },

  rowWrap: { flexDirection: "row", flexWrap: "wrap" },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(233,243,255,0.9)",
    borderWidth: 1,
    borderColor: "#88b5ff",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#0077be",
    borderColor: "#0077be",
  },
  chipText: { color: "#003f5c", fontWeight: "500" },
  chipTextSelected: { color: "#fff" },

  sectionHeader: {
    fontSize: 22,
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    marginTop: 10,
  },

  roomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 12,
  },

  roomCard: {
    width: 140,
    margin: 8,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#0077be",
    alignItems: "center",
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  roomStatus: {
    marginTop: 6,
    fontWeight: "500",
    color: "#b3f5ff",
    fontSize: 15,
  },

  bookingCard: {
    marginTop: 30,
    padding: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#0077be",
    backgroundColor: "#fff",
  },
  bookingTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  bookingDetails: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 16,
  },
  bookingAs: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 17,
  },
  bold: { fontWeight: "700" },

  label: { fontSize: 16, marginBottom: 6 },
  inputName: {
    width: "100%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  confirmButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#0077be",
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontWeight: "700", fontSize: 17 },

  confirmationText: {
    color: "green",
    fontSize: 17,
    textAlign: "center",
    marginTop: 20,
  },
});

export default Bookings;
