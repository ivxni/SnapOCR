import React, { useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useLanguage, Language, LanguageOption } from '../contexts/LanguageContext';
import { useTranslation } from '../utils/i18n';
import { useDarkMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';

interface LanguageItemProps {
  language: LanguageOption;
  isSelected: boolean;
  onSelect: () => void;
  themeColors: any;
}

const LanguageItem: React.FC<LanguageItemProps> = ({ language, isSelected, onSelect, themeColors }) => (
  <TouchableOpacity 
    style={[
      styles.languageItem, 
      { borderBottomColor: themeColors.border },
      isSelected && [styles.selectedLanguageItem, { backgroundColor: themeColors.surfaceVariant }]
    ]} 
    onPress={onSelect}
    activeOpacity={0.7}
  >
    <View style={styles.languageInfo}>
      <Text style={[styles.languageName, { color: themeColors.text }]}>{language.name}</Text>
      <Text style={[styles.nativeName, { color: themeColors.textSecondary }]}>{language.nativeName}</Text>
    </View>
    {isSelected ? (
      <MaterialIcons name="check-circle" size={24} color={themeColors.primary} />
    ) : (
      <View style={[styles.unselectedCircle, { borderColor: themeColors.border }]} />
    )}
  </TouchableOpacity>
);

export default function LanguageScreen() {
  const router = useRouter();
  const { language: currentLanguage, setLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();

  const handleLanguageSelect = useCallback(async (languageCode: Language) => {
    if (languageCode !== currentLanguage) {
      await setLanguage(languageCode);
    }
  }, [currentLanguage, setLanguage]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('language.title')}</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.descriptionContainer, { 
          backgroundColor: themeColors.surface,
          shadowColor: themeColors.primary
        }]}>
          <Text style={[styles.descriptionText, { color: themeColors.textSecondary }]}>
            {t('language.description')}
          </Text>
        </View>
        
        <View style={[styles.languageList, { 
          backgroundColor: themeColors.surface,
          shadowColor: themeColors.primary
        }]}>
          {languages.map((lang) => (
            <LanguageItem
              key={lang.code}
              language={lang}
              isSelected={currentLanguage === lang.code}
              onSelect={() => handleLanguageSelect(lang.code)}
              themeColors={themeColors}
            />
          ))}
        </View>
        
        <View style={[styles.infoSection, { backgroundColor: themeColors.surfaceVariant }]}>
          <MaterialIcons name="info-outline" size={22} color={themeColors.textSecondary} />
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 60,
    position: 'relative',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  languageList: {
    borderRadius: 12,
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
  },
  selectedLanguageItem: {
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
}); 