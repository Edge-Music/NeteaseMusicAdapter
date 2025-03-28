type PlaylistType = 'normal' | 'album' | 'dj' | 'artist';

interface Playlist {
  id: id;
  name?: string;
  cover?: string;
  size?: number;
  creator?: User;
  songs?: Song[];
  type?: PlaylistType;
  description?: string;
  meta?: {
    [key: string]: any;
  }
}
