import React, {useState, useEffect} from 'react';
import appSettings from '../../config/settings';
import axios from 'axios';
import { 
  Link,   
  useParams,
  useHistory,
} from 'react-router-dom'
export default function BooksDetail(props) {
  let { bookId } = useParams();
  const userId = localStorage.getItem('user_id');
  const [book, setBook] = useState({});
  const history = useHistory();

  const fetchBook= async (bookId) => {
    await axios(appSettings.booksEndpoint+'/'+bookId+'/?userId='+userId
    ).then((response) => {
      setBook(response.data);
      console.log(response);
    }).catch((e) => {
      console.log(e);
  });
  }

  // called on component load
  useEffect(() => {
    props.handleAuth(history);
    fetchBook(bookId);
  }, []);
  return (
    <div>
      <nav><span><Link to={'/books'}>Store</Link>&nbsp;<Link to={'/cart'}>Cart</Link></span></nav>
      <h1>{book.title}</h1>
      <div>only {book.quantity_available} left and {book.incart} in cart </div>
      <button type="button" onClick={() => props.addToCart(book.id)}>add to cart</button>
      {/* <button type="button" onClick={() => props.removeFromToCart(book.id, history)}>remove from cart</button> */}
    </div>
  )
};
