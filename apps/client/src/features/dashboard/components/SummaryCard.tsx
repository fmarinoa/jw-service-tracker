import React from "react";
import { View, Text, Pressable } from "react-native";

interface SummaryCardProps {
  label: string;
  value: string;
  icon: string;
  subtitle?: string;
  onPress?: () => void;
  actionLabel?: string;
  className?: string;
}

export default function SummaryCard({
  label,
  value,
  icon,
  subtitle,
  onPress,
  actionLabel,
  className = "",
}: SummaryCardProps) {
  return (
    <View 
      className={`bg-card border border-border rounded-2xl p-5 shadow-sm flex-1 ${className}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {label}
          </Text>
          <View className="flex-row items-center mt-2 space-x-2">
            <Text className="text-2xl font-black text-foreground">{value}</Text>
            <Text className="text-xl">{icon}</Text>
          </View>
        </View>
        
        {onPress && actionLabel && (
          <Pressable
            onPress={onPress}
            className="px-3 py-1.5 bg-primary rounded-xl active:bg-primary/90 shadow-sm"
          >
            <Text className="text-primary-foreground font-bold text-xs">
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>

      {subtitle && (
        <Text className="text-xs text-muted-foreground mt-3 leading-relaxed">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
