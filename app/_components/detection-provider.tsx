"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DetectionModal } from "../components/detection-modal";

type DetectionContextType = {
  isDetectionOpen: boolean;
  openDetection: () => void;
  closeDetection: () => void;
};

const DetectionContext = createContext<DetectionContextType>({
  isDetectionOpen: false,
  openDetection: () => {},
  closeDetection: () => {},
});

export function DetectionProvider({ children }: { children: ReactNode }) {
  const [isDetectionOpen, setIsDetectionOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Open modal automatically when directly visiting /detection, otherwise close on route changes
  useEffect(() => {
    if (pathname === "/detection") {
      setIsDetectionOpen(true);
    } else {
      setIsDetectionOpen(false);
    }
  }, [pathname]);

  const openDetection = () => setIsDetectionOpen(true);
  const closeDetection = () => {
    setIsDetectionOpen(false);
    if (pathname === "/detection") {
      router.push("/");
    }
  };

  return (
    <DetectionContext.Provider value={{ isDetectionOpen, openDetection, closeDetection }}>
      {children}
      <DetectionModal isOpen={isDetectionOpen} onClose={closeDetection} />
    </DetectionContext.Provider>
  );
}

export function useDetection() {
  return useContext(DetectionContext);
}
