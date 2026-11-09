// Монгол Улсын хил (Natural Earth 1:50m, нийтийн өмч) — газрын зургийн
// зураг нь public/mongolia-map.svg (хил + цэгэн тор, статик тул кэшлэгдэнэ).
// Энд зөвхөн тэр зурагтай ижил проекцоор координат бодох хэсэг байна.
// Equirectangular проекц, ~47°N дээр жинхэнэ масштабтай.
export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 492;

// Өргөрөг/уртраг → газрын зургийн координат (public/mongolia-map.svg-тэй ижил).
export function project(lat, lng) {
  return {
    x: 12 + (lng - 87.741877) * 30.352485,
    y: 12 + (52.117187 - lat) * 44.505218,
  };
}
