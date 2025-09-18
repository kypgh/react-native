import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import AuthManager from '../services/auth/authManager';
import { authService } from '../services/api/authService';

export const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated, getAccessToken } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${message}`);
  };

  const clearLogs = () => {
    setDebugInfo('');
  };

  const testTokenInfo = async () => {
    setIsLoading(true);
    try {
      const authManager = AuthManager.getInstance();
      const tokenInfo = await authManager.getTokenInfo();
      
      if (tokenInfo) {
        const now = Date.now();
        const timeUntilExpiry = tokenInfo.expiresAt - now;
        const isExpired = timeUntilExpiry <= 0;
        
        addLog(`Token Info:`);
        addLog(`- Has Access Token: ${!!tokenInfo.accessToken}`);
        addLog(`- Has Refresh Token: ${!!tokenInfo.refreshToken}`);
        addLog(`- Expires At: ${new Date(tokenInfo.expiresAt).toLocaleString()}`);
        addLog(`- Time Until Expiry: ${Math.round(timeUntilExpiry / 1000)}s`);
        addLog(`- Is Expired: ${isExpired}`);
      } else {
        addLog('No token info available');
      }
    } catch (error) {
      addLog(`Error getting token info: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRefreshToken = async () => {
    setIsLoading(true);
    try {
      addLog('Testing refresh token...');
      const result = await authService.refreshToken();
      
      addLog(`Refresh Result:`);
      addLog(`- Success: ${result.success}`);
      if (result.success) {
        addLog(`- New token received`);
      } else {
        addLog(`- Error: ${result.error?.message}`);
        addLog(`- Code: ${result.error?.code}`);
      }
    } catch (error) {
      addLog(`Refresh error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiCall = async () => {
    setIsLoading(true);
    try {
      addLog('Testing API call (profile)...');
      const result = await authService.getProfile();
      
      addLog(`API Call Result:`);
      addLog(`- Success: ${result.success}`);
      if (result.success) {
        addLog(`- Profile loaded successfully`);
      } else {
        addLog(`- Error: ${result.error?.message}`);
        addLog(`- Code: ${result.error?.code}`);
      }
    } catch (error) {
      addLog(`API call error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTokens = async () => {
    setIsLoading(true);
    try {
      addLog('Clearing all tokens...');
      const authManager = AuthManager.getInstance();
      await authManager.clearTokens();
      addLog('Tokens cleared successfully');
    } catch (error) {
      addLog(`Error clearing tokens: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debugger</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
        </Text>
        <Text style={styles.statusText}>
          User: {user ? user.email : 'None'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={testTokenInfo}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Check Token Info</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={testRefreshToken}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={testApiCall}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test API Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.dangerButton, isLoading && styles.buttonDisabled]} 
          onPress={clearTokens}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Clear Tokens</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={clearLogs}
        >
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logContainer}>
        <Text style={styles.logText}>{debugInfo || 'No logs yet...'}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  secondaryButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  logContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default AuthDebugger;