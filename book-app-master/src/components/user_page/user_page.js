import React, { useState } from "react";
import { useHistory } from 'react-router-dom'

export default function UserForm() {

  const [userInfo, setUserInfo] = useState({
    id: "",
  });
  const history = useHistory();
  const handleChange = (event) => {
    setUserInfo({ ...userInfo, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem("user_id", userInfo.id)
    history.push('/books')
  };

  return (
    <div>
      <form onSubmit={handleSubmit}> 
        <div>
          <h3>Enter User Id</h3>
        </div>
        <div>
          <input
            type="text"
            name="id"
            placeholder="Id"
            value={userInfo.id}
            onChange={handleChange}
          />
        </div>
        <div>
          <button>Submit User</button>
        </div>
      </form>
    </div>
  );
}