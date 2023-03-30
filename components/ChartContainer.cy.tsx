import React from 'react'
import ChartContainer from './ChartContainer'

describe('<ChartContainer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ChartContainer />)
  })
})