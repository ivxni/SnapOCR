import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, Text } from 'react-native';
import { TextInput as PaperInput, HelperText, TextInputProps as PaperTextInputProps } from 'react-native-paper';
import colors from '../../constants/colors';

interface CustomTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  floatingLabel?: boolean;
}

type TextInputProps = CustomTextInputProps & Omit<PaperTextInputProps, 'label' | 'value' | 'onChangeText' | 'error'>;

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  style,
  containerStyle,
  floatingLabel = true,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {!floatingLabel && (
        <Text style={styles.labelText}>{label}</Text>
      )}
      <PaperInput
        label={floatingLabel ? label : ''}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[styles.input, style]}
        error={!!error}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        outlineStyle={styles.outline}
        contentStyle={styles.contentStyle}
        {...props}
      />
      {error ? <HelperText type="error" style={styles.errorText} visible={!!error}>{error}</HelperText> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    backgroundColor: colors.white,
    fontSize: 16,
    height: 56,
  },
  outline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  contentStyle: {
    paddingHorizontal: 4,
    fontWeight: '400',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  }
});

export default TextInput; 