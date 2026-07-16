import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressCircleProps {
  progressPercentage: number;
  reportedHours: number;
  monthlyGoal: number;
}

export default function ProgressCircle({
  progressPercentage,
  reportedHours,
  monthlyGoal,
}: ProgressCircleProps) {
  const radius = 52;
  const strokeWidth = 10;
  const size = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  
  // Guard progress percentage between 0 and 100
  const cleanPercentage = Math.min(100, Math.max(0, progressPercentage));
  const strokeDashoffset = circumference - (cleanPercentage / 100) * circumference;

  return (
    <View className="items-center justify-center relative my-4">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e8e2d9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Foreground Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#b86a3d"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          // Rotate start to top (-90 degrees)
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {/* Centered Labels */}
      <View className="absolute items-center justify-center">
        <Text className="text-3xl font-black text-foreground">
          {reportedHours}h
        </Text>
        {monthlyGoal > 0 ? (
          <Text className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">
            de {monthlyGoal}h ({cleanPercentage}%)
          </Text>
        ) : (
          <Text className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">
            registrado
          </Text>
        )}
      </View>
    </View>
  );
}
