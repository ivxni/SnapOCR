import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import colors from '../constants/colors';

export default function Dashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to LynxAI</Text>
        
        <View style={styles.emptyState}>
          <MaterialIcons name="description" size={80} color={colors.disabled} />
          <Text style={styles.emptyStateText}>No documents yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Upload your first document to get started
          </Text>
        </View>
      </View>
      
      {/* Bottom Navigation Bar */}
      <SafeAreaView style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          {/* History Button */}
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => router.push('/(app)/history')}
          >
            <MaterialIcons name="history" size={28} color={colors.textSecondary} />
            <Text style={styles.navButtonText}>History</Text>
          </TouchableOpacity>
          
          {/* Upload Button */}
          <View style={styles.uploadButtonContainer}>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => router.push('/(app)/upload')}
            >
              <MaterialIcons name="file-upload" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          {/* Profile Button */}
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => router.push('/(app)/profile')}
          >
            <MaterialIcons name="person" size={28} color={colors.textSecondary} />
            <Text style={styles.navButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    paddingBottom: 80, // Add padding to account for the bottom nav
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    flex: 1,
  },
  navButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  uploadButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    position: 'relative',
    bottom: 15,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
