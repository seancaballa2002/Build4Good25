"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import styles from "./page.module.css";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          //Fix: Ensure video actually plays
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };

          setHasPermission(true);
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    }

    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        setIsCameraActive(false);
      }
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Take a Photo of the Problem</h1>
      </header>

      <main className={styles.main}>
        {hasPermission === false && (
          <div className={styles.permissionDenied}>
            <p>Camera access denied. Please allow camera access to use this feature.</p>
          </div>
        )}

        <div className={styles.cameraContainer}>
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className={styles.cameraView}
        />
        {hasPermission === true && (
            <div className={styles.cameraControls}>
            <button className={styles.captureButton}>
                <Camera size={24} />
            </button>
            </div>
        )}
        </div>


        {hasPermission === null && (
          <div className={styles.loading}>
            <p>Requesting camera access...</p>
          </div>
        )}
      </main>
    </div>
  );
}
