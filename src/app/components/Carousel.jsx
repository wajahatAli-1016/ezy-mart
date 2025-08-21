"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

export default function Carousel({ images }) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={1}
      pagination={{ clickable: true }}
      autoplay={{ delay: 2000 }}
      loop={true}
      style={{ width: "100%",maxWidth:"1200px", margin: "auto" }}
    >
      {images.map((img, i) => (
        <SwiperSlide key={i}>
          <img
            src={img}
            alt={`Slide ${i + 1}`}
            style={{ width: "100%", borderRadius: "10px", height: "42vh" }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
