// Disable 'prefer-arrow-callback' as Mocha recommends against passing arrow functions to Mocha. See
// https://mochajs.org/#arrow-functions for more info.
// Disable 'func-names' so we can use anonymous functions as a convenience to us as test writers.
/* eslint prefer-arrow-callback: 0, func-names: 0 */
/* eslint no-unused-expressions: 0, chai-friendly/no-unused-expressions: 2 */

// 3rd-party supporting test libs
import chai, { expect } from 'chai'
import chaiJestSnapshot from 'chai-jest-snapshot'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import toJson from 'enzyme-to-json'
import React from 'react'

// Code under test
import { MUIPlacesAutocomplete } from './../src/MUIPlacesAutocomplete'

// Supporting code
import getACServiceClassDef from './testHelper'

// Configure Chai to work with Jest
chai.use(chaiJestSnapshot)

describe('React component test: <MUIPlacesAutocomplete>', function () {
  // Common search value that can be used throughout the tests
  const searchInputValue = 'Bellingham'

  before('Configure Enzyme', function () {
    Enzyme.configure({ adapter: new Adapter() })
  })

  before('Reset Jest snapshot registry for Chai usage', function () {
    chaiJestSnapshot.resetSnapshotRegistry()
  })

  beforeEach('Configure chai-jest-snapshot for "Mocha configuration mode"', function () {
    chaiJestSnapshot.configureUsingMochaContext(this)
  })

  describe('Renders correctly for given application state:', function () {
    // Wrapper providing access to DOM APIs/full DOM rendering for the <MUIPlacesAutocomplete>
    // component that will be under test
    let mpaWrapper = null

    before('"Load" the Google Maps JavaScript API on \'window\'', function () {
      // These tests depend on a DOM to be setup for more indepth tests that either do full DOM
      // rendering or for leveraging DOM APIs. At this point we presume that the DOM has been setup
      // and we can add additional properties to the global 'window' object.
      expect(global.window).to.exist

      // The <MUIPlacesAutocomplete> component expects the Google Maps JavaScript API to be loaded
      // in the 'window' object. Since we aren't loading it we mock our the API and add it to the
      // 'window' object.
      global.window.google = {
        maps: {
          places: {
            // We disable the ESLint rule 'class-methods-use-this' on the next line as our component
            // depends on the method being available to an instance of the AutocompleteService
            // class (i.e. we can't convert it into a static).
            // eslint-disable-next-line class-methods-use-this
            AutocompleteService: class AutocompleteService { getPlacePredictions() { } },
            // Don't forget to mock out the status' that are used by the <MUIPlacesAutocomplete>
            // component
            PlacesServiceStatus: {
              OK: 'OK',
            },
          },
        },
      }
    })

    beforeEach('Setup Enzyme wrapper', function () {
      // Since we aren't testing the MUIPlacesAutocomplete HOC (see MUI 'withStyles()') we provide
      // an empty object for the MUI styling/classes that would normally get applied so we don't try
      // to reference an undefined prop.
      mpaWrapper = mount(<MUIPlacesAutocomplete classes={{ }} />)

      expect(mpaWrapper).to.not.be.null
    })

    it('Initial state', function () {
      expect(mpaWrapper.state().value).to.exist
      expect(mpaWrapper.state().value).to.be.empty
      expect(mpaWrapper.state().suggestions).to.exist
      expect(mpaWrapper.state().suggestions).to.be.empty

      // Protect us from forgetting to update this test if we add an additional key to the
      // components state. We currently only expect the 'value' and 'suggestions' key...
      expect(Object.keys(mpaWrapper.state()).length).to.equal(2)

      // We snapshot the initial state to provide visibility to any changes we have made to our
      // component...
      expect(toJson(mpaWrapper)).to.matchSnapshot()
    })

    it('Suggestions rendered from \'suggestions\' state', function () {
      // Provide a search input and a suggestion to our state so a suggestion is rendered
      mpaWrapper.setState({
        value: searchInputValue,
        suggestions: [{ description: 'Bellingham, WA, United States' }],
      })
      mpaWrapper.find('input').simulate('focus')

      expect(mpaWrapper.state().suggestions.length).to.equal(1)
      expect(mpaWrapper.find('MenuItem').length).to.equal(mpaWrapper.state().suggestions.length)

      expect(toJson(mpaWrapper)).to.matchSnapshot()
    })

    it('Empty input renders no suggestions after previous ones rendered', function () {
      // Make sure we aren't asserting an empty list of suggestions in the first place after
      // focusing the 'input' element...
      mpaWrapper.setState({
        value: searchInputValue,
        suggestions: [{ description: 'Bellingham, WA, United States' }],
      })
      mpaWrapper.find('input').simulate('focus')

      expect(mpaWrapper.state().suggestions.length).to.equal(1)
      expect(mpaWrapper.find('MenuItem').length).to.equal(mpaWrapper.state().suggestions.length)

      // Now check that we no longer render suggestions on empty input...
      mpaWrapper.find('input').simulate('change', { target: { value: '' } })

      expect(mpaWrapper.state().value).to.be.empty
      expect(mpaWrapper.state().suggestions).to.be.empty
      expect(mpaWrapper.find('MenuItem').length).to.equal(0)

      expect(toJson(mpaWrapper)).to.matchSnapshot()
    })

    it('Google logo is present in a populated list of suggestions', function () {
      // Provide a search input and a suggestion to our state so we can render the suggestions
      // container which will have the Google Logo in a single <img> element
      mpaWrapper.setState({
        value: searchInputValue,
        suggestions: [{ description: 'Bellingham, WA, United States' }],
      })
      mpaWrapper.find('input').simulate('focus')

      expect(mpaWrapper.find('img').length).to.equal(1)

      expect(toJson(mpaWrapper)).to.matchSnapshot()
    })
  })

  describe('Consumes Google Maps JavaScript API correctly:', function () {
    it('AutocompleteService.getPlacePredictions() returns predictions for given input', function (done) {
      let mpaWrapper = null

      // Find the 'input' element so we can simulate an event for changing the input which will
      // cause our component to get place predictions with the Google Maps API and ultimately update
      // its state with place suggestions. Before doing so setup our test callback so we can assert
      // that suggestions have been populated and signal that we have completed the test.
      const testCallback = () => {
        try {
          expect(mpaWrapper.state().value).to.equal(searchInputValue)
          expect(mpaWrapper.state().suggestions).to.not.be.empty
        } catch (e) {
          done(e)
          return
        }

        done()
      }

      // This test depends on a DOM to be setup. At this point we presume that the DOM has been
      // setup and we can add additional properties to the global 'window' object.
      expect(global.window).to.exist

      // The <MUIPlacesAutocomplete> component expects the Google Maps JavaScript API to be loaded
      // in the 'window' object. Use the mock API test helper that actually wraps the Google Maps
      // JavaScript API and add it to the 'window' object. We setup our DOM here rather than in a
      // 'before' Mocha hook as we want to use the mock API with our specific test callback.
      global.window.google = {
        maps: {
          places: {
            AutocompleteService: getACServiceClassDef(testCallback),
            // Don't forget to mock out the status' that are used by the <MUIPlacesAutocomplete>
            // component
            PlacesServiceStatus: {
              OK: 'OK',
            },
          },
        },
      }

      // Now mount our component to make use of our mock API when we send a 'change' event on our
      // 'input' element
      mpaWrapper = mount(<MUIPlacesAutocomplete classes={{ }} />)

      const inputWrapper = mpaWrapper.find('input')

      inputWrapper.simulate('change', { target: { value: searchInputValue } })
    })
  })
})
