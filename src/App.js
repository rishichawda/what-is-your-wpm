import React from "react";

import "./App.scss";
import Arena from "./arena";
import Footer from "./components/footer";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true
    };

    this.hideModal = () => this.setState({ showModal: false });
  }

  render() {
    const { showModal } = this.state;
    return (
      <div className="app">
        <div className={`modal ${showModal ? "show" : "hide"}`}>
          <h4>What is your WPM?</h4>
          <p>
            Type as fast as you can and find your typing speed!
          </p>
          <button type="button" onClick={this.hideModal}>
            Start
          </button>
        <Footer />
        </div>
        {!showModal && <Arena />}
      </div>
    );
  }
}

export default App;
