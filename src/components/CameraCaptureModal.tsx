import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type CameraCaptureModalProps = {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
};

export function CameraCaptureModal({ onCapture, onClose }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function startCamera() {
      setLoading(true);
      setError(null);

      // Stop any existing stream tracks first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported by your browser.');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setLoading(false);
      } catch (err: unknown) {
        if (isCancelled) return;
        setLoading(false);
        const message =
          err instanceof Error
            ? err.name === 'NotAllowedError'
              ? 'Camera permission was denied. Please allow camera access in your browser settings.'
              : err.message
            : 'Could not access camera.';
        setError(message);
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    onCapture(dataUrl);
    onClose();
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <motion.div
      className="camera-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="camera-modal-sheet"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="camera-modal-header">
          <div>
            <span className="eyebrow">
              <Camera size={13} /> LIVE IN-STORE FIT SCAN
            </span>
            <h3>Fit Silhouette Calibration</h3>
          </div>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Close camera">
            <X size={18} />
          </button>
        </div>

        <div className="camera-preview-container">
          {loading && (
            <div className="camera-status-overlay">
              <div className="pulse-dot" />
              <span>Starting camera feed…</span>
            </div>
          )}

          {error ? (
            <div className="camera-error-view">
              <AlertCircle size={32} color="#b34a58" />
              <h4>Camera Unavailable</h4>
              <p>{error}</p>
              <button
                className="button primary"
                onClick={() => setFacingMode((prev) => (prev === 'user' ? 'user' : 'user'))}
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`camera-video-stream ${facingMode === 'user' ? 'mirrored' : ''}`}
              />
              <div className="silhouette-guide">
                <div className="silhouette-frame" />
                <span className="guide-text">Align your shoulders & torso within frame</span>
              </div>
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="camera-modal-controls">
          <button
            type="button"
            className="button ghost"
            onClick={toggleCamera}
            disabled={Boolean(error) || loading}
            aria-label="Switch camera"
          >
            <RefreshCw size={15} /> Switch Camera
          </button>
          <button
            type="button"
            className="button primary"
            onClick={handleCapture}
            disabled={Boolean(error) || loading}
          >
            <Camera size={16} /> Snap & Analyze Fit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
