export type BlackHoleImage = {
  title: string;
  url: string;
  credit: string;
  sourcePage: string;
  caption: string;
};

// Verified working direct image URLs (checked 200 + image/jpeg).
export const REAL_BLACK_HOLE_IMAGES: BlackHoleImage[] = [
  {
    title: "M87* — the first-ever black hole image (2019)",
    url: "https://assets.science.nasa.gov/content/dam/science/cds/apod/apod/2022/may/M87bh_EHT_2629.jpg",
    credit: "Event Horizon Telescope Collaboration",
    sourcePage:
      "https://science.nasa.gov/image-article/apod-2022-may-1-first-horizon-scale-image-of-a-black-hole/",
    caption:
      "The supermassive black hole at the center of galaxy M87, 55 million light-years away — the first black hole ever directly imaged, by a global network of radio telescopes.",
  },
  {
    title: "Sagittarius A* — our galaxy's black hole (2022)",
    url: "https://nsf-gov-resources.nsf.gov/styles/_inline_image_full_width/s3/2022-05/EHT%20hero%20image_2.jpg?itok=Iz3q_9oD",
    credit: "EHT Collaboration",
    sourcePage:
      "https://www.nsf.gov/science-matters/image-sgr-black-hole-center-our-galaxy",
    caption:
      "Sagittarius A*, the 4-million-solar-mass supermassive black hole at the center of the Milky Way, imaged by the Event Horizon Telescope.",
  },
];
