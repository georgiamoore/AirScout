import { PropsWithChildren, useEffect, useState } from "react";
import ReactMapGL, { Marker, Popup, NavigationControl, Layer, Source } from "react-map-gl";
const Map = ({ locations, showPopup, setShowPopup }) => {

  const layerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 100,
      'circle-color': '#ff0000',
    },
    layout: {
      // Make the layer visible by default.
      'visibility': 'visible'
    }
    // 'source-layer': 'sensors'
};

return (
  <ReactMapGL
    initialViewState={{
      latitude: 52.486473,
      longitude: -1.889054,
      zoom: 16,
    }}
    reuseMaps
    style={{ width: 800, height: 600 }}
    mapStyle="mapbox://styles/mapbox/streets-v11"
    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  >

    <Source id="sensors" type="vector"  url='mapbox://mapbox.2opop9hr'>
      <Layer {...layerStyle} />
    </Source>
    {/* {locations.map((location) => (
        <div key={location.id}>
          <Marker
            latitude={location.latitude}
            longitude={location.longitude}
            onClick={() => {
              setSelectedLocation(location);
              console.log("click");
            }}
          ></Marker>
        
        </div>
      ))} */}
    <NavigationControl />
  </ReactMapGL>
);
};

export default Map;
