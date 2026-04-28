import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Pause, Play } from "lucide-react";

export const VoicePlayer = ({ path }: { path: string | null | undefined }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.storage
        .from("voice-intros")
        .createSignedUrl(path, 60 * 60);
      if (!cancelled && data?.signedUrl) setUrl(data.signedUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!path) return null;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!url}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-romance text-primary-foreground text-sm shadow-soft hover:shadow-elegant transition-all disabled:opacity-60"
    >
      {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      <Mic className="h-3.5 w-3.5" />
      Voice intro
      {url && (
        <audio
          ref={audioRef}
          src={url}
          onEnded={() => setPlaying(false)}
          preload="none"
        />
      )}
    </button>
  );
};
