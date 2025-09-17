import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Brand } from '../types/api';

interface BrandContextType {
  selectedBrand: Brand | null;
  setSelectedBrand: (brand: Brand | null) => void;
  isLoading: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const SELECTED_BRAND_KEY = '@selected_brand';

interface BrandProviderProps {
  children: ReactNode;
}

export const BrandProvider: React.FC<BrandProviderProps> = ({ children }) => {
  const [selectedBrand, setSelectedBrandState] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected brand from storage on app start
  useEffect(() => {
    loadSelectedBrand();
  }, []);

  const loadSelectedBrand = async () => {
    try {
      const storedBrand = await AsyncStorage.getItem(SELECTED_BRAND_KEY);
      if (storedBrand) {
        const brand = JSON.parse(storedBrand);
        setSelectedBrandState(brand);
        console.log('📱 Loaded selected brand from storage:', brand.name);
      }
    } catch (error) {
      console.error('❌ Error loading selected brand:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setSelectedBrand = async (brand: Brand | null) => {
    try {
      if (brand) {
        await AsyncStorage.setItem(SELECTED_BRAND_KEY, JSON.stringify(brand));
        console.log('💾 Saved selected brand to storage:', brand.name);
      } else {
        await AsyncStorage.removeItem(SELECTED_BRAND_KEY);
        console.log('🗑️ Removed selected brand from storage');
      }
      setSelectedBrandState(brand);
    } catch (error) {
      console.error('❌ Error saving selected brand:', error);
      // Still update state even if storage fails
      setSelectedBrandState(brand);
    }
  };

  const value: BrandContextType = {
    selectedBrand,
    setSelectedBrand,
    isLoading,
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

// Helper hook to get brand ID easily
export const useBrandId = (): string | null => {
  const { selectedBrand } = useBrand();
  return selectedBrand?._id || null;
};

export default BrandContext;