// ESLint rule config for demo file
/* eslint import/no-extraneous-dependencies: 0 */
// Our demo files showcase how to integrates with other 3rd party libraries often. The 3rd party
// library dependencies are added to the 'devDependencies' of 'package.json' so disable the
// 'import/no-extraneous-dependencies/ rule in this demo file so we don't have to hear about them
// not being in 'dependencies' all the time.
import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import MUIPlacesAutocomplete from './../dist'

// Stateless function that we pass to the 'component' prop of the <Field> to render
// <MUIPlacesAutocomplete>. By passing the props that <Field> passes our stateless function as the
// 'textFieldProps' on <MUIPlacesAutocomplete> we are essentially stating that the <Field> would
// like to control the state of the resulting <input> element that gets rendered. This is due to the
// addition of the 'value' property that gets spread onto the object passed to the 'textFieldProps'
// prop.
//
// It is important to define this stateless function outside of the method that renders the actual
// <Field> to avoid causing it to re-render. For more info please refer to the following docs:
// https://redux-form.com/7.2.0/docs/api/field.md/#2-a-stateless-function
const renderMUIPlacesAutocomplete = ({ onSuggestionSelected, ...other }) => (
  <MUIPlacesAutocomplete
    onSuggestionSelected={onSuggestionSelected}
    renderTarget={() => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 16,
        }}
      >
        <Button variant="raised" color="primary" type="submit">Submit</Button>
      </div>
    )}
    textFieldProps={{ ...other }}
  />
)

renderMUIPlacesAutocomplete.propTypes = {
  onSuggestionSelected: PropTypes.func.isRequired,
  input: PropTypes.object.isRequired,
}

const DemoControlledInput = (props) => {
  const { change, handleSubmit } = props

  // Since we are controlling the state of the <input> element via Redux Form we want to ensure that
  // the <input> elements state is consistent with any suggestions a user may select. To do so we
  // dispatch an action to Redux Form to update the <Field> with a name of 'demoField'. For more
  // info see: https://redux-form.com/7.2.1/docs/api/actioncreators.md/
  const onSuggestionSelected = (suggestion) => {
    change('demoField', suggestion.description)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field
        fullWidth
        name="demoField"
        autoFocus={false}
        placeholder="Search for a place"
        onSuggestionSelected={onSuggestionSelected}
        component={renderMUIPlacesAutocomplete}
      />
    </form>
  )
}

DemoControlledInput.propTypes = {
  // Injected by Redux Form
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
}

const ConnectedDemoControlledInput = reduxForm({
  form: 'DemoControlledInput',
})(DemoControlledInput)

class DemoControlledInputContainer extends React.Component {
  constructor() {
    super()

    this.state = { open: false, formValues: { } }

    this.onClose = this.onClose.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onClose() {
    this.setState({ open: false })
  }

  onSubmit(formValues) {
    this.setState({ open: true, formValues })
  }

  render() {
    const { open, formValues } = this.state

    return (
      <div>
        <ConnectedDemoControlledInput onSubmit={this.onSubmit} />
        <Snackbar
          onClose={this.onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={5000}
          open={open}
          message={`You submitted: ${JSON.stringify(formValues, null, 2)}`}
          style={{ width: '70vw' }}
        />
      </div>
    )
  }
}

DemoControlledInputContainer.description = '"Controlled" input state via Redux Form'

export default DemoControlledInputContainer
