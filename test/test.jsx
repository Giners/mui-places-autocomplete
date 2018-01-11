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
import MUIPlacesAutocomplete from './../src'

// Supporting test code
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

    // Helper function to get the JSON of the <MenuList> component in our <MUIPlacesAutocomplete>
    // component. Useful for snapshot testing only the components that we are in charge of
    // rendering (i.e. the suggestions).
    const getMenuListJSON = () => {
      expect(mpaWrapper).to.not.be.null

      const mlWrapper = mpaWrapper.find('MenuList')

      // Make sure we have a wrapper around a <MenuList> and only a single <MenuList>
      expect(mlWrapper).to.not.be.null
      expect(mlWrapper.length).to.equal(1)

      return toJson(mlWrapper)
    }

    before('"Load" the Google Maps JavaScript API on \'window\'', function () {
      // These tests depend on a DOM to be setup for more indepth tests that either do full DOM
      // rendering or for leveraging DOM APIs. At this point we presume that the DOM has been setup
      // and we can add additional properties to the global 'window' object.
      expect(global.window).to.exist

      // The <MUIPlacesAutocomplete> component expects the Google Maps JavaScript API to be loaded
      // in the 'window' object. Since we aren't loading it we mock out the API and add it to the
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
      mpaWrapper = mount(<MUIPlacesAutocomplete renderTarget={() => (<div />)} />)

      expect(mpaWrapper).to.not.be.null
    })

    it('Initial state', function () {
      expect(mpaWrapper.state().suggestions).to.exist
      expect(mpaWrapper.state().suggestions).to.be.empty

      // Protect us from forgetting to update this test if we add an additional key(s) to the
      // components state. We currently only expect the 'suggestions' key...
      expect(Object.keys(mpaWrapper.state()).length).to.equal(1)

      // We don't snapshot test our component since 1) the <Downshift>/<Popper> components that our
      // <MUIPlacesAutocomplete> component composes is massive and takes long to diff the
      // serializations and 2) our container ought not be open anyway. We can verify that the
      // suggestions container isn't open by searching for the <MenuList> component.
      expect(mpaWrapper.find('MenuList').length).to.equal(0)
    })

    it('Suggestions rendered from \'suggestions\' state', function () {
      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the state of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      const expectedSuggestion = { description: 'Bellingham, WA, United States' }
      const expectedSuggestionCount = 1

      mpaWrapper.setState({ suggestions: [expectedSuggestion] })

      // Now check that our suggestions are rendered...
      expect(mpaWrapper.find('MenuItem').length).to.equal(expectedSuggestionCount)
      expect(mpaWrapper.find('MenuItem').text()).to.equal(expectedSuggestion.description)

      // Snapshot test only the <MenuList> of our suggestions as the <Downshift>/<Popper> components
      // that our <MUIPlacesAutocomplete> component composes is massive and takes to long to diff
      // the serializations.
      expect(getMenuListJSON()).to.matchSnapshot()
    })

    it('Empty input renders no suggestions after previous ones rendered', function () {
      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      const expectedSuggestion = { description: 'Bellingham, WA, United States' }
      let expectedSuggestionCount = 1

      mpaWrapper.setState({ suggestions: [expectedSuggestion] })

      // Now check that our suggestions are rendered...
      expect(mpaWrapper.find('MenuItem').length).to.equal(expectedSuggestionCount)
      expect(mpaWrapper.find('MenuItem').text()).to.equal(expectedSuggestion.description)

      // Now clear the input and check that no suggestions are rendered...
      mpaWrapper.find('input').simulate('change', { target: { value: '' } })

      expectedSuggestionCount = 0

      expect(mpaWrapper.find('MenuItem').length).to.equal(expectedSuggestionCount)

      // We don't snapshot test since our suggestions container ought not be open. We can verify it
      // isn't by searching for the <MenuList> component
      expect(mpaWrapper.find('MenuList').length).to.equal(0)
    })

    it('Duplicate suggestions aren\'t rendered', function () {
      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the state of our component to provide duplicate suggestions as if they were
      // returned from the Google AutocompleteService...
      const expectedSuggestion = { description: 'Bellingham, WA, United States' }
      const expectedSuggestionCount = 1

      mpaWrapper.setState({ suggestions: [expectedSuggestion, expectedSuggestion] })

      // Now check that our suggestions are uniquely rendered...
      expect(mpaWrapper.find('MenuItem').length).to.equal(expectedSuggestionCount)
      expect(mpaWrapper.find('MenuItem').text()).to.equal(expectedSuggestion.description)

      // Snapshot test only the <MenuList> of our suggestions as the <Downshift>/<Popper> components
      // that our <MUIPlacesAutocomplete> component composes is massive and takes to long to diff
      // the serializations.
      expect(getMenuListJSON()).to.matchSnapshot()
    })

    it('Google logo is present in a populated list of suggestions', function () {
      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...

      mpaWrapper.setState({ suggestions: [{ description: 'Bellingham, WA, United States' }] })

      // Now check that our image is rendered...
      expect(mpaWrapper.find('img').length).to.equal(1)

      // Snapshot test only the <MenuList> of our suggestions as the <Downshift>/<Popper> components
      // that our <MUIPlacesAutocomplete> component composes is massive and takes to long to diff
      // the serializations.
      expect(getMenuListJSON()).to.matchSnapshot()
    })
  })

  describe('Consumes Google Maps JavaScript API correctly:', function () {
    it('AutocompleteService.getPlacePredictions() returns predictions for given input', function (done) {
      let mpaWrapper = null

      // Find the 'input' element so we can simulate an event for changing the input which will
      // cause our component to get place predictions with the Google Maps API and ultimately update
      // its state with place suggestions. Before doing so setup our test callback so we can assert
      // that suggestions have been populated.
      const testCallback = () => {
        try {
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
      mpaWrapper = mount(<MUIPlacesAutocomplete renderTarget={() => (<div />)} />)

      const inputWrapper = mpaWrapper.find('input')

      inputWrapper.simulate('focus')
      inputWrapper.simulate('change', { target: { value: searchInputValue } })
    })
  })
})
