/**
 * Validation script for DiscoveryService
 * This script validates that the DiscoveryService is properly implemented
 * and can be imported without errors.
 */

import { discoveryService, DiscoveryService } from './discoveryService';
import { BaseService } from '../baseService';

// Validation function
export function validateDiscoveryService(): boolean {
  try {
    // Check if service is instance of DiscoveryService
    if (!(discoveryService instanceof DiscoveryService)) {
      console.error('❌ discoveryService is not an instance of DiscoveryService');
      return false;
    }

    // Check if service extends BaseService
    if (!(discoveryService instanceof BaseService)) {
      console.error('❌ DiscoveryService does not extend BaseService');
      return false;
    }

    // Check if all required methods exist
    const requiredMethods = [
      'getBrands',
      'getBrandDetails',
      'getClasses',
      'getSessions',
      'getSubscriptionPlans',
      'getCreditPlans',
      'searchBrands',
      'searchClasses',
      'getAvailableSessions',
      'getSessionsByDateRange',
      'getClassesByBrand',
      'getSessionsByClass',
    ];

    for (const method of requiredMethods) {
      if (typeof (discoveryService as any)[method] !== 'function') {
        console.error(`❌ Method ${method} is not implemented`);
        return false;
      }
    }

    // Check if buildQueryString method exists (private method)
    if (typeof (discoveryService as any).buildQueryString !== 'function') {
      console.error('❌ Private method buildQueryString is not implemented');
      return false;
    }

    console.log('✅ DiscoveryService validation passed');
    return true;
  } catch (error) {
    console.error('❌ DiscoveryService validation failed:', error);
    return false;
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  const isValid = validateDiscoveryService();
  process.exit(isValid ? 0 : 1);
}