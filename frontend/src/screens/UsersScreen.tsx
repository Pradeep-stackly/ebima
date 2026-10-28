import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import NewUserForm from '../components/NewUserForm';
import UserRow from '../components/UserRow';
import { colors, fontSize, MAX_CONTENT_WIDTH, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../hooks/useUsers';

export default function UsersScreen() {
  const { user: currentUser } = useAuth();
  const { users, total, loading, refreshing, loadingMore, error, hasMore, retry, refresh, loadMore, replaceUser } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (loading) return <LoadingState message="Loading users..." />;
  if (error && users.length === 0) return <ErrorState message={error} onRetry={retry} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>
              {total} {total === 1 ? 'user' : 'users'} · tap a user to change role or status
            </Text>
          </View>
        </View>

        {message ? <Text style={styles.success}>{message}</Text> : null}

        {showForm ? (
          <NewUserForm
            onCancel={() => setShowForm(false)}
            onCreated={(created) => {
              setShowForm(false);
              setMessage(`${created.fullName} was added as ${created.role}.`);
              refresh();
            }}
          />
        ) : (
          <Button
            title="Add user"
            variant="outline"
            onPress={() => {
              setMessage(null);
              setShowForm(true);
            }}
          />
        )}

        <View style={styles.list}>
          {users.map((item) => (
            <UserRow key={item.id} user={item} isCurrentUser={item.id === currentUser?.id} onUpdated={replaceUser} />
          ))}
        </View>

        {hasMore ? <Button title="Load more" variant="outline" loading={loadingMore} onPress={loadMore} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.sm },
  flex: { flex: 1 },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  success: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    color: colors.success,
    fontSize: fontSize.sm,
  },
  list: { gap: spacing.md },
});
