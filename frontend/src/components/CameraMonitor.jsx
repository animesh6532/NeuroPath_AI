import { useEffect, useRef, useState } from "react";

function CameraMonitor({ onViolation }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        // 🔍 List available devices (debug purpose)
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        console.log("Available Cameras:", videoDevices);

        // 🎥 Force laptop/front camera
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
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setCameraReady(true);
          };
        }

        // 📡 Send frames every 3 seconds to backend OpenCV
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || !cameraReady) return;

          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(async (blob) => {
            if (!blob) return;

            const formData = new FormData();
            formData.append("file", blob, "frame.jpg");

            try {
              const response = await fetch(
                "http://127.0.0.1:8001/proctoring/analyze-events",
                {
                  method: "POST",
                  body: formData,
                }
              );

              const data = await response.json();
              console.log("Proctoring Result:", data);

              if (data.violation) {
                alert("Interview stopped: " + data.reason);
                onViolation?.(data.reason);
              }
            } catch (err) {
              console.error("Backend proctoring error:", err);
            }
          }, "image/jpeg");
        }, 3000);
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Camera access denied or not available.");
        onViolation?.("Camera denied");
      }
    };

    startCamera();

    return () => {
      isMounted = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraReady, onViolation]);

  return (
    <div className="camera-monitor-wrapper">
      {cameraError ? (
        <div className="camera-error">
          <p>❌ {cameraError}</p>
          <p>Please allow laptop webcam access in your browser.</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-preview"
        />
      )}
    </div>
  );
}

export default CameraMonitor;