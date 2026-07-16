import { CurrentUser } from "@/auth/current-user.decorator";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { FilterEntries } from "@/domain/FilterEntries";
import { User } from "@/domain/User";
import { EntriesService } from "@/services/EntriesService";
import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";

@Controller('entries')
export class EntriesController {
    constructor(private readonly entriesService: EntriesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async retrieveEntries(@CurrentUser() user: User, @Query() query: any) {
        const userId = user?.id;
        if (!userId) {
            throw new BadRequestException('User not found in request context');
        }

        const filters = FilterEntries.validateInstance(query);
        return await this.entriesService.getEntriesByUser(new User({ ...user, id: userId }), filters);
    }
}