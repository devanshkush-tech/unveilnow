import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackMetaEvent } from "@/lib/metaCapi";

/**
 * Fires Meta Pixel + CAPI PageView on every SPA route change, with a stable
 * event_id so browser pixel and server event are deduplicated by Meta.
 */
export const MetaPageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const id = `pv_${location.pathname}${location.search}_${Date.now()}`;
    trackMetaEvent("PageView", {
      event_id: id,
      custom_data: { content_name: location.pathname },
    });
  }, [location.pathname, location.search]);

  return null;
};
