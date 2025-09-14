import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { ProfileScreenProps } from "../types";
import { Card, Button, AnimatedCard, FadeInView } from "../components/common";
import { useTheme } from "../theme/ThemeProvider";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { getUserInitials } from "../utils/stringUtils";
import { mockProfileData, ProfileScreenData } from "../data/mockProfileData";


export default function ProfileScreen({}: ProfileScreenProps) {
  const { theme, setTheme } = useTheme();
  const { colors } = theme;
  const [profileData, setProfileData] =
    useState<ProfileScreenData>(mockProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileScreenData["user"]>(
    mockProfileData.user
  );

  // Handle logout functionality
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // In a real app, this would clear auth tokens and navigate to login
          console.log("User logged out");
        },
      },
    ]);
  };

  // Handle edit toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setProfileData((prev) => ({
        ...prev,
        user: editedData,
      }));
      Alert.alert("Success", "Profile updated successfully!");
    } else {
      // Start editing - initialize edited data with current data
      setEditedData(profileData.user);
    }
    setIsEditing(!isEditing);
  };

  // Handle field changes
  const handleFieldChange = (
    field: keyof ProfileScreenData["user"],
    value: string
  ) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <AnimatedCard style={styles.profileCard} delay={0}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: "#FFFFFF" }]}>
                {getUserInitials(
                  profileData.user.firstName,
                  profileData.user.lastName
                )}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.text.primary }]}>
                {profileData.user.firstName} {profileData.user.lastName}
              </Text>
              <Text
                style={[styles.userEmail, { color: colors.text.secondary }]}
              >
                {profileData.user.email}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.logoutButton,
                { backgroundColor: colors.status.error },
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Active Brand Section */}
        <AnimatedCard style={styles.brandCard} delay={100}>
          <View style={styles.brandHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Active Brand
            </Text>
          </View>
          <View style={styles.brandContent}>
            <View style={styles.brandLogo}>
              <Text style={styles.brandLogoText}>
                {profileData.activeBrand.logo}
              </Text>
            </View>
            <View style={styles.brandInfo}>
              <Text style={[styles.brandName, { color: colors.text.primary }]}>
                {profileData.activeBrand.name}
              </Text>
              <Text
                style={[
                  styles.brandDescription,
                  { color: colors.text.secondary },
                ]}
              >
                {profileData.activeBrand.description}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Personal Information Section */}
        <AnimatedCard style={styles.personalInfoCard} delay={200}>
          <View style={styles.personalInfoHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Personal Information
            </Text>
            <Button
              variant="outline"
              size="small"
              onPress={handleEditToggle}
              style={styles.editButton}
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
          </View>

          <View style={styles.formSection}>
            <View style={styles.formField}>
              <Text
                style={[styles.fieldLabel, { color: colors.text.secondary }]}
              >
                First Name
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.fieldInput,
                    styles.fieldInputEditable,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.primary,
                      color: colors.text.primary,
                    },
                  ]}
                  value={editedData.firstName}
                  onChangeText={(value) =>
                    handleFieldChange("firstName", value)
                  }
                  placeholder="Enter first name"
                  placeholderTextColor={colors.text.muted}
                />
              ) : (
                <View
                  style={[
                    styles.fieldInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.text.muted,
                    },
                  ]}
                >
                  <Text
                    style={[styles.fieldValue, { color: colors.text.primary }]}
                  >
                    {profileData.user.firstName}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text
                style={[styles.fieldLabel, { color: colors.text.secondary }]}
              >
                Last Name
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.fieldInput,
                    styles.fieldInputEditable,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.primary,
                      color: colors.text.primary,
                    },
                  ]}
                  value={editedData.lastName}
                  onChangeText={(value) => handleFieldChange("lastName", value)}
                  placeholder="Enter last name"
                  placeholderTextColor={colors.text.muted}
                />
              ) : (
                <View
                  style={[
                    styles.fieldInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.text.muted,
                    },
                  ]}
                >
                  <Text
                    style={[styles.fieldValue, { color: colors.text.primary }]}
                  >
                    {profileData.user.lastName}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text
                style={[styles.fieldLabel, { color: colors.text.secondary }]}
              >
                Email
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.fieldInput,
                    styles.fieldInputEditable,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.primary,
                      color: colors.text.primary,
                    },
                  ]}
                  value={editedData.email}
                  onChangeText={(value) => handleFieldChange("email", value)}
                  placeholder="Enter email"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <View
                  style={[
                    styles.fieldInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.text.muted,
                    },
                  ]}
                >
                  <Text
                    style={[styles.fieldValue, { color: colors.text.primary }]}
                  >
                    {profileData.user.email}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text
                style={[styles.fieldLabel, { color: colors.text.secondary }]}
              >
                Date of Birth
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.fieldInput,
                    styles.fieldInputEditable,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.primary,
                      color: colors.text.primary,
                    },
                  ]}
                  value={editedData.dateOfBirth || ""}
                  onChangeText={(value) =>
                    handleFieldChange("dateOfBirth", value)
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.text.muted}
                />
              ) : (
                <View
                  style={[
                    styles.fieldInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.text.muted,
                    },
                  ]}
                >
                  <Text
                    style={[styles.fieldValue, { color: colors.text.primary }]}
                  >
                    {profileData.user.dateOfBirth || "Not set"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </AnimatedCard>

        {/* Theme Settings Section */}
        <AnimatedCard style={styles.themeCard} delay={300}>
          <View style={styles.themeHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Theme Settings
            </Text>
          </View>

          <View style={styles.themeContent}>
            <View style={styles.themeOption}>
              <View style={styles.themeInfo}>
                <Text
                  style={[styles.themeLabel, { color: colors.text.primary }]}
                >
                  Appearance
                </Text>
                <Text
                  style={[
                    styles.themeDescription,
                    { color: colors.text.secondary },
                  ]}
                >
                  Choose between light and dark theme
                </Text>
              </View>
              <View style={styles.themeToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.themeToggleOption,
                    theme.mode === "light" && styles.themeToggleActive,
                    {
                      backgroundColor:
                        theme.mode === "light"
                          ? colors.primary
                          : colors.surface,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setTheme("light")}
                >
                  <Text
                    style={[
                      styles.themeToggleText,
                      {
                        color:
                          theme.mode === "light"
                            ? "#FFFFFF"
                            : colors.text.primary,
                      },
                    ]}
                  >
                    ☀️ Light
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeToggleOption,
                    theme.mode === "dark" && styles.themeToggleActive,
                    {
                      backgroundColor:
                        theme.mode === "dark" ? colors.primary : colors.surface,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setTheme("dark")}
                >
                  <Text
                    style={[
                      styles.themeToggleText,
                      {
                        color:
                          theme.mode === "dark"
                            ? "#FFFFFF"
                            : colors.text.primary,
                      },
                    ]}
                  >
                    🌙 Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AnimatedCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Profile Card Styles
  profileCard: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h3,
    fontWeight: "600",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  logoutText: {
    ...typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Brand Card Styles
  brandCard: {
    marginBottom: spacing.md,
  },
  brandHeader: {
    marginBottom: spacing.md,
  },
  brandContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  brandLogoText: {
    fontSize: 24,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    ...typography.h3,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  brandDescription: {
    ...typography.body,
    lineHeight: 20,
  },

  // Personal Information Card Styles
  personalInfoCard: {
    marginBottom: spacing.md,
  },
  personalInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: "600",
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Form Styles
  formSection: {
    gap: spacing.md,
  },
  formField: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  fieldValue: {
    ...typography.body,
  },
  fieldInputEditable: {
    borderWidth: 2,
  },

  // Theme Settings Card Styles
  themeCard: {
    marginBottom: spacing.md,
  },
  themeHeader: {
    marginBottom: spacing.lg,
  },
  themeContent: {
    gap: spacing.md,
  },
  themeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  themeInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  themeLabel: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  themeDescription: {
    ...typography.caption,
    lineHeight: 18,
  },
  themeToggleContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  themeToggleOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  themeToggleActive: {
    // Active styles are handled inline with backgroundColor
  },
  themeToggleText: {
    ...typography.caption,
    fontWeight: "600",
    fontSize: 13,
  },
});
