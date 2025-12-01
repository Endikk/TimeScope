import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Props du composant PageHeader
 */
interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: ReactNode;
  gradient?: string;
}

/**
 * Composant d'en-tête de page standardisé
 */
export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  gradient = "from-blue-50 to-indigo-50"
}: PageHeaderProps) {
  return (
    <div className={`mb-3 md:mb-8 bg-gradient-to-r ${gradient} p-3 md:p-6 rounded-lg md:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="p-2 md:p-3 bg-focustime-primary rounded-lg md:rounded-xl shadow-md hover:shadow-lg shrink-0 transition-all">
            <Icon className="h-5 w-5 md:h-8 md:w-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-3xl font-bold text-focustime-primary mb-0.5 md:mb-1 truncate leading-tight">
              {title}
            </h1>
            <p className="text-xs md:text-base text-focustime-text-secondary font-medium leading-tight">
              {description}
            </p>
          </div>
        </div>
        {actions && (
          <div className="flex gap-2 flex-wrap md:shrink-0 w-full md:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
