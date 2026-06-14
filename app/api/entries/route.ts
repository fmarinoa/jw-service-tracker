import { DateTime } from "luxon";
import { NextResponse } from "next/server";

import { Entry } from "@/domain/Entry";
import { User } from "@/domain/User";
import { entriesRepository } from "@/repositories";

import { handlerApiRequest } from "../_utils";

export const GET = handlerApiRequest(
  async (req, { user }) => {
    const domainUser = new User(user);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const monthOffset = parseInt(
      url.searchParams.get("monthOffset") || "0",
      10,
    );

    // Calculate start and end of target month in America/Lima timezone
    const now = DateTime.now().setZone("America/Lima");
    const targetMonth = now.plus({ months: monthOffset });
    const startOfMonth = targetMonth.startOf("month").toMillis();
    const endOfMonth = targetMonth.endOf("month").toMillis();

    const result = await entriesRepository.getByUser(domainUser, {
      startOfMonth,
      endOfMonth,
    });

    const startIndex = (page - 1) * limit;
    const entries = result.entries.slice(startIndex, startIndex + limit);

    return {
      entries,
      total: result.total,
      stats: Entry.computeMonthlyStats(result.entries),
    };
  },
  { requiresAuth: true },
);

export const POST = handlerApiRequest(
  async (_req, { user, body }) => {
    const domainUser = new User(user);

    let entry: Entry;
    try {
      entry = Entry.validateForCreate(body);
      entry.validateHourPlusMinutes();
      entry.preachingDateNotInFuture();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      );
    }

    const entryCreated = await entriesRepository.create(domainUser, entry);

    return NextResponse.json(
      { success: true, entry: entryCreated },
      { status: 201 },
    );
  },
  { requiresAuth: true },
);
