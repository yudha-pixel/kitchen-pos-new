'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Camera, RotateCcw, AlertCircle, Video } from 'lucide-react';

interface AttendanceCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photo: string) => void;
  title: string;
  children?: React.ReactNode;
}

export function AttendanceCameraModal({ isOpen, onClose, onCapture, title, children }: AttendanceCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    if (isOpen) {
      enumerateDevices();
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const enumerateDevices = async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Load saved preference or select first device
      const savedDeviceId = localStorage.getItem('preferredCameraId');
      if (savedDeviceId && videoDevices.find(d => d.deviceId === savedDeviceId)) {
        setSelectedDeviceId(savedDeviceId);
      } else if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      stopCamera();
      
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId 
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: facingMode }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Akses kamera ditolak. Mohon izinkan akses kamera pada pengaturan browser Anda untuk melanjutkan absensi.');
        } else if (err.name === 'NotFoundError') {
          setError('Tidak ada kamera ditemukan di perangkat ini.');
        } else if (err.name === 'NotReadableError') {
          setError('Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain dan coba lagi.');
        } else {
          setError('Tidak dapat mengakses kamera: ' + err.message);
        }
      } else {
        setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      const nextDevice = devices[nextIndex];
      setSelectedDeviceId(nextDevice.deviceId);
      localStorage.setItem('preferredCameraId', nextDevice.deviceId);
      startCamera();
    } else {
      // Fallback for mobile: flip facing mode
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
      startCamera();
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    localStorage.setItem('preferredCameraId', deviceId);
    startCamera();
  };

  const handleRetry = () => {
    setError(null);
    startCamera();
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoData = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(photoData);
      }
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      setCapturedPhoto(null);
      stopCamera();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {children}
          {error ? (
            <div className="flex flex-col items-center gap-4 p-6 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-12 w-12 text-red-600" />
              <div className="text-center text-sm text-red-800">
                <p className="font-medium text-lg">Error Kamera</p>
                <p className="mt-2">{error}</p>
                <p className="mt-2 text-xs text-red-600">
                  Tips: Klik ikon gembok di address bar browser dan izinkan akses kamera
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera Device Selector */}
              {devices.length > 1 && (
                <div className="flex items-center gap-3">
                  <Video className="h-4 w-4 text-gray-600" />
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {devices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Kamera ${devices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={switchCamera}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Ganti Kamera"
                  >
                    <RotateCcw className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              )}

              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Captured photo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex justify-center gap-4">
                {capturedPhoto ? (
                  <>
                    <button
                      onClick={handleRetake}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="h-5 w-5" />
                      Foto Ulang
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Konfirmasi
                    </button>
                  </>
                ) : (
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                    Ambil Foto
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
