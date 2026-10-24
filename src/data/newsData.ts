import { VoiceAnchor, NewsScriptPreset } from "../types/studio";

export const FANA_ANCHORS: VoiceAnchor[] = [
  {
    id: "dawit",
    nameAmharic: "ዳዊት ከበደ",
    nameEnglish: "Dawit Kebede",
    roleAmharic: "አበይት ዜና አቅራቢ",
    roleEnglish: "Lead Prime-Time News Anchor",
    geminiVoice: "Fenrir",
    styleDirective: "Flawless native standard Ethiopian Amharic broadcast news delivery from Addis Ababa. Speak in warm, resonant, authoritative baritone with natural connected human cadence, expressive broadcast rhythm, authentic gemination, and smooth sentence flow. Strictly articulate the consonant 'b' (በ, ቡ, ቢ, ባ, ቤ, ብ, ቦ) as an assertive bilabial plosive [b] (e.g. 'ሰበር' is articulated with a firm B, never 'v'). Zero robotic artifacts, zero disjointed syllables, and zero synthetic monotone.",
    styleDirectiveEnglish: "Authoritative, deep baritone television news delivery in British/Transatlantic broadcast English. Crisp articulation and natural newsroom cadence.",
    gender: "male",
    avatarUrl: "/images/anchor_dawit.jpg",
    description: "ጥልቅ፣ ግርማ ሞገስ ያለው እና አድማጭን የሚስብ አበይት ዜና ድምፅ።",
    descriptionEnglish: "Deep, authoritative baritone voice. Ideal for major political headlines and national broadcast updates.",
    sampleText: "ሰላም ጤና ይስጥልኝ፤ የዜና አንባቢ ስቱዲዮው የዛሬውን አበይት ዜናዎች ይዘን ቀርበናል። በዋና ዋና ዜናዎቻችን...",
    sampleTextEnglish: "Good evening. Welcome to the News Anchor Studio. Here are the top stories making headlines at this hour...",
    sampleAudioUrl: "/audio/sample_dawit_news.wav",
    defaultPitch: 0.9,
    defaultRate: 0.96,
  },
  {
    id: "aster",
    nameAmharic: "አስቴር ማሞ",
    nameEnglish: "Aster Mamo",
    roleAmharic: "ዋና ዜና አቅራቢ",
    roleEnglish: "Senior Evening News Anchor",
    geminiVoice: "Aoede",
    styleDirective: "Distinguished prime-time Ethiopian female television news anchor from Addis Ababa. Speak in fluent, melodious, polished standard Amharic with natural breathing pauses, authentic news cadence, and graceful authoritative delivery. Strictly articulate the consonant 'b' as an assertive [b] (e.g. 'ሰበር' is articulated with a firm B, never 'v'). Completely natural, seamless human news delivery with zero robotic artifacts.",
    styleDirectiveEnglish: "Distinguished female prime-time news anchor delivering in fluent broadcast English. Poised, clear, and professional.",
    gender: "female",
    avatarUrl: "/images/anchor_aster.jpg",
    description: "ግልጽ፣ ጥርት ያለ እና የተከበረ የቴሌቪዥን ዋና ዜና አቀራረብ።",
    descriptionEnglish: "Poised, articulate, and trustworthy television news delivery. Perfect for executive summaries and international reports.",
    sampleText: "ክቡራትና ክቡራን፤ የሰዓቱን አበይት መረጃዎች ይዘንላችሁ ቀርበናል። እስከ ዝግጅታችን ፍጻሜ ድረስ አብራችሁን ቆዩ።",
    sampleTextEnglish: "Welcome to tonight's comprehensive bulletin. In our leading developments from across the region...",
    sampleAudioUrl: "/audio/sample_aster_story.wav",
    defaultPitch: 1.0,
    defaultRate: 0.98,
  },
  {
    id: "temesgen",
    nameAmharic: "ተመስገን አሰፋ",
    nameEnglish: "Temesgen Assefa",
    roleAmharic: "የትንታኔ እና የኢኮኖሚ ዘጋቢ",
    roleEnglish: "Chief Economic & Foreign Affairs Analyst",
    geminiVoice: "Charon",
    styleDirective: "Senior Ethiopian television economic and political analyst. Measured, calm, distinguished Amharic delivery with natural broadcast cadence, crystal-clear Addis Ababa pronunciation, warm baritone resonance, and dignified pacing. Zero robotic hesitation.",
    styleDirectiveEnglish: "Thoughtful, dignified financial news analyst delivering in standard international English.",
    gender: "male",
    avatarUrl: "/images/anchor_temesgen.jpg",
    description: "የተረጋጋ፣ ጥልቅና አሳማኝ የትንታኔ ድምፅ።",
    descriptionEnglish: "Measured, calm, and analytical delivery. Designed for business reports, market briefings, and deep-dive documentaries.",
    sampleText: "በዛሬው የትንታኔ ፕሮግራማችን የኢትዮጵያ ኢኮኖሚ የደረሰበትን የዕድገት ምዕራፍና የውጭ ምንዛሪ የገበያ ማሻሻያዎችን እንቃኛለን።",
    sampleTextEnglish: "Turning now to economic developments: markets have rallied today following the release of new trade data...",
    sampleAudioUrl: "/audio/sample_temesgen_analysis.wav",
    defaultPitch: 0.88,
    defaultRate: 0.94,
  },
  {
    id: "solomon",
    nameAmharic: "ሰሎሞን ግርማ",
    nameEnglish: "Solomon Girma",
    roleAmharic: "ሰበር እና ፈጣን ዜና ዘጋቢ",
    roleEnglish: "Breaking News & Live Correspondent",
    geminiVoice: "Puck",
    styleDirective: "Urgent, dynamic breaking news correspondent. Sharp, punchy Addis Ababa Amharic delivery with energetic television rhythm, crisp bilabial [b] pronunciation, and commanding broadcast momentum. Zero robotic stutter.",
    styleDirectiveEnglish: "Urgent, fast-paced breaking news reporter delivery with sharp inflection and commanding momentum.",
    gender: "male",
    avatarUrl: "/images/anchor_solomon.jpg",
    description: "ፈጣን፣ አስቸኳይ እና ቀልብ ገዢ የሰበር ዜና ስልት።",
    descriptionEnglish: "High-energy, urgent, dynamic pacing. Ideal for breaking bulletins and rapid-fire social media briefings.",
    sampleText: "ሰበር ዜና፤ አሁን በደረሰን ሰበር መረጃ መሠረት አዲስ ውሳኔ ተላልፏል! ዝርዝሩን ይዘን ተመልሰናል።",
    sampleTextEnglish: "Breaking news coming in right now: officials have confirmed a major breakthrough in international negotiations...",
    sampleAudioUrl: "/audio/sample_solomon_breaking.wav",
    defaultPitch: 0.96,
    defaultRate: 1.05,
  },
  {
    id: "sofia",
    nameAmharic: "ሶፊያ ኑረዲን",
    nameEnglish: "Sofia Nuredin",
    roleAmharic: "ማህበራዊና ባህል ዘጋቢ",
    roleEnglish: "Features & Culture Presenter",
    geminiVoice: "Zephyr",
    styleDirective: "Warm, expressive, articulate Ethiopian broadcaster for feature and cultural stories. Fluent, engaging standard Amharic with warm melodic inflection, natural breathing cadence, and friendly broadcast presence. Zero robotic monotone.",
    styleDirectiveEnglish: "Warm, expressive, articulate television feature presenter delivering in crisp English.",
    gender: "female",
    avatarUrl: "/images/anchor_sofia.jpg",
    description: "ሞቅ ያለ፣ ማራኪና አድማጭን የሚያቀርብ የማህበራዊ ታሪኮች ድምፅ። ለቪሎግ፣ ለፈጠራ እና ለማህበራዊ ጉዳዮች።",
    descriptionEnglish: "Warm, engaging, and melodic broadcast tone. Best for lifestyle, human interest stories, and media features.",
    sampleText: "በዛሬው የማህበራዊ ገጻችን አስደናቂ የስኬት ጉዞዎችን እና አዳዲስ ባህላዊ ሁነቶችን ወደ እናንተ እናደርሳለን።",
    sampleTextEnglish: "Welcome to today's feature story, exploring remarkable cultural innovations and inspiring journeys across the continent...",
    sampleAudioUrl: "/audio/sample_sofia_social.wav",
    defaultPitch: 1.0,
    defaultRate: 1.0,
  },
];

