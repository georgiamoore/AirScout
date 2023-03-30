import React from 'react'
import Chart from './Chart'

describe('<Chart />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Chart />)
  })
})