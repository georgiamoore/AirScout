type PlumeData = {
    id: string;
    latitude: number;
    longitude: number;
    pm10: number;
    voc: number;
    no2: number;
  };
  
  type Feature = {
    type: string;
    geometry: {
      type: string;
      coordinates: number[];
    };
    properties: { id: string; pm10: number; time?: string };
  };
  