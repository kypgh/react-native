import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme, spacing } from "../theme";
import { discoveryService } from "../services/api/discoveryService";
import AuthManager from "../services/auth/authManager";
import { Brand } from "../types/api";
import { LoadingOverlay } from "../components/common";

interface BrandSelectionScreenProps {
  onBrandSelected: (brand: Brand) => void;
  onLogout: () => void;
}

export default function BrandSelectionScreen({
  onBrandSelected,
  onLogout,
}: BrandSelectionScreenProps) {
  const { theme } = useTheme();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await discoveryService.getBrands();

      if (response.success) {
        // Handle different possible response structures
        let brandsData: Brand[] = [];

        // Parse response structure based on actual API format
        if (response.data?.data?.brands) {
          brandsData = response.data.data.brands;
        } else if (response.data?.brands) {
          brandsData = response.data.brands;
        }

        setBrands(brandsData);
        console.log(`✅ Loaded ${brandsData.length} brands`);
      } else {
        console.log("❌ API response not successful:", response.error);
        setError(response.error?.message || "Failed to load brands");
      }
    } catch (error: any) {
      console.error("❌ Error loading brands:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadBrands(true);
  };

  const handleBrandSelect = (brand: Brand) => {
    console.log("🏢 Selected brand:", brand.name);
    onBrandSelected(brand);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const authManager = AuthManager.getInstance();
            await authManager.clearTokens();
            onLogout();
          } catch (error) {
            console.error("Logout error:", error);
            onLogout(); // Logout anyway
          }
        },
      },
    ]);
  };

  const renderBrandItem = ({ item }: { item: Brand }) => (
    <TouchableOpacity
      style={styles.brandCard}
      onPress={() => handleBrandSelect(item)}
    >
      {item.logo && (
        <Image source={{ uri: item.logo }} style={styles.brandLogo} />
      )}
      <View style={styles.brandInfo}>
        <Text style={[styles.brandName, { color: theme.colors.text.primary }]}>
          {item.name}
        </Text>
        {item.description && (
          <Text
            style={[
              styles.brandDescription,
              { color: theme.colors.text.secondary },
            ]}
          >
            {item.description}
          </Text>
        )}
        <Text
          style={[styles.brandLocation, { color: theme.colors.text.muted }]}
        >
          {item.address?.city}, {item.address?.state}
        </Text>
      </View>
      <Text style={[styles.selectText, { color: theme.colors.primary }]}>
        Select →
      </Text>
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  if (isLoading) {
    return <LoadingOverlay visible={true} message="Loading brands..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Select Your Gym</Text>
          <Text style={styles.subtitle}>Choose a gym to continue</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text
              style={[styles.errorText, { color: theme.colors.status.error }]}
            >
              {error}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadBrands()}
            >
              <Text style={[styles.retryText, { color: theme.colors.primary }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : brands.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text
              style={[styles.emptyText, { color: theme.colors.text.secondary }]}
            >
              No gyms available
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
              disabled={isRefreshing}
            >
              <Text style={[styles.retryText, { color: theme.colors.primary }]}>
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={brands}
            renderItem={renderBrandItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: 50,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xl,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    headerContent: {
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.8)",
    },

    logoutButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 8,
    },
    logoutText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    listContainer: {
      paddingVertical: spacing.lg,
      gap: spacing.md,
    },
    brandCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    brandLogo: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: spacing.md,
      backgroundColor: theme.colors.background,
    },
    brandInfo: {
      flex: 1,
    },
    brandName: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: spacing.xs,
    },
    brandDescription: {
      fontSize: 14,
      marginBottom: spacing.xs,
    },
    brandLocation: {
      fontSize: 12,
    },
    selectText: {
      fontSize: 16,
      fontWeight: "600",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.lg,
    },
    errorText: {
      fontSize: 16,
      textAlign: "center",
    },
    retryButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
    },
    retryText: {
      fontSize: 16,
      fontWeight: "600",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.lg,
    },
    emptyText: {
      fontSize: 16,
    },
  });
