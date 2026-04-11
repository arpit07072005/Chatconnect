import { useState } from 'react'
import Login from './Components/Login.jsx'
import  "./App.css"
import { Routes,BrowserRouter,Route } from 'react-router-dom'
import Signup from './Components/Signup.jsx'
import Chat from './Components/Chat.jsx'
import { ToastContainer } from 'react-toastify'
function App() {
  return (
    <>
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Chat/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path='/signup' element={<Signup/>}/>
   </Routes>
   </BrowserRouter>
   <ToastContainer/>
   </>
  )
}

export default App
