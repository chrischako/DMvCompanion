import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import type { Store } from './store';
import type { Character, Field, Note, NoteKind } from './model';
import { newId } from './model';

const KINDS: NoteKind[] = ['session', 'npc', 'location', 'quest'];
const KIND_LABELS: Record<NoteKind, string> = {
  session: 'Sessions',
  npc: 'NPCs',
  location: 'Places',
  quest: 'Quests',
};

// ---------- small shared pieces ----------

function Btn(props: { title: string; onPress: () => void; outline?: boolean; danger?: boolean }) {
  const { title, onPress, outline, danger } = props;
  return (
    <Pressable onPress={onPress} style={[st.btn, outline && st.btnOutline]}>
      <Text style={[st.btnText, outline && st.btnTextOutline, danger && st.danger]}>{title}</Text>
    </Pressable>
  );
}

function Input(props: TextInputProps & { label?: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={st.inputWrap}>
      {label ? <Text style={st.label}>{label}</Text> : null}
      <TextInput
        {...rest}
        style={[st.input, rest.multiline && st.inputMulti, style]}
        placeholderTextColor="#999"
      />
    </View>
  );
}

function ListRow(props: { title: string; subtitle?: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={st.listRow}>
      <Text style={st.listTitle}>{props.title}</Text>
      {props.subtitle ? <Text style={st.listSub}>{props.subtitle}</Text> : null}
    </Pressable>
  );
}

function confirmDelete(what: string, onYes: () => void) {
  Alert.alert(`Delete ${what}?`, 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onYes },
  ]);
}

// ---------- Home: list of campaigns ----------

export function HomeScreen({ store, open }: { store: Store; open: (id: string) => void }) {
  const [name, setName] = useState('');
  const add = () => {
    const n = name.trim();
    if (!n) return;
    store.update((d) => ({
      ...d,
      campaigns: [...d.campaigns, { id: newId(), name: n, characters: [], notes: [] }],
    }));
    setName('');
  };
  return (
    <ScrollView contentContainerStyle={st.pad} keyboardShouldPersistTaps="handled">
      <Text style={st.h1}>Campaigns</Text>
      <View style={st.row}>
        <View style={st.flex}>
          <Input placeholder="New campaign" value={name} onChangeText={setName} />
        </View>
        <Btn title="Add" onPress={add} />
      </View>
      {store.data.campaigns.map((c) => (
        <ListRow
          key={c.id}
          title={c.name}
          subtitle={`${c.characters.length} characters · ${c.notes.length} notes`}
          onPress={() => open(c.id)}
        />
      ))}
    </ScrollView>
  );
}

// ---------- Campaign: characters + story ----------

