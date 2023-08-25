import React, { useState, useRef, useEffect } from "react";
import "./styles.scss";
import { RootState, useAppSelector } from "../../store/store";

export interface IPlayerProps {
  currentSongIndex: number;
  setCurrentSongIndex: any;
  songs: any;
}

const Player = ({
  currentSongIndex,
  setCurrentSongIndex,
  songs,
}: IPlayerProps) => {
  const data = useAppSelector((state: RootState) => state.volume);
  const { volumeValue } = data;

  const audioElement = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [songDuration, setSongDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false); // New state for shuffle

  const handleSongEnd = () => {
    setCurrentSongIndex((prevIndex: number) => (prevIndex + 1) % songs.length);
  };

  useEffect(() => {
    if (isPlaying) {
      audioElement.current!.play();
    } else {
      audioElement.current!.pause();
    }
    if (audioElement.current) {
      audioElement.current.addEventListener("ended", handleSongEnd);
      audioElement.current.volume = volumeValue / 100;
      audioElement.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioElement.current!.currentTime);
      });
      audioElement.current.addEventListener("loadedmetadata", () => {
        setSongDuration(audioElement.current!.duration);
      });
    }

    return () => {
      if (audioElement.current) {
        audioElement.current.removeEventListener("ended", handleSongEnd);
        audioElement.current.removeEventListener("timeupdate", () => {
          setCurrentTime(audioElement.current!.currentTime);
        });
        audioElement.current.removeEventListener("loadedmetadata", () => {
          setSongDuration(audioElement.current!.duration);
        });
      }
    };
  }, [currentSongIndex, isPlaying, volumeValue]);

  return (
    <div className="music-player">
      <audio loop src={songs[currentSongIndex].src} ref={audioElement}></audio>
      <div className="shuffle"><button
          className={`shuffle-btn ${isShuffle ? "active" : ""}`} // Add active class if shuffle is active
          onClick={() => setIsShuffle(!isShuffle)} // Toggle shuffle mode
        >
          <i className="fa-solid fa-shuffle fa-2xl"></i>
        </button></div>
      
      <div className="music-player--controls">
      
        <button
          className="skip-btn"
          onClick={() =>
            setCurrentSongIndex(
              (prevIndex: number) => (prevIndex - 1 + songs.length) % songs.length
            )
          }
        >
          <img src="/assets/icons/prev.svg" alt="" />
        </button>
        <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? (
            <img src="/assets/icons/pause.svg" alt="" />
          ) : (
            <img src="/assets/icons/play.svg" alt="" />
          )}
        </button>
        
        <button
          className="skip-btn"
          onClick={() => {
            if (isShuffle) {
              const randomIndex = Math.floor(Math.random() * songs.length);
              setCurrentSongIndex(randomIndex);
            } else {
              setCurrentSongIndex(
                (prevIndex: number) => (prevIndex + 1) % songs.length
              );
            }
          }}
        >
          <img src="/assets/icons/next.svg" alt="" />
        </button>
      </div>
      <div className="song-duration">
        <span>{formatTime(currentTime)}</span> /{" "}
        <span>{formatTime(songDuration)}</span>
      </div>
    </div>
  );
};

export default Player;

function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
