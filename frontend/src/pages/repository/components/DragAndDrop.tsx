import React, { useState, useRef } from 'react';

interface RepoDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  selectedFilesCount: number;
}

export const DragAndDrop: React.FC<RepoDropZoneProps> = ({
  onFilesSelected,
  selectedFilesCount,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const traverseFileTree = async (item: FileSystemEntry, path: string = ''): Promise<File[]> => {
    const files: File[] = [];
    if (item.isFile) {
      const fileEntry = item as FileSystemFileEntry;
      const file = await new Promise<File>((resolve) => fileEntry.file(resolve));
      // Manually inject the path so the backend can reconstruct the folder structure
      Object.defineProperty(file, 'webkitRelativePath', {
        value: path + file.name,
        writable: false,
      });
      files.push(file);
    } else if (item.isDirectory) {
      const dirEntry = item as FileSystemDirectoryEntry;
      const dirReader = dirEntry.createReader();
      const entries = await new Promise<FileSystemEntry[]>((resolve) => {
        dirReader.readEntries(resolve);
      });
      for (const entry of entries) {
        const nestedFiles = await traverseFileTree(entry, path + item.name + '/');
        files.push(...nestedFiles);
      }
    }
    return files;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const allFiles: File[] = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) {
          const folderFiles = await traverseFileTree(item);
          allFiles.push(...folderFiles);
        }
      }
    }
    onFilesSelected(allFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 xs:p-4 sm:p-5 space-y-3 xs:space-y-4">
      <h2 className="text-white font-semibold flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
          2
        </span>
        Quick Start (Drag & Drop)
      </h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group border-2 border-dashed rounded-xl xs:rounded-2xl p-6 xs:p-8 sm:p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
          ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-gray-800 bg-gray-950/50 hover:border-gray-700 hover:bg-gray-900/50'
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
          multiple
          webkitdirectory="true" // For folder support via browse
        />

        <div className="flex flex-col items-center text-center">
          <h3
            className={`text-2xl xs:text-3xl sm:text-4xl font-black mb-2 xs:mb-3 sm:mb-4 transition-colors ${isDragging ? 'text-blue-400' : 'text-blue-500/80 group-hover:text-blue-400'}`}
          >
            Drop Here
          </h3>

          <p className="text-white font-semibold text-sm xs:text-base sm:text-lg mb-1">
            Drag and drop your project folder here
          </p>
          <p className="text-gray-500 text-sm">or click to browse your local files</p>

          <div className="mt-4 xs:mt-6 sm:mt-8 pt-4 xs:pt-5 sm:pt-6 border-t border-gray-800/50 w-full flex justify-center">
            <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em] font-bold">
              Supported: .ZIP, .GIT, FOLDER
            </p>
          </div>
        </div>

        {selectedFilesCount > 0 && (
          <div className="absolute top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4 bg-blue-600 text-white text-[10px] xs:text-xs font-bold px-2 py-0.5 xs:py-1 rounded-full animate-bounce">
            {selectedFilesCount} Files Prepared
          </div>
        )}
      </div>
    </div>
  );
};
