# MUIPlacesAutocomplete
[![Build Status](https://travis-ci.org/Giners/mui-places-autocomplete.svg?branch=master)](https://travis-ci.org/Giners/mui-places-autocomplete)

![Preview](http://g.recordit.co/Rxd49dwbev.gif)

# Features
* Easy-to-use component for searching for places
* Place suggestions displayed in realtime
* Input state can be controlled externally
* Promise based [geocoding utility functions (latitude/longitude)](#geocodingFunctions)
* Google Material Design styling provided by Material-UI (v1)
* Safe to render on the server (SSR)
* Integrates with other 3rd party libraries (e.g. [Redux Form](#advancedUsage))
* Thoroughly tested

# Installation
To install this component run the following command:

```
yarn add mui-places-autocomplete --ignore-scripts
```

or

```
npm install mui-places-autocomplete --save --ignore-scripts
```

Note that if you exclude the `--ignore-scripts` option when installing a package then the `prepublish` script in `package.json` is ran after installing locally. Tests are ran as part of the `prepublish` script and they will fail if you haven't yet set a Google API key to the enivronment variables `GOOGLE_API_KEY` or `GOOGLE_API_TEST_KEY` (see [setup section](#setup)).

# Demo
**Note that you must have followed the [setup steps](#setup) to run the demo as it depends on services provided by Google.**

To see a demo of this component locally clone this repository and run:

```
yarn demo
```

or

```
npm run demo
```

# Usage
```javascript
import React from 'react'
import SomeCoolComponent from 'some-cool-component'
import MUIPlacesAutocomplete from 'mui-places-autocomplete'

class Example extends React.Component {
  constructor() {
    super()

    this.onSuggestionSelected = this.onSuggestionSelected.bind(this)
  }

  onSuggestionSelected(suggestion) {
    // Add your business logic here. In this case we just log...
    console.log('Selected suggestion:', suggestion)
  }

  render() {
    // Use 'renderTarget' prop to render a component/target we want the suggestions to popover

    return (
      <MUIPlacesAutocomplete
        onSuggestionSelected={this.onSuggestionSelected}
        renderTarget={() => (<SomeCoolComponent />)}
      />
    )
  }
}

export default Example
```

<a name="advancedUsage"></a>
### Advanced Usage

* [DemoControlledInput.jsx](https://github.com/Giners/mui-places-autocomplete/blob/master/demo/DemoControlledInput.jsx) - Example that shows how to control the `<input>` element as well as integrate with Redux Form.
* [DemoGeocodeLatLong.jsx](https://github.com/Giners/mui-places-autocomplete/blob/master/demo/DemoGeocodeLatLong.jsx) - Example that shows how to obtain the latitude/longitude of a selected suggestion.

<a name="setup"></a>
### Setup
This component relies on some basic setup before usage. It makes use of services provided by Google. To properly make use of the services you will need to do three things:
1. Enable the Google Places API Web Service
2. (Optional) Enable the Google Maps Geocoding API (only required if making use of the [geocoding utility functions](#geocodingFunctions))
3. Enable the Google Maps JavaScript API
4. Obtain a Google API key

You can do all of these things from your Google developers console here: https://console.developers.google.com

The component relies on the Places library in the Google Maps JavaScript API. To load the Places library on the client you must add the following to the HTML document you deliver to your clients:

```html
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```

Be sure that you replace `YOUR_API_KEY` with the one you just created or obtained previously.

This component also has testing which makes use of the Places library in the Google Maps JavaScript API. Rather than loading the Places library it uses a module provided by Google. It also requires an API key. This key can be provided to a file @ `test/api-key.js`. If you would like it can also be provided as an environment variable named `GOOGLE_API_KEY` or `GOOGLE_API_TEST_KEY`.

### Props

| Prop | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`onSuggestionSelected`](#onSuggestionSelected) | Function | ✓ | Callback that provides the selected suggestion. |
| [`renderTarget`](#renderTarget) | Function | ✓ | Renders the components/elements that you would like to have the list of suggestions popover. |
| [`createAutocompleteRequest`](#createAutocompleteRequest) | Function | | Returns an object that modifies which suggestions are shown to the user. |
| [`textFieldProps`](#textFieldProps) | Object | | Props that will be spread onto a `<TextField>` MUI component that is responsible for rendering the `<input>` element. If you would like to [control the state of the `<input>` element](#textFieldPropsValueProp) externally you must set the `value` key on the object passed to `textFieldProps`. |
| [`suggestionsContainerProps`](#suggestionsContainerProps) | Object | | Props that will be included on the `<Popper>` container component which includes the list of suggestions. |

<a name="onSuggestionSelected"></a>
#### onSuggestionSelected (required)

This function will be called everytime a user has selected a suggestion. It has the following signature:

```javascript
function onSuggestionSelected(suggestion)
```

<a name="renderTarget"></a>
#### renderTarget (required)

This function is invoked during rendering. It ought to return the components/elements that you want the list of suggestions to render (pop) over.

<a name="createAutocompleteRequest"></a>
#### createAutocompleteRequest

`<MUIPlacesAutocomplete>` leverages the Google Places API Web Service to provide place suggestions that a user may select from based on the users input. The requests made to the Google Places API Web Service are very simple by default. This results in a wider breadth in the types of suggestions (i.e. an establishment, city/locality, specific address, etc.) returned when the user first starts searching for a place. The set of returned suggestions may also not be geospatially tight ("close to each other"). As the users search becomes more specific the types of suggestions returned start to narrow as well as tighten geospatially around each other.

Depending on your use case you may wish to:
* Specify (i.e. narrow) the types of suggestions returned by the Google Places API Web Service
* Bias/restrict the suggestions returned by the Google Places API Web Service to a specific area

You can achieve this by providing a function to the `createAutocompleteRequest` prop. The function is called everytime a request for suggestions is made to the Google Places API Web Service. The function passed to the `createAutocompleteRequest` prop ought to have the following signature:

```javascript
function createAutocompleteRequest(inputValue)
```

Where:
* `inputValue` - The users current search value

It ought to return an object that specifies what suggestions (i.e. types and bias/area restrictions) should be returned by the Google Places API Web Service. For example:

```javascript
function createAutocompleteRequest(inputValue) {
  // Restrict the returned suggestions to those that:
  // 1) Are in Bellingham (latitude 48.7519, longitude 122.4787)
  // 2) Are within ~3 miles (5000 meters)
  // 3) Have an address associated with them
  return {
    input: inputValue,
    types: ['address'],
    location: { lat: () => 48.7519, lng: () => 122.4787 },
    radius: 5000,
  }
}
```

The properties that are allowed on the returned object are documented here: [AutocompleteRequest API object specification](https://developers.google.com/maps/documentation/javascript/reference#AutocompletionRequest)

**Note:** There is no validation for what is returned from the function provided to the `createAutocompleteRequest` prop. So if you don't return an object or set the properties incorrectly then things are going to go poorly.

<a name="textFieldProps"></a>
#### textFieldProps

A MUI [`<TextField>`](https://material-ui-next.com/api/text-field/) component is used to render the `<input>` element. It can be customized to meet your needs by supplying an object to the `textFieldProps` prop. All properties on the object supplied to the `textFieldProps` prop will be spread onto the `<TextField>` component. You can read more about the props that the `<TextField>` component accepts here: [`<TextField>` API documentation](https://material-ui-next.com/api/text-field/)

<a name="textFieldPropsValueProp"></a>
##### `textFieldProps.value` `<input>` control prop

To help meet your needs the state of the `<input>` element can be controlled externally. It is also useful if you would like to integrate `<MUIPlacesAutocomplete>` with other 3rd party libraries such as [Redux Form](https://redux-form.com). To control the state of the `<input>` element you must set the `value` property on the object passed to the `textFieldProps` prop.

```javascript
// 'getState()' can return state from a React component, your app (e.g via Redux), some other source, etc.
const { inputValue } = getState()

<MUIPlacesAutocomplete textFieldProps={{ value: inputValue }} />
```

If you would like to have consistency between the controlled `<input>` elements state as well as any suggestions that are selected then you need to update the controlled state of the `<input>` element when a [suggestion is selected](#onSuggestionSelected). There is an example of how to do this in the [advanced usage section](#advancedUsage).

<a name="suggestionsContainerProps"></a>
#### suggestionsContainerProps

A `<Popper>` component is used to contain the suggestions displayed to the user. It can be customised to meet your needs by supplying an object to the `suggestionsContainerProps` prop. All properties on the object supplied to the `suggestionsContainerProps` prop will be spread onto the `<Popper>` component. You can read more about the props that the `<Popper>` component accepts here: [`<Popper>` Github Repository](https://github.com/FezVrasta/react-popper)

Below is an example of how to control the width of the suggestions container using the `style` property of the `suggestionsContainerProps` object:

```javascript
<MUIPlacesAutocomplete suggestionsContainerProps={{ style: { width: '400px' } }} />
```

<a name="geocodingFunctions"></a>
### Geocoding utility functions (latitude/longitude)

`<MUIPlacesAutocomplete>` is focused on providing functionality for searching for places of interest and providing realtime suggestions to searches. To accomplish this `<MUIPlacesAutocomplete>` leverages the Google Places API Web Service to provide place suggestions. The place suggestions returned by the Google Places API Web Service doesn't include any geospatial data (i.e. latitude/longitude). Depending on your use case you may require geospatial data about the suggestions.

To facilitate consumers of `<MUIPlacesAutocomplete>` and their different use cases, geocoding utility functions have been packaged together with the `<MUIPlacesAutocomplete>` component. Geocoding will allow you to convert addresses into geospatial data/coordinates such as latitude and longitude. For a complete demo showing how to use the geocoding utility functions see the [advanced usage section](#advancedUsage).

**Note:** To make use of the geocoding utility functions you must enable the Google Maps Geocoding API. For more info see the [setup section](#setup).

<a name="geocodeByPlaceID"></a>
#### geocodeByPlaceID

Each suggestion returned to `<MUIPlacesAutocomplete>` by the Google Places API Web Service has a property named `place_id`. The `place_id` property contains a value that uniquely identifies a place in the Google Places database. The `place_id` property can be used in conjunction with the `geocodeByPlaceID()` function to get geospatial data for any suggestion.

The `geocodeByPlaceID()` function has the following signature:

```javascript
function geocodeByPlaceID(placeId)
```

Where:
* `placeId` - Unique identifier for a place in the Google Places database

The `geocodeByPlaceID()` function returns a promise that contains the results of the request made with the Google Maps Geocoding API.

```javascript
import React from 'react'
import SomeCoolComponent from 'some-cool-component'
import MUIPlacesAutocomplete, { geocodeByPlaceID } from 'mui-places-autocomplete'

class Example extends React.Component {
  constructor() {
    super()

    // Setup your state here...
    this.state = { coordinates: null }

    this.onSuggestionSelected = this.onSuggestionSelected.bind(this)
  }

  onSuggestionSelected(suggestion) {
    geocodeByPlaceID(suggestion.place_id).then((results) => {
      // Add your business logic here. In this case we simply set our state with the coordinates of
      // the selected suggestion...

      // Just use the first result in the list to get the geometry coordinates
      const { geometry } = results[0]

      const coordinates = {
        lat: geometry.location.lat(),
        lng: geometry.location.lng(),
      }

      this.setState({ coordinates })
    }).catch((err) => {
      // Handle any errors that occurred when we tried to get geospatial data for a selected
      // suggestion...
    })
  }

  render() {
    // Your render logic here...
  }
}

export default Example
```

The properties that are returned on the array of geocode results are documented here: [GeocodeResult API object specification](https://developers.google.com/maps/documentation/javascript/reference/3/#GeocoderResult)

#### geocodeBySuggestion

The `geocodeBySuggestion()` function is a wrapper around the [`geocodeByPlaceID()`](#geocodeByPlaceID) function. It has the following signature:

```javascript
function geocodeBySuggestion(suggestion)
```

Where:
* `suggestion` - Object representing a suggestion returned by the Google Places API Web Service which has a property named `place_id` that uniquely identifies a place in the Google Places database.

It has the same behavior as the `geocodeByPlaceID()` function where it returns a promise that contains the results of the request made with the Google Maps Geocoding API.

# Feedback
This was my first open-source project that I undertook while I was teaching myself full-stack development (JS (ES6)/HTML/CSS, Node, Express, NoSQL (DynamoDB), GraphQL, React, Redux, Material-UI, etc.). I'm very interested in taking feedback to either improve my skills (i.e. correct errors :)) or to make this component more useful in general/for your use case. Please feel free to provide feedback by opening an issue or messaging me.

# References
* Info about the Google Maps JavaScript API: https://developers.google.com/maps/documentation/javascript/libraries
* Overview and examples for the Autocomplete features in the Maps library: https://developers.google.com/maps/documentation/javascript/places-autocomplete
* Overview and examples for the Geocoding features in the Maps library: https://developers.google.com/maps/documentation/geocoding/intro

# License
[MIT](https://gine.mit-license.org/)
