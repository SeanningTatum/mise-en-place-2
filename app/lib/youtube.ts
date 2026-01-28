import { YoutubeTranscript } from "youtube-transcript";
import { createLayerLogger } from "./logger";

const log = createLayerLogger("server");

export interface TranscriptSegment {
  text: string;
  offset: number; // milliseconds
  duration: number; // milliseconds
}

export interface VideoMetadata {
  title: string;
  author: string;
  thumbnailUrl: string;
}

export interface YouTubeVideoData {
  videoId: string;
  metadata: VideoMetadata;
  transcript: string;
  transcriptSegments: TranscriptSegment[];
}

/**
 * Parse a YouTube URL and extract the video ID
 * Supports various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID (mobile)
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 */
export function parseYouTubeUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove www. and m. prefixes for consistent matching
    const hostname = urlObj.hostname.replace(/^(www\.|m\.)/i, "");

    if (hostname === "youtube.com") {
      // Standard watch URL
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }
      // Embed URL
      if (urlObj.pathname.startsWith("/embed/")) {
        return urlObj.pathname.split("/embed/")[1]?.split("?")[0] || null;
      }
      // Old-style URL
      if (urlObj.pathname.startsWith("/v/")) {
        return urlObj.pathname.split("/v/")[1]?.split("?")[0] || null;
      }
      // Shorts URL
      if (urlObj.pathname.startsWith("/shorts/")) {
        return urlObj.pathname.split("/shorts/")[1]?.split("?")[0] || null;
      }
      // Live URL
      if (urlObj.pathname.startsWith("/live/")) {
        return urlObj.pathname.split("/live/")[1]?.split("?")[0] || null;
      }
    }

    if (hostname === "youtu.be") {
      // Short URL
      return urlObj.pathname.slice(1).split("?")[0] || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is a valid YouTube video URL
 */
export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeUrl(url) !== null;
}

/**
 * Fetch video metadata using YouTube oEmbed API
 * This doesn't require an API key
 */
export async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  log.debug({ videoId }, "Fetching YouTube video metadata");

  const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    const response = await fetch(oEmbedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const data = (await response.json()) as {
      title: string;
      author_name: string;
      thumbnail_url: string;
    };

    return {
      title: data.title,
      author: data.author_name,
      thumbnailUrl: data.thumbnail_url,
    };
  } catch (error) {
    log.error({ error, videoId }, "Failed to fetch video metadata");
    throw new Error(`Failed to fetch video metadata: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Fetch transcript for a YouTube video
 */
export async function getTranscript(videoId: string): Promise<TranscriptSegment[]> {
  log.debug({ videoId }, "Fetching YouTube transcript");

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    const segments: TranscriptSegment[] = transcript.map((segment) => ({
      text: segment.text,
      offset: Math.round(segment.offset),
      duration: Math.round(segment.duration),
    }));

    log.info({ videoId, segmentCount: segments.length }, "Transcript fetched successfully");
    return segments;
  } catch (error) {
    log.error({ error, videoId }, "Failed to fetch transcript");
    throw new Error(
      `Failed to fetch transcript: ${error instanceof Error ? error.message : "Unknown error"}. The video may not have captions available.`
    );
  }
}

/**
 * Combine transcript segments into coherent text with timestamps
 * Format: [MM:SS] text
 */
export function formatTranscriptWithTimestamps(segments: TranscriptSegment[]): string {
  return segments
    .map((segment) => {
      const totalSeconds = Math.floor(segment.offset / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const timestamp = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      return `[${timestamp}] ${segment.text}`;
    })
    .join("\n");
}

/**
 * Fetch all YouTube video data (metadata + transcript)
 */
export async function fetchYouTubeVideoData(url: string): Promise<YouTubeVideoData> {
  const startTime = Date.now();
  log.info({ url }, "Fetching YouTube video data");

  const videoId = parseYouTubeUrl(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // Fetch metadata and transcript in parallel
  const [metadata, transcriptSegments] = await Promise.all([
    getVideoMetadata(videoId),
    getTranscript(videoId),
  ]);

  const transcript = formatTranscriptWithTimestamps(transcriptSegments);

  const durationMs = Date.now() - startTime;
  log.info(
    { videoId, durationMs, transcriptLength: transcript.length },
    "YouTube video data fetched successfully"
  );

  return {
    videoId,
    metadata,
    transcript,
    transcriptSegments,
  };
}
