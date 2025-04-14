import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

function Signup() {
    const navigate = useNavigate ();
    const[ErrorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role,setRole]= useState('user');
    

   

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Add further logic for form submission, e.g., API call
        //Create FormData object
        const formData = new FormData();
        formData.append('userName',username);
        formData.append('Email',email);     
        formData.append('Password',password);
        formData.append('PhoneNumber',phoneNumber);
        formData.append('Role',role);

        try {
        // Add further logic for form submission, e.g., API call
        const response = await  fetch ('http://localhost/PFE/Back-end/SignUp.php',{
            method :'POST' ,
            body :formData,
        });
        if (!response.ok){
            throw new Error(`HTTP error: ${response.status}`);
        
        }
        const data = await  response.json();
        console.log(data);
        if (data.message ==='user saved with success'){
            setSuccessMessage('Signup successful!');
            setErrorMessage('');   
            navigate('/Home');
            alert("Signup successful!");

        }
        else {
            setErrorMessage('Error: ' + data.message);
            setSuccessMessage('');
        }
    }catch (error){
        setErrorMessage('request error :'+ error.message);
        setSuccessMessage('');
    }
    //emplty the iputs
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setUsername('');


    };

        return (
            <section className="bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0">
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Create an account
                            </h1>
                            {ErrorMessage && <p className="text-red-500 text-sm">{ErrorMessage}</p>}
                            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                            
                            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        required
                                    />
                                </div>
    
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        required
                                    />
                                </div>
    
                                <div>
                                    <label htmlFor="PhoneNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Phone Number
                                    </label>
                                    <input
                                        type="number"
                                        id="PhoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        required
                                    />
                                </div>
    
                                <div>
                                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        required
                                    />
                                </div>
    
                                <button
                                    type="submit"
                                    className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                >
                                    Sign Up
                                </button>
    
                                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Already have an account?{" "}
                                    <Link to="/" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                                        Login
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
    
    export default Signup;
