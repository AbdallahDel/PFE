import React from 'react'
import Home from './Home'
import { useState,useEffect } from 'react'

export default function Profile() {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    useEffect(() => {
    const GetUserInfo = async ()=>{
       
        const response = await fetch('http://localhost/PFE/Back-end/GetUserInfo.php', {
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          });
          if (response.ok){
           const data = await response.json();
           console.log('Response data:', data); // Log the entire response
            console.log('Status:', data.status);
            console.log('Username:', data.username);
            console.log('Email:', data.email);
           if(data.status === 'success'){
            setUserName(data.username);
            setEmail(data.email);}
            else{
                console.error('Error:', data.message);
            }
            
          }
          else{
            console.error(`HTTP error! Status: ${response.status}`);
          }
    }
        GetUserInfo();
      }, []);
  return (
    <>
    <div>
        <Home/>
        </div>
    <div style={{textAlign:"center"}} ><h1   style={{textAlign:"center",fontWeight:'bold'}}>Profile</h1>
        <p>username : {userName}</p>
        <p>Email :{email}</p>
      
    </div>
    </>
  )
}
