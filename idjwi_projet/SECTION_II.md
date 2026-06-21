# II. ÉTUDE DE MARCHÉ ET FAISABILITÉ TECHNIQUE

## II.1. ANALYSE DE LA DEMANDE ÉLECTRIQUE (Estimation de la charge, profil de consommation journalier)
L'estimation de la charge repose sur une analyse segmentée de la consommation journalière des abonnés cibles sur l'Île d'Idjwi. La consommation journalière cumulée est estimée à **3 270 kWh/jour**.

### II.1.1. Estimation de la charge par segment
*   **Ménages (2 000 kWh/jour) :** 5 000 foyers avec une consommation unitaire de 0,4 kWh/jour (éclairage LED, radio, recharge de téléphones).
*   **Commerces (900 kWh/jour) :** ~750 boutiques avec une consommation unitaire de 1,2 kWh/jour (éclairage nocturne, ventilateurs, petits équipements audiovisuels).
*   **Activités Productives (500 kWh/jour) :** 20 ateliers et coopératives avec une consommation unitaire de 25 kWh/jour (force motrice pour menuiseries, moulins, réfrigération).
*   **Services Publics (270 kWh/jour) :** 15 centres de santé (8 kWh/jour/unité) et 50 écoles (3 kWh/jour/unité).

### II.1.2. Profil de consommation journalier (Courbe de charge)
Le profil de charge présente deux pics distincts :
1.  **Plateau Diurne (09h00 - 15h00) :** ~150 kW, correspondant à l'activité des ateliers et coopératives (usage productif), coïncidant avec le pic de production solaire (autoconsommation directe).
2.  **Pic de Pointe de Soirée (18h00 - 21h00) :** ~350 kW, lié à l'allumage simultané de l'éclairage résidentiel et public.

| Bloc Horaire | Puissance Requise | Type de demande | Source d'énergie |
|:---|:---:|:---|:---|
| 00h00 - 06h00 | 35 kW | Veille, médical | BESS |
| 06h00 - 09h00 | 90 kW | Réveil, administratif | Solaire + BESS |
| 09h00 - 15h00 | 150 kW | **Industriel/Productif** | Solaire Direct |
| 15h00 - 18h00 | 110 kW | Scolaire, commerce | Solaire + BESS |
| 18h00 - 21h00 | 350 kW | **Pic Résidentiel** | BESS + Secours |
| 21h00 - 00h00 | 120 kW | Commerce résiduel | BESS |

## II.2. ANALYSE DE L'OFFRE ET POLITIQUE DE TARIFICATION (Comparaison avec les générateurs diesel existants, prix cible du kWh)

### II.2.1. Comparaison avec les solutions alternatives
L'offre actuelle est dominée par des groupes diesel individuels inefficaces.
*   **Diesel (Option rejetée) :** Coût du kWh > 0,65 USD, logistique d'importation de carburant complexe et polluante.
*   **Micro-hydro (Option rejetée) :** Débit des rivières insuffisant et saisonnier.
*   **Câble sous-lacustre SNEL (Option rejetée) :** Coût prohibitif (~12 M USD) et risques sismiques/tectoniques.

### II.2.2. Prix cible du kWh
La structure tarifaire est conçue pour assurer la solvabilité des usagers tout en garantissant la rentabilité du projet :
*   **Tarif Résidentiel :** 0,15 USD/kWh.
*   **Tarif Professionnel/Industriel :** 0,22 USD/kWh (reflétant la valeur ajoutée de la force motrice).
*   **Tarif Social (Santé/Éducation) :** 0,10 USD/kWh.

## II.3. DESCRIPTIF TECHNIQUE ET INGÉNIERIE DE LA CENTRALE (Composants : Champ PV, Parc de batteries/Stockage, Groupe de secours/Hybridation, Réseau de distribution MT/BT)
L'infrastructure repose sur une architecture hybride optimisée pour les zones isolées.

### II.3.1. Champ Photovoltaïque (Production)
*   **Puissance :** 1,0 MWc.
*   **Composants :** 1 818 modules monocristallins de 550 Wc (rendement > 21 %).
*   **Installation :** Structures en acier galvanisé sur dalles béton, inclinaison optimisée pour la latitude équatoriale.

### II.3.2. Parc de Batteries / Stockage (BESS)
*   **Capacité :** 500 kWh utiles.
*   **Rôle :** Lissage de la production, fourniture du pic de soirée et alimentation nocturne.
*   **Gestion :** Système de contrôle automatique (EMS) pour la régulation de charge/décharge et monitoring de température.

### II.3.3. Groupe de secours / Hybridation
*   **Puissance :** 110 kVA.
*   **Rôle :** Appui thermique lors des périodes de faible insolation prolongée ou pics de demande exceptionnels.
*   **Automatisation :** Démarrage automatique piloté par le régulateur central.

### II.3.4. Réseau de distribution MT/BT
*   **Linéaire :** 12 kilomètres de ligne basse tension (400V triphasé / 230V monophasé).
*   **Supports :** 350 pylônes en bois traité en autoclave (anti-termites et anti-humidité).
*   **Conducteurs :** Câbles en aluminium torsadés isolés pour minimiser les pertes et les risques de court-circuit.
*   **Protection :** Parafoudres haute intensité pour la protection contre les orages lacustres.
*   **Comptage :** 5 000 compteurs communicants Pay-As-You-Go.
