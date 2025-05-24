// Fonction pour afficher une notification
function showNotification(message, type = 'success', duration = 7000) {
    const notificationsContainer = document.getElementById('notifications-container');
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Icône appropriée selon le type
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    // Structure de la notification
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon} notification-icon"></i>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Ajouter au conteneur
    notificationsContainer.appendChild(notification);
    
    // Ajouter l'événement pour le bouton de fermeture
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Timer pour la fermeture automatique
    const timer = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Stocker le timer pour pouvoir l'annuler si nécessaire
    notification.dataset.timer = timer;
    
    return notification;
}

// Fonction pour fermer une notification
function closeNotification(notification) {
    // Annuler le timer si existant
    if (notification.dataset.timer) {
        clearTimeout(Number(notification.dataset.timer));
    }
    
    // Ajouter la classe pour l'animation
    notification.classList.add('hiding');
    
    // Supprimer après l'animation
    setTimeout(() => {
        notification.remove();
    }, 300); // Durée de l'animation
}

// Fonctions utilitaires pour faciliter l'utilisation dans l'application
function showSuccessNotification(message, duration = 7000) {
    return showNotification(message, 'success', duration);
}

function showErrorNotification(message, duration = 10000) {
    return showNotification(message, 'error', duration);
}

// Fonction pour échapper les caractères HTML spéciaux
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fonction pour afficher des erreurs API
function showApiError(error) {
    let message = "Une erreur est survenue";
    
    if (typeof error === 'string') {
        message = error;
    } else if (error && error.message) {
        message = error.message;
    }
    
    showErrorNotification(message);
    console.error('API Error:', error);
}
