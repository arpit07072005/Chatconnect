import React, { useState } from 'react'
import LayoutLogin from './LayoutLogin.jsx'
import styles from '../CSS/login.module.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { toast } from 'react-toastify';
function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const navigate= useNavigate();
  const handleLogin=async()=>{
    try {
      const response= await axios.post('https://chatconnect-no7s.onrender.com/api/u/login',{
        email:email,
        password:password
      },{ withCredentials: true })
       localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success(response.data.message);
      setEmail("");
      setPassword("");
      setTimeout(()=>{
        navigate('/');
      },1000)
    } catch (error) {
     toast.error(error.response?.data?.error || "Something went wrong");
    }
  }
  return (
    <LayoutLogin>
        <div className={styles.loginForm}>
        <div className={styles.welcome}>Welcome Back</div>
        <div className={styles.subHeading}>Sign in to continue to your account</div>
        <div className={styles.inputs}>
          <label htmlFor="email">Email Address</label>
          <div className={styles.inputContainer}>
          <div className={styles.inputLogoEmail}></div>
           <input type='email'  value={email} id='email' placeholder='you@gmail.com' onChange={(e)=>setEmail(e.target.value)}/>
          </div>
        </div>
         <div className={styles.inputs}>
          <label htmlFor="password">Password</label>
           <div className={styles.inputContainer}>
          <div className={styles.inputLogoPassword}></div>
           <input type='password' value ={password} id='password' placeholder='Enter your password' onChange={(e)=>setPassword(e.target.value)}/>
           </div>
        </div>
        <div className={styles.forgetContainer}>
          <div className={styles.remember}><input type="checkbox" />Remember me</div>
          <div className={styles.forgot}>Forgot Password?</div>
        </div>
        <div className={styles.button} onClick={handleLogin}>Sign In</div>
        <div class={styles.divider}>or continue with</div>
        <div className={styles.googleContainer}>
          <div className={styles.google}>
            <div className={styles.googleLogo}></div>
            <div className={styles.googleName}>Google </div>
          </div>
          <div className={styles.apple}>
            <div className={styles.appleLogo}></div>
            <div className={styles.googleName}>Apple </div>
          </div>
        </div>
        <div className={styles.signup}>Don't have an account?  <span><Link to='/signup'>Sign Up</Link></span></div>
       </div>
    </LayoutLogin>
  )
}

export default Login
