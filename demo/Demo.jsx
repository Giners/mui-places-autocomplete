// ESLint rule config for demo file
/* eslint import/no-extraneous-dependencies: 0 */
// Our demo files showcase how to integrates with other 3rd party libraries often. The 3rd party
// library dependencies are added to the 'devDependencies' of 'package.json' so disable the
// 'import/no-extraneous-dependencies' rule in this demo file so we don't have to hear about them
// not being in 'dependencies' all the time.
import React, { createElement } from 'react'
import PropTypes from 'prop-types'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import { MenuItem } from 'material-ui/Menu'
import Select from 'material-ui/Select'
import Typography from 'material-ui/Typography'

import rootReducer from './rootReducer'
import DemoBasic from './DemoBasic'
import DemoControlledInput from './DemoControlledInput'
import DemoGeocodeLatLong from './DemoGeocodeLatLong'

// Map of demos that one can select to view
const demos = {
  [DemoBasic.name]: { description: DemoBasic.description, component: DemoBasic },
  [DemoControlledInput.name]: {
    description: DemoControlledInput.description,
    component: DemoControlledInput,
  },
  [DemoGeocodeLatLong.name]: {
    description: DemoGeocodeLatLong.description,
    component: DemoGeocodeLatLong,
  },
}

const store = createStore(rootReducer)

const demoStyles = {
  container: {
    marginTop: 32,
  },
}

class Demo extends React.Component {
  constructor() {
    super()

    this.state = { selectedDemo: DemoBasic }

    this.onChange = this.onChange.bind(this)
  }

  onChange(event) {
    this.setState({ selectedDemo: demos[event.target.value].component })
  }

  render() {
    const { selectedDemo } = this.state
    const { classes: { container } } = this.props

    return (
      <Provider store={store}>
        <div>
          <Grid container className={container}>
            <Grid item xs={3} />
            <Grid item xs={6}>
              <Typography type="display1" align="center">Select a demo</Typography>
              <Select
                fullWidth
                value={selectedDemo.name}
                onChange={this.onChange}
              >
                {Object.entries(demos).map(kvp =>
                  <MenuItem key={kvp[0]} value={kvp[0]}>{kvp[1].description}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={3} />
          </Grid>
          <div className={container}>
            {createElement(selectedDemo)}
          </div>
        </div>
      </Provider>
    )
  }
}

Demo.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
}

export default withStyles(demoStyles)(Demo)
