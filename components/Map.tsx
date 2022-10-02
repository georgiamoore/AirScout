import { PropsWithChildren, useEffect, useState } from "react";
import ReactMapGL, { Marker, Popup, NavigationControl } from "react-map-gl";
const Map = ({ locations, showPopup, setShowPopup }) => {
  console.log(locations);
  console.log(showPopup);
  const [selectedLocation, setSelectedLocation] = useState({});
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
      {showPopup && (
        <Popup
          longitude={-1.889054}
          latitude={52.486473}
          anchor="bottom"
          onClose={() => {
            console.log("closed");
            setShowPopup(false);
          }}
        >
          You are here
        </Popup>
      )}{" "}
      {locations.map((location) => (
        <div key={location.id}>
          <Marker
            latitude={location.center[1]}
            longitude={location.center[0]}
            onClick={() => {
              setSelectedLocation(location);
              console.log("click");
            }}
          ></Marker>
          {selectedLocation.id === location.id && (
            <Popup
              onClose={() => setSelectedLocation({})}
              closeOnClick={true}
              latitude={location.center[1]}
              longitude={location.center[0]}
            >
              {location.place_name}
            </Popup>
          )}
        </div>
      ))}
      <NavigationControl />
    </ReactMapGL>
  );
};

export default Map;
