import './App.scss';
import appSettings from './config/settings';
import UserPage from './components/user_page/user_page';
import BooksPage from './components/books_page/books_page';
import BookPage from './components/book_page/book_page';
import CartPage from './components/cart_page/cart_page';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


export default function App() {
  const handleAuth =(history)=>{
    if (!localStorage.getItem("user_id")){
    history.push(`/`);
    }
    return
  }
  return (
    <Router>
      <div id="app" className="app">
        <Switch>
          <Route exact path="/">
            <UserPage/>
          </Route>
          <Route path="/books">
            <BooksPage
              handleAuth={handleAuth}
            />
          </Route>
          <Route path="/book/:bookId">
            <BookPage 
              handleAuth={handleAuth}
            />
          </Route>
          <Route path="/cart">
            <CartPage 
              handleAuth={handleAuth}              
            />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
