import React, { useState } from 'react'
import LayoutLogin from './LayoutLogin.jsx'
import styles from '../CSS/login.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
function Signup() {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const[number,setNumber]=useState("");
  const [password,setPassword]=useState("");
  const navigate=useNavigate();
  const handleSubmit=async()=>{
    if(!name || !email || !number || !password){
  toast.error("All fields required");
  return;
}
   try {
    const response= await axios.post('http://localhost:5000/api/u/register',{
     name:name,
     email:email,
     mobileNumber:number,
     password:password
    })
    toast.success(response.data.message)
    setName("");
    setEmail("");
    setNumber("");
    setPassword("");
    setTimeout(()=>{
        navigate('/login');
      },1000)
   } catch (error) {
    console.log(error.response)
         toast.error(error.response?.data?.error || "Something went wrong");
   }
    
  }
  return (
      <LayoutLogin>
     <div className={styles.loginForm}>
             <div className={styles.welcome}>Create Account</div>
             <div className={styles.subHeading}>Join and start chatting today</div>
             <div className={styles.inputs}>
               <label htmlFor="name">Full Name</label>
               <div className={styles.inputContainer}>
               <div className={styles.inputLogoPerson}></div>
                <input type='text' id='name' value={name} placeholder='John Doe' onChange={(e)=>setName(e.target.value)}/>
               </div>
             </div>
             <div className={styles.inputs}>
               <label htmlFor="email">Email Address</label>
               <div className={styles.inputContainer}>
               <div className={styles.inputLogoEmail}></div>
                <input type='email' id='email' value={email} placeholder='you@gmail.com' onChange={(e)=>setEmail(e.target.value)}/>
               </div>
             </div>
             <div className={styles.inputs}>
               <label htmlFor="number">Phone Number</label>
               <div className={styles.inputContainer}>
               <div className={styles.inputLogoPhone}></div>
                <input type='number' id='number' value={number} placeholder='9999999999' onChange={(e)=>setNumber(e.target.value)}/>
               </div>
             </div>
              <div className={styles.inputs}>
               <label htmlFor="password">Password</label>
                <div className={styles.inputContainer}>
               <div className={styles.inputLogoPassword}></div>
                <input type='password' id='password' value={password} placeholder='Enter your password' onChange={(e)=>setPassword(e.target.value)}/>
                </div>
             </div>
             <div className={styles.forgetContainer}>
               <div className={styles.remember}><input type="checkbox" />Remember me</div>
               <div className={styles.forgot}>Forgot Password?</div>
             </div>
             <div className={styles.button} onClick={handleSubmit}>Create Account</div>
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
             <div className={styles.signup}>Don't have an account?  <span><Link to='/'>Sign In</Link></span></div>
            </div>

      </LayoutLogin>

  )
}

export default Signup
