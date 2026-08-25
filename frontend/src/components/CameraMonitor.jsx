import { useEffect, useRef, useState } from "react";
import { interviewAPI } from "../api/endpoints";

function CameraMonitor({ sessionId, enableProctoring = false, onViolation, onProctorUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const violationTriggeredRef = useRef(false);
  const [cameraReady, setCameraReady] = useState(false);

  // 1. Initialize Webcam Stream
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

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        // Monitor physical hardware disconnects
        stream.getVideoTracks().forEach((track) => {
          track.onended = () => {
            if (onViolation) {
              onViolation("Camera disconnected");
            }
          };
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraReady(true);
      } catch (err) {
        console.error("Camera access denied:", err);
        if (onProctorUpdate) {
          onProctorUpdate({ camera_blocked: true });
        }
        if (!violationTriggeredRef.current && onViolation) {
          violationTriggeredRef.current = true;
          onViolation("Camera access denied");
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      setCameraReady(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // 2. Active Proctoring Analysis Loop
  useEffect(() => {
    if (!enableProctoring || !cameraReady || !sessionId) {
      return;
    }

    let intervalId = null;
    let isMounted = true;

    const startLoop = async () => {
      let frameRateMs = 500; // Default to 500ms (2 FPS)
      try {
        const configRes = await interviewAPI.getProctorConfig();
        if (configRes.data && configRes.data.frame_rate_ms) {
          frameRateMs = configRes.data.frame_rate_ms;
        }
      } catch (err) {
        console.warn("Failed fetching proctoring config, using default 500ms frame rate:", err);
      }

      if (!isMounted) return;

      intervalId = setInterval(() => {
        captureAndSendFrame(sessionId);
      }, frameRateMs);
    };

    startLoop();

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enableProctoring, cameraReady, sessionId]);

  const captureAndSendFrame = async (currSessionId) => {
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

      // Pass the active session ID to tie tracking history on the backend
      const res = await interviewAPI.analyzeFrame(formData, currSessionId);

      console.log("🚨 Proctor Response:", res.data);

      if (onProctorUpdate) {
        onProctorUpdate(res.data);
      }

      // Handle backend-triggered warnings (e.g. invalid frame, multiple faces, etc.)
      if (res.data?.warning) {
        if (onViolation) {
          onViolation(res.data.warning);
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
