import React from 'react'
import Snackbar from 'material-ui/Snackbar'
import MUIPlacesAutocomplete from './../dist'

class DemoBasic extends React.Component {
  constructor() {
    super()

    this.state = { open: false, suggestion: null }

    this.onClose = this.onClose.bind(this)
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this)
  }

  onClose() {
    this.setState({ open: false })
  }

  onSuggestionSelected(suggestion) {
    // Add your business logic here. In this case we simply set our state to show our <Snackbar>.
    this.setState({ open: true, suggestion })
  }

  render() {
    const { open, suggestion } = this.state

    return (
      <div>
        <MUIPlacesAutocomplete
          onSuggestionSelected={this.onSuggestionSelected}
          renderTarget={() => (<div />)}
        />
        <Snackbar
          onRequestClose={this.onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={5000}
          open={open}
          message={suggestion ? (<span>Selected suggestion: {suggestion.description}</span>) : ''}
          style={{ width: '70vw' }}
        />
      </div>
    )
  }
}

DemoBasic.description = 'Basic usage'

export default DemoBasic
