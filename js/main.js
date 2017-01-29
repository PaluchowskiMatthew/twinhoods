var mapLausanne;
var mapZurich;
var currentLausanneLayer;
var ajaxRequest;
var plotlist;
var plotlayers=[];

function initmaps() {
  // set up the maps
  mapLausanne = new L.map('map-lausanne');
  mapZurich = new L.map('map-zurich');

  // Set start positions
  mapLausanne.setView([46.5522464,6.6528379], 13);
  mapZurich.setView([47.379991,8.530877], 13);

  // Map Descriptors
  var zurich_to_lausanne_descriptors = null;
  $.getJSON("js/zurich_to_lausanne.json", function(descriptors) {
    zurich_to_lausanne_descriptors = descriptors
    zh_to_laus = zurich_to_lausanne_descriptors['types']['all']

  });
  var lausanne_to_zurich_descriptors = null;
  $.getJSON("js/lausanne_to_zurich.json", function(descriptors) {
    lausanne_to_zurich_descriptors = descriptors
    laus_to_zh = lausanne_to_zurich_descriptors['types']['all']
  });

  // Add openstreetmap layer
  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  var osmLausanne = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});
  var osmZurich = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});

  mapLausanne.addLayer(osmLausanne);
  mapZurich.addLayer(osmZurich);

  // Reference carrier for layers
  laus_idx = []
  zh_idx = []

  function resetPolygons(){
    all_layers = zh_idx.concat(laus_idx);
    for(var lref in all_layers){
      all_layers[lref].setStyle({fillColor: '#FFFFFF'});
    }
  }


  // Add quartiers overlay
  var quartiersLausanne = new L.GeoJSON.AJAX("js/quartiers_lausanne.geojson",
  { onEachFeature: function(feature, layer) {
    laus_idx.push(layer);
    layer.on('click', function(e) {
      resetPolygons()

      origin = laus_idx.indexOf(layer);
      target = laus_to_zh[origin];
      leaf_target = zh_idx[target];
      layer.setStyle({fillColor: '#00ff00'});
      leaf_target.setStyle({fillColor: '#ff0000'});
      lausanneInfo.update(layer.feature.properties);
      currentLausanneLayer = layer._leaflet_id
      zurichInfo.update(leaf_target.feature.properties)
    });
    layer._leaflet_id = feature.id;
  }
});
quartiersLausanne.addTo(mapLausanne);

var lausanneInfo = L.control();

lausanneInfo.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

lausanneInfo.update = function (props) {
  this._div.innerHTML = '<h4>Quartier: </h4>' + (props ? '<b>' + props.Name + '</b>' : 'Click a quartier')
}

// Add quartiers overlay
var quartiersZurich = new L.GeoJSON.AJAX("js/quartiers_zurich.geojson",
{ onEachFeature: function(feature, layer) {
  zh_idx.push(layer);

  layer.on('click', function(e) {
    resetPolygons()

    origin = zh_idx.indexOf(layer)
    target = zh_to_laus[origin]
    leaf_target = laus_idx[target]
    layer.setStyle({fillColor: '#00ff00'});
    leaf_target.setStyle({fillColor: '#ff0000'});
    zurichInfo.update(layer.feature.properties);
    lausanneInfo.update(leaf_target.feature.properties)
  });
}
});
quartiersZurich.addTo(mapZurich);

// Custom info control
  var zurichInfo = L.control();

  zurichInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  zurichInfo.update = function (props) {
    this._div.innerHTML = '<h4>Quartier: </h4>' + (props ? '<b>' + props.Quartiername + '</b>' : 'Click a quartier')
  }

  lausanneInfo.addTo(mapLausanne);
  zurichInfo.addTo(mapZurich);

  $("input[name=descriptor]:radio").change(function () {
    var radio_val = $('input[type=radio]:checked').val();
    //console.log(radio_val);
    zh_to_laus = zurich_to_lausanne_descriptors['types'][radio_val]
    laus_to_zh = lausanne_to_zurich_descriptors['types'][radio_val]

    var layer = quartiersLausanne.getLayer(Number(currentLausanneLayer));
    //fire event 'click' on target layer
    layer.fireEvent('click');
  })

}

initmaps()
