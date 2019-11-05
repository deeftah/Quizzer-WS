import * as fetchState from '../fetchStateActions'
import * as adminState from '../adminStateActions'

import * as GLOBALS from '../../globals'

export default function fetchTeamsAction() {
  return (dispatch, getState) => {
    dispatch(fetchState.updateFetchingAction(true))

    const { currentRoomNumber } = getState().appState

    fetch(`${GLOBALS.API_URL}/rooms/${currentRoomNumber}/teams/`, {
      ...GLOBALS.FETCH_OPTIONS,
      method: 'GET',
    })
      .then(res => res.json()
        // .then(parsed => new Promise(resolve => setTimeout(() => resolve(parsed), 500))) // Simulates loading time
        .then(parsed => {
          if (!res.ok) throw parsed
          dispatch(fetchState.updateFetchingAction(false))

          // First, clear all teams
          dispatch(adminState.clearTeamsAction())

          // Put teams in pendingTeams and approve if they're already verified
          parsed.teams.forEach(team => {
            if (team.name !== undefined) {
              dispatch(adminState.addTeamAction(team))
              if (team.verified) dispatch(adminState.approveTeamAction(team._id))
            }
          })
        })
        .catch(parsed => {
          const { error } = parsed
          dispatch(fetchState.updateFetchingResultAction(null))
          dispatch(fetchState.updateFetchingAction(false))
          dispatch(fetchState.updateFetchingResultAction('error'))
          dispatch(fetchState.updateFetchingMessageAction(error))
        })
      )
      .catch(err => {
        console.log('fetch error: ', err)
        dispatch(fetchState.updateFetchingResultAction(null))
        dispatch(fetchState.updateFetchingAction(false))
        dispatch(fetchState.updateFetchingResultAction('error'))
        dispatch(fetchState.updateFetchingMessageAction('Couldn\'t fetch from API'))
      })
  }
}