import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const MAX_SEC = 20;
const MIN_SEC = 5;

export const VoiceRecorder = ({
  existingPath,
  onUploaded,
  onCleared,
}: {
  existingPath?: string | null;
  onUploaded: (path: string) => void;
  onCleared?: () => void;
}) => {
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      recRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const b = new Blob(chunksRef.current, { type: "audio/webm" });
        setBlob(b);
        setPreviewUrl(URL.createObjectURL(b));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SEC) {
            stop();
            return MAX_SEC;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error("Couldn't access your microphone.");
    }
  };

  const stop = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    recRef.current?.stop();
    setRecording(false);
  };

  const reset = () => {
    setBlob(null);
    setPreviewUrl(null);
    setSeconds(0);
  };

  const upload = async () => {
    if (!blob || !user) return;
    if (seconds > 0 && seconds < MIN_SEC) {
      toast.error(`Recordings should be at least ${MIN_SEC} seconds.`);
      return;
    }
    setUploading(true);
    try {
      const path = `${user.id}/intro-${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from("voice-intros")
        .upload(path, blob, { contentType: "audio/webm", upsert: true });
      if (error) throw error;
      onUploaded(path);
      toast.success("Voice intro saved.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't upload voice.");
    } finally {
      setUploading(false);
    }
  };

  const clearExisting = async () => {
    if (!existingPath) return;
    await supabase.storage.from("voice-intros").remove([existingPath]);
    onCleared?.();
    toast("Voice intro removed.");
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-romance flex items-center justify-center">
            <Mic className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-lg leading-tight">Voice intro</p>
            <p className="text-xs text-muted-foreground">5–20 seconds. Let people hear your vibe.</p>
          </div>
        </div>
        {recording && (
          <span className="text-sm tabular-nums text-primary font-medium">
            ● {seconds}s / {MAX_SEC}s
          </span>
        )}
      </div>

      {existingPath && !blob && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/60">
          <span className="text-sm text-muted-foreground">A voice intro is saved.</span>
          <Button variant="ghost" size="sm" onClick={clearExisting}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </Button>
        </div>
      )}

      {previewUrl && (
        <audio src={previewUrl} controls className="w-full rounded-xl" />
      )}

      <div className="flex flex-wrap gap-2">
        {!recording && !blob && (
          <Button onClick={start} variant="soft" className="rounded-full">
            <Mic className="h-4 w-4" /> Record
          </Button>
        )}
        {recording && (
          <Button onClick={stop} variant="hero" className="rounded-full">
            <Square className="h-4 w-4" /> Stop
          </Button>
        )}
        {blob && !recording && (
          <>
            <Button onClick={upload} disabled={uploading} variant="hero" className="rounded-full">
              <Upload className="h-4 w-4" /> {uploading ? "Saving…" : "Save"}
            </Button>
            <Button onClick={reset} variant="ghost" className="rounded-full">
              <Trash2 className="h-4 w-4" /> Discard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