export function CampaignScreen(props: {
  store: Store;
  campaignId: string;
  onBack: () => void;
  openSheet: (characterId: string) => void;
  openNote: (noteId: string) => void;
}) {
  const { store, campaignId, onBack, openSheet, openNote } = props;
  const [tab, setTab] = useState<'characters' | 'story'>('characters');
  const [charName, setCharName] = useState('');
  const [templateId, setTemplateId] = useState<string | undefined>(store.data.templates[0]?.id);
  const [kind, setKind] = useState<NoteKind>('session');
  const [title, setTitle] = useState('');

  const campaign = store.data.campaigns.find((c) => c.id === campaignId);
  if (!campaign) return null;

  const addCharacter = () => {
    const n = charName.trim();
    if (!n || !templateId) return;
    const ch: Character = { id: newId(), name: n, templateId, values: {} };
    store.editCampaign(campaignId, (c) => ({ ...c, characters: [...c.characters, ch] }));
    setCharName('');
  };

  const addNote = () => {
    const t = title.trim();
    if (!t) return;
    const note: Note = { id: newId(), kind, title: t, body: '' };
    store.editCampaign(campaignId, (c) => ({ ...c, notes: [...c.notes, note] }));
    setTitle('');
  };

  return (
    <View style={st.flex}>
      <View style={st.header}>
        <Btn title="← Back" onPress={onBack} outline />
        <Text style={st.headerTitle} numberOfLines={1}>{campaign.name}</Text>
      </View>
      <View style={st.tabs}>
        {(['characters', 'story'] as const).map((t) => (
          <Pressable key={t} style={[st.tab, tab === t && st.tabOn]} onPress={() => setTab(t)}>
            <Text style={[st.tabText, tab === t && st.tabTextOn]}>
              {t === 'characters' ? 'Characters' : 'Story'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={st.pad} keyboardShouldPersistTaps="handled">
        {tab === 'characters' ? (
          <>
            <Input label="New character name" value={charName} onChangeText={setCharName} />
            {store.data.templates.map((t) => (
              <Pressable key={t.id} style={st.radioRow} onPress={() => setTemplateId(t.id)}>
                <Text style={st.radio}>{templateId === t.id ? '◉' : '○'}</Text>
                <Text style={st.body}>{t.name}</Text>
              </Pressable>
            ))}
            <View style={st.gap}><Btn title="Add character" onPress={addCharacter} /></View>
            {campaign.characters.map((ch) => (
              <ListRow
                key={ch.id}
                title={ch.name}
                subtitle={store.data.templates.find((t) => t.id === ch.templateId)?.name ?? 'missing template'}
                onPress={() => openSheet(ch.id)}
              />
            ))}
          </>
        ) : (
          <>
            <View style={st.kindRow}>
              {KINDS.map((k) => (
                <Pressable key={k} style={[st.kind, kind === k && st.kindOn]} onPress={() => setKind(k)}>
                  <Text style={[st.kindText, kind === k && st.kindTextOn]}>{KIND_LABELS[k]}</Text>
                </Pressable>
              ))}
            </View>
            <View style={st.row}>
              <View style={st.flex}>
                <Input placeholder="New entry title" value={title} onChangeText={setTitle} />
              </View>
              <Btn title="Add" onPress={addNote} />
            </View>
            {campaign.notes
              .filter((n) => n.kind === kind)
              .map((n) => (
                <ListRow
                  key={n.id}
                  title={n.title}
                  subtitle={n.body.trim() ? n.body.split('\n')[0] : undefined}
                  onPress={() => openNote(n.id)}
                />
              ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ---------- Note editor ----------

export function NoteScreen(props: { store: Store; campaignId: string; noteId: string; onBack: () => void }) {
  const { store, campaignId, noteId, onBack } = props;
  const note = store.data.campaigns.find((c) => c.id === campaignId)?.notes.find((n) => n.id === noteId);
  if (!note) return null;

  const edit = (patch: Partial<Note>) =>
    store.editCampaign(campaignId, (c) => ({
      ...c,
      notes: c.notes.map((n) => (n.id === noteId ? { ...n, ...patch } : n)),
    }));

  return (
    <ScrollView contentContainerStyle={st.pad} keyboardShouldPersistTaps="handled">
      <View style={st.rowBetween}>
        <Btn title="← Done" onPress={onBack} outline />
        <Btn
          title="Delete"
          outline
          danger
          onPress={() =>
            confirmDelete('this entry', () => {
              store.editCampaign(campaignId, (c) => ({ ...c, notes: c.notes.filter((n) => n.id !== noteId) }));
              onBack();
            })
          }
        />
      </View>
      <Text style={st.label}>{KIND_LABELS[note.kind].replace(/s$/, '')}</Text>
      <Input label="Title" value={note.title} onChangeText={(t) => edit({ title: t })} />
      <Input
        label="Notes"
        value={note.body}
        onChangeText={(b) => edit({ body: b })}
        multiline
        style={st.tall}
      />
    </ScrollView>
  );
}

// ---------- Character sheet: renders any template ----------

export function SheetScreen(props: { store: Store; campaignId: string; characterId: string; onBack: () => void }) {
  const { store, campaignId, characterId, onBack } = props;
  const ch = store.data.campaigns
    .find((c) => c.id === campaignId)
    ?.characters.find((x) => x.id === characterId);
  if (!ch) return null;
  const template = store.data.templates.find((t) => t.id === ch.templateId);

  const edit = (change: (c: Character) => Character) =>
    store.editCampaign(campaignId, (c) => ({
      ...c,
      characters: c.characters.map((x) => (x.id === characterId ? change(x) : x)),
    }));

  return (
    <ScrollView contentContainerStyle={st.pad} keyboardShouldPersistTaps="handled">
      <View style={st.rowBetween}>
        <Btn title="← Back" onPress={onBack} outline />
        <Btn
          title="Delete"
          outline
          danger
          onPress={() =>
            confirmDelete(ch.name || 'this character', () => {
              store.editCampaign(campaignId, (c) => ({
                ...c,
                characters: c.characters.filter((x) => x.id !== characterId),
              }));
              onBack();
            })
          }
        />
      </View>
      <Input label="Name" value={ch.name} onChangeText={(n) => edit((c) => ({ ...c, name: n }))} />
      {!template ? (
        <Text style={st.body}>This character's template no longer exists.</Text>
      ) : (
        template.sections.map((section) => (
          <View key={section.title}>
            <Text style={st.sectionTitle}>{section.title}</Text>
            <View style={st.divider} />
            {section.fields.map((field) => (
              <FieldRow
                key={field.id}
                field={field}
                value={ch.values[field.id] ?? ''}
                onChange={(v) => edit((c) => ({ ...c, values: { ...c.values, [field.id]: v } }))}
              />
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function FieldRow({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  switch (field.type) {
    case 'text':
      return <Input label={field.label} value={value} onChangeText={onChange} />;

    case 'longtext':
      return <Input label={field.label} value={value} onChangeText={onChange} multiline />;

    case 'list':
      return (
        <Input label={`${field.label} (one per line)`} value={value} onChangeText={onChange} multiline />
      );

    case 'number': {
      const n = parseInt(value, 10) || 0;
      return (
        <View style={st.fieldRow}>
          <Text style={[st.body, st.flex]}>{field.label}</Text>
          <Pressable style={st.step} onPress={() => onChange(String(n - 1))}>
            <Text style={st.stepText}>−</Text>
          </Pressable>
          <TextInput
            style={[st.input, st.numInput]}
            value={value}
            keyboardType="numeric"
            onChangeText={(t) => onChange(t.replace(/[^0-9-]/g, ''))}
          />
          <Pressable style={st.step} onPress={() => onChange(String(n + 1))}>
            <Text style={st.stepText}>+</Text>
          </Pressable>
        </View>
      );
    }

    case 'dots': {
      const current = parseInt(value, 10) || 0;
      const max = field.max ?? 5;
      return (
        <View style={st.fieldRow}>
          <Text style={[st.body, st.flex]}>{field.label}</Text>
          {Array.from({ length: max }, (_, i) => i + 1).map((i) => (
            <Pressable key={i} onPress={() => onChange(String(i === current ? i - 1 : i))} hitSlop={4}>
              <Text style={st.dot}>{i <= current ? '●' : '○'}</Text>
            </Pressable>
          ))}
        </View>
      );
    }

    case 'check':
      return (
        <View style={st.fieldRow}>
          <Text style={[st.body, st.flex]}>{field.label}</Text>
          <Switch value={value === 'true'} onValueChange={(v) => onChange(String(v))} />
        </View>
      );

    case 'dropdown':
      return <DropdownField field={field} value={value} onChange={onChange} />;
  }
}

function DropdownField({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={st.fieldRow}>
      <Text style={[st.body, st.flex]}>{field.label}</Text>
      <Btn title={value || 'Choose…'} onPress={() => setOpen(true)} outline />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={st.backdrop} onPress={() => setOpen(false)}>
          <View style={st.sheet}>
            <Text style={st.sectionTitle}>{field.label}</Text>
            <ScrollView>
              {(field.options ?? []).map((o) => (
                <Pressable
                  key={o}
                  style={st.option}
                  onPress={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                >
                  <Text style={[st.body, o === value && st.bold]}>{o}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ---------- styles ----------

const ACCENT = '#5b3a8c';

const st = StyleSheet.create({
  flex: { flex: 1 },
  pad: { padding: 16, paddingBottom: 48 },
  gap: { marginVertical: 12, alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  h1: { fontSize: 28, fontWeight: '600', marginBottom: 12, color: '#222' },
  body: { fontSize: 16, color: '#222' },
  bold: { fontWeight: '700' },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  headerTitle: { fontSize: 20, fontWeight: '600', flex: 1, color: '#222' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ddd' },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabOn: { borderBottomWidth: 3, borderColor: ACCENT },
  tabText: { fontSize: 16, color: '#666' },
  tabTextOn: { color: ACCENT, fontWeight: '600' },
  btn: { backgroundColor: ACCENT, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: ACCENT },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnTextOutline: { color: ACCENT },
  danger: { color: '#b3261e' },
  inputWrap: { marginVertical: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top' },
  tall: { minHeight: 240 },
  listRow: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  listTitle: { fontSize: 17, color: '#222' },
  listSub: { fontSize: 13, color: '#777', marginTop: 2 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  radio: { fontSize: 20, color: ACCENT },
  kindRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  kind: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16 },
  kindOn: { backgroundColor: ACCENT },
  kindText: { color: ACCENT, fontWeight: '600' },
  kindTextOn: { color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, color: '#222' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 4 },
  step: { paddingHorizontal: 12, paddingVertical: 6 },
  stepText: { fontSize: 22, color: ACCENT },
  numInput: { width: 76, textAlign: 'center' },
  dot: { fontSize: 24, paddingHorizontal: 3, color: ACCENT },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '70%' },
  option: { paddingVertical: 12 },
});
