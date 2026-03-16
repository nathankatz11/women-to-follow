const X_API_BASE = "https://api.twitterapi.io";

export interface XUserProfile {
  id: string;
  name: string;
  username: string;
  description: string;
  profile_image_url: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface TwitterApiUserResponse {
  status: string;
  data: {
    id: string;
    name: string;
    userName: string;
    description: string;
    profilePicture: string;
    followers: number;
    following: number;
    statusesCount: number;
  };
}

function mapToXUserProfile(data: TwitterApiUserResponse["data"]): XUserProfile {
  return {
    id: data.id,
    name: data.name,
    username: data.userName,
    description: data.description,
    profile_image_url: data.profilePicture,
    public_metrics: {
      followers_count: data.followers,
      following_count: data.following,
      tweet_count: data.statusesCount,
    },
  };
}

export async function lookupXUser(
  handle: string
): Promise<XUserProfile | null> {
  const apiKey = process.env.X_API_KEY;
  if (!apiKey) {
    console.error("X_API_KEY not configured");
    return null;
  }

  const cleanHandle = handle.replace(/^@/, "").trim();

  const res = await fetch(
    `${X_API_BASE}/twitter/user/info?userName=${encodeURIComponent(cleanHandle)}`,
    {
      headers: {
        "X-API-Key": apiKey,
      },
      next: { revalidate: 86400 },
    }
  );

  if (res.status === 429) {
    console.warn("X API rate limit hit");
    return null;
  }

  if (!res.ok) {
    console.error(`X API error: ${res.status}`);
    return null;
  }

  const json: TwitterApiUserResponse = await res.json();
  if (json.status !== "success" || !json.data) {
    return null;
  }

  return mapToXUserProfile(json.data);
}

export async function lookupXUsers(
  handles: string[]
): Promise<Map<string, XUserProfile>> {
  const results = new Map<string, XUserProfile>();

  // TwitterAPI.io doesn't have a batch endpoint, so we fetch in parallel
  const lookups = handles.map(async (handle) => {
    const profile = await lookupXUser(handle);
    if (profile) {
      results.set(profile.username.toLowerCase(), profile);
    }
  });

  await Promise.all(lookups);
  return results;
}

export function getHighResProfileImage(url: string): string {
  // X returns _normal (48x48). Replace with _400x400 for higher res.
  return url.replace("_normal", "_400x400");
}

export function composeTweetUrl(handles: string[]): string {
  const mentions = handles.map((h) => `@${h.replace(/^@/, "")}`).join(" ");
  const text = `I'm nominating 3 #WomenToFollow:\n${mentions}\n\nNominate yours at women-to-follow.com/nominate`;
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
