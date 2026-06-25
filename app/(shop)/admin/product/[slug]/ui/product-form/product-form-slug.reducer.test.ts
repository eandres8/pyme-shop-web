import {
  slugReducer,
  initialSlugState,
  type SlugState,
  type SlugAction,
} from './product-form-slug.reducer';

describe('slugReducer', () => {
  it('CHECKING transitions to checking status', () => {
    const result = slugReducer(initialSlugState, { type: 'CHECKING' });

    expect(result).toEqual({ status: 'checking', error: null });
  });

  it('AVAILABLE transitions to available status', () => {
    const state: SlugState = { status: 'checking', error: null };
    const result = slugReducer(state, { type: 'AVAILABLE' });

    expect(result).toEqual({ status: 'available', error: null });
  });

  it('TAKEN transitions to taken status with error message', () => {
    const state: SlugState = { status: 'checking', error: null };
    const result = slugReducer(state, { type: 'TAKEN', message: 'Este slug ya está en uso' });

    expect(result).toEqual({ status: 'taken', error: 'Este slug ya está en uso' });
  });

  it('ERROR transitions to idle status with error message', () => {
    const state: SlugState = { status: 'checking', error: null };
    const result = slugReducer(state, { type: 'ERROR', message: 'Error de conexión' });

    expect(result).toEqual({ status: 'idle', error: 'Error de conexión' });
  });

  it('RESET returns to initial state', () => {
    const state: SlugState = { status: 'taken', error: 'Some error' };
    const result = slugReducer(state, { type: 'RESET' });

    expect(result).toEqual({ status: 'idle', error: null });
  });

  it('returns same state for unknown action', () => {
    const state: SlugState = { status: 'available', error: null };
    const result = slugReducer(state, { type: 'UNKNOWN' } as SlugAction);

    expect(result).toBe(state);
  });

  it('initial state has idle status and null error', () => {
    expect(initialSlugState).toEqual({ status: 'idle', error: null });
  });
});
