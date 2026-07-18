import { millisToIsoDate } from '@jw-tracker/shared';
import pc from 'picocolors';

import { EntryDoc, UserDoc } from '../services';

const SESSION_TYPE_NAMES: Record<string, string> = {
  house_to_house: 'Casa en Casa / Público',
  revisits: 'Revisitas',
  bible_study: 'Estudios Bíblicos',
  other: 'Otros (LDC, etc.)',
};

export class OutputFormatter {
  /**
   * Prints the user header profile details.
   */
  static printUserHeader(user: UserDoc): void {
    console.log(pc.cyan(`\n👤 Publicador: ${pc.bold(user.name)}`));
    console.log(`📞 Teléfono:   ${pc.green(user.phone)}`);
    console.log(`🆔 ID:         ${pc.gray(user.id)}`);
    console.log(
      `🎯 Meta:       ${user.monthlyGoal || 0} horas (${user.preacherType || 'publicador'})\n`,
    );
  }

  /**
   * Displays preaching entries in a clean CLI table layout.
   */
  static printEntriesTable(entries: EntryDoc[]): void {
    console.log(
      pc.bold(pc.underline('Historial de Entradas (Más recientes primero):')),
    );

    const colWidths = { date: 12, time: 10, type: 22, notes: 30 };
    const header =
      'Fecha'.padEnd(colWidths.date) +
      ' | ' +
      'Tiempo'.padEnd(colWidths.time) +
      ' | ' +
      'Tipo de Sesión'.padEnd(colWidths.type) +
      ' | ' +
      'Notas';

    console.log(pc.gray(header));
    console.log(
      pc.gray(
        '-'.repeat(
          colWidths.date +
            colWidths.time +
            colWidths.type +
            colWidths.notes +
            9,
        ),
      ),
    );

    let totalMinutes = 0;

    entries.forEach((entry) => {
      const date = millisToIsoDate(entry.preachingDate);
      const time = `${entry.hours}h ${entry.minutes}m`;
      const typeName = SESSION_TYPE_NAMES[entry.type] || entry.type;
      const notes = entry.notes
        ? entry.notes.length > 27
          ? entry.notes.slice(0, 27) + '...'
          : entry.notes
        : '-';

      console.log(
        date.padEnd(colWidths.date) +
          ' | ' +
          time.padEnd(colWidths.time) +
          ' | ' +
          typeName.padEnd(colWidths.type) +
          ' | ' +
          notes,
      );

      totalMinutes += (entry.hours || 0) * 60 + (entry.minutes || 0);
    });

    console.log(
      pc.gray(
        '-'.repeat(
          colWidths.date +
            colWidths.time +
            colWidths.type +
            colWidths.notes +
            9,
        ),
      ),
    );

    const totalHrs = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;
    console.log(
      `\n${pc.bold('Acumulado Total en registros mostrados:')} ${pc.cyan(`${totalHrs}h ${totalMins}m`)}`,
    );
  }

  /**
   * Groups and prints monthly totals applying the business rules (floor division by 60 for reporting).
   */
  static printMonthlySummary(entries: EntryDoc[]): void {
    const monthlyStats: Record<
      string,
      { totalMin: number; byType: Record<string, number> }
    > = {};

    entries.forEach((entry) => {
      const duration = (entry.hours || 0) * 60 + (entry.minutes || 0);
      const monthKey = millisToIsoDate(entry.preachingDate).slice(0, 7);

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { totalMin: 0, byType: {} };
      }
      monthlyStats[monthKey].totalMin += duration;
      monthlyStats[monthKey].byType[entry.type] =
        (monthlyStats[monthKey].byType[entry.type] || 0) + duration;
    });

    console.log(
      `\n${pc.bold(pc.underline('Resumen Mensual (Reglas de Negocio / Redondeo hacia abajo):'))}`,
    );
    Object.keys(monthlyStats)
      .sort()
      .reverse()
      .forEach((month) => {
        const mStats = monthlyStats[month];
        const actualHrs = Math.floor(mStats.totalMin / 60);
        const actualMins = mStats.totalMin % 60;
        const reportableHrs = Math.floor(mStats.totalMin / 60);

        console.log(`\n📅 ${pc.bold(month)}`);
        console.log(
          `  ⏱️ Tiempo Real: ${pc.yellow(`${actualHrs}h ${actualMins}m`)}`,
        );
        console.log(
          `  📋 Horas Reportables: ${pc.green(`${reportableHrs} horas`)} (redondeado para informe)`,
        );
      });
    console.log();
  }

  /**
   * Outputs raw JSON formatted data.
   */
  static printJson(entries: EntryDoc[]): void {
    console.log(JSON.stringify(entries, null, 2));
  }
}
