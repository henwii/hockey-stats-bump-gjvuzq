
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../styles/commonStyles';
import Button from './Button';
import { PlayerStat } from '../types';

interface PlayerSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  players: PlayerStat[];
  onSubmit: (selectedPlayers: string[]) => void;
  title: string;
}

export default function PlayerSelectionModal({
  visible,
  onClose,
  players,
  onSubmit,
  title
}: PlayerSelectionModalProps) {
  const [selectedPlayers, setSelectedPlayers] = React.useState<string[]>([]);

  const togglePlayer = (playerNumber: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerNumber)) {
        return prev.filter(p => p !== playerNumber);
      } else if (prev.length < 5) {
        return [...prev, playerNumber];
      }
      return prev;
    });
  };

  const handleSubmit = () => {
    onSubmit(selectedPlayers);
    setSelectedPlayers([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedPlayers([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Select up to 5 players ({selectedPlayers.length}/5 selected)
          </Text>
          
          <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
            <View style={styles.playerGrid}>
              {players.map((player) => {
                const isSelected = selectedPlayers.includes(player.number);
                const canSelect = selectedPlayers.length < 5 || isSelected;
                
                return (
                  <TouchableOpacity
                    key={player.number}
                    style={[
                      styles.playerButton,
                      isSelected && styles.selectedPlayer,
                      !canSelect && styles.disabledPlayer
                    ]}
                    onPress={() => togglePlayer(player.number)}
                    disabled={!canSelect}
                  >
                    <Text style={[
                      styles.playerButtonText,
                      isSelected && styles.selectedPlayerText,
                      !canSelect && styles.disabledPlayerText
                    ]}>
                      #{player.number}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          <View style={styles.buttonRow}>
            <Button
              text="Cancel"
              onPress={handleClose}
              style={[styles.modalButton, { backgroundColor: colors.softRed }]}
            />
            <Button
              text={`Apply to ${selectedPlayers.length} Player${selectedPlayers.length !== 1 ? 's' : ''}`}
              onPress={handleSubmit}
              style={[styles.modalButton, { backgroundColor: colors.green }]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 3,
    borderColor: colors.outline,
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.text,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Fredoka_500Medium',
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  playerList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  playerButton: {
    backgroundColor: colors.blue,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.outline,
  },
  selectedPlayer: {
    backgroundColor: colors.green,
  },
  disabledPlayer: {
    backgroundColor: colors.muted,
    opacity: 0.5,
  },
  playerButtonText: {
    fontFamily: 'Fredoka_700Bold',
    color: colors.white,
    fontSize: 14,
  },
  selectedPlayerText: {
    color: colors.white,
  },
  disabledPlayerText: {
    color: colors.white,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
