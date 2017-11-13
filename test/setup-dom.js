// Full DOM rendering with the Enzyme testing library for React (http://airbnb.io/enzyme/) or the
// React test utilities (https://reactjs.org/docs/test-utils.html#renderintodocument) is useful for
// when you have components that interact with DOM APIs or may require full lifecycle support to
// fully test the component. Full DOM rendering requires a full DOM API to be available at the
// global scope. This script sets up a full DOM API at the global scope using the jsdom library
// (https://github.com/tmpvar/jsdom).
//
// It is recommended that you load a document into the global scope *before* requrining the React
// library for the first time. This is because React makes several assumptions about the
// environment it is running in and one of them is that the document (i.e. 'global.document') that
// is found at "require time" is going to be the one and only document it ever needs to worry about.
//
// Note that it is important that your tests using the global DOM APIs don't have "leaky"
// side-effects which could change the results of other tests.
//
// For more info see: http://airbnb.io/enzyme/docs/guides/jsdom.html

import { JSDOM } from 'jsdom'

const copyProps = (src, target) => {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .map(prop => Object.getOwnPropertyDescriptor(src, prop))

  Object.defineProperties(target, props)
}

const jsdom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body id="test-body"></body>
  </html>
`)

const { window } = jsdom

global.window = window
global.document = window.document
global.navigator = { userAgent: 'node.js' }

copyProps(window, global)
