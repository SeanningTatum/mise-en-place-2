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
export async function getVideoMetadata(
  videoId: string,
): Promise<VideoMetadata> {
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
    throw new Error(
      `Failed to fetch video metadata: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Decode HTML entities in transcript text
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

/**
 * Extract caption track URL from YouTube video page
 */
async function extractCaptionTrackUrl(videoId: string): Promise<string | null> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const response = await fetch(videoUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch video page: ${response.status}`);
  }

  const html = await response.text();

  // Look for captions in the ytInitialPlayerResponse
  const startMarker = "ytInitialPlayerResponse";
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) {
    log.debug({ videoId }, "No ytInitialPlayerResponse found");
    return null;
  }

  // Find the opening brace and extract JSON using bracket matching
  const jsonStart = html.indexOf("{", startIdx);
  if (jsonStart === -1) {
    log.debug({ videoId }, "No JSON object found after ytInitialPlayerResponse");
    return null;
  }

  let depth = 0;
  let jsonEnd = jsonStart;
  for (let i = jsonStart; i < html.length; i++) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") depth--;
    if (depth === 0) {
      jsonEnd = i + 1;
      break;
    }
  }

  const jsonStr = html.slice(jsonStart, jsonEnd);

  try {
    const playerResponse = JSON.parse(jsonStr);
    const captions =
      playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captions || captions.length === 0) {
      log.debug({ videoId }, "No caption tracks found");
      return null;
    }

    // Prefer English captions, fallback to first available
    const englishTrack = captions.find(
      (track: { languageCode: string }) =>
        track.languageCode === "en" || track.languageCode?.startsWith("en"),
    );
    const track = englishTrack || captions[0];

    log.debug({ videoId, language: track.languageCode }, "Found caption track");
    return track.baseUrl;
  } catch (error) {
    log.error({ error, videoId }, "Failed to parse player response");
    return null;
  }
}

/**
 * Fetch and parse transcript XML from caption track URL
 */
async function fetchTranscriptFromUrl(
  captionUrl: string,
): Promise<TranscriptSegment[]> {
  const response = await fetch(captionUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch captions: ${response.status}`);
  }

  const xml = await response.text();

  // Parse the XML transcript - format: <text start="0.0" dur="3.5">text content</text>
  const segments: TranscriptSegment[] = [];
  const textRegex =
    /<text\s+start="([^"]+)"\s+dur="([^"]+)"[^>]*>([^<]*)<\/text>/g;

  let match;
  while ((match = textRegex.exec(xml)) !== null) {
    const start = parseFloat(match[1]) * 1000; // Convert to milliseconds
    const duration = parseFloat(match[2]) * 1000;
    const text = decodeHtmlEntities(match[3]).trim();

    if (text) {
      segments.push({
        text,
        offset: Math.round(start),
        duration: Math.round(duration),
      });
    }
  }

  return segments;
}

/**
 * Fetch transcript for a YouTube video
 * Uses direct fetch to YouTube's caption system (Cloudflare Workers compatible)
 */
export async function getTranscript(
  videoId: string,
): Promise<TranscriptSegment[]> {
  log.debug({ videoId }, "Fetching YouTube transcript");

  try {
    // Extract caption track URL from video page
    const captionUrl = await extractCaptionTrackUrl(videoId);

    if (!captionUrl) {
      log.warn({ videoId }, "No captions available for video");
      return [];
    }

    // Fetch and parse the transcript
    const segments = await fetchTranscriptFromUrl(captionUrl);

    log.info(
      { videoId, segmentCount: segments.length },
      "Transcript fetched successfully",
    );
    return segments;
  } catch (error) {
    log.error({ error, videoId }, "Failed to fetch transcript");
    throw new Error(
      `Failed to fetch transcript: ${error instanceof Error ? error.message : "Unknown error"}. The video may not have captions available.`,
    );
  }
}

/**
 * Combine transcript segments into coherent text with timestamps
 * Format: [MM:SS] text
 */
export function formatTranscriptWithTimestamps(
  segments: TranscriptSegment[],
): string {
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
export async function fetchYouTubeVideoData(
  url: string,
): Promise<YouTubeVideoData> {
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
    "YouTube video data fetched successfully",
  );

  return {
    videoId,
    metadata,
    transcript,
    transcriptSegments,
  };
}
