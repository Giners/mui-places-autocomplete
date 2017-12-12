import React from 'react'
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest'
import { MenuItem } from 'material-ui/Menu'
import TextField from 'material-ui/TextField'
import { withStyles } from 'material-ui/styles'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'

import googleLogo from './images/google-logo-on-white-bg.png'

// These MUI styles will be applied as the 'theme' to the <Autosuggest> component which comes with
// no styles. For info on styling the <Autosuggest> component see:
// https://github.com/moroshko/react-autosuggest#theme-optional
const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  textField: {
    width: '100%',
  },
})

// We export our component for testing purposes. For production use the default export from this
// module.
export class MUIPlacesAutocomplete extends React.Component {
  static getSuggestionValue({ description }) {
    return description
  }

  static renderInputComponent({ classes, autoFocus, value, ref, ...other }) {
    // The 'inputRef' prop takes a callback which has 1 argument which represents the DOM node for
    // the <input> element. In this case 'ref' comes from the 'react-autowhatever' lib (which is
    // used by the 'react-autosuggest' lib) and in this case it simply maintains a reference to the
    // <input> DOM node for internal purposes.
    return (
      <TextField
        className={classes.textField}
        autoFocus={autoFocus}
        value={value}
        inputRef={ref}
        InputProps={{
          classes: { input: classes.input },
          ...other,
        }}
      />
    )
  }

  static renderSuggestionsContainer({ containerProps, children }) {
    return (
      <div {...containerProps}>
        {children}
        {children ? (
          <div style={{ display: 'flex' }}>
            <span style={{ flex: 1 }} />
            <img src={googleLogo} alt="" />
          </div>
        ) : null}
      </div>
    )
  }

  // Renders suggestions where they are highlighted based on the parts of the suggestion that match
  // the query the user entered. This is inline with the Google Maps webapp at the time of writing.
  // This behavior is opposite of how the Google Search bar/component/element works though.
  static renderSuggestion({ description }, { query, isHighlighted }) {
    // Calculate the chars to highlight in the suggestion 'description' based on the query that the
    // user provided us. An array is returned and if any chars ought to be highlighted the array
    // will contain a pair ([a, b]) which denote the indexes of chars to highlight (i.e.
    // text.slice(a, b)).
    const matches = match(description, query)

    // Break up the suggestion 'description' based on the parts that matched. An array is returned
    // of parts where each one has an indication of if it ought to be highlighted or not.
    const parts = parse(description, matches)

    return (
      <MenuItem selected={isHighlighted} component="div">
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
    this.state = { value: '', suggestions: [] }

    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this)
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    // After the component is mounted it is safe to create a new instance of the autocomplete
    // service client. That's because at this point the Google Maps JavaScript API has been loaded.
    // Also if we do it before the component is mounted (i.e. in 'componentWillMount()') we won't be
    // safe to render on the server (SSR) as the 'window' object isn't available.
    this.autocompleteService = new window.google.maps.places.AutocompleteService()
  }

  onSuggestionsFetchRequested({ value }) {
    this.autocompleteService.getPlacePredictions(
      { input: value },
      (predictions, serviceStatus) => {
        // If the response doesn't contain a valid result then set our state as if not suggestions
        // were returned
        if (serviceStatus !== window.google.maps.places.PlacesServiceStatus.OK) {
          this.setState({ suggestions: [] })
          return
        }

        const suggestions = predictions.map(({ description }) => ({ description }))

        this.setState({ suggestions })
      },
    )
  }

  onSuggestionsClearRequested() {
    this.setState({ suggestions: [] })
  }

  // Implementation of the 'onChange' event callback for the <input> element that is expected in the
  // 'inputProps' prop passed to the <Autosuggest> component. The <Autosuggest> component expects
  // the callback to have the following signature: function onChange(event, { newValue, method })
  onChange(event, { newValue }) {
    this.setState({ value: newValue })
  }

  render() {
    const { suggestions, value } = this.state
    const { classes } = this.props

    // The following props are required for the <Autosuggest> component:
    // * suggestions
    // * getSuggestionValue
    // * renderSuggestion
    // * onSuggestionsFetchedRequested
    // * onSuggestionsClearRequested
    // * inputProps
    //
    // We supply the following props to give a MUI feel to our component
    // * theme
    // * renderInputComponent
    // * renderSuggestionsContainer (for the Google logo)
    // * renderSuggestion
    return (
      <Autosuggest
        suggestions={suggestions}
        getSuggestionValue={MUIPlacesAutocomplete.getSuggestionValue}
        renderInputComponent={MUIPlacesAutocomplete.renderInputComponent}
        renderSuggestionsContainer={MUIPlacesAutocomplete.renderSuggestionsContainer}
        renderSuggestion={MUIPlacesAutocomplete.renderSuggestion}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        inputProps={{
          classes,
          value,
          onChange: this.onChange,
          autoFocus: true,
          placeholder: 'Search for a place',
        }}
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion,
        }}
      />
    )
  }
}

MUIPlacesAutocomplete.propTypes = {
  classes: PropTypes.object.isRequired,
}

const MUIPlacesAutocompleteHOC = withStyles(styles)(MUIPlacesAutocomplete)

export default MUIPlacesAutocompleteHOC
