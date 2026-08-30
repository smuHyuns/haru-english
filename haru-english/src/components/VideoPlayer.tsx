import { useEffect } from 'react';

import { videoMeta, youtubeEmbedUrl, youtubeWatchUrl, type Video } from '@/data/types';

import IconButton from './IconButton';
import { Close } from './icons';
import styles from './VideoPlayer.module.css';

type Props = {
  video: Video;
  onClose: () => void;
};

/**
 * 유튜브 재생 오버레이.
 *
 * IFrame Player API 대신 그냥 iframe 을 쓴다. 재생/일시정지 같은 걸 앱이 제어할 일이
 * 없고, API 는 www.youtube.com 에서 스크립트를 받아와야 해서 오프라인 셸과 안 맞는다.
 *
 * youtube-nocookie.com 을 쓴다 — 재생 전에는 추적 쿠키를 심지 않는다.
 */
export default function VideoPlayer({ video, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 오버레이가 떠 있는 동안 뒤 목록이 스크롤되지 않게 잠근다
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={video.title}>
      <div className={styles.bar}>
        {/* 열리자마자 닫기 버튼으로 포커스를 옮긴다.
            안 그러면 포커스가 뒤 목록에 남아 스크린리더가 가려진 목록을 계속 읽는다. */}
        <IconButton autoFocus label="닫기" tone="plainFill" size={48} onClick={onClose}>
          <Close size={20} />
        </IconButton>
      </div>

      <div className={styles.stage}>
        {video.youtubeId ? (
          <iframe
            className={styles.frame}
            src={youtubeEmbedUrl(video.youtubeId)}
            title={video.title}
            /* accelerometer·gyroscope 는 넣지 않는다 — 이 앱엔 360° 영상이 없다 */
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p className={styles.missing}>재생할 수 없는 영상이에요.</p>
        )}
      </div>

      <div className={styles.info}>
        <h2 className={styles.title}>{video.title}</h2>
        <p className={styles.meta}>{videoMeta(video)}</p>
        {video.youtubeId && (
          /*
           * 임베드를 막아 둔 영상이 섞여 있을 수 있다(채널 설정). 그 경우 위 iframe 은
           * 유튜브 오류 화면을 띄우므로, 앱 밖에서 볼 수 있는 길을 항상 같이 둔다.
           */
          <a
            className={styles.external}
            href={youtubeWatchUrl(video.youtubeId)}
            target="_blank"
            rel="noreferrer noopener"
          >
            유튜브 앱에서 보기
          </a>
        )}
      </div>
    </div>
  );
}
