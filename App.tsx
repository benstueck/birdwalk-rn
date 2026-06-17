import "./global.css";
import { LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";

// react-native-css-interop (NativeWind) uses SafeAreaView from react-native internally
LogBox.ignoreLogs(["SafeAreaView has been deprecated", "SafeAreaView is deprecated"]);
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { InvitationCountProvider } from "./src/contexts/InvitationCountContext";
import { OfflineProvider } from "./src/contexts/OfflineContext";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <OfflineProvider>
              <InvitationCountProvider>
                <RootNavigator />
                <StatusBar style="auto" />
              </InvitationCountProvider>
            </OfflineProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
