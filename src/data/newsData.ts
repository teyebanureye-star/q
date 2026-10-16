import { VoiceAnchor, NewsScriptPreset } from "../types/studio";

export const FANA_ANCHORS: VoiceAnchor[] = [
  {
    id: "dawit",
    nameAmharic: "ዳዊት ከበደ",
    nameEnglish: "Dawit Kebede",
    roleAmharic: "ፋና አበይት ዜና አቅራቢ (Lead News Anchor)",
    geminiVoice: "Fenrir",
    styleDirective: "Flawless native standard Ethiopian Amharic broadcast news delivery. Speak with crisp, assertive Addis Ababa newsroom articulation. Strictly pronounce the consonant 'b' (በ, ቡ, ቢ, ባ, ቤ, ብ, ቦ) as an assertive voiced bilabial plosive [b] — for instance, 'ሰበር' is strictly articulated as crisp 'Se-ber' with a solid B, never 'Sever' or 'v'. Enforce natural Amharic gemination (ማጥበቅ), clear syllabic separation, and the authoritative baritone presence of senior television anchors at Fana Broadcasting Corporate (FBC). Zero robotic artifacts or foreign accent.",
    gender: "male",
    avatarUrl: "/images/anchor_dawit.jpg",
    description: "ጥልቅ፣ ግርማ ሞገስ ያለው እና አድማጭን የሚስብ የፋና አበይት ዜና ድምፅ። ለአበይት ፖለቲካዊ እና ሀገራዊ ዜናዎች ተመራጭ።",
    sampleText: "ሰላም ጤና ይስጥልኝ፤ የፋና ብሮድካስቲንግ ኮርፖሬት የዛሬውን አበይት ዜናዎች ይዘን ቀርበናል። በዋና ዋና ዜናዎቻችን...",
    sampleAudioUrl: "/audio/sample_dawit_news.wav",
    defaultPitch: 0.9,
    defaultRate: 0.96,
  },
  {
    id: "aster",
    nameAmharic: "አስቴር ማሞ",
    nameEnglish: "Aster Mamo",
    roleAmharic: "ፋና ዋና ዜና አቅራቢ (Prime Anchor)",
    geminiVoice: "Kore",
    styleDirective: "Flawless prime-time Ethiopian female television news anchor at Fana Broadcasting Corporate. Formal Addis Ababa standard Amharic. Strictly pronounce all 'b' syllables clearly as bilabial [b] (e.g. 'ሰበር' as crisp 'Se-ber', never 'v'). Fluent, poised, articulate broadcast diction with natural breathing cadence and zero robotic artifacts.",
    gender: "female",
    avatarUrl: "/images/anchor_aster.jpg",
    description: "ግልጽ፣ ጥርት ያለ እና የተከበረ የቴሌቪዥን ዋና ዜና አቀራረብ። ለሶሻል ሚዲያ አጫጭር ቪዲዮዎችና ዋና ዋና መግለጫዎች ምርጥ ምርጫ።",
    sampleText: "ክቡራትና ክቡራን፤ የሰዓቱን አበይት መረጃዎች ይዘንላችሁ ቀርበናል። እስከ ዝግጅታችን ፍጻሜ ድረስ አብራችሁን ቆዩ።",
    sampleAudioUrl: "/audio/sample_aster_story.wav",
    defaultPitch: 1.05,
    defaultRate: 0.98,
  },
  {
    id: "temesgen",
    nameAmharic: "ተመስገን አሰፋ",
    nameEnglish: "Temesgen Assefa",
    roleAmharic: "የትንታኔ እና የኢኮኖሚ ዘጋቢ (Senior Analyst)",
    geminiVoice: "Charon",
    styleDirective: "Senior Ethiopian television economic and political analyst at Fana Broadcasting Corporate. Measured, calm, distinguished Amharic delivery with crystal-clear Addis Ababa pronunciation. Crisp bilabial [b] plosives, natural gemination, and dignified broadcast pacing.",
    gender: "male",
    avatarUrl: "/images/anchor_temesgen.jpg",
    description: "የተረጋጋ፣ ጥልቅና አሳማኝ የትንታኔ ድምፅ። ለቢዝነስ፣ ለኢኮኖሚ እና ለረጅም ማብራሪያ ቪዲዮዎች ተስማሚ።",
    sampleText: "በዛሬው የትንታኔ ፕሮግራማችን የኢትዮጵያ ኢኮኖሚ የደረሰበትን የዕድገት ምዕራፍና የውጭ ምንዛሪ የገበያ ማሻሻያዎችን እንቃኛለን።",
    sampleAudioUrl: "/audio/sample_temesgen_analysis.wav",
    defaultPitch: 0.85,
    defaultRate: 0.92,
  },
  {
    id: "solomon",
    nameAmharic: "ሰሎሞን ግርማ",
    nameEnglish: "Solomon Girma",
    roleAmharic: "ሰበር እና ፈጣን ዜና ዘጋቢ (Breaking Reporter)",
    geminiVoice: "Puck",
    styleDirective: "Urgent, high-energy breaking news reporter at Fana Broadcasting Corporate. Sharp, punchy Addis Ababa Amharic inflection. Strictly pronounce 'ሰበር' as crisp 'Se-ber' with firm bilabial B, never 'v'. Dramatic, fast-paced live television delivery with crystal-clear diction.",
    gender: "male",
    avatarUrl: "/images/anchor_solomon.jpg",
    description: "ፈጣን፣ አስቸኳይ እና ቀልብ ገዢ የሰበር ዜና ስልት። ለቲክቶክ እና ለቴሌግራም አፋጣኝ ዜናዎች ተመራጭ።",
    sampleText: "ሰበር ዜና፤ አሁን በደረሰን ሰበር መረጃ መሠረት አዲስ ውሳኔ ተላልፏል! ዝርዝሩን ይዘን ተመልሰናል።",
    sampleAudioUrl: "/audio/sample_solomon_breaking.wav",
    defaultPitch: 0.95,
    defaultRate: 1.08,
  },
  {
    id: "sofia",
    nameAmharic: "ሶፊያ ኑረዲን",
    nameEnglish: "Sofia Nuredin",
    roleAmharic: "ማህበራዊና ባህል ዘጋቢ (Feature Anchor)",
    geminiVoice: "Zephyr",
    styleDirective: "Warm, articulate Ethiopian female broadcaster at Fana Television for cultural and social affairs. Natural, engaging Addis Ababa Amharic with crisp pronunciation, proper breathing cadence, and zero robotic hesitation.",
    gender: "female",
    avatarUrl: "/images/anchor_sofia.jpg",
    description: "ሞቅ ያለ፣ ማራኪና አድማጭን የሚያቀርብ የማህበራዊ ታሪኮች ድምፅ። ለቪሎግ፣ ለፈጠራ እና ለማህበራዊ ጉዳዮች።",
    sampleText: "በዛሬው የማህበራዊ ገጻችን አስደናቂ የስኬት ጉዞዎችን እና አዳዲስ ባህላዊ ሁነቶችን ወደ እናንተ እናደርሳለን።",
    sampleAudioUrl: "/audio/sample_sofia_social.wav",
    defaultPitch: 1.0,
    defaultRate: 0.98,
  },
];

export const NEWS_PRESETS: NewsScriptPreset[] = [
  {
    id: "breaking_gerd",
    categoryAmharic: "🚨 ሰበር ዜና",
    headlineAmharic: "ሰበር ዜና፡ ታላቁ የኢትዮጵያ ሕዳሴ ግድብ እና የኃይል ማመንጫ አዲስ ምዕራፍ",
    contentAmharic: `ሰበር ዜና፤ 
የፋና ብሮድካስቲንግ ኮርፖሬት የሰዓቱን አበይት መረጃዎች ይዘንላችሁ ቀርበናል። 
በታላቁ የኢትዮጵያ ሕዳሴ ግድብ ተጨማሪ ተርባይኖች ኃይል ማመንጨት መጀመራቸውን የውኃና ኢነርጂ ሚኒስቴር ይፋ አድርጓል። 
ይህም የሀገሪቱን የኤሌክትሪክ ኃይል አቅርቦት በከፍተኛ ደረጃ እንደሚያሳድገውና ለጎረቤት ሀገራት የሚላከውን የኃይል መጠን እንደሚያጠናክረው ተገልጿል። 
ጠቅላይ ሚኒስትሩ በሰጡት መግለጫ የግድቡ ግንባታ የኢትዮጵያውያን የጋራ አሻራና የድል ምልክት መሆኑን አረጋግጠዋል። 
ዝርዝር መረጃዎችን በየሰዓቱ እናደርሳችኋለን፤ ፋና ዜና አዲስ አበባ።`,
    recommendedAnchorId: "solomon",
    musicBed: "breaking",
    durationEstimateSec: 42,
  },
  {
    id: "prime_economy",
    categoryAmharic: "🏛️ አበይት ዜና",
    headlineAmharic: "የኢትዮጵያ ንግድ ባንክ እና የውጭ ምንዛሪ ገበያ አዳዲስ አፈጻጸሞች",
    contentAmharic: `እንደምን አመሻችሁ ክቡራትና ክቡራን፤ የፋና ዋና ዋና ዜናዎች ተጀምረዋል። 
የኢትዮጵያ ንግድ ባንክ በዛሬው ዕለት ይፋ ባደረገው መግለጫ፥ በፋይናንስ ዘርፉ የተወሰዱ የማሻሻያ ፖሊሲዎች አበረታች ውጤት እያስመዘገቡ መሆናቸውን አስታውቋል። 
በተለይም የውጭ ምንዛሪ አቅርቦት ፍሰት መሻሻል ማሳየቱና የቁጠባ ባህል ማደጉ ተመላክቷል። 
በሌላ በኩል የኢትዮጵያ ብሔራዊ ባንክ የዋጋ ንረትን ለመግታት የጀመራቸው ጥብቅ የገንዘብ ፖሊሲዎች ተጠናክረው እንደሚቀጥሉ አመልክቷል። 
ተጨማሪ ዘገባዎቻችን ይቀጥላሉ።`,
    recommendedAnchorId: "dawit",
    musicBed: "prime",
    durationEstimateSec: 48,
  },
  {
    id: "tech_telecom",
    categoryAmharic: "📱 ቴክኖሎጂ እና ዲጂታል",
    headlineAmharic: "የዲጂታል ኢትዮጵያ እና የቴሌኮም ቴክኖሎጂ አዳዲስ ስኬቶች",
    contentAmharic: `የዲጂታል ኢትዮጵያን ጉዞ የሚያፋጥኑ አዳዲስ የቴክኖሎጂ መሰረተ-ልማቶች ይፋ ሆኑ። 
ኢትዮ ቴሌኮም በመላ ሀገሪቱ የ5ጂ ኔትወርክ ተደራሽነትን በማስፋፋት ዘመናዊ የክፍያ ስልቶችን ይበልጥ ቀልጣፋ ማድረጉን አስታውቋል። 
በተለይም ቴሌብር የገንዘብ ዝውውር ከሰማንያ በመቶ በላይ የህብረተሰብ ክፍልን የፋይናንስ ተጠቃሚ ማድረግ መቻሉ ተገልጿል። 
ይህም ለሀገራዊ የዲጂታል ኢኮኖሚ ሽግግር ትልቅ መነሳሳትን ፈጥሯል።`,
    recommendedAnchorId: "aster",
    musicBed: "tech",
    durationEstimateSec: 38,
  },
  {
    id: "analysis_diplomacy",
    categoryAmharic: "🌍 ትንታኔና ዓለም አቀፍ",
    headlineAmharic: "የአፍሪካ ቀንድ ዲፕሎማሲ እና የኢትዮጵያ የልማት ተምሳሌትነት",
    contentAmharic: `በዛሬው የትንታኔ እይታችን የኢትዮጵያን ቀጣናዊ የዲፕሎማሲ አቋም እንቃኛለን። 
ኢትዮጵያ በአፍሪካ ቀንድ የሰላምና የልማት አጋርነቷን በማጠናከር በቀጣናው የኢኮኖሚ ትስስር እንዲጎለብት የጀመረቻቸው ጥረቶች በዓለም አቀፉ ማህበረሰብ ዘንድ አድናቆትን እያተረፉ ነው። 
የባቡር፣ የመንገድና የኤሌክትሪክ መስመሮች ዝርጋታ የቀጣናውን የጋራ ተጠቃሚነት እያረጋገጡ መሆኑን ዲፕሎማቶች ገልጸዋል።`,
    recommendedAnchorId: "temesgen",
    musicBed: "analysis",
    durationEstimateSec: 45,
  },
  {
    id: "sports_league",
    categoryAmharic: "⚽ ስፖርት",
    headlineAmharic: "የኢትዮጵያ ፕሪሚየር ሊግ ሳምንታዊ ተጠባቂ ጨዋታዎች ውጤት",
    contentAmharic: `ስፖርት ዜና፤ 
የኢትዮጵያ ፕሪሚየር ሊግ ተጠባቂ ጨዋታዎች በዛሬው ዕለት በተለያዩ ስታዲየሞች ተካሂደዋል። 
በአዲስ አበባ ስታዲየም የተደረገው የደረጃ ሰንጠረዥ አናት ጨዋታ በከፍተኛ ፉክክር ታጅቦ ተጠናቋል። 
ደጋፊዎች ባሳዩት ልዩ ድባብ የታጀበው ጨዋታ የሊጉን ፉክክር ይበልጥ እንዳሞቀው የስፖርት ዘጋቢያችን ያደረሰን ዘገባ ያመለክታል።`,
    recommendedAnchorId: "sofia",
    musicBed: "tech",
    durationEstimateSec: 35,
  },
];
