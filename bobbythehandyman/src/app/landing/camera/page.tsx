"use client";

import { createClient } from "@supabase/supabase-js";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import styles from "./page.module.css";

// 👇 Supabase config
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);

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
      if (videoRef.current?.srcObject) {

        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        setIsCameraActive(false);
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const fileName = `photo-${Date.now()}.jpg`.replace(/[^a-zA-Z0-9.\-_]/g, "_");

      setIsUploading(true);
      const { data, error } = await supabase.storage
        .from("bobby-bucket")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
        });
      setIsUploading(false);

      if (error) {
        console.error("Upload error:", error.message);
        return;
      }

      const publicURL = supabase.storage
        .from("bobby-bucket")
        .getPublicUrl(data?.path ?? "").data.publicUrl;

      console.log("Uploaded photo:", data);
      console.log("Public photo URL:", publicURL);

      setUploadedURL(publicURL);
    }, "image/jpeg");
  };

  const handleBack = () => router.back();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Take a Photo of the Problem</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.cameraContainer}>
          <video ref={videoRef} autoPlay playsInline className={styles.cameraView} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className={styles.cameraControls}>
            <button onClick={handleCapture} className={styles.captureButton}>
              {isUploading ? "Uploading..." : <Camera size={24} />}
            </button>
          </div>
        </div>

        {uploadedURL && (
          <div className={styles.uploadPreview}>
            <p>✅ Upload successful!</p>
            <a href={uploadedURL} target="_blank" rel="noopener noreferrer">
              View Uploaded Photo
            </a>
            <img src={uploadedURL} alt="Uploaded" className={styles.previewImage} />

          </div>
        )}
      </main>
    </div>
  );
}