export const NEWS_PRESETS: NewsScriptPreset[] = [
  {
    id: "breaking_gerd",
    categoryAmharic: "🚨 ሰበር ዜና",
    categoryEnglish: "🚨 Breaking News",
    headlineAmharic: "ሰበር ዜና፡ ታላቁ የኢትዮጵያ ሕዳሴ ግድብ እና የኃይል ማመንጫ አዲስ ምዕራፍ",
    headlineEnglish: "BREAKING: Grand Ethiopian Renaissance Dam Powers Regional Energy Grid",
    contentAmharic: `ሰበር ዜና፤ 
የዜና አንባቢ ስቱዲዮው የሰዓቱን አበይት መረጃዎች ይዘንላችሁ ቀርበናል። 
በታላቁ የኢትዮጵያ ሕዳሴ ግድብ ተጨማሪ ተርባይኖች ኃይል ማመንጨት መጀመራቸውን የውኃና ኢነርጂ ሚኒስቴር ይፋ አድርጓል። 
ይህም የሀገሪቱን የኤሌክትሪክ ኃይል አቅርቦት በከፍተኛ ደረጃ እንደሚያሳድገውና ለጎረቤት ሀገራት የሚላከውን የኃይል መጠን እንደሚያጠናክረው ተገልጿል። 
ጠቅላይ ሚኒስትሩ በሰጡት መግለጫ የግድቡ ግንባታ የኢትዮጵያውያን የጋራ አሻራና የድል ምልክት መሆኑን አረጋግጠዋል። 
ዝርዝር መረጃዎችን በየሰዓቱ እናደርሳችኋለን፤ የዜና ስቱዲዮ አዲስ አበባ።`,
    contentEnglish: `Breaking news at this hour: 
The Ministry of Water and Energy has officially announced that additional commercial turbines have begun generating electricity at the Grand Ethiopian Renaissance Dam. 
Officials confirm this milestone will substantially elevate nationwide power generation capacity and expand green energy exports to neighboring nations across East Africa. 
The Prime Minister emphasized that this historic civil engineering achievement stands as an enduring emblem of national sovereignty and shared prosperity. 
Stay tuned for ongoing updates from our Addis Ababa news desk.`,
    recommendedAnchorId: "solomon",
    musicBed: "breaking",
    durationEstimateSec: 42,
  },
  {
    id: "prime_economy",
    categoryAmharic: "🏛️ አበይት ዜና",
    categoryEnglish: "🏛️ Economy & Prime",
    headlineAmharic: "የኢትዮጵያ ንግድ ባንክ እና የውጭ ምንዛሪ ገበያ አዳዲስ አፈጻጸሞች",
    headlineEnglish: "Commercial Bank of Ethiopia Reports Record Fiscal & Foreign Exchange Progress",
    contentAmharic: `እንደምን አመሻችሁ ክቡራትና ክቡራን፤ የሰዓቱ አበይት ዜናዎች ተጀምረዋል። 
የኢትዮጵያ ንግድ ባንክ በዛሬው ዕለት ይፋ ባደረገው መግለጫ፥ በፋይናንስ ዘርፉ የተወሰዱ የማሻሻያ ፖሊሲዎች አበረታች ውጤት እያስመዘገቡ መሆናቸውን አስታውቋል። 
በተለይም የውጭ ምንዛሪ አቅርቦት ፍሰት መሻሻል ማሳየቱና የቁጠባ ባህል ማደጉ ተመላክቷል። 
በሌላ በኩል የኢትዮጵያ ብሔራዊ ባንክ የዋጋ ንረትን ለመግታት የጀመራቸው ጥብቅ የገንዘብ ፖሊሲዎች ተጠናክረው እንደሚቀጥሉ አመልክቷል። 
ተጨማሪ ዘገባዎቻችን ይቀጥላሉ።`,
    contentEnglish: `Good evening and welcome to our prime business bulletin. 
The Commercial Bank of Ethiopia announced today that comprehensive macroeconomic and financial policy reforms are yielding significant positive results across the banking sector. 
Foreign exchange liquidity has registered remarkable improvements, accompanied by a surge in domestic savings and formal remittance channels. 
Concurrently, the National Bank reaffirmed its commitment to maintaining rigorous monetary discipline to curb inflation and protect purchasing power. 
More business coverage follows in tonight's broadcast.`,
    recommendedAnchorId: "dawit",
    musicBed: "prime",
    durationEstimateSec: 48,
  },
  {
    id: "tech_telecom",
    categoryAmharic: "📱 ቴክኖሎጂ እና ዲጂታል",
    categoryEnglish: "📱 Tech & Innovation",
    headlineAmharic: "የዲጂታል ኢትዮጵያ እና የቴሌኮም ቴክኖሎጂ አዳዲስ ስኬቶች",
    headlineEnglish: "Digital Ethiopia: Nationwide 5G Expansion and Fintech Transformation",
    contentAmharic: `የዲጂታል ኢትዮጵያን ጉዞ የሚያፋጥኑ አዳዲስ የቴክኖሎጂ መሰረተ-ልማቶች ይፋ ሆኑ። 
ኢትዮ ቴሌኮም በመላ ሀገሪቱ የ5ጂ ኔትወርክ ተደራሽነትን በማስፋፋት ዘመናዊ የክፍያ ስልቶችን ይበልጥ ቀልጣፋ ማድረጉን አስታውቋል። 
በተለይም ቴሌብር የገንዘብ ዝውውር ከሰማንያ በመቶ በላይ የህብረተሰብ ክፍልን የፋይናንስ ተጠቃሚ ማድረግ መቻሉ ተገልጿል። 
ይህም ለሀገራዊ የዲጂታል ኢኮኖሚ ሽግግር ትልቅ መነሳሳትን ፈጥሯል።`,
    contentEnglish: `Transformative technological infrastructure projects were unveiled today, accelerating the Digital Ethiopia roadmap. 
Ethio Telecom confirmed the nationwide expansion of its commercial 5G wireless network alongside upgraded digital payment systems. 
Financial inclusion has surpassed unprecedented records, with over eighty percent of eligible adults actively utilizing mobile financial ecosystems. 
Analysts praise this development as a foundational catalyst for startup entrepreneurship and tech-driven modernization.`,
    recommendedAnchorId: "aster",
    musicBed: "tech",
    durationEstimateSec: 38,
  },
  {
    id: "analysis_diplomacy",
    categoryAmharic: "🌍 ትንታኔና ዓለም አቀፍ",
    categoryEnglish: "🌍 World Analysis",
    headlineAmharic: "የአፍሪካ ቀንድ ዲፕሎማሲ እና የኢትዮጵያ የልማት ተምሳሌትነት",
    headlineEnglish: "Horn of Africa Diplomacy and Strategic Regional Integration",
    contentAmharic: `በዛሬው የትንታኔ እይታችን የኢትዮጵያን ቀጣናዊ የዲፕሎማሲ አቋም እንቃኛለን። 
ኢትዮጵያ በአፍሪካ ቀንድ የሰላምና የልማት አጋርነቷን በማጠናከር በቀጣናው የኢኮኖሚ ትስስር እንዲጎለብት የጀመረቻቸው ጥረቶች በዓለም አቀፉ ማህበረሰብ ዘንድ አድናቆትን እያተረፉ ነው። 
የባቡር፣ የመንገድና የኤሌክትሪክ መስመሮች ዝርጋታ የቀጣናውን የጋራ ተጠቃሚነት እያረጋገጡ መሆኑን ዲፕሎማቶች ገልጸዋል።`,
    contentEnglish: `In our diplomatic analysis tonight, we examine pivotal strategic developments across the Horn of Africa. 
Ethiopia's proactive engagement in fostering regional peace, multi-modal transport corridors, and shared green energy grids continues to earn commendation from international development partners. 
Diplomats emphasize that cross-border standard gauge railways and unified transmission interconnectors are forging enduring economic solidarity across the continent.`,
    recommendedAnchorId: "temesgen",
    musicBed: "analysis",
    durationEstimateSec: 45,
  },
  {
    id: "sports_league",
    categoryAmharic: "⚽ ስፖርት",
    categoryEnglish: "⚽ Sports Bulletin",
    headlineAmharic: "የኢትዮጵያ ፕሪሚየር ሊግ ሳምንታዊ ተጠባቂ ጨዋታዎች ውጤት",
    headlineEnglish: "Ethiopian Premier League Weekend Highlights and Title Race Action",
    contentAmharic: `ስፖርት ዜና፤ 
የኢትዮጵያ ፕሪሚየር ሊግ ተጠባቂ ጨዋታዎች በዛሬው ዕለት በተለያዩ ስታዲየሞች ተካሂደዋል። 
በአዲስ አበባ ስታዲየም የተደረገው የደረጃ ሰንጠረዥ አናት ጨዋታ በከፍተኛ ፉክክር ታጅቦ ተጠናቋል። 
ደጋፊዎች ባሳዩት ልዩ ድባብ የታጀበው ጨዋታ የሊጉን ፉክክር ይበልጥ እንዳሞቀው የስፖርት ዘጋቢያችን ያደረሰን ዘገባ ያመለክታል።`,
    contentEnglish: `In sports tonight: 
Electrifying encounters across the Ethiopian Premier League captivated football supporters today in packed regional stadiums. 
The top-of-the-table championship clash in Addis Ababa showcased breathtaking intensity, tactical brilliance, and dramatic late scoring. 
With passionate fans creating an unforgettable atmosphere, the championship race enters a thrilling, decisive phase.`,
    recommendedAnchorId: "sofia",
    musicBed: "tech",
    durationEstimateSec: 35,
  },
];
