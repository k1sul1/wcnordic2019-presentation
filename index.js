import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Redbox from 'redbox-react'
import { AppContainer } from 'react-hot-loader'

import Presentation from './presentation'

const CustomErrorReporter = ({ error }) => <Redbox error={error} />

CustomErrorReporter.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired
}


function render() {
  ReactDOM.render(
    <AppContainer errorReporter={CustomErrorReporter}>
      <Presentation />
    </AppContainer>,
    document.getElementById('root')
  )
}

render()

let oldHash = window.location.hash
window.addEventListener('hashchange', () => {
  const newHash = window.location.hash

  if (!oldHash.includes('?presenter') && newHash.includes('?presenter')) {
    window.location.reload()
  }
})

if (module.hot) {
  module.hot.accept('./presentation', () => {
    const NextPresentation = require('./presentation').default
    ReactDOM.render(
      <AppContainer errorReporter={CustomErrorReporter}>
        <NextPresentation />
      </AppContainer>,
      document.getElementById('root')
    )
  })
}
