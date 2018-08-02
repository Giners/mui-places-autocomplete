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
import { getACServiceClassDef } from './testHelper'

// Configure Chai to work with Jest
chai.use(chaiJestSnapshot)

describe('React component test: <MUIPlacesAutocomplete>', function () {
  // Common search value that can be used throughout the tests
  const searchInputValue = 'Bellingham'

  // Wrapper providing access to DOM APIs/full DOM rendering for the <MUIPlacesAutocomplete>
  // component that will be under test
  let mpaWrapper = null

  before('Configure Enzyme', function () {
    Enzyme.configure({ adapter: new Adapter() })
  })

  before('Reset Jest snapshot registry for Chai usage', function () {
    chaiJestSnapshot.resetSnapshotRegistry()
  })

  beforeEach('Configure chai-jest-snapshot for "Mocha configuration mode"', function () {
    chaiJestSnapshot.configureUsingMochaContext(this)
  })

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
    mpaWrapper = mount(
      <MUIPlacesAutocomplete onSuggestionSelected={() => {}} renderTarget={() => (<div />)} />,
    )

    expect(mpaWrapper).to.not.be.null
    expect(mpaWrapper.length).to.equal(1)
  })

  describe('Renders correctly for given application state:', function () {
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

  describe('Provides expected UX:', function () {
    it('\'textFieldProps.value\' prop can be used to control <input>', function () {
      const controlValue = 'LOL Bananas'

      mpaWrapper.setProps({ textFieldProps: { value: controlValue } })

      expect(mpaWrapper.find(`input[value="${controlValue}"]`).length).to.equal(1)
    })

    it('\'textFieldProps.id\' prop can be used to set \'id\' on the <input> element', function () {
      const idValue = 'lol-bananas'

      // When testing if the 'id' value gets set properly on the resulting <input> element you must
      // set the 'id' input prop when first mounting <MUIPlacesAutocomplete>. That is because the
      // first time the <Downshift> element is mounted it sets and maintains the 'id' value
      // throughout re-renderings as seen here:
      // https://github.com/paypal/downshift/blob/118a87234a9331e716142acfb95eb411cc4f8015/src/downshift.js#L623
      //
      // This fact is important as the 'id' value is the last value set on the props returned from
      // the 'getInputProps()' function as seen here:
      // https://github.com/paypal/downshift/blob/118a87234a9331e716142acfb95eb411cc4f8015/src/downshift.js#L661
      //
      // In other words setting the props on an already mounted <MUIPlacesAutocomplete> won't change
      // the value of 'id' and will result in the test always failing.
      mpaWrapper = mount(
        <MUIPlacesAutocomplete
          onSuggestionSelected={() => {}}
          renderTarget={() => (<div />)}
          textFieldProps={{ id: idValue }}
        />,
      )

      expect(mpaWrapper).to.not.be.null
      expect(mpaWrapper.length).to.equal(1)

      expect(mpaWrapper.find(`input[id="${idValue}"]`).length).to.equal(1)
    })

    it('\'textFieldProps.onChange\' prop invoked when input changed', function (done) {
      // Setup our wrapper to signal that our test has completed successfully
      const testSuccessCB = (inputValue) => {
        try {
          expect(inputValue).to.be.an('object')
          expect(inputValue.target).to.exist
          expect(inputValue.target.value).to.exist
          expect(inputValue.target.value).to.equal(searchInputValue)
        } catch (e) {
          done(e)
          return
        }

        done()
      }

      mpaWrapper.setProps({ textFieldProps: { onChange: testSuccessCB } })

      // Signal to <MUIPlacesAutocomplete> we would like to be called back when the input changes
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })
    })

    it('\'onSuggestionSelected\' invoked when suggestion selected', function (done) {
      // Setup our wrapper to signal that our test has completed successfully
      const testSuccessCB = (suggestion) => {
        try {
          expect(suggestion).to.exist
        } catch (e) {
          done(e)
        }

        done()
      }

      mpaWrapper.setProps({ onSuggestionSelected: testSuccessCB })

      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      mpaWrapper.setState({ suggestions: [{ description: 'Bellingham, WA, United States' }] })

      // Now simulate a click on a rendered suggestion which ought to signal our success callback
      const miWrapper = mpaWrapper.find('MenuItem')

      expect(miWrapper.length).to.equal(1)

      miWrapper.simulate('click')
    })

    it('Popper has default z-index of 1', function () {
      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      mpaWrapper.setState({ suggestions: [{ description: 'Bellingham, WA, United States' }] })

      const pWrapper = mpaWrapper.find('Popper')
      expect(pWrapper.exists()).to.be.true

      const styleProps = pWrapper.prop('style')
      expect(styleProps).to.exist
      expect(styleProps.zIndex).to.exist
      expect(styleProps.zIndex).to.be.equal(1)
    })

    it('\'suggestionsContainerProps.style\' can be used to set \'width\' and retain defaults', function () {
      const width = '400px'

      mpaWrapper = mount(
        <MUIPlacesAutocomplete
          onSuggestionSelected={() => {}}
          renderTarget={() => (<div />)}
          suggestionsContainerProps={{
            style: { width },
          }}
        />,
      )

      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      mpaWrapper.setState({ suggestions: [{ description: 'Bellingham, WA, United States' }] })

      const pWrapper = mpaWrapper.find('Popper')
      expect(pWrapper.exists()).to.be.true

      const styleProps = pWrapper.prop('style')
      expect(styleProps).to.exist
      expect(styleProps.width).to.exist
      expect(styleProps.width).to.be.equal(width)
      expect(styleProps.left).to.exist
      expect(styleProps.left).to.be.equal(0)
      expect(styleProps.right).to.exist
      expect(styleProps.right).to.be.equal(0)
      expect(styleProps.zIndex).to.exist
      expect(styleProps.zIndex).to.be.equal(1)
    })

    it('\'suggestionsContainerProps.style\' can be used to override \'style\' defaults', function () {
      const style = {
        left: 50,
        right: 15,
        zIndex: 4,
      }

      mpaWrapper = mount(
        <MUIPlacesAutocomplete
          onSuggestionSelected={() => {}}
          renderTarget={() => (<div />)}
          suggestionsContainerProps={{ style }}
        />,
      )

      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      mpaWrapper.setState({ suggestions: [{ description: 'Bellingham, WA, United States' }] })

      const pWrapper = mpaWrapper.find('Popper')
      expect(pWrapper.exists()).to.be.true

      const styleProps = pWrapper.prop('style')
      expect(styleProps).to.exist
      expect(styleProps.left).to.exist
      expect(styleProps.left).to.be.equal(style.left)
      expect(styleProps.right).to.exist
      expect(styleProps.right).to.be.equal(style.right)
      expect(styleProps.zIndex).to.exist
      expect(styleProps.zIndex).to.be.equal(style.zIndex)
    })

    it('\'suggestionsContainerProps.modifiers\' can be used to set \'hide\' and retain defaults', function () {
      const modifiers = { hide: { enabled: true } }

      mpaWrapper = mount(
        <MUIPlacesAutocomplete
          onSuggestionSelected={() => {}}
          renderTarget={() => (<div />)}
          suggestionsContainerProps={{ modifiers }}
        />,
      )

      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      mpaWrapper.setState({ suggestions: [{ description: 'Bellingham, WA, United States' }] })

      const pWrapper = mpaWrapper.find('Popper')
      expect(pWrapper.exists()).to.be.true

      const modifiersProps = pWrapper.prop('modifiers')
      expect(modifiersProps).to.exist
      expect(modifiersProps.inner).to.exist
      expect(modifiersProps.inner.enabled).to.exist
      expect(modifiersProps.inner.enabled).to.be.equal(true)
      expect(modifiersProps.hide).to.exist
      expect(modifiersProps.hide.enabled).to.exist
      expect(modifiersProps.hide.enabled).to.be.equal(modifiers.hide.enabled)
    })

    it('\'suggestionsContainerProps.modifiers\' can be used to override \'inner\' default', function () {
      const modifiers = { inner: { enabled: false } }

      mpaWrapper = mount(
        <MUIPlacesAutocomplete
          onSuggestionSelected={() => {}}
          renderTarget={() => (<div />)}
          suggestionsContainerProps={{ modifiers }}
        />,
      )

      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      mpaWrapper.setState({ suggestions: [{ description: 'Bellingham, WA, United States' }] })

      const pWrapper = mpaWrapper.find('Popper')
      expect(pWrapper.exists()).to.be.true

      const modifiersProps = pWrapper.prop('modifiers')
      expect(modifiersProps).to.exist
      expect(modifiersProps.inner).to.exist
      expect(modifiersProps.inner.enabled).to.exist
      expect(modifiersProps.inner.enabled).to.be.equal(modifiers.inner.enabled)
    })

    it('\'suggestionsContainerProps.placement\' can be used to override default', function () {
      const placement = 'bottom'

      mpaWrapper = mount(
        <MUIPlacesAutocomplete
          onSuggestionSelected={() => {}}
          renderTarget={() => (<div />)}
          suggestionsContainerProps={{ placement }}
        />,
      )

      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      mpaWrapper.setState({ suggestions: [{ description: 'Bellingham, WA, United States' }] })

      const pWrapper = mpaWrapper.find('Popper')
      expect(pWrapper.exists()).to.be.true

      const placementProps = pWrapper.prop('placement')
      expect(placementProps).to.exist
      expect(placementProps).to.be.equal(placement)
    })

    it('\'suggestionsContainerProps\' can be used to add additional props', function () {
      const eventsEnabled = true;

      mpaWrapper = mount(
        <MUIPlacesAutocomplete
          onSuggestionSelected={() => {}}
          renderTarget={() => (<div />)}
          suggestionsContainerProps={{ eventsEnabled }}
        />,
      )

      // To get suggestions to be rendered first simulate an input onChange event which will cause
      // <Downshift> to believe that our autocomplete/dropdown is open...
      mpaWrapper.find('input').simulate('change', { target: { value: searchInputValue } })

      // Second set the start of our component to provide suggestions as if they were returned from
      // the Google AutocompleteService...
      mpaWrapper.setState({ suggestions: [{ description: 'Bellingham, WA, United States' }] })

      const pWrapper = mpaWrapper.find('Popper')
      expect(pWrapper.exists()).to.be.true

      const placementProps = pWrapper.prop('eventsEnabled')
      expect(placementProps).to.exist
      expect(placementProps).to.be.equal(eventsEnabled)
    })
  })

  describe('Consumes Google Maps JavaScript API correctly:', function () {
    it('AutocompleteService.getPlacePredictions() returns predictions for given input', function (done) {
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

      // Now re-mount our component to make use of our mock API when we send a 'change' event on our
      // 'input' element
      mpaWrapper = mount(
        <MUIPlacesAutocomplete onSuggestionSelected={() => {}} renderTarget={() => (<div />)} />,
      )

      const inputWrapper = mpaWrapper.find('input')

      inputWrapper.simulate('focus')
      inputWrapper.simulate('change', { target: { value: searchInputValue } })
    })
  })
})
