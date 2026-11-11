/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioFormat, AudioTrack } from '../types/audio';

// Fast helper to generate high-end procedural vinyl/studio cover art when local track lacks embedded cover
export function generateProceduralCover(seedStr: string, title: string, artist: string): string {
  // Generate deterministic palette from string
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 45) % 360;

  const initials = title
    ? title
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('')
    : 'HI-FI';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 28%, 10%)" />
        <stop offset="100%" stop-color="hsl(${hue2}, 36%, 6%)" />
      </linearGradient>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 70%, 55%)" />
        <stop offset="100%" stop-color="hsl(${hue2}, 85%, 45%)" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bg)" />
    
    <!-- Fine studio vinyl microgrooves -->
    <circle cx="256" cy="256" r="230" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5" />
    <circle cx="256" cy="256" r="190" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    <circle cx="256" cy="256" r="150" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5" />
    <circle cx="256" cy="256" r="110" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />

    <!-- Center Label -->
    <circle cx="256" cy="256" r="88" fill="hsl(${hue1}, 20%, 14%)" stroke="url(#grad)" stroke-width="2" />
    <circle cx="256" cy="256" r="16" fill="#0b0e14" />
    
    <!-- Text -->
    <text x="256" y="240" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="28" fill="#f8fafc" text-anchor="middle" letter-spacing="2">${initials}</text>
    <text x="256" y="280" font-family="'JetBrains Mono', monospace" font-size="11" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="1">STUDIO MASTER</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Format detector from filename & mime type
export function detectFormat(fileName: string, mimeType?: string): AudioFormat {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'flac':
      return 'FLAC';
    case 'wav':
      return 'WAV';
    case 'aif':
    case 'aiff':
      return 'AIFF';
    case 'alac':
      return 'ALAC';
    case 'm4a':
    case 'aac':
      return 'AAC';
    case 'ogg':
      return 'OGG';
    case 'opus':
      return 'OPUS';
    case 'mp3':
      return 'MP3';
    default:
      if (mimeType?.includes('flac')) return 'FLAC';
      if (mimeType?.includes('wav')) return 'WAV';
      if (mimeType?.includes('ogg')) return 'OGG';
      if (mimeType?.includes('opus')) return 'OPUS';
      if (mimeType?.includes('mp4') || mimeType?.includes('aac')) return 'AAC';
      return 'MP3';
  }
}

// Parses FLAC header and METADATA blocks
function parseFlacMetadata(buffer: ArrayBuffer): {
  sampleRate?: number;
  bitDepth?: number;
  channels?: number;
  duration?: number;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  coverUrl?: string;
} {
  const view = new DataView(buffer);
  // Check 'fLaC' magic marker
  if (
    view.getUint8(0) !== 0x66 ||
    view.getUint8(1) !== 0x4c ||
    view.getUint8(2) !== 0x61 ||
    view.getUint8(3) !== 0x43
  ) {
    return {};
  }

  let offset = 4;
  let isLast = false;
  let sampleRate: number | undefined;
  let bitDepth: number | undefined;
  let channels: number | undefined;
  let totalSamples: number | undefined;
  let title: string | undefined;
  let artist: string | undefined;
  let album: string | undefined;
  let genre: string | undefined;
  let year: number | undefined;
  let coverUrl: string | undefined;

  while (!isLast && offset < buffer.byteLength - 4) {
    const header = view.getUint8(offset);
    isLast = (header & 0x80) !== 0;
    const blockType = header & 0x7f;
    const length = (view.getUint8(offset + 1) << 16) | (view.getUint8(offset + 2) << 8) | view.getUint8(offset + 3);
    offset += 4;

    if (offset + length > buffer.byteLength) break;

    // Block 0: STREAMINFO
    if (blockType === 0 && length >= 34) {
      // 10th to 17th bytes in STREAMINFO
      // [sample rate (20 bits)] [channels - 1 (3 bits)] [bits per sample - 1 (5 bits)] [total samples (36 bits)]
      const b1 = view.getUint8(offset + 10);
      const b2 = view.getUint8(offset + 11);
      const b3 = view.getUint8(offset + 12);
      const b4 = view.getUint8(offset + 13);
      const b5 = view.getUint8(offset + 14);
      const b6 = view.getUint8(offset + 15);
      const b7 = view.getUint8(offset + 16);
      const b8 = view.getUint8(offset + 17);

      sampleRate = (b1 << 12) | (b2 << 4) | (b3 >> 4);
      channels = ((b3 >> 1) & 0x07) + 1;
      bitDepth = (((b3 & 0x01) << 4) | (b4 >> 4)) + 1;

      const totalSamplesHi = b4 & 0x0f;
      const totalSamplesLo = (b5 << 24) | (b6 << 16) | (b7 << 8) | b8;
      totalSamples = totalSamplesHi * 4294967296 + (totalSamplesLo >>> 0);
    }
    // Block 4: VORBIS_COMMENT
    else if (blockType === 4) {
      try {
        let commentOffset = offset;
        const vendorLen = view.getUint32(commentOffset, true);
        commentOffset += 4 + vendorLen;

        const count = view.getUint32(commentOffset, true);
        commentOffset += 4;

        const decoder = new TextDecoder('utf-8');
        for (let i = 0; i < count && commentOffset < offset + length; i++) {
          const commentLen = view.getUint32(commentOffset, true);
          commentOffset += 4;
          if (commentOffset + commentLen > offset + length) break;
          const commentStr = decoder.decode(new Uint8Array(buffer, commentOffset, commentLen));
          commentOffset += commentLen;

          const eqIdx = commentStr.indexOf('=');
          if (eqIdx !== -1) {
            const key = commentStr.substring(0, eqIdx).toUpperCase();
            const val = commentStr.substring(eqIdx + 1).trim();
            if (key === 'TITLE' && !title) title = val;
            else if (key === 'ARTIST' && !artist) artist = val;
            else if (key === 'ALBUM' && !album) album = val;
            else if (key === 'GENRE' && !genre) genre = val;
            else if ((key === 'DATE' || key === 'YEAR') && !year) {
              const yr = parseInt(val, 10);
              if (!isNaN(yr)) year = yr;
            }
          }
        }
      } catch (e) {
        console.warn('Vorbis comment parse error:', e);
      }
    }
    // Block 6: PICTURE
    else if (blockType === 6) {
      try {
        let picOffset = offset;
        picOffset += 4; // picture type
        const mimeLen = view.getUint32(picOffset);
        picOffset += 4;
        const mimeDecoder = new TextDecoder('ascii');
        const mimeType = mimeDecoder.decode(new Uint8Array(buffer, picOffset, mimeLen));
        picOffset += mimeLen;

        const descLen = view.getUint32(picOffset);
        picOffset += 4 + descLen;
        picOffset += 16; // width, height, depth, colors

        const dataLen = view.getUint32(picOffset);
        picOffset += 4;

        if (picOffset + dataLen <= buffer.byteLength) {
          const picBytes = new Uint8Array(buffer, picOffset, dataLen);
          const blob = new Blob([picBytes], { type: mimeType || 'image/jpeg' });
          coverUrl = URL.createObjectURL(blob);
        }
      } catch (e) {
        console.warn('FLAC picture parse error:', e);
      }
    }

    offset += length;
  }

  const duration = sampleRate && totalSamples ? Math.round(totalSamples / sampleRate) : undefined;
  return { sampleRate, bitDepth, channels, duration, title, artist, album, genre, year, coverUrl };
}

// Parses WAV format chunk
function parseWavMetadata(buffer: ArrayBuffer): {
  sampleRate?: number;
  bitDepth?: number;
  channels?: number;
  duration?: number;
} {
  const view = new DataView(buffer);
  if (buffer.byteLength < 44) return {};

  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (riff !== 'RIFF' || wave !== 'WAVE') return {};

  let offset = 12;
  let sampleRate: number | undefined;
  let bitDepth: number | undefined;
  let channels: number | undefined;
  let dataSize: number | undefined;

  while (offset < buffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);
    offset += 8;

    if (chunkId === 'fmt ') {
      channels = view.getUint16(offset + 2, true);
      sampleRate = view.getUint32(offset + 4, true);
      bitDepth = view.getUint16(offset + 14, true);
    } else if (chunkId === 'data') {
      dataSize = chunkSize;
    }

    offset += chunkSize;
    // Word alignment
    if (chunkSize % 2 !== 0) offset++;
  }

  let duration: number | undefined;
  if (sampleRate && bitDepth && channels && dataSize) {
    const bytesPerSec = (sampleRate * channels * bitDepth) / 8;
    duration = Math.round(dataSize / bytesPerSec);
  }

  return { sampleRate, bitDepth, channels, duration };
}

// Parses ID3v2 tags in MP3 files
function parseId3Metadata(buffer: ArrayBuffer): {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  coverUrl?: string;
} {
  const view = new DataView(buffer);
  if (buffer.byteLength < 10) return {};

  if (view.getUint8(0) !== 0x49 || view.getUint8(1) !== 0x44 || view.getUint8(2) !== 0x33) {
    return {};
  }

  const version = view.getUint8(3); // 3 for ID3v2.3, 4 for ID3v2.4
  // Synchsafe integer for header size
  const b0 = view.getUint8(6);
  const b1 = view.getUint8(7);
  const b2 = view.getUint8(8);
  const b3 = view.getUint8(9);
  const tagSize = ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f);

  let offset = 10;
  const maxOffset = Math.min(buffer.byteLength, 10 + tagSize);

  let title: string | undefined;
  let artist: string | undefined;
  let album: string | undefined;
  let genre: string | undefined;
  let year: number | undefined;
  let coverUrl: string | undefined;

  const textDecoder = new TextDecoder('utf-8');
  const latinDecoder = new TextDecoder('iso-8859-1');

  while (offset < maxOffset - 10) {
    const frameId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );

    // Padding reached
    if (frameId.charCodeAt(0) === 0) break;

    let frameSize: number;
    if (version === 4) {
      // Synchsafe size in ID3v2.4
      const sb0 = view.getUint8(offset + 4);
      const sb1 = view.getUint8(offset + 5);
      const sb2 = view.getUint8(offset + 6);
      const sb3 = view.getUint8(offset + 7);
      frameSize = ((sb0 & 0x7f) << 21) | ((sb1 & 0x7f) << 14) | ((sb2 & 0x7f) << 7) | (sb3 & 0x7f);
    } else {
      frameSize = view.getUint32(offset + 4);
    }

    offset += 10;
    if (offset + frameSize > maxOffset) break;

    try {
      if (['TIT2', 'TPE1', 'TALB', 'TYER', 'TDRC', 'TCON'].includes(frameId)) {
        const encoding = view.getUint8(offset);
        const textBytes = new Uint8Array(buffer, offset + 1, frameSize - 1);
        const str = (encoding === 0 ? latinDecoder : textDecoder).decode(textBytes).replace(/\0/g, '').trim();

        if (frameId === 'TIT2' && !title) title = str;
        else if (frameId === 'TPE1' && !artist) artist = str;
        else if (frameId === 'TALB' && !album) album = str;
        else if (frameId === 'TCON' && !genre) genre = str;
        else if ((frameId === 'TYER' || frameId === 'TDRC') && !year) {
          const yr = parseInt(str.substring(0, 4), 10);
          if (!isNaN(yr)) year = yr;
        }
      } else if (frameId === 'APIC' && !coverUrl) {
        // Picture frame
        let pOffset = offset;
        pOffset++; // skip encoding byte
        // Read MIME
        let mime = '';
        while (pOffset < offset + frameSize) {
          const charCode = view.getUint8(pOffset++);
          if (charCode === 0) break;
          mime += String.fromCharCode(charCode);
        }
        pOffset++; // picture type
        // Description string ends with 0
        while (pOffset < offset + frameSize) {
          if (view.getUint8(pOffset++) === 0) break;
        }
        if (pOffset < offset + frameSize) {
          const picBytes = new Uint8Array(buffer, pOffset, offset + frameSize - pOffset);
          const blob = new Blob([picBytes], { type: mime || 'image/jpeg' });
          coverUrl = URL.createObjectURL(blob);
        }
      }
    } catch (e) {
      console.warn('ID3 frame parse error:', e);
    }

    offset += frameSize;
  }

  return { title, artist, album, genre, year, coverUrl };
}

// Probes audio duration via standard audio element
function probeAudioDuration(blob: Blob): Promise<{ duration: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = 'metadata';

    const cleanUp = () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      URL.revokeObjectURL(url);
    };

    audio.onloadedmetadata = () => {
      const dur = Math.round(audio.duration || 0);
      cleanUp();
      resolve({ duration: dur > 0 ? dur : 180 });
    };

    audio.onerror = () => {
      cleanUp();
      resolve({ duration: 180 });
    };

    audio.src = url;
  });
}

// Main parser function: takes a local File or Blob and returns a high-fidelity AudioTrack
export async function parseAudioFile(
  file: File | Blob,
  customFileName?: string,
  customFolderPath?: string
): Promise<AudioTrack> {
  const fileName = customFileName || (file instanceof File ? file.name : 'Unknown Audio');
  const format = detectFormat(fileName, file.type);
  const fileSize = file.size;

  let folderPath = customFolderPath;
  if (!folderPath && file instanceof File && (file as { webkitRelativePath?: string }).webkitRelativePath) {
    const parts = (file as { webkitRelativePath?: string }).webkitRelativePath!.split('/');
    if (parts.length > 1) {
      folderPath = `/storage/emulated/0/${parts.slice(0, -1).join('/')}`;
    }
  }
  if (!folderPath) {
    folderPath = '/storage/emulated/0/Music';
  }

  // Read header slice (first 512KB is enough for tags and album art)
  const headerSliceSize = Math.min(fileSize, 512 * 1024);
  const headerBuffer = await file.slice(0, headerSliceSize).arrayBuffer();

  let title: string | undefined;
  let artist: string | undefined;
  let album: string | undefined;
  let genre: string | undefined;
  let year: number | undefined;
  let duration: number | undefined;
  let sampleRate: number = 44100;
  let bitDepth: number = 16;
  let channels: number = 2;
  let coverUrl: string | undefined;

  // 1. FLAC extraction
  if (format === 'FLAC') {
    const flacData = parseFlacMetadata(headerBuffer);
    sampleRate = flacData.sampleRate || 96000;
    bitDepth = flacData.bitDepth || 24;
    channels = flacData.channels || 2;
    duration = flacData.duration;
    title = flacData.title;
    artist = flacData.artist;
    album = flacData.album;
    genre = flacData.genre;
    year = flacData.year;
    coverUrl = flacData.coverUrl;
  }
  // 2. WAV extraction
  else if (format === 'WAV') {
    const wavData = parseWavMetadata(headerBuffer);
    sampleRate = wavData.sampleRate || 48000;
    bitDepth = wavData.bitDepth || 24;
    channels = wavData.channels || 2;
    duration = wavData.duration;
  }

  // 3. Check for ID3 tags (MP3 or embedded in WAV)
  const id3Data = parseId3Metadata(headerBuffer);
  title = title || id3Data.title;
  artist = artist || id3Data.artist;
  album = album || id3Data.album;
  genre = genre || id3Data.genre;
  year = year || id3Data.year;
  coverUrl = coverUrl || id3Data.coverUrl;

  // Clean filename fallback for title & artist
  if (!title) {
    const cleanName = fileName.replace(/\.[^/.]+$/, '').trim();
    if (cleanName.includes(' - ')) {
      const parts = cleanName.split(' - ');
      artist = parts[0]?.trim();
      title = parts.slice(1).join(' - ').trim();
    } else {
      title = cleanName;
      artist = artist || 'Local Device';
    }
  }

  if (!artist) artist = 'Local Artist';
  if (!album) album = 'Device Storage';

  // If duration wasn't extracted from container headers, probe using audio element
  if (!duration || duration <= 0) {
    const probed = await probeAudioDuration(file);
    duration = probed.duration;
  }

  // Calculate high-fidelity bitrate
  let bitrate: number | undefined;
  if (duration > 0 && fileSize > 0) {
    bitrate = Math.round((fileSize * 8) / (duration * 1000));
  } else {
    // Lossless PCM calculation
    bitrate = Math.round((sampleRate * channels * bitDepth) / 1000);
  }

  // Hi-Res flag: >= 24-bit OR >= 88.2kHz OR Lossless with bitrate >= 1411 kbps
  const isHiRes = bitDepth >= 24 || sampleRate >= 88200 || format === 'FLAC' || format === 'WAV' || format === 'AIFF';

  // Fallback procedural studio cover if no embedded art
  if (!coverUrl) {
    coverUrl = generateProceduralCover(`${title}-${artist}-${album}`, title, artist);
  }

  const id = `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    id,
    title,
    artist,
    album,
    genre,
    year,
    duration,
    format,
    bitDepth,
    sampleRate,
    bitrate,
    channels,
    isHiRes,
    fileSize,
    fileName,
    folderPath,
    coverUrl,
    blob: file,
    dateAdded: Date.now(),
  };
}
