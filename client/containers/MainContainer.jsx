import React, { Component } from 'react';
import Graph from '../components/Graph.jsx';

class MainContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      accessToken: '',
      channel: null,
      allChannels: null,
      start: null,
      end: null,
      data: null,
      graphType: 'Line Graph',
      graph: false,
      limit: 100,
      workspace: 'Connect to a Slack Workspace'
    };
  }

  updateStart(event) {
    this.setState({start: event.target.value});
  }

  updateEnd(event) {
    this.setState({end: event.target.value});    
  }

  updateChannel(event) {
    for(let i = 0; i < this.state.allChannels.length; i++) {
      if(this.state.allChannels[i].name === event.target.value) {
        this.setState({channel: this.state.allChannels[i].id})
      }
    }
  }

  displayGraph() {
    const {channel, start, end, limit} = this.state;
    let oldDate = new Date(start).getTime()/1000;
    let lateDate = new Date(end).getTime()/1000;
    const fetchURL = `/slack/?channel=${channel}&oldest=${oldDate}&latest=${lateDate}&limit=${limit}`
    fetch(fetchURL, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(data => {
        this.setState({data: data, graph: true});
      })
      .catch(err => console.log('MainContainer displayGraph ERROR: ', err));
  }

  updateGraphType(event) {
    this.setState({graphType: event.target.value});
  }

  updateLimit(event) {
    this.setState({limit: event.target.value});
  }

  componentDidMount() {
    // 1 month => 2.629746 * Math.pow(10, 9) milliseconds
    // 2 weeks => 1.2096 * Math.pow(10, 9) milliseconds
    // https://www.calculateme.com/time/hours/to-milliseconds/24
    let present = new Date(Date.now() - 25200000); //units = milli
    console.log(present);
    let defaultTime = new Date(present - (1.2096 * Math.pow(10, 9))); //units = milli

    let isoPresent = present.toISOString();
    console.log(isoPresent)
    let isoDefault = defaultTime.toISOString();

    let pTime = isoPresent.slice(0, 16); 
    let dTime = isoDefault.slice(0, 16);

    this.setState({ end: pTime })
    this.setState({ start: dTime })
    fetch('/slack/channels')
      .then(res => res.json())
      .then(data => {
        this.setState({
          channel: data.channels[0].id,
          allChannels: data.channels,
          workspace: `Connected to: ${data.workspace}`
        });
      })
      .catch(err => console.log('MainContainer.componentDidMount ERROR: ', err));
  }

  render() {
    let channels = [];
    if(this.state.allChannels) {
      this.state.allChannels.forEach(channel => {
        channels.push(<option value={channel.name}>{channel.name}</option>)
      })
    }
    return (
      <div className='main'>
        <nav>
          <h1>VibeZ</h1>
          <h2>{this.state.workspace}</h2>
        </nav>
        <a href="https://slack.com/oauth/authorize?client_id=653541339828.770547895078&scope=channels:history,channels:read"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
        <div className='channelID'>
          <span>Channel: </span>
          <select onChange={e => { this.updateChannel(e) }}>
            {channels}
          </select>
        </div>
        <div className='options'>
          <span>Graph Type: </span>
          <select id='graphType' onChange={e => { this.updateGraphType(e) }}>
            <option value='Line Graph'>Line Graph</option>
            <option value='Bar Graph'>Bar Graph</option>
          </select>
        </div>
        <div className='options' >
          <span>Start Time: </span>
          <input type='datetime-local' defaultValue={this.state.start} onChange={e => { this.updateStart(e) }} />
        </div >
        <div className='options'>
          <span>End Time: </span>
          <input type='datetime-local' defaultValue={this.state.end} onChange={e => { this.updateEnd(e) }} />
        </div>
        <div className='options'>
          <span>Limit: </span>
          <input type='number' defaultValue={100} onChange={e => { this.updateLimit(e) }} />
        </div>
        <div>
          <button id="ent" onClick={() => { this.displayGraph() }}>Enter</button>
        </div>
        <Graph graph={this.state.graph} graphType={this.state.graphType} data={this.state.data} chartData={this.state.chartData} />
      </div>
    );
  }
}


export default MainContainer;
