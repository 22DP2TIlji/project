/**
 * Места в Латвии для загрузки в БД (destinations): смотровые вышки, парки, природа.
 * Используется скриптом seed-latvia-places.js
 */

module.exports = [
    // ——— Смотровые вышки (Viewing towers) ———
  { name: "Gaiziņkalna skatu tornis", latitude: 56.8719, longitude: 25.9519, country: "Latvia", city: "Madona", description: "Latvijas augstākais punkts (312 m). Skatu tornis ar panorāmas skatu uz Vidzemi.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Pilssalas skatu tornis (Jelgava)", latitude: 56.6522, longitude: 23.7281, country: "Latvia", city: "Jelgava", description: "Koka skatu tornis Pilssalā. Skati uz Lielupi, savvaļas zirgiem un pilsētu.", category: "viewing_tower", region: "Zemgale" },
  { name: "Zilā kalna skatu tornis", latitude: 57.1833, longitude: 25.0833, country: "Latvia", city: "Sigulda", description: "Skatu tornis Gaujas nacionālajā parkā ar skatiem uz Gaujas senleju.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Ķemeru skatu tornis", latitude: 56.9478, longitude: 23.4917, country: "Latvia", city: "Ķemeri", description: "Skatu tornis Ķemeru nacionālajā parkā. Lieliski putnu vērošanai un purva ainavām.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Turaidas pils tornis", latitude: 57.1822, longitude: 24.8506, country: "Latvia", city: "Sigulda", description: "Viduslaiku pils tornis ar skatu platformu uz Gaujas senleju.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Raganas skatu tornis", latitude: 57.1831, longitude: 24.7019, country: "Latvia", city: "Ragana", description: "Skatu tornis Vidzemes mežos ar gleznainiem skatiem.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Līgatnes dabas taku skatu tornis", latitude: 57.2194, longitude: 25.0508, country: "Latvia", city: "Līgatne", description: "Skatu tornis Līgatnes dabas takās. Skati uz mežu un savvaļas dzīvniekiem.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Daugavpils skatu tornis", latitude: 55.8722, longitude: 26.5167, country: "Latvia", city: "Daugavpils", description: "Skatu punkts pār Daugavu un pilsētu.", category: "viewing_tower", region: "Latgale" },
  { name: "Ventspils Zaļais tornis", latitude: 57.3894, longitude: 21.5606, country: "Latvia", city: "Ventspils", description: "Vēsturisks tornis un skatu punkts Ventspils vecpilsētā.", category: "viewing_tower", region: "Kurzeme" },
  { name: "Liepājas skatu platforma", latitude: 56.5047, longitude: 21.0107, country: "Latvia", city: "Liepāja", description: "Piekrastes skatu punkts ar skatiem uz Baltijas jūru.", category: "viewing_tower", region: "Kurzeme" },

  // ——— Парки (Parks) ———
  { name: "Gaujas nacionālais parks (Sigulda)", latitude: 57.1537, longitude: 24.8598, country: "Latvia", city: "Sigulda", description: "Latvijas lielākais nacionālais parks. Alas, pilis, pārgājienu un velo takas.", category: "park", region: "Vidzeme" },
  { name: "Ķemeru nacionālais parks", latitude: 56.9478, longitude: 23.4917, country: "Latvia", city: "Ķemeri", description: "Slavens ar purviem, minerālūdeņiem un Lielā Ķemeru tīreļa laipu.", category: "park", region: "Vidzeme" },
  { name: "Slīteres nacionālais parks", latitude: 57.6333, longitude: 22.2833, country: "Latvia", city: "Talsi", description: "Piekrastes meži, Kolkasrags un Zilie kalni. Unikāla bioloģiskā daudzveidība.", category: "park", region: "Kurzeme" },
  { name: "Rāznas nacionālais parks", latitude: 56.3167, longitude: 27.5167, country: "Latvia", city: "Rēzekne", description: "Rāznas ezers un apkārtējie pauguri. Pārgājienu un dabas takas.", category: "park", region: "Latgale" },
  { name: "Papes dabas parks", latitude: 56.1667, longitude: 21.0500, country: "Latvia", city: "Pape", description: "Papes ezers, sumbri un putnu vērošana. Piekrastes mitrāji.", category: "park", region: "Kurzeme" },
  { name: "Daugavas loki", latitude: 55.8833, longitude: 26.2167, country: "Latvia", city: "Daugavpils", description: "Gleznaini Daugavas līkumi. Skatu punkti un pārgājieni.", category: "park", region: "Latgale" },
  { name: "Mežaparks (Rīga)", latitude: 56.9850, longitude: 24.1183, country: "Latvia", city: "Riga", description: "Liels meža parks Rīgā. Zooloģiskais dārzs, ezeri un pastaigu takas.", category: "park", region: "Vidzeme" },
  { name: "Vērmanes dārzs (Rīga)", latitude: 56.9522, longitude: 24.1153, country: "Latvia", city: "Riga", description: "Centrālais parks Rīgā. Strūklakas, puķu dobes un kafejnīcas.", category: "park", region: "Vidzeme" },
  { name: "Kronvalda parks (Rīga)", latitude: 56.9550, longitude: 24.1086, country: "Latvia", city: "Riga", description: "Parks gar pilsētas kanālu Rīgas centrā. Laivu braucieni un pastaigas.", category: "park", region: "Vidzeme" },
  { name: "Jūrmalas pludmales parks", latitude: 56.9715, longitude: 23.7408, country: "Latvia", city: "Jūrmala", description: "Gara smilšu pludmale un priežu mežs. Kūrortpilsētas noskaņa.", category: "park", region: "Vidzeme" },

  // ——— Природа и достопримечательности (Nature & attractions) ———
  { name: "Gūtmaņa ala", latitude: 57.1750, longitude: 24.8281, country: "Latvia", city: "Sigulda", description: "Lielākā ala Baltijā. Smilšakmens uzraksti un leģendas.", category: "nature", region: "Vidzeme" },
  { name: "Ventas rumba (Kuldīga)", latitude: 56.9681, longitude: 21.9722, country: "Latvia", city: "Kuldīga", description: "Platākais ūdenskritums Eiropā (249 m). Zivju ceļš un vecpilsētas skati.", category: "nature", region: "Kurzeme" },
  { name: "Kolkasrags", latitude: 57.7500, longitude: 22.5833, country: "Latvia", city: "Kolka", description: "Vieta, kur satiekas Baltijas jūra un Rīgas jūras līcis. Bāka un pludmales.", category: "nature", region: "Kurzeme" },
  { name: "Āraišu ezerpils", latitude: 57.1833, longitude: 25.2667, country: "Latvia", city: "Cēsis", description: "Atjaunota ezerpils apmetne un viduslaiku pils vieta.", category: "nature", region: "Vidzeme" },
  { name: "Līgatnes smilšakmens alas", latitude: 57.2200, longitude: 25.0550, country: "Latvia", city: "Līgatne", description: "Smilšakmens alas un dabas takas Gaujas senlejā.", category: "nature", region: "Vidzeme" },
  { name: "Rundāles pils dārzi", latitude: 56.4172, longitude: 24.0250, country: "Latvia", city: "Rundāle", description: "Baroka pils un franču stila rožu dārzi.", category: "nature", region: "Zemgale" },
  { name: "Lielais un Mazais Staburags", latitude: 56.6167, longitude: 25.6167, country: "Latvia", city: "Jēkabpils", description: "Smilšakmens atsegumi Daugavas krastā. Gleznaini skatu punkti.", category: "nature", region: "Vidzeme" },
  { name: "Teiču dabas rezervāts", latitude: 56.6167, longitude: 27.0833, country: "Latvia", city: "Madona", description: "Viens no lielākajiem augstajiem purviem Baltijā. Laipas un dabas takas.", category: "nature", region: "Latgale" },
  { name: "Jelgavas pils", latitude: 56.6522, longitude: 23.7281, country: "Latvia", city: "Jelgava", description: "Baroka pils un parks. Netālu atrodas universitāte un skatu tornis.", category: "nature", region: "Zemgale" },
  { name: "Cīrulīšu dabas parks", latitude: 57.0333, longitude: 24.2833, country: "Latvia", city: "Saulkrasti", description: "Piekrastes kāpas, priežu mežs un pludmale. Uz ziemeļiem no Rīgas.", category: "nature", region: "Vidzeme" },

  // ——— Замки и крепости (Castles) ———
  { name: "Cēsu pils", latitude: 57.3119, longitude: 25.2749, country: "Latvia", city: "Cēsis", description: "Viduslaiku pilsdrupas un Jaunās pils muzejs. Ekskursijas ar laternām.", category: "castle", region: "Vidzeme" },
  { name: "Bauskas pils", latitude: 56.4069, longitude: 24.1786, country: "Latvia", city: "Bauska", description: "Renesanses un viduslaiku pils divu upju satecē.", category: "castle", region: "Zemgale" },
  { name: "Kokneses pilsdrupas", latitude: 56.6500, longitude: 25.4333, country: "Latvia", city: "Koknese", description: "Drupas Pērse un Daugavas satecē. Parks un skatu punkti.", category: "castle", region: "Vidzeme" },
  { name: "Turaidas muzejrezervāts", latitude: 57.1822, longitude: 24.8506, country: "Latvia", city: "Sigulda", description: "Pils, skulptūru parks un Dainu kalns Gaujas senlejā.", category: "castle", region: "Vidzeme" },
  { name: "Ludzas pils kalns", latitude: 56.5500, longitude: 27.7167, country: "Latvia", city: "Ludza", description: "Pilsdrupas un skati uz ezeriem Latgalē.", category: "castle", region: "Latgale" },

  // ——— Пляжи и побережье (Beaches) ———
  { name: "Jūrmalas pludmale (Majori)", latitude: 56.9686, longitude: 23.7742, country: "Latvia", city: "Jūrmala", description: "Plaša smilšu pludmale. Kūrorti, kafejnīcas un vasaras pasākumi.", category: "beach", region: "Vidzeme" },
  { name: "Ventspils pludmale", latitude: 57.3933, longitude: 21.5531, country: "Latvia", city: "Ventspils", description: "Zilā karoga pludmale. Rotaļlaukumi un vasaras koncerti.", category: "beach", region: "Kurzeme" },
  { name: "Liepājas pludmale", latitude: 56.5083, longitude: 21.0167, country: "Latvia", city: "Liepāja", description: "Gara smilšu pludmale. Vējš un mūzikas pilsētas noskaņa.", category: "beach", region: "Kurzeme" },
  { name: "Saulkrastu pludmale", latitude: 57.2667, longitude: 24.4167, country: "Latvia", city: "Saulkrasti", description: "Klusāka pludmale uz ziemeļiem no Rīgas. Balta smilts un kāpas.", category: "beach", region: "Vidzeme" },
  { name: "Kolkasraga pludmale", latitude: 57.7500, longitude: 22.5833, country: "Latvia", city: "Kolka", description: "Mežonīgas pludmales vietā, kur satiekas divas jūras.", category: "beach", region: "Kurzeme" },

  // ——— Озёра и реки (Lakes & rivers) ———
  { name: "Rāznas ezers", latitude: 56.3167, longitude: 27.5167, country: "Latvia", city: "Rēzekne", description: "Otrs lielākais ezers Latvijā. Laivošana un makšķerēšana.", category: "nature", region: "Latgale" },
  { name: "Lubāna ezers", latitude: 56.7833, longitude: 26.8833, country: "Latvia", city: "Madona", description: "Lielākais ezers Latvijā. Putnu vērošana un daba.", category: "nature", region: "Vidzeme" },
  { name: "Gaujas upe (Siguldas posms)", latitude: 57.1667, longitude: 24.8500, country: "Latvia", city: "Sigulda", description: "Upes ieleja ar atsegumiem, alām un laivu nomu.", category: "nature", region: "Vidzeme" },
  { name: "Abavas senleja", latitude: 57.0833, longitude: 22.5833, country: "Latvia", city: "Kandava", description: "Gleznaina upes senleja. Ūdensdzirnavas un pārgājieni.", category: "nature", region: "Kurzeme" },
  { name: "Riebaļu iezis", latitude: 56.8333, longitude: 25.3833, country: "Latvia", city: "Lielvārde", description: "Smilšakmens atsegums Daugavas krastā. Skatu punkts un takas.", category: "nature", region: "Vidzeme" },

  // ——— Города и музеи (Towns & museums) ———
  { name: "Vecrīga", latitude: 56.9496, longitude: 24.1052, country: "Latvia", city: "Riga", description: "UNESCO Pasaules mantojums. Baznīcas, laukumi un Hanzas arhitektūra.", category: "city", region: "Vidzeme" },
  { name: "Kuldīgas vecpilsēta", latitude: 56.9677, longitude: 21.9617, country: "Latvia", city: "Kuldīga", description: "Vēsturiskais centrs ar sarkaniem dakstiņu jumtiem un Ventas rumbu.", category: "city", region: "Kurzeme" },
  { name: "Cēsu vecpilsēta", latitude: 57.3119, longitude: 25.2749, country: "Latvia", city: "Cēsis", description: "Viduslaiku ieliņas, Rožu laukums un pils parks.", category: "city", region: "Vidzeme" },
  { name: "Liepājas Karosta", latitude: 56.5333, longitude: 21.0167, country: "Latvia", city: "Liepāja", description: "Bijusī militārā teritorija. Jūras katedrāle un cietuma muzejs.", category: "city", region: "Kurzeme" },
  { name: "Aglonas bazilika", latitude: 56.1333, longitude: 27.0167, country: "Latvia", city: "Agļona", description: "Svarīga katoļu svētceļojumu vieta. Ezers un parks.", category: "city", region: "Latgale" },

  // ——— Ещё смотровые и природа ———
  { name: "Sēlijas skatu pilskalns", latitude: 56.2500, longitude: 25.8500, country: "Latvia", city: "Jēkabpils", description: "Vēsturisks pilskalns ar skatiem pār Sēlijas novadu.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Lubāna mitrāja skatu tornis", latitude: 56.7833, longitude: 26.8833, country: "Latvia", city: "Lubāna", description: "Putnu vērošanas tornis Lubāna ezera mitrājā.", category: "viewing_tower", region: "Vidzeme" },
  { name: "Riežupes smilšu alas", latitude: 57.3667, longitude: 27.0333, country: "Latvia", city: "Cēsis", description: "Cilvēka veidotas smilšakmens alas. Ekskursijas ar gidu un leģendas.", category: "nature", region: "Vidzeme" },
  { name: "Kuldīgas ķieģeļu tilts", latitude: 56.9686, longitude: 21.9653, country: "Latvia", city: "Kuldīga", description: "Vecais tilts pār Ventu. Skati uz ūdenskritumu.", category: "nature", region: "Kurzeme" },
  { name: "Ķemeru Lielā tīreļa laipa", latitude: 56.9478, longitude: 23.4917, country: "Latvia", city: "Ķemeri", description: "Koka laipa cauri purvam. Unikāla flora un skatu vietas.", category: "nature", region: "Vidzeme" },
];
