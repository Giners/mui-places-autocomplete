import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import MUIPlacesAutocomplete, { geocodeBySuggestion } from './../dist'

class DemoGeocodeLatLong extends React.Component {
  constructor() {
    super()

    this.state = { open: false, coordinates: null, errorMessage: null }

    this.onClose = this.onClose.bind(this)
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this)
  }

  onClose() {
    // Be sure to reset our coordinates/errorMessage so we can render the message displayed in the
    // <Snackbar> appropriately (see 'renderMessage()').
    this.setState({ open: false, coordinates: null, errorMessage: null })
  }

  onSuggestionSelected(suggestion) {
    // Once a suggestion has been selected by your consumer you can use the utility geocoding
    // functions to get the latitude and longitude for the selected suggestion.
    geocodeBySuggestion(suggestion).then((results) => {
      if (results.length < 1) {
        this.setState({
          open: true,
          errorMessage: 'Geocode request completed successfully but without any results',
        })

        return
      }

      // Just use the first result in the list to get the geometry coordinates
      const { geometry } = results[0]

      const coordinates = {
        lat: geometry.location.lat(),
        lng: geometry.location.lng(),
      }

      // Add your business logic here. In this case we simply set our state to show our <Snackbar>.
      this.setState({ open: true, coordinates })
    }).catch((err) => {
      this.setState({ open: true, errorMessage: err.message })
    })
  }

  renderMessage() {
    const { coordinates, errorMessage } = this.state

    if (coordinates) {
      return `Selected suggestions geocoded latitude is ${coordinates.lat} and longitude is ${coordinates.lng}`
    } else if (errorMessage) {
      return `Failed to geocode suggestion because: ${errorMessage}`
    }

    // If we don't have any coordinates or error message to render (probably due to being rendered
    // the first time) then render nothing
    return null
  }

  render() {
    const { open } = this.state

    return (
      <div>
        <MUIPlacesAutocomplete
          onSuggestionSelected={this.onSuggestionSelected}
          renderTarget={() => (<div />)}
        />
        <Snackbar
          onClose={this.onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={5000}
          open={open}
          message={(<span>{this.renderMessage()}</span>)}
          style={{ width: '70vw' }}
        />
      </div>
    )
  }
}

DemoGeocodeLatLong.description = 'Geocoding (i.e. latitude/longitude) a selected suggestion'

export default DemoGeocodeLatLong
