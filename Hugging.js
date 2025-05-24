// Script IA Chat - Hugging Face (Version Console Améliorée)
// Basé sur l'interface web IA-chat.html

import { HfInference } from '@huggingface/inference';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
    API_KEY: 'API_KEY_HUGGING_FACE', // Remplacez par votre clé API Hugging Face
    MODELES_DISPONIBLES: [
        'meta-llama/Llama-3.1-8B-Instruct',
        'mistralai/Mistral-7B-Instruct-v0.3',
        'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'Qwen/Qwen2.5-7B-Instruct',
        'microsoft/DialoGPT-medium',
        'google/flan-t5-large'
    ],
    PARAMETRES: {
        temperature: 0.7,
        max_tokens: 150,
        system_message: 'Tu es un assistant utile et amical.'
    }
};

// Initialisation de Hugging Face
const hf = new HfInference(CONFIG.API_KEY);

// Variables globales
let conversations = [];
let conversationActive = null;
let conversationIdCounter = 1;
let modeleChoisi = CONFIG.MODELES_DISPONIBLES[0];

// Interface de lecture
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fonctions utilitaires
function afficherTitre() {
    console.clear();
    console.log('\n' + '='.repeat(60));
    console.log('🤖 IA CHAT - HUGGING FACE (Version Console v2.0)');
    console.log('='.repeat(60));
    console.log(`📡 Modèle actuel: ${modeleChoisi.split('/')[1]}`);
    if (conversationActive) {
        console.log(`💬 Conversation: ${conversationActive.title}`);
    }
    console.log('='.repeat(60) + '\n');
}

function afficherCommandes() {
    console.log('\n📋 Commandes disponibles:');
    console.log('  📝 [votre message]     - Envoyer un message');
    console.log('  /help                  - Afficher cette aide');
    console.log('  /models                - Changer de modèle');
    console.log('  /new                   - Nouvelle conversation');
    console.log('  /list                  - Lister les conversations');
    console.log('  /switch [n]            - Changer vers conversation n');
    console.log('  /delete [n]            - Supprimer conversation n');
    console.log('  /export                - Exporter conversations');
    console.log('  /import [fichier]      - Importer conversations');
    console.log('  /settings              - Modifier les paramètres');
    console.log('  /clear                 - Effacer l\'écran');
    console.log('  /exit                  - Quitter');
    console.log('');
}

// Gestion des conversations
function creerNouvelleConversation() {
    const nouvelleConv = {
        id: conversationIdCounter++,
        title: `Conversation ${conversationIdCounter - 1}`,
        messages: [{ role: 'system', content: CONFIG.PARAMETRES.system_message }],
        lastUpdate: new Date(),
        model: modeleChoisi
    };
    
    conversations.push(nouvelleConv);
    conversationActive = nouvelleConv;
    
    console.log(`✅ Nouvelle conversation créée: ${nouvelleConv.title}`);
    sauvegarderConversations();
}

function listerConversations() {
    if (conversations.length === 0) {
        console.log('📭 Aucune conversation disponible.');
        return;
    }
    
    console.log('\n📋 Conversations disponibles:');
    conversations.forEach((conv, index) => {
        const actif = conv.id === conversationActive?.id ? '👉 ' : '   ';
        const date = conv.lastUpdate.toLocaleDateString('fr-FR');
        console.log(`${actif}${index + 1}. ${conv.title} (${date})`);
    });
    console.log('');
}

function changerConversation(index) {
    if (index < 1 || index > conversations.length) {
        console.log('❌ Numéro de conversation invalide.');
        return;
    }
    
    conversationActive = conversations[index - 1];
    console.log(`✅ Conversation changée: ${conversationActive.title}`);
    
    // Afficher l'historique
    console.log('\n📜 Historique de la conversation:');
    conversationActive.messages.forEach(msg => {
        if (msg.role === 'user') {
            console.log(`👤 Vous: ${msg.content}`);
        } else if (msg.role === 'assistant') {
            console.log(`🤖 IA: ${msg.content}`);
        }
    });
    console.log('');
}

