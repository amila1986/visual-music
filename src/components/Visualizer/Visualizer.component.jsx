/************************************************************
    Main component for music visualization.
    Uses react-p5-wrapper to load state values to the p5 canvas.

    Current loaded sketch file is defined in line 18.
    It is then passed as props to P5Wrapper component
    along with other needed values such as volume, uploaded file, etc.

    Current features:
    1. Display ellipses based on sound's amplitude.

    TODO:

************************************************************/

import React from 'react';
import classes from './Visualizer.module.scss';
import P5Wrapper from 'react-p5-wrapper';
import sketch from '../../vendor/sketches/sketch';

class Visualizer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sketch,
            canvasWidth:0
        };

        //create a reference and reference to
        //<div className={classes.visualizer}></div> in jsx
        //so we can get react node back 
        this.visualizerRef = React.createRef();
    }

    componentDidMount(){

        //we listen window resize event and call
        // onWindowResize method
        window.addEventListener('resize', this.onWindowResize)
        this.onWindowResize();
    }

    componentWillUnmount(){

        //we remove window resize event
        window.removeEventListener('resize', this.onWindowResize);
    }

    //calculate new canvas width when window's size changed
    //calculation should base on parent element
    onWindowResize = ()=>{
       
        //get style properties from parent 
        const style = window.getComputedStyle(this.visualizerRef.current.parentElement, null);

        //get this style properties from <div className={classes.visualizer}></div>
        const thisStyle = window.getComputedStyle(this.visualizerRef.current, null);

        //get padding, border and margin width for <div className={classes.visualizer}></div>
        const thisPaddingWidth = parseFloat(thisStyle.getPropertyValue('padding-left')) + parseFloat(thisStyle.getPropertyValue('padding-right'));
        const thisBorderWidth = parseFloat(thisStyle.getPropertyValue('border-left')) + parseFloat(thisStyle.getPropertyValue('border-left'));
        const thisMarginWidth = parseFloat(thisStyle.getPropertyValue('margin-left')) + parseFloat(thisStyle.getPropertyValue('margin-right'));

        //get padding, border and margin width  from parent 
        const paddingWidth = parseFloat(style.getPropertyValue('padding-left')) + parseFloat(style.getPropertyValue('padding-right'));
        const borderWidth = parseFloat(style.getPropertyValue('border-left')) + parseFloat(style.getPropertyValue('border-left'));
        const marginWidth = parseFloat(style.getPropertyValue('margin-left')) + parseFloat(style.getPropertyValue('margin-right'));

        //calcualte new canvas width
        const newCanvasWidth = parseFloat(style.getPropertyValue('width')) - 
        paddingWidth  - thisPaddingWidth -  
        borderWidth  -  thisBorderWidth -
        marginWidth - thisMarginWidth;
        
        this.setState({canvasWidth:newCanvasWidth})

    }

    render() {
        const { volume, isPlaying, uploadedSong } = this.props;
        const { sketch, canvasWidth } = this.state;

        return (
            <div className={classes.visualizer} ref={this.visualizerRef}>
                <P5Wrapper
                    sketch={sketch}
                    volume={volume}
                    isPlaying={isPlaying}
                    uploadedSong={uploadedSong}
                    canvasWidth={canvasWidth}
                />
            </div>
        );
    }
}

export default Visualizer;
