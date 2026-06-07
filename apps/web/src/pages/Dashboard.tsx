import { BookOpen, Calendar, Clock, Plus, Share2, RefreshCw, Trash2, Edit2, Clock3 } from 'lucide-react';
import { DateTime } from 'luxon';
import { sumEntries, formatDuration, PreachingEntry, UserGoal } from '@jw-tracker/shared';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface DashboardProps {
  entries: PreachingEntry[];
  goal: UserGoal;
  onAddClick: () => void;
  onExportClick: () => void;
  onEditClick: (entry: PreachingEntry) => void;
  onDeleteClick: (id: string) => void;
  onNavigateToHistory: () => void;
}

export const Dashboard = ({
  entries,
  goal,
  onAddClick,
  onExportClick,
  onEditClick,
  onDeleteClick,
  onNavigateToHistory,
}: DashboardProps) => {
  const now = DateTime.now();
  const currentYear = now.year;
  const currentMonth = now.month;
  const currentMonthEntries = entries.filter(e => {
    const d = DateTime.fromMillis(e.preachingDate, { zone: 'utc' });
    return d.year === currentYear && d.month === currentMonth;
  });
  const currentMonthStats = sumEntries(currentMonthEntries);

  const hourProgressPercent = Math.min(
    Math.round((currentMonthStats.totalMinutes / (goal.monthlyHourGoal * 60)) * 100),
    100
  );

  const typeLabels: Record<string, string> = {
    house_to_house: 'Casa en casa',
    revisits: 'Revisitas',
    bible_study: 'Estudio Bíblico',
    other: 'Otro',
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Target Progress Card */}
        <Card className="md:col-span-2 flex flex-col justify-between shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Monthly Ministry Goal</CardTitle>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                  {goal.preacherType.replace('_', ' ')}
                </p>
              </div>
              <span className="text-4xl font-extrabold text-primary">
                {currentMonthStats.hours}h
              </span>
            </div>

            <div className="space-y-2 mt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to hours target</span>
                <span className="font-semibold text-foreground">{hourProgressPercent}%</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${hourProgressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>{formatDuration(currentMonthStats.totalMinutes)} logged</span>
                <span>Target: {goal.monthlyHourGoal}h</span>
              </div>
            </div>
          </CardContent>

          <div className="flex gap-4 mt-8 pt-4 border-t border-border px-6 pb-6">
            <Button onClick={onAddClick} className="flex-1 gap-2">
              <Plus className="w-4 h-4" /> Add Record
            </Button>
            <Button onClick={onExportClick} variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" /> Export Report
            </Button>
          </div>
        </Card>

        {/* Current Month Summary Stats */}
        <Card className="shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Resumen del Mes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Casa en casa
              </span>
              <span className="font-semibold text-foreground">
                {formatDuration(currentMonthStats.byType.house_to_house)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" /> Revisitas
              </span>
              <span className="font-semibold text-foreground">
                {formatDuration(currentMonthStats.byType.revisits)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Estudio Bíblico
              </span>
              <span className="font-semibold text-foreground">
                {formatDuration(currentMonthStats.byType.bible_study)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Otro
              </span>
              <span className="font-semibold text-foreground">
                {formatDuration(currentMonthStats.byType.other)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity List */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
          <Button variant="ghost" onClick={onNavigateToHistory} className="text-primary hover:text-primary h-auto py-1 px-2">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {currentMonthEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <Clock3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No preaching entries logged this month yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {currentMonthEntries.slice(0, 5).map(entry => (
                <div key={entry.id} className="py-4 flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {DateTime.fromMillis(entry.preachingDate, { zone: 'utc' }).toISODate()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.hours}h {entry.minutes}m • {typeLabels[entry.type] || entry.type}
                    </p>
                    {entry.notes && (
                      <p className="text-xs italic text-muted-foreground/80 mt-1 max-w-md line-clamp-1">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => onEditClick(entry)} className="p-2 h-auto w-auto hover:bg-background">
                      <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button variant="ghost" onClick={() => onDeleteClick(entry.id)} className="p-2 h-auto w-auto hover:bg-red-50">
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
