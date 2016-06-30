(function () {
    // globals
    var seriously       = new window.Seriously();
    var target          = seriously.target("#canvas");
    var TimelineMax     = window.TimelineMax;
    var TweenMax        = window.TweenMax;
    var Expo            = window.Expo;
    var stats;

    var translate_val   = document.createTextNode("");
    var scale_val       = document.createTextNode("");
    var trns_div        = document.getElementById("translate_value");
    var scale_div       = document.getElementById("scale_value");

    trns_div.appendChild(translate_val);
    scale_div.appendChild(scale_val);

    // state
    var state           = {
        duration        : 5,

        start_scale     : 0.25,
        end_scale       : 2,
        scale           : 0.25,

        start_translate : 0,
        end_translate   : 500,
        translate       : 0,

        do_scale        : false,
        do_translate    : true,
        isTweening      : false
    };

    // seriously nodes
    var transformNode;
    var letterLayers;
    var masterLayers;
    var gradientwipe;
    var maskReformat;
    var maskLayers;
    var reformatFG;
    var aReformat;
    var fgLayers;
    var maskBG;

    var timeline;

    setupStats();
    setupGUI();
    init();

    function init () {
        updateScaleValue();
        updateTranslateValue();

        target                  = seriously.target("#canvas");
        target.width            = window.innerWidth;
        target.height           = window.innerHeight;

        // create nodes
        aReformat               = seriously.transform("reformat");
        maskBG                  = seriously.effect("color");
        gradientwipe            = seriously.effect("gradientwipe");
        reformatFG              = seriously.transform("reformat");
        letterLayers            = seriously.effect("layers", {count: 2});
        maskLayers              = seriously.effect("layers", {count: 2});
        fgLayers                = seriously.effect("layers", {count: 1});
        masterLayers            = seriously.effect("layers", {count: 1});
        transformNode           = seriously.transform("2d");

        // white bg
        maskBG.color            = [255, 255, 255, 1];
        maskBG.width            = target.width;
        maskBG.height           = target.height;

        // gradient wipe
        gradientwipe.transition = 0.5;
        gradientwipe.smoothness = 1;

        // reformat / resizing
        reformatFG.width        = target.width;
        reformatFG.height       = target.height;
        reformatFG.mode         = "cover";

        // connect nodes
        aReformat.source        = "#maskA";
        aReformat.width         = target.width;
        aReformat.height        = target.height;
        transformNode.source    = aReformat;
        letterLayers.source0    = transformNode;
        maskLayers.source0      = maskBG;
        maskLayers.source1      = letterLayers;
        reformatFG.source       = "#fg";
        fgLayers.source0        = reformatFG;
        gradientwipe.source     = fgLayers;
        gradientwipe.gradient   = maskLayers;
        masterLayers.source0    = gradientwipe;
        target.source           = masterLayers;

        // set initial scale and translate
        transformNode.translate(state.start_translate, 0);
        transformNode.scale(state.start_scale);

        // render
        seriously.go(onrender);
    }
    function onrender () {
        if (state.isTweening) {
            if (state.do_translate) {
                updateTranslateValue();
                transformNode.translate(state.translate, 0);
            }
            if (state.do_scale) {
                updateScaleValue();
                transformNode.scale(state.scale);
            }
        }
        stats.update();
    }
    function tween () {
        if (timeline) {
            setTweeningFalse();
        }
        timeline   = new TimelineMax({
            onStart    : setTweeningTrue,
            onComplete : setTweeningFalse
        });
        if (state.do_scale) {
            fromTo({
                target          : state,
                duration        : state.duration,
                position        : 0,
                fromVars        : {scale : state.start_scale},
                toVars          : {scale : state.end_scale}
            });
        }
        if (state.do_translate) {
            fromTo({
                target          : state,
                duration        : state.duration,
                position        : 0,
                fromVars        : {translate : state.start_translate},
                toVars          : {translate : state.end_translate}
            });
        }
    }
    function fromTo (s) {
        timeline.fromTo(s.target, s.duration, s.fromVars, s.toVars, s.position);
    }
    function setTweeningTrue () {
        state.isTweening = true;
    }
    function setTweeningFalse () {
        state.isTweening = false;
        timeline.pause(0, true);
        timeline.remove();
        timeline = null;
    }
    function updateTranslateValue () {
        translate_val.nodeValue = state.translate.toFixed(3);
    }
    function updateScaleValue () {
        scale_val.nodeValue = state.scale.toFixed(3);
    }
    function setupGUI () {
        var gui = new window.dat.GUI();
        var translate;
        var scale;

        state.tween = tween;

        // GUI Setup
        gui.add(state, "duration", 1, 10);

        gui.add(state, "start_scale", 0.001, 20);
        gui.add(state, "end_scale", 0.001, 20);

        gui.add(state, "start_translate", -500, 500);
        gui.add(state, "end_translate", -500, 500);

        gui.add(state, "do_translate");
        gui.add(state, "do_scale");

        /*scale     = gui.add(state, "scale", 0, 2);
        translate = gui.add(state, "translate", -500, 500);

        scale.onChange(function (value) {
            transformNode.scale(value);
        });

        translate.onChange(function (value) {
            updateTranslateValue();
            transformNode.translate(state.translate, 0);
        });*/

        gui.add(state, "tween");
    }
    function setupStats () {
        stats                 = new window.Stats();
        stats.dom.style.left  = "0px";
        stats.dom.style.right = "auto";
        stats.dom.style.width = "100px";
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
    }
})();
