export type ApodResponse = {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  date: string;
  copyright?: string;
};

const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || "DEMO_KEY";

export async function fetchApod(): Promise<ApodResponse> {
  const res = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`APOD request failed: ${res.status}`);
  }
  return res.json();
}
