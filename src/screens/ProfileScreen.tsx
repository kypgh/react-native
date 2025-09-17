import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ProfileScreenProps } from "../types";
import { Card, Button, FadeInView } from "../components/common";
import { useTheme } from "../theme/ThemeProvider";
import { spacing } from "../theme/spacing";
import { getUserInitials } from "../utils/stringUtils";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";
import { ClientProfile, ProfileUpdateData } from "../types/api";

export default function ProfileScreen({}: ProfileScreenProps) {
  const { theme, setTheme } = useTheme();
  const { colors } = theme;
  const { logout } = useAuth();
  const {
    profile,
    isLoading,
    isUpdating,
    error,
    updateProfile,
    clearError,
    fetchProfile,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<ClientProfile>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize edited data when profile loads
  useEffect(() => {
    if (profile && !isEditing) {
      setEditedData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || "",
      });
    }
  }, [profile, isEditing]);

  // Handle refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    clearError();
    await fetchProfile();
    setIsRefreshing(false);
  };

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
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editedData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!editedData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (editedData.phone && editedData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(editedData.phone.replace(/[\s\-\(\)]/g, ""))) {
        errors.phone = "Please enter a valid phone number";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save changes
  const handleSave = async () => {
    // Validate and save changes
    if (!validateForm()) {
      return;
    }

    const updateData: ProfileUpdateData = {
      firstName: editedData.firstName?.trim(),
      lastName: editedData.lastName?.trim(),
      phone: editedData.phone?.trim() || undefined,
    };

    const success = await updateProfile(updateData);
    if (success) {
      setIsEditing(false);
      setValidationErrors({});
      Alert.alert("Success", "Profile updated successfully!");
    } else {
      Alert.alert(
        "Error",
        error || "Failed to update profile. Please try again."
      );
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    Alert.alert(
      "Cancel Changes",
      "Are you sure you want to cancel? Your changes will be lost.",
      [
        {
          text: "Keep Editing",
          style: "cancel",
        },
        {
          text: "Cancel Changes",
          style: "destructive",
          onPress: () => {
            setIsEditing(false);
            setValidationErrors({});
            // Reset edited data to original profile data
            if (profile) {
              setEditedData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone || "",
              });
            }
          },
        },
      ]
    );
  };

  // Handle start editing
  const handleStartEdit = () => {
    if (profile) {
      setEditedData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || "",
      });
    }
    setValidationErrors({});
    setIsEditing(true);
  };

  // Handle field changes
  const handleFieldChange = (field: keyof ClientProfile, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Show loading state
  if (isLoading && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.status.error }]}>
            {error}
          </Text>
          <Button
            variant="outline"
            onPress={onRefresh}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>
            No profile data available
          </Text>
          <Button
            variant="outline"
            onPress={onRefresh}
            style={styles.retryButton}
          >
            Refresh
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Profile
        </Text>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.status.error }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Profile Info Card */}
        <FadeInView delay={0}>
          <Card
            elevation="medium"
            padding="large"
            variant="default"
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <View
                style={[styles.avatar, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.avatarText, { color: "#FFFFFF" }]}>
                  {getUserInitials(profile.firstName, profile.lastName)}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: colors.text.primary }]}>
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text
                  style={[styles.userEmail, { color: colors.text.secondary }]}
                >
                  {profile.email}
                </Text>
                {profile.phone && (
                  <Text
                    style={[styles.userPhone, { color: colors.text.secondary }]}
                  >
                    {profile.phone}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        </FadeInView>

        {/* Personal Information Card */}
        <FadeInView delay={100}>
          <Card
            elevation="medium"
            padding="large"
            variant="default"
            style={styles.personalInfoCard}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: colors.text.primary }]}
              >
                Personal Information
              </Text>
              {!isEditing ? (
                <TouchableOpacity
                  style={[styles.editButton, { borderColor: colors.primary }]}
                  onPress={handleStartEdit}
                  disabled={isUpdating}
                >
                  <Text style={[styles.editButtonText, { color: colors.primary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.text.muted }]}
                    onPress={handleCancel}
                    disabled={isUpdating}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.text.secondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                    onPress={handleSave}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.formSection}>
              <View style={styles.formField}>
                <Text
                  style={[styles.fieldLabel, { color: colors.text.secondary }]}
                >
                  First Name
                </Text>
                {isEditing ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.fieldInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: validationErrors.firstName
                            ? colors.status.error
                            : colors.text.muted,
                          color: colors.text.primary,
                        },
                      ]}
                      value={editedData.firstName || ""}
                      onChangeText={(value) =>
                        handleFieldChange("firstName", value)
                      }
                      placeholder="Enter first name"
                      placeholderTextColor={colors.text.muted}
                    />
                    {validationErrors.firstName && (
                      <Text
                        style={[
                          styles.fieldError,
                          { color: colors.status.error },
                        ]}
                      >
                        {validationErrors.firstName}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.fieldDisplay,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.fieldValue,
                        { color: colors.text.primary },
                      ]}
                    >
                      {profile.firstName}
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
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.fieldInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: validationErrors.lastName
                            ? colors.status.error
                            : colors.text.muted,
                          color: colors.text.primary,
                        },
                      ]}
                      value={editedData.lastName || ""}
                      onChangeText={(value) =>
                        handleFieldChange("lastName", value)
                      }
                      placeholder="Enter last name"
                      placeholderTextColor={colors.text.muted}
                    />
                    {validationErrors.lastName && (
                      <Text
                        style={[
                          styles.fieldError,
                          { color: colors.status.error },
                        ]}
                      >
                        {validationErrors.lastName}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.fieldDisplay,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.fieldValue,
                        { color: colors.text.primary },
                      ]}
                    >
                      {profile.lastName}
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
                <View
                  style={[
                    styles.fieldDisplay,
                    styles.fieldDisabled,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text
                    style={[styles.fieldValue, { color: colors.text.primary }]}
                  >
                    {profile.email}
                  </Text>
                </View>
                <Text style={[styles.fieldHint, { color: colors.text.muted }]}>
                  Email cannot be changed
                </Text>
              </View>

              <View style={styles.formField}>
                <Text
                  style={[styles.fieldLabel, { color: colors.text.secondary }]}
                >
                  Phone Number
                </Text>
                {isEditing ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.fieldInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: validationErrors.phone
                            ? colors.status.error
                            : colors.text.muted,
                          color: colors.text.primary,
                        },
                      ]}
                      value={editedData.phone || ""}
                      onChangeText={(value) =>
                        handleFieldChange("phone", value)
                      }
                      placeholder="Enter phone number (optional)"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="phone-pad"
                    />
                    {validationErrors.phone && (
                      <Text
                        style={[
                          styles.fieldError,
                          { color: colors.status.error },
                        ]}
                      >
                        {validationErrors.phone}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.fieldDisplay,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.fieldValue,
                        { color: colors.text.primary },
                      ]}
                    >
                      {profile.phone || "Not set"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        </FadeInView>

        {/* Theme Settings Card */}
        <FadeInView delay={200}>
          <Card
            elevation="medium"
            padding="large"
            variant="default"
            style={styles.themeCard}
          >
            <Text
              style={[styles.sectionTitle, { color: colors.text.primary }]}
            >
              Theme Settings
            </Text>

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
                          theme.mode === "dark"
                            ? colors.primary
                            : colors.surface,
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
                      🌚 Dark
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>
        </FadeInView>
      </ScrollView>

      {/* Error Toast */}
      {error && (
        <View
          style={[styles.errorToast, { backgroundColor: colors.status.error }]}
        >
          <Text style={styles.errorToastText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.errorToastClose}>
            <Text style={styles.errorToastCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
  },

  // Card Styles
  profileCard: {
    marginBottom: spacing.md,
  },
  personalInfoCard: {
    marginBottom: spacing.md,
  },
  themeCard: {
    marginBottom: spacing.xl,
  },

  // Profile Header Styles
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: 14,
  },

  // Section Styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  // Edit Button (single)
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 60,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Edit Actions (cancel + save)
  editActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 60,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Form Styles
  formSection: {
    gap: spacing.md,
  },
  formField: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    // Container for input and error
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    minHeight: 44,
  },
  fieldDisplay: {
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  fieldDisabled: {
    opacity: 0.7,
  },
  fieldValue: {
    fontSize: 16,
  },
  fieldError: {
    fontSize: 11,
    marginTop: spacing.xs,
    marginLeft: 2,
  },
  fieldHint: {
    fontSize: 11,
    marginTop: spacing.xs,
    marginLeft: 2,
  },

  // Theme Styles
  themeContent: {
    marginTop: spacing.sm,
  },
  themeOption: {
    marginBottom: 0,
  },
  themeInfo: {
    marginBottom: spacing.lg,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  themeDescription: {
    fontSize: 14,
  },
  themeToggleContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  themeToggleOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  themeToggleActive: {
    // Active state handled by backgroundColor
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Error Toast Styles
  errorToast: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorToastText: {
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
  },
  errorToastClose: {
    marginLeft: spacing.sm,
  },
  errorToastCloseText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});