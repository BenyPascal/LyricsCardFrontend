export interface LyricsData {
  artist: string;
  song: string;
  lyrics: string[];
  albumImage: string;
}

export interface SelectedLyrics {
  startIndex: number;
  endIndex: number;
  lines: string[];
}