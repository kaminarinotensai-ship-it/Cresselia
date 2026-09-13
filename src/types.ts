export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  file: File;
  progress: string;
  date: string;
  status: 'new' | 'reading' | 'finished';
  bgColor: string;
  coverText: string;
  coverSub: string;
}
