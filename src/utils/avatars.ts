export interface AvatarOption {
  id: number;
  emoji: string;
  label: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 1, emoji: '🦅', label: 'Eagle' },
  { id: 2, emoji: '🦉', label: 'Owl' },
  { id: 3, emoji: '🦆', label: 'Duck' },
  { id: 4, emoji: '🦢', label: 'Swan' },
  { id: 5, emoji: '🦩', label: 'Flamingo' },
  { id: 6, emoji: '🦚', label: 'Peacock' },
  { id: 7, emoji: '🦜', label: 'Parrot' },
  { id: 8, emoji: '🐧', label: 'Penguin' },
  { id: 9, emoji: '🦤', label: 'Dodo' },
  { id: 10, emoji: '🪶', label: 'Feather' },
];

export const DEFAULT_AVATAR_ID = 1;

export function getAvatar(avatarId: number | null | undefined): AvatarOption {
  return AVATAR_OPTIONS.find((a) => a.id === avatarId) ?? AVATAR_OPTIONS[0];
}

export function getAvatarEmoji(avatarId: number | null | undefined): string {
  return getAvatar(avatarId).emoji;
}
