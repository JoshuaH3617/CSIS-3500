//holds all imports used in this component.
import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, ActivityIndicator, Modal, TextInput, Platform,} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext"; // gets logged user + token

export default function Bookings() {
  const navigation = useNavigation();

  //gets user info and auth info.
  const { username: currentUser, fullName: currentUserFullName, token } =
    useAuth();

  //all time slots available for booking
  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  //computes date bounds from today to 2 weeks ahead.
  const today = new Date();
  const minDate = today;
  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 14);

  //formats a JS Date into YYYY-MM-DD for backend
  const formatDate = (date) => date.toISOString().split("T")[0];

  //used to compute the first time slot in the future on the selected date
  const getFirstFutureSlot = (date) => {
    const now = new Date();
    for (const slot of timeSlots) {
      const slotTime = new Date(`${formatDate(date)}T${slot}:00`);
      if (slotTime > now) return slot;
    }
    return timeSlots[0];
  };

  const [bookingDate, setBookingDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState(getFirstFutureSlot(today));
  const [selectedFloor, setSelectedFloor] = useState("2");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  //For users without login (backup)
  const [bookingName, setBookingName] = useState("");

  //controls the visibility of date picker modal
  const [showDatePicker, setShowDatePicker] = useState(false);

  //filter out past slots for whenever date is.
  const validTimeSlots = useMemo(() => {
    const now = new Date();
    const isToday = formatDate(bookingDate) === formatDate(new Date());

    return timeSlots.filter((slot) => {
      const slotTime = new Date(`${formatDate(bookingDate)}T${slot}:00`);
      return isToday ? slotTime > now : true;
    });
  }, [bookingDate]);

  //ensure selectedtime stays valid when the timeslot changes.
  useEffect(() => {
    if (!validTimeSlots.includes(selectedTime)) {
      if (validTimeSlots.length > 0) setSelectedTime(validTimeSlots[0]);
    }
  }, [validTimeSlots, selectedTime]);

  // ---- 14 DAY GRID FOR WEB ----
  const get14DayGrid = () => {
    const arr = [];
    const start = new Date(minDate);
    while (start <= maxDateObj) {
      arr.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return arr;
  };

  //fetches available rooms from backend meeting the requirements.
  const fetchRooms = async () => {
    setSelectedRoom(null);
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(
        `http://192.168.4.40:5000/rooms?floor=${selectedFloor}&time=${encodeURIComponent(
          selectedTime
        )}&date=${formatDate(bookingDate)}`
      );
      const data = await resp.json();

      if (resp.ok) {
        setAvailableRooms(data.rooms || []);
      } else {
        setError(data.error || "Error fetching rooms.");
        setAvailableRooms([]);
      }
    } catch {
      setError("Error fetching rooms.");
      setAvailableRooms([]);
    }

    setLoading(false);
  };

  //regets rooms whenever a requirement changes.
  useEffect(() => {
    fetchRooms();
  }, [selectedFloor, selectedTime, bookingDate]);

  //handles booking form submissions.
  const handleBookingSubmit = async () => {
    if (!selectedRoom) return;

    const nameToSend =
      currentUserFullName && currentUserFullName !== "undefined"
        ? currentUserFullName
        : bookingName;

    const payload = {
      room: selectedRoom.room,
      floor: selectedFloor,
      bookingTime: selectedTime,
      bookingDate: formatDate(bookingDate),
      userName: currentUser,
      fullName: nameToSend,
    };

    setSubmitting(true);
    try {
      const resp = await fetch("http://192.168.4.40:5000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (resp.ok) {
        setBookingConfirmation(
          `Booking Successful!\n\nName: ${nameToSend}\nDate: ${formatDate(
            bookingDate
          )}\nTime: ${selectedTime}\nRoom: ${selectedRoom.room}`
        );
        setSelectedRoom(null);
        fetchRooms();
      } else {
        setError(data.error || "Error processing booking.");
      }
    } catch {
      setError("Error processing booking.");
    }
    setSubmitting(false);
  };

  //handles date change for the picker.
  const onDateChange = (event, selected) => {
    if (Platform.OS !== "ios") setShowDatePicker(false);
    if (selected) setBookingDate(selected);
  };

  // --- open + close picker ---
  const openDatePicker = () => setShowDatePicker(true);
  const closeDatePicker = () => setShowDatePicker(false);

  return (
    <ImageBackground
      source={{
        uri: "https://bpb-us-e1.wpmucdn.com/sites.nova.edu/dist/c/2/files/2016/01/DSC_00371.jpg",
      }}
      style={styles.bg}
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inner}>
          <Text style={styles.header}>Study Room Bookings</Text>

          {/* floorselect + timeselect + dateselect group */}
          <View style={styles.controlsRow}>
            {/* floorselect */}
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Floor</Text>
              <View style={styles.floorRow}>
                {["2", "3", "4"].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.floorButton,
                      selectedFloor === f && styles.floorButtonSelected,
                    ]}
                    onPress={() => setSelectedFloor(f)}
                  >
                    <Text style={styles.floorButtonText}>Floor {f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* timeselect */}
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Time</Text>
              <View style={styles.timeGrid}>
                {validTimeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeChip,
                      selectedTime === slot && styles.timeChipSelected,
                    ]}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text style={styles.timeChipText}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* dateselect */}
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Date</Text>

              <TouchableOpacity style={styles.dateBox} onPress={openDatePicker}>
                <Text style={styles.dateText}>📅 {formatDate(bookingDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* MOBILE date picker */}
          {Platform.OS !== "web" && showDatePicker && (
            <DateTimePicker
              value={bookingDate}
              mode="date"
              minimumDate={minDate}
              maximumDate={maxDateObj}
              onChange={onDateChange}
            />
          )}

          {/* WEB 14-DAY GRID MODAL */}
          {Platform.OS === "web" && showDatePicker && (
            <Modal visible={true} transparent={true}>
              <View style={styles.dateModalOverlay}>
                <View style={styles.dateModalBox}>
                  <Text style={styles.dateModalTitle}>Select a date</Text>

                  <View style={styles.grid14}>
                    {get14DayGrid().map((d) => {
                      const isSelected =
                        formatDate(d) === formatDate(bookingDate);
                      return (
                        <TouchableOpacity
                          key={formatDate(d)}
                          style={[
                            styles.gridDay,
                            isSelected && styles.gridDaySelected,
                          ]}
                          onPress={() => {
                            setBookingDate(d);
                            closeDatePicker();
                          }}
                        >
                          <Text
                            style={[
                              styles.gridDayText,
                              isSelected && styles.gridDayTextSelected,
                            ]}
                          >
                            {d.getMonth() + 1}/{d.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.dateModalCloseBtn}
                    onPress={closeDatePicker}
                  >
                    <Text style={styles.dateModalCloseText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          {/* rooms */}
          <Text style={styles.sectionHeader}>Available Rooms</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#29abe2" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : availableRooms.length === 0 ? (
            <Text style={styles.noRooms}>No rooms available.</Text>
          ) : (
            <View style={styles.roomsGrid}>
              {availableRooms.map((room) => (
                <TouchableOpacity
                  key={room.room}
                  style={[
                    styles.roomCard,
                    selectedRoom?.room === room.room &&
                      styles.roomCardSelected,
                  ]}
                  onPress={() => setSelectedRoom(room)}
                >
                  <Text style={styles.roomEmoji}>🦈</Text>
                  <Text style={styles.roomName}>{room.room}</Text>
                  <Text style={styles.roomStatus}>Available</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* confirmmodal */}
          <Modal visible={!!selectedRoom} transparent={true}>
            <View style={styles.modalWrap}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>
                  Book {selectedRoom?.room}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Floor {selectedFloor} • {formatDate(bookingDate)} •{" "}
                  {selectedTime}
                </Text>

                {currentUser ? (
                  <Text style={styles.modalBookedAs}>
                    Booking as{" "}
                    <Text style={{ fontWeight: "700" }}>
                      {currentUserFullName || currentUser}
                    </Text>
                  </Text>
                ) : (
                  <View>
                    <Text>Your Name</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={bookingName}
                      onChangeText={setBookingName}
                      placeholder="Enter your name"
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleBookingSubmit}
                >
                  <Text style={styles.confirmBtnText}>
                    {submitting ? "Processing..." : "Confirm Booking"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setSelectedRoom(null)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {bookingConfirmation && (
            <Text style={styles.confirmText}>{bookingConfirmation}</Text>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// ------------------------- STYLES -------------------------
const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: "center",
  },
  inner: { width: "100%", maxWidth: 1100 },
  header: {
    textAlign: "center",
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 30,
  },

  /* controls */
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 30,
  },
  controlGroup: {
    minWidth: 220,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  controlLabel: { color: "#fff", fontSize: 17, fontWeight: "600" },

  /* floors */
  floorRow: { flexDirection: "row", marginTop: 6 },
  floorButton: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 8,
  },
  floorButtonSelected: { backgroundColor: "#1e90ff" },
  floorButtonText: { color: "#fff", fontWeight: "600" },

  /* time slots */
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  timeChip: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  timeChipSelected: { backgroundColor: "#29abe2" },
  timeChipText: { color: "#fff", fontWeight: "600" },

  /* date */
  dateBox: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  dateText: { fontWeight: "600" },

  /* web date modal */
  dateModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  dateModalBox: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
  },
  dateModalTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  /* 14-day grid */
  grid14: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  gridDay: {
    width: "28%",
    margin: "2%",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  gridDaySelected: { backgroundColor: "#29abe2" },
  gridDayText: { fontWeight: "600", color: "#000" },
  gridDayTextSelected: { color: "#fff" },

  /* rooms */
  sectionHeader: {
    textAlign: "center",
    color: "#fff",
    fontSize: 28,
    marginTop: 20,
    marginBottom: 16,
    fontWeight: "700",
  },
  roomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  roomCard: {
    width: 165,
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#0077be",
    alignItems: "center",
    margin: 10,
  },
  roomCardSelected: {
    transform: [{ scale: 1.05 }],
    backgroundColor: "#0099ff",
  },
  roomEmoji: { fontSize: 30 },
  roomName: { color: "#fff", fontSize: 22, fontWeight: "700" },
  roomStatus: { color: "#b3f5ff", marginTop: 4 },

  /* modals */
  modalWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalBox: {
    width: "85%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 14,
  },
  modalTitle: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  modalSubtitle: {
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
    color: "#333",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  confirmBtn: {
    backgroundColor: "#29abe2",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  confirmBtnText: { color: "#fff", textAlign: "center", fontWeight: "700" },

  cancelBtn: {
    backgroundColor: "#999",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  cancelBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  confirmText: {
    marginTop: 25,
    color: "#28a745",
    textAlign: "center",
    whiteSpace: "pre-line",
    fontWeight: "600",
  },

  noRooms: { textAlign: "center", color: "#fff", fontSize: 18, marginTop: 20 },
  errorText: { textAlign: "center", color: "red", marginTop: 20 },
});
