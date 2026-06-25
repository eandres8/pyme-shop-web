export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

export type SlugState = {
  status: SlugStatus;
  error: string | null;
};

export type SlugAction =
  | { type: 'CHECKING' }
  | { type: 'AVAILABLE' }
  | { type: 'TAKEN'; message: string }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

export const initialSlugState: SlugState = {
  status: 'idle',
  error: null,
};

export function slugReducer(state: SlugState, action: SlugAction): SlugState {
  switch (action.type) {
    case 'CHECKING':
      return { status: 'checking', error: null };
    case 'AVAILABLE':
      return { status: 'available', error: null };
    case 'TAKEN':
      return { status: 'taken', error: action.message };
    case 'ERROR':
      return { status: 'idle', error: action.message };
    case 'RESET':
      return { status: 'idle', error: null };
    default:
      return state;
  }
}
