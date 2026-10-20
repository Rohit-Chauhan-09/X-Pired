import React from 'react';
import { AlertTriangle, Clock, ShieldCheck, Flame, XCircle } from 'lucide-react';

const ZoneBadge = ({ zone, daysRemaining, showDays = true }) => {
  let config = {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Safe',
    icon: ShieldCheck,
  };

  if (daysRemaining <= 0 || zone === 'expired') {
    config = {
      bg: 'bg-slate-900 text-rose-400 border-slate-700',
      dot: 'bg-rose-500 animate-pulse',
      label: 'EXPIRED',
      icon: XCircle,
    };
  } else if (daysRemaining <= 3 || zone === 'critical') {
    config = {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500 animate-ping',
      label: 'Critical (<3d)',
      icon: Flame,
    };
  } else if (daysRemaining <= 7 || zone === 'urgent') {
    config = {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Urgent (<7d)',
      icon: AlertTriangle,
    };
  } else if (daysRemaining <= 15 || zone === 'attention') {
    config = {
      bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      dot: 'bg-yellow-500',
      label: 'Attention (<15d)',
      icon: Clock,
    };
  }

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} shadow-sm`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {showDays && daysRemaining !== undefined && (
        <span className="opacity-80 font-mono">
          ({daysRemaining <= 0 ? 'Toss Out' : `${daysRemaining}d`})
        </span>
      )}
    </span>
  );
};

export default ZoneBadge;
