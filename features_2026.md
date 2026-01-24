Amélioration et fonctionnalités pour l'édition 2026. L'ordre n'est pas établi en fonction des priorités, et il reste à classer les idées ci dessous selon les catégories:
- ❤️ Prioritaire (= disponibilité obligatoire le jour du SAP)
- 💛 Secondaire (= cool si on a le temps de les avoir mais pas critique)
- 💚 Bonus (= Si tout est fini avant, on peut tenter le développement pour le fun, possibilité de pas les mettre en production)

Suivi de l'avancement:

- ✅ : Les fonctionnalités déjà développées, disponibles.
- 🕐 : Les fonctionnalités en cours de développement.

## ✅ 0. Fonctionnalités existantes de l'app SAP 2025

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

### ❤️ **Authentification utilisateur** --> un compte par participant
- Intégration Firebase Authentication
- Écran de connexion/inscription
- Lien avec HelloAsso/Shotgun (webhook, API): 
    - Vérification statut billet via API HelloAsso/Shotgun
    - Code unique par participant, reçu lors de l'achat du billet
    - DETAILS: besoin d'une partie backend (ou firebase cloud functions ?) pour connecter avec les hooks des API ticket et créer automatiquement un compte par festivalier. Estimation de temps : 3 jours
- Types de roles: "participant", "bénévole" et "organisateur"

### 💛 **Notification**:
- Possibilité d'envoyer des notifications aux utilisateurs
    - notif par defaut: envoyer leur perm aux orgas 5min avant le début
- Possibilité pour un utilisateur de souscrire à une activité / un artiste

### ❤️ **Gestion des perms**:
- ✅ Les organistateurs peuvent accéder à leur perms:
    - affichage sous forme de calendrier
    - filtrer par défaut sur leurs perms, possibilité de voirs toutes les perms
- Notifications au début et à la fin des perms


### 💚 **Messagerie**:
- Plusieurs cannaux :
    - Envoyer un message privé vers la team orga (visible seulement par l'utilisateur et par les membres organisateurs), par exemple pour signaler un problème / poser une question
    - Cannal affaire perdues
    - Canal discussion générale
    - Canal des orgas vers tous les festivaliers, sans que les festivaliers puissent répondre. Si possible, publication automatique dans un canal Whatsapp dès qu'un message est publié dans ce canal (même message).

DETAIL : besoin de firebase aussi, mais comme les requetes de lecture viennent de chaque client, alors on multiple par le nb d'utilisateur le nb de requete, ca peut faire exploser les limites firebase. Sinon, il faudrait un backend a part qui stocke les msgs. Pas forcément prioritaire, on peut passer par whatsapp en attendant.

### 💛 **Boutique**:
- Simple lien vers les articles de merch (ca serait trop long d'implémenter un paiement directement dans l'application)

### ❤️ **Musique**:
- Meilleur affichage de la line up
    - possibilité de faire une recherche (style, nom de dj)
    - affichage par défaut en fonction du jour courant
    - affichage de l'artiste en cour
    - possibilité pour l'utilisateur de mettre des likes / des réaction au set en cours ? --> voir "intéractivité public"
- Ajouter musique soundclound (ou lien si pas possible) pour chaque artiste

### ❤️ **Gestion orga**:
- Intégrer des outils de gestion pours les orga 
    - Gestion des stocks du bar, de la cuisine, de la déco, ...
    - intégration des gestion camions / logistique ?

### 💚 **Intéractivité public**:
- Possibilité pour les utilisateur qu'une action sur l'application entraine un évenement dans le réel ? (exemple: faire monter ou descendre le court de la bière, voter pour quelque chose et visualisation en direct sur un écran, pouvoir choisir la prochaine musique)
- intégrer l'application aux activités (pouvoir voter pour un quizz de culture G, ou besoin d'inscription, compter les points pour le tournoi de volley, etc...)
- système de "stories" que les participants peuvent publier ?

### 💚 **Fun**:
- bloopers dans l'affichage liés au thème de la DA
- mini jeux liés au thème de la DA

### ❤️ **Présentation équipe**:
- faire une petite fiche perso par organisateur avec sa description. Quand on clique sur le nom d'un orga dans l'application, ca ouvre sa fiche perso. exemple: 
    - activité, tu clique sur qui l'organise, tu vois sa tete directement
    - Tu est bénévole, en team avec un orga, du clique sur ton binome pour avoir sa tete

### ❤️ **Instruction bénévoles**:
-  Un endroit ou les benevoles peuvent checker/verifier (pense bête) en quoi consistent leur tâches:
    - recette des différents cocktails
    - description perm scarabé,...
    - des rappels comme rester vigilant aux verres sur la scène...

### 💛 **Solution de covoiturage**:
- Une page simple et clair permettant aux gens de s'inscrire en covoiturage:
    - proposer leur voiture, avec le nb de place et leur contact
    - se mettre en recherche d'une voiture
    - faire une demande de joindre une voiture 
DETAIL : plus on veut de l'automatisation et des features style blablacar, plus ca va prendre du temps de dev, hors c'est pas le but de dev une appli de covoit. 


## 🔨 2. Architecture Techno

### ❤️ **Gestion données**: obtention dynamique
- ✅ Pull les données (artistes, activités, repas) depuis feuille Google Sheet en ligne, mise à jour par chaque pôles d'organisation. 
- ✅ Mise a jour des données en direct après mise à jour du google sheet
- Sauvegarde de l'historique des données dans firebase, pour éviter les pertes si effacement accidentel 

### **Installation de l'application sur mobile**
- TODO: Quelle solution choisir pour que les utilisateurs puissent installer l'application sur leur mobile ? Est ce que ca vaut le coup de payer les frais pour l'app store Apple, ou bien est ce possible de passer par des moyens gratuits, tout en gardant les fonctionnalités de notifications ? Et pour Android ?


## 🐸 3. Affichage

### **Adapter à la nouvelle DA**
- 🕐 Structure adaptative du code au code couleurs de la nouvelle DA (pour pouvoir mettre a jour rapidement tout l'affichage)

### **Organisation du site**
- 🕐 Améliorer l'intuitivité et l'organisation des onglets
 
