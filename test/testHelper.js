import { createClient } from '@google/maps'
import key from './api-key'

// The <MUIPlacesAutocomplete> component expects the Google Maps JavaScript API to be loaded in the
// 'window' object. This method can be invoked to provide a mock of the Google Maps JavaScript API.
// It can then be added to the 'window' object so the <MUIPlacesAutocomplete> component can consume
// it.
//
// In this case the mock API actually uses the Google Maps JavaScript API as consumed as a module
// that we import. It merely acts as a passthrough/wrapper around the imported module/API.
//
// This mock API is best used for verifying the consumption of the Google Maps JavaScript API (vs.
// verifying the rendered ouptut of the <MUIPlacesAutocomplete> component). To get the most out of
// it a test callback ought to be provided to 'getACServiceClassDef()'. The test callback will be
// called after the mock API has called back into the <MUIPlacesAutocomplete> component.
const getACServiceClassDef = testCallback => class AutocompleteService {
  constructor() {
    this.client = createClient({ key })
  }

  // Method signature:
  // getPlacePredictions(
  //  request:AutocompletionRequest,
  //  callback:function(Array<AutocompletePrediction>, PlacesServiceStatus)
  // )
  //
  // Documentation here:
  // https://developers.google.com/maps/documentation/javascript/reference#AutocompleteService
  getPlacePredictions({ input }, callback) {
    this.client.placesAutoComplete({ input }, (err, res) => {
      // Pass through any predictions or errors to the callback provided...
      if (!err) {
        callback(res.json.predictions, res.json.status)
      } else {
        callback(null, err.json ? err.json.status : 'UNKNOWN_ERROR')
      }

      // If there is a test callback that desires to know after the callback provided to this method
      // has completed its invocation let them know now...
      if (testCallback) {
        testCallback()
      }
    })
  }
}

export default getACServiceClassDef
