
import { StyleSheet } from 'react-native';

export const colors = {
  // Red, White, Blue cartoonish palette
  primaryBlue: '#1B3B6F',
  blue: '#2C5AA0',
  red: '#E63946',
  softRed: '#FF6B6B',
  white: '#FFFFFF',
  offWhite: '#F7F9FD',
  text: '#1B2A41',
  muted: '#6B7A90',
  outline: '#D7E1F3',
  green: '#2BB673',
  yellow: '#FFD166',
  backdrop: 'rgba(0,0,0,0.2)',
  background: '#F5F8FF',
  card: '#FFFFFF',
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.blue,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.red,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 900,
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Fredoka_700Bold',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Fredoka_500Medium',
    textAlign: 'center',
    color: colors.muted,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Fredoka_400Regular',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.outline,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    width: '100%',
    boxShadow: '0px 6px 0px ' + colors.outline,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.blue,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Fredoka_500Medium',
    color: colors.muted,
  },
  value: {
    fontSize: 28,
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
  },
});
