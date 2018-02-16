import React from 'react'
import PropTypes from 'prop-types'
import Grow from 'material-ui/transitions/Grow'
import { MenuList, MenuItem } from 'material-ui/Menu'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import Downshift from 'downshift'
import { Manager, Target, Popper } from 'react-popper'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'

import googleLogo from './images/google-logo-on-white-bg.png'

export default class MUIPlacesAutocomplete extends React.Component {
  // Renders the container that will hold the suggestions and defers to other methods to render the
  // suggestions themselves. This method should only be called if you do indeed plan on rendering
  // the suggestions. In our case this is when 'isOpen' Downshift render prop is 'true'. Thats
  // because the methods that are used to render the suggestions invoke the 'getItemProps' prop
  // getter from Downshift which is an impure function. In otherwords even if you don't render the
  // suggestions container Downshift will still think we are rendering suggestions.
  //
  // The 'downshiftRenderProps' argument expects an object of props that Downshift passes to the
  // function which is set as the value of the 'render' prop on the <Downshift> component. Currently
  // the following Downshift render props are expected on the value provided to the
  // 'downshiftRenderProps' argument:
  // * getItemProps - function that returns the props that ought to be applied to menu item elements
  // that are rendered
  // * inputValue - current value of the controlled <input> element
  // * highlightedIndex - index of the currently highlighted menu item elements that have been
  // rendered
  static renderSuggestionsContainer(suggestions, downshiftRenderProps) {
    // Return null here if there are no suggestions to render. If we don't we will show a little box
    // that is empty and popped over the render target. This handles the case where a suggestion is
    // selected, the input value is updated, and then the user deletes the input value. This
    // behavior is attributed to setting the suggestions to the empty array in the
    // 'onInputValueChange' method.
    //
    // Be sure we return null here before we render any of our suggestions lest we invoke the impure
    // 'getItemProps' function.
    if (suggestions.length === 0) {
      return null
    }

    // The autocomplete service can return multiple of the same predictions. This can sometimes be
    // seen after someone selects a suggestion and starts to delete/backspace the input value which
    // contains their selected suggestion. Here we will ensure uniqueness amongst suggestions using
    // an ES6 Map so that we don't get duplicate key errors when we render our suggestions.
    const uniqueSuggestions =
      new Map(suggestions.map(suggestion => [suggestion.description, suggestion]))

    const renderedSuggestions =
      MUIPlacesAutocomplete.renderSuggestions([...uniqueSuggestions.values()], downshiftRenderProps)

    // On the <Popper> component we enable the 'inner' modifier. This is needed as Popper JS will
    // try to change the position of the popover depending on if it deems the popover is in or out
    // of view. The result of enabling the 'inner' modifier means that the position of the popover
    // won't change at all regardless of if the popover is in or out of view.
    //
    // Typically the <Popper> receives actual nodes for its children but in our case we opted to
    // provided a function that creats a <div> with styles applied to it at the top-level. This
    // <div> with the styles applied is to account for issues that arise when testing. Without it we
    // will get the following warnings: NaN is an invalid value for the top/left css style property.
    // This is because the DOM provider/implementation we use when testing (jsdom) doesn't return
    // values for bounding client rect.
    return (
      <Popper
        placement="top-start"
        modifiers={({ inner: { enabled: true } })}
        style={{ left: 0, right: 0, zIndex: 1 }}
      >
        {({ popperProps, restProps }) => (
          <div
            {...popperProps}
            {...restProps}
            style={{
              ...popperProps.style,
              top: popperProps.style.top || 0,
              left: popperProps.style.left || 0,
              ...restProps.style,
            }}
          >
            <Grow in style={{ transformOrigin: '0 0 0' }}>
              <Paper>
                <MenuList>
                  {renderedSuggestions}
                  {renderedSuggestions.length > 0
                      ? (
                        <div style={{ display: 'flex' }}>
                          <span style={{ flex: 1 }} />
                          <img src={googleLogo} alt="" />
                        </div>
                        )
                      : null}
                </MenuList>
              </Paper>
            </Grow>
          </div>
        )}
      </Popper>
    )
  }

  // Helper method to be called by 'renderSuggestionsContainer'. Returns list of rendered
  // suggestions.
  static renderSuggestions(suggestions, { getItemProps, inputValue, highlightedIndex }) {
    return suggestions.map((suggestion, index) =>
      MUIPlacesAutocomplete.renderSuggestion(
        suggestion,
        { getItemProps, inputValue, isHighlighted: index === highlightedIndex },
      ))
  }

  // Helper method to be called by 'renderSuggestions'. Renders suggestions where they are
  // highlighted based on the parts of the suggestion that match the query the user entered. This is
  // inline with the Google Maps webapp at the time of writing. This behavior is opposite of how the
  // Google Search bar/component/element works though.
  static renderSuggestion(suggestion, { getItemProps, inputValue, isHighlighted }) {
    const { description } = suggestion

    // Calculate the chars to highlight in the suggestion 'description' based on the query
    // ('inputValue') that the user provided us. An array is returned and if any chars ought to be
    // highlighted the array will contain a pair ([a, b]) which denote the indexes of chars to
    // highlight (i.e. text.slice(a, b)).
    const matches = match(description, inputValue)

    // Break up the suggestion 'description' based on the parts that matched. An array is returned
    // of parts where each one has an indication of if it ought to be highlighted or not.
    const parts = parse(description, matches)

    return (
      <MenuItem
        {...getItemProps({ item: suggestion })}
        key={description}
        selected={isHighlighted}
        component="div"
      >
        <div>
          {parts.map((part, index) => {
            if (part.highlight) {
              // Since we are further breaking down an array there is nothing unique about the
              // elements in the resulting array so we can disable the react/no-array-index-key
              // ESLint rule when rendering our suggestion
              // eslint-disable-next-line react/no-array-index-key
              return <strong key={index} style={{ fontWeight: 500 }}>{part.text}</strong>
            }

            // Since we are further breaking down an array there is nothing unique about the
            // elements in the resulting array so we can disable the react/no-array-index-key
            // ESLint rule when rendering our suggestion
            // eslint-disable-next-line react/no-array-index-key
            return <span key={index} style={{ fontWeight: 300 }}>{part.text}</span>
          })}
        </div>
      </MenuItem>
    )
  }

