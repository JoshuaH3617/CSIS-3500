import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./AuthContext";

import Landing from "./screens/Landing";
import CreateAccount from "./screens/CreateAccount";
import Bookings from "./screens/Bookings";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={Landing} />
          <Stack.Screen name="CreateAccount" component={CreateAccount} />
          <Stack.Screen name="Bookings" component={Bookings} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
