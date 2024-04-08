// Import necessary modules and components
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App.jsx';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Auth from './utils/auth'; // Assuming Auth is correctly implemented

// Create an HTTP link that connects to your Apollo Server instance
const httpLink = new HttpLink({
  uri: '/graphql', // Replace with the correct server URI if necessary
});

// Middleware to attach the token to requests
const authLink = setContext((_, { headers }) => {
  // Retrieve the authentication token from local storage if it exists
  const token = Auth.getToken();
  // Return the headers to the context so the httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Set up the Apollo Client with the authLink and httpLink
const client = new ApolloClient({
  link: from([authLink, httpLink]), // Chain together with `from` to ensure the order
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <h1 className='display-2'>Wrong page!</h1>,
    children: [
      {
        index: true,
        element: <SearchBooks />
      }, {
        path: '/saved',
        element: <SavedBooks />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <RouterProvider router={router} />
  </ApolloProvider>
);
