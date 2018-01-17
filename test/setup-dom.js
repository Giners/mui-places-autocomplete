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
// The DOM was setup based on the guideance that Enzyme gives as well as how MUI sets up their DOM
// for testing purposes. For more info see:
// * http://airbnb.io/enzyme/docs/guides/jsdom.html
// * https://github.com/mui-org/material-ui/blob/3fdf302d44594c68b0700843aa79793525ad0f7c/test/utils/createDOM.js
import { JSDOM } from 'jsdom'
import Node from 'jsdom/lib/jsdom/living/node-document-position'
import { polyfill as rafPolyfill } from 'raf'

const KEYS = ['HTMLElement']

const jsdom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body id="test-body"></body>
  </html>
`)

global.window = jsdom.window
global.document = undefined
global.Node = Node

// This ought to add 'getComputedStyle()' which is used by PopperJS to the 'global' object
Object.keys(jsdom.window).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = jsdom.window[property]
  }
})

// PopperJS isn't going to work with jsdom out of the box as it relies on real browser DOM APIs to
// work: https://github.com/FezVrasta/popper.js/issues/478#issuecomment-341377821
//
// One of those APIs is 'createRange' which PopperJS uses when finding the offset of the parent of
// some nodes. Although jsdom did provide the API it doesn't anymore:
// https://github.com/tmpvar/jsdom/blame/4c7698f760fc64f20b2a0ddff450eddbdd193176/lib/jsdom/living/nodes/Document.webidl#L39
//
// Here we mock the API ourselves. Note that typically the property
// 'commonAncestorContainer.ownerDocument' on the returned object isn't always the 'document'. But
// for testing purposes this is okay as it merely matches what PopperJS was doing in the past when
// they returned an element for the offset parent. For reference see:
// https://github.com/FezVrasta/popper.js/commit/5e84ac0240bc9551143a8d6647b39eaf02d212a8
global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
})

global.navigator = {
  userAgent: 'node.js',
  appVersion: global.navigator.appVersion,
}

KEYS.forEach((key) => {
  global[key] = window[key]
})

// 'requestAnimationFrame' is used by React
rafPolyfill(global)
