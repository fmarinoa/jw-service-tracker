import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { UserGoal } from '@jw-tracker/shared';

interface SettingsProps {
  goal: UserGoal;
  onGoalChange: (hours: number, type: UserGoal['preacherType']) => void;
}

export const Settings = ({ goal, onGoalChange }: SettingsProps) => {
  return (
    <Card className="shadow-sm max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground mb-6">Ministry Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Preaching Goal Hours</label>
          <Input
            type="number"
            min="1"
            max="200"
            value={goal.monthlyHourGoal}
            onChange={e => onGoalChange(parseInt(e.target.value) || 0, goal.preacherType)}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground mt-1.5">Customize your monthly hour goal (e.g. 50h, 30h, 15h, etc.)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Preacher Role / Type</label>
          <Select
            value={goal.preacherType}
            onChange={e => onGoalChange(goal.monthlyHourGoal, e.target.value as any)}
            className="max-w-xs"
          >
            <option value="publisher">Publisher</option>
            <option value="auxiliary_pioneer">Auxiliary Pioneer</option>
            <option value="regular_pioneer">Regular Pioneer</option>
            <option value="special_pioneer">Special Pioneer</option>
          </Select>
          <p className="text-xs text-muted-foreground mt-1.5">Select your current ministry role for the reports.</p>
        </div>
      </CardContent>
    </Card>
  );
};
