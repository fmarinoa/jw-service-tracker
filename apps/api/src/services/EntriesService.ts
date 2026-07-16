import { Entry } from "@/domain/Entry";
import { FilterEntries } from "@/domain/FilterEntries";
import { User } from "@/domain/User";
import { entriesRepository } from "@/repositories";
import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";

@Injectable()
export class EntriesService {
    async getEntriesByUser(user: User, filters: FilterEntries) {
        const now = DateTime.now().setZone("America/Lima");
        const targetMonth = now.minus({ months: filters.monthOffset });
        const startDate = targetMonth.startOf("month").toMillis();
        const endDate = targetMonth.endOf("month").toMillis();

        const newFilters = new FilterEntries({
            ...filters,
            startDate,
            endDate,
        });

        console.log(`[EntriesService.getEntriesByUser] filters:`, JSON.stringify(newFilters));
        const result = await entriesRepository.getByUser(user, newFilters);

        const startIndex = (filters.page - 1) * filters.limit;
        const entries = result.entries.slice(startIndex, startIndex + filters.limit);

        return {
            entries,
            total: result.total,
            stats: Entry.computeMonthlyStats(result.entries),
        };
    }
}