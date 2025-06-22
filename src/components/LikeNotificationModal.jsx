import React from 'react';

const LikeNotificationModal = ({ notification, onLikeBack, onClose }) => {
  if (!notification) return null;

  const handleLikeBack = async () => {
    try {
      // Create a conversation between the two users
      // We'll call a new API endpoint to create a match/conversation
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/create-match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          other_user_id: notification.liker.id,
          property_id: notification.property.id
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        onLikeBack();
        alert(`Great! You can now chat with ${notification.liker.name}. Check your conversations.`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create match. Please try again.");
      }
    } catch (error) {
      console.error("Failed to like back:", error);
      alert("Failed to like back. Please try again.");
    }
  };

  const handlePass = () => {
    // Just close the notification without liking back
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px',
      backgroundColor: 'white', padding: '20px',
      borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      zIndex: 1000, maxWidth: '300px'
    }}>
      <h4>Someone Liked Your Property!</h4>
      <p>
        <strong>{notification.liker.name}</strong> is interested in your property: <br />
        <em>{notification.property.title}</em>
        <br /><br />
        <small>Would you like to allow them to message you?</small>
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
        <button 
          onClick={handleLikeBack}
          style={{ 
            padding: '8px 12px', 
            border: 'none', 
            borderRadius: '4px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            cursor: 'pointer',
            marginRight: '10px'
          }}>
          Allow Chat
        </button>
        <button 
          onClick={handlePass} 
          style={{ 
            padding: '8px 12px', 
            border: 'none', 
            borderRadius: '4px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            cursor: 'pointer' 
          }}>
          Pass
        </button>
      </div>
    </div>
  );
};

export default LikeNotificationModal; 