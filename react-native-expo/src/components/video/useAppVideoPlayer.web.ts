import { useMemo } from 'react';
import { SharedObject } from 'expo-modules-core';

export type AppVideoSource = string | null | { uri?: string | null };

function getUri(source: AppVideoSource): string | null {
  if (source == null) return null;
  if (typeof source === 'string') return source;
  return source.uri ?? null;
}

function safePlay(video: HTMLVideoElement) {
  const result = video.play();
  if (result && typeof result.catch === 'function') {
    result.catch(() => undefined);
  }
}

/** Web video player — safePlay + canplay, no expo-video web path. */
export class AppVideoPlayer extends SharedObject {
  src: AppVideoSource = null;
  playing = false;
  loop = false;

  private videos = new Set<HTMLVideoElement>();
  private timeUpdateLoop: ReturnType<typeof setInterval> | null = null;
  private _timeUpdateEventInterval = 0;
  private status: 'idle' | 'loading' | 'readyToPlay' | 'error' = 'idle';

  constructor(source: AppVideoSource) {
    super();
    this.src = source;
  }

  get duration() {
    const value = [...this.videos][0]?.duration;
    return Number.isFinite(value) ? value! : 0;
  }

  get currentTime() {
    return [...this.videos][0]?.currentTime ?? 0;
  }

  set currentTime(value: number) {
    this.videos.forEach(video => {
      video.currentTime = value;
    });
  }

  get timeUpdateEventInterval() {
    return this._timeUpdateEventInterval;
  }

  set timeUpdateEventInterval(value: number) {
    this._timeUpdateEventInterval = value;
    if (this.timeUpdateLoop) clearInterval(this.timeUpdateLoop);
    this.timeUpdateLoop = null;
    if (value > 0) {
      const emit = () => {
        this.emit('timeUpdate', {
          currentTime: this.currentTime,
          currentLiveTimestamp: 0,
          currentOffsetFromLive: 0,
          bufferedPosition: 0,
        });
      };
      emit();
      this.timeUpdateLoop = setInterval(emit, value * 1000);
    }
  }

  play() {
    this.videos.forEach(safePlay);
  }

  pause() {
    this.videos.forEach(video => video.pause());
  }

  mount(video: HTMLVideoElement) {
    const uri = getUri(this.src);
    video.loop = this.loop;
    video.playsInline = true;
    if (uri) {
      video.src = uri;
      video.load();
    } else {
      video.removeAttribute('src');
      video.load();
    }

    this.videos.add(video);

    video.onplay = () => {
      this.emit('playingChange', { isPlaying: true, oldIsPlaying: this.playing });
      this.playing = true;
    };
    video.onpause = () => {
      this.emit('playingChange', { isPlaying: false, oldIsPlaying: this.playing });
      this.playing = false;
    };
    video.onwaiting = () => {
      if (this.status === 'loading') return;
      const oldStatus = this.status;
      this.status = 'loading';
      this.emit('statusChange', { status: 'loading', oldStatus });
    };
    video.oncanplay = () => {
      const oldStatus = this.status;
      this.status = 'readyToPlay';
      this.emit('statusChange', { status: 'readyToPlay', oldStatus });
      if (this.playing) safePlay(video);
    };
    video.onended = () => {
      this.emit('playToEnd');
    };
    video.onerror = () => {
      const oldStatus = this.status;
      this.status = 'error';
      this.emit('statusChange', {
        status: 'error',
        oldStatus,
        error: { message: video.error?.message ?? 'Unknown player error' },
      });
    };
  }

  unmount(video: HTMLVideoElement) {
    this.videos.delete(video);
  }
}

export function useAppVideoPlayer(
  source: AppVideoSource,
  setup?: (player: AppVideoPlayer) => void,
) {
  return useMemo(() => {
    const player = new AppVideoPlayer(source);
    setup?.(player);
    return player;
  }, [JSON.stringify(source)]);
}
