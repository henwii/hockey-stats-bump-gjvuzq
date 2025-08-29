
import { View, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import Button from '../components/Button';
import { commonStyles, buttonStyles, colors } from '../styles/commonStyles';

export default function MainScreen() {
  useEffect(() => {
    console.log('Home mounted');
  }, []);

  return (
    <View style={commonStyles.container}>
      <View style={[commonStyles.content, { gap: 12 }]}>
        <Image
          source={require('../assets/images/final_quest_240x240.png')}
          style={{ width: 160, height: 160, borderRadius: 36, borderWidth: 3, borderColor: colors.white }}
          resizeMode="contain"
        />
        <Text style={commonStyles.title}>Rink Rumble Stats</Text>
        <Text style={commonStyles.subtitle}>Big bumpy buttons. Simple tracking.</Text>

        <View style={{ width: '100%', maxWidth: 500 }}>
          <Button
            text="Start New Game"
            onPress={() => router.push('/game')}
            accessibilityLabel="Start a new game"
          />
          <Button
            text="View History"
            onPress={() => router.push('/history')}
            style={{ backgroundColor: colors.red }}
            accessibilityLabel="View past games"
          />
        </View>
      </View>
    </View>
  );
}
