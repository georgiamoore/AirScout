import { PropsWithChildren } from 'react';
import ReactMapGL from 'react-map-gl';

const Map: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <ReactMapGL
        initialViewState={{
            latitude: 52.486473, 
            longitude: -1.889054,
            zoom: 16
        }}
        reuseMaps
        style={{width: 800, height: 600}}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      > 
      {children}
      </ReactMapGL>
    );
}

export default Map;