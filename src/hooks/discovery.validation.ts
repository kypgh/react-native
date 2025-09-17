/**
 * Validation script for Discovery Hooks
 * This script validates that the discovery hooks are properly implemented
 * and can be imported without errors.
 */

import { useDiscovery } from './useDiscovery';
import { useBrands } from './useBrands';
import { useClasses } from './useClasses';

// Validation function
export function validateDiscoveryHooks(): boolean {
  try {
    // Check if hooks can be imported
    if (typeof useDiscovery !== 'function') {
      console.error('❌ useDiscovery is not a function');
      return false;
    }

    if (typeof useBrands !== 'function') {
      console.error('❌ useBrands is not a function');
      return false;
    }

    if (typeof useClasses !== 'function') {
      console.error('❌ useClasses is not a function');
      return false;
    }

    // Validate hook structure by checking their toString (basic validation)
    const useDiscoveryStr = useDiscovery.toString();
    const useBrandsStr = useBrands.toString();
    const useClassesStr = useClasses.toString();

    // Check if hooks use React hooks (useState, useCallback, etc.)
    const reactHookPatterns = ['useState', 'useCallback', 'useEffect'];
    
    for (const pattern of reactHookPatterns) {
      if (!useDiscoveryStr.includes(pattern)) {
        console.error(`❌ useDiscovery does not use ${pattern}`);
        return false;
      }
      
      if (!useBrandsStr.includes(pattern)) {
        console.error(`❌ useBrands does not use ${pattern}`);
        return false;
      }
      
      if (!useClassesStr.includes(pattern)) {
        console.error(`❌ useClasses does not use ${pattern}`);
        return false;
      }
    }

    // Check if hooks use discoveryService
    if (!useDiscoveryStr.includes('discoveryService')) {
      console.error('❌ useDiscovery does not use discoveryService');
      return false;
    }

    if (!useBrandsStr.includes('discoveryService')) {
      console.error('❌ useBrands does not use discoveryService');
      return false;
    }

    if (!useClassesStr.includes('discoveryService')) {
      console.error('❌ useClasses does not use discoveryService');
      return false;
    }

    console.log('✅ Discovery hooks validation passed');
    return true;
  } catch (error) {
    console.error('❌ Discovery hooks validation failed:', error);
    return false;
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  const isValid = validateDiscoveryHooks();
  process.exit(isValid ? 0 : 1);
}