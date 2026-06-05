export interface ZipItem {
  path: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  date: Date;
  dir: string; // Parent folder path (e.g. "" or "src/")
  depth: number; // Tree depth
  sizeCompressed?: number;
}

export type SortField = 'name' | 'size' | 'type' | 'date';
export type SortOrder = 'asc' | 'desc';

export interface ExplorerState {
  currentPath: string;
  searchQuery: string;
  selectedFile: ZipItem | null;
  fileContent: string | null;
  fileUrl: string | null;
  isLoading: boolean;
  expandedFolders: string[]; // paths of expanded folders in tree
  sortBy: SortField;
  sortOrder: SortOrder;
}
