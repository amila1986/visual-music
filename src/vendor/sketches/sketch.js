import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import 'p5/lib/addons/p5.dom';

export default function sketch(p) {
    let song;
    let fft;
    let amplitude;
    let volume;
    let isPlaying = false;

    let width = 900;
    const height = 500;
    const divisions = 5;
    const speed = 1;

    let canvas;

    p.setup = function() {
        p.background(7, 11, 21);
        canvas = p.createCanvas(width, height);
        fft = new p5.FFT(0.9, 256); // for the waves
        amplitude = new p5.Amplitude(); // for the ellipses
        p.noFill();
        p.stroke(0, 100);
    };

    //Custom redraw that will trigger upon state change
    p.myCustomRedrawAccordingToNewPropsHandler = function(props) {
        //We need to resize canvas
        //and set width property to new width
        //so drawing will bease on this new width
        width = props.canvasWidth;
        p.resizeCanvas(props.canvasWidth, height);

        if (song) {
            if (song.isLoaded()) {
                volume = props.volume;
                isPlaying = props.isPlaying;

                //monitor volume change and toggling of pause/play button
                song.setVolume(parseFloat(volume));
                p.togglePlaying(song);

                //Reinitializes song if a new file is uploaded
                if (song.file !== props.uploadedSong) {
                    song.dispose();
                    song = p.loadSound(props.uploadedSong);
                }
            }
        } else {
            //handles initial song load
            if (props.uploadedSong) {
                song = p.loadSound(props.uploadedSong);
            }
        }
    };

    p.togglePlaying = function(song) {
        if (isPlaying && !song.isPlaying()) {
            song.play();
        } else if (!isPlaying && song.isPlaying()) {
            song.pause();
        }
    };

    p.draw = function() {
        // WAVES
        const h = height / divisions;
        const spectrum = fft.analyze();

        let scaledSpectrum = p.splitOctaves(spectrum, 12);
        const spectrumLength = scaledSpectrum.length;

        p.background(253, 155, 74, 1);

        // copy before clearing the background
        p.copy(canvas, 0, 0, width, height, 0, speed, width, height);

        // draw shape
        p.beginShape();

        // one at the far corner
        p.curveVertex(0, h);

        for (let i = 0; i < spectrumLength; i++) {
            let point = p.smoothPoint(scaledSpectrum, i, 2);
            let x = p.map(i, 0, spectrumLength - 1, 0, width);
            let y = p.map(point, 0, 255, h, 0);
            p.curveVertex(x, y);
        }

        // one last point at the end
        p.curveVertex(width, h);

        p.endShape();

        // ELLIPSE 1
        let songVolume = amplitude.getLevel();
        let ellipseDiameter = p.map(songVolume, 0, 1, 40, 500); // you need the map() in order to get a big enough ellipse

        if (songVolume < 0.1) {
            p.fill(15, 167, 151);
        } else if (songVolume < 0.2) {
            p.fill(196, 51, 136);
        } else {
            p.fill(253, 155, 74);
        }
        p.ellipse(width / 2, height / 2, ellipseDiameter, ellipseDiameter);

        // ELLIPSE 2
        let ellipseDiameter2 = p.map(songVolume, 0, 1, 60, 600);
        if (songVolume < 0.01) {
            p.fill(196, 51, 136);
        } else if (songVolume < 0.06) {
            p.fill(253, 155, 74);
        } else {
            p.fill(15, 167, 151);
        }
        p.ellipse(width / 4, height / 4, ellipseDiameter2, ellipseDiameter2);
    };

    /**
     *  Divides an fft array into octaves with each
     *  divided by three, or by a specified "slicesPerOctave".
     *
     *  There are 10 octaves in the range 20 - 20,000 Hz,
     *  so this will result in 10 * slicesPerOctave + 1
     *
     *  @method splitOctaves
     *  @param {Array} spectrum Array of fft.analyze() values
     *  @param {Number} [slicesPerOctave] defaults to thirds
     *  @return {Array} scaledSpectrum array of the spectrum reorganized by division
     *                                 of octaves
     */
    p.splitOctaves = function(spectrum, slicesPerOctave) {
        let scaledSpectrum = [];
        const spectrumLength = spectrum.length;

        // default to thirds
        let n = slicesPerOctave || 3;
        let nthRootOfTwo = Math.pow(2, 1 / n);

        // the last N bins get their own
        const lowestBin = slicesPerOctave;

        let binIndex = spectrumLength - 1;
        let i = binIndex;

        while (i > lowestBin) {
            let nextBinIndex = p.round(binIndex / nthRootOfTwo);

            if (nextBinIndex === 1) return;

            let total = 0;
            let numBins = 0;

            // add up all of the values for the frequencies
            for (i = binIndex; i > nextBinIndex; i--) {
                total += spectrum[i];
                numBins++;
            }

            // divide total sum by number of bins
            let energy = total / numBins;
            scaledSpectrum.push(energy);

            // keep the loop going
            binIndex = nextBinIndex;
        }

        // add the lowest bins at the end
        for (let j = i; j > 0; j--) {
            scaledSpectrum.push(spectrum[j]);
        }

        // reverse so that array has same order as original array (low to high frequencies)
        scaledSpectrum.reverse();

        return scaledSpectrum;
    };

    // average a point in an array with its neighbors
    p.smoothPoint = function(spectrum, index, numberOfNeighbors) {
        // default to 2 neighbors on either side
        let neighbors = numberOfNeighbors || 2;
        let spectrumLength = spectrum.length;

        let val = 0;

        // start below the index
        let indexMinusNeighbors = index - neighbors;
        let smoothedPoints = 0;

        for (
            let i = indexMinusNeighbors;
            i < index + neighbors && i < spectrumLength;
            i++
        ) {
            // if there is a point at spectrum[i], tally it
            if (typeof spectrum[i] !== 'undefined') {
                val += spectrum[i];
                smoothedPoints++;
            }
        }

        val = val / smoothedPoints;

        return val;
    };
}
