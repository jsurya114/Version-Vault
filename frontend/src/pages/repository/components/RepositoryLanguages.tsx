import React, { useMemo } from 'react';

export interface LanguageStat {
  name: string;
  color: string;
  size: number;
}

interface RepositoryLanguagesProps {
  languages: LanguageStat[];
}

export const RepositoryLanguages = React.memo(({ languages }: RepositoryLanguagesProps) => {
  const totalSize = useMemo(() => languages.reduce((acc, lang) => acc + lang.size, 0), [languages]);

  const languageStats = useMemo(() => {
    if (!languages || languages.length === 0 || totalSize === 0) return [];

    return languages
      .map((lang) => ({
        ...lang,
        percentage: ((lang.size / totalSize) * 100).toFixed(1),
      }))
      .sort((a, b) => b.size - a.size);
  }, [languages, totalSize]);

  if (languageStats.length === 0) return null;

  return (
    <div className="border-t border-gray-800 pt-4">
      <h3 className="text-white text-sm font-semibold mb-3">Languages</h3>

      <div className="w-full h-2 rounded-full overflow-hidden flex mb-3">
        {languageStats.map((lang) => (
          <div
            key={lang.name}
            style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
            className="h-full hover:brightness-110 transition-all"
            title={`${lang.name} ${lang.percentage}%`}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {languageStats.map((lang) => (
          <div key={lang.name} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-white font-medium">{lang.name}</span>
            <span>{lang.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
});
