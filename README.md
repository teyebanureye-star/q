# Fana Voice News Studio - የፋና ዜና ድምፅ ስቱዲዮ

ፕሮፌሽናል የኢትዮጵያ ዜና እና ሶሻል ሚዲያ ድምፅ ማመንጫ ስቱዲዮ - በፋና ጋዜጠኞች ስልት የተፃፈውን የሚያነብ የዜና ፕሮዳክሽን።

ይህ መተግበሪያ ስቴዲዮ ለሌላቸው የቲክቶክ፣ የቴሌግራም፣ የፌስቡክ እና የዩቲዩብ ዜና አዘጋጆች የተፃፈውን ጽሑፍ በፋና ጋዜጠኞች ተፈጥሯዊ የዜና አቀራረብ ስልት እንዲያነብላቸው የተዘጋጀ ዘመናዊ የድምፅ ስቱዲዮ ነው።

---

## 🎙️ ዋና ዋና ገጽታዎች (Features)

1. **የፋና ዜና ጋዜጠኞች ተፈጥሯዊ ድምፆች (News Anchors)**
   - **ዳዊት ከበደ** — ፋና አበይት ዜና (ጥልቅ እና ባለስልጣን ባሪቶን የዜና ድምፅ)
   - **አስቴር ማሞ** — ፋና ዋና ዜና (ግልጽ፣ ጥርት ያለ እና የተከበረ የቴሌቪዥን ምሽት ዜና)
   - **ተመስገን አሰፋ** — የትንታኔና የኢኮኖሚ ዘጋቢ (የተረጋጋና ጥልቅ የትንታኔ ድምፅ)
   - **ሰሎሞን ግርማ** — ሰበር እና ፈጣን ዜና (አፋጣኝ የሰበር ዜና ስልት)
   - **ሶፊያ ኑረዲን** — ማህበራዊና ባህል ዘጋቢ (ሞቅ ያለ የማህበራዊ ታሪኮች ድምፅ)

2. **የጀርባ ዜና ሙዚቃዎች እና አውቶ-ዳኪንግ (Studio Music Beds & Auto-Ducking)**
   - የሰበር ዜና የመግቢያ ጅንግል (Intro Stinger)
   - የሰበር፣ የዋና ዜና፣ የትንታኔ እና የቴክኖሎጂ ዜማዎች
   - ጋዜጠኛው ሲያነብ የጀርባ ሙዚቃው በራስ-ሰር የሚቀንስበት (Auto-Ducking) ቴክኖሎጂ
   - ድምፅ ብቻ (Dry Vocals) ለካፕከት ወይም ፕሪሚየር ኤዲቲንግ

3. **የአማርኛ አነባበብ እና አጽህሮተ-ቃላት ማስተካከያ (Phonetic Normalizer)**
   - እንደ «ጠ/ሚ»፣ «ዶ/ር»፣ «ብር»፣ «ኪ.ሜ» የመሳሰሉትን ቃላት በራስ-ሰር ወደ «ጠቅላይ ሚኒስትር»፣ «ዶክተር»፣ «የኢትዮጵያ ብር» ይቀይራል።
   - በፋና ስልት አሳምር (AI News Polisher)።

4. **ቀጥታ ቴሌፕሮምፕተር (Live Teleprompter)**
   - በሞባይል ፊት ለፊት ካሜራ እየተቀረጹ ዜናውን አብረው ለማንበብ የሚረዳ የሙሉ ስክሪን ቴሌፕሮምፕተር።

5. **ድምፅ ማውረጃ (.WAV Export)**
   - የተሟላውን የተቀላቀለ ድምፅ (ጋዜጠኛ + ጅንግል + ሙዚቃ) በከፍተኛ ጥራት (.WAV) ማውረጃ።

---

## 🚀 አጠቃቀም (Getting Started)

### 1. መስፈርቶች
- [Node.js](https://nodejs.org) (v18 ወይም ከዚያ በላይ)
- npm ወይም pnpm ወይም yarn

### 2. መጫን (Installation)
```bash
# ዲፔንደንሲዎችን መጫን
npm install
```

### 3. ማስኬድ (Run Development Server)
```bash
npm run dev
```
ብሮውዘርዎን ከፍተው `http://localhost:3000` ላይ ይጠቀሙ!

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🛠️ ቴክኖሎጂዎች (Tech Stack)
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Web Audio API
- **Backend**: Node.js, Express, tsx
- **Speech Engine**: Gemini 3.8 Flash Lite TTS + Web Speech Engine fallback
- **Design Constitution**: Fana Broadcasting Corporate Obsidian & Gold Newsroom Theme
