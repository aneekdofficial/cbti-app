import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Syne_400Regular,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold,
} from '@expo-google-fonts/syne';
import {
  JetBrainsMono_300Light,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen   from './src/screens/HomeScreen';
import VaultScreen  from './src/screens/VaultScreen';
import { C } from './src/utils/theme';

const Stack = createNativeStackNavigator();

function AppNav() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Home"  component={HomeScreen}/>
        <Stack.Screen name="Vault" component={VaultScreen} options={{ animation:'slide_from_right' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [appVisible,    setAppVisible]    = useState(false);
  const appOpacity = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Syne_400Regular, Syne_600SemiBold, Syne_700Bold, Syne_800ExtraBold,
    JetBrainsMono_300Light, JetBrainsMono_400Regular,
    JetBrainsMono_500Medium, JetBrainsMono_700Bold,
  });

  const onSplashDone = useCallback(() => {
    setAppVisible(true);
    Animated.timing(appOpacity, {
      toValue: 1, duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => setSplashVisible(false));
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={s.loading}>
        <StatusBar style="light" backgroundColor={C.dark}/>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={s.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={C.bg}/>

        {appVisible && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: appOpacity }]}>
            <AppNav/>
          </Animated.View>
        )}

        {splashVisible && (
          <View style={StyleSheet.absoluteFill}>
            <SplashScreen onFinish={onSplashDone}/>
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  root:    { flex:1, backgroundColor: C.bg },
  loading: { flex:1, backgroundColor: C.dark },
});
