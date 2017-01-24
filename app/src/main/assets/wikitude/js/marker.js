function Marker(poiData) {

    /*
        For creating the marker a new object AR.GeoObject will be created at the specified geolocation. An AR.GeoObject connects one or more AR.GeoLocations with multiple AR.Drawables. The AR.Drawables can be defined for multiple targets. A target can be the camera, the radar or a direction indicator. Both the radar and direction indicators will be covered in more detail in later examples.
    */

    this.poiData = poiData;

    // create the AR.GeoLocation from the poi data
    var markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude, poiData.altitude);

    // create an AR.ImageDrawable for the marker in idle state
    // ARオブジェクト非選択時の描画状態
    this.markerDrawable_idle = new AR.ImageDrawable(poiData.imageResourceLarge, 5, {
        zOrder: 0,
        opacity: 1.0,
        /*
            To react on user interaction, an onClick property can be set for each AR.Drawable. The property is a function which will be called each time the user taps on the drawable. The function called on each tap is returned from the following helper function defined in marker.js. The function returns a function which checks the selected state with the help of the variable isSelected and executes the appropriate function. The clicked marker is passed as an argument.
        */
        onClick: Marker.prototype.getOnClickTrigger(this)
    });

    // create an AR.ImageDrawable for the marker in selected state
    // ARオブジェクト選択時の描画状態
    this.markerDrawable_selected = new AR.ImageDrawable(poiData.imageResourceLarge, 8, {
        zOrder: 0,
        opacity: 0.0,
        onClick: null
    });

    // create an AR.Label for the marker's title
    // ARオブジェクトのタイトル：先頭10文字を白色#FFFFFFで描画
    this.titleLabel = new AR.Label(poiData.title.trunc(10), 0.6, {
        zOrder: 1,
        offsetY: 0.55,
        style: {
            textColor: '#FFFFFF',
            fontStyle: AR.CONST.FONT_STYLE.BOLD
        }
    });

    // create an AR.Label for the marker's description
    // ARオブジェクトの説明情報：先頭15文字を白色#FFFFFFで描画
    this.descriptionLabel = new AR.Label(poiData.description.trunc(15), 0.3, {
        zOrder: 1,
        offsetY: -0.55,
        style: {
            textColor: '#FFFFFF'
        }
    });

    // create the AR.GeoObject with the drawable objects
    this.markerObject = new AR.GeoObject(markerLocation, { // markerLocationが位置情報
        drawables: {
            // markerDrawable_idleが非選択時、markerDrawable_selectedが選択時の描画状態、titleLabelがARオブジェクトのタイトル、descriptionLabelがARオブジェクトの説明情報
            cam: [this.markerDrawable_idle, this.markerDrawable_selected, this.titleLabel, this.descriptionLabel]
        }
    });

    return this;
}

// AR.ImageDrawable_idle(ARオブジェクト非選択時の描画状態)のonClickで呼び出される関数
Marker.prototype.getOnClickTrigger = function(marker) {

    /*
        The setSelected and setDeselected functions are prototype Marker functions.

        Both functions perform the same steps but inverted, hence only one function (setSelected) is covered in detail. Three steps are necessary to select the marker. First the state will be set appropriately. Second the background drawable will be enabled and the standard background disabled. This is done by setting the opacity property to 1.0 for the visible state and to 0.0 for an invisible state. Third the onClick function is set only for the background drawable of the selected marker.
    */

    return function() {

        if (marker.isSelected) {

            Marker.prototype.setDeselected(marker);

        } else {
            Marker.prototype.setSelected(marker);
            try {
                World.onMarkerSelected(marker);
            } catch (err) {
                alert(err);
            }

        }

        return true;
    };
};

Marker.prototype.setSelected = function(marker) {

    marker.isSelected = true;

    marker.markerDrawable_idle.opacity = 0.0;
    marker.markerDrawable_selected.opacity = 1.0;
    marker.markerDrawable_idle.onClick = null;
    marker.markerDrawable_selected.onClick = Marker.prototype.getOnClickTrigger(marker);
};

Marker.prototype.setDeselected = function(marker) {

    marker.isSelected = false;

    marker.markerDrawable_idle.opacity = 1.0;
    marker.markerDrawable_selected.opacity = 0.0;

    marker.markerDrawable_idle.onClick = Marker.prototype.getOnClickTrigger(marker);
    marker.markerDrawable_selected.onClick = null;
};

// will truncate all strings longer than given max-length "n". e.g. "foobar".trunc(3) -> "foo..."
String.prototype.trunc = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? '...' : '');
};