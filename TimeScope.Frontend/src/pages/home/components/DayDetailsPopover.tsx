import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Building2, ListTodo, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocalTimeEntry {
  id: string;
  date: string;
  groupeId: string;
  groupeName: string;
  projetId: string;
  projetName: string;
  themeId: string;
  themeName: string;
  taskId: string;
  taskName: string;
  heures: number;
  description: string;
  status: 'draft' | 'saved';
}

interface DayDetailsPopoverProps {
  date: string;
  entries: LocalTimeEntry[];
  totalHours: number;
  isHoliday?: boolean;
  holidayName?: string;
}

const DayDetailsPopover: React.FC<DayDetailsPopoverProps> = ({
  date,
  entries,
  totalHours,
  isHoliday,
  holidayName,
}) => {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  };

  const getIntensityColor = (hours: number) => {
    if (hours === 0) return 'text-gray-500';
    if (hours < 4) return 'text-blue-500';
    if (hours < 8) return 'text-indigo-500';
    return 'text-indigo-600';
  };

  // Group entries by company
  const entriesByCompany = entries.reduce((acc, entry) => {
    if (!acc[entry.groupeName]) {
      acc[entry.groupeName] = [];
    }
    acc[entry.groupeName].push(entry);
    return acc;
  }, {} as Record<string, LocalTimeEntry[]>);

  return (
    <Card className="w-[420px] p-0 shadow-lg border-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="h-5 w-5" />
          <h3 className="font-semibold text-lg capitalize">
            {formatDate(date)}
          </h3>
        </div>
        {isHoliday && holidayName && (
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
            {holidayName}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Total Hours */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Temps total
            </span>
          </div>
          <span className={cn('text-2xl font-bold', getIntensityColor(totalHours))}>
            {formatHours(totalHours)}
          </span>
        </div>

        {/* Entries by Company */}
        {entries.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(entriesByCompany).map(([companyName, companyEntries]) => {
              const companyTotal = companyEntries.reduce((sum, e) => sum + e.heures, 0);

              return (
                <div key={companyName} className="space-y-2">
                  {/* Company Header */}
                  <div className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                      <span className="font-semibold text-sm">{companyName}</span>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {formatHours(companyTotal)}
                    </Badge>
                  </div>

                  {/* Tasks for this company */}
                  <div className="space-y-2 pl-2">
                    {companyEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <ListTodo className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium leading-tight break-words">
                              {entry.taskName}
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-700 border-blue-200 flex-shrink-0"
                            >
                              {formatHours(entry.heures)}
                            </Badge>
                          </div>

                          {entry.projetName && (
                            <div className="text-xs text-muted-foreground">
                              Projet: {entry.projetName}
                            </div>
                          )}

                          {entry.description && (
                            <p className="text-xs text-muted-foreground italic mt-1 break-words">
                              {entry.description}
                            </p>
                          )}

                          {entry.status === 'draft' && (
                            <Badge variant="outline" className="text-xs h-5">
                              Brouillon
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Aucune tâche pour cette journée</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `
      }} />
    </Card>
  );
};

export default DayDetailsPopover;
