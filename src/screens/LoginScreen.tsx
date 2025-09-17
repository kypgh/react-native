import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, spacing } from "../theme";
import authService from "../services/api/authService";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(email.trim(), password);

      if (response.success) {
        console.log("✅ Login successful");
        onLoginSuccess();
      } else {
        Alert.alert(
          "Login Failed",
          response.error?.message || "Invalid credentials"
        );
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />

      <LinearGradient
        colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.text.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
    },
    header: {
      alignItems: "center",
      marginBottom: spacing.xxl,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.8)",
    },
    form: {
      gap: spacing.lg,
    },
    inputContainer: {
      gap: spacing.sm,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    input: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 12,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: "#FFFFFF",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    passwordContainer: {
      position: "relative",
    },
    passwordInput: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 12,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      paddingRight: 50, // Make room for the eye icon
      fontSize: 16,
      color: "#FFFFFF",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    eyeButton: {
      position: "absolute",
      right: spacing.md,
      top: "50%",
      transform: [{ translateY: "-50%" }], // Center the icon vertically
      padding: spacing.xs,
    },
    loginButton: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      paddingVertical: spacing.lg,
      alignItems: "center",
      marginTop: spacing.md,
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    loginButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#7C3AED",
    },
  });
