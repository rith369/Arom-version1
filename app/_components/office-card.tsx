import { ExternalLink } from "lucide-react";
import { mapsLink, type OfficeLocation } from "@/lib/office";

/** Where an in person session happens, with a link that opens the map. */
export function OfficeCard({
  office,
  km,
  className = "",
}: {
  office: OfficeLocation;
  km: boolean;
  className?: string;
}) {
  return (
    <div className={`min-w-0 text-sm text-ink ${className}`}>
      {office.name && <p className="font-semibold">{office.name}</p>}
      <p className="whitespace-pre-line break-words text-ink-muted">{office.address}</p>
      <a
        href={mapsLink(office)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 inline-flex items-center gap-1.5 font-semibold text-arom hover:underline"
      >
        {km ? "បើកក្នុងផែនទី" : "Open in Maps"}
        <ExternalLink aria-hidden="true" size={14} />
        <span className="sr-only">{km ? "(បើកផ្ទាំងថ្មី)" : "(opens in a new tab)"}</span>
      </a>
    </div>
  );
}
