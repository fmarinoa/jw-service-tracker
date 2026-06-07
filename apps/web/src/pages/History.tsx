import { Plus, Edit2, Trash2, Clock3 } from 'lucide-react';
import { DateTime } from 'luxon';
import { PreachingEntry } from '@jw-tracker/shared';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface HistoryProps {
  entries: PreachingEntry[];
  onAddClick: () => void;
  onEditClick: (entry: PreachingEntry) => void;
  onDeleteClick: (id: string) => void;
}

export const History = ({ entries, onAddClick, onEditClick, onDeleteClick }: HistoryProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center pb-6 border-b border-border/50">
        <CardTitle className="text-xl font-semibold text-foreground">Ministry Activity Log</CardTitle>
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="w-4 h-4" /> Add Record
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {entries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <Clock3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-medium mb-1">No preaching entries</h3>
            <p className="text-sm">Click "Add Record" to start logging your preaching service.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map(entry => {
              const typeLabels: Record<string, string> = {
                house_to_house: 'Casa en casa',
                revisits: 'Revisitas',
                bible_study: 'Estudio Bíblico',
                other: 'Otro',
              };
              return (
                <div key={entry.id} className="py-4 flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {DateTime.fromMillis(entry.preachingDate, { zone: 'utc' }).toISODate()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Duración: <span className="font-medium text-foreground">{entry.hours}h {entry.minutes}m</span> • {typeLabels[entry.type] || entry.type}
                    </p>
                    {entry.notes && (
                      <p className="text-xs italic text-muted-foreground/80 mt-1 max-w-lg bg-background p-2 rounded border border-border/50">
                        {entry.notes}
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
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
