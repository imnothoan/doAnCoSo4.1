import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/src/context/AuthContext";
import { StripeProvider } from "@/src/context/StripeContext";
import { ThemeProvider as AppThemeProvider } from "@/src/context/ThemeContext";
import { LanguageProvider } from "@/src/context/LanguageContext";

export const unstable_settings = {
   initialRouteName: "index",
};

export default function RootLayout() {
   const colorScheme = useColorScheme();

   return (
      <StripeProvider>
         <AuthProvider>
            <LanguageProvider>
               <AppThemeProvider>
                  <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                     <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/signup" options={{ presentation: "card" }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                        {/* Exam Platform Screens */}
                        <Stack.Screen
                           name="exam/create"
                           options={{
                              presentation: "card",
                              title: "Create Exam",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="exam/[id]"
                           options={{
                              presentation: "card",
                              title: "Exam Details",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="exam/edit/[id]"
                           options={{
                              presentation: "card",
                              title: "Edit Exam",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="exam/take/[id]"
                           options={{
                              presentation: "fullScreenModal",
                              headerShown: false,
                           }}
                        />
                        <Stack.Screen
                           name="class/create"
                           options={{
                              presentation: "card",
                              title: "Create Class",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="class/[id]"
                           options={{
                              presentation: "card",
                              title: "Class Details",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="class/students/[id]"
                           options={{
                              presentation: "card",
                              title: "Manage Students",
                              headerBackTitle: "Back",
                           }}
                        />

                        <Stack.Screen
                           name="overview/notification"
                           options={{
                              presentation: "card",
                              title: "Notifications",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="overview/event-detail"
                           options={{
                              presentation: "card",
                              title: "Event Details",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="overview/post"
                           options={{
                              presentation: "card",
                              title: "Create Post",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="overview/community"
                           options={{
                              presentation: "card",
                              headerShown: true,
                              title: 'Community',
                              headerBackTitle: "Back"
                           }}
                        />
                        <Stack.Screen
                           name="overview/create-community"
                           options={{
                              presentation: "card",
                              headerShown: false,
                           }}
                        />
                        <Stack.Screen
                           name="overview/community-chat"
                           options={{
                              presentation: "card",
                              title: "Community Chat",
                           }}
                        />
                        <Stack.Screen
                           name="overview/community-settings"
                           options={{
                              presentation: "card",
                              title: "Community Settings",
                           }}
                        />
                        <Stack.Screen
                           name="inbox/chat"
                           options={{
                              presentation: "card",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="account/profile"
                           options={{
                              presentation: "card",
                              headerBackTitle: "Back"
                           }}
                        />
                        <Stack.Screen
                           name="account/edit-profile"
                           options={{
                              presentation: "card",
                              title: "Edit Profile",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="account/settings"
                           options={{
                              presentation: "card",
                              title: "Settings",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="account/payment-pro"
                           options={{
                              presentation: "card",
                              title: "Pro Features",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="account/followers-list"
                           options={{
                              presentation: "card",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="hangout/hangout-map"
                           options={{
                              presentation: "card",
                              headerTitle: "Online Users",
                              headerBackTitle: "Back",
                           }}
                        />
                        <Stack.Screen
                           name="hangout/liked-users"
                           options={{
                              presentation: "card",
                              headerTitle: "People You Liked",
                              headerBackTitle: "Back",
                           }}
                        />
                     </Stack>
                     <StatusBar style="auto" />
                  </ThemeProvider>
               </AppThemeProvider>
            </LanguageProvider>
         </AuthProvider>
      </StripeProvider>
   );
}
