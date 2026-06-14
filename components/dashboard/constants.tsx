"use client";

import {
  BookOpen,
  GraduationCap,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import React from "react";

import { SessionType } from "@/domain/Entry";

export const TYPE_LABELS: Record<SessionType, string> = {
  house_to_house: "Casa en casa",
  revisits: "Revisitas",
  bible_study: "Estudio Bíblico",
  other: "Otro",
};

export const TYPE_ICONS: Record<SessionType, React.ReactNode> = {
  house_to_house: <BookOpen className="w-4 h-4 text-primary" />,
  revisits: <RefreshCw className="w-4 h-4 text-primary" />,
  bible_study: <GraduationCap className="w-4 h-4 text-primary" />,
  other: <MoreHorizontal className="w-4 h-4 text-primary" />,
};
