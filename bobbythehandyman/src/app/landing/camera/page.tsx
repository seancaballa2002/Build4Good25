"use client";

import { createClient } from "@supabase/supabase-js";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlignCenter, ArrowLeft, Camera } from "lucide-react";
import styles from "./page.module.css";

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
  const [imageDescription, setImageDescription] = useState<string | null>(null);
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

      const fileName = `photo-${Date.now()}.jpg`;

      setIsUploading(true);
      const { data, error } = await supabase.storage
        .from("bobby-bucket")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
        });
      setIsUploading(false);

      if (error || !data) {
        console.error("❌ Upload error:", error?.message);
        return;
      }

      // ✅ Get public URL
      const { publicUrl } = supabase.storage
        .from("bobby-bucket")
        .getPublicUrl(data.path).data;

      // ✅ Groq expects a direct .jpg URL
      if (!/^https?:\/\/.+\.(jpg|jpeg|png)$/i.test(publicUrl)) {
        console.error("❌ Invalid image URL format:", publicUrl);
        alert("The image URL format is invalid for Groq.");
        return;
      }

      setUploadedURL(publicUrl);

      try {
        const response = await fetch("/api/describe_image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: publicUrl }),
        });

        if (!response.ok) {
          throw new Error("Groq API returned an error");
        }

        const result = await response.json();
        setImageDescription(result.description);

        // ✅ Save both image and description to Supabase
        const { error: dbError } = await supabase.from("requests").insert([
          {
            image_url: publicUrl,
            description: result.description,
          },
        ]);

        if (dbError) console.error("❌ Error saving to DB:", dbError.message);
      } catch (err) {
        console.error("❌ Failed to describe or save image:", err);
      }
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
  <div className="mt-6 p-4 bg-[#2c3e50] rounded-xl text-white text-center shadow-lg max-w-xl mx-auto space-y-4">
    <div className="text-green-400 font-semibold text-lg">✅ Upload successful!</div>

    {imageDescription && (
      <p className="text-base italic">
        <span className="font-medium">Description:</span> {imageDescription}
      </p>
    )}

    <a
      href={uploadedURL}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-300 underline"
    >
      View Uploaded Photo
    </a>

    <img
      src={uploadedURL}
      alt="Uploaded"
      className="rounded-lg shadow-md mx-auto w-full max-w-md border border-gray-700"
    />
  </div>
)}
      </main>
    </div>
  );
}
