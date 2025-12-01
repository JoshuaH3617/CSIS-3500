import { enableScreens } from 'react-native-screens';
enableScreens(false);
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider } from "./AuthContext";
import Landing from "./screens/Landing";
import CreateAccount from "./screens/CreateAccount";
import Bookings from "./screens/Bookings";
import Profile from "./screens/Profile";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">

          <Stack.Screen
            name="Landing"
            component={Landing}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="CreateAccount"
            component={CreateAccount}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Bookings"
            component={Bookings}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: false }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
