import React, { useState } from 'react';
import { Search, Image as ImageIcon, Music } from 'lucide-react';
import type { LyricsData, SelectedLyrics } from './types';
import API_URL from './config';

function App() {
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [selectedLyrics, setSelectedLyrics] = useState<SelectedLyrics>({
    startIndex: -1,
    endIndex: -1,
    lines: [],
  });
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(`${API_URL}/api/lyrics?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setLyricsData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des paroles :', error);
    }
  };

  const handleLyricSelection = (index: number) => {
    const line = lyricsData!.lyrics[index]; // Ligne cliquée
  
    // Vérifier si la ligne est déjà sélectionnée
    const isSelected = selectedLyrics.lines.includes(line);
  
    if (isSelected) {
      // Désélectionner la ligne
      const updatedLines = selectedLyrics.lines.filter((selectedLine) => selectedLine !== line);
  
      setSelectedLyrics({
        startIndex: updatedLines.length > 0 ? Math.min(...updatedLines.map((l) => lyricsData!.lyrics.indexOf(l))) : -1,
        endIndex: updatedLines.length > 0 ? Math.max(...updatedLines.map((l) => lyricsData!.lyrics.indexOf(l))) : -1,
        lines: updatedLines,
      });
    } else {
      // Ajouter une ligne sélectionnée
      const updatedLines = [...selectedLyrics.lines, line].sort(
        (a, b) => lyricsData!.lyrics.indexOf(a) - lyricsData!.lyrics.indexOf(b)
      );
  
      setSelectedLyrics({
        startIndex: Math.min(...updatedLines.map((l) => lyricsData!.lyrics.indexOf(l))),
        endIndex: Math.max(...updatedLines.map((l) => lyricsData!.lyrics.indexOf(l))),
        lines: updatedLines,
      });
    }
  };
  
  

  const handleGenerateImage = async () => {
    try {
      const response = await fetch('http://localhost:5000/generate_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist: lyricsData?.artist,
          song: lyricsData?.song,
          lyrics: selectedLyrics.lines,
          albumImage: lyricsData?.albumImage,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
  
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
  
      // Afficher l'image générée
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image :', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Lyrics Image Generator</h1>
        
        {/* Search Form */}
        <div className="max-w-2xl mx-auto space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Song title"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Search size={20} />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {lyricsData && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Album Image */}
              <div className="bg-white/5 rounded-lg p-4">
                {lyricsData.albumImage && (
                  <img
                    src={lyricsData.albumImage}
                    alt={`${lyricsData.artist} - ${lyricsData.song}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-semibold">{artist}</h2>
                  <p className="text-purple-400">{song}</p>
                </div>
              </div>

              {/* Lyrics Selection */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Select 1-4 lines:</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {lyricsData.lyrics.map((line, index) => (
                    <div
                      key={index}
                      onClick={() => handleLyricSelection(index)}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        index >= selectedLyrics.startIndex &&
                        index <= selectedLyrics.endIndex
                          ? 'bg-purple-600'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            {selectedLyrics.lines.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleGenerateImage}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <ImageIcon size={24} />
                  <span>Générer l'image</span>
                </button>
              </div>
            )}
            {generatedImageUrl && (
              <div className="mt-8 text-center">
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="mx-auto mb-4 rounded-lg shadow-lg max-w-full h-auto"
                />
                <a href={generatedImageUrl} download="generated_image.jpg">
                  <button
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <ImageIcon size={24} />
                    <span>Télécharger l'image</span>
                  </button>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;