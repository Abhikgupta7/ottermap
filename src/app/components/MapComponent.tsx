'use client'
import React, { useState, useEffect } from 'react'; // Import React and necessary hooks
import Draw from 'ol/interaction/Draw.js'; // Import Draw interaction from OpenLayers
import { Map, View } from 'ol'; // Import Map and View from OpenLayers
import { OSM, Vector as VectorSource } from 'ol/source.js'; // Import OSM and VectorSource from OpenLayers
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js'; // Import TileLayer and VectorLayer from OpenLayers
import 'ol/ol.css'; // Import OpenLayers CSS
import styles from './MapComponent.module.css'; // Import CSS module for styling

// Define types for the selected geometry
type GeometryType = "" | "Point" | "LineString" | "Polygon" | "None";

function MapComponent() {
    const [val, setval] = useState<number>(0) // State to store the calculated area/length
    const [selectedGeometry, setSelectedGeometry] = useState<GeometryType>(""); // State to store the selected geometry type

    // Function to handle change in the select input
    const handleGeometryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGeometry(event.target.value as GeometryType); // Update the selected geometry type
        setval(0); // Reset the calculated value when geometry type changes
    };

    useEffect(() => {
        // Create map layers and initialize OpenLayers map
        const raster = new TileLayer({
            source: new OSM(),
        });

        const source = new VectorSource({ wrapX: false });

        const vector = new VectorLayer({
            source: source,
        });

        const map = new Map({
            layers: [raster, vector],
            target: 'map',
            view: new View({
                center: [-11000000, 4600000],
                zoom: 4,
            }),
        });

        let draw; // Variable to hold the draw interaction

        // Function to add draw interaction based on selected geometry type
        function addInteraction() {
            if (selectedGeometry !== "" && selectedGeometry !== "None") {
                draw = new Draw({
                    source: source,
                    type: selectedGeometry
                });

                // Event listener for when drawing ends
                if (selectedGeometry === 'Polygon') {
                    draw.on('drawend', (event) => {
                        const feature = event.feature;
                        const geometry: any = feature.getGeometry();
                        const area = geometry.getArea();
                        setval(area); // Update the state with the calculated area
                    });
                } else if (selectedGeometry === 'LineString') {
                    draw.on('drawend', (event) => {
                        const feature = event.feature;
                        const geometry: any = feature.getGeometry();
                        const length = geometry.getLength();
                        setval(length); // Update the state with the calculated length
                    });
                }

                map.addInteraction(draw); // Add the draw interaction to the map
            }
        }

        addInteraction(); // Add draw interaction when component mounts


        return () => map.setTarget(undefined); // Cleanup function to remove map when component unmounts
    }, [selectedGeometry]); // Run effect when selected geometry type changes

    return (
        <>
            <div className={styles.row}>
                <img src="https://firebasestorage.googleapis.com/v0/b/images-storage-d9e0b.appspot.com/o/data%2FOttermaplogo.png?alt=media&token=e7a96f01-5f3a-484d-9ca4-7efd4f204276" alt="Otter" />
                {/* Dropdown to select geometry type */}
                <select className={styles.dropdown} value={selectedGeometry} onChange={handleGeometryChange}>
                    <option value="">Select</option>
                    <option value="Point">Point</option>
                    <option value="LineString">Line</option>
                    <option value="Polygon">Polygon</option>
                    <option value="None">None</option>
                </select>

                {/* Display calculated area/length */}
                <p style={{ fontSize: '30px' }}>
                    Calculation: {val}
                </p>
            </div>
            <div id="map" className={styles.map}></div> {/* OpenLayers map container */}
        </>
    );
}

export default MapComponent;
