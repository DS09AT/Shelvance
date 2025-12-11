import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import AppState from 'App/State/AppState';

export type AppDispatch = ThunkDispatch<AppState, undefined, Action>;