// Sauvegarde et chargement
function sauvegarderConversations() {
    try {
        const data = {
            conversations,
            conversationActive: conversationActive?.id || null,
            conversationIdCounter,
            modeleChoisi
        };
        fs.writeFileSync('conversations.json', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('⚠️ Impossible de sauvegarder les conversations:', error.message);
    }
}

function chargerConversations() {
    try {
        if (fs.existsSync('conversations.json')) {
            const data = JSON.parse(fs.readFileSync('conversations.json', 'utf8'));
            
            conversations = data.conversations.map(conv => ({
                ...conv,
                lastUpdate: new Date(conv.lastUpdate)
            }));
            
            conversationIdCounter = data.conversationIdCounter || 1;
            modeleChoisi = data.modeleChoisi || CONFIG.MODELES_DISPONIBLES[0];
            
            if (data.conversationActive) {
                conversationActive = conversations.find(c => c.id === data.conversationActive);
            }
            
            console.log(`✅ ${conversations.length} conversations chargées.`);
        }
    } catch (error) {
        console.log('⚠️ Impossible de charger les conversations:', error.message);
    }
}

// Envoi de messages
async function envoyerMessage(messageUtilisateur) {
    if (!conversationActive) {
        creerNouvelleConversation();
    }

    // Ajouter le message à l'historique
    conversationActive.messages.push({ role: 'user', content: messageUtilisateur });

    try {
        console.log('\n🔄 Génération de la réponse...');
        
        const response = await hf.chatCompletion({
            model: modeleChoisi,
            messages: conversationActive.messages,
            temperature: CONFIG.PARAMETRES.temperature,
            max_tokens: CONFIG.PARAMETRES.max_tokens
        });

        const messageIA = response.choices[0].message.content;
        conversationActive.messages.push({ role: 'assistant', content: messageIA });
        
        // Mettre à jour les métadonnées
        conversationActive.lastUpdate = new Date();
        if (conversationActive.title.startsWith('Conversation') && conversationActive.messages.length === 3) {
            conversationActive.title = genererTitreConversation(messageUtilisateur);
        }

        console.log(`\n🤖 IA: ${messageIA}\n`);
        
        sauvegarderConversations();
        
    } catch (erreur) {
        console.error('\n❌ Erreur lors de la requête:', erreur.message);
        // Retirer le message utilisateur en cas d'erreur
        conversationActive.messages.pop();
    }
}

function genererTitreConversation(premierMessage) {
    const mots = premierMessage.split(' ').slice(0, 4);
    let titre = mots.join(' ');
    if (premierMessage.length > 30) {
        titre += '...';
    }
    return titre.charAt(0).toUpperCase() + titre.slice(1) || 'Nouvelle conversation';
}

// Sélection de modèle
function choisirModele() {
    console.log('\n🧠 Sélectionnez un modèle parmi les suivants:');
    CONFIG.MODELES_DISPONIBLES.forEach((modele, index) => {
        const actif = modele === modeleChoisi ? '👉 ' : '   ';
        console.log(`${actif}${index + 1}. ${modele}`);
    });

    rl.question('\n📝 Entrez le numéro du modèle souhaité: ', (numero) => {
        const index = parseInt(numero) - 1;
        if (index >= 0 && index < CONFIG.MODELES_DISPONIBLES.length) {
            modeleChoisi = CONFIG.MODELES_DISPONIBLES[index];
            console.log(`\n✅ Modèle sélectionné: ${modeleChoisi}\n`);
            sauvegarderConversations();
        } else {
            console.log('❌ Numéro invalide. Modèle inchangé.\n');
        }
        demarrerConversation();
    });
}

// Export/Import
function exporterConversations() {
    try {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `conversations-export-${timestamp}.json`;
        const data = {
            conversations,
            metadata: {
                exportDate: new Date().toISOString(),
                version: '2.0',
                totalConversations: conversations.length
            }
        };
        
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`✅ Conversations exportées vers: ${filename}`);
    } catch (error) {
        console.log('❌ Erreur lors de l\'export:', error.message);
    }
}

function importerConversations(filename) {
    try {
        if (!fs.existsSync(filename)) {
            console.log('❌ Fichier non trouvé:', filename);
            return;
        }
        
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        
        if (data.conversations && Array.isArray(data.conversations)) {
            conversations = data.conversations.map(conv => ({
                ...conv,
                lastUpdate: new Date(conv.lastUpdate)
            }));
            
            conversationIdCounter = Math.max(...conversations.map(c => c.id)) + 1;
            conversationActive = conversations[0] || null;
            
            sauvegarderConversations();
            console.log(`✅ ${conversations.length} conversations importées avec succès.`);
        } else {
            console.log('❌ Format de fichier invalide.');
        }
    } catch (error) {
        console.log('❌ Erreur lors de l\'import:', error.message);
    }
}

// Interface principale
function demarrerConversation() {
    afficherTitre();
    
    rl.question('👤 Vous (ou /help pour les commandes): ', async (input) => {
        const commande = input.trim();
        
        if (commande === '/exit') {
            console.log('\n👋 Au revoir !');
            rl.close();
            return;
        }
        
        if (commande === '/help') {
            afficherCommandes();
        } else if (commande === '/models') {
            choisirModele();
            return;
        } else if (commande === '/new') {
            creerNouvelleConversation();
        } else if (commande === '/list') {
            listerConversations();
        } else if (commande.startsWith('/switch ')) {
            const index = parseInt(commande.split(' ')[1]);
            changerConversation(index);
        } else if (commande.startsWith('/delete ')) {
            const index = parseInt(commande.split(' ')[1]);
            if (index >= 1 && index <= conversations.length) {
                conversations.splice(index - 1, 1);
                if (conversationActive && conversations.length > 0) {
                    conversationActive = conversations[0];
                }
                console.log('✅ Conversation supprimée.');
                sauvegarderConversations();
            }
        } else if (commande === '/export') {
            exporterConversations();
        } else if (commande.startsWith('/import ')) {
            const filename = commande.split(' ')[1];
            importerConversations(filename);
        } else if (commande === '/clear') {
            console.clear();
        } else if (commande !== '') {
            await envoyerMessage(commande);
        }
        
        demarrerConversation();
    });
}

// Démarrage du script
console.log('🚀 Initialisation...');
chargerConversations();

if (conversations.length === 0) {
    creerNouvelleConversation();
} else {
    conversationActive = conversations[0];
}

afficherCommandes();
demarrerConversation();
