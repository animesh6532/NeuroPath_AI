import { useEffect, useRef } from "react";
import axios from "axios";

function CameraMonitor({ onViolation }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const violationTriggeredRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!isMounted) return;

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        intervalRef.current = setInterval(() => {
          if (!violationTriggeredRef.current) {
            captureAndSendFrame();
          }
        }, 2000);
      } catch (err) {
        console.error("Camera access denied:", err);
        if (!violationTriggeredRef.current && onViolation) {
          violationTriggeredRef.current = true;
          onViolation("Camera access denied");
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;

      if (intervalRef.current) clearInterval(intervalRef.current);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureAndSendFrame = async () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;
      if (video.readyState !== 4) return;

      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.8)
      );

      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      const res = await axios.post(
        "http://127.0.0.1:8001/proctoring/analyze-frame",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("🚨 Proctor Response:", res.data);

      if (res.data?.violation === true && !violationTriggeredRef.current) {
        violationTriggeredRef.current = true;

        // Stop camera immediately
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        if (onViolation) {
          onViolation(res.data.reason || "Suspicious activity detected");
        }
      }
    } catch (err) {
      console.error("Frame analysis error:", err);
    }
  };

  return (
    <div className="camera-monitor">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="camera-video"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default CameraMonitor;