// ESLint rule config for demo file
/* eslint import/no-extraneous-dependencies: 0 */
// Our demo files showcase how to integrates with other 3rd party libraries often. The 3rd party
// library dependencies are added to the 'devDependencies' of 'package.json' so disable the
// 'import/no-extraneous-dependencies/ rule in this demo file so we don't have to hear about them
// not being in 'dependencies' all the time.
import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import Button from 'material-ui/Button'
import Snackbar from 'material-ui/Snackbar'
import MUIPlacesAutocomplete from './../dist'

// Stateless function that we pass to the 'component' prop of the <Field> to render
// <MUIPlacesAutocomplete>. By passing the props that <Field> passes our stateless function as the
// 'textFieldProps' on <MUIPlacesAutocomplete> we are essentially stating that the <Field> would
// like to control the state of the resulting <input> element that gets rendered.
//
// It is important to define this stateless function outside of the method that renders the actual
// <Field> to avoid causing it to re-render. For more info please refer to the following docs:
// https://redux-form.com/7.2.0/docs/api/field.md/#2-a-stateless-function
const renderMUIPlacesAutocomplete = ({ input, ...other }) => (
  <MUIPlacesAutocomplete
    onSuggestionSelected={() => { }}
    renderTarget={() => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 16,
        }}
      >
        <Button raised color="primary" type="submit">Submit</Button>
      </div>
    )}
    textFieldProps={{ ...other, ...input }}
  />
)

renderMUIPlacesAutocomplete.propTypes = {
  input: PropTypes.object.isRequired,
}

const DemoControlledInput = (props) => {
  const { handleSubmit } = props

  return (
    <form onSubmit={handleSubmit}>
      <Field
        fullWidth
        name="demoField"
        autoFocus={false}
        placeholder="Search for a place"
        component={renderMUIPlacesAutocomplete}
      />
    </form>
  )
}

DemoControlledInput.propTypes = {
  // Injected by Redux Form
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
          onRequestClose={this.onClose}
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
