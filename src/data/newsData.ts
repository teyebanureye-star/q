import { VoiceAnchor, NewsScriptPreset } from "../types/studio";

export const FANA_ANCHORS: VoiceAnchor[] = [
  {
    id: "dawit",
    nameAmharic: "ዳዊት ከበደ",
    nameEnglish: "Dawit Kebede",
    roleAmharic: "ፋና አበይት ዜና አቅራቢ (Lead News Anchor)",
    geminiVoice: "Fenrir",
    styleDirective: "Prestigious senior Ethiopian television news anchor at Fana Broadcasting Corporate (FBC), reading prime-time Amharic news with deep, commanding baritone, authoritative cadence, and natural newsroom solemnity.",
    gender: "male",
    avatarUrl: "/src/assets/images/fana_male_anchor_1792062316589.jpg",
    description: "ጥልቅ፣ ግርማ ሞገስ ያለው እና አድማጭን የሚስብ የፋና አበይት ዜና ድምፅ። ለአበይት ፖለቲካዊ እና ሀገራዊ ዜናዎች ተመራጭ።",
    sampleText: "ሰላም ጤና ይስጥልኝ፤ የፋና ብሮድካስቲንግ ኮርፖሬት የዛሬውን አበይት ዜናዎች ይዘን ቀርበናል። በዋና ዋና ዜናዎቻችን...",
    defaultPitch: 0.9,
    defaultRate: 0.96,
  },
  {
    id: "aster",
    nameAmharic: "አስቴር ማሞ",
    nameEnglish: "Aster Mamo",
    roleAmharic: "ፋና ዋና ዜና አቅራቢ (Prime Anchor)",
    geminiVoice: "Kore",
    styleDirective: "Prestigious Ethiopian female prime-time news anchor at Fana Television, speaking formal Amharic fluently with articulate, poised, clear broadcast tone and natural phrasing.",
    gender: "female",
    avatarUrl: "/src/assets/images/fana_female_anchor_1792062309325.jpg",
    description: "ግልጽ፣ ጥርት ያለ እና የተከበረ የቴሌቪዥን ዋና ዜና አቀራረብ። ለሶሻል ሚዲያ አጫጭር ቪዲዮዎችና ዋና ዋና መግለጫዎች ምርጥ ምርጫ።",
    sampleText: "ክቡራትና ክቡራን፤ የሰዓቱን አበይት መረጃዎች ይዘንላችሁ ቀርበናል። እስከ ዝግጅታችን ፍጻሜ ድረስ አብራችሁን ቆዩ።",
    defaultPitch: 1.05,
    defaultRate: 0.98,
  },
  {
    id: "temesgen",
    nameAmharic: "ተመስገን አሰፋ",
    nameEnglish: "Temesgen Assefa",
    roleAmharic: "የትንታኔ እና የኢኮኖሚ ዘጋቢ (Senior Analyst)",
    geminiVoice: "Charon",
    styleDirective: "Thoughtful, dignified Ethiopian broadcast journalist providing economic analysis and in-depth investigative reports with a calm, analytical, and measured Amharic delivery.",
    gender: "male",
    avatarUrl: "/src/assets/images/fana_male_anchor_1792062316589.jpg",
    description: "የተረጋጋ፣ ጥልቅና አሳማኝ የትንታኔ ድምፅ። ለቢዝነስ፣ ለኢኮኖሚ እና ለረጅም ማብራሪያ ቪዲዮዎች ተስማሚ።",
    sampleText: "በዛሬው የትንታኔ ፕሮግራማችን የኢትዮጵያ ኢኮኖሚ የደረሰበትን የዕድገት ምዕራፍና የውጭ ምንዛሪ የገበያ ማሻሻያዎችን እንቃኛለን።",
    defaultPitch: 0.85,
    defaultRate: 0.92,
  },
  {
    id: "solomon",
    nameAmharic: "ሰሎሞን ግርማ",
    nameEnglish: "Solomon Girma",
    roleAmharic: "ሰበር እና ፈጣን ዜና ዘጋቢ (Breaking Reporter)",
    geminiVoice: "Puck",
    styleDirective: "Urgent, brisk, high-energy breaking news reporter delivering on-the-scene live field dispatches and urgent news flashes with punchy Amharic inflection.",
    gender: "male",
    avatarUrl: "/src/assets/images/fana_male_anchor_1792062316589.jpg",
    description: "ፈጣን፣ አስቸኳይ እና ቀልብ ገዢ የሰበር ዜና ስልት። ለቲክቶክ እና ለቴሌግራም አፋጣኝ ዜናዎች ተመራጭ።",
    sampleText: "ሰበር ዜና፤ አሁን በደረሰን ሰበር መረጃ መሠረት አዲስ ውሳኔ ተላልፏል! ዝርዝሩን ይዘን ተመልሰናል።",
    defaultPitch: 0.95,
    defaultRate: 1.08,
  },
  {
    id: "sofia",
    nameAmharic: "ሶፊያ ኑረዲን",
    nameEnglish: "Sofia Nuredin",
    roleAmharic: "ማህበራዊና ባህል ዘጋቢ (Feature Anchor)",
    geminiVoice: "Zephyr",
    styleDirective: "Warm, articulate Ethiopian female broadcaster with an engaging, storytelling tone for culture, social affairs, tourism, and human interest stories.",
    gender: "female",
    avatarUrl: "/src/assets/images/fana_female_anchor_1792062309325.jpg",
    description: "ሞቅ ያለ፣ ማራኪና አድማጭን የሚያቀርብ የማህበራዊ ታሪኮች ድምፅ። ለቪሎግ፣ ለፈጠራ እና ለማህበራዊ ጉዳዮች።",
    sampleText: "በዛሬው የማህበራዊ ገጻችን አስደናቂ የስኬት ጉዞዎችን እና አዳዲስ ባህላዊ ሁነቶችን ወደ እናንተ እናደርሳለን።",
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
