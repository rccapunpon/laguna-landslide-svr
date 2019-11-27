import React from 'react'
import base from '../images/base_class.png';
import adjusted from '../images/adjusted_class.png';
import bg from '../images/Boundary.PNG';
import WeatherGrid from './WeatherGrid'
import MlForm from './MlForm'
import ls from 'local-storage'
              
class ImageView extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      gridSize: 10,
      imageSrc: require('../images/adjusted_class.png'),
      weather : Array(10).fill(1).map(row => new Array(10).fill(1)),
      weatherGridVisible : false,
      isShowingAdjusted: true
    }
    this.toggleAdjusted = this.showAdjusted.bind(this);
    this.toggleWeatherGrid = this.toggleWeatherGrid.bind(this);
    this.increaseWeatherGridSize = this.increaseWeatherGridSize.bind(this)
    this.decreaseWeatherGridSize = this.decreaseWeatherGridSize.bind(this)
    this.resetHzMap = this.resetHzMap.bind(this)
    this.toggleHzMap = this.toggleHzMap.bind(this)
   }

   componentDidMount() {
    //  this.setState({isShowingAdjusted: true, weatherGridVisible: ls.get('isWeatherGridVisible') })
   }

  showAdjusted() { 
    this.setState({isShowingAdjusted:true, imageSrc: require('../images/adjusted_class.png')})
    ls.set('isShowingAdjusted', true)
  }

  resetHzMap() {
    this.setState({isShowingAdjusted: false})
  }

  toggleHzMap(){ 
    ls.set('isShowingAdjusted',!this.state.isShowingAdjusted)
    this.setState({isShowingAdjusted: !this.state.isShowingAdjusted})
  }

  toggleWeatherGrid() {
    ls.set('isWeatherGridVisible', !this.state.weatherGridVisible)
    this.setState(({weatherGridVisible: !this.state.weatherGridVisible}))
  }

  increaseWeatherGridSize() { 
    this.setState({
      weather:  Array(this.state.gridSize + 5).fill(1).map(row => new Array(this.state.gridSize + 5).fill(1)),
      gridSize: this.state.gridSize + 5
    });
  }
  
  decreaseWeatherGridSize() { 
    this.setState({
      weather:  Array(this.state.gridSize - 5).fill(1).map(row => new Array(this.state.gridSize - 5).fill(1)),
      gridSize: this.state.gridSize - 5
    });
  }

  render() {

    const imgStyle1 = {
      width: '60%',
      height: '60%',
      opacity: '60%',
      position: 'absolute',
      top: '18%',
      right: '20%',
      visibility: this.state.isShowingAdjusted ? "hidden" : "visible"
    }

    const imgStyle2 = {
      width: '60%',
      height: '60%',
      opacity: '60%',
      position: 'absolute',
      top: '17.5%',
      right: '20%',
      visibility: this.state.isShowingAdjusted ? "visible" : "hidden"
    }

    const imgStyleBg = {
      width: '60%',
      height: '60%',
      position: 'absolute',
      top: '18%',
      right: '20%'
    }

    return <div>
              <div><label><b>Interactive Susceptibility Mapping of Laguna PH using Integrated Weighted Index</b></label></div>
              <button style={{marginTop:20}} onClick={this.toggleWeatherGrid}>
                Toggle Weather Grid
              </button>
              <button style={{marginTop:20}} onClick={this.toggleHzMap}>
                Toggle Hazard Map
              </button>
              <button style={{marginTop:20}} onClick={this.resetHzMap}>
                Reset Hazard Map
              </button>

              <div>
              <button onClick={this.increaseWeatherGridSize}>
                Increase Weather Grid (+5)
              </button>
              <button style={{visibility: (this.state.gridSize > 10) ? "visible": "hidden"}} onClick={this.decreaseWeatherGridSize}>
                Decrease Weather Grid (-5)
              </button>
              </div>
              <span style={{visibility: this.state.isShowingAdjusted ? "visible" : "hidden", float:"center", position:"absolute", top:"15%", left:"30%", width:"40%"}}>Showing Recently Created HZ Map</span>
              <span style={{visibility: this.state.isShowingAdjusted ? "hidden" : "visible", float:"center", position:"absolute", top:"15%", left:"30%", width:"40%"}}>Showing Base HZ Map</span>
              <img style={imgStyleBg} src={bg} /> 
              <img style={imgStyle1} src={base} />
              <img style={imgStyle2} src={this.state.imageSrc} />
              <WeatherGrid toggleGrid={this.toggleWeatherGrid} showAdjusted={this.showAdjusted} gridSize={this.state.gridSize} weather={this.state.weather} show={this.state.weatherGridVisible}/>
              <MlForm/>
          </div>
  }
}

export default ImageView