import React, { useEffect, useState } from 'react'
import styles from '../CSS/chat.module.css'
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRef } from 'react';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
function Chat() {
    const bottomRef = useRef(null);
    const [message, setMessage] = useState("");
    const [recieverID, setRecieverID] = useState('');
    const [friends, setFriends] = useState([]);
    const [getmessage, setGetmessage] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuOpenr, setIsMenuOpenr] = useState(false);
    const [addFriend, setAddFriend] = useState(false);
    const [friendEmail, setFriendEmail] = useState("");
    const [conversationId, setConversationId] = useState();
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loginUser, setLoginUser] = useState();
    const [selectedImage, setSelectedImage] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUser, setTypingUser] = useState(null);
    const [createGroup, setCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef(null);
    const socket = useRef(null);
    const typingTimeout = useRef(null);
    useEffect(() => {
        socket.current = io("http://localhost:5000", {
            withCredentials: true
        });

        socket.current.on("connect", () => {
            console.log("Socket connected");

            const user = JSON.parse(localStorage.getItem("user"));

            if (user?._id) {
                socket.current.emit("join", user._id);
                console.log("JOIN SENT:", user._id);
            }
        });
        return () => {
            socket.current.disconnect();
        };
    }, []);
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("newMessage", (msg) => {
            console.log("SOCKET", msg.image);
            if (msg.conversationId?.toString() === conversationId?.toString()) {
                setGetmessage((prev) => [msg, ...prev]);
            }
            if (msg.sender !== loginUser?._id) {
                socket.current.emit("messageDelivered", {
                    messageId: msg._id,
                    senderId: msg.sender
                });
            }
            if (
                msg.sender !== loginUser?._id &&
                conversationId?.toString() === msg.conversationId?.toString()
            ) {
                socket.current.emit("messageRead", {
                    messageId: msg._id,
                    senderId: msg.sender
                });
            }
            setFriends((prev) =>
                prev.map((friend) =>
                    friend._id === msg.conversationId
                        ? {
                            unreadCount:
                                msg.sender?.toString() === loginUser?._id?.toString()
                                    ? friend.unreadCount || 0
                                    : (
                                        showChat &&
                                        friend._id === conversationId
                                    )
                                        ? 0
                                        : (friend.unreadCount || 0) + 1
                        }
                        : friend
                )
            );
        });

        return () => {
            socket.current.off("newMessage");
        };
    }, [conversationId, showChat]);
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("onlineUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.current.off("onlineUsers");
        };
    }, []);
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("userTyping", (data) => {
            if (
                data.senderId?.toString() ===
                recieverID?._id?.toString()
            ) {
                setTypingUser(data);
            }
        });

        socket.current.on("userStopTyping", () => {
            setTypingUser(null);
        });

        return () => {
            socket.current.off("userTyping");
            socket.current.off("userStopTyping");
        };
    }, [recieverID]);
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("messageDeliveredUpdate", ({ messageId }) => {

            setGetmessage(prev =>
                prev.map(msg =>
                    msg._id?.toString() === messageId?.toString()
                        ? { ...msg, status: "delivered" }
                        : msg
                )
            );
        });

        return () => {
            socket.current.off("messageDeliveredUpdate");
        };
    }, []);
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("messageReadUpdate", ({ messageId }) => {

            setGetmessage(prev =>
                prev.map(msg =>
                    msg._id?.toString() === messageId?.toString()
                        ? { ...msg, status: "read" }
                        : msg
                )
            );

        });

        return () => {
            socket.current.off("messageReadUpdate");
        };
    }, []);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [getmessage]);
    useEffect(() => {
        const handleFriends = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/message/getfriends", { withCredentials: true })
                setFriends(response.data.friends);
            } catch (error) {
                console.log(error)
            } finally {
                setLoadingFriends(false);
            }
        }
        handleFriends();
    }, [])
    useEffect(() => {
        if (!socket.current) return;
        socket.current.on("newFriend", (newFriend) => {
            setFriends((prev) => [newFriend, ...prev]);
        });
        return () => {
            socket.current.off("newFriend");
        };
    }, []);
    useEffect(() => {
        if (friends.length > 0 && !recieverID) {
            setRecieverID(friends[0].friend);
            handleFriend(friends[0]);
        }
    }, [friends]);
    const handleSend = async () => {
        socket.current.emit("stopTyping", {
            receiverId: recieverID._id,
            senderId: loginUser?._id
        });
        if ((!message || message.trim() === "") && !selectedImage) {
            return;
        }
        try {
            let temp = {
                _id: Date.now().toString(),
                sender: loginUser._id,
                text: message,
                image: selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : "",
                status: "sent"
            }
            setGetmessage((prev) => [temp, ...prev]);
            setMessage("");
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            const formData = new FormData();

            formData.append("receiverID", recieverID._id);
            formData.append("conversationId", conversationId);
            formData.append("message", message);

            if (selectedImage) {
                formData.append("image", selectedImage);
            }
            const response = await axios.post('http://localhost:5000/api/message/sendmessage', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            const realMessage = response.data.message;

            setGetmessage(prev => prev.map(msg =>
                msg._id === temp._id ? realMessage : msg
            )
            );
            // toast.success(response.data.message);
            setFriends(prev => prev.map(fr =>
                fr._id === conversationId ? {
                    ...fr,
                    lastMessage: selectedImage ? "📷 Photo" : message
                }
                    : fr
            )
            );
            console.log(response.data.message);
        } catch (error) {
            console.log(error.response)
            toast.error(error.response?.data?.error || "someting went wrong");
        }
    }
    const handleFriend = async (fr) => {
        setTypingUser(null);
        setShowChat(true);
        if (fr.isGroup) {
            setRecieverID({
                _id: fr._id,
                name: fr.groupName,
                isGroup: true
            });
        } else {
            setRecieverID(fr.friend);
        }
        setConversationId(fr._id);
        setLoadingMessages(true);
        try {
            await axios.post("http://localhost:5000/api/message/resetUnread",
                { conversationId: fr._id },
                { withCredentials: true }
            );
            setFriends(prev =>
                prev.map(friend =>
                    friend._id === fr._id
                        ? { ...friend, unreadCount: 0 }
                        : friend
                )
            );
            const response = await axios.get(`http://localhost:5000/api/message/get/${fr._id}`, {
                withCredentials: true
            })
            setGetmessage(response.data.data);
            response.data.data.forEach((msg) => {
                if (msg.sender?.toString() !== loginUser?._id?.toString() && msg.status !== "read") {
                    socket.current.emit("messageRead", {
                        messageId: msg._id,
                        senderId: msg.sender
                    });
                    setGetmessage(prev => prev.map(msg =>
                        msg.sender?.toString() !== loginUser?._id?.toString() ? { ...msg, status: "read" } : msg
                    ));
                }

            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingMessages(false);
        }
    }
    const handleAddFriend = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/message/addfriends", {
                email: friendEmail
            }, { withCredentials: true });
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
    const handledeletechat = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/message/deletemessage", {
                conversationId: conversationId
            }, { withCredentials: true });
            toast.success(response.data.message);
            setGetmessage([]);
        } catch (error) {
            toast.error(error.response?.data?.error || "Something went wrong");
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
    const isOnline = (userId) => {
        return onlineUsers.includes(userId);
    }
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/api/u",
                    { withCredentials: true }
                );
                setLoginUser(response.data.message);
            } catch (error) {
                navigate("/login");
            }
        };
        fetchUser();
    }, []);
    const handleLogout = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/u/logout",
                {},
                { withCredentials: true });
            toast.success(response.data.message);
            navigate("/login");
        } catch (error) {
            toast.error("something wrong");
        }
    }
    const handleCreateGroup = async () => {

        try {

            const response = await axios.post(
                "http://localhost:5000/api/message/creategroup",
                {
                    groupName,
                    members: selectedMembers
                },
                {
                    withCredentials: true
                }
            );

            toast.success(response.data.message);

            setCreateGroup(false);
            setGroupName("");
            setSelectedMembers([]);

        } catch (err) {

            toast.error(
                err.response?.data?.error ||
                "Something went wrong"
            );

        }
    };
    const filteredFriends = friends.filter((fr) => {
        const name = fr.isGroup
            ? fr.groupName
            : fr.friend?.name;

        return name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
    });
    const handleDeleteMessage = async (messageId) => {
        try {

            await axios.delete(`http://localhost:5000/api/message/deletemessage/${messageId}`,
                { withCredentials: true }
            );

            setGetmessage(prev =>
                prev.filter(msg => msg._id !== messageId)
            );

            toast.success("Message deleted");

        } catch (err) {
            toast.error(err.response?.data?.error || "Something went wrong"
            );
        }
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
            {createGroup && (
                <div className={styles.Overlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.groupModalHeader}>
                            <h3>Create Group</h3>
                            <p>Select members and give your group a name</p>
                        </div>

                        <div className={styles.groupInput}>
                            <input
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name"
                            />
                        </div>

                        <div className={styles.selectedCount}>
                            {selectedMembers.length} members selected
                        </div>

                        <div className={styles.groupMembers}>
                           {friends
  .filter(fr => !fr.isGroup)
  .map((fr) => (
    <label
      key={fr._id}
      className={styles.memberItem}
    >
      <input
        type="checkbox"
        checked={selectedMembers.includes(fr.friend._id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedMembers(prev => [...prev, fr.friend._id]);
          } else {
            setSelectedMembers(prev =>
              prev.filter(id => id !== fr.friend._id)
            );
          }
        }}
      />

      <div
        className={styles.memberAvatar}
        style={{
          backgroundColor: getColor(fr.friend.name)
        }}
      >
        {fr.friend.name?.[0]?.toUpperCase()}
      </div>

      <span>{fr.friend.name}</span>
    </label>
))}
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setCreateGroup(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className={styles.confirmBtn}
                                onClick={handleCreateGroup}
                            >
                                Create Group
                            </button>
                        </div>

                    </div>
                </div>
            )}
            {/* {console.log(recieverID)} */}
            <div className={`${styles.leftContainer} ${showChat ? styles.hide : ""}`}>
                <div className={styles.logo}>
                    <div className={styles.name}>
                        <div className={styles.user1}></div>
                        <div className={styles.logoName}>ChatConnect</div>
                    </div>
                    <div className={styles.menu1} onClick={() => { setIsMenuOpen(!isMenuOpen) }}>  </div>
                    {isMenuOpen && (
                        <div className={styles.menu1List}>
                            <div className={styles.addFriend} onClick={() => { setAddFriend(true); setIsMenuOpen(false); }}>
                                <span className={styles.addIcon}>+</span> Add Friend
                            </div>
                            <div
                                className={styles.addFriend} onClick={() => { setCreateGroup(true); setIsMenuOpen(false); }}
                            >
                                <span className={styles.addIcon1}></span>
                                Create Group
                            </div>
                        </div>
                    )}

                </div>
                <div className={styles.leftSearch}>
                    <div className={styles.search}></div>
                    <input type="text" placeholder='search or start new chat' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className={styles.friends}>
                    {loadingFriends ? (
                        [...Array(7)].map((_, i) => (
                            <div key={i} className={styles.friend}>
                                <Skeleton circle width={40} height={40} />
                                <Skeleton width={120} height={15} />
                            </div>
                        ))
                    ) : (
                        filteredFriends.map((fr) => (
                            <div
                                key={fr._id}
                                className={`${styles.friend} ${fr.isGroup
                                        ? recieverID?._id === fr._id
                                            ? styles.activeFriend
                                            : ""
                                        : recieverID?._id === fr.friend?._id
                                            ? styles.activeFriend
                                            : ""
                                    }`}
                                onClick={() => handleFriend(fr)}
                            >
                                <div
                                    className={styles.user}
                                    style={{
                                        backgroundColor: getColor(
                                            fr.isGroup
                                                ? fr.groupName
                                                : fr.friend?.name
                                        )
                                    }}
                                >
                                    {fr.isGroup ? (
                                        < div className={styles.groupIcon}></div>
                                    ) : fr.friend?.backgroundImage ? (
                                        <img
                                            src={fr.friend.backgroundImage}
                                            alt="user"
                                            className={styles.profileImg}
                                        />
                                    ) : (
                                        fr.friend?.name?.charAt(0).toUpperCase()
                                    )}

                                    {!fr.isGroup &&
                                        isOnline(fr.friend?._id) && (
                                            <span className={styles.onlineDot}></span>
                                        )}
                                </div>

                                <div className={styles.nameContainer}>
                                    <div className={styles.friendName}>
                                        {fr.isGroup
                                            ? fr.groupName
                                            : fr.friend?.name}
                                    </div>

                                    <div
                                        className={
                                            !fr.isGroup &&
                                                typingUser?.senderId ===
                                                fr.friend?._id
                                                ? styles.typingText
                                                : styles.lastMessage
                                        }
                                    >
                                        {!fr.isGroup &&
                                            typingUser?.senderId ===
                                            fr.friend?._id
                                            ? "typing..."
                                            : fr.lastMessage?.length > 25
                                                ? fr.lastMessage.slice(0, 25) +
                                                "..."
                                                : fr.lastMessage}
                                    </div>
                                </div>

                                {fr.unreadCount > 0 && (
                                    <div className={styles.unreadBadge}>
                                        {fr.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className={styles.profile}>
                    {loginUser && (

                        <div className={styles.name}>
                            <div className={styles.user}>
                                {loginUser?.backgroundImage ? (
                                    <img src={loginUser.backgroundImage} alt='user' className={styles.profileImg} />) : (
                                    loginUser?.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className={styles.logoName}>{loginUser.name}</div>
                        </div>
                    )}
                    <div className={styles.logoutContainer}>
                        <div className={styles.setting} >  </div>
                        <div className={styles.logout} onClick={handleLogout} >  </div>
                    </div>
                </div>
            </div>
            <div className={`${styles.rightContainer} ${showChat ? styles.show : ""}`}>
                <div className={styles.logo1}>
                    <div className={styles.name}>
                        <div className={styles.back} onClick={() => setShowChat(false)}></div>
                        <div className={styles.user} style={{ backgroundColor: getColor(recieverID?.name) }}>
                            {recieverID?.isGroup ? (
                                <div className={styles.groupIcon}></div>
                            ) : recieverID?.backgroundImage ? (
                                <img
                                    src={recieverID.backgroundImage}
                                    alt="user"
                                    className={styles.profileImg}
                                />
                            ) : (
                                recieverID?.name?.[0]?.toUpperCase()
                            )}
                        </div>
                        <div>
                            <div className={styles.friendName}> {recieverID.name} </div>

                            <div className={typingUser?.senderId === recieverID?._id ? styles.typingStatus : isOnline(recieverID?._id) ? styles.onlineStatus : styles.offlineStatus}>
                                {recieverID?.isGroup ? "Group chat" : typingUser?.senderId === recieverID?._id ? `${typingUser?.senderName} is typing...` : isOnline(recieverID?._id) ? "Online" : "Offline"}
                            </div>
                        </div>
                    </div>
                    <div className={styles.callContainer}>
                        <div className={styles.video}></div>
                        <div className={styles.audio}></div>
                        <div className={styles.menu} onClick={() => { setIsMenuOpenr(!isMenuOpenr) }}></div>
                        {isMenuOpenr && (
                            <div className={styles.menu1List}>
                                <div className={styles.addFriend} onClick={handledeletechat}>
                                    Clear Chat
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
                    ) : getmessage.length === 0 ? (
                        <div className={styles.emptyChat}>
                            <div className={styles.emptyBox}>
                                <div className={styles.emptyIcon}></div>
                                <h3>Start chatting</h3>
                                <p>Send a message to begin conversation</p>
                            </div>
                        </div>
                    ) : ([...getmessage].reverse().map((msg) => (

<div className={styles.messageContentWrapper}>
                        <div key={msg._id} className={msg.sender?.toString() === loginUser?._id?.toString() ? styles.message2 : styles.message1} >
                            <>
                                {msg.image && (<img src={msg.image} alt="" className={styles.chatImage} />)}
                                <div className={styles.messageContent}>
                                    {recieverID?.isGroup && msg.sender?.toString() !== loginUser?._id?.toString() && (
                                        <div className={styles.senderName}>
                                            {msg.senderName}
                                        </div>
                                    )}
                                    {msg.text && <div className={styles.messageText}>{msg.text}</div>}

                                   

                                    {msg.sender === loginUser?._id && (
                                        <span
                                            className={`${styles.messageStatus} ${msg.status === "sent"
                                                ? styles.sentStatus
                                                : msg.status === "delivered"
                                                    ? styles.deliveredStatus
                                                    : styles.readStatus
                                                }`}
                                        ></span>
                                    )}
                                </div>
                            </>
                        </div>
                                 {msg.sender?.toString() === loginUser?._id?.toString() && (
                                        <span className={styles.deleteMessage} onClick={() => handleDeleteMessage(msg._id)} >
                                            
                                        </span>
                                    )}
                                </div>
                    ))
                    )}
                    {typingUser?.senderId === recieverID?._id && (
                        <div className={styles.typingBubble}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    )}
                    <div ref={bottomRef}></div>
                </div>
                {selectedImage && (
                    <div className={styles.previewContainer}>
                        <img src={URL.createObjectURL(selectedImage)} alt="preview" className={styles.previewImage} />

                        <div
                            className={styles.removePreview}
                            onClick={() => {
                                setSelectedImage(null);

                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }
                            }}
                        >
                            ✕
                        </div>
                    </div>
                )}
                <div className={styles.send}>
                    <label className={styles.attachment}>
                        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => setSelectedImage(e.target.files[0])} />
                    </label>

                    <div className={styles.messageInput}>
                        <input type="text" value={message} placeholder='Enter your message...' onChange={(e) => {
                            setMessage(e.target.value);

                            socket.current.emit("typing", {
                                receiverId: recieverID._id,
                                senderId: loginUser?._id,
                                senderName: loginUser?.name
                            });

                            clearTimeout(typingTimeout.current);

                            typingTimeout.current = setTimeout(() => {
                                socket.current.emit("stopTyping", {
                                    receiverId: recieverID._id
                                });
                            }, 1000);
                        }} onKeyDown={(e) => {
                            if (e.key == "Enter") {
                                handleSend();
                            }
                        }} />

                    </div>
                    <div className={styles.sendButton} onClick={handleSend} ></div>
                </div>
            </div>
        </div>
    )
}

export default Chat
