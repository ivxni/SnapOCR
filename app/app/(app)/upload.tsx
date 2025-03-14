import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../constants/colors';
import { useDocuments } from '../hooks/useDocuments';

export default function Upload() {
  const router = useRouter();
  const { uploadDocument } = useDocuments();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      setSelectedFile(result.assets[0]);
    } catch (error) {
      console.error('Error selecting document:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a file to upload.');
      return;
    }

    try {
      setIsUploading(true);
      // Convert DocumentPickerAsset to UploadFile
      const uploadFile = {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType
      };
      await uploadDocument(uploadFile);
      Alert.alert(
        'Upload Successful',
        'Your document has been uploaded successfully.',
        [{ text: 'OK', onPress: () => router.push('/(app)/dashboard') }]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'There was an error uploading your document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Upload Document</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.uploadArea}>
          <TouchableOpacity 
            style={styles.uploadBox}
            onPress={handleSelectDocument}
            disabled={isUploading}
          >
            <MaterialIcons 
              name={selectedFile ? "description" : "cloud-upload"} 
              size={64} 
              color={colors.primary} 
            />
            <Text style={styles.uploadText}>
              {selectedFile ? selectedFile.name : 'Tap to select a document'}
            </Text>
            {selectedFile && selectedFile.size !== undefined && (
              <Text style={styles.fileInfo}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {selectedFile && (
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <MaterialIcons name="file-upload" size={20} color={colors.white} />
                <Text style={styles.uploadButtonText}>Upload Document</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isUploading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
    padding: 24,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  uploadArea: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 32,
  },
  uploadBox: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: 16,
  },
  uploadText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  fileInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
    maxWidth: 300,
  },
  uploadButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 16,
  },
}); 