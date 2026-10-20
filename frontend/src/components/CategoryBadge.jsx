import React from 'react';
import { useAlert } from '../context/AlertContext';
import { Tag } from 'lucide-react';

const CategoryBadge = ({ category, size = 'sm' }) => {
  const { getCategoryColor } = useAlert();
  const color = getCategoryColor(category);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      <Tag className="w-3 h-3" style={{ color }} />
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
