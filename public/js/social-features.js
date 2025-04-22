/**
 * Fonctionnalités sociales pour MS BINGO
 * Gestion des amis et du chat
 */

class MSBingoSocial {
  constructor() {
    this.websocket = null;
    this.userId = null;
    this.username = null;
    this.friends = [];
    this.friendRequests = { incoming: [], outgoing: [] };
    this.currentChatFriendId = null;
    this.messages = {};
    this.chatRooms = [];
    this.currentRoomId = null;
    this.roomMessages = {};
    
    // Événements
    this.events = {
      onFriendsUpdated: [],
      onFriendRequestsUpdated: [],
      onNewMessage: [],
      onMessagesUpdated: [],
      onWebSocketConnected: [],
      onWebSocketDisconnected: [],
      onChatRoomsUpdated: [],
      onRoomMessagesUpdated: []
    };
    
    // État de la connexion WebSocket
    this.isConnected = false;
  }
  
  /**
   * Initialise la connexion WebSocket et les gestionnaires d'événements
   * @param {number} userId ID de l'utilisateur connecté
   * @param {string} username Nom d'utilisateur
   */
  async init(userId, username) {
    this.userId = userId;
    this.username = username;
    
    try {
      // Connexion WebSocket
      await this.connectWebSocket();
      
      // Chargement initial des données
      await Promise.all([
        this.loadFriends(),
        this.loadFriendRequests(),
        this.loadChatRooms()
      ]);
      
      console.log('MS Bingo Social: Initialization complete');
      return true;
    } catch (error) {
      console.error('MS Bingo Social: Initialization failed', error);
      return false;
    }
  }
  
  /**
   * Établit la connexion WebSocket
   */
  connectWebSocket() {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connection established');
        this.isConnected = true;
        
        // Authentifier l'utilisateur
        this.websocket.send(JSON.stringify({
          type: 'auth',
          userId: this.userId
        }));
        
        // Déclencher les événements onWebSocketConnected
        this.triggerEvent('onWebSocketConnected');
        
        resolve();
      };
      
      this.websocket.onclose = () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
        
        // Déclencher les événements onWebSocketDisconnected
        this.triggerEvent('onWebSocketDisconnected');
        