  constructor() {
    super()

    // Control the <input> element/<Autosuggest> component and make this React component the source
    // of truth for their state.
    this.state = {
      suggestions: [],
    }

    this.onInputValueChange = this.onInputValueChange.bind(this)
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this)
    this.renderAutocomplete = this.renderAutocomplete.bind(this)
  }

  componentDidMount() {
    // After the component is mounted it is safe to create a new instance of the autocomplete
    // service client. That's because at this point the Google Maps JavaScript API has been loaded.
    // Also if we do it before the component is mounted (i.e. in 'componentWillMount()') we won't be
    // safe to render on the server (SSR) as the 'window' object isn't available.
    this.autocompleteService = new window.google.maps.places.AutocompleteService()
  }

  // This function is called whenever Downshift detects that the input value, well, has changed.
  // Although we only use a single argument in our function signature Downshift documents the
  // function signature as:
  // onInputValueChange(inputValue: string, stateAndHelpers: object)
  onInputValueChange(inputValue) {
    // If the inputs value is empty we can return as we will get an error if we provide the empty
    // string when we perform a search. Set our suggestions to empty here as well so we don't render
    // the old suggestions.
    if (inputValue === '') {
      this.setState({ suggestions: [] })
      return
    }

    const { createAutocompleteRequest } = this.props

    this.autocompleteService.getPlacePredictions(
      createAutocompleteRequest(inputValue),
      (predictions, serviceStatus) => {
        // If the response doesn't contain a valid result then set our state as if no suggestions
        // were returned
        if (serviceStatus !== window.google.maps.places.PlacesServiceStatus.OK) {
          this.setState({ suggestions: [] })
          return
        }

        this.setState({ suggestions: predictions })
      },
    )
  }

  // This function is called whenever Downshift detects that a rendered suggestion has been
  // selected. Although we only use a single argument in our function signature Downshift documents
  // the function signature as:
  // onSelect(selectedItem: any, stateAndHelpers: object)
  onSuggestionSelected(suggestion) {
    const { onSuggestionSelected } = this.props

    if (onSuggestionSelected) {
      onSuggestionSelected(suggestion)
    }
  }

  renderAutocomplete({
    getInputProps,
    getItemProps,
    isOpen,
    inputValue,
    highlightedIndex,
  }) {
    const { suggestions } = this.state
    const { renderTarget, textFieldProps } = this.props

    // We set the value of 'tag' on the <Manager> component to false to allow the rendering of
    // children instead of a specific DOM element.
    //
    // We only want to render our suggestions container if Downshift says we are open AND there are
    // suggestions to actually render. There may not be suggestions yet due to the async nature of
    // requesting them from the Google Maps/Places service.
    //
    // Provide an 'id' to the input props (see <TextField>) to accommodate SSR. If we don't then we
    // will see checksum errors with the 'id' prop of the <input> element not matching what was
    // rendered on the server vs. what was rendered on the client after rehydration due to automatic
    // 'id' prop generation by <Downshift>.
    return (
      <div>
        <Manager tag={false}>
          <TextField {...getInputProps({ id: 'mui-places-autocomplete-input', ...textFieldProps })} />
          <Target>{renderTarget()}</Target>
          {isOpen ? MUIPlacesAutocomplete.renderSuggestionsContainer(
                      suggestions,
                      { getItemProps, inputValue, highlightedIndex },
                      )
                  : null}
        </Manager>
      </div>
    )
  }

  render() {
    // Check to see if a consumer would like to exert control on the <input> elements state. If so
    // we pass it to the <Downshift> component as the 'inputValue' prop to provide control of the
    // <input> elements state to the consumer.
    const controlProps = this.props.textFieldProps && this.props.textFieldProps.value ?
      { inputValue: this.props.textFieldProps.value } :
      { }

    return (
      <Downshift
        onSelect={this.onSuggestionSelected}
        onInputValueChange={this.onInputValueChange}
        itemToString={suggestion => (suggestion ? suggestion.description : '')}
        render={this.renderAutocomplete}
        {...controlProps}
      />
    )
  }
}

MUIPlacesAutocomplete.propTypes = {
  onSuggestionSelected: PropTypes.func.isRequired,
  renderTarget: PropTypes.func.isRequired,
  createAutocompleteRequest: PropTypes.func,
  textFieldProps: PropTypes.object,
}

MUIPlacesAutocomplete.defaultProps = {
  createAutocompleteRequest: inputValue => ({ input: inputValue }),
  textFieldProps: { autoFocus: false, placeholder: 'Search for a place', fullWidth: true },
}
