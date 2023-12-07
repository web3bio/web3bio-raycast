export interface Profile {
    address: string;
    avatar: string | null;
    description: string | null;
    platform: string;
    displayName: string | null;
    email: string | null;
    header: string | null;
    identity: string;
    location: string | null;
    error?: string;
    links: Record<
      string,
      {
        link: string;
        handle: string;
      }
    >;
  }