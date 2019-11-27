// Landslides detection
// Austin L. Wright + Aakash Ahamed
// Created 12/8/2016
// Edited by Aakash Ahamed 2/6/19 to use updated EE functions
// If using this software, please cite the paper here: https://journals.ametsoc.org/doi/pdf/10.1175/EI-D-17-0022.1


// Set map to Laguna
Map.setCenter(121.1930362, 14.2253147);


// helper function to extract the QA bits
function getQABits(image, start, end, mascara) {
 var pattern = 0;
 for (var i = start; i <= end; i++) {
 pattern += Math.pow(2, i);
 }
 return image.select([0], [mascara])
 .bitwiseAnd(pattern)
 .rightShift(start);
}

function getHistYear(year, isQ1) {
  if (isQ1) {
    return (year-1)
  }
  else {
    return year
  }
}

//TEST for quarter date setting
function getLandSlideMapTest(year, quarter, quarterId, isQ1) 
{
var date0 = getHistYear(year, isQ1).toString() + quarter[0];
var date1 = (year.toString() + quarter[1]); 
var date2 = (year.toString() + quarter[2]);

print(date0);
print(date1);
print(date2);
}

function getLandSlideMap(year, quarter, quarterId, isQ1) {

// Set date of interest
var date0 = getHistYear(year, isQ1) + quarter[0];
var date1 = (year.toString() + quarter[1]); 
var date2 = (year.toString() + quarter[2]);

// True Color Visualiziation for landsat
var visParams = {"opacity":1,"bands":["B4","B3","B2"],"min":-10.1,"max":1662.16,"gamma":1.6};


// A function to mask out cloudy pixels.
var maskClouds = function(image) {
 // Select the QA band.
 var QA = image.select('pixel_qa');
 var sombra = getQABits(QA,3,3,  'cloud_shadow');
 var nubes = getQABits(QA,5,5,  'cloud');
 var cirrus_detected = getQABits(QA,9,9,  'cirrus_detected');
 return image.updateMask(sombra.eq(0)).updateMask(nubes.eq(0).updateMask(cirrus_detected.eq(0))
 );
};

// Multi image historic composite
var landsat_historic = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR").filterDate(date0,date1);
landsat_historic = landsat_historic.map(maskClouds).mean();

// Map.addLayer(landsat_historic,visParams, "landsat_historic" )

var b4_hist = landsat_historic.select("B4")
var b5_hist = landsat_historic.select("B5")
var b7_hist = landsat_historic.select("B7")

// Single Landsat 8 scene 
var landsat = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR").filterDate(date1,date2);
landsat = landsat.map(maskClouds);
// Map.addLayer(landsat,visParams, "landsat" );

landsat = landsat.mean()

var b4_new = landsat.select("B4")
var b5_new = landsat.select("B5")
var b7_new = landsat.select("B7")

// SLIP Algorithm

// Soil moisture
var	todayMoisture=(b5_new.subtract(b7_new)).divide(b5_new.add(b7_new))
var	historicMoisture=(b5_hist.subtract(b7_hist)).divide(b5_hist.add(b7_hist))
var	todayMoisture_bin=todayMoisture.gt(-.2).and(todayMoisture.lt(.2));
var	historicMoisture_bin=historicMoisture.gt(-.2).and(historicMoisture.lt(.2));

// Red chagne
var	redChange=(b4_new.subtract(b4_hist)).divide(b4_hist);
var	redChange_bin=redChange.gt(.4).and(redChange.lt(2));

// Put 'em together
var moistureChange_levels=todayMoisture.subtract(historicMoisture);
var moistureChange=todayMoisture_bin.subtract(historicMoisture_bin);
var moistureChange_bin=moistureChange.gte(1);

var finalDetection=moistureChange_bin.add(redChange_bin);
var finalDetection_bin=finalDetection.gte(2);


// Slope Mask
var srtm = ee.Image("USGS/SRTMGL1_003");
var slope = ee.Terrain.slope(srtm)

Map.addLayer(slope, {} , "slope");

var slope_bin_high= slope.gte(50);
var slope_bin_med = slope.gte(35).and(slope.lte(50))
var slope_bin_low = slope.gte(10).and(slope.lte(35))

// NN Filter
var boxcar = ee.Kernel.square({
  radius: 3, units: 'pixels', normalize: true // change rad to adjust sensitivity. Smaller rad gives many false positives. 
});

finalDetection_bin=finalDetection.gte(2).and(slope_bin_med.gte(1));

var Detection_Params = {"opacity":0.5,"bands":["B5"],"palette":["ffffff","fff823","ff0000"]};
var smooth = finalDetection_bin.convolve(boxcar);

// var finals = Map.addLayer(smooth, Detection_Params, "finals")

// Create a geometry representing an export region.
var geometry = ee.Geometry.Rectangle([120.980821, 13.9702483, 121.6171818, 14.6088344]);

// Export the image, specifying scale and region.
Export.image.toDrive({
  image: smooth,
  description: 'landslide_detection_' + year.toString() + '_Q' + quarterId.toString(),
  scale: 15,
  fileFormat: 'GeoTIFF',
  // region: ee.Feature(fc.first()).geometry().bounds().getInfo()['coordinates']
  region: geometry
});

}

var years = [2015, 2016, 2017, 2018, 2019]
var q1= ["-12-01", "-01-01", "-03-01"];
var q2= ["-01-01", "-03-01", "-6-01"];
var q3= ["-03-01", "-06-01", "-9-01"];
var q4= ["-06-01", "-09-01", "-12-01"];
var quarters = [q1, q2, q3, q4];

//print((years[0]-1).toString() + quarters[0][0])

var isQ1 = false;

for( var x = 0; x < 5; x++ ) {
  for( var q = 0; q < 4; q++ ) {
    if(q === 0) { isQ1 = true; } else { isQ1 = false; }
    getLandSlideMap(years[x], quarters[q], q, isQ1)
  }
} 

