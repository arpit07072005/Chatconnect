import React, { Children } from 'react'
import styles from "../CSS/login.module.css"
function LayoutLogin({children}) {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}></div>
        <div className={styles.logoName}> ChatConnect
<span>Chat smarter, connect faster</span></div>
      </div>
       <div className={styles.containerCircle}></div>
       <div className={styles.imageContainer}>
       <div className={styles.containerMCircle}></div>
       <div className={styles.loginImage}></div>
       <div className={styles.motion1}></div>
       <div className={styles.motion2}></div>
       <div className={styles.motion3}></div>
       <div className={styles.motion4}></div>
       <div className={styles.motion5}></div>
       </div>
       <div className={styles.layoutList}>
        <div className={styles.list1}>
          <div className={styles.logo1}>
          </div>
<div className={styles.content}>Real-time messaging</div>
        </div>
        <div className={styles.list1}>
          <div className={styles.logo2}></div>
            <div className={styles.content}>AI-powered chat assistant</div>
          </div>
        <div className={styles.list1}>
          <div className={styles.logo3}></div>
<div className={styles.content}>End-to-end encryption</div>
          
          </div>
       </div>
       {children}
    </div>
  )
}

export default LayoutLogin
