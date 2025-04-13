import React from 'react'
import { data, useNavigate } from "react-router-dom";
import '../App.css'
import { Link } from 'react-router-dom';


export default function Home() {
const handleLoggedOut =async () =>{
  const confirmed = window.confirm("Are you sure you want to logout this Acount?");
    if (!confirmed) return;
    

  const response = await  fetch ('http://localhost/Back-end/logOut.php',{
    method :'POST',
    credentials: 'include',
    
  });

  if (!response.ok){
      throw new Error(`HTTP error: ${response.status}`);

  } 
  else {
    const data = await response.json();
    if (data.status === 'success'){
      
      navigate('/');
      } 



    }
}

  const navigate = useNavigate();
  return (
    <div className='Home' >
      <div style={{textAlign:"center",backgroundColor:"#172554",padding:"35px",color:"white"}} className='Navbar'>
          <h1 className="text-center text-2xl font-bold">Home</h1>
          <h4 className="text-center text-xl font-bold"><Link style={{textAlign:"center",color:"white",position:'absolute',right :'40%',top:'6%',textDecoration:'none'}} to='/Profile' >Profile</Link></h4>
          <button className="LogoutButton" onClick={handleLoggedOut}>Logout</button>
      </div>
    <h1 style={{textAlign:"center",}}>Welcome to the Home Page!</h1>
    

    </div>
  )
}
  
