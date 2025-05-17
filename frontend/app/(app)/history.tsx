import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useDocuments } from '../hooks/useDocuments';
import { Document, ProcessingJob } from '../types/document.types';
import { useTranslation } from '../utils/i18n';
import useThemeColors from '../utils/useThemeColors';

export default function History() {
  const router = useRouter();
  const { documents, fetchDocuments, getProcessingJobStatus, loading, error } = useDocuments();
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timer | null>(null);
  
  // Check if there are any documents in 'processing' state
  const hasProcessingDocuments = documents && documents.some(doc => doc.status === 'processing');

  useEffect(() => {
    // Fetch documents when the component mounts
    fetchDocuments();
    
    // Set up an interval to refresh the documents list every 10 seconds
    const interval = setInterval(() => {
      fetchDocuments();
    }, 10000);
    
    setRefreshInterval(interval);
    
    // Clean up interval on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);
  
  // Poll for status updates of processing documents
  useEffect(() => {
    if (documents && documents.length > 0) {
      // Find all processing documents
      const processingDocs = documents.filter(doc => doc.status === 'processing');
      
      if (processingDocs.length > 0) {
        console.log(`Checking status for ${processingDocs.length} processing documents`);
        
        // Check each processing document
        processingDocs.forEach(async (doc) => {
          try {
            const job = await getProcessingJobStatus(doc._id);
            console.log(`Document ${doc._id} job status: ${job.status}, progress: ${job.progress}`);
            
            // If status changes, refresh the documents list
            if (job.status === 'completed' || job.status === 'failed') {
              fetchDocuments();
            }
          } catch (error) {
            console.error(`Error checking status for document ${doc._id}:`, error);
          }
        });
      }
    }
  }, [documents]);

  const renderHistoryItem = ({ item }: { item: Document }) => (
    <TouchableOpacity 
      style={[styles.historyItem, { 
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.primary
      }]}
      onPress={() => {
        if (item.status === 'completed') {
          router.push(`/(app)/doc-view?id=${item._id}`);
        } else if (item.status === 'failed') {
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
      <View style={[styles.iconContainer, { backgroundColor: themeColors.surfaceVariant }]}>
        <MaterialIcons 
          name="description" 
          size={24} 
          color={themeColors.primary} 
        />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: themeColors.text }]}>{item.originalFileName}</Text>
        <Text style={[styles.itemDate, { color: themeColors.textSecondary }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: item.status === 'completed' 
            ? themeColors.success 
            : item.status === 'failed' 
              ? themeColors.error 
              : themeColors.warning 
          }
        ]} />
        <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>
          {item.status === 'completed' 
            ? t('history.status.completed')
            : item.status === 'failed'
              ? t('history.status.failed')
              : t('history.status.processing')
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          {t('history.loadingDocuments')}
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: themeColors.background }]}>
        <MaterialIcons name="error-outline" size={80} color={themeColors.error} />
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {t('history.errorLoading')}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: themeColors.surfaceVariant }]}
          onPress={() => fetchDocuments()}
        >
          <Text style={[styles.retryButtonText, { color: themeColors.primary }]}>
            {t('common.retry')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>
          {t('history.title')}
        </Text>
      </View>
      
      {documents && documents.length > 0 ? (
        <FlatList
          data={documents}
          renderItem={renderHistoryItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="description" size={80} color={themeColors.disabled} />
          <Text style={[styles.emptyStateText, { color: themeColors.text }]}>
            {t('history.noDocuments')}
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: themeColors.textSecondary }]}>
            {t('history.uploadFirst')}
          </Text>
          <TouchableOpacity 
            style={[styles.uploadButton, { backgroundColor: themeColors.primary }]}
            onPress={() => router.push('/(app)/upload')}
          >
            <Text style={[styles.uploadButtonText, { color: themeColors.white }]}>
              {t('upload.title')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
    height: 60,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
  },
  statusContainer: {
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
  centerContent: {
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
    padding: 24,
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
    marginBottom: 24,
  },
  uploadButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    transform: [{ translateY: -20 }],
  },
}); 