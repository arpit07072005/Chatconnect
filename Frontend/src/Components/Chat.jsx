import React, { useEffect, useState } from 'react'
import styles from '../CSS/chat.module.css'
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRef } from 'react';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
function Chat() {
    const bottomRef = useRef(null);
    const [message,setMessage]=useState("");
    const [recieverID,setRecieverID]=useState('');
    const [friends,setFriends]=useState([]);
    const [getmessage,setGetmessage]=useState([]);
    const [showChat, setShowChat] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuOpenr, setIsMenuOpenr] = useState(false);
    const [addFriend,setAddFriend]=useState(false);
    const [friendEmail,setFriendEmail]=useState("");
    const [conversationId, setConversationId] = useState();
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [getmessage]);
    useEffect(()=>{
      const handleFriends=async()=>{
        try {
            const response=await axios.get("http://localhost:5000/api/message/getfriends",{withCredentials:true})
            setFriends(response.data.friends);
        } catch (error) {
            console.log(error)
        }finally {
      setLoadingFriends(false);
    }
      }
      handleFriends();
    },[])
    useEffect(() => {
  if (friends.length > 0) {
    setRecieverID(friends[0].friend);
    handleFriend(friends[0]);
  }
}, [friends]);
    const handleSend=async()=>{
        if (!message || message.trim() === "") {
            return; 
           }
       try {
        const response=await axios.post('http://localhost:5000/api/message/sendmessage',{
            message:message,
            receiverID:recieverID._id
        },{ withCredentials: true })
        toast.success(response.data.message);
        console.log(response.data)
           setMessage("");
       } catch (error) {
        console.log(error.response)
        toast.error(error.response?.data?.error||"someting went wrong");
       }
    }
    const handleFriend= async(fr)=>{
        setShowChat(true);
        setRecieverID(fr.friend);
        setConversationId(fr._id);
          setLoadingMessages(true); 
         try {
            const response=await axios.get(`http://localhost:5000/api/message/get/${fr._id}`,{
               withCredentials: true
            })
        setGetmessage(response.data.data);
         } catch (error) {
            console.log(error);
         } finally {
    setLoadingMessages(false);
  }
    }
    const handleAddFriend=async()=>{
        try {
            const response=await axios.post("http://localhost:5000/api/message/addfriends",{
                email:friendEmail
            },{withCredentials:true});
            console.log(response);
            setFriendEmail("");
            setAddFriend(false);
            toast.success(response.data.message)
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.error || "Something went wrong");
            setFriendEmail("");
        }
    }
    const handledeletechat=async()=>{
        try {
            const response=await axios.post("http://localhost:5000/api/message/deletemessage",{
              conversationId:conversationId
            },{withCredentials:true});
            toast.success(response.data.message);
             setGetmessage([]);
        } catch (error) {
            toast.error(error.response?.data?.error||"Something went wrong");
        }
        setIsMenuOpenr(false);
    }
    const colors = [
  "#00a884", 
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b", 
  "#ef4444",
];
    const getColor = (name) => {
          if (!name) return "#ccc";
  const firstChar = name.charCodeAt(0);
  return colors[firstChar % colors.length];
};
    return (   
        <div className={styles.chatContainer}>
            {addFriend && (
                <div className={styles.Overlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>Add New Friend</h3>
                        <div className={styles.modalInputGroup}>
                            <span className={styles.search}></span>
                            <input 
                                type="text" 
                                placeholder="Enter the friend's email..." 
                                value={friendEmail}
                                onChange={(e) => setFriendEmail(e.target.value)}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setAddFriend(false)}>Cancel</button>
                            <button className={styles.confirmBtn} onClick={handleAddFriend} >Add Friend</button>
                        </div>
                    </div>
                </div>
            )}
            {/* {console.log(recieverID)} */}
            <div className={`${styles.leftContainer} ${showChat ? styles.hide : ""}`}>
                <div className={styles.logo}>
                    <div className={styles.name}>
                        <div className={styles.user}>A</div>
                        <div className={styles.logoName}>ChatConnect</div>
                    </div>
                    <div className={styles.menu1} onClick={()=>{setIsMenuOpen(!isMenuOpen)}}>
                    </div>
    {isMenuOpen && (
                    <div className={styles.menu1List}>
                        <div className={styles.addFriend} onClick={() => { setAddFriend(true); setIsMenuOpen(false); }}>
                            <span className={styles.addIcon}>+</span> Add Friend
                        </div>
                    </div>
                )}

                </div>
                <div className={styles.leftSearch}>
                    <div className={styles.search}></div>
                    <input type="text" placeholder='search or start new chat' />
                </div>
                <div className={styles.friends}>
                     {loadingFriends ? ([...Array(7)].map((_, i) => (
                <div key={i} className={styles.friend}>
             <Skeleton circle width={40} height={40} />
                 <Skeleton width={120} height={15} />
                 </div>
    ))
  ) : ( friends.map((fr)=>(
                        <div className={`${styles.friend} ${recieverID?._id === fr.friend._id ? styles.activeFriend : ""}`} key={fr.friend._id} onClick={()=>handleFriend(fr)}>
                        <div className={styles.user} style={{ backgroundColor: getColor(fr.friend.name) }}>{fr.friend.name[0]}</div>
                        <div className={styles.nameContainer}>
                            <div className={styles.friendName}>{fr.friend.name}</div>
                            <div className={styles.lastMessage}>{fr.lastMessage}</div>
                        </div>
                    </div> 
                    ))
                )}
                </div>
            </div>
            <div className={`${styles.rightContainer} ${showChat ? styles.show : ""}`}>
                <div className={styles.logo1}>
                    <div className={styles.name}>
                        <div className={styles.back} onClick={()=>setShowChat(false)}></div>
                        <div className={styles.user} style={{ backgroundColor: getColor(recieverID?.name) }}>{recieverID?.name?.[0]}</div>
                        <div className={styles.friendName}>{recieverID.name}</div>
                    </div>
                    <div className={styles.callContainer}>
                        <div className={styles.video}></div>
                        <div className={styles.audio}></div>
                        <div className={styles.menu} onClick={()=>{setIsMenuOpenr(!isMenuOpenr)}}></div>
                        {isMenuOpenr && (
                    <div className={styles.menu1List}>
                        <div className={styles.addFriend} onClick={handledeletechat}>
                            Delete Chat
                        </div>
                    </div>
                )}
                    </div>
                </div>
                <div className={styles.messages}>
                    {loadingMessages ? (
    [...Array(8)].map((_, i) => (
      <div key={i} className={i % 2 === 0 ? styles.skeletonmessage1 : styles.skeletonmessage2}>
        <Skeleton width={120} height={35} />
      </div>
    ))
  ) :  getmessage.length === 0 ? (
  <div className={styles.emptyChat}>
    <div className={styles.emptyBox}>
      <div className={styles.emptyIcon}></div>
      <h3>Start chatting</h3>
      <p>Send a message to begin conversation</p>
    </div>
  </div>
) : ( [...getmessage].reverse().map((msg) => (
            
    <div key={msg._id}className={ msg.sender === recieverID._id ? styles.message1: styles.message2 } >
      {msg.text}
    </div>
  ))
  )}
   <div ref={bottomRef}></div>
                </div>
                <div className={styles.send}>
                <div className={styles.messageInput}>
                    <input type="text" value={message} placeholder='Enter your message...' onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e)=>{
                        if(e.key=="Enter"){
                            handleSend();
                        }
                    }}/>
                </div>
                        <div className={styles.sendButton} onClick={handleSend} ></div>
                </div>
            </div>
        </div>
    )
}

export default Chat