        // Tentative de reconnexion après 5 secondes
        setTimeout(() => {
          this.connectWebSocket().catch(console.error);
        }, 5000);
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    });
  }
  
  /**
   * Gère les messages WebSocket reçus
   * @param {object} data Message WebSocket reçu
   */
  handleWebSocketMessage(data) {
    console.log('WebSocket message received:', data);
    
    switch (data.type) {
      case 'auth_success':
        console.log('WebSocket authentication successful');
        break;
        
      case 'unread_messages':
        console.log(`You have ${data.count} unread messages`);
        // Mettre à jour le badge de notification
        this.updateNotificationBadge(data.count);
        break;
        
      case 'new_message':
        console.log('New message received:', data);
        
        // Ajouter le message à la liste des messages
        if (!this.messages[data.senderId]) {
          this.messages[data.senderId] = [];
        }
        
        this.messages[data.senderId].push({
          id: data.messageId,
          sender_id: data.senderId,
          sender_name: data.senderName,
          receiver_id: this.userId,
          content: data.content,
          read: 0,
          created_at: data.timestamp
        });
        
        // Déclencher l'événement onNewMessage
        this.triggerEvent('onNewMessage', {
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
          timestamp: data.timestamp
        });
        
        // Si c'est le chat actif, marquer le message comme lu
        if (this.currentChatFriendId === data.senderId) {
          this.markMessagesAsRead([data.messageId]);
          this.triggerEvent('onMessagesUpdated', this.messages[data.senderId]);
        } else {
          // Sinon, mettre à jour le badge de notification
          const unreadCount = document.querySelector('.unread-count');
          if (unreadCount) {
            unreadCount.textContent = parseInt(unreadCount.textContent || '0') + 1;
            unreadCount.classList.remove('hidden');
          }
        }
        break;
        
      case 'new_friend_request':
        console.log('New friend request received:', data);
        
        // Ajouter la demande à la liste
        this.friendRequests.incoming.push({
          id: null, // ID temporaire, sera mis à jour lors du rechargement
          user_id: data.userId,
          username: data.username,
          created_at: new Date().toISOString()
        });
        
        // Déclencher l'événement onFriendRequestsUpdated
        this.triggerEvent('onFriendRequestsUpdated', this.friendRequests);
        
        // Afficher une notification
        this.showNotification(`Nouvelle demande d'amitié de ${data.username}`);
        break;
        
      case 'friend_request_response':
        console.log('Friend request response received:', data);
        
        // Si la demande a été acceptée, recharger la liste d'amis
        if (data.accepted) {
          this.loadFriends();
          this.showNotification(`${data.username} a accepté votre demande d'amitié`);
        } else {
          this.showNotification(`${data.username} a refusé votre demande d'amitié`);
        }
        
        // Recharger les demandes d'amitié
        this.loadFriendRequests();
        break;
        
      case 'new_room_message':
        console.log('New room message received:', data);
        
        // Ajouter le message à la liste des messages de la salle
        if (!this.roomMessages[data.roomId]) {
          this.roomMessages[data.roomId] = [];
        }
        
        this.roomMessages[data.roomId].push({
          id: data.messageId,
          room_id: data.roomId,
          user_id: data.senderId,
          sender_name: data.senderName,
          message: data.message,
          created_at: data.timestamp
        });
        
        // Si c'est la salle active, mettre à jour l'affichage
        if (this.currentRoomId === data.roomId) {
          this.triggerEvent('onRoomMessagesUpdated', this.roomMessages[data.roomId]);
        } else {
          // Sinon, afficher une notification
          this.showNotification(`Nouveau message dans ${this.getChatRoomName(data.roomId)} de ${data.senderName}`);
        }
        break;
    }
  }
  
  /**
   * Charge la liste des amis
   */
  async loadFriends() {
    try {
      const response = await fetch('/api/friends', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load friends');
      }
      
      this.friends = await response.json();
      this.triggerEvent('onFriendsUpdated', this.friends);
      
      console.log('Friends loaded:', this.friends);
      return this.friends;
    } catch (error) {
      console.error('Error loading friends:', error);
      throw error;
    }
  }
  
  /**
   * Charge les demandes d'amitié
   */
  async loadFriendRequests() {
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load friend requests');
      }
      
      this.friendRequests = await response.json();
      this.triggerEvent('onFriendRequestsUpdated', this.friendRequests);
      
      console.log('Friend requests loaded:', this.friendRequests);
      return this.friendRequests;
    } catch (error) {
      console.error('Error loading friend requests:', error);
      throw error;
    }
  }
  
  /**
   * Envoie une demande d'amitié
   * @param {number} friendId ID de l'ami
   */
  async sendFriendRequest(friendId) {
    try {
      const response = await fetch('/api/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendId }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send friend request');
      }
      
      // Recharger les demandes d'amitié
      await this.loadFriendRequests();
      
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }
  
  /**
   * Répond à une demande d'amitié
   * @param {number} requestId ID de la demande
   * @param {boolean} accept Accepter ou refuser
   */
  async respondToFriendRequest(requestId, accept) {
    try {
      const response = await fetch('/api/friend-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId, accept }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to respond to friend request');
      }
      
      // Recharger les demandes d'amitié et les amis si accepté
      await this.loadFriendRequests();
      
      if (accept) {
        await this.loadFriends();
      }
      
      return true;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  }
  
  /**
   * Supprime un ami
   * @param {number} friendId ID de l'ami
   */
  async removeFriend(friendId) {
    try {
      const response = await fetch(`/api/friend/${friendId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove friend');
      }
      
      // Recharger les amis
      await this.loadFriends();
      
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }
  
  /**
   * Charge les messages d'un ami
   * @param {number} friendId ID de l'ami
   */
  async loadMessages(friendId) {
    try {
      const response = await fetch(`/api/messages/${friendId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to load messages');
      }
      
      const data = await response.json();
      
      // Stocker les messages
      this.messages[friendId] = data.messages;
      this.currentChatFriendId = friendId;
      
      // Déclencher l'événement onMessagesUpdated
      this.triggerEvent('onMessagesUpdated', this.messages[friendId]);
      
      console.log('Messages loaded:', this.messages[friendId]);
      return data;
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  }
  
  /**
   * Envoie un message à un ami
   * @param {number} recipientId ID du destinataire
   * @param {string} content Contenu du message
   */
  async sendMessage(recipientId, content) {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipientId, content }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send message');
      }
      
      const message = await response.json();
      
      // Ajouter le message à la liste
      if (!this.messages[recipientId]) {
        this.messages[recipientId] = [];
      }
      
      this.messages[recipientId].push(message);
      
      // Déclencher l'événement onMessagesUpdated
      this.triggerEvent('onMessagesUpdated', this.messages[recipientId]);
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  /**
   * Marque des messages comme lus
   * @param {number[]} messageIds IDs des messages
   */
  async markMessagesAsRead(messageIds) {
    try {
      // Si la connexion WebSocket est active, utiliser le WebSocket
      if (this.isConnected) {
        this.websocket.send(JSON.stringify({
          type: 'mark_read',
          messageIds
        }));
      } else {
        // Sinon, utiliser l'API REST (à implémenter côté serveur)
        /*
        const response = await fetch('/api/messages/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messageIds }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to mark messages as read');
        }
        */
      }
      
      // Mettre à jour l'état des messages
      for (const friendId in this.messages) {
        this.messages[friendId] = this.messages[friendId].map(msg => {
          if (messageIds.includes(msg.id)) {
            return { ...msg, read: 1 };
          }
          return msg;
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }
  
  /**
   * Recherche des utilisateurs
   * @param {string} query Requête de recherche
   */
  async searchUsers(query) {
    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to search users');
      }
      
      const users = await response.json();
      console.log('Users found:', users);
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
  
  /**
   * Charge les salles de chat disponibles
   */
  async loadChatRooms() {
    try {
      const response = await fetch('/api/chat-rooms', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to load chat rooms');
      }
      
      this.chatRooms = await response.json();
      this.triggerEvent('onChatRoomsUpdated', this.chatRooms);
      
      console.log('Chat rooms loaded:', this.chatRooms);
      return this.chatRooms;
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      throw error;
    }
  }
  
  /**
   * Crée une nouvelle salle de chat
   * @param {string} name Nom de la salle
   * @param {string} description Description de la salle
   * @param {boolean} isPrivate Salle privée ou publique
   */
  async createChatRoom(name, description, isPrivate) {
    try {
      const response = await fetch('/api/chat-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, isPrivate }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create chat room');
      }
      
      const room = await response.json();
      
      // Recharger les salles
      await this.loadChatRooms();
      
      return room;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }
  
  /**
   * Rejoint une salle de chat
   * @param {number} roomId ID de la salle
   */
  async joinChatRoom(roomId) {
    try {
      const response = await fetch(`/api/chat-rooms/${roomId}/join`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to join chat room');
      }
      
      // Recharger les salles
      await this.loadChatRooms();
      
      return true;
    } catch (error) {
      console.error('Error joining chat room:', error);
      throw error;
    }
  }
  
  /**
   * Charge les messages d'une salle de chat
   * @param {number} roomId ID de la salle
   * @param {number} limit Nombre de messages à charger
   * @param {number} before ID du message avant lequel charger
   */
  async loadRoomMessages(roomId, limit = 50, before = null) {
    try {
      let url = `/api/chat-rooms/${roomId}/messages?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to load room messages');
      }
      
      const messages = await response.json();
      
      // Stocker les messages
      this.roomMessages[roomId] = messages;
      this.currentRoomId = roomId;
      
      // Déclencher l'événement onRoomMessagesUpdated
      this.triggerEvent('onRoomMessagesUpdated', this.roomMessages[roomId]);
      
      console.log('Room messages loaded:', this.roomMessages[roomId]);
      return messages;
    } catch (error) {
      console.error('Error loading room messages:', error);
      throw error;
    }
  }
  
  /**
   * Envoie un message dans une salle de chat
   * @param {number} roomId ID de la salle
   * @param {string} message Contenu du message
   */
  async sendRoomMessage(roomId, message) {
    try {
      const response = await fetch(`/api/chat-rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send room message');
      }
      
      const messageData = await response.json();
      
      // Ajouter le message à la liste
      if (!this.roomMessages[roomId]) {
        this.roomMessages[roomId] = [];
      }
      
      this.roomMessages[roomId].push(messageData);
      
      // Déclencher l'événement onRoomMessagesUpdated
      this.triggerEvent('onRoomMessagesUpdated', this.roomMessages[roomId]);
      
      return messageData;
    } catch (error) {
      console.error('Error sending room message:', error);
      throw error;
    }
  }
  
  /**
   * Obtient le nom d'une salle de chat à partir de son ID
   * @param {number} roomId ID de la salle
   */
  getChatRoomName(roomId) {
    const room = this.chatRooms.find(r => r.id === roomId);
    return room ? room.name : 'Salle inconnue';
  }
  
  /**
   * Met à jour le badge de notification
   * @param {number} count Nombre de messages non lus
   */
  updateNotificationBadge(count) {
    const badge = document.querySelector('.unread-count');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }
  
  /**
   * Affiche une notification
   * @param {string} message Message de la notification
   */
  showNotification(message) {
    // Vérifier si les notifications sont supportées
    if (!("Notification" in window)) {
      console.log("Ce navigateur ne supporte pas les notifications");
      return;
    }
    
    // Vérifier si l'autorisation a déjà été accordée
    if (Notification.permission === "granted") {
      new Notification("MS BINGO", { body: message });
    }
    // Sinon, demander la permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("MS BINGO", { body: message });
        }
      });
    }
    
    // Notification visuelle dans l'interface
    const notificationContainer = document.querySelector('.notification-container');
    if (notificationContainer) {
      const notificationElement = document.createElement('div');
      notificationElement.classList.add('notification');
      notificationElement.innerHTML = `
        <div class="notification-content">
          <div class="notification-message">${message}</div>
          <button class="notification-close">&times;</button>
        </div>
      `;
      
      notificationContainer.appendChild(notificationElement);
      
      // Animer l'entrée
      setTimeout(() => {
        notificationElement.classList.add('show');
      }, 10);
      
      // Supprimer après 5 secondes
      setTimeout(() => {
        notificationElement.classList.remove('show');
        setTimeout(() => {
          notificationElement.remove();
        }, 300);
      }, 5000);
      
      // Ajouter gestionnaire pour fermer
      const closeButton = notificationElement.querySelector('.notification-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          notificationElement.classList.remove('show');
          setTimeout(() => {
            notificationElement.remove();
          }, 300);
        });
      }
    }
  }
  
  /**
   * Ajoute un gestionnaire d'événement
   * @param {string} eventName Nom de l'événement
   * @param {function} callback Fonction de rappel
   */
  on(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName].push(callback);
    }
  }
  
  /**
   * Déclenche un événement
   * @param {string} eventName Nom de l'événement
   * @param {any} data Données à passer au gestionnaire
   */
  triggerEvent(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventName} event handler:`, error);
        }
      });
    }
  }
}

// Créer l'instance globale
window.msBingoSocial = new MSBingoSocial();

// Styles CSS pour les notifications
document.head.insertAdjacentHTML('beforeend', `
<style>
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 300px;
  }
  
  .notification {
    background-color: #2a2a2a;
    color: white;
    border-left: 4px solid #0099cc;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transform: translateX(120%);
    transition: transform 0.3s ease;
    position: relative;
  }
  
  .notification.show {
    transform: translateX(0);
  }
  
  .notification-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .notification-message {
    flex-grow: 1;
    margin-right: 10px;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: #999;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    margin: 0;
    line-height: 1;
  }
  
  .notification-close:hover {
    color: white;
  }
  
  .unread-count {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #e53935;
    color: white;
    font-size: 12px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .unread-count.hidden {
    display: none;
  }
  
  /* Styles pour la liste d'amis et le chat */
  .friends-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .friends-list li {
    padding: 10px;
    border-bottom: 1px solid #444;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .friends-list li:hover {
    background-color: #333;
  }
  
  .friends-list li.active {
    background-color: #0099cc;
    color: white;
  }
  
  .friend-name {
    flex-grow: 1;
  }
  
  .friend-actions {
    display: flex;
  }
  
  .friend-actions button {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    margin-left: 5px;
    padding: 2px 5px;
    border-radius: 3px;
  }
  
  .friend-actions button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .chat-messages {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  
  .message {
    max-width: 70%;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 10px;
    word-break: break-word;
  }
  
  .message.sent {
    align-self: flex-end;
    background-color: #0099cc;
    color: white;
    border-bottom-right-radius: 0;
  }
  
  .message.received {
    align-self: flex-start;
    background-color: #333;
    color: white;
    border-bottom-left-radius: 0;
  }
  
  .message-time {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 5px;
    text-align: right;
  }
  
  .message-sender {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 3px;
  }
  
  .chat-input {
    display: flex;
    padding: 10px;
    background-color: #222;
    border-top: 1px solid #444;
  }
  
  .chat-input input {
    flex-grow: 1;
    padding: 10px;
    background-color: #333;
    border: 1px solid #555;
    border-radius: 20px;
    color: white;
    margin-right: 10px;
  }
  
  .chat-input button {
    background-color: #0099cc;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 10px 15px;
    cursor: pointer;
  }
  
  .chat-input button:hover {
    background-color: #00aadd;
  }
  
  /* Styles pour les demandes d'amitié */
  .friend-requests {
    margin-top: 20px;
  }
  
  .friend-request {
    background-color: #2a2a2a;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .request-info {
    flex-grow: 1;
  }
  
  .request-actions {
    display: flex;
  }
  
  .request-actions button {
    margin-left: 5px;
    padding: 5px 10px;
    border-radius: 3px;
    border: none;
    cursor: pointer;
  }
  
  .accept-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .decline-btn {
    background-color: #e53935;
    color: white;
  }
  
  /* Styles pour les boutons d'onglet */
  .social-tabs {
    display: flex;
    background-color: #222;
    border-bottom: 1px solid #444;
  }
  
  .social-tab {
    flex: 1;
    text-align: center;
    padding: 15px;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
    position: relative;
  }
  
  .social-tab:hover {
    background-color: #333;
  }
  
  .social-tab.active {
    border-bottom-color: #0099cc;
    background-color: #2a2a2a;
  }
  
  .tab-content {
    display: none;
    padding: 15px;
    background-color: #2a2a2a;
    flex-grow: 1;
    overflow: auto;
  }
  
  .tab-content.active {
    display: block;
  }
  
  /* Styles pour la recherche d'utilisateurs */
  .user-search {
    margin-bottom: 15px;
  }
  
  .user-search input {
    width: 100%;
    padding: 10px;
    background-color: #333;
    border: 1px solid #555;
    border-radius: 20px;
    color: white;
  }
  
  .search-results {
    margin-top: 10px;
  }
  
  .search-result {
    padding: 10px;
    border-bottom: 1px solid #444;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .search-result:last-child {
    border-bottom: none;
  }
  
  .result-actions button {
    background-color: #0099cc;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 5px 10px;
    cursor: pointer;
  }
  
  .result-actions button:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
</style>
`);

// Créer le conteneur de notifications si nécessaire
if (!document.querySelector('.notification-container')) {
  const notificationContainer = document.createElement('div');
  notificationContainer.classList.add('notification-container');
  document.body.appendChild(notificationContainer);
}

/**
 * Initialise les fonctionnalités sociales une fois que l'utilisateur est authentifié
 * @param {number} userId ID de l'utilisateur
 * @param {string} username Nom d'utilisateur
 */
window.initializeSocialFeatures = async function(userId, username) {
  await window.msBingoSocial.init(userId, username);
  console.log('MS Bingo Social features initialized for user:', username);
};