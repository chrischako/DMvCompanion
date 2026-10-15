import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { Screen } from './src/model';
import { useStore } from './src/store';
import { CampaignScreen, HomeScreen, NoteScreen, SheetScreen } from './src/screens';

export default function App() {
  const store = useStore();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  const back = () => {
    if (screen.name === 'sheet' || screen.name === 'note') {
      setScreen({ name: 'campaign', campaignId: screen.campaignId });
    } else {
      setScreen({ name: 'home' });
    }
  };

  // Android hardware/gesture back goes up one level instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen.name === 'home') return false;
      back();
      return true;
    });
    return () => sub.remove();
  });

  let content: React.ReactNode;
  if (!store.loaded) {
    content = <ActivityIndicator style={styles.center} />;
  } else if (screen.name === 'home') {
    content = <HomeScreen store={store} open={(id) => setScreen({ name: 'campaign', campaignId: id })} />;
  } else if (screen.name === 'campaign') {
    const { campaignId } = screen;
    content = (
      <CampaignScreen
        store={store}
        campaignId={campaignId}
        onBack={back}
        openSheet={(characterId) => setScreen({ name: 'sheet', campaignId, characterId })}
        openNote={(noteId) => setScreen({ name: 'note', campaignId, noteId })}
      />
    );
  } else if (screen.name === 'sheet') {
    content = (
      <SheetScreen
        store={store}
        campaignId={screen.campaignId}
        characterId={screen.characterId}
        onBack={back}
      />
    );
  } else {
    content = (
      <NoteScreen store={store} campaignId={screen.campaignId} noteId={screen.noteId} onBack={back} />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        {content}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1 },
});
