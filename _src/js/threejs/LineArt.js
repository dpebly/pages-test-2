
import Easing from './Easing';
import { portrait } from './portrait'
import { hobbies } from './hobbies'
import { airplane } from './airplane'


Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth-1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
});


export default function LineArt(scene) {
      var points = [
            portrait,
			hobbies,
			airplane,
    ];

	var lineResolution = 4000;
	var material = new THREE.LineBasicMaterial( { color: 0x000000 } );

    var tmpPoints = points.map((arr, index) => new THREE.CatmullRomCurve3( arr ).getSpacedPoints(lineResolution));
    
    var path = new THREE.CatmullRomCurve3( tmpPoints.flat() );
    path.arcLengthDivisions = lineResolution * points.length;

    // params
    var pathSegments = 4096 * 2;
    var tubeRadius = 0.1;
    var radiusSegments = 6;
    var closed = false;
    var vertexMultiple = radiusSegments * 3 * 2;

    // geometry
    var geometry = new THREE.TubeGeometry( path, pathSegments, tubeRadius, radiusSegments, closed );
    geometry = new THREE.BufferGeometry().fromGeometry( geometry );

	var nMax = geometry.attributes.position.count;
     var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide
    }); 
    
    // mesh
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

	let introLoad = 0
	let introAnimateMult = 1;

    // don't animate if we're not at the top
	if (window.scrollY > 1 ) {
		introLoad = 1;
	}

    const totalLength = path.getLength()
    const pointsPerPanel = points.map(p => p.length)


    const padOffsetStart = .15;
    const padOffsetEnd = .85;


    const panelPadding = [
        {'start': 0, 'end': .054},
        {'start': .032, 'end': .0035},
        {'start': .14, 'end': .00},
        {'start': .00, 'end': .00},
    ]


    this.update = function(currentpanelIndex, scrollPos) {

		if (introLoad < 1) {
			introLoad += .0075;
		} else if (introLoad > 1) {
			introLoad = 1;
		}

		introAnimateMult = Easing.easeOutQuad(introLoad)


		// DRAW RANGE END
		const scrollPosEase = Easing.easeInOutQuad(scrollPos)

		// completed points -- begin with line resolution to start with 
		const completedPoints = pointsPerPanel.reduce((total, points, index) => {
			if (currentpanelIndex > index) return total + lineResolution
			return total
		}, 0)


        // PADDING 
        let paddPosMult = scrollPosEase > padOffsetEnd ? remapRange(scrollPosEase, padOffsetEnd, 1.0, 0.0, 1.0) : remapRange(scrollPosEase, 0, padOffsetStart, 1.0, 0.0);
        let paddingPosInfluence = (paddPosMult >= 0 && paddPosMult <= 1) ? paddPosMult : 0;

        // PADDING START
        const currentPaddingStart = 1 + panelPadding[currentpanelIndex]['start'];
        
        const futurePaddingStart = Object.is(panelPadding[currentpanelIndex + 1], undefined) ? currentPaddingStart : (1 + panelPadding[currentpanelIndex + 1]['start']);
        const dynamicPaddingStart = remapRange(scrollPosEase, 0, 1, currentPaddingStart, futurePaddingStart)

        const paddingStartMult = paddingPosInfluence * dynamicPaddingStart;
        const paddingStartMultRemap = remapRange(paddingStartMult, 0, dynamicPaddingStart, 1, dynamicPaddingStart);

        // PADDING END

        // somehow need a way to tween between the two end padding values while scrolling

        const currentPaddingEnd = 1 - panelPadding[currentpanelIndex]['end'];
        const futurePaddingEnd = Object.is(panelPadding[currentpanelIndex + 1], undefined) ? currentPaddingEnd : (1 - panelPadding[currentpanelIndex + 1]['end']);
        const dynamicPaddingEnd = remapRange(scrollPosEase, 0, 1, currentPaddingEnd, futurePaddingEnd)



        const paddingEndMult = paddingPosInfluence * dynamicPaddingEnd;
        const paddingEndMultRemap = remapRange(paddingEndMult, 0, dynamicPaddingEnd, 1, dynamicPaddingEnd)





        // DRAW RANGE START -------------------------------------------------------------------------------------------------------
        // calculate multiplier based on points (using previous panels & the current scroll position)
        const startPointsMult = ((completedPoints) + (scrollPosEase * lineResolution)) * paddingStartMultRemap / (points.length * lineResolution) 

        // get the closest point using the point multipler
        const startPointIndex = Math.round(startPointsMult * points.length * lineResolution)

        // get the length of the line at this point
        const startLength = path.getLengths(lineResolution * points.length)[startPointIndex]

        // calulate multiplier based on length of line
        const startLengthMult = startLength / totalLength

        // rounding to nearest vertext multiple
        const nStart = vertexMultiple * Math.floor((startLengthMult * nMax)/ vertexMultiple)
        const drawRangeStart = Math.max(0, nStart)
        // -----------------------------------------------------------------------------------------------------------------------


        // DRAW RANGE END ---------------------------------------------------------------------------------------------------------
        // calculate multipler based on points (using previous panels & current scroll position)
        // this also factors in the intro animation multiplier responsible for the initial animation.
        const endPointsMult = ((completedPoints + (introAnimateMult * lineResolution)) + (scrollPosEase * lineResolution)) * paddingEndMultRemap / (points.length * lineResolution) 
        // FOR WHEN WE WANT TO INTRODUCE PADDING:
		// const endPointsMult = ((completedPoints + (introAnimateMult * lineResolution)) + (scrollPosEase * lineResolution)) * panelPadEndMultRemap / (points.length * lineResolution) 

		// get the closest point using the point multipler
		const endPointIndex = Math.round(endPointsMult * points.length * lineResolution)

        // get the length of the line at this point
		const endPointLength = path.getLengths(lineResolution * points.length)[endPointIndex]
		// calulate multiplier based on length of line
        const endLengthMult = (endPointLength - startLength) / totalLength

        // rounding to nearest vertext multiple
		const nEnd = vertexMultiple * Math.ceil((endLengthMult * nMax)/vertexMultiple)
		const drawRangeEnd = Number.isNaN(nEnd) ? nMax : nEnd;
        // -----------------------------------------------------------------------------------------------------------------------


        // draw appropriate section of line
        mesh.geometry.setDrawRange( drawRangeStart, drawRangeEnd);





    }

}

function remapRange(val, in_min, in_max, out_min, out_max) {
  return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
