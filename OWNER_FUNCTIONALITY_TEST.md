# Guide de Test - Fonctionnalités Propriétaire (Owner)

Ce guide vous explique comment tester toutes les fonctionnalités propriétaire de la plateforme Ekrili.

## 1. Création de Compte Propriétaire

### Étape 1: Inscription
1. Allez sur la page d'accueil: http://localhost:5000
2. Cliquez sur "Se connecter" dans la navbar
3. Cliquez sur "Créer un compte"
4. Remplissez le formulaire avec ces informations de test:
   ```
   Prénom: Mohamed
   Nom: Ben Ahmed
   Email: mohamed.ahmed@test.tn
   Téléphone: +216 22 345 678
   Mot de passe: TestOwner123!
   Rôle: Propriétaire (owner)
   ```
5. Cliquez sur "Créer mon compte"

### Étape 2: Connexion
1. Utilisez les identifiants créés pour vous connecter
2. Vous devriez être redirigé vers le dashboard propriétaire

## 2. Dashboard Propriétaire

### Fonctionnalités à tester:
1. **Statistiques de revenus**: Vérifiez l'affichage des gains totaux
2. **Nombre de propriétés**: Compteur des propriétés actives
3. **Taux d'occupation**: Pourcentage d'occupation des propriétés
4. **Réservations récentes**: Liste des dernières réservations

### Navigation:
- Testez les liens vers "Mes Propriétés", "Ajouter une propriété", "Messages", "Statistiques"

## 3. Ajouter une Propriété (Processus en 6 Étapes)

### Accès:
- Via Dashboard → "Ajouter une propriété"
- Ou directement: http://localhost:5000/post-listing

### Étape 1: Informations de base
```
Titre: Villa de Luxe - Hammamet
Description: Magnifique villa avec piscine privée et vue mer
Catégorie: Maison (house)
Type: Villa
Région: Nabeul
Adresse: Route Touristique, Hammamet
Coordonnées GPS: 36.4003°N, 10.6128°E
```

### Étape 2: Détails de la propriété
```
Chambres: 4
Salles de bain: 3
Invités max: 8
Meublé: Oui
```

### Étape 3: Équipements
Sélectionnez:
- WiFi
- Piscine
- Parking
- Climatisation
- Cuisine équipée
- TV
- Balcon/Terrasse
- Jardin

### Étape 4: Photos
- Ajoutez au moins 3 photos (utilisez les URLs de test ou téléchargez des images)
- Testez l'upload et la prévisualisation

### Étape 5: Tarification
```
Prix par nuit: 180 TND
Prix par mois: 4500 TND
Séjour minimum: 2 nuits
Séjour maximum: 30 nuits
```

### Étape 6: Règles et publication
```
Règles de la maison: Non-fumeur, Animaux non autorisés
Propriété vérifiée: Oui
Réservation instantanée: Non
Étudiant-friendly: Non
```

## 4. Gestion des Propriétés

### Tests à effectuer:
1. **Voir mes propriétés**: Dashboard → "Mes Propriétés"
2. **Modifier une propriété**: Cliquez sur "Modifier" sur une propriété existante
3. **Désactiver/Activer**: Testez l'activation/désactivation des annonces
4. **Supprimer**: Test de suppression d'une propriété

## 5. Gestion des Réservations

### Tests de réservations:
1. **Nouvelles demandes**: Voir les demandes de réservation
2. **Accepter/Refuser**: Gérer les demandes entrantes
3. **Calendrier**: Vérifier la disponibilité des propriétés
4. **Historique**: Consulter les réservations passées

## 6. Système de Messagerie

### Test de communication:
1. **Messages entrants**: Réponse aux messages des locataires
2. **Initier conversation**: Contacter un locataire potentiel
3. **Notifications**: Vérifier les alertes de nouveaux messages
4. **Historique des conversations**: Accéder aux anciens échanges

## 7. Profil Propriétaire

### Gestion du profil:
1. **Informations personnelles**: Modifier nom, email, téléphone
2. **Photo de profil**: Ajouter/modifier l'avatar
3. **Vérification**: Processus de vérification du compte
4. **Langues parlées**: Ajouter les langues de communication

## 8. Tests de Performance

### Fonctionnalités avancées:
1. **Filtres**: Tester les filtres par région, catégorie, prix
2. **Recherche**: Vérifier la recherche de propriétés
3. **Carte interactive**: Localisation des propriétés sur la carte
4. **Favoris**: System de favoris pour les propriétés

## 9. Tests de Sécurité

### Vérifications importantes:
1. **Authentification**: Accès restreint aux fonctions propriétaire
2. **Session**: Déconnexion automatique après inactivité
3. **Données sensibles**: Protection des informations personnelles
4. **Autorisations**: Seul le propriétaire peut modifier ses propriétés

## 10. Tests d'Intégration

### Flux complets:
1. **Création → Publication → Réservation**: Cycle complet d'une propriété
2. **Communication client**: Interaction propriétaire-locataire
3. **Gestion financière**: Calculs de revenus et commissions
4. **Notifications**: Alertes email et SMS

## Comptes de Test Disponibles

### Propriétaires existants:
```
Compte 1:
Email: ahmed.khaled@email.com
Mot de passe: (à définir lors du test)
Propriétés: Villa Sidi Bou Said

Compte 2:  
Email: fatma.ben.salem@email.com
Mot de passe: (à définir lors du test)
Propriétés: Appartement Centre-ville
```

## Résolution de Problèmes

### Erreurs courantes:
1. **Erreur 401**: Problème d'authentification - reconnectez-vous
2. **Images non affichées**: Vérifiez les URLs des images
3. **Formulaire vide**: Vérifiez que tous les champs requis sont remplis
4. **Sauvegarde échouée**: Vérifiez la connexion réseau

### Support technique:
- Vérifiez la console du navigateur (F12) pour les erreurs
- Consultez les logs du serveur pour les erreurs backend
- Testez avec différents navigateurs (Chrome, Firefox, Safari)

## Validation du Test

Une fois tous les tests effectués, vous devriez pouvoir:
✅ Créer et publier une propriété complète
✅ Recevoir et gérer des demandes de réservation  
✅ Communiquer avec les locataires via messages
✅ Consulter les statistiques et revenus
✅ Modifier et gérer vos propriétés existantes
✅ Naviguer facilement dans toutes les sections propriétaire

Ce guide couvre toutes les fonctionnalités essentielles du côté propriétaire de la plateforme Ekrili.