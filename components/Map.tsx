import { PropsWithChildren, useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL, { Marker, Popup, NavigationControl, Layer, Source } from "react-map-gl";
const Map = ({ locations }) => {
  const [lng, setLng] = useState(-1.889054);
  const [lat, setLat] = useState(52.486473);
  const [zoom, setZoom] = useState(14);
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
    map.current.on('load', () => {

      map.current.addSource('sensors', {
        type: 'geojson',
        data: locations,
        // cluster: true,
        // clusterMaxZoom: 14, // Max zoom to cluster points on
        // clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });

      map.current.addLayer({
        id: 'pm10',
        type: 'circle',
        source: 'sensors',
        filter: ['has', 'pm10'],
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'pm10'],
            20,
            'rgba(33,102,172,0)',
            40,
            'rgb(103,169,207)',
            60,
            'rgb(253,219,199)',
            80,
            'rgb(178,24,43)'
          ],

        },
        layout: {
          'visibility': 'visible'
        }
      });
      map.current.addLayer({
        id: 'voc',
        type: 'circle',
        source: 'sensors',
        filter: ['has', 'voc'],
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'voc'],
            80,
            'rgba(33,102,172,0)',
            90,
            'rgb(103,169,207)',
            100,
            'rgb(253,219,199)',
            110,
            'rgb(178,24,43)'
          ],

        },
        layout: {
          'visibility': 'visible'
        }
      });

      map.current.addLayer({
        id: 'no2',
        type: 'circle',
        source: 'sensors',
        filter: ['has', 'no2'],
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'no2'],
            80,
            'rgba(33,102,172,0)',
            90,
            'rgb(103,169,207)',
            100,
            'rgb(253,219,199)',
            110,
            'rgb(178,24,43)'
          ],

        },
        layout: {
          'visibility': 'visible'
        }
      });

    });

    map.current.on('idle', () => {
      // If these two layers were not added to the map, abort
      if (!map.current.getLayer('pm10') || !map.current.getLayer('voc') || !map.current.getLayer('no2')) return;

      // Enumerate ids of the layers.
      const toggleableLayerIds = ['pm10', 'voc', 'no2'];

      // Set up the corresponding toggle button for each layer.
      for (const id of toggleableLayerIds) {
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
          continue;
        }

        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = 'toggle ' + id;
        link.className = 'active';

        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
          const clickedLayer = this.id;
          e.preventDefault();
          e.stopPropagation();

          const visibility = map.current.getLayoutProperty(
            clickedLayer,
            'visibility'
          );

          // Toggle layer visibility by changing the layout object's visibility property.
          if (visibility === 'visible') {
            map.current.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
          } else {
            this.className = 'active';
            map.current.setLayoutProperty(
              clickedLayer,
              'visibility',
              'visible'
            );
          }
        };

        const layers = document.getElementById('menu');
        layers.appendChild(link);
      }
    });

    map.current.addControl(new mapboxgl.NavigationControl());
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });


  return (
    <div>


      <div ref={mapContainer} className="map-container">
        <nav id="menu" />
      </div>
      <p>loaded {locations.features ? locations.features.length : ''} data points</p>
    </div>
  );
};

export default Map;
