import React, { Component } from 'react'
import axios from 'axios'
import './index.scss'
import Footer from '../components/footer'

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://typeracingapi.rishikc.com/'
    : 'http://localhost:8080/text/'

const INITIAL_STATE = {
  text: '',
  pos: 0,
  timer: 10,
  typeState: [],
  progress: [],
  timeElapsed: 0,
  showResults: false,
  current: '',
  wpm: 0,
  incorrect: [],
}

export default class Arena extends Component {
  constructor(props) {
    super(props)
    this.state = INITIAL_STATE
  }

  componentDidMount() {
    this.fetchData()
  }

  componentWillUnmount() {
    document.removeEventListener('keydown')
  }

  fetchData = () => {
    const { pos } = this.state
    const res = axios.get(baseUrl)
    res
      .then(({ data: { text } }) => {
        this.setState({ text, current: text.split(' ')[pos] })
        this.timer = setInterval(() => {
          const { timer } = this.state
          if (timer === 0) {
            document.addEventListener('keydown', this.registerKeyDown)
            clearInterval(this.timer)
            this.startWatch()
          } else {
            this.setState(prev => ({ timer: prev.timer - 1 }))
          }
        }, 1000)
      })
      .catch(err => {
        console.log(err)
      })
  }

  generateCurrent = () => {
    const { current, typeState } = this.state
    const alphabets = current.split('')
    return alphabets.map((char, index) => {
      const state = typeState[index] === char ? 'typed char' : 'char'
      return (
        <span key={`${state}-${char}-${index + 1}`} className={state}>
          {char}
        </span>
      )
    })
  }

  generateText = () => {
    const { text, progress, incorrect } = this.state
    return text
      ? text.split('').map((char, index) => {
          const isErrored = incorrect.indexOf(index) >= 0
          const correct = char === progress[index] ? 'progressed' : undefined
          const className = isErrored ? 'error' : correct
          return (
            <span className={className} key={`generated-content-${char}-${index + 1}`}>
              {char}
            </span>
          )
        })
      : null
  }

  registerKeyDown = ({ key }) => {
    const { current, typeState, text, pos, progress, timeElapsed, incorrect } = this.state
    if (key === 'Shift') {
      return
    }
    if (key === 'Backspace') {
      this.setState({
        incorrect: [...incorrect.slice(0, incorrect.length - 1)],
      })
      return
    }
    if (current.length === typeState.length && !incorrect.length && key === ' ') {
      progress.push(key)
      this.setState({
        current: text.split(' ')[pos + 1],
        pos: pos + 1,
        typeState: [],
        progress: [...progress],
        wpm: Math.floor(((pos + 1) / timeElapsed) * 60),
      })
    } else if (current.charAt(typeState.length) === key && !incorrect.length) {
      typeState.push(key)
      progress.push(key)
      this.setState({
        typeState: [...typeState],
        progress: [...progress],
      })
    } else if (incorrect.indexOf(progress.length + incorrect.length) < 0) {
      // This check is required for handling the case on the end of text where user might
      // press some other key instead of the last character.
      this.setState({
        incorrect: [...incorrect, progress.length + incorrect.length],
      })
    }
    if (text.length === progress.length) {
      clearInterval(this.watch)
      document.removeEventListener('keydown', this.registerKeyDown)
      this.setState({
        showResults: true,
        wpm: Math.floor((text.split(' ').length / timeElapsed) * 60),
      })
    }
  }

  reset = () => {
    if (this.timer) clearInterval(this.timer)
    if (this.watch) clearInterval(this.watch)
    this.setState(INITIAL_STATE, () => {
      this.fetchData()
    })
  }

  startWatch = () => {
    this.watch = setInterval(() => {
      this.setState(prev => ({
        timeElapsed: prev.timeElapsed + 1,
      }))
    }, 1000)
  }

  render() {
    const { text, timer, current, timeElapsed, showResults, wpm } = this.state
    const seconds = timeElapsed % 60 > 9 ? timeElapsed % 60 : `0${timeElapsed % 60}`
    const minutes =
      (timeElapsed - seconds) / 60 > 10
        ? (timeElapsed - seconds) / 60
        : `0${(timeElapsed - seconds) / 60}`
    return (
      <div className="app-container">
        <div className="navbar">
          <p>What Is Your WPM</p>
        </div>
        <div className="arena">
          <div className={`timer ${timer === 0 && 'hide'}`}>
            {text.length
              ? `${timer === 0 ? "Let's go!!" : `${timer} seconds to start!`}`
              : 'Fetching text..'}
          </div>
          <div style={{ position: 'relative' }}>
            {!showResults && <p>{`Current Speed : ${wpm} wpm`}</p>}
            {!showResults && (
              <div
                className={`watch ${timeElapsed !== 0 && 'show'}`}
              >{`Time elapsed  ${minutes} : ${seconds}`}</div>
            )}
          </div>
          {text.length ? (
            <div className="generated-text">{this.generateText()}</div>
          ) : (
            <div className="loader" />
          )}
          {!showResults ? (
            <div className="current-word">{current && this.generateCurrent(current)}</div>
          ) : (
            <div className="results">
              <h4>Results</h4>
              <p>{`Total time : ${minutes} minutes, ${seconds} seconds`}</p>
              <p>{`Speed : ${wpm} words per minute`}</p>
            </div>
          )}
        </div>
        {showResults && (
          <button type="button" className="reset-button" onClick={this.reset}>
            Try again
          </button>
        )}
        <Footer />
      </div>
    )
  }
}
