import React, { useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useLanguage, Language, LanguageOption } from '../contexts/LanguageContext';
import { useTranslation } from '../utils/i18n';

interface LanguageItemProps {
  language: LanguageOption;
  isSelected: boolean;
  onSelect: () => void;
}

const LanguageItem: React.FC<LanguageItemProps> = ({ language, isSelected, onSelect }) => (
  <TouchableOpacity 
    style={[styles.languageItem, isSelected && styles.selectedLanguageItem]} 
    onPress={onSelect}
    activeOpacity={0.7}
  >
    <View style={styles.languageInfo}>
      <Text style={styles.languageName}>{language.name}</Text>
      <Text style={styles.nativeName}>{language.nativeName}</Text>
    </View>
    {isSelected ? (
      <MaterialIcons name="check-circle" size={24} color={colors.primary} />
    ) : (
      <View style={styles.unselectedCircle} />
    )}
  </TouchableOpacity>
);

export default function LanguageScreen() {
  const router = useRouter();
  const { language: currentLanguage, setLanguage, languages } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageSelect = useCallback(async (languageCode: Language) => {
    if (languageCode !== currentLanguage) {
      await setLanguage(languageCode);
    }
  }, [currentLanguage, setLanguage]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('language.title')}</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {t('language.description')}
          </Text>
        </View>
        
        <View style={styles.languageList}>
          {languages.map((lang) => (
            <LanguageItem
              key={lang.code}
              language={lang}
              isSelected={currentLanguage === lang.code}
              onSelect={() => handleLanguageSelect(lang.code)}
            />
          ))}
        </View>
        
        <View style={styles.infoSection}>
          <MaterialIcons name="info-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {t('language.info')}
          </Text>
        </View>
      </ScrollView>
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
    borderBottomWidth: 0,
    justifyContent: 'center',
    height: 60,
    position: 'relative',
    elevation: 0,
    shadowOpacity: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  descriptionContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  languageList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedLanguageItem: {
    backgroundColor: colors.surfaceVariant,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceVariant,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
  },
}); 