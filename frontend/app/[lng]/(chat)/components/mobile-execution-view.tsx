"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChatPanel } from "./left-panel/chat-panel";
import { ArtifactsPanel } from "./center-panel/artifacts-panel";
import { StatusPanel } from "./right-panel/status-panel";
import type { ExecutionSession } from "../model/execution-types";
import { useT } from "@/app/i18n/client";

interface MobileExecutionViewProps {
  session: ExecutionSession | null;
}

export function MobileExecutionView({ session }: MobileExecutionViewProps) {
  const { t } = useT("translation");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const swiperRef = React.useRef<SwiperType | null>(null);

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Main swiper content - takes available height */}
      <div className="flex-1 min-h-0">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            renderBullet: (index: number, className: string) => {
              const titles = [
                t("mobile.chat"),
                t("mobile.artifacts"),
                t("mobile.status"),
              ];
              return `<span class="${className}">${titles[index]}</span>`;
            },
          }}
          className="h-full"
          style={{
            paddingBottom: "48px", // Space for pagination
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          <SwiperSlide className="h-full">
            <div
              className={`h-full ${activeIndex === 0 ? "bg-background" : "bg-muted/50"}`}
            >
              <ChatPanel session={session} />
            </div>
          </SwiperSlide>
          <SwiperSlide className="h-full">
            <div
              className={`h-full ${activeIndex === 1 ? "bg-background" : "bg-muted/50"}`}
            >
              <ArtifactsPanel artifacts={session?.state_patch.artifacts} />
            </div>
          </SwiperSlide>
          <SwiperSlide className="h-full">
            <div
              className={`h-full ${activeIndex === 2 ? "bg-background" : "bg-muted/50"}`}
            >
              <StatusPanel
                statePatch={session?.state_patch}
                progress={session?.progress}
                currentStep={session?.state_patch.current_step}
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
