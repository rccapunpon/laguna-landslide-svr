import React from 'react'
import loadingImg from '../images/loading.gif';


class MlForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      lon: '121.3231222', 
      lat: '14.32232232',
      soil: 1,
      fault: 1,
      slope: 1,
      tri: 1,
      rain: 5,
      ker: 0,
      showSusc: false,
      susc: 'Very Low',
      loading: false
    };

    this.handleLonChange = this.handleLonChange.bind(this);
    this.handleLatChange = this.handleLatChange.bind(this);
    this.handleSoilChange = this.handleSoilChange.bind(this);
    this.handleFaultChange = this.handleFaultChange.bind(this);
    this.handleSlopeChange = this.handleSlopeChange.bind(this);
    this.handleTriChange = this.handleTriChange.bind(this);
    this.handleRainChange = this.handleRainChange.bind(this);
    this.handleKerChange = this.handleKerChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleLonChange(event) {
    this.setState({lon: event.target.value, showSusc: false});
  }
  handleLatChange(event) {
    this.setState({lat: event.target.value, showSusc: false});
  }
  handleSoilChange(event) {
    this.setState({soil: event.target.value, showSusc: false});
  }
  handleFaultChange(event) {
    this.setState({fault: event.target.value, showSusc: false});
  }
  handleSlopeChange(event) {
    this.setState({slope: event.target.value, showSusc: false});
  }
  handleTriChange(event) {
    this.setState({tri: event.target.value, showSusc: false});
  }
  handleRainChange(event) {
    this.setState({rain: event.target.value, showSusc: false});
  }
  handleKerChange(event) {
    this.setState({ker: event.target.value, showSusc: false});
  }

  handleSubmit(event) {
    this.setState({loading: true});
    console.log('Calculating Susceptibility of : ' + this.state.lat + ', ' + this.state.lon);
    fetch('http://127.0.0.1:5000/regress', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        lon: this.state.lon, 
        lat: this.state.lat,
        soil: this.state.soil,
        fault: this.state.fault,
        slope: this.state.slope,
        tri: this.state.tri,
        ker: this.state.ker,
        rain: this.state.rain, 
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson)
      this.setState({susc: responseJson['susc'], showSusc: true, loading: false});
    })
    .catch((error) => {
      console.error(error);
    });
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit} style={{ borderTop:'solid' ,position: "absolute", width: "100%", bottom: "1%", height: "20%"}}>
          <label><b>SVR Hazard Calculator</b></label>
          <br/>
          Calculate the hazard of a specific point.
          <br/> 
          <br/>
          <label style={{margin:'5px'}}>Lon:</label> 
          <input  name="lon" id="lon"
            type="text" onChange={this.handleLonChange} value={this.state.lon} 
          />
          <label style={{margin:'5px'}}>Lat:</label>
          <input name="lat" id="lat" value={this.state.lat} 
            type="text"onChange={this.handleLatChange} 
          />
          <label style={{margin:'5px'}}>Slope:</label>
          
          <select name="slope" id="sslope" value={this.state.slope} onChange={this.handleSlopeChange}>
            <option value="1.0">Very Steep</option>
            <option value="0.3">Steep</option>
            <option value="0.18">Uphill</option>
            <option value="0.8">Moderate</option>
            <option value="0.5">Gentle</option>
            <option value="0.0">Flat</option>
          </select>

          <label style={{margin:'5px'}}>Ground Strength:</label>
          <select name="soil" id="soil"  value={this.state.soil} onChange={this.handleSoilChange}>
            <option value="0">Very weak</option>
            <option value="0.2">Weak</option>
            <option value="0.4">Moderately Weak</option>
            <option value="0.6">Moderately Strong</option>
            <option value="0.8">Strong</option>
            <option value="1.0">Very Strong</option>
          </select>

          <label style={{margin:'5px'}}>Fault Distance:</label>
          <select name="fault" id="fault"  value={this.state.fault} onChange={this.handleFaultChange}>
            <option value=".2">Very Near</option>
            <option value=".4">Near</option>
            <option value=".6">Moderate</option>
            <option value=".8">Far</option>
            <option value=".1">Very Far</option>
          </select>
          <br/>
          <label style={{margin:'5px', marginLeft:'10px'}}>Terrain Ruggedness:</label>
          <select name="tri" id="tri"  value={this.state.tri} onChange={this.handleTriChange}>
            <option value="1.0">Very High</option>
            <option value=".8">High</option>
            <option value=".6">Moderate</option>
            <option value=".4">Low</option>
            <option value=".0">Very Low</option>
          </select>

          <label style={{margin:'5px', marginLeft:'10px'}}>Rainfall:</label>
          <select name="rain" id="rain"  value={this.state.rain} onChange={this.handleRainChange}>
            <option value="5">Very Heavy</option>
            <option value="4">Heavy</option>
            <option value="3">Moderate</option>
            <option value="2">Light</option>
            <option value="1">Light</option>
          </select>

          <label style={{margin:'5px', marginLeft:'10px'}}>SVR Kernel:</label>
          <select name="ker" id="ker"  value={this.state.ker} onChange={this.handleKerChange}>
            <option value={0}>linear</option>
            <option value={1}>rbf</option>
            <option value={2}>polynomial</option>
          </select>

          <input type="submit" style={{margin:'5px', marginLeft:'10px'}} value="Calculate"/>
        </form>
      
      <label style={{visibility: this.state.showSusc ? "visible" : "hidden", position: "absolute",bottom: "27px",
      width: "100%", left:"0", textAlign: "center"}}><b>At ({this.state.lon},{this.state.lat}) the susceptibility is {this.state.susc} </b></label>
      <img style={{visibility: this.state.loading ? "visible" : "hidden", position:"absolute", height:"5%", width:"5%", left:"49%", bottom:"2%"}}  src={loadingImg}/>
      </div>
    )
  }

}

export default MlForm