import React from 'react'
// 'react-dom' is listed in 'devDependencies' for use with the demo of our component. We just
// disable the 'import/no-extraneous-dependencies' rule here so ESLint doesn't complain to us when
// we import it to get the demo working.
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom'
import Demo from './Demo'

ReactDOM.render(<Demo />, document.getElementById('root'))
