// Brazilian Fauna Avatars with detailed SVG illustrations

export const BRAZILIAN_FAUNA_AVATARS = [
  {
    id: 'anteater',
    nameEn: 'Giant Anteater',
    namePt: 'Tamanduá-Bandeira',
    taglineEn: 'Patient Hunter of the Plains',
    taglinePt: 'Caçador Paciente das Planícies',
    emoji: '🦡',
    scientificName: 'Myrmecophaga tridactyla',
    habitatEn: 'Savannas, forests, and open fields of Central and South America',
    habitatPt: 'Savanas, florestas e campos abertos da América Central e do Sul',
    characteristicsEn: 'Has a long snout and an extendable tongue used to catch ants and termites. Known for its dense fur and distinctive body stripes.',
    characteristicsPt: 'Possui um focinho longo e uma língua extensível que usa para capturar formigas e cupins. É conhecido por sua pelagem densa e faixas distintivas no corpo.',
    conservationStatusEn: 'Vulnerable',
    conservationStatusPt: 'Vulnerável',
    conservationThreatsEn: 'Habitat loss and hunting',
    conservationThreatsPt: 'Perda de habitat e caça',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="anteater-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="100%" stopColor="#654321" />
          </linearGradient>
        </defs>
        {/* Body */}
        <ellipse cx="100" cy="120" rx="70" ry="40" fill="url(#anteater-body)" stroke="#3E2723" strokeWidth="2"/>
        {/* Distinctive stripe */}
        <path d="M 60 100 Q 80 85 100 100 L 100 140 Q 80 125 60 140 Z" fill="#1a1a1a" opacity="0.8"/>
        {/* Head and snout */}
        <ellipse cx="85" cy="80" rx="20" ry="18" fill="#A0826D"/>
        <path d="M 70 75 Q 40 75 20 80 L 25 85 Q 45 80 70 80 Z" fill="#654321" stroke="#3E2723" strokeWidth="1.5"/>
        {/* Eye */}
        <circle cx="80" cy="75" r="3" fill="#000"/>
        {/* Ear */}
        <ellipse cx="95" cy="68" rx="6" ry="10" fill="#8B6914"/>
        {/* Legs */}
        <rect x="70" y="150" width="12" height="30" rx="3" fill="#654321"/>
        <rect x="110" y="150" width="12" height="30" rx="3" fill="#654321"/>
        {/* Claws */}
        <path d="M 70 180 L 65 190 M 75 180 L 75 190 M 82 180 L 85 190" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
        {/* Tail */}
        <path d="M 160 120 Q 180 100 185 80 Q 188 60 180 50" fill="none" stroke="#654321" strokeWidth="15" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'tapir',
    nameEn: 'Tapir',
    namePt: 'Anta',
    taglineEn: 'Ancient Wanderer of the Forest',
    taglinePt: 'Antigo Andarilho da Floresta',
    emoji: '🦛',
    scientificName: 'Tapirus terrestris',
    habitatEn: 'Tropical forests, savannas, and wetlands of South America',
    habitatPt: 'Florestas tropicais, savanas e áreas alagadas da América do Sul',
    characteristicsEn: 'The largest land mammal in South America, with a flexible snout resembling a small trunk. Has dark fur and a dorsal crest.',
    characteristicsPt: 'É o maior mamífero terrestre da América do Sul, com um focinho flexível que lembra uma pequena tromba. Tem uma pelagem escura e uma crista dorsal.',
    conservationStatusEn: 'Vulnerable',
    conservationStatusPt: 'Vulnerável',
    conservationThreatsEn: 'Habitat destruction and hunting',
    conservationThreatsPt: 'Destruição do habitat e caça',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Body */}
        <ellipse cx="100" cy="130" rx="60" ry="45" fill="#4A4A4A" stroke="#2C2C2C" strokeWidth="2"/>
        {/* Head */}
        <ellipse cx="70" cy="100" rx="28" ry="32" fill="#5A5A5A"/>
        {/* Trunk/snout */}
        <path d="M 55 100 Q 35 105 30 115" fill="none" stroke="#4A4A4A" strokeWidth="10" strokeLinecap="round"/>
        <circle cx="30" cy="115" r="4" fill="#3A3A3A"/>
        {/* Ears */}
        <ellipse cx="80" cy="85" rx="8" ry="12" fill="#4A4A4A"/>
        <ellipse cx="65" cy="85" rx="7" ry="11" fill="#4A4A4A"/>
        {/* Eyes */}
        <circle cx="75" cy="95" r="4" fill="#000"/>
        <circle cx="76" cy="94" r="1.5" fill="#FFF"/>
        {/* Dorsal crest */}
        <path d="M 90 105 L 95 95 L 105 105" fill="#2C2C2C"/>
        {/* Legs */}
        <rect x="65" y="160" width="14" height="35" rx="4" fill="#3A3A3A"/>
        <rect x="90" y="160" width="14" height="35" rx="4" fill="#3A3A3A"/>
        <rect x="115" y="160" width="14" height="35" rx="4" fill="#3A3A3A"/>
        <rect x="140" y="160" width="14" height="35" rx="4" fill="#3A3A3A"/>
        {/* Hooves */}
        <ellipse cx="72" cy="195" rx="8" ry="4" fill="#2C2C2C"/>
        <ellipse cx="97" cy="195" rx="8" ry="4" fill="#2C2C2C"/>
        <ellipse cx="122" cy="195" rx="8" ry="4" fill="#2C2C2C"/>
        <ellipse cx="147" cy="195" rx="8" ry="4" fill="#2C2C2C"/>
      </svg>
    )
  },
  {
    id: 'dolphin',
    nameEn: 'Pink River Dolphin',
    namePt: 'Boto-Cor-de-Rosa',
    taglineEn: 'Mystical Guardian of Waters',
    taglinePt: 'Guardião Místico das Águas',
    emoji: '🐬',
    scientificName: 'Inia geoffrensis',
    habitatEn: 'Amazon basin rivers',
    habitatPt: 'Rios da bacia Amazônica',
    characteristicsEn: 'Has a pink coloration that becomes more intense in adult males. Known for its intelligence and ability to swim in shallow waters and among trees during river floods.',
    characteristicsPt: 'Possui uma coloração rosada, que se torna mais intensa nos machos adultos. É conhecido por sua inteligência e habilidade de nadar em águas rasas e entre as árvores durante a cheia dos rios.',
    conservationStatusEn: 'Data Deficient',
    conservationStatusPt: 'Deficiente de dados',
    conservationThreatsEn: 'Habitat destruction and fishing',
    conservationThreatsPt: 'Destruição do habitat e pesca',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="dolphin-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="50%" stopColor="#FF69B4" />
            <stop offset="100%" stopColor="#FF1493" />
          </linearGradient>
        </defs>
        {/* Water waves */}
        <path d="M 0 150 Q 50 140 100 150 T 200 150 L 200 200 L 0 200 Z" fill="#87CEEB" opacity="0.3"/>
        {/* Body */}
        <ellipse cx="100" cy="100" rx="65" ry="30" fill="url(#dolphin-pink)" stroke="#FF1493" strokeWidth="2"/>
        {/* Tail flukes */}
        <path d="M 165 100 Q 180 90 190 85 Q 185 100 180 105 Q 175 110 165 105 Z" fill="url(#dolphin-pink)" stroke="#FF1493" strokeWidth="1.5"/>
        <path d="M 165 95 Q 180 85 190 75 Q 185 90 180 95 Q 175 100 165 100 Z" fill="url(#dolphin-pink)" stroke="#FF1493" strokeWidth="1.5"/>
        {/* Head/Beak */}
        <path d="M 35 100 Q 25 98 20 95 L 20 105 Q 25 102 35 100 Z" fill="#FFB6C1" stroke="#FF1493" strokeWidth="1.5"/>
        {/* Dorsal fin */}
        <path d="M 100 70 Q 105 55 100 70" fill="#FF69B4" stroke="#FF1493" strokeWidth="1"/>
        {/* Eye */}
        <circle cx="50" cy="95" r="4" fill="#000"/>
        <circle cx="51" cy="94" r="1.5" fill="#FFF"/>
        {/* Flippers */}
        <ellipse cx="70" cy="115" rx="20" ry="8" fill="#FF69B4" stroke="#FF1493" strokeWidth="1.5" transform="rotate(-20 70 115)"/>
        <ellipse cx="120" cy="115" rx="20" ry="8" fill="#FF69B4" stroke="#FF1493" strokeWidth="1.5" transform="rotate(20 120 115)"/>
        {/* Smile */}
        <path d="M 25 100 Q 30 105 35 100" fill="none" stroke="#FF1493" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'monkey',
    nameEn: 'Capuchin Monkey',
    namePt: 'Macaco-Prego',
    taglineEn: 'Clever Acrobat of the Trees',
    taglinePt: 'Acrobata Esperto das Árvores',
    emoji: '🐵',
    scientificName: 'Sapajus spp.',
    habitatEn: 'Tropical and subtropical forests of South America',
    habitatPt: 'Florestas tropicais e subtropicais da América do Sul',
    characteristicsEn: 'Known for their intelligence and use of tools. They have dense fur and a prehensile tail.',
    characteristicsPt: 'Conhecidos por sua inteligência e uso de ferramentas. Possuem uma pelagem densa e uma cauda preênsil.',
    conservationStatusEn: 'Varies by species',
    conservationStatusPt: 'Varia conforme a espécie',
    conservationThreatsEn: 'Habitat loss',
    conservationThreatsPt: 'Perda de habitat',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Branch */}
        <rect x="20" y="140" width="160" height="8" rx="4" fill="#8B4513"/>
        {/* Tail */}
        <path d="M 130 140 Q 150 120 170 100 Q 175 80 165 70" fill="none" stroke="#654321" strokeWidth="10" strokeLinecap="round"/>
        {/* Body */}
        <ellipse cx="100" cy="120" rx="35" ry="40" fill="#D2B48C"/>
        {/* Head */}
        <circle cx="100" cy="70" r="30" fill="#8B6914"/>
        {/* Face/Muzzle */}
        <ellipse cx="100" cy="75" rx="18" ry="15" fill="#F5DEB3"/>
        {/* Black cap */}
        <path d="M 75 55 Q 100 45 125 55 Q 120 65 100 70 Q 80 65 75 55" fill="#2C1810"/>
        {/* Ears */}
        <circle cx="75" cy="60" r="8" fill="#D2B48C" stroke="#8B6914" strokeWidth="1"/>
        <circle cx="125" cy="60" r="8" fill="#D2B48C" stroke="#8B6914" strokeWidth="1"/>
        {/* Eyes */}
        <circle cx="90" cy="70" r="5" fill="#000"/>
        <circle cx="91" cy="69" r="2" fill="#FFF"/>
        <circle cx="110" cy="70" r="5" fill="#000"/>
        <circle cx="111" cy="69" r="2" fill="#FFF"/>
        {/* Nose */}
        <ellipse cx="100" cy="78" rx="3" ry="4" fill="#654321"/>
        {/* Mouth */}
        <path d="M 95 82 Q 100 85 105 82" fill="none" stroke="#654321" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Arms */}
        <ellipse cx="75" cy="120" rx="10" ry="35" fill="#8B6914" transform="rotate(-30 75 120)"/>
        <ellipse cx="125" cy="120" rx="10" ry="35" fill="#8B6914" transform="rotate(30 125 120)"/>
        {/* Hands */}
        <circle cx="65" cy="140" r="8" fill="#D2B48C"/>
        <circle cx="135" cy="140" r="8" fill="#D2B48C"/>
        {/* Legs */}
        <ellipse cx="90" cy="155" rx="8" ry="20" fill="#8B6914"/>
        <ellipse cx="110" cy="155" rx="8" ry="20" fill="#8B6914"/>
      </svg>
    )
  },
  {
    id: 'armadillo',
    nameEn: 'Armadillo',
    namePt: 'Tatu',
    taglineEn: 'Armored Digger of Secrets',
    taglinePt: 'Escavador Blindado de Segredos',
    emoji: '🦔',
    scientificName: 'Dasypus novemcinctus',
    habitatEn: 'Savannas, forests, and areas near humans in South and Central America',
    habitatPt: 'Savanas, florestas e áreas próximas a humanos na América do Sul e Central',
    characteristicsEn: 'Has a bony shell that protects it. Feeds on insects and small invertebrates.',
    characteristicsPt: 'Possui uma carapaça óssea que o protege. Alimenta-se de insetos e pequenos invertebrados.',
    conservationStatusEn: 'Varies by species',
    conservationStatusPt: 'Varia conforme a espécie',
    conservationThreatsEn: 'Habitat loss',
    conservationThreatsPt: 'Perda de habitat',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <pattern id="shell-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#8B7355"/>
            <rect x="2" y="2" width="16" height="16" fill="#A0826D" rx="2"/>
          </pattern>
        </defs>
        {/* Ground */}
        <ellipse cx="100" cy="180" rx="60" ry="10" fill="#654321" opacity="0.3"/>
        {/* Body/Shell */}
        <ellipse cx="100" cy="120" rx="55" ry="35" fill="url(#shell-pattern)" stroke="#654321" strokeWidth="2"/>
        {/* Shell bands */}
        <path d="M 50 110 Q 100 105 150 110" fill="none" stroke="#654321" strokeWidth="2"/>
        <path d="M 50 120 Q 100 115 150 120" fill="none" stroke="#654321" strokeWidth="2"/>
        <path d="M 50 130 Q 100 125 150 130" fill="none" stroke="#654321" strokeWidth="2"/>
        {/* Head */}
        <ellipse cx="60" cy="100" rx="20" ry="18" fill="#A0826D" stroke="#654321" strokeWidth="1.5"/>
        {/* Snout */}
        <ellipse cx="45" cy="105" rx="10" ry="8" fill="#8B7355"/>
        <circle cx="42" cy="105" r="2" fill="#000"/>
        {/* Eye */}
        <circle cx="58" cy="95" r="3" fill="#000"/>
        {/* Ears */}
        <ellipse cx="68" cy="90" rx="5" ry="8" fill="#A0826D"/>
        {/* Legs */}
        <ellipse cx="70" cy="150" rx="6" ry="18" fill="#8B7355"/>
        <ellipse cx="90" cy="150" rx="6" ry="18" fill="#8B7355"/>
        <ellipse cx="110" cy="150" rx="6" ry="18" fill="#8B7355"/>
        <ellipse cx="130" cy="150" rx="6" ry="18" fill="#8B7355"/>
        {/* Tail */}
        <path d="M 145 125 Q 160 120 170 115" fill="none" stroke="#8B7355" strokeWidth="8" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'panther',
    nameEn: 'Black Panther',
    namePt: 'Pantera Negra',
    taglineEn: 'Mysterious Shadow of the Jungle',
    taglinePt: 'Sombra Misteriosa da Selva',
    emoji: '🐈‍⬛',
    scientificName: 'Panthera onca (melanistic)',
    habitatEn: 'Dense tropical forests and rainforests of South and Central America',
    habitatPt: 'Florestas tropicais densas e selvas da América do Sul e Central',
    characteristicsEn: 'A melanistic jaguar with a black coat that still shows faint spots. Known for exceptional stealth, power, and nocturnal hunting abilities.',
    characteristicsPt: 'Uma onça melânica com pelagem preta que ainda mostra manchas sutis. Conhecida por sua furtividade excepcional, força e habilidades de caça noturna.',
    conservationStatusEn: 'Near Threatened',
    conservationStatusPt: 'Quase ameaçado',
    conservationThreatsEn: 'Habitat loss and hunting',
    conservationThreatsPt: 'Perda de habitat e caça',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <radialGradient id="panther-body">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="100" cy="180" rx="70" ry="15" fill="#000" opacity="0.2"/>
        {/* Tail */}
        <path d="M 150 130 Q 170 110 185 90 Q 190 70 185 60" fill="none" stroke="#000" strokeWidth="12" strokeLinecap="round"/>
        {/* Hind leg */}
        <ellipse cx="130" cy="150" rx="12" ry="30" fill="url(#panther-body)"/>
        {/* Body */}
        <ellipse cx="100" cy="120" rx="50" ry="35" fill="url(#panther-body)" stroke="#000" strokeWidth="1"/>
        {/* Faint spots */}
        <ellipse cx="90" cy="110" rx="8" ry="6" fill="#0a0a0a" opacity="0.3"/>
        <ellipse cx="110" cy="115" rx="7" ry="5" fill="#0a0a0a" opacity="0.3"/>
        <ellipse cx="95" cy="130" rx="6" ry="5" fill="#0a0a0a" opacity="0.3"/>
        {/* Front leg */}
        <ellipse cx="70" cy="150" rx="12" ry="30" fill="url(#panther-body)"/>
        {/* Paws */}
        <ellipse cx="70" cy="175" rx="10" ry="8" fill="#0a0a0a"/>
        <ellipse cx="130" cy="175" rx="10" ry="8" fill="#0a0a0a"/>
        {/* Head */}
        <circle cx="70" cy="90" r="25" fill="url(#panther-body)"/>
        {/* Ears */}
        <path d="M 55 70 L 50 60 L 60 70 Z" fill="#000"/>
        <path d="M 85 70 L 90 60 L 80 70 Z" fill="#000"/>
        {/* Eyes - glowing yellow */}
        <ellipse cx="63" cy="88" rx="6" ry="8" fill="#FFD700"/>
        <ellipse cx="77" cy="88" rx="6" ry="8" fill="#FFD700"/>
        <ellipse cx="63" cy="88" rx="2" ry="6" fill="#000"/>
        <ellipse cx="77" cy="88" rx="2" ry="6" fill="#000"/>
        {/* Nose */}
        <path d="M 70 95 L 67 98 L 73 98 Z" fill="#1a1a1a"/>
        {/* Whiskers */}
        <line x1="45" y1="92" x2="30" y2="90" stroke="#333" strokeWidth="1"/>
        <line x1="45" y1="95" x2="30" y2="97" stroke="#333" strokeWidth="1"/>
        <line x1="95" y1="92" x2="110" y2="90" stroke="#333" strokeWidth="1"/>
        <line x1="95" y1="95" x2="110" y2="97" stroke="#333" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: 'caiman',
    nameEn: 'Caiman',
    namePt: 'Jacaré',
    taglineEn: 'Ancient Ruler of the Swamps',
    taglinePt: 'Antigo Governante dos Pântanos',
    emoji: '🐊',
    scientificName: 'Caiman crocodilus',
    habitatEn: 'Rivers, lakes, and swamps of South America',
    habitatPt: 'Rios, lagos e pântanos da América do Sul',
    characteristicsEn: 'A medium-sized crocodilian with a powerful bite. Has a varied diet including fish, birds, and mammals.',
    characteristicsPt: 'É um crocodiliano de tamanho médio com uma mordida poderosa. Tem uma dieta variada, incluindo peixes, aves e mamíferos.',
    conservationStatusEn: 'Varies by species',
    conservationStatusPt: 'Varia conforme a espécie',
    conservationThreatsEn: 'Habitat loss and hunting',
    conservationThreatsPt: 'Perda de habitat e caça',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <pattern id="scales" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="3" fill="#2F4F2F" opacity="0.5"/>
          </pattern>
        </defs>
        {/* Water */}
        <rect y="140" width="200" height="60" fill="#4682B4" opacity="0.4"/>
        <path d="M 0 140 Q 50 135 100 140 T 200 140" fill="none" stroke="#5F9EA0" strokeWidth="2"/>
        {/* Tail */}
        <path d="M 170 125 Q 190 120 195 110 Q 198 100 195 95" fill="#556B2F" stroke="#2F4F2F" strokeWidth="2"/>
        {/* Body */}
        <ellipse cx="100" cy="130" rx="70" ry="20" fill="#556B2F" stroke="#2F4F2F" strokeWidth="2"/>
        <ellipse cx="100" cy="130" rx="70" ry="20" fill="url(#scales)"/>
        {/* Spikes on back */}
        <path d="M 60 115 L 58 108 L 62 115" fill="#2F4F2F"/>
        <path d="M 80 112 L 78 105 L 82 112" fill="#2F4F2F"/>
        <path d="M 100 110 L 98 103 L 102 110" fill="#2F4F2F"/>
        <path d="M 120 112 L 118 105 L 122 112" fill="#2F4F2F"/>
        <path d="M 140 115 L 138 108 L 142 115" fill="#2F4F2F"/>
        {/* Head */}
        <ellipse cx="50" cy="125" rx="25" ry="18" fill="#556B2F" stroke="#2F4F2F" strokeWidth="2"/>
        {/* Snout */}
        <path d="M 25 125 Q 15 123 10 120 L 10 130 Q 15 127 25 125 Z" fill="#6B8E23" stroke="#2F4F2F" strokeWidth="1.5"/>
        {/* Teeth */}
        <path d="M 12 120 L 10 115 M 15 120 L 13 115 M 18 120 L 16 115" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M 12 130 L 10 135 M 15 130 L 13 135 M 18 130 L 16 135" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Eye */}
        <circle cx="42" cy="120" r="5" fill="#FFD700"/>
        <ellipse cx="42" cy="120" rx="1.5" ry="4" fill="#000"/>
        {/* Nostrils */}
        <circle cx="14" cy="122" r="2" fill="#2F4F2F"/>
        <circle cx="14" cy="128" r="2" fill="#2F4F2F"/>
        {/* Legs */}
        <ellipse cx="70" cy="145" rx="8" ry="15" fill="#556B2F" transform="rotate(-20 70 145)"/>
        <ellipse cx="120" cy="145" rx="8" ry="15" fill="#556B2F" transform="rotate(20 120 145)"/>
      </svg>
    )
  },
  {
    id: 'parrot',
    nameEn: 'Parrot',
    namePt: 'Papagaio',
    taglineEn: 'Chatty Messenger of Joy',
    taglinePt: 'Mensageiro Tagarela da Alegria',
    emoji: '🦜',
    scientificName: 'Amazona aestiva',
    habitatEn: 'Tropical forests, savannas, and urban areas of South America',
    habitatPt: 'Florestas tropicais, savanas e áreas urbanas da América do Sul',
    characteristicsEn: 'Known for their ability to mimic sounds and human speech. They have colorful plumage and a strong, curved beak.',
    characteristicsPt: 'Conhecidos por sua capacidade de imitar sons e fala humana. Possuem plumagem colorida e bico forte e curvo.',
    conservationStatusEn: 'Varies by species',
    conservationStatusPt: 'Varia conforme a espécie',
    conservationThreatsEn: 'Animal trafficking and habitat loss',
    conservationThreatsPt: 'Tráfico de animais e perda de habitat',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Branch */}
        <rect x="50" y="140" width="100" height="6" rx="3" fill="#8B4513"/>
        {/* Tail feathers */}
        <ellipse cx="130" cy="130" rx="15" ry="45" fill="#228B22" transform="rotate(30 130 130)"/>
        <ellipse cx="140" cy="125" rx="12" ry="40" fill="#32CD32" transform="rotate(35 140 125)"/>
        <ellipse cx="135" cy="130" rx="10" ry="35" fill="#00FF00" transform="rotate(32 135 130)"/>
        {/* Body */}
        <ellipse cx="100" cy="100" rx="30" ry="40" fill="#228B22"/>
        {/* Wing */}
        <ellipse cx="85" cy="105" rx="25" ry="35" fill="#32CD32" transform="rotate(-25 85 105)"/>
        <path d="M 70 90 Q 60 100 65 115" fill="none" stroke="#006400" strokeWidth="2"/>
        <path d="M 75 95 Q 65 105 70 120" fill="none" stroke="#006400" strokeWidth="2"/>
        {/* Chest - yellow */}
        <ellipse cx="100" cy="115" rx="18" ry="25" fill="#FFD700"/>
        {/* Head */}
        <circle cx="95" cy="70" r="22" fill="#228B22"/>
        {/* Face - yellow/white */}
        <ellipse cx="95" cy="72" rx="15" ry="18" fill="#FFFF00"/>
        {/* Beak */}
        <path d="M 85 70 Q 75 72 70 75 Q 75 78 85 75 Z" fill="#FF6347" stroke="#DC143C" strokeWidth="1.5"/>
        {/* Eye ring */}
        <circle cx="95" cy="68" r="8" fill="#FFF"/>
        {/* Eye */}
        <circle cx="95" cy="68" r="5" fill="#000"/>
        <circle cx="97" cy="66" r="2" fill="#FFF"/>
        {/* Blue forehead */}
        <ellipse cx="95" cy="58" rx="12" ry="8" fill="#4169E1"/>
        {/* Red shoulder patch */}
        <ellipse cx="80" cy="90" rx="8" ry="10" fill="#FF0000"/>
        {/* Feet */}
        <path d="M 95 140 L 93 150 M 95 140 L 95 150 M 95 140 L 97 150" stroke="#8B4513" strokeWidth="2"/>
        <path d="M 105 140 L 103 150 M 105 140 L 105 150 M 105 140 L 107 150" stroke="#8B4513" strokeWidth="2"/>
      </svg>
    )
  },
  {
    id: 'butterfly',
    nameEn: 'Blue Morpho Butterfly',
    namePt: 'Borboleta-Morfo-Azul',
    taglineEn: 'Graceful Dancer of the Sky',
    taglinePt: 'Dançarina Graciosa do Céu',
    emoji: '🦋',
    scientificName: 'Morpho didius',
    habitatEn: 'Tropical forests of Central and South America',
    habitatPt: 'Florestas tropicais da América Central e do Sul',
    characteristicsEn: 'Has iridescent blue wings visible when in flight, but displays a camouflage pattern when at rest.',
    characteristicsPt: 'Possui asas azuis iridescentes que são visíveis quando em voo, mas apresentam um padrão de camuflagem quando em repouso.',
    conservationStatusEn: 'Not Threatened',
    conservationStatusPt: 'Não ameaçada',
    conservationThreatsEn: 'Habitat destruction',
    conservationThreatsPt: 'Destruição do habitat',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <radialGradient id="wing-blue">
            <stop offset="0%" stopColor="#00BFFF" />
            <stop offset="50%" stopColor="#1E90FF" />
            <stop offset="100%" stopColor="#0000CD" />
          </radialGradient>
        </defs>
        {/* Upper wings */}
        <ellipse cx="70" cy="80" rx="50" ry="40" fill="url(#wing-blue)" transform="rotate(-20 70 80)"/>
        <ellipse cx="130" cy="80" rx="50" ry="40" fill="url(#wing-blue)" transform="rotate(20 130 80)"/>
        {/* Wing patterns - white spots */}
        <circle cx="55" cy="70" r="3" fill="#FFF" opacity="0.8"/>
        <circle cx="65" cy="85" r="4" fill="#FFF" opacity="0.8"/>
        <circle cx="75" cy="95" r="3" fill="#FFF" opacity="0.8"/>
        <circle cx="145" cy="70" r="3" fill="#FFF" opacity="0.8"/>
        <circle cx="135" cy="85" r="4" fill="#FFF" opacity="0.8"/>
        <circle cx="125" cy="95" r="3" fill="#FFF" opacity="0.8"/>
        {/* Wing edges - dark */}
        <path d="M 30 60 Q 50 50 70 60" fill="none" stroke="#000080" strokeWidth="3"/>
        <path d="M 130 60 Q 150 50 170 60" fill="none" stroke="#000080" strokeWidth="3"/>
        {/* Lower wings */}
        <ellipse cx="75" cy="130" rx="45" ry="50" fill="url(#wing-blue)" transform="rotate(-10 75 130)"/>
        <ellipse cx="125" cy="130" rx="45" ry="50" fill="url(#wing-blue)" transform="rotate(10 125 130)"/>
        {/* Lower wing patterns */}
        <circle cx="60" cy="140" r="8" fill="#000080" opacity="0.5"/>
        <circle cx="70" cy="155" r="6" fill="#000080" opacity="0.5"/>
        <circle cx="140" cy="140" r="8" fill="#000080" opacity="0.5"/>
        <circle cx="130" cy="155" r="6" fill="#000080" opacity="0.5"/>
        {/* Lower wing spots */}
        <ellipse cx="80" cy="160" rx="5" ry="8" fill="#FF6347"/>
        <ellipse cx="120" cy="160" rx="5" ry="8" fill="#FF6347"/>
        {/* Body */}
        <ellipse cx="100" cy="100" rx="8" ry="50" fill="#000"/>
        {/* Head */}
        <circle cx="100" cy="60" r="8" fill="#000"/>
        {/* Antennae */}
        <path d="M 98 55 Q 95 45 92 40" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 102 55 Q 105 45 108 40" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="92" cy="40" r="2" fill="#000"/>
        <circle cx="108" cy="40" r="2" fill="#000"/>
      </svg>
    )
  },
  {
    id: 'hawk',
    nameEn: 'Hawk',
    namePt: 'Gavião',
    taglineEn: 'Sharp-Eyed Hunter of Heights',
    taglinePt: 'Caçador de Olhar Aguçado das Alturas',
    emoji: '🦅',
    scientificName: 'Buteo spp.',
    habitatEn: 'Forests, savannas, and urban areas of South America',
    habitatPt: 'Florestas, savanas e áreas urbanas da América do Sul',
    characteristicsEn: 'Birds of prey with excellent vision, adapted to hunt small mammals, birds, and reptiles.',
    characteristicsPt: 'Aves de rapina com excelente visão, adaptadas para caçar pequenos mamíferos, aves e répteis.',
    conservationStatusEn: 'Varies by species',
    conservationStatusPt: 'Varia conforme a espécie',
    conservationThreatsEn: 'Habitat loss',
    conservationThreatsPt: 'Perda de habitat',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Sky background suggestion */}
        <circle cx="160" cy="40" r="20" fill="#FFD700" opacity="0.3"/>
        {/* Wings spread */}
        <ellipse cx="50" cy="100" rx="40" ry="20" fill="#8B4513" transform="rotate(-30 50 100)"/>
        <ellipse cx="150" cy="100" rx="40" ry="20" fill="#8B4513" transform="rotate(30 150 100)"/>
        {/* Wing feathers */}
        <path d="M 20 90 L 15 85 M 25 95 L 20 90 M 30 100 L 25 95" stroke="#654321" strokeWidth="3" strokeLinecap="round"/>
        <path d="M 180 90 L 185 85 M 175 95 L 180 90 M 170 100 L 175 95" stroke="#654321" strokeWidth="3" strokeLinecap="round"/>
        {/* Body */}
        <ellipse cx="100" cy="110" rx="25" ry="35" fill="#A0522D"/>
        {/* Chest - lighter */}
        <ellipse cx="100" cy="115" rx="18" ry="25" fill="#D2B48C"/>
        {/* Feather patterns */}
        <path d="M 95 105 L 95 125 M 100 105 L 100 125 M 105 105 L 105 125" stroke="#8B4513" strokeWidth="1" opacity="0.5"/>
        {/* Head */}
        <circle cx="100" cy="75" r="18" fill="#8B4513"/>
        {/* Beak - hooked */}
        <path d="M 100 75 Q 88 77 85 82 Q 88 80 95 78 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1.5"/>
        {/* Eyes - fierce */}
        <ellipse cx="95" cy="72" rx="5" ry="6" fill="#FFD700"/>
        <ellipse cx="105" cy="72" rx="5" ry="6" fill="#FFD700"/>
        <circle cx="95" cy="72" r="3" fill="#000"/>
        <circle cx="105" cy="72" r="3" fill="#000"/>
        <circle cx="96" cy="71" r="1" fill="#FFF"/>
        <circle cx="106" cy="71" r="1" fill="#FFF"/>
        {/* Eyebrow ridge - fierce look */}
        <path d="M 90 68 L 98 68" stroke="#654321" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 102 68 L 110 68" stroke="#654321" strokeWidth="2" strokeLinecap="round"/>
        {/* Tail feathers */}
        <path d="M 100 145 L 95 175 L 100 170 Z" fill="#654321"/>
        <path d="M 100 145 L 100 175 L 100 170 Z" fill="#8B4513"/>
        <path d="M 100 145 L 105 175 L 100 170 Z" fill="#654321"/>
        {/* Talons */}
        <path d="M 95 145 L 93 160 L 90 165 M 93 160 L 88 165 M 93 160 L 93 165" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 105 145 L 107 160 L 110 165 M 107 160 L 112 165 M 107 160 L 107 165" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'jaguar',
    nameEn: 'Jaguar',
    namePt: 'Onça-Pintada',
    taglineEn: 'Fierce Guardian of the Amazon',
    taglinePt: 'Guardião Feroz da Amazônia',
    emoji: '🐆',
    scientificName: 'Panthera onca',
    habitatEn: 'Tropical forests, savannas, and swamps of South and Central America',
    habitatPt: 'Florestas tropicais, savanas e pântanos da América do Sul e Central',
    characteristicsEn: 'The largest feline in the Americas, known for its yellow coat with black spots and exceptional strength.',
    characteristicsPt: 'É o maior felino das Américas, conhecido por sua pelagem amarela com manchas pretas e sua força excepcional.',
    conservationStatusEn: 'Near Threatened',
    conservationStatusPt: 'Quase ameaçado',
    conservationThreatsEn: 'Habitat loss and hunting',
    conservationThreatsPt: 'Perda de habitat e caça',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="jaguar-fur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="100" cy="185" rx="70" ry="12" fill="#000" opacity="0.2"/>
        {/* Tail */}
        <path d="M 155 125 Q 175 110 190 95 Q 195 80 190 70" fill="url(#jaguar-fur)" stroke="#000" strokeWidth="2"/>
        {/* Tail spots */}
        <circle cx="165" cy="115" r="4" fill="#000"/>
        <circle cx="180" cy="100" r="4" fill="#000"/>
        <circle cx="188" cy="85" r="3" fill="#000"/>
        {/* Hind leg */}
        <ellipse cx="135" cy="155" rx="14" ry="32" fill="url(#jaguar-fur)" stroke="#000" strokeWidth="1.5"/>
        <ellipse cx="135" cy="145" rx="5" ry="8" fill="#000" opacity="0.7"/>
        {/* Body */}
        <ellipse cx="100" cy="120" rx="55" ry="38" fill="url(#jaguar-fur)" stroke="#000" strokeWidth="2"/>
        {/* Rosette spots on body */}
        <path d="M 80 110 Q 75 105 80 100 Q 85 105 80 110 Z" fill="none" stroke="#000" strokeWidth="2"/>
        <circle cx="80" cy="105" r="2" fill="#000"/>
        <path d="M 110 115 Q 105 110 110 105 Q 115 110 110 115 Z" fill="none" stroke="#000" strokeWidth="2"/>
        <circle cx="110" cy="110" r="2" fill="#000"/>
        <path d="M 95 130 Q 90 125 95 120 Q 100 125 95 130 Z" fill="none" stroke="#000" strokeWidth="2"/>
        <circle cx="95" cy="125" r="2" fill="#000"/>
        <path d="M 125 125 Q 120 120 125 115 Q 130 120 125 125 Z" fill="none" stroke="#000" strokeWidth="2"/>
        <circle cx="125" cy="120" r="2" fill="#000"/>
        {/* Front leg */}
        <ellipse cx="75" cy="155" rx="14" ry="32" fill="url(#jaguar-fur)" stroke="#000" strokeWidth="1.5"/>
        <ellipse cx="75" cy="145" rx="5" ry="8" fill="#000" opacity="0.7"/>
        {/* Paws */}
        <ellipse cx="75" cy="182" rx="11" ry="9" fill="#DAA520" stroke="#000" strokeWidth="1.5"/>
        <ellipse cx="135" cy="182" rx="11" ry="9" fill="#DAA520" stroke="#000" strokeWidth="1.5"/>
        {/* Head */}
        <circle cx="65" cy="85" r="28" fill="url(#jaguar-fur)" stroke="#000" strokeWidth="2"/>
        {/* Facial markings */}
        <circle cx="55" cy="75" r="4" fill="#000"/>
        <circle cx="50" cy="85" r="3" fill="#000"/>
        <circle cx="60" cy="95" r="3" fill="#000"/>
        {/* Ears */}
        <ellipse cx="50" cy="65" rx="8" ry="10" fill="url(#jaguar-fur)" stroke="#000" strokeWidth="1.5"/>
        <ellipse cx="80" cy="65" rx="8" ry="10" fill="url(#jaguar-fur)" stroke="#000" strokeWidth="1.5"/>
        <ellipse cx="50" cy="67" rx="4" ry="5" fill="#000"/>
        <ellipse cx="80" cy="67" rx="4" ry="5" fill="#000"/>
        {/* Eyes - intense */}
        <ellipse cx="58" cy="82" rx="6" ry="7" fill="#90EE90"/>
        <ellipse cx="72" cy="82" rx="6" ry="7" fill="#90EE90"/>
        <ellipse cx="58" cy="82" rx="2" ry="5" fill="#000"/>
        <ellipse cx="72" cy="82" rx="2" ry="5" fill="#000"/>
        <circle cx="59" cy="80" r="1.5" fill="#FFF"/>
        <circle cx="73" cy="80" r="1.5" fill="#FFF"/>
        {/* Nose */}
        <path d="M 65 90 L 62 93 L 68 93 Z" fill="#000"/>
        {/* Mouth */}
        <path d="M 65 93 Q 60 96 58 98 M 65 93 Q 70 96 72 98" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Whiskers */}
        <line x1="40" y1="85" x2="25" y2="83" stroke="#000" strokeWidth="1"/>
        <line x1="40" y1="88" x2="25" y2="90" stroke="#000" strokeWidth="1"/>
        <line x1="90" y1="85" x2="105" y2="83" stroke="#000" strokeWidth="1"/>
        <line x1="90" y1="88" x2="105" y2="90" stroke="#000" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: 'toucan',
    nameEn: 'Toucan',
    namePt: 'Tucano',
    taglineEn: 'Colorful Spirit of the Rainforest',
    taglinePt: 'Espírito Colorido da Floresta',
    emoji: '🦜',
    scientificName: 'Ramphastos toco',
    habitatEn: 'Tropical forests of South America',
    habitatPt: 'Florestas tropicais da América do Sul',
    characteristicsEn: 'Known for their large, colorful beak. They feed on fruits, insects, and small vertebrates.',
    characteristicsPt: 'Conhecidos por seu bico grande e colorido. Alimentam-se de frutos, insetos e pequenos vertebrados.',
    conservationStatusEn: 'Varies by species',
    conservationStatusPt: 'Varia conforme a espécie',
    conservationThreatsEn: 'Habitat loss',
    conservationThreatsPt: 'Perda de habitat',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="beak-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6347" />
            <stop offset="50%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
        {/* Branch */}
        <rect x="80" y="150" width="80" height="8" rx="4" fill="#8B4513"/>
        {/* Tail */}
        <path d="M 125 135 L 145 165 L 150 160 L 130 130 Z" fill="#FF0000"/>
        <path d="M 130 132 L 150 162 L 155 157 L 135 127 Z" fill="#DC143C"/>
        {/* Body */}
        <ellipse cx="100" cy="110" rx="28" ry="38" fill="#000"/>
        {/* Wing detail */}
        <path d="M 80 100 Q 70 110 75 125" fill="none" stroke="#1a1a1a" strokeWidth="3"/>
        {/* Chest - white/yellow */}
        <ellipse cx="100" cy="120" rx="20" ry="28" fill="#FFFF00"/>
        {/* Under tail - white */}
        <ellipse cx="115" cy="140" rx="12" ry="15" fill="#FFF"/>
        {/* Head */}
        <circle cx="95" cy="75" r="24" fill="#000"/>
        {/* Throat - orange band */}
        <ellipse cx="95" cy="90" rx="18" ry="12" fill="#FF6347"/>
        {/* Face - white/yellow */}
        <ellipse cx="95" cy="73" rx="16" ry="18" fill="#FFFF00"/>
        {/* Eye ring - blue */}
        <circle cx="95" cy="70" r="10" fill="#4169E1"/>
        {/* Eye */}
        <circle cx="95" cy="70" r="6" fill="#000"/>
        <circle cx="97" cy="68" r="2" fill="#FFF"/>
        {/* Massive beak */}
        <path d="M 85 73 Q 50 70 30 75 Q 28 77 30 80 Q 50 85 85 80 Z" fill="url(#beak-gradient)" stroke="#FF6347" strokeWidth="2"/>
        {/* Beak detail - black stripe */}
        <path d="M 82 75 Q 55 73 35 77 L 35 78 Q 55 74 82 76 Z" fill="#000"/>
        {/* Beak tip - black */}
        <ellipse cx="30" cy="77.5" rx="5" ry="5" fill="#000"/>
        {/* Nostril */}
        <line x1="75" y1="76" x2="82" y2="76" stroke="#000" strokeWidth="2"/>
        {/* Feet gripping branch */}
        <path d="M 95 150 L 93 158 M 95 150 L 95 158 M 95 150 L 97 158" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 105 150 L 103 158 M 105 150 L 105 158 M 105 150 L 107 158" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'capybara',
    nameEn: 'Capybara',
    namePt: 'Capivara',
    taglineEn: 'Gentle Giant of the Rivers',
    taglinePt: 'Gigante Gentil dos Rios',
    emoji: '🦫',
    scientificName: 'Hydrochoerus hydrochaeris',
    habitatEn: 'Wetlands, savannas, and forests near water bodies in South America',
    habitatPt: 'Áreas alagadas, savanas e florestas próximas a corpos d\'água na América do Sul',
    characteristicsEn: 'The largest rodent in the world, with thick fur and no tail. Semi-aquatic and lives in social groups.',
    characteristicsPt: 'É o maior roedor do mundo, com uma pelagem espessa e sem cauda. É semi-aquático e vive em grupos sociais.',
    conservationStatusEn: 'Not Threatened',
    conservationStatusPt: 'Não ameaçada',
    conservationThreatsEn: 'Regional threats in some areas',
    conservationThreatsPt: 'Ameaças em algumas regiões',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Water */}
        <rect y="160" width="200" height="40" fill="#87CEEB" opacity="0.4"/>
        <path d="M 0 160 Q 50 155 100 160 T 200 160" fill="none" stroke="#5F9EA0" strokeWidth="2"/>
        {/* Body - large and round */}
        <ellipse cx="100" cy="130" rx="60" ry="45" fill="#A0826D" stroke="#654321" strokeWidth="2"/>
        {/* Head - blocky */}
        <rect x="60" y="80" width="45" height="40" rx="8" fill="#A0826D" stroke="#654321" strokeWidth="2"/>
        {/* Snout/nose area */}
        <rect x="55" y="95" width="15" height="18" rx="4" fill="#8B7355"/>
        {/* Nostrils */}
        <circle cx="60" cy="100" r="2" fill="#3E2723"/>
        <circle cx="60" cy="107" r="2" fill="#3E2723"/>
        {/* Eyes - small and friendly */}
        <circle cx="80" cy="92" r="4" fill="#000"/>
        <circle cx="81" cy="91" r="1.5" fill="#FFF"/>
        <circle cx="95" cy="92" r="4" fill="#000"/>
        <circle cx="96" cy="91" r="1.5" fill="#FFF"/>
        {/* Ears - small and round */}
        <ellipse cx="70" cy="78" rx="6" ry="8" fill="#A0826D" stroke="#654321" strokeWidth="1"/>
        <ellipse cx="95" cy="78" rx="6" ry="8" fill="#A0826D" stroke="#654321" strokeWidth="1"/>
        {/* Mouth - subtle */}
        <path d="M 75 110 Q 82 113 89 110" fill="none" stroke="#654321" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Fur texture lines */}
        <path d="M 70 125 Q 75 120 80 125" fill="none" stroke="#654321" strokeWidth="0.5" opacity="0.5"/>
        <path d="M 90 130 Q 95 125 100 130" fill="none" stroke="#654321" strokeWidth="0.5" opacity="0.5"/>
        <path d="M 110 125 Q 115 120 120 125" fill="none" stroke="#654321" strokeWidth="0.5" opacity="0.5"/>
        {/* Legs - short and sturdy */}
        <rect x="70" y="165" width="12" height="25" rx="3" fill="#8B7355"/>
        <rect x="88" y="165" width="12" height="25" rx="3" fill="#8B7355"/>
        <rect x="110" y="165" width="12" height="25" rx="3" fill="#8B7355"/>
        <rect x="128" y="165" width="12" height="25" rx="3" fill="#8B7355"/>
        {/* Webbed feet indicators */}
        <ellipse cx="76" cy="190" rx="8" ry="4" fill="#654321"/>
        <ellipse cx="94" cy="190" rx="8" ry="4" fill="#654321"/>
        <ellipse cx="116" cy="190" rx="8" ry="4" fill="#654321"/>
        <ellipse cx="134" cy="190" rx="8" ry="4" fill="#654321"/>
        {/* Friendly expression detail */}
        <path d="M 73 105 Q 82 108 91 105" fill="none" stroke="#654321" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      </svg>
    )
  },
  {
    id: 'macaw',
    nameEn: 'Macaw',
    namePt: 'Arara',
    taglineEn: 'Brilliant Wings of Freedom',
    taglinePt: 'Asas Brilhantes da Liberdade',
    emoji: '🦜',
    scientificName: 'Ara ararauna',
    habitatEn: 'Tropical forests and savannas of South America',
    habitatPt: 'Florestas tropicais e savanas da América do Sul',
    characteristicsEn: 'Large birds with vibrant plumage, known for their intelligence and complex vocalizations.',
    characteristicsPt: 'Aves de grande porte com plumagem vibrante, conhecidas por sua inteligência e vocalizações complexas.',
    conservationStatusEn: 'Varies by species',
    conservationStatusPt: 'Varia conforme a espécie',
    conservationThreatsEn: 'Animal trafficking and habitat loss',
    conservationThreatsPt: 'Tráfico de animais e perda de habitat',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4169E1" />
            <stop offset="100%" stopColor="#0000CD" />
          </linearGradient>
        </defs>
        {/* Tail feathers - long and flowing */}
        <ellipse cx="135" cy="140" rx="12" ry="60" fill="#4169E1" transform="rotate(20 135 140)"/>
        <ellipse cx="128" cy="145" rx="10" ry="55" fill="#1E90FF" transform="rotate(15 128 145)"/>
        <ellipse cx="142" cy="135" rx="10" ry="55" fill="#00BFFF" transform="rotate(25 142 135)"/>
        {/* Wings - spread */}
        <ellipse cx="70" cy="100" rx="35" ry="50" fill="url(#blue-gradient)" transform="rotate(-35 70 100)"/>
        <ellipse cx="130" cy="100" rx="35" ry="50" fill="url(#blue-gradient)" transform="rotate(35 130 100)"/>
        {/* Wing tips - darker */}
        <path d="M 45 80 Q 35 90 40 110" fill="none" stroke="#000080" strokeWidth="4"/>
        <path d="M 155 80 Q 165 90 160 110" fill="none" stroke="#000080" strokeWidth="4"/>
        {/* Body */}
        <ellipse cx="100" cy="100" rx="25" ry="45" fill="#FFD700"/>
        {/* Chest - yellow gradient */}
        <ellipse cx="100" cy="110" rx="20" ry="35" fill="#FFA500"/>
        {/* Head */}
        <circle cx="100" cy="60" r="22" fill="url(#blue-gradient)"/>
        {/* Forehead - green */}
        <ellipse cx="100" cy="48" rx="15" ry="10" fill="#32CD32"/>
        {/* White face patch */}
        <ellipse cx="100" cy="62" rx="16" ry="18" fill="#FFF"/>
        {/* Black face stripes */}
        <path d="M 90 56 Q 95 58 100 56" fill="none" stroke="#000" strokeWidth="1.5"/>
        <path d="M 90 62 Q 95 64 100 62" fill="none" stroke="#000" strokeWidth="1.5"/>
        <path d="M 90 68 Q 95 70 100 68" fill="none" stroke="#000" strokeWidth="1.5"/>
        {/* Eye */}
        <circle cx="100" cy="58" r="6" fill="#FFD700"/>
        <circle cx="100" cy="58" r="4" fill="#000"/>
        <circle cx="101" cy="57" r="1.5" fill="#FFF"/>
        {/* Beak - large and curved */}
        <path d="M 95 65 Q 80 68 75 75 Q 78 78 85 76 Q 95 72 95 65 Z" fill="#333" stroke="#000" strokeWidth="1.5"/>
        {/* Beak highlight */}
        <path d="M 90 68 Q 85 70 82 72" fill="none" stroke="#666" strokeWidth="1" strokeLinecap="round"/>
        {/* Feet on perch */}
        <ellipse cx="100" cy="145" rx="40" ry="5" fill="#8B4513" opacity="0.3"/>
        <path d="M 95 145 L 93 155 M 95 145 L 95 155 M 95 145 L 97 155" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 105 145 L 103 155 M 105 145 L 105 155 M 105 145 L 107 155" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'sloth',
    nameEn: 'Sloth',
    namePt: 'Preguiça',
    taglineEn: 'Wise Keeper of the Canopy',
    taglinePt: 'Sábio Guardião do Dossel',
    emoji: '🦥',
    scientificName: 'Bradypus variegatus',
    habitatEn: 'Tropical forests of South and Central America',
    habitatPt: 'Florestas tropicais da América do Sul e Central',
    characteristicsEn: 'Arboreal mammals known for their slow movement and fur that harbors algae, giving them a greenish color.',
    characteristicsPt: 'Mamíferos arbóreos conhecidos por seu movimento lento e sua pelagem que abriga algas, dando-lhe uma coloração esverdeada.',
    conservationStatusEn: 'Varies by species',
    conservationStatusPt: 'Varia conforme a espécie',
    conservationThreatsEn: 'Habitat loss',
    conservationThreatsPt: 'Perda de habitat',
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="sloth-fur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B7355" />
            <stop offset="50%" stopColor="#A0826D" />
            <stop offset="100%" stopColor="#9ACD32" />
          </linearGradient>
        </defs>
        {/* Tree branch */}
        <rect x="20" y="80" width="160" height="12" rx="6" fill="#654321"/>
        <rect x="40" y="80" width="5" height="20" fill="#8B4513"/>
        <rect x="120" y="80" width="5" height="20" fill="#8B4513"/>
        {/* Body hanging */}
        <ellipse cx="100" cy="120" rx="35" ry="40" fill="url(#sloth-fur)" stroke="#654321" strokeWidth="1.5"/>
        {/* Shaggy fur texture */}
        <path d="M 70 110 Q 75 105 80 110" fill="none" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 90 115 Q 95 110 100 115" fill="none" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 110 110 Q 115 105 120 110" fill="none" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 75 130 Q 80 125 85 130" fill="none" stroke="#9ACD32" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <path d="M 95 135 Q 100 130 105 135" fill="none" stroke="#9ACD32" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <path d="M 115 130 Q 120 125 125 130" fill="none" stroke="#9ACD32" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        {/* Arms hanging - holding branch */}
        <ellipse cx="70" cy="90" rx="10" ry="35" fill="url(#sloth-fur)" transform="rotate(-15 70 90)"/>
        <ellipse cx="130" cy="90" rx="10" ry="35" fill="url(#sloth-fur)" transform="rotate(15 130 90)"/>
        {/* Claws gripping branch */}
        <path d="M 65 75 Q 60 80 58 82 M 65 75 Q 65 80 65 82 M 65 75 Q 70 80 72 82" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 135 75 Q 130 80 128 82 M 135 75 Q 135 80 135 82 M 135 75 Q 140 80 142 82" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Legs */}
        <ellipse cx="90" cy="145" rx="9" ry="25" fill="url(#sloth-fur)"/>
        <ellipse cx="110" cy="145" rx="9" ry="25" fill="url(#sloth-fur)"/>
        {/* Feet claws */}
        <path d="M 87 165 L 84 172 M 90 165 L 90 172 M 93 165 L 96 172" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 107 165 L 104 172 M 110 165 L 110 172 M 113 165 L 116 172" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
        {/* Head */}
        <ellipse cx="100" cy="100" rx="22" ry="20" fill="url(#sloth-fur)" stroke="#654321" strokeWidth="1.5"/>
        {/* Face - lighter fur */}
        <ellipse cx="100" cy="102" rx="16" ry="15" fill="#D2B48C"/>
        {/* Eye patches - dark */}
        <ellipse cx="92" cy="98" rx="7" ry="9" fill="#654321"/>
        <ellipse cx="108" cy="98" rx="7" ry="9" fill="#654321"/>
        {/* Eyes - small and sleepy */}
        <circle cx="92" cy="98" r="3" fill="#000"/>
        <circle cx="108" cy="98" r="3" fill="#000"/>
        <circle cx="93" cy="97" r="1" fill="#FFF"/>
        <circle cx="109" cy="97" r="1" fill="#FFF"/>
        {/* Nose - small button */}
        <circle cx="100" cy="105" r="3" fill="#654321"/>
        {/* Smile - gentle */}
        <path d="M 95 108 Q 100 111 105 108" fill="none" stroke="#654321" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Algae patches on fur */}
        <ellipse cx="75" cy="115" rx="5" ry="8" fill="#6B8E23" opacity="0.4"/>
        <ellipse cx="115" cy="125" rx="6" ry="7" fill="#6B8E23" opacity="0.4"/>
      </svg>
    )
  }
];