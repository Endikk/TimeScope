import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Building2, ListTodo, Calendar, Briefcase } from 'lucide-react';
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
    if (hours === 0) return 'text-gray-400';
    if (hours < 4) return 'text-emerald-600';
    if (hours < 8) return 'text-blue-600';
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
    <Card className="w-[400px] p-0 shadow-xl border-0 ring-1 ring-black/5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 bg-white">
      {/* Top Accent Border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400"></div>

      {/* Header */}
      <div className="bg-white p-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-indigo-900/60 uppercase tracking-wider">
                Détails de la journée
              </span>
            </div>
            <h3 className="font-heading font-bold text-2xl text-gray-900 capitalize">
              {formatDate(date)}
            </h3>
          </div>

          {isHoliday && holidayName && (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 px-3 py-1">
              🎉 {holidayName}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50/30 min-h-[100px]">
        {/* Total Hours Summary */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm ring-1 ring-blue-100/50">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Temps total</span>
              <span className="text-sm text-gray-600 font-medium">Cumulé sur la journée</span>
            </div>
          </div>
          <div className={cn("px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100",
            totalHours > 0 ? "bg-blue-50/50 border-blue-100" : "")}>
            <span className={cn('text-xl font-bold font-mono tracking-tight', getIntensityColor(totalHours))}>
              {formatHours(totalHours)}
            </span>
          </div>
        </div>

        {/* Entries List */}
        <div className="p-0">
          {entries.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {Object.entries(entriesByCompany).map(([companyName, companyEntries], groupIndex) => {
                const companyTotal = companyEntries.reduce((sum, e) => sum + e.heures, 0);

                return (
                  <div key={companyName} className={cn("py-4", groupIndex !== 0 && "border-t border-gray-100")}>
                    {/* Company Header */}
                    <div className="flex items-center justify-between px-5 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-bold text-sm text-gray-700">{companyName}</span>
                      </div>
                      <Badge variant="outline" className="bg-white text-gray-500 border-gray-200 font-mono font-normal">
                        {formatHours(companyTotal)}
                      </Badge>
                    </div>

                    {/* Tasks for this company */}
                    <div className="space-y-2 px-4">
                      {companyEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          <div className="p-3 pl-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                                    {entry.taskName}
                                  </h4>
                                  {entry.status === 'draft' && (
                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-amber-50 text-amber-700 border-amber-100">
                                      Brouillon
                                    </Badge>
                                  )}
                                </div>

                                {entry.projetName && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                    <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                                    <span className="font-medium text-indigo-900/70 truncate">{entry.projetName}</span>
                                  </div>
                                )}

                                {entry.description && (
                                  <p className="text-xs text-gray-500 italic line-clamp-2 pl-2 border-l-2 border-gray-100 mt-2">
                                    {entry.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-50 text-blue-700 border-blue-100 font-mono font-medium hover:bg-blue-100"
                                >
                                  {formatHours(entry.heures)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                <ListTodo className="h-8 w-8 text-gray-300" />
              </div>
              <h4 className="text-gray-900 font-medium mb-1">Aucune activité</h4>
              <p className="text-sm text-gray-500 max-w-[200px]">
                Aucune tâche n'a été enregistrée pour cette journée.
              </p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #E2E8F0;
            border-radius: 20px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #CBD5E1;
          }
        `
      }} />
    </Card>
  );
};

export default DayDetailsPopover;
