try {
    const pkg = require('react-map-gl/mapbox');
    console.log('Success: react-map-gl/mapbox found');
    console.log('Exports:', Object.keys(pkg));
} catch (e) {
    console.error('Error: Could not require react-map-gl/mapbox');
    console.error(e.message);
    console.error('Code:', e.code);
}
