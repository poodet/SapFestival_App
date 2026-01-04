Amélioration et fonctionnalités pour l'édition 2026. L'ordre n'est pas établi en fonction des priorités, et il reste à classer les idées ci dessous selon les catégories:
- Prioritaire (= disponibilité obligatoire le jour du SAP)
- Secondaire (= cool si on a le temps de les avoir mais pas critique)
- Bonus (= Si tout est fini avant, on peut tenter le développement pour le fun, possibilité de pas les mettre en production)

## ✅ 0. Fonctionnalités existantes

### **Onglet menu**: 
- Menu Nourriture: PDF (créé par le pôle DA (Direction Artistique) et intégré manuellement)
- Menu Bar: PDF (créé par le pôle DA et intégré manuellement)
- Améliorations -->
    - Télécharger automatiquement le PDF depuis un document sur google Drive et l'afficher sans devoir cliquer sur un bouton

### **Onglet Artistes**:
- Affichage sous forme de liste des artistes, avec leur photo, nom, heure de passage et description
- Améliorations --> Voir "Musique"  

### **Onglet Calendrier**:
- Affichage du calendrier en fonction de la journée
- Affichage des catégories "Artiste", "Activité" et "Repas" tout en même temps
- Améliorations --> voir "Calendrier"

### **Onglet Activité**:
- Affichage sous forme de liste des activités, avec leur nom, heure, lieu, organisateur et description
- Améliorations --> 
    - Affichage par jour et dans un calendrier
    - possibilité de s'inscrire à une activité, et de définir un rappel qui enverra une notification

### **Onglet Infos**:
- Liste des numéros d'urgence
- Plan d'accès
- règles
- horaires douches
- Que mettre dans mon sac
- Améliorations -->
    - Lien google maps / adresse du lieu et du parking
    - numéros d'urgence cliquable
    - lien vers compte instagram du festival
    - info sur le stand de prévention et gestion des risques

## 🌊 1. Experience utilisateur

### **Authentification utilisateur** --> un compte par participant
- Intégration Firebase Authentication
- Écran de connexion/inscription
- Lien avec HelloAsso/Shotgun (webhook, API): 
    - Vérification statut billet via API HelloAsso/Shotgun
    - Code unique par participant, reçu lors de l'achat du billet
- Types de roles: "participant", "bénévole" et "organisateur"

### **Notification**:
- Possibilité d'envoyer des notifications aux utilisateurs

### **Gestion des perms**:
- Les organistateurs peuvent accéder à leur perms:
    - affichage sous forme de calendrier
    - filtrer par défaut sur leurs perms, possibilité de voirs toutes les perms
- Notifications au début et à la fin des perms

### **Calendrier**
- Amélioration du calendrier, possibilité pour filtrer seulement les artistes / les activités / les repas

### **Messagerie**:
- Plusieurs cannaux :
    - Envoyer un message privé vers la team orga (visible seulement par l'utilisateur et par les membres organisateurs), par exemple pour signaler un problème / poser une question
    - Cannal affaire perdues
    - Canal discussion générale
    - Canal des orgas vers tous les festivaliers, sans que les festivaliers puissent répondre. Si possible, publication automatique dans un canal Whatsapp dès qu'un message est publié dans ce canal (même message).

### **Boutique**:
- Simple lien vers les articles de merch (ca serait trop long d'implémenter un paiement directement dans l'application)

### **Musique**:
- Meilleur affichage de la line up
    - possibilité de faire une recherche (style, nom de dj)
    - affichage par défaut en fonction du jour courant
    - affichage de l'artiste en cour
    - possibilité pour l'utilisateur de mettre des likes / des réaction au set en cours ? --> voir "intéractivité public"
- Ajouter musique soundclound (ou lien si pas possible) pour chaque artiste

### **Gestion orga**:
- Intégrer des outils de gestion pours les orga 
    - Gestion des stocks du bar, de la cuisine, de la déco, ...
    - intégration des gestion camions / logistique ?

### **Intéractivité public**:
- Possibilité pour les utilisateur qu'une action sur l'application entraine un évenement dans le réel ? (exemple: faire monter ou descendre le court de la bière, voter pour quelque chose et visualisation en direct sur un écran, pouvoir choisir la prochaine musique)
- intégrer l'application aux activités (pouvoir voter pour un quizz de culture G, ou besoin d'inscription, compter les points pour le tournoi de volley, etc...)

### **Fun**:
- bloopers dans l'affichage liés au thème de la DA
- mini jeux liés au thème de la DA

## 🔨 2. Architecture Techno

### **Gestion données**
- Pull les données (artistes, activités, repas) depuis feuille Google Sheet en ligne, mise à jour par chaque pôles d'organisation. 
- Mise a jour des données en direct après mise à jour du google sheet
- Sauvegarde de l'historique des données dans firebase, pour éviter les pertes si effacement accidentel 

### **Installation de l'application sur mobile**
- TODO: Quelle solution choisir pour que les utilisateurs puissent installer l'application sur leur mobile ? Est ce que ca vaut le coup de payer les frais pour l'app store Apple, ou bien est ce possible de passer par des moyens gratuits, tout en gardant les fonctionnalités de notifications ? Et pour Android ?


## 🐸 3. Affichage

### **Adapter à la nouvelle DA**
- Structure adaptative du code au code couleurs de la nouvelle DA (pour pouvoir mettre a jour rapidement tout l'affichage)

### **Organisation du site**
- Améliorer l'intuitivité et l'organisation des onglets
 