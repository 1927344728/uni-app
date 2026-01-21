const fs = require('fs');
const path = require('path');


function sanitizeFilename(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      const oldPath = path.join(dir, file);
      const newFile = file.replace(/ /g, '');
      const newPath = path.join(dir, newFile);

      if (oldPath !== newPath) {
        fs.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error(`Error renaming ${file}:`, err);
            return;
          }
          console.log(`Renamed ${file} to ${newFile}`);
        });
      }
    });
  });
}

function getAudioFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.mp3' || ext === '.flac';
    });
    const outputPath = path.join('database', 'temp_music.js');
    fs.writeFileSync(outputPath, `export default ${JSON.stringify(audioFiles, null, 2)};`);
    console.log(`Audio files list written to ${outputPath}`);
    return audioFiles;
  } catch (err) {
    console.error('Error reading directory:', err);
    return [];
  }
}

function checkLyricsFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.mp3' || ext === '.flac';
    });
    const hasLyrics = [];
    const missingLyrics = [];
    audioFiles.forEach(audioFile => {
      const baseName = path.basename(audioFile, path.extname(audioFile));
      const lrcFile = baseName + '.lrc';
      const lrcPath = path.join(dir, lrcFile);
      if (fs.existsSync(lrcPath)) {
        hasLyrics.push(audioFile);
      } else {
        missingLyrics.push(audioFile);
      }
    });
    return { hasLyrics, missingLyrics };
  } catch (err) {
    console.error('Error checking lyrics files:', err);
    return { hasLyrics: [], missingLyrics: [] };
  }
}

function checkOrphanedLyrics(dir) {
  try {
    const files = fs.readdirSync(dir);
    const lrcFiles = files.filter(file => path.extname(file).toLowerCase() === '.lrc');
    const hasAudio = [];
    const missingAudio = [];
    lrcFiles.forEach(lrcFile => {
      const baseName = path.basename(lrcFile, '.lrc');
      const mp3Path = path.join(dir, baseName + '.mp3');
      const flacPath = path.join(dir, baseName + '.flac');
      if (fs.existsSync(mp3Path) || fs.existsSync(flacPath)) {
        hasAudio.push(lrcFile);
      } else {
        missingAudio.push(lrcFile);
      }
    });
    return { hasAudio, missingAudio };
  } catch (err) {
    console.error('Error checking orphaned lyrics files:', err);
    return { hasAudio: [], missingAudio: [] };
  }
}

getAudioFiles('./纯音乐')

module.exports = { sanitizeFilename, getAudioFiles, checkLyricsFiles, checkOrphanedLyrics };

// sanitizeFilename(dir);
