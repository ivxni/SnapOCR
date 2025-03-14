import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';
import { Document } from '../types/document.types';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { documents, fetchDocuments, loading, error } = useDocuments();
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // Fetch documents when the component mounts
    fetchDocuments();
  }, []);

  useEffect(() => {
    // Get the 3 most recent documents
    if (documents && documents.length > 0) {
      const sorted = [...documents].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentDocuments(sorted.slice(0, 3));
    }
  }, [documents]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={80} color={colors.error} />
          <Text style={styles.errorText}>Error loading documents</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchDocuments()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!documents || documents.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="description" size={80} color={colors.disabled} />
          <Text style={styles.emptyStateText}>No documents yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Upload your first document to get started
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.documentsContainer}>
        <Text style={styles.sectionTitle}>Recent Documents</Text>
        {recentDocuments.map((doc) => (
          <TouchableOpacity 
            key={doc._id} 
            style={styles.documentItem}
            onPress={() => console.log('View document', doc._id)}
          >
            <View style={styles.documentIconContainer}>
              <MaterialIcons name="description" size={24} color={colors.primary} />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle} numberOfLines={1}>
                {doc.originalFileName}
              </Text>
              <Text style={styles.documentDate}>
                {new Date(doc.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.documentStatus}>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: doc.status === 'completed' 
                  ? colors.success 
                  : doc.status === 'failed' 
                    ? colors.error 
                    : colors.warning 
                }
              ]} />
              <Text style={styles.statusText}>
                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/(app)/history')}
        >
          <Text style={styles.viewAllText}>View All Documents</Text>
          <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}
        </Text>
        
        {renderContent()}
      </View>
      
      {/* Bottom Navigation Bar */}
      <SafeAreaView style={styles.bottomNavContainer} edges={['bottom']}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 80, // Add padding to account for the bottom nav
  },
  title: {
    fontSize: 32,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.error,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 300,
    alignSelf: 'center',
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
  documentsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  documentStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: 4,
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
