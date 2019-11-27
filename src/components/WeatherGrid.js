import React from 'react'
import loadingImg from '../images/loading.gif';
import ls from 'local-storage'
class WeatherGrid extends React.Component {

  constructor(props) {
    super(props)
    console.log(this.props)
    this.state = {
      items:[],
      weather:[],
      colors:["blue","green", "yellow", "orange", "red" ],
      gridSize: 10,
      loading: false
    }
    this.generateMap = this.generateMap.bind(this);
    this.resetMap = this.resetMap.bind(this);
    this.updateItems()
  }  

  getKey(i,y) {
    // console.log(i , y)
    return i + '-' + y
  }

  getId(i,y) {
    // console.log(i , y)
    return i + '-' + y
  }

  getFunction(i,y) {
    // console.log("getting function val: " + i + "," + y)
    return () => this.updateValue(i, y)
  }

  getGridSize() {
    return (100/this.props.gridSize) + '%'
  }


  updateItems() {
    console.log("Updating Grid..")
    this.state.items = []
    for (var i = 0; i<this.props.gridSize; i++) {
      for (var y = 0; y<this.props.gridSize; y++) {
        this.state.items.push(
           <span key={this.getKey(i,y)} id={this.getId(i,y)} style={{background: this.state.colors[this.props.weather[i][y]-1], 
            width:this.getGridSize(), height:this.getGridSize(), float:"left"}} onClick={this.getFunction(i,y)}></span>
        )
      }
    }
    
    // this.state.weather = this.props.weather
    // this.setState({ state: this.state });
  }

  updateValue(i,y) {
    this.props.weather[i][y] = (this.props.weather[i][y]+1) % 6
    if(this.props.weather[i][y] === 0) 
    this.props.weather[i][y] = 1
    this.setState({ state: this.state });
    ls.set('weather', this.props.weather)
    this.updateItems() 

  }

  resetMap() {
    for (var i = 0; i<this.props.gridSize; i++) {
      for (var y = 0; y<this.props.gridSize; y++) {
        this.props.weather[i][y] = 1
      }}
    this.setState({ state: this.state });
    ls.set('weather', this.props.weather)  
    this.updateItems()
  }

  generateMap(e) {
    this.setState({ loading: true });  
    fetch('http://127.0.0.1:5000/generate', {
      mode: 'no-cors',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        size: this.props.gridSize,
        matrix: this.props.weather,
      })
    })
    .then((response) => response.text())
    .then((responseText) => {
      this.state.loading = false
      this.props.showAdjusted()
      ls.set('isShowingAdjusted', true)
    })
    .catch((error) => {
      console.error(error);
    });
    // e.preventDefault()
  }

  render() {

    const labels = {
      marginTop: "5px",
      position: "absolute",
      bottom: "22%",
      textAlign: "center",
      width: "80%",
      left: "10%",
      background: "antiquewhite"
    }

    return (
      <div>
        <div style={labels}><b>Susceptibility:</b> 
        &nbsp;&nbsp;Very Low: <label style={{background: '#2f54eb',padding: '1px'}}>&nbsp;</label>
        &nbsp;&nbsp;Low: <label style={{background: '#8de31e',padding: '1px'}}>&nbsp;</label>
        &nbsp;&nbsp;Relatively Low: <label style={{background: '#b4e83a',padding: '1px'}}>&nbsp;</label>
        &nbsp;&nbsp;Moderate: <label style={{background: '#ff9e0d',padding: '1px'}}>&nbsp;</label>
        &nbsp;&nbsp;Reatively High: <label style={{background: '#ff6a0d',padding: '1px'}}>&nbsp;</label>
        &nbsp;&nbsp;High: <label style={{background: '#f57656',padding: '1px'}}>&nbsp;</label>
        &nbsp;&nbsp;Very High: <label style={{background: '#f55656',padding: '1px'}}>&nbsp;</label>
          </div>
      <div id="weather_grid" style={{visibility: this.props.show ? "visible" : "hidden", width: "46.5%", height: "44%", opacity: "0.5", position: "absolute",top: "26%",right: "26%"}}>
        {this.state.items}
      </div>
      <button style={{visibility: this.props.show ? "visible" : "hidden", float:"center", position: "absolute", zIndex: "100", bottom: "26%"}} onClick={this.generateMap}>Apply Weather Change</button>
      <button style={{visibility: this.props.show ? "visible" : "hidden", float:"center"}} onClick={this.resetMap}>Reset Weather</button>
      <img style={{visibility: this.state.loading && this.props.show ? "visible" : "hidden", position:"absolute", height:"58%", width:"60%", left:"20%", top:"16%"}}  src={loadingImg}/>
      
      </div>
    )
  }

 }

 export default WeatherGrid