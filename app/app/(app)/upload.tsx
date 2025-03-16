import React, { useState } from 'react';
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

export default function Upload() {
  const router = useRouter();
  const { uploadDocument } = useDocuments();
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
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
      allowsEditing: true,
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
      await uploadDocument(uploadFile);
      
      // Show success message
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
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        t('upload.error'),
        t('upload.errorMessage')
      );
    } finally {
      setUploading(false);
    }
  };

  const renderContent = () => {
    if (uploading) {
      return (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.uploadingText}>{t('upload.processing')}</Text>
        </View>
      );
    }

    if (image) {
      return (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setImage(null)}
            >
              <MaterialIcons name="close" size={24} color={colors.error} />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.uploadButton]}
              onPress={handleUpload}
            >
              <MaterialIcons name="check" size={24} color={colors.success} />
              <Text style={[styles.actionButtonText, styles.uploadButtonText]}>
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
          style={styles.optionButton}
          onPress={pickImage}
        >
          <View style={styles.optionIconContainer}>
            <MaterialIcons name="photo-library" size={40} color={colors.primary} />
          </View>
          <Text style={styles.optionText}>{t('upload.selectImage')}</Text>
          <Text style={styles.optionDescription}>
            {t('upload.selectImageDescription')}
          </Text>
        </TouchableOpacity>

        <View style={styles.optionDivider} />

        <TouchableOpacity 
          style={styles.optionButton}
          onPress={takePhoto}
        >
          <View style={styles.optionIconContainer}>
            <MaterialIcons name="camera-alt" size={40} color={colors.primary} />
          </View>
          <Text style={styles.optionText}>{t('upload.takePhoto')}</Text>
          <Text style={styles.optionDescription}>
            {t('upload.takePhotoDescription')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('upload.title')}</Text>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    height: 60,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
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
    color: colors.text,
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
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
  },
  cancelButtonText: {
    color: colors.error,
  },
  uploadButton: {
    backgroundColor: colors.surfaceVariant,
  },
  uploadButtonText: {
    color: colors.success,
  },
  optionsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  optionButton: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionDivider: {
    height: 24,
  },
}); 