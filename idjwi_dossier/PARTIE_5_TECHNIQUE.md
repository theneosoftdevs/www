# PROJET D'ÉLECTRIFICATION DE L'ÎLE D'IDJWI PAR CENTRALE PHOTOVOLTAÏQUE HYBRIDE
## PARTIE V : ÉTUDE DU GISEMENT SOLAIRE ET SPÉCIFICATIONS TECHNIQUES

---

## CONCEPTION TECHNIQUE ET INGÉNIERIE DE L'INFRASTRUCTURE

### II.3. DESCRIPTIF TECHNIQUE ET INGÉNIERIE DE LA CENTRALE

#### II.3.1. Évaluation du potentiel solaire d'Idjwi

Le dimensionnement du champ solaire repose sur l'évaluation de l'ensoleillement de l'île. Selon les données de **PVGIS** et de la Banque Mondiale (*Global Solar Atlas*), l'Île d'Idjwi reçoit une irradiation moyenne de **4,8 kWh par mètre carré par jour (4,8 kWh/m²/jour)**.

L'insolation est régulière toute l'année, avec un pic solaire en février et mars (5,1 kWh/m²/jour) et un léger fléchissement pendant la saison des pluies en octobre et novembre (4,4 kWh/m²/jour). Cette régularité permet de garantir une production stable.

---

#### II.3.2. Répartition des équipements et budget matériel (CAPEX)

Le budget pour l'équipement technique est réparti de la manière suivante :

| Sous-système Principal | Spécification Technique | Quantité | Coût (USD) | Rôle dans le Projet |
|:---|:---|:---:|:---:|:---|
| **Champ Solaire Photovoltaïque** | Modules solaires monocristallins de 550 Wc (rendement >21 %), structures de support inclinées en acier galvanisé, câblage de protection. | 1 818 cellules | **85 000 USD** | Durée de vie de 25 ans. Installation sur dalles de béton. |
| **Batteries de Stockage (BESS)** | Batteries de stockage de 500 kWh utiles, armoire de contrôle, installées dans un local ventilé. | 1 Lot | **55 000 USD** | Durée de vie de 10 ans. Permet d'alimenter le réseau en soirée et la nuit. |
| **Régulation et Groupe de Secours** | Onduleurs de synchronisation triphasés, automate de gestion EMS, groupe électrogène de secours de 110 kVA, connexion Internet Starlink. | 1 Lot | **32 000 USD** | Assure la gestion automatique de l'hybridation et la surveillance à distance depuis Goma. |
| **Réseau de Distribution (12 km)** | Ligne électrique basse tension (400V triphasé / 230V monophasé), câbles en aluminium torsadés isolés, parafoudres. | 12 km | **46 580 USD** | Installée sur 350 poteaux en bois traité contre l'humidité et les termites. |
| **Génie Civil & Aménagement** | Terrassement du sol volcanique d'Idjwi, dalles en béton pour les équipements, clôtures de sécurité. | Sur site | **47 520 USD** | Sécurisation du terrain de la centrale contre l'érosion et les accès non autorisés. |
| **Transport & Logistique** | Emballage de sécurité à Goma, transport par camions, puis traversée sur le lac Kivu via 3 barges métalliques. | Global | **18 900 USD** | Livraison sécurisée de tout le matériel sensible sur l'île. |

#### II.3.2.1. Modules photovoltaïques (Champ PV)
Le champ solaire se compose de panneaux monocristallins classiques de haute qualité. Chaque panneau est adapté aux conditions locales pour capter efficacement la lumière solaire tout au long de l'année.

Les panneaux sont montés sur des structures de support métalliques robustes et ajustées. Ils sont surélevés pour éviter l'ombrage par la végétation et pour protéger les équipements contre l'humidité ou les éclaboussures de pluie.

#### II.3.2.2. Conversion, Automatisme et Groupe de Secours
Le courant continu (DC) produit par les panneaux est transformé en courant alternatif triphasé standard par des onduleurs centraux de synchronisation réseau.

Le système intègre un régulateur automatique qui gère l'énergie de la façon suivante :
- En journée, la centrale utilise l'énergie solaire en direct.
- En soirée ou par temps nuageux, elle utilise la batterie de stockage.
- En cas de besoin de renfort (batteries trop faibles après plusieurs jours de pluie), un **groupe de secours** démarre automatiquement pour appuyer le réseau.
Une connexion Internet permet de suivre à distance la production.

---

#### II.3.3. Système de stockage par batteries (BESS)

Le stockage d'énergie d'une capacité de **500 kWh** permet de restituer l'électricité durant la soirée et la nuit.

Pour cela, le projet utilise des batteries de stockage standard adaptées pour le milieu de l'électrification rurale. Ces batteries assurent la stabilité et l'alimentation continue nocturne. Un système de gestion automatique contrôle en continu l'état et la température des batteries pour garantir leur sécurité.

---

#### II.3.4. Mini-réseau de distribution d'électricité (12 kilomètres)

La dispersion des pôles de peuplement villageois d'Idjwi nécessite l'installation d'une ligne d'interconnexion aérienne triphasée (niveau de tension alternatif 400 V entre phases / 230 V entre phase et neutre) s'étendant sur **12 kilomètres**.

##### II.3.4.1. Composantes physiques du réseau aérien (Distribution)
Le réseau physique de transport et de raccordement s'organise autour d'éléments d'ingénierie éprouvés :
* **Un réseau de raccordement de 350 pylônes en bois traités par imprégnation chimique** : Cette imprégnation en autoclave prévient toute altération fongique issue de l'importante humidité atmosphérique émanant du Lac Kivu, tout en protégeant les poteaux d'éventuelles attaques destructrices de colonies de termites locales.
* **Des câbles torsadés isolés en alliage d'aluminium** : Conçus pour minimiser les pertes électriques par échauffement effectif en ligne (effet Joule) et éliminer les courts-circuits accidentels provoqués par des chutes de feuillages ou de branchages d'arbres.
* **Un système de parafoudres à haute intensité de décharge** : Disposés périodiquement le long du parcours de crête de la ligne physique pour détourner de manière sûre vers des prises de terre individuelles les ondes de foudres générées par les violents orages lacustres fréquents de l'Est du Congo, préservant ainsi l'intégrité de l'électronique de puissance de la centrale.

---

#### II.3.5. Récapitulation des caractéristiques de conception technique

Le tableau ci-dessous synthétise les données d'ingénierie appliquées pour la réalisation et le montage du réseau de production, de stockage et d'acheminement d'Idjwi.

| Composante de l'Ouvrage | Paramètre d'Ingénierie Spécifié | Valeur ou Norme de Conception | Remarque d'Exploitation Commune |
|:---|:---|:---:|:---|
| **Gisement Solaire** | Irradiation Horizontale Globale (GHI) | **4,8 kWh/m²/jour** | Certifié par PVGIS Commission Européenne |
| **Modules Solaires** | Technologie de la Cellule Photovoltaïque | **Silicium Monocristallin standard** | Haute durabilité et garantie d'usine |
| **Modules Solaires** | Configuration de l'Angle d'Incidence | **Optimisé** | Alignement par rapport à l'équateur |
| **Conversion (AC/DC)** | Efficacité conversion de l'Onduleur Central | **Élevée** | Performance stable du réseau |
| **Accumulation (BESS)**| Technologie de Stockage | **Batteries de stockage standard** | Modulable et sécurisée |
| **Accumulation (BESS)**| Durabilité estimée | **10 ans** | Amortissement à long terme |
| **Groupe de Secours**  | Puissance Thermique d'Appui | **Standard** | Démarrage automatique d'urgence |
| **Réseau Distribution**| Tension d'Injection Alternative | **Triphasé / Monophasé** | Fréquence de distribution stable à 50 Hz |
| **Réseau Distribution**| Linéaire Total de la Ligne Aérienne | **12 km** | Conducteurs en aluminium isolés |
| **Réseau Distribution**| Supports de la Ligne Physique | **350 pylônes locaux traités** | Traitement contre l'humidité |

---

#### II.3.6. Défis et contraintes logistiques liés à l'insularité

Le transport sécurisé de technologies modernes d'une valeur marchande importante d'équipements électriques (panneaux solaires, accumulateurs, onduleurs) représente un défi logistique d'envergure. Des routes locales impraticables relient la métropole de Goma jusqu'au port d'arrimage d'Idjwi. 

Le convoyage s'effectue exclusivement en découpant la chaîne logistique : d'abord, un transport routier sécurisé de Goma jusqu'au port fluvial ; ensuite, un transbordement sur trois barges lacustres pour franchir le lac Kivu et assurer une livraison saine et sans fissure de l'ensemble du matériel au ponton de transbordement de l'Île d'Idjwi.
