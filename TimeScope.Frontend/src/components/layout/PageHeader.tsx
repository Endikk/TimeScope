import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: ReactNode;
  gradient?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  gradient = "from-blue-50 to-indigo-50"
}: PageHeaderProps) {
  return (
    <div className={`mb-8 bg-gradient-to-r ${gradient} p-6 rounded-xl border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-focustime-primary to-focustime-action rounded-xl shadow-lg">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-focustime-primary mb-1 flex items-center gap-3">
              {title}
            </h1>
            <p className="text-focustime-text-secondary font-medium">
              {description}
            </p>
          </div>
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
