// ESLint rule config for demo file
/* eslint import/no-extraneous-dependencies: 0 */
// Our demo files showcase how to integrates with other 3rd party libraries often. The 3rd party
// library dependencies are added to the 'devDependencies' of 'package.json' so disable the
// 'import/no-extraneous-dependencies/ rule in this demo file so we don't have to hear about them
// not being in 'dependencies' all the time.
import { combineReducers } from 'redux'
import { reducer as FormReducer } from 'redux-form'

// If any demos need reducers they ought to add them in here. Having a separate file for our
// reducers seems like a bit much, but at the same time having them in the main <Demo> component
// seems wrong as well...
const rootReducer = combineReducers({
  form: FormReducer,
})

export default rootReducer
