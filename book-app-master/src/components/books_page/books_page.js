import React, {useState, useEffect} from 'react';
import appSettings from '../../config/settings';
import axios from 'axios';
import { Link, useHistory, } from 'react-router-dom'

export default function BooksPage(props) {
  
  const [books, setBooks] = useState([]);
  const [count, setCount] = useState(1);
  
  const history = useHistory();
  const userId = localStorage.getItem('user_id');
  const fetchBooks= async (userId) => {
    console.log('fetching books for user: ', userId);
    await axios(appSettings.booksEndpoint+'?userId='+userId
      ).then((response) => {
        setBooks(response.data);
        console.log('response is', response.data);
      }).catch((e) => {
        console.log(e);
    });
  }
  
  const addToCart = async (i) => {
    let tempBooks = books;
    tempBooks[i].quantity_available -= 1
    tempBooks[i].incart += 1
    setBooks(tempBooks);
    setCount(count + 1);
    console.log('tempbooks are:', books.map(book => book.incart).reduce((partialSum, a) => partialSum + a, 0))
    await axios.post(appSettings.booksEndpoint+'/'+books[i].id+'/?userId='+userId
    ).then((response) => {
      console.log(response);
    }).catch((e) => {
      console.log(e);
    });
  }
  const removeFromCart = async (i) => {
    let tempBooks = books;
    tempBooks[i].quantity_available += 1
    tempBooks[i].incart -= 1
    setBooks(tempBooks);
    setCount(count - 1);
    console.log('tempbooks are:', books.map(book => book.incart).reduce((partialSum, a) => partialSum + a, 0))
    await axios.delete(appSettings.booksEndpoint+'/'+books[i].id+'/?userId='+userId
    ).then((response) => {
      console.log(response);
    }).catch((e) => {
      console.log(e);
    });
  }



  // called on component load
  useEffect(() => {
      props.handleAuth(history);
      fetchBooks(userId);
  }, []);


  return (
        <div>
          <nav><span ><Link to={'/cart'}>Cart</Link></span></nav>
          <h1>Books </h1>
          {Object.keys(books.sort((a, b) => (a.title > b.title) ? 1 : -1)).map((i) => (
            <div key={books[i].id}>
              <span><Link to={`/book/${books[i].id}`}>{books[i].title} </Link>  available: {books[i].quantity_available} in cart: {books[i].incart}</span>
              <button className={books[i].quantity_available < 1 ? 'hidden' : ''}type='button' onClick={() => addToCart(i, userId)}>add to cart</button>
              <button className={books[i].incart < 1 ? 'hidden' : ''}type='button' onClick={() => removeFromCart(i, userId)}>remove from cart</button>
              <br/>
              <br/>
            </div>
          ))}
        </div>
  )
}
