// Import necessary modules and components
import { useState } from 'react'; // Import useState hook from React
import { Form, Button, Alert } from 'react-bootstrap'; // Import Form, Button, and Alert components from react-bootstrap
import { useMutation, gql } from '@apollo/client'; // Import useMutation hook and gql function from Apollo Client
import Auth from '../utils/auth'; // Import Auth utility functions

// Define the GraphQL mutation for logging in a user
const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

// Define LoginForm functional component
const LoginForm = () => {
  // Define state variables using useState hook
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [showAlert, setShowAlert] = useState(false);

  // Apollo's useMutation hook to execute LOGIN_USER mutation
  const [login, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => { // Function to execute on successful completion of mutation
      Auth.login(data.login.token); // Call login function from Auth utility with token from mutation response
    }
  });

  // Function to handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  // Function to handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      await login({ // Execute login mutation with userFormData
        variables: userFormData
      });
    } catch (err) {
      console.error(err); // Log any errors
      setShowAlert(true); // Set showAlert state to true to display alert
    }
  };

  // Return JSX for LoginForm component
  return (
    <>
      {showAlert && ( // Display alert if showAlert state is true
        <Alert dismissible onClose={() => setShowAlert(false)} variant="danger">
          Something went wrong with your login!
          {error && <div>{error.message}</div>} {/* Display error message if error exists */}
        </Alert>
      )}
      <Form noValidate onSubmit={handleFormSubmit}> {/* Form with onSubmit handler */}
        <Form.Group className="mb-3"> {/* Form Group for Email input */}
          <Form.Label htmlFor="email">Email</Form.Label> {/* Label for Email input */}
          <Form.Control
            type="email"
            placeholder="Your email"
            name="email"
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3"> {/* Form Group for Password input */}
          <Form.Label htmlFor="password">Password</Form.Label> {/* Label for Password input */}
          <Form.Control
            type="password"
            placeholder="Your password"
            name="password"
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
        </Form.Group>
        <Button type="submit" variant="success" disabled={loading}> {/* Submit Button */}
          Submit
        </Button>
      </Form>
    </>
  );
};

// Export LoginForm component as default
export default LoginForm;
