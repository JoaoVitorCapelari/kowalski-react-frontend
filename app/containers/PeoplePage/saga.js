import { takeEvery, call, put } from 'redux-saga/effects';
import { fromJS } from 'immutable';

import {
  reset,
  stopSubmit,
  startSubmit,
} from 'redux-form';

import {
  SUBMIT_NEW_PERSON_FORM,
  SUBMIT_NEW_PERSON_FORM_AND_CLOSE_IT,
  NEW_PERSON_FORM_ID,
  CLOSE_NEW_PERSON_FORM,
  PERSON_SELECTED,
  START_PEOPLE_LOADING,
  START_FETCHING_NEW_PERSON_FORM_OPTIONS,
} from './constants';

import {
  startPeopleLoading,
  closeNewPersonForm,
  endPeopleLoading,
  endFetchingNewPersonFormOptions,
} from './actions';

import {
  requestErrorReceived,
} from '../App/actions';

import { getPeople, registerPerson, fetchRoles } from '../../support/backend/KowalskiBackendClient';
import { genCommonReqConfig } from '../../support/backend/utils';

export function* handleSubmit({ payload }) {
  const successful = yield submitPersonForm({ payload });
  if (successful) {
    yield clearPersonForm();
  }
}

export function* handleSubmitAndCloseForm({ payload }) {
  const successful = yield submitPersonForm({ payload });
  if (successful) {
    yield put(closeNewPersonForm());
  }
}

export function* handlePersonSelected() {
  // Do nothing for now -> should open the person dialog allowing for edition in the future
}

export function* submitPersonForm({ payload }) {
  yield put(startSubmit(NEW_PERSON_FORM_ID));
  try {
    yield call(registerPerson, {
      ...genCommonReqConfig(),
      personData: payload.toJSON(),
    });
    yield put(stopSubmit(NEW_PERSON_FORM_ID));
    yield put(startPeopleLoading());
    return true;
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAuthError: [], // Redux-form will automatically clean up state in this case
      dispatchOnOtherErrors: [
        stopSubmit(
          NEW_PERSON_FORM_ID,
          { _error: 'Houve um erro enquanto tentávamos comunicar com o servidor =(' }
        ),
      ],
    }));
  }

  return false;
}

export function* handleStartFetchingNewPersonFormOptions() {
  try {
    const roles = yield call(fetchRoles, genCommonReqConfig());
    yield put(endFetchingNewPersonFormOptions({ success: true, data: fromJS(roles) }));
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAnyError: [endFetchingNewPersonFormOptions({ success: false })],
      dispatchOnOtherErrors: [
        stopSubmit(
          NEW_PERSON_FORM_ID,
          { _error: 'Houve um erro relacionado com o servidor enquanto se tentava carregar as opções do formulário. Por favor tente novamente mais tarde. =(' }
        ),
      ],
    }));
  }
}

export function* clearPersonForm() {
  yield put(reset(NEW_PERSON_FORM_ID));
}

export function* handlePeopleLoading() {
  try {
    const people = yield call(
      getPeople,
      genCommonReqConfig(),
    );
    yield put(endPeopleLoading({ success: true, data: fromJS(people) }));
  } catch (e) {
    yield put(requestErrorReceived({
      error: e,
      dispatchOnAuthError: [
        endPeopleLoading({ success: false, errorMsg: '' }),
      ],
      dispatchOnOtherErrors: [
        endPeopleLoading({ success: false, errorMsg: 'Houve um erro enquanto tentávamos comunicar com o servidor =(' }),
      ],
    }));
  }
}

// Individual exports for testing
export default function* defaultSaga() {
  yield takeEvery(SUBMIT_NEW_PERSON_FORM, handleSubmit);
  yield takeEvery(SUBMIT_NEW_PERSON_FORM_AND_CLOSE_IT, handleSubmitAndCloseForm);
  yield takeEvery(CLOSE_NEW_PERSON_FORM, clearPersonForm);
  yield takeEvery(PERSON_SELECTED, handlePersonSelected);
  yield takeEvery(START_PEOPLE_LOADING, handlePeopleLoading);
  yield takeEvery(START_FETCHING_NEW_PERSON_FORM_OPTIONS, handleStartFetchingNewPersonFormOptions);
}
