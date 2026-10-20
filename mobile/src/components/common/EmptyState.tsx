import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  textColor?: string;
  subtextColor?: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  subtitle,
  textColor = '#0f172a',
  subtextColor = '#64748b',
  actionText,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {icon ? <View style={styles.iconCircle}>{icon}</View> : null}
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: subtextColor }]}>{subtitle}</Text>
        ) : null}
        {actionText && onActionPress ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onActionPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{actionText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  card: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
