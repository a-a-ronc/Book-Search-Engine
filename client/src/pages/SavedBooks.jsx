// Import necessary modules and components
import { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation, gql } from '@apollo/client';
import { removeBookId } from '../utils/localStorage';
import Auth from '../utils/auth';

// GraphQL query for fetching user data
const GET_ME = gql`
  query getMe {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;

// GraphQL mutation for removing a book
const REMOVE_BOOK = gql`
  mutation removeBook($bookId: String!) {
    removeBook(bookId: $bookId) {
      _id
      savedBooks {
        bookId
      }
    }
  }
`;

// Define functional component SavedBooks
const SavedBooks = () => {
  const [userData, setUserData] = useState({}); // State for user data
  const { loading, data } = useQuery(GET_ME); // Execute GET_ME query to fetch user data
  // Execute REMOVE_BOOK mutation to remove a book
  const [removeBook, { error }] = useMutation(REMOVE_BOOK, {
     // Update cache after removing a book
    update(cache, { data: { removeBook } }) {
      // Safely read the existing books from the cache
      const existingBooks = cache.readQuery({ query: GET_ME });
      if (existingBooks && existingBooks.me && existingBooks.me.savedBooks) {
        // Perform the cache update
        const updatedSavedBooks = existingBooks.me.savedBooks.filter(book => book.bookId !== removeBook.bookId);
        cache.writeQuery({
          query: GET_ME,
          data: {
            me: {
              ...existingBooks.me,
              savedBooks: updatedSavedBooks,
            },
          },
        });
      }
    },
    // Error handling for removing a book
    onError(err) {
      // Enhanced error handling for more informative debugging
      console.error("Error on removing book:", err);
      alert("An error occurred while attempting to delete the book. Please check the console for details.");
    },
  });

  // Effect hook to update userData when data changes
  useEffect(() => {
    if (data) {
      setUserData(data.me); // Update userData with fetched user data
    }
  }, [data]);

  // Function to handle deleting a book from the list of saved books
  const handleDeleteBook = async (bookId) => {
    if (!Auth.loggedIn()) {
      return false; // If user is not logged in, return false
    }

    try {
      await removeBook({
        variables: { bookId },// Execute removeBook mutation with bookId
      });
      removeBookId(bookId); // Update local storage or UI state as needed
    } catch (err) {
      console.error("Error in handleDeleteBook:", err); // Log error
    }
  };

  // Render loading message while data is being fetched
  if (loading) {
    return <h2>LOADING...</h2>;
  }
// Return JSX for SavedBooks component
  return (
    <>
      <Container fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Container>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks?.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors.join(', ')}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Remove this Book
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;




