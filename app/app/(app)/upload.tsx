import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import colors from '../constants/colors';
import { useDocuments } from '../hooks/useDocuments';
import { useTranslation } from '../utils/i18n';
import { UploadFile } from '../types/document.types';
import useThemeColors from '../utils/useThemeColors';

export default function Upload() {
  const router = useRouter();
  const { uploadDocument, getProcessingJobStatus } = useDocuments();
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timer | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Set up polling for document status
  useEffect(() => {
    if (uploadedDocId && uploading) {
      // Set up polling to check document status every 3 seconds
      const interval = setInterval(async () => {
        try {
          const job = await getProcessingJobStatus(uploadedDocId);
          console.log('Processing job status:', job.status, 'Progress:', job.progress);
          
          // Update progress
          setProgress(job.progress || 0);
          
          // If job is completed or failed, stop polling and update UI
          if (job.status === 'completed' || job.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
            setUploading(false);
            
            if (job.status === 'completed') {
              Alert.alert(
                t('upload.success'),
                t('upload.successMessage'),
                [
                  {
                    text: t('common.ok'),
                    onPress: () => {
                      // Navigate to history page
                      router.replace('/(app)/history');
                    },
                  },
                ]
              );
            } else {
              Alert.alert(
                t('upload.error'),
                job.errorDetails || t('upload.errorMessage')
              );
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 3000);
      
      setPollingInterval(interval);
      
      // Clean up interval on unmount
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [uploadedDocId, uploading]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('upload.permissionRequired'),
        t('upload.cameraPermission')
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    try {
      setUploading(true);
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(image);
      
      // Create upload file object
      const uploadFile: UploadFile = {
        uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
        name: image.split('/').pop() || 'image.jpg',
        type: 'image/jpeg', // Adjust based on your image type
      };

      // Upload the document
      const result = await uploadDocument(uploadFile);
      console.log('Upload result:', result);
      
      // Set document ID for polling
      setUploadedDocId(result.document._id);
      setProgress(0);
      
      // Do not show success message here - wait for polling to confirm processing is complete
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        t('upload.error'),
        t('upload.errorMessage')
      );
      setUploading(false);
    }
  };

  const renderContent = () => {
    if (uploading) {
      return (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.uploadingText, { color: themeColors.text }]}>
            {t('upload.processing')} ({progress}%)
          </Text>
        </View>
      );
    }

    if (image) {
      return (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton, { backgroundColor: themeColors.surfaceVariant }]}
              onPress={() => setImage(null)}
            >
              <MaterialIcons name="close" size={24} color={themeColors.error} />
              <Text style={[styles.actionButtonText, styles.cancelButtonText, { color: themeColors.error }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.uploadButton, { backgroundColor: themeColors.surfaceVariant }]}
              onPress={handleUpload}
            >
              <MaterialIcons name="check" size={24} color={themeColors.success} />
              <Text style={[styles.actionButtonText, styles.uploadButtonText, { color: themeColors.success }]}>
                {t('upload.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.optionButton, { 
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.primary
          }]}
          onPress={pickImage}
        >
          <View style={[styles.optionIconContainer, { backgroundColor: themeColors.surfaceVariant }]}>
            <MaterialIcons name="photo-library" size={40} color={themeColors.primary} />
          </View>
          <Text style={[styles.optionText, { color: themeColors.text }]}>
            {t('upload.selectImage')}
          </Text>
          <Text style={[styles.optionDescription, { color: themeColors.textSecondary }]}>
            {t('upload.selectImageDescription')}
          </Text>
        </TouchableOpacity>

        <View style={styles.optionDivider} />

        <TouchableOpacity 
          style={[styles.optionButton, { 
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.primary
          }]}
          onPress={takePhoto}
        >
          <View style={[styles.optionIconContainer, { backgroundColor: themeColors.surfaceVariant }]}>
            <MaterialIcons name="camera-alt" size={40} color={themeColors.primary} />
          </View>
          <Text style={[styles.optionText, { color: themeColors.text }]}>
            {t('upload.takePhoto')}
          </Text>
          <Text style={[styles.optionDescription, { color: themeColors.textSecondary }]}>
            {t('upload.takePhotoDescription')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {t('upload.title')}
        </Text>
      </View>

      {renderContent()}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewImage: {
    flex: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  cancelButton: {},
  cancelButtonText: {},
  uploadButton: {},
  uploadButtonText: {},
  optionsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  optionButton: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  optionDivider: {
    height: 24,
  },
}); 