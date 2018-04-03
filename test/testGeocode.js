// Disable 'prefer-arrow-callback' as Mocha recommends against passing arrow functions to Mocha. See
// https://mochajs.org/#arrow-functions for more info.
// Disable 'func-names' so we can use anonymous functions as a convenience to us as test writers.
/* eslint prefer-arrow-callback: 0, func-names: 0 */
/* eslint no-unused-expressions: 0, chai-friendly/no-unused-expressions: 2 */

// 3rd-party supporting test libs
import { expect } from 'chai'

// Code under test
import { geocodeByPlaceID, geocodeBySuggestion } from './../src'

// Supporting test code
import { getGeocoderServiceClassDef } from './testHelper'

describe('Geocoding utilities:', function () {
  before('"Load" the Google Maps JavaScript API on \'window\'', function () {
    // These tests depend on a DOM to be setup. At this point we presume that the DOM has been setup
    // and we can add additional properties to the global 'window' object.
    expect(global.window).to.exist

    // The geocoding utility functions expect the Google Maps JavaScript API to be loaded in the
    // 'window' object. We "load" the API onto the 'window' object my mocking it out and making
    // available the API from the Google Maps JavaScript library that is a dev dependency to this
    // project.
    global.window.google = {
      maps: {
        Geocoder: getGeocoderServiceClassDef(),
        // Don't forget to mock out the status' that are used by the geocoding utility functions
        GeocoderStatus: {
          OK: 'OK',
        },
      },
    }
  })

  describe('geocodeByPlaceID():', function () {
    it('Promise is resolved with geocoding geocodeResults', function (done) {
      const spaceNeedlePlaceID = 'ChIJ2cTu4UUVkFQRM-XCxwhyzEQ'

      const promise = geocodeByPlaceID(spaceNeedlePlaceID)

      promise.then((geocodeResults) => {
        expect(geocodeResults).to.be.an('array')
        expect(geocodeResults).to.have.lengthOf(1)

        const result = geocodeResults[0]

        expect(result).to.be.an('object')
        expect(result.place_id).to.equal(spaceNeedlePlaceID)
        expect(result.geometry).to.be.an('object')

        const { location } = result.geometry

        expect(location).to.be.an('object')

        // Note that the 'geocodeResults' passed to us are from using the actual Google Maps
        // JavaScript API as a module for development purposes and not the one downloaded from
        // embedding it as a <script> in your site. The 'lat' and 'lng' properties are actual
        // primitive Numbers from using the Google Maps JavaScript API as a module whereas if we
        // downloaded the API then they would be functions.
        expect(location.lat).to.exist
        expect(location.lng).to.exist

        done()
      }).catch((err) => {
        done(err)
      })
    })

    it('Promise is rejected on an error', function (done) {
      // Use an invalid place ID to generate an error. This ought to generate an 'INVALID_REQUEST'
      // for the error response.
      const placeID = 'lol not a real placeID'

      const promise = geocodeByPlaceID(placeID)

      promise.then(() => {
        done(new Error('Promise was resolved when it should have been rejected'))
      }).catch(() => {
        done()
      })
    })
  })

  describe('geocodeBySuggestion():', function () {
    it('Promise is resolved with geocoding geocodeResults', function (done) {
      const spaceNeedleSuggestion = {
        place_id: 'ChIJ2cTu4UUVkFQRM-XCxwhyzEQ',
      }

      const promise = geocodeBySuggestion(spaceNeedleSuggestion)

      promise.then((geocodeResults) => {
        expect(geocodeResults).to.be.an('array')
        expect(geocodeResults).to.have.lengthOf(1)

        const result = geocodeResults[0]

        expect(result).to.be.an('object')
        expect(result.place_id).to.equal(spaceNeedleSuggestion.place_id)
        expect(result.geometry).to.be.an('object')

        const { location } = result.geometry

        expect(location).to.be.an('object')

        // Note that the 'geocodeResults' passed to us are from using the actual Google Maps
        // JavaScript API as a module for development purposes and not the one downloaded from
        // embedding it as a <script> in your site. The 'lat' and 'lng' properties are actual
        // primitive Numbers from using the Google Maps JavaScript API as a module whereas if we
        // downloaded the API then they would be functions.
        expect(location.lat).to.exist
        expect(location.lng).to.exist

        done()
      }).catch((err) => {
        done(err)
      })
    })

    it('Promise is rejected on an error', function (done) {
      // Use an invalid place ID to generate an error. This ought to generate an 'INVALID_REQUEST'
      // for the error response.
      const spaceNeedleSuggestion = {
        place_id: 'lol not a real placeID',
      }

      const promise = geocodeBySuggestion(spaceNeedleSuggestion)

      promise.then(() => {
        done(new Error('Promise was resolved when it should have been rejected'))
      }).catch(() => {
        done()
      })
    })
  })
})
