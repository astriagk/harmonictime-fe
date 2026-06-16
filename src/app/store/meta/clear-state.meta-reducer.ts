import { ActionReducer } from '@ngrx/store';
import { AppState } from '../app.state';
import { logout } from '../actions/user.actions';

export function clearState(
  reducer: ActionReducer<AppState>,
): ActionReducer<AppState> {
  return (state, action) => {
    if (action.type === logout.type) {
      state = undefined; // every slice falls back to its initialState
    }
    return reducer(state, action);
  };
}
