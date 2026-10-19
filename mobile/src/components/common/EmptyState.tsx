import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  textColor?: string;
  subtextColor?: string;
}

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  subtitle,
  textColor = '#111827',
  subtextColor = '#6b7280',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: subtextColor }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
