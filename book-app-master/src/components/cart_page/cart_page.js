import React, {useState, useEffect} from 'react';
import appSettings from '../../config/settings';
import uuid from 'react-uuid'
import axios from 'axios';
import { 
  Link,   
  useHistory
} from 'react-router-dom'
export default function CartPage(props) {
  const [cart, setCart] = useState([]);
  const userId = localStorage.getItem('user_id');
  const history = useHistory();
  
  const fetchCart= async () => {
    console.log('fetching cart: ');
    await axios(appSettings.cartEndpoint+'?userId='+userId
    ).then((response) => {
      setCart(response.data);
      console.log(response.data);
    }).catch((e) => {
      console.log(e);
    });
  }
  
  const checkOut= async () => {
    await axios.post(appSettings.cartEndpoint+'?userId='+userId
    ).then((response) => {
      console.log('checking out: ', response);
    }).catch((e) => {
      console.log(e);
    });
    setTimeout(() => {
      history.push('/books')
    },1000);
  }
  
  const timeOut= async () => {
    await axios.delete(appSettings.cartEndpoint+'?userId='+userId
    ).then((response) => {
      console.log('timing out: ',response)
    }).catch((e) => {
      console.log(e);
    });
    setTimeout(() => {
      history.push('/books')
    },1000);
  }
  // called on component load
  
  useEffect(() => {
    props.handleAuth(history);
    fetchCart();
  }, []);
  
  
  return (
  <div>
    <nav><span ><Link to={'/books'}>Store</Link></span></nav>
    <h1>Cart</h1>
    {Object.keys(cart).map((i) => (
      <div key={uuid()}>
        <span>{cart[i].title} {cart[i].incart}</span>
      </div>
    ))}
    <button type="button" onClick={() => checkOut()}>check out</button>
    <button type="button" onClick={() => timeOut()}>time out</button>
  </div>
  )
};
