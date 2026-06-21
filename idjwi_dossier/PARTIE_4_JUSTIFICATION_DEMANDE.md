# PROJET D'ÉLECTRIFICATION DE L'ÎLE D'IDJWI PAR CENTRALE PHOTOVOLTAÏQUE HYBRIDE
## PARTIE IV : JUSTIFICATION DU CHOIX ÉNERGÉTIQUE ET ANALYSE DE LA JAUGE DE CHARGE

---

## ANALYSE DE LA DEMANDE ET DE LA CONSOMMATION ÉNERGÉTIQUE

### II.1. ANALYSE DE LA DEMANDE ÉLECTRIQUE

Pour garantir un dimensionnement technique optimal de la future centrale solaire autonome d'Idjwi, le consortium d'ingénieurs a réalisé une étude approfondie de la demande de charge prévisionnelle brute de l'île. L'évaluation s'appuie sur quatre grands segments de consommation bien caractérisés, totalisant une consommation journalière cumulée estimée à **3 270 kWh par jour**.

#### II.1.1. Profil de consommation par catégories d'abonnés
Les ménages résidentiels forment la base de la demande de réseau à Idjwi. Prévus pour s'établir à 5 000 foyers abonnés, leur profil de consommation unitaire est calibré pour un accès de base stable de 0,4 kWh par jour. Cette quantité d'énergie, mesurée avec rigueur, permet d'alimenter quatre lampes à haute efficience technologique de type LED (5W), un récepteur de radio local (15W) et de recharger les téléphones mobiles de la cellule familiale (10W). Ce segment de base représente une demande consolidée de **2 000 kWh par jour**.

Le segment des petits commerces et débits de boisson, réparti sur environ 750 boutiques, affiche une consommation unitaire estimée à 1,2 kWh par jour. Ce profil couvre l'utilisation d'un système d'éclairage de soirée, de ventilateurs, d'écrans de visionnage événementiel et de chargeurs de batteries d'appareils portables. Ce secteur commercial réclame globalement **900 kWh par jour**.

Les infrastructures d'intérêt public, composées de 15 centres de santé prioritaires et de 50 établissements d'enseignement de brousse, forment le troisième segment de consommation sociale. Les centres de santé consomment environ 8 kWh par jour pour faire fonctionner en continu leurs réfrigérateurs de vaccins, des centrifugeuses d'essais, l'éclairage nocturne opératoire et les stérilisateurs à chaleur sèche. Les écoles sollicitent une moyenne de 3 kWh quotidiens principalement mobilisés pour l'éclairage des classes de rattrapage et d'alphabétisation de soirée. Ce segment collectif représente une charge cumulée de **270 kWh par jour**.

Enfin, l'usage productif de l'électricité intègre 20 mini-ateliers et coopératives agricoles (menuiseries, décortiqueuses de café, congélateurs à poissons du Lac Kivu). Ils sollicitent individuellement une moyenne de 25 kWh par jour pour alimenter des moteurs de 5 à 10 kW, générant une demande à haute valeur ajoutée de **500 kWh par jour**.

---

#### II.1.2. Profil de charge journalière du micro-réseau

La sommation analytique des charges d'électricité programmées sur vingt-quatre heures met en évidence deux périodes d'activité critiques régulant la courbe de puissance du réseau. Pour le confort d'analyse des investisseurs et évaluateurs de projets, le profil de demande est segmenté par blocs d'activité horaire :

