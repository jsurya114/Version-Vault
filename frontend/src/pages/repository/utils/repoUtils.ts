import { GitFileEntry } from '../../../types/repository/repositoryTypes';

export interface TreeNode {
  name: string;
  path: string;
  type: 'blob' | 'tree';
}

export const calculateLanguagesFromFiles = (files: GitFileEntry[]) => {
  const extensionMap: Record<string, { name: string; color: string }> = {
    ts: { name: 'TypeScript', color: '#3178c6' },
    tsx: { name: 'TypeScript', color: '#3178c6' },
    js: { name: 'JavaScript', color: '#f1e05a' },
    jsx: { name: 'JavaScript', color: '#f1e05a' },
    css: { name: 'CSS', color: '#563d7c' },
    html: { name: 'HTML', color: '#e34c26' },
    py: { name: 'Python', color: '#3572A5' },
    java: { name: 'Java', color: '#b07219' },
    go: { name: 'Go', color: '#00ADD8' },
    rs: { name: 'Rust', color: '#dea584' },
    c: { name: 'C', color: '#555555' },
    cpp: { name: 'C++', color: '#f34b7d' },
    cs: { name: 'C#', color: '#178600' },
    php: { name: 'PHP', color: '#4F5D95' },
    rb: { name: 'Ruby', color: '#701516' },
    swift: { name: 'Swift', color: '#ffac45' },
    kt: { name: 'Kotlin', color: '#A97BFF' },
    md: { name: 'Markdown', color: '#083fa1' },
    json: { name: 'JSON', color: '#292929' },
  };

  const stats: Record<string, { name: string; color: string; size: number }> = {};

  files.forEach((file) => {
    if (file.type !== 'blob') return; // Only count files, not directories
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !extensionMap[ext]) return;

    const langInfo = extensionMap[ext];
    if (!stats[langInfo.name]) {
      stats[langInfo.name] = { name: langInfo.name, color: langInfo.color, size: 0 };
    }
    // Weight each file equally since size bytes aren't readily available per blob without another call
    stats[langInfo.name].size += 1000;
  });

  return Object.values(stats);
};
