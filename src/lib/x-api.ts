const X_API_BASE = "https://api.x.com/2";

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

export async function lookupXUser(
  handle: string
): Promise<XUserProfile | null> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    console.error("X_BEARER_TOKEN not configured");
    return null;
  }

  const cleanHandle = handle.replace(/^@/, "").trim();

  const res = await fetch(
    `${X_API_BASE}/users/by/username/${encodeURIComponent(cleanHandle)}?user.fields=description,profile_image_url,public_metrics`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
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

  const json = await res.json();
  if (json.errors || !json.data) {
    return null;
  }

  return json.data as XUserProfile;
}

export async function lookupXUsers(
  handles: string[]
): Promise<Map<string, XUserProfile>> {
  const token = process.env.X_BEARER_TOKEN;
  const results = new Map<string, XUserProfile>();

  if (!token) {
    console.error("X_BEARER_TOKEN not configured");
    return results;
  }

  const cleanHandles = handles.map((h) => h.replace(/^@/, "").trim());
  const usernames = cleanHandles.join(",");

  const res = await fetch(
    `${X_API_BASE}/users/by?usernames=${encodeURIComponent(usernames)}&user.fields=description,profile_image_url,public_metrics`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 86400 },
    }
  );

  if (!res.ok) {
    console.error(`X API batch error: ${res.status}`);
    return results;
  }

  const json = await res.json();
  if (json.data) {
    for (const user of json.data) {
      results.set(user.username.toLowerCase(), user);
    }
  }

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
