export const geocodeByPlaceID = (placeId) => {
  // After the component is mounted it is safe to create a new instance of the Geocoder client.
  // That's because at this point the Google Maps JavaScript API has been loaded. Also if we do it
  // before the component is mounted (i.e. in 'componentWillMount()') we won't be safe to render
  // on the server (SSR) as the 'window' object isn't available.
  const geocoder = new window.google.maps.Geocoder()

  return new Promise((resolve, reject) => {
    geocoder.geocode({ placeId }, (results, status) => {
      if (status !== window.google.maps.GeocoderStatus.OK) {
        reject(
          new Error(
            `Geocoding query for a place with an ID of '${placeId}' failed - response status: ${status}`,
          ),
        )

        return
      }

      resolve(results)
    })
  })
}

// Disable the ESLint rule camelcase on the next line as the suggestions returned from the Google
// Maps service have properties that are snake cased
// eslint-disable-next-line camelcase
export const geocodeBySuggestion = ({ place_id }) => geocodeByPlaceID(place_id)


export const geocodeByCoordinates = ({ location }) => {
  const geocoder = new window.google.maps.Geocoder()

  return new Promise((resolve, reject) => {
    geocoder.geocode({ location }, (results, status) => {
      if (status !== window.google.maps.GeocoderStatus.OK) {
        reject(
          new Error(
            `Geocoding query for coordinates '${location.lng}, ${location.lat}' failed - response status: ${status}`,
          ),
        )

        return
      }

      resolve(results)
    })
  })
}
