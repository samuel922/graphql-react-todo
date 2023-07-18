import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ApolloClient, HttpLink, ApolloProvider, InMemoryCache } from '@apollo/client'

const client  = new ApolloClient({
  link: new HttpLink({
    uri: "https://my-todo-web-api.hasura.app/v1/graphql",
    headers: {
      "x-hasura-admin-secret": "AA1iiZUaEtUlcQdGPX54udI8HCUEGXVTuiKhW9GVgTXu1cnV1lTZEIcUdqbMfw9Y"
    }
  }),
  cache: new InMemoryCache(),
})


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)
