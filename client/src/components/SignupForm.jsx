// Import necessary modules and components
import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation, gql } from '@apollo/client';
import Auth from '../utils/auth';

// Updated GraphQL mutation for creating a new user to match the server's schema
const ADD_USER_MUTATION = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

const SignupForm = () => {
  // Set initial form state
  const [userFormData, setUserFormData] = useState({ username: '', email: '', password: '' });
  // Set state for form validation
  const [validated] = useState(false);
  // Set state for alert
  const [showAlert, setShowAlert] = useState(false);

  const [addUser, { loading, error }] = useMutation(ADD_USER_MUTATION, {
    onCompleted: (data) => {
      console.log("Mutation completed with data:", data); // Temporarily log the data for inspection
      if (data.addUser && data.addUser.token) {
        // Now, safely use the token
        Auth.login(data.addUser.token);
      } else {
        // This block executes if the data structure is not as expected, which helps prevent runtime errors
        console.error("No token received:", data);
        setShowAlert(true); // Optionally, adjust the message to inform of the specific issue
      }
    },
    // Give error 
    onError: (error) => {
      console.error(error);
      setShowAlert(true);
    },
  });
  
// Function to handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  // Function to handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.preventDefault();// Prevent default form submission behavior
      event.stopPropagation();// Stop event propagation
    } else {
      try {
        // Execute the mutation, passing in the form data as variables
        await addUser({
          variables: { ...userFormData },
        });
      } catch (e) {
        // Errors are handled by the onError option in the useMutation hook
      }
    }

    // Reset form state
    setUserFormData({ username: '', email: '', password: '' });
  };

  return (
    <>
      {/* Alert for errors */}
      <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
        Something went wrong with your signup!
      </Alert>

      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {/* Form fields and submit button */}
        <Form.Group className='mb-3'>
          <Form.Label htmlFor='username'>Username</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your username'
            name='username'
            onChange={handleInputChange}
            value={userFormData.username}
            required
          />
          <Form.Control.Feedback type='invalid'>Username is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email address'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.username && userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
