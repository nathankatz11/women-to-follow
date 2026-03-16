export interface NomineeProfile {
  id: string;
  handle: string;
  name: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  followerCount: number | null;
  isFeatured: boolean | null;
  nominationCount?: number;
  createdAt: Date | null;
}

export interface NominationPayload {
  handles: [string, string, string];
  nominatorHandle?: string;
}

export interface XLookupResult {
  handle: string;
  name: string;
  bio: string;
  profileImageUrl: string;
  followerCount: number;
  found: boolean;
}
