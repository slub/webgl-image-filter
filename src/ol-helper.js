/**
 * Created by mendt on 02.01.16.
 */
goog.provide('glif.olHelper');

glif.olHelper.statusCache_ = {};

/**
 * Functions deactives all layer beside one layer. For proper working every layer needs an id
 *
 * @param {string} layerId
 * @param {ol.Map} map
 */
glif.olHelper.pickLayer = function(layerId, map) {
    // Clear status cache
    glif.olHelper.statusCache_ = {};

    var layers = map.getLayers().getArray();
    for (var i = 0; i < layers.length; i++) {
        glif.olHelper.statusCache_[layers[i].get('id')] = layers[i].getVisible();

        var layerIsVisible = layers[i].get('id') === layerId ? true : false;
        layers[i].setVisible(layerIsVisible);
    }
};

/**
 * Resets the visiblity changes from pick layer
 *
 * @param {ol.Map} map
 */
glif.olHelper.resetPick = function(map) {
    var layers = map.getLayers().getArray();
    for (var i = 0; i < layers.length; i++) {
        var layerIsVisible = glif.olHelper.statusCache_[layers[i].get('id')];
        layers[i].setVisible(layerIsVisible);
    }
};