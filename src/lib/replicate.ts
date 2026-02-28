import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export const IMAGE_MODEL = "black-forest-labs/flux-1.1-pro";
export const VIDEO_MODEL = "minimax/video-01";
