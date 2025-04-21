import React, { useRef, useEffect } from "react";

const VideoPlayer = ({ stream, muted, width = "400px", height = "300px" }) => {
  const videoRef = useRef(null);

  useEffect(() => {

    const video = videoRef.current;

    if (video && stream) {
      video.srcObject = stream;
    }

    // Only try to play *after* metadata is loaded
    const handleLoadedMetadata = () => {
      console.log("✅ Video metadata loaded");
      video.play().then(() => {
        console.log("🎥 Video playing");
      }).catch((err) => {
        console.error("⚠️ Video play error:", err);
      });
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      onLoadedMetadata={() => console.log("🎉 Video metadata loaded")}
      onCanPlay={() => console.log("✅ Video can play")}
      muted={muted}
      style={{ width, height, backgroundColor: "#000", borderRadius: "8px" }}
    />
  );
};


export default VideoPlayer
