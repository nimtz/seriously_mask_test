(function () {
    // globals
    var seriously     = new window.Seriously();
    var target        = seriously.target("#canvas");
    var TimelineMax   = window.TimelineMax;
    var TweenMax      = window.TweenMax;
    var Expo          = window.Expo;
    var stats;

    // tween settings
    // state
    var state           = {
        duration        : 5,

        start_scale     : 0.25,
        end_scale       : 2,
        scale           : 0.25,

        start_translate : 0,
        end_translate   : 0,
        translate       : 0,

        do_scale        : true,
        do_translate    : false,
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
    var fgLayers;
    var maskBG;

    var timeline;

    setupStats();
    setupGUI();
    init();

    function init () {
        target                    = seriously.target("#canvas");
        target.width              = window.innerWidth;
        target.height             = window.innerHeight;

        // create nodes
        maskBG                    = seriously.effect("color");
        gradientwipe              = seriously.effect("gradientwipe");
        reformatFG                = seriously.transform("reformat");
        letterLayers              = seriously.effect("layers", {count: 2});
        maskLayers                = seriously.effect("layers", {count: 2});
        fgLayers                  = seriously.effect("layers", {count: 1});
        masterLayers              = seriously.effect("layers", {count: 1});
        transformNode             = seriously.transform("2d");

        transformNode.translate(state.start_translate, 0);
        transformNode.scale(state.start_scale);

        // white bg
        maskBG.color              = [255, 255, 255, 1];
        maskBG.width              = target.width;
        maskBG.height             = target.height;

        // gradient wipe
        gradientwipe.transition   = 0.5;
        gradientwipe.smoothness   = 1;

        // reformat / resizing
        reformatFG.width          = target.width;
        reformatFG.height         = target.height;
        reformatFG.mode           = "cover";

        // connecting nodes
        var k = seriously.transform("reformat");
        k.source = "#maskA";

        k.width = target.width;
        k.height = target.height;
        transformNode.source      = k;              // letterA          >> transformNode
        letterLayers.source0      = transformNode;  // transform node   >> letter layer

        maskLayers.source0        = maskBG;         // color            >> mask layer
        maskLayers.source1        = letterLayers;   // letter layer     >> mask layer

        reformatFG.source         = "#fg";          // foregroundImg    >> reformat
        fgLayers.source0          = reformatFG;     // reformat         >> foreground layer

        gradientwipe.source       = fgLayers;       // foreground layer >> wipe
        gradientwipe.gradient     = maskLayers;     // mask layer       >> wipe
        masterLayers.source0      = gradientwipe;   // wipe             >> master

        target.source             = masterLayers;   // master           >> canvas

        // render
        seriously.go(onrender);
    }
    function onrender () {
        if (state.isTweening) {
            if (state.do_translate) {
                transformNode.translate(state.translate, 0);
            }
            if (state.do_scale) {
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
    function setupGUI () {
        var gui = new window.dat.GUI();
        state.tween = tween;

        // GUI Setup
        gui.add(state, "duration", 1, 10);

        gui.add(state, "start_scale", 0.001, 2);
        gui.add(state, "end_scale", 0.001, 2);

        gui.add(state, "start_translate", -500, 500);
        gui.add(state, "end_translate", -500, 500);

        gui.add(state, "do_translate");
        gui.add(state, "do_scale");
        gui.add(state, "tween");

        gui.add(state, "translate").listen();
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
