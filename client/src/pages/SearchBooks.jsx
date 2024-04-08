// Import necessary modules and components
import { useState, useEffect } from 'react';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import { useMutation, gql } from '@apollo/client';

import Auth from '../utils/auth';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { searchGoogleBooks } from '../utils/API';

const SAVE_BOOK = gql`
  mutation saveBook($bookData: BookInput!) {
    saveBook(bookData: $bookData) {
      _id
      savedBooks {
        bookId
      }
    }
  }
`;

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [saveBook] = useMutation(SAVE_BOOK, {
    onCompleted: (data) => {
      // Assuming bookData includes bookId in the response, which might need adjustment
      const savedBookId = data.saveBook.savedBooks.map((book) => book.bookId);
      setSavedBookIds((prevSavedBookIds) => [...prevSavedBookIds, ...savedBookId]);
      saveBookIds([...savedBookIds, ...savedBookId]); // Update localStorage with new saved book IDs
    },
    onError: (error) => {
      console.error('Could not save the book', error);
    }
  });

  useEffect(() => {
    return () => saveBookIds(savedBookIds); // Save book IDs to localStorage on unmount
  }, [savedBookIds]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        link: book.volumeInfo.infoLink
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) {
      return false;
    }

    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    if (!bookToSave) {
      console.error('Book not found');
      return;
    }

    try {
      await saveBook({
        variables: { bookData: { ...bookToSave } },
      });
      // Book ID will be added to savedBookIds in the onCompleted handler of the mutation
    } catch (err) {
      console.error('Error saving book:', err);
    }
  };
  searchedBooks.map(book => console.log(book.link));

  return (
    <>
      <Container fluid className="text-light bg-dark p-5">
        <h1>Search for Books!</h1>
        <Form onSubmit={handleFormSubmit}>
          <Row>
            <Col xs={12} md={8}>
              <Form.Control
                name='searchInput'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type='text'
                size='lg'
                placeholder='Search for a book'
              />
            </Col>
            <Col xs={12} md={4}>
              <Button type='submit' variant='success' size='lg'>
                Submit Search
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
      <Container>
        <Row>
          {searchedBooks.map((book) => (
            <Col key={book.bookId} md={4} className="mb-3">
              <Card>
                <Card.Img variant="top" src={book.image} alt={`Cover for ${book.title}`} />
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Card.Text>
                    Authors: {book.authors.join(', ')}
                  </Card.Text>
                   {/* Make sure the description is rendered here */}
                  <Card.Text>Description: {book.description}</Card.Text>
                  {/* Render the link here */}
        <Card.Text>
        <Button variant="primary" href={book.link} target="_blank" rel="noopener noreferrer">
                      More Info
                    </Button>
          {/* <a href={book.link} target="_blank" rel="noopener noreferrer">More Info</a> */}

        </Card.Text>
                  <Button
                    variant="primary"
                    disabled={savedBookIds.includes(book.bookId)}
                    onClick={() => handleSaveBook(book.bookId)}>
                    {savedBookIds.includes(book.bookId) ? 'Saved' : 'Save This Book'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
