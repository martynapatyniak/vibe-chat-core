import React from 'react';

export const MentionsDropdown: React.FC<{
  items: any[];
  onSelect: (item: any) => void;
}> = ({ items, onSelect }) => {
  if (!items?.length) return null;
  return (
    <ul className="mentions-dropdown bg-white shadow rounded">
      {items.map((it) => (
        <li key={it.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => onSelect(it)}>
          <div className="flex items-center gap-2">
            <img src={it.avatar_url} alt="avatar" className="w-6 h-6 rounded-full" />
            <div>
              <div className="text-sm font-medium">{it.display_name || it.username}</div>
              <div className="text-xs text-gray-500">@{it.username}</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
