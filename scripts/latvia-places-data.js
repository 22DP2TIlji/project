/**
 * Места в Латвии для загрузки в БД (destinations): смотровые вышки, парки, природа.
 * Используется скриптом seed-latvia-places.js
 */

module.exports = [
  // ——— Смотровые вышки (Viewing towers) ———
  { name: "Gaiziņkalns viewing tower", latitude: 56.8719, longitude: 25.9519, country: "Latvia", city: "Madona", description: "Latvia's highest point (312 m). Observation tower with panoramic views over Vidzeme.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Pilssalas skatu tornis (Jelgava)", latitude: 56.6522, longitude: 23.7281, country: "Latvia", city: "Jelgava", description: "Wooden observation tower on Palace Island. Views of Lielupe River, wild horses, and city.", category: "viewing_tower", region: "Zemgale" },
  { name: "Zilais Kalns viewing tower", latitude: 57.1833, longitude: 25.0833, country: "Latvia", city: "Sigulda", description: "Observation tower in Gauja National Park with views of the Gauja valley.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Ķemeri Tower", latitude: 56.9478, longitude: 23.4917, country: "Latvia", city: "Ķemeri", description: "Viewing tower in Ķemeri National Park. Great for birdwatching and bog views.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Turaida Castle tower", latitude: 57.1822, longitude: 24.8506, country: "Latvia", city: "Sigulda", description: "Medieval castle tower with viewing platform over Gauja River valley.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Ragana viewing tower", latitude: 57.1831, longitude: 24.7019, country: "Latvia", city: "Ragana", description: "Observation tower in the forests of Vidzeme with scenic views.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Līgatne Nature Trails tower", latitude: 57.2194, longitude: 25.0508, country: "Latvia", city: "Līgatne", description: "Viewing tower on the Līgatne nature trails. Wildlife and forest views.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Daugavpils viewing tower", latitude: 55.8722, longitude: 26.5167, country: "Latvia", city: "Daugavpils", description: "Observation point over Daugava River and the city.", category: "viewing_tower", region: "Latgale" },
  { name: "Ventspils Green Tower", latitude: 57.3894, longitude: 21.5606, country: "Latvia", city: "Ventspils", description: "Historic tower and viewing point in Ventspils Old Town.", category: "viewing_tower", region: "Kurzeme" },
  { name: "Liepāja viewing platform", latitude: 56.5047, longitude: 21.0107, country: "Latvia", city: "Liepāja", description: "Seaside viewing point with views of the Baltic coast.", category: "viewing_tower", region: "Kurzeme" },
  // ——— Парки (Parks) ———
  { name: "Gauja National Park (Sigulda)", latitude: 57.1537, longitude: 24.8598, country: "Latvia", city: "Sigulda", description: "Latvia's largest national park. Caves, castles, hiking and cycling trails.", category: "park", region: "Vidzeme" },
  { name: "Ķemeri National Park", latitude: 56.9478, longitude: 23.4917, country: "Latvia", city: "Ķemeri", description: "Famous for bogs, mineral springs, and the Great Ķemeri Bog boardwalk.", category: "park", region: "Vidzeme" },
  { name: "Slītere National Park", latitude: 57.6333, longitude: 22.2833, country: "Latvia", city: "Talsi", description: "Coastal forests, Cape Kolka, and the Blue Hills. Unique biodiversity.", category: "park", region: "Kurzeme" },
  { name: "Rāzna National Park", latitude: 56.3167, longitude: 27.5167, country: "Latvia", city: "Rēzekne", description: "Lake Rāzna and surrounding hills. Hiking and nature trails.", category: "park", region: "Latgale" },
  { name: "Pape Nature Park", latitude: 56.1667, longitude: 21.0500, country: "Latvia", city: "Pape", description: "Lake Pape, bison reserve, and birdwatching. Coastal wetlands.", category: "park", region: "Kurzeme" },
  { name: "Daugavas loki (Daugava bends)", latitude: 55.8833, longitude: 26.2167, country: "Latvia", city: "Daugavpils", description: "Scenic Daugava River bends. Viewpoints and hiking.", category: "park", region: "Latgale" },
  { name: "Mežaparks (Riga)", latitude: 56.9850, longitude: 24.1183, country: "Latvia", city: "Riga", description: "Large forest park in Riga. Zoo, lakes, and walking paths.", category: "park", region: "Vidzeme" },
  { name: "Vērmanes Garden (Riga)", latitude: 56.9522, longitude: 24.1153, country: "Latvia", city: "Riga", description: "Central park in Riga. Fountains, flower beds, and cafes.", category: "park", region: "Vidzeme" },
  { name: "Kronvalda Park (Riga)", latitude: 56.9550, longitude: 24.1086, country: "Latvia", city: "Riga", description: "Park along the canal in central Riga. Boating and walks.", category: "park", region: "Vidzeme" },
  { name: "Jūrmala beach park", latitude: 56.9715, longitude: 23.7408, country: "Latvia", city: "Jūrmala", description: "Long sandy beach and pine forest. Spa town atmosphere.", category: "park", region: "Vidzeme" },
  // ——— Природа и достопримечательности (Nature & attractions) ———
  { name: "Gutmanis Cave", latitude: 57.1750, longitude: 24.8281, country: "Latvia", city: "Sigulda", description: "Largest cave in the Baltics. Sandstone inscriptions and legends.", category: "nature", region: "Vidzeme" },
  { name: "Ventas Rumba (Kuldīga)", latitude: 56.9681, longitude: 21.9722, country: "Latvia", city: "Kuldīga", description: "Europe's widest waterfall (249 m). Fish ladder and old town views.", category: "nature", region: "Kurzeme" },
  { name: "Cape Kolka", latitude: 57.7500, longitude: 22.5833, country: "Latvia", city: "Kolka", description: "Where the Baltic Sea meets the Gulf of Riga. Lighthouse and beaches.", category: "nature", region: "Kurzeme" },
  { name: "Āraiši Lake Castle", latitude: 57.1833, longitude: 25.2667, country: "Latvia", city: "Cēsis", description: "Reconstructed lake dwelling and medieval castle site.", category: "nature", region: "Vidzeme" },
  { name: "Līgatne Sand Caves", latitude: 57.2200, longitude: 25.0550, country: "Latvia", city: "Līgatne", description: "Sandstone caves and nature trails in Gauja valley.", category: "nature", region: "Vidzeme" },
  { name: "Rundāle Palace Gardens", latitude: 56.4172, longitude: 24.0250, country: "Latvia", city: "Rundāle", description: "Baroque palace and French-style rose gardens.", category: "nature", region: "Zemgale" },
  { name: "Lielais un Mazais Staburags", latitude: 56.6167, longitude: 25.6167, country: "Latvia", city: "Jēkabpils", description: "Sandstone cliffs on the Daugava River. Scenic viewpoints.", category: "nature", region: "Vidzeme" },
  { name: "Teiči Nature Reserve", latitude: 56.6167, longitude: 27.0833, country: "Latvia", city: "Madona", description: "One of the largest raised bogs in the Baltics. Boardwalks.", category: "nature", region: "Latgale" },
  { name: "Jelgava Palace", latitude: 56.6522, longitude: 23.7281, country: "Latvia", city: "Jelgava", description: "Baroque palace and park. University and observation tower nearby.", category: "nature", region: "Zemgale" },
  { name: "Cīrulīši Nature Park", latitude: 57.0333, longitude: 24.2833, country: "Latvia", city: "Saulkrasti", description: "Coastal dunes, pine forest, and beach. North of Riga.", category: "nature", region: "Vidzeme" },
  // ——— Замки и крепости (Castles) ———
  { name: "Cēsis Castle", latitude: 57.3119, longitude: 25.2749, country: "Latvia", city: "Cēsis", description: "Medieval castle ruins and New Castle museum. Lantern tours.", category: "castle", region: "Vidzeme" },
  { name: "Bauska Castle", latitude: 56.4069, longitude: 24.1786, country: "Latvia", city: "Bauska", description: "Renaissance and medieval castle at the confluence of two rivers.", category: "castle", region: "Zemgale" },
  { name: "Koknese Castle ruins", latitude: 56.6500, longitude: 25.4333, country: "Latvia", city: "Koknese", description: "Ruins at the confluence of Pērse and Daugava. Park and viewpoints.", category: "castle", region: "Vidzeme" },
  { name: "Turaida Museum Reserve", latitude: 57.1822, longitude: 24.8506, country: "Latvia", city: "Sigulda", description: "Castle, sculpture park, and folk song garden in Gauja valley.", category: "castle", region: "Vidzeme" },
  { name: "Ludza Castle mound", latitude: 56.5500, longitude: 27.7167, country: "Latvia", city: "Ludza", description: "Castle ruins and lake views in Latgale.", category: "castle", region: "Latgale" },
  // ——— Пляжи и побережье (Beaches) ———
  { name: "Jūrmala Beach (Majori)", latitude: 56.9686, longitude: 23.7742, country: "Latvia", city: "Jūrmala", description: "Wide sandy beach. Resorts, cafes, and summer events.", category: "beach", region: "Vidzeme" },
  { name: "Ventspils Beach", latitude: 57.3933, longitude: 21.5531, country: "Latvia", city: "Ventspils", description: "Blue Flag beach. Playgrounds and summer concerts.", category: "beach", region: "Kurzeme" },
  { name: "Liepāja Beach", latitude: 56.5083, longitude: 21.0167, country: "Latvia", city: "Liepāja", description: "Long sandy beach. Wind and music city.", category: "beach", region: "Kurzeme" },
  { name: "Saulkrasti Beach", latitude: 57.2667, longitude: 24.4167, country: "Latvia", city: "Saulkrasti", description: "Quiet beach north of Riga. White sand and dunes.", category: "beach", region: "Vidzeme" },
  { name: "Cape Kolka Beach", latitude: 57.7500, longitude: 22.5833, country: "Latvia", city: "Kolka", description: "Wild beaches where two seas meet.", category: "beach", region: "Kurzeme" },
  // ——— Озёра и реки (Lakes & rivers) ———
  { name: "Lake Rāzna", latitude: 56.3167, longitude: 27.5167, country: "Latvia", city: "Rēzekne", description: "Second largest lake in Latvia. Boating and fishing.", category: "nature", region: "Latgale" },
  { name: "Lake Lubāns", latitude: 56.7833, longitude: 26.8833, country: "Latvia", city: "Madona", description: "Largest lake in Latvia. Birdwatching and nature.", category: "nature", region: "Vidzeme" },
  { name: "Gauja River (Sigulda stretch)", latitude: 57.1667, longitude: 24.8500, country: "Latvia", city: "Sigulda", description: "River valley with cliffs, caves, and boat rentals.", category: "nature", region: "Vidzeme" },
  { name: "Abava Valley", latitude: 57.0833, longitude: 22.5833, country: "Latvia", city: "Kandava", description: "Scenic river valley. Watermills and hiking.", category: "nature", region: "Kurzeme" },
  { name: "Riebalas cliff", latitude: 56.8333, longitude: 25.3833, country: "Latvia", city: "Lielvārde", description: "Sandstone cliff on the Daugava. Viewpoint and trails.", category: "nature", region: "Vidzeme" },
  // ——— Города и музеи (Towns & museums) ———
  { name: "Riga Old Town", latitude: 56.9496, longitude: 24.1052, country: "Latvia", city: "Riga", description: "UNESCO World Heritage. Churches, squares, and Hanseatic architecture.", category: "city", region: "Vidzeme" },
  { name: "Kuldīga Old Town", latitude: 56.9677, longitude: 21.9617, country: "Latvia", city: "Kuldīga", description: "Historic centre with red-tiled roofs and Ventas Rumba.", category: "city", region: "Kurzeme" },
  { name: "Cēsis Old Town", latitude: 57.3119, longitude: 25.2749, country: "Latvia", city: "Cēsis", description: "Medieval streets, Rose Square, and castle park.", category: "city", region: "Vidzeme" },
  { name: "Liepāja Karosta", latitude: 56.5333, longitude: 21.0167, country: "Latvia", city: "Liepāja", description: "Former military district. Naval cathedral and prison museum.", category: "city", region: "Kurzeme" },
  { name: "Agļona Basilica", latitude: 56.1333, longitude: 27.0167, country: "Latvia", city: "Agļona", description: "Important Catholic pilgrimage site. Lake and park.", category: "city", region: "Latgale" },
  // ——— Ещё смотровые и природа ———
  { name: "Sēlija viewing mound", latitude: 56.2500, longitude: 25.8500, country: "Latvia", city: "Jēkabpils", description: "Historic mound with views over Sēlija region.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Lubāna wetland tower", latitude: 56.7833, longitude: 26.8833, country: "Latvia", city: "Lubāna", description: "Birdwatching tower at Lake Lubāns wetland.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Riežupe Sand Caves", latitude: 57.3667, longitude: 27.0333, country: "Latvia", city: "Cēsis", description: "Man-made sandstone caves. Guided tours and legends.", category: "nature", region: "Vidzeme" },
  { name: "Kuldīga brick bridge", latitude: 56.9686, longitude: 21.9653, country: "Latvia", city: "Kuldīga", description: "Old bridge over Venta River. Views of the waterfall.", category: "nature", region: "Kurzeme" },
  { name: "Ķemeri Great Bog boardwalk", latitude: 56.9478, longitude: 23.4917, country: "Latvia", city: "Ķemeri", description: "Wooden boardwalk through the bog. Unique flora and views.", category: "nature", region: "Vidzeme" },
];
