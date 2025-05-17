import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';
import { Document } from '../types/document.types';
import { useTranslation } from '../utils/i18n';
import useThemeColors from '../utils/useThemeColors';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { documents, fetchDocuments, loading, error } = useDocuments();
  const { t, format } = useTranslation();
  const themeColors = useThemeColors();
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
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={80} color={themeColors.error} />
          <Text style={[styles.errorText, { color: themeColors.error }]}>
            {t('common.error')}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: themeColors.surfaceVariant }]}
            onPress={() => fetchDocuments()}
          >
            <Text style={[styles.retryButtonText, { color: themeColors.primary }]}>
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!documents || documents.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="description" size={80} color={themeColors.disabled} />
          <Text style={[styles.emptyStateText, { color: themeColors.text }]}>
            {t('dashboard.noDocuments')}
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: themeColors.textSecondary }]}>
            {t('dashboard.uploadFirst')}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.documentsContainer}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          {t('dashboard.recentDocuments')}
        </Text>
        {recentDocuments.map((doc) => (
          <TouchableOpacity 
            key={doc._id} 
            style={[styles.documentItem, { 
              backgroundColor: themeColors.surface,
              shadowColor: themeColors.primary
            }]}
            onPress={() => {
              if (doc.status === 'completed') {
                router.push(`/(app)/doc-view?id=${doc._id}`);
              } else if (doc.status === 'failed') {
                Alert.alert(
                  t('common.error'),
                  t('history.status.failed'),
                  [{ text: t('common.ok'), style: 'default' }]
                );
              } else {
                Alert.alert(
                  t('common.loading'),
                  t('history.status.processing'),
                  [{ text: t('common.ok'), style: 'default' }]
                );
              }
            }}
          >
            <View style={[styles.documentIconContainer, { backgroundColor: themeColors.surfaceVariant }]}>
              <MaterialIcons name="description" size={24} color={themeColors.primary} />
            </View>
            <View style={styles.documentInfo}>
              <Text style={[styles.documentTitle, { color: themeColors.text }]} numberOfLines={1}>
                {doc.originalFileName}
              </Text>
              <Text style={[styles.documentDate, { color: themeColors.textSecondary }]}>
                {new Date(doc.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.documentStatus}>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: doc.status === 'completed' 
                  ? themeColors.success 
                  : doc.status === 'failed' 
                    ? themeColors.error 
                    : themeColors.warning 
                }
              ]} />
              <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>
                {doc.status === 'completed' 
                  ? t('history.status.completed')
                  : doc.status === 'failed'
                    ? t('history.status.failed')
                    : t('history.status.processing')
                }
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/(app)/history')}
        >
          <Text style={[styles.viewAllText, { color: themeColors.primary }]}>
            {t('dashboard.viewAll')}
          </Text>
          <MaterialIcons name="arrow-forward" size={16} color={themeColors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          {t('dashboard.title')}
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          {user?.firstName 
            ? format(t('dashboard.welcome'), { name: `, ${user.firstName}` })
            : t('dashboard.welcome')
          }
        </Text>
      </View>
      
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {/* Bottom Navigation Bar */}
      <SafeAreaView style={[styles.bottomNavContainer, { backgroundColor: themeColors.surface }]} edges={['bottom']}>
        <View style={styles.bottomNav}>
          {/* History Button */}
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => router.push('/(app)/history')}
          >
            <MaterialIcons name="history" size={28} color={themeColors.textSecondary} />
            <Text style={[styles.navButtonText, { color: themeColors.textSecondary }]}>
              {t('dashboard.history')}
            </Text>
          </TouchableOpacity>
          
          {/* Upload Button */}
          <View style={styles.uploadButtonContainer}>
            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: themeColors.primary }]}
              onPress={() => router.push('/(app)/upload')}
            >
              <MaterialIcons name="file-upload" size={28} color={themeColors.white} />
            </TouchableOpacity>
          </View>
          
          {/* Profile Button */}
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => router.push('/(app)/profile')}
          >
            <MaterialIcons name="person" size={28} color={themeColors.textSecondary} />
            <Text style={[styles.navButtonText, { color: themeColors.textSecondary }]}>
              {t('dashboard.profile')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 80, // Add padding to account for the bottom nav
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
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
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  documentsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
  },
  documentStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    flex: 1,
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
  uploadButtonContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