| Bloc Horaire de la Journée | Niveau de Puissance Requis | Consommateurs Actifs sur le Réseau | Stratégie d'Alimentation Énergétique |
|:---|:---:|:---|:---|
| **00h00 - 06h00** (Creux nocturne) | **35 kW** | Veille résidentielle, éclairage public communautaire, maintien thermique des centres de santé. | Fourniture assurée exclusivement par décharge lente du parc de batteries (BESS). |
| **06h00 - 09h00** (Transition matin) | **90 kW** | Relance résidentielle, réveil commercial, mise en service des systèmes administratifs. | Solaire montant en injection directe d'énergie complété par le parc d'accumulateurs. |
| **09h00 - 15h00** (Plateau diurne) | **150 kW** | **Usage productif majeur** : ateliers de menuiserie, décortiqueuses de café, congélation lacustre. | **Solaire direct intégral** (Pic d'ensoleillement correspondant optimalement sans usure de batterie). |
| **15h00 - 18h00** (Déclin solaire) | **110 kW** | Activités scolaires de fin de journée, commerces de détail, préparation du retour au foyer. | Solaire déclinant sécurisé en continu par l'apport dynamique du système de stockage. |
| **18h00 - 21h00** (Pointe de soirée) | **350 kW** | **Pic de charge maximal** : allumage de 5 000 foyers de brousse, boutiques, écoles du soir. | **Parc de batteries stationnaires (BESS)** régulé par armoire automatique de commande, pouvant être renforcé par le groupe de secours. |
| **21h00 - 00h00** (Transition nuit) | **120 kW** | Fermeture progressive des négoces, éclairage domestique résiduel, chambres froides médicales. | Décharge contrôlée et sécurisée du parc de batteries de stockage (BESS). |

#### II.1.2.1. Le pic de charge diurne et industriel (09h00 - 15h00)
Durant la phase centrale de la journée, s'étendant de neuf heures à quinze heures, la puissance active sollicitée sur le micro-réseau se stabilise autour d'un plateau de **150 kW**. Ce pic de charge diurne correspond précisément au cycle d'activité des moteurs industriels, des ateliers de soudure, des moulins agricoles et des décortiqueuses de café. Ce profil de charge coïncide idéalement avec la courbe d'ensoleillement maximal d'Idjwi, permettant d'alimenter directement ces équipements lourds en circuit d'injection directe, sans décharger le parc d'accumulateurs de la centrale.

#### II.1.2.2. Le pic de pointe de soirée (18h00 - 21h00)
À partir de dix-huit heures, heure à laquelle la nuit équatoriale s'établit instantanément, le micro-réseau subit son pic de charge maximal, culminant de manière franche à **350 kW**. Cette pointe s'explique par la mise sous tension simultanée des systèmes d'éclairage intérieur des 5 000 habitations raccordées, l'allumage des commerces, des bars et des lampadaires publics d'intérêt communautaire. À cette heure de soirée, l'irradiation solaire étant nulle, l'intégralité de la puissance réseau est fournie par le parc stationnaire de batteries de stockage (BESS) et en cas de besoin de renfort, par le groupe de secours de 110 kVA.

---

### II.2. ANALYSE DE L'OFFRE ET POLITIQUE DE TARIFICATION

#### II.2.1. Comparaison d'ingénierie face aux groupes diesel et alternatives

Afin de valider la pertinence absolue de la centrale solaire photovoltaïque autonome, le consortium d'experts a évalué et écarté trois technologies alternatives concurrentes.

| Critère d'Évaluation d'Ingénierie | Option 1 : Groupes Diesel Lourds | Option 2 : Micro-Hydraulique Locale | Option 3 : Câbles Sous-Lacustre SNEL | Option Finale : Solaire PV Hybride (Solaire/Batteries/Groupe de secours) |
|:---|:---|:---|:---|:---|
| **Investissement Initial (CAPEX)** | Faible (60 000 USD) | Très Élevé (800 000 USD) | Pharaonique (12 000 000 USD) | **Modéré (285 000 USD)** |
| **Coût d'Exploitation (OPEX)** | Très Élevé (Gazole importé) | Faible (Entretien turbines) | Incalculable (Entretien sous-lacustre) | **Faible (Entretien standard + carburant de secours ponctuel)** |
| **Sécurité d'Approvisionnement** | Faible (Aléas logistiques lacustres) | Faible (Pluviométrie saisonnière) | Faible (Risques tectoniques) | **Très Élevée (Gisement certifié + sécurité du groupe)** |
| **Bilan Carbone & Écologie** | Catastrophique (>3000 t CO2/an) | Neutre (Fils de l'eau) | Neutre (Importation hydro national) | **Excellent (Zéro émission directe)** |
| **Durabilité des Équipements** | Faible (Moteurs s'altérant en 5 ans) | Élevée (Génie civil durable) | Faible (Agression sédimentaire) | **Très Élevée (Modules garantis 25 ans)** |
| **Décision finale** | **REJETÉE** (Économiquement intenable) | **REJETÉE** (Absence de relief hydraulique) | **REJETÉE** (Coûts et instabilités sismiques) | **CONSERVÉE ET SÉLECTIONNÉE** |

---

#### II.2.2. Motifs du rejet des stratégies alternatives

Le rejet des trois options concourantes est motivé par des contraintes géophysiques et logistiques incontournables.

Premièrement, la stratégie de génération d'électricité au moyen de **centrales thermiques diesel** est rejetée pour des raisons budgétaires et d'approvisionnement. Le gazole devrait être importé par fûts entiers transportés par barques depuis Goma ou Bukavu, un processus particulièrement dangeureux et coûteux, plaçant le coût marginal du kilowattheure produit à plus de 0,65 USD, un tarif prohibitif pour l'économie d'Idjwi.

Deuxièmement, la **micro-hydroélectricité** est inexploitable à Idjwi. La topologie de l'île, bien que vallonnée, ne présente pas de bassin versant alpin ou de rivières à débit persistant dotées de chutes de dénivelé suffisantes pour assurer l'alimentation constante de turbines, particulièrement durant la saison sèche s'étendant de juin à août.

Troisièmement, la pose de **câbles sous-lacustres à haute tension** est de fait exclue par le relief sous-marin du Lac Kivu. Le lac est logé dans un fossé d'effondrement tectonique actif sujet à d'importants séismes réguliers et d'abondantes remontées gazeuses de dioxyde de carbone et de méthane (zones d'instabilités sédimentaires). Poser des lignes de transport blindées sur les fonds marécageux profonds de 480 mètres réclamerait l'intervention de navires câbliers spéciaux hautement onéreux hors de proportion avec l'assiette économique d'Idjwi. Par élimination rigoureuse, la centrale solaire photovoltaïque autonome s'établit comme la seule alternative d'ingénierie résiliente, économiquement soutenable et respectueuse de l'intégrité biologique de l'île.
