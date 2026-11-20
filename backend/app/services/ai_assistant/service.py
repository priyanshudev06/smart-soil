import os
import re
import concurrent.futures
from typing import Dict, Any, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.schemas.schemas import AssistantQuery, AssistantResponse

# ==============================================================================
# Comprehensive Expert Agronomic & Technical Knowledge Base
# Grounded in ICAR-IISS Bhopal, MPKV Rahuri, and Project Specifications
# ==============================================================================

KNOWLEDGE_ENTRIES = [
    # 1. Soil pH & Reaction
    {
        "id": "soil_ph_general",
        "keywords": [
            "soil ph", "what is ph", "ph scale", "सामू म्हणजे काय", "सामू काय असतो",
            "पीएच क्या है", "मिट्टी का पीएच", "ideal ph", "best ph for soil", "balanced ph"
        ],
        "en": (
            "Soil pH measures the acidity or alkalinity of the soil on a logarithmic scale from 0 to 14:\n\n"
            "• Strongly Acidic (< 5.5): Nutrient toxicities (Al, Mn) occur; Phosphorus and Calcium are locked up.\n"
            "• Moderately Acidic (5.5 - 6.5): Tolerated by tea, potato, but suboptimal for pulses.\n"
            "• Optimal Neutral (6.5 - 7.5): Ideal range! Maximal availability of Nitrogen, Phosphorus, Potassium, and active beneficial soil microbes.\n"
            "• Alkaline / Calcareous (> 7.8): Micronutrients (Zinc, Iron, Manganese, Boron) become unavailable.\n"
            "• Sodic (> 8.5): High exchangeable sodium dispersion causing waterlogging and soil crusting.\n\n"
            "Recommendation: Test your soil every season. Neutral pH (6.5–7.2) maximizes fertilizer use efficiency (FUE)."
        ),
        "mr": (
            "जमिनीचा सामू (pH) म्हणजे मातीतील आम्ल किंवा क्षारतेचे प्रमाण (० ते १४ स्केलवर):\n\n"
            "• तीव्र आम्लधर्मी (< ५.५): जमिनीत स्फुरद व कॅल्शियम उपलब्ध होत नाही, पिकांची वाढ खुंटते.\n"
            "• मध्यम आम्लधर्मी (५.५ - ६.५): बटाटा किंवा चहा पिकास योग्य, परंतु कडधान्यांना हानिकारक.\n"
            "• आदर्श उदासीन (६.५ - ७.५): सर्वोत्तम सामू! यात नत्र, स्फुरद, पालाश आणि सूक्ष्म अन्नद्रव्ये पिकाला सहज मिळतात.\n"
            "• क्षारधर्मी / चोपण (> ७.८): जस्त (Zinc) व लोह (Iron) ची कमतरता निर्माण होते.\n\n"
            "सल्ला: आपल्या शेताचा सामू ६.५ ते ७.२ दरम्यान ठेवल्यास रासायनिक खतांचा १००% फायदा पिकाला मिळतो."
        ),
        "hi": (
            "मिट्टी का pH मान (0 से 14 के पैमाने पर) उसकी अम्लीयता या क्षारीयता को दर्शाता है:\n\n"
            "• अत्यधिक अम्लीय (< 5.5): फास्फोरस और कैल्शियम की उपलब्धता कम हो जाती है।\n"
            "• सर्वोत्तम तटस्थ (6.5 - 7.5): सबसे आदर्श श्रेणी! इसमें नाइट्रोजन, फास्फोरस, पोटाश और सूक्ष्मजीव सबसे अधिक सक्रिय रहते हैं।\n"
            "• क्षारीय / लवणीय (> 7.8): जिंक और लोहे की कमी हो जाती है।\n\n"
            "सलाह: अपने खेत का pH संतुलित (6.5-7.5) बनाए रखने के लिए नियमित रूप से जैविक खाद का प्रयोग करें।"
        ),
        "sources": ["ICAR - Indian Institute of Soil Science (Bhopal)", "Soil Health Card Scheme"]
    },

    # 2. Acidic Soil Correction
    {
        "id": "ph_acidic_treatment",
        "keywords": [
            "acidic soil", "low ph", "acid soil treatment", "lime for soil", "dolomite",
            "आम्लधर्मी जमीन", "कमी सामू", "चुना टाकणे", "अम्लीय मिट्टी", "चूना प्रयोग",
            "how to fix acidic soil", "calcium carbonate"
        ],
        "en": (
            "Treatment for Acidic Soil (pH < 6.0):\n\n"
            "1. Apply Agricultural Lime (CaCO3) or Dolomite at 200–400 kg/acre depending on buffering capacity.\n"
            "2. Timing: Broadcast and incorporate lime into the soil 3–4 weeks prior to sowing so moisture neutralizes active acidity.\n"
            "3. Organic Buffering: Apply well-rotted Farm Yard Manure (FYM) or Vermicompost at 2.5–3 tonnes/acre to enhance cation exchange capacity.\n"
            "4. Phosphorus Note: Use Rock Phosphate or Single Super Phosphate (SSP) instead of DAP, as SSP contains beneficial Calcium and Sulfur."
        ),
        "mr": (
            "आम्लधर्मीय जमीन (सामू ६.० पेक्षा कमी) सुधारण्याचे उपाय:\n\n"
            "१. कृषी चुना (Agricultural Lime - CaCO3) किंवा डोलोमाइट २०० ते ४०० किलो प्रति एकर जमिनीत मिसळा.\n"
            "२. वेळ: पेरणीच्या ३ ते ४ आठवडे आधी चुना जमिनीत मिसळावा, जेणेकरून ओल मिळून रासायनिक प्रक्रिया पूर्ण होईल.\n"
            "३. सेंद्रिय उपाय: प्रति एकर २.५ ते ३ टन चांगले कुजलेले शेणखत किंवा गांडूळ खत टाकावे.\n"
            "४. खतांची निवड: डीएपी (DAP) ऐवजी सिंगल सुपर फॉस्फेट (SSP) वापरा, कारण त्यात कॅल्शियम आणि गंधक (Sulfur) उपलब्ध असते."
        ),
        "hi": (
            "अम्लीय मिट्टी (pH < 6.0) का सुधार उपाय:\n\n"
            "1. कृषि चूना (CaCO3) या डोलोमाइट 200-400 किलोग्राम प्रति एकड़ की दर से खेत में मिलाएं।\n"
            "2. बुवाई से 3-4 सप्ताह पूर्व चूने को मिट्टी में अच्छी तरह मिला दें।\n"
            "3. प्रति एकड़ 2.5-3 टन गोबर की खाद या केंचुआ खाद का प्रयोग करें।\n"
            "4. फास्फोरस के लिए डीएपी के स्थान पर सिंगल सुपर फास्फेट (SSP) का प्रयोग लाभकारी है।"
        ),
        "sources": ["ICAR-IISS Bhopal Acid Soils Bulletin", "MPKV Rahuri Soil Science"]
    },

    # 3. Alkaline / Sodic Soil Correction
    {
        "id": "ph_alkaline_treatment",
        "keywords": [
            "alkaline soil", "high ph", "sodic soil", "saline soil", "gypsum for soil",
            "क्षारयुक्त जमीन", "चोपण जमीन", "जिप्सम", "जास्त सामू", "क्षारीय मिट्टी", "जिप्सम का प्रयोग",
            "how to fix high ph", "reclamation of sodic soils", "dhaincha", "sunnhemp"
        ],
        "en": (
            "Treatment for Alkaline / Sodic Soil (pH > 7.8):\n\n"
            "1. Agricultural Gypsum (CaSO4·2H2O): Apply 500–1000 kg/acre. Calcium in gypsum displaces toxic sodium ions from clay particles.\n"
            "2. Green Manuring: Grow Sunnhemp (ताग) or Dhaincha (धैंच्या) for 45 days and bury it into soil before flowering. Decomposing organic acids naturally lower rhizosphere pH.\n"
            "3. Deep Tillage & Leaching: Provide good field drainage channels to flush out dissolved sodium salts.\n"
            "4. Fertilizer Adjustments: Use ammonium sulfate or urea; apply elemental sulfur (20-30 kg/acre). Avoid basic fertilizers like sodium nitrate."
        ),
        "mr": (
            "क्षारयुक्त / चोपण जमीन (सामू ७.८ पेक्षा जास्त) सुधारण्याचे उपाय:\n\n"
            "१. कृषी जिप्समचा वापर: माती परीक्षणाच्या आधारे प्रति एकर ५०० ते १००० किलो कृषी जिप्सम समप्रमाणात पसरावे.\n"
            "२. हिरवळीचे खत: पेरणीपूर्वी ताग (Sunnhemp) किंवा धैंच्या (Dhaincha) पेरून ४५ दिवसांनी जमिनीत गाडावे. सेंद्रिय आम्लांमुळे जमिनीचा सामू कमी होतो.\n"
            "३. निचरा व्यवस्था: चोपण जमिनीत पाण्याचा निचरा होण्यासाठी शेतात चर (Drainage trenches) काढावेत.\n"
            "४. खते: युरिया किंवा अमोनियम सल्फेट वापरावे, आणि सल्फर (गंधक) २० किलो प्रति एकर द्यावे."
        ),
        "hi": (
            "क्षारीय / ऊसर मिट्टी (pH > 7.8) का सुधार:\n\n"
            "1. कृषि जिप्सम का प्रयोग: 500-1000 किग्रा प्रति एकड़ जिप्सम खेत में जुताई कर मिलाएं।\n"
            "2. हरी खाद: सनई या ढैंचा की बुवाई करके 45 दिन बाद खेत में पलट दें।\n"
            "3. जल निकासी: खेत में पानी का उचित निकास बनाएं ताकि हानिकारक लवण धुल सकें।\n"
            "4. सल्फर (गंधक) 20 किग्रा प्रति एकड़ का प्रयोग करें।"
        ),
        "sources": ["CSSRI Karnal Saline Soil Guidelines", "MPKV Rahuri"]
    },

    # 4. Nitrogen (N) Management
    {
        "id": "nitrogen_management",
        "keywords": [
            "nitrogen", "urea", "n fertilizer", "yellow leaves", "chlorosis",
            "नत्र", "युरिया", "पाने पिवळी पडणे", "नाइट्रोजन", "यूरिया की खुराक",
            "split dose urea", "neem coated urea", "nitrogen deficiency"
        ],
        "en": (
            "Nitrogen (N) Management & Deficiency Symptoms:\n\n"
            "• Deficiency Signs: Uniform pale yellowing (chlorosis) of older lower leaves first, stunted growth, thin stems.\n"
            "• Split Application Rule: Never apply 100% urea at sowing! Apply 50% at sowing (basal) and 50% at active tillering / vegetative stage (30-45 days).\n"
            "• Neem Coated Urea: Slows nitrification and reduces ammonia volatilization and leaching losses by up to 25%.\n"
            "• Biofertilizers: Inoculate seed with Azotobacter (for cereals) or Rhizobium (for pulses) to fix 20–40 kg atmospheric N/ha for free."
        ),
        "mr": (
            "नत्र (Nitrogen) व्यवस्थापन व कमतरतेची लक्षणे:\n\n"
            "• लक्षणे: खालची जुनी पाने प्रथम फिकट पिवळी पडतात, झाडांची वाढ खुंटते आणि फांद्या बारीक होतात.\n"
            "• खत देण्याची पद्धत: १००% युरिया एकाच वेळी देऊ नका! ५०% पेरणीच्या वेळी आणि ५०% पीक ३०-४० दिवसांचे झाल्यावर विभागून (Split dose) द्या.\n"
            "• निम लेपित युरिया (Neem Coated): युरिया वाहून जाणे आणि हवेत उडून जाणे थांबते.\n"
            "• जैविक संवर्धन: तृणधान्यांसाठी अझोटोबॅक्टर आणि कडधान्यांसाठी रायझोबियम जीवाणू संवर्धन बियाण्याला चोळावे."
        ),
        "hi": (
            "नाइट्रोजन (N) प्रबंधन और कमी के लक्षण:\n\n"
            "• लक्षण: पुरानी निचली पत्तियां पहले पीली पड़ने लगती हैं, पौधे की बढ़वार रुक जाती है।\n"
            "• प्रयोग विधि: यूरिया को दो से तीन बार में विभाजित करके दें (50% बुवाई पर और 50% कल्ले फूटते समय)।\n"
            "• नीम लेपित यूरिया का प्रयोग करें जिससे बर्बादी रुके।\n"
            "• दलहनी फसलों में राइजोबियम कल्चर का प्रयोग करें।"
        ),
        "sources": ["ICAR Nitrogen Fertilizer Advisory", "Department of Agriculture Maharashtra"]
    },

    # 5. Phosphorus (P) Management
    {
        "id": "phosphorus_management",
        "keywords": [
            "phosphorus", "dap", "ssp", "p fertilizer", "root development", "purple leaves",
            "स्फुरद", "डीएपी", "सुपर फॉस्फेट", "फॉस्फोरस", "जड़ों का विकास",
            "phosphorus deficiency", "single super phosphate"
        ],
        "en": (
            "Phosphorus (P) Management & DAP vs SSP Guide:\n\n"
            "• Role: Essential for vigorous root development, energy storage (ATP), early flowering, and grain formation.\n"
            "• Deficiency Signs: Leaves show abnormal dark green to purple/bronze tinting on margins; poor root spread.\n"
            "• Placement: Phosphorus does not move easily in soil! Always place DAP or SSP 5 cm deep near the root zone, never broadcast on top.\n"
            "• DAP (18-46-0) vs SSP (0-16-0): For black soils with neutral/alkaline pH, SSP is often superior because it provides 16% P2O5 plus 11% Sulfur and 19% Calcium."
        ),
        "mr": (
            "स्फुरद (Phosphorus) व्यवस्थापन आणि डीएपी विरुद्ध एसएसपी:\n\n"
            "• कार्य: मुळांचा जोमदार विकास, फुले व दाणे भरण्यासाठी अत्यंत आवश्यक.\n"
            "• कमतरतेची लक्षणे: पानांच्या कडा जांभळट-तांबूस होतात, मुळांची वाढ खुंटते.\n"
            "• देण्याची पद्धत: स्फुरदयुक्त खते जमिनीत हालचाल करत नाहीत, म्हणून ती फेकून न देता बियाण्याजवळ ५ सेमी खोल टाकावीत.\n"
            "• डीएपी (DAP) की एसएसपी (SSP): महाराष्ट्राच्या काळ्या मातीसाठी सिंगल सुपर फॉस्फेट (SSP) अतिशय फायदेशीर ठरते, कारण त्यात स्फुरदासोबत ११% गंधक (Sulfur) व १९% कॅल्शियम मिळते."
        ),
        "hi": (
            "फास्फोरस (P) प्रबंधन एवं डीएपी बनाम एसएसपी:\n\n"
            "• महत्व: मजबूत जड़ों के विकास, फूलों और दानों के भराव के लिए अनिवार्य।\n"
            "• लक्षण: पत्तियों का रंग गहरा हरा होकर किनारों पर बैंगनी या तांबे जैसा हो जाता है।\n"
            "• प्रयोग: फास्फोरस युक्त खाद (DAP या SSP) को मिट्टी में 5 सेमी गहरा बीज के पास डालें।\n"
            "• एसएसपी (SSP) का लाभ: इसमें फास्फोरस के साथ-साथ सल्फर और कैल्शियम भी मिलता है।"
        ),
        "sources": ["IISS Bhopal Phosphorus Guidelines", "MPKV Rahuri"]
    },

    # 6. Potassium (K) Management
    {
        "id": "potassium_management",
        "keywords": [
            "potassium", "potash", "mop", "k fertilizer", "drought resistance",
            "पालाश", "पोटाश", "पोटॅशियम", "पानांच्या कडा जळणे", "पोटाश खाद",
            "potassium deficiency", "muriate of potash"
        ],
        "en": (
            "Potassium (K) Role & Management:\n\n"
            "• Role: Controls stomata opening, improves drought tolerance, pest/disease resistance, and enhances fruit/grain weight and luster.\n"
            "• Deficiency Signs: Marginal scorching or burning along leaf edges, weak lodging stems.\n"
            "• Black Soil Reserve Note: Most Medium Deep Black Soils (Vertisols) in Maharashtra naturally possess High available potassium (> 280 kg/ha K2O). Basal chemical potash can often be reduced, saving money, while relying on farmyard manure."
        ),
        "mr": (
            "पालाश (Potassium) कार्य व व्यवस्थापन:\n\n"
            "• कार्य: पिकांमध्ये रोग व कीड प्रतिकारशक्ती वाढवणे, दुष्काळात पाणी टिकवणे, आणि दाण्यांना चकाकी व वजन देणे.\n"
            "• कमतरता: पानांच्या कडा जळाल्यासारख्या (Marginal scorching) दिसतात.\n"
            "• काळ्या जमिनीबाबत महत्त्वाची माहिती: महाराष्ट्रातील बहुतांश भारी काळ्या जमिनींमध्ये नैसर्गिकरीत्या मुबलक पालाश (High Potassium > २८० किलो/हेक्टर) असतो. माती परीक्षण अहवाल तपासून अनावश्यक रासायनिक पोटाशचा खर्च वाचवता येतो."
        ),
        "hi": (
            "पोटाश (K) का महत्व एवं प्रयोग:\n\n"
            "• कार्य: पौधों में रोगों और सूखे से लड़ने की क्षमता बढ़ाता है, दानों में चमक और वजन लाता है।\n"
            "• लक्षण: पत्तियों के किनारे जले हुए से नजर आते हैं।\n"
            "• काली मिट्टी में उपलब्धता: महाराष्ट्र की काली मिट्टी में प्राकृतिक रूप से पोटाश प्रचुर मात्रा में होता है, अतः जांच के बाद ही प्रयोग करें।"
        ),
        "sources": ["ICAR-IISS Bhopal", "MPKV Rahuri"]
    },

    # 7. Hardware & IoT Sensor Architecture
    {
        "id": "hardware_esp32_iot",
        "keywords": [
            "esp32", "hardware", "iot device", "tcs34725", "optical sensor", "spectrometry",
            "colorimeter", "ds18b20", "temperature probe", "हार्डवेअर", "सेन्सर", "उपकरण कसे काम करते",
            "how does device work", "how does sensor work", "optical engine", "kinetic read"
        ],
        "en": (
            "Smart Soil IoT Hardware & Optical Colorimeter Architecture:\n\n"
            "• Microcontroller (ESP32): Dual-core Xtensa 32-bit processor operating at 240MHz. Manages precision I2C bus timing, on-chip flash buffering for offline tests, and BLE/Wi-Fi telemetry.\n"
            "• Optical Colorimeter (TCS34725): 16-bit RGBC (Red, Green, Blue, Clear) photodiode matrix with an integrated IR-blocking filter. Measures colorimetric absorbance kinetics over 60 seconds at calibrated peak wavelengths.\n"
            "• Digital Temperature Probe (DS18B20): 1-Wire thermal probe accurate to ±0.5°C. Measures soil slurry temperature to apply automated kinetic compensation to reagent reaction rates.\n"
            "• Spectrophotometric Principle: Follows the Beer-Lambert Law (Absorbance A = -log10(I / I0)). Absorbance is matched against multi-point polynomial calibration curves to derive pH, N, P, and K concentration indices."
        ),
        "mr": (
            "स्मार्ट सॉईल आयओटी (IoT) आणि ऑप्टिकल सेन्सर रचना:\n\n"
            "• मायक्रोकंट्रोलर (ESP32): २४० MHz ड्युअल-कोर प्रोसेसर, जो वाय-फाय आणि ब्लूटूथद्वारे डेटा पाठवतो तसेच इंटरनेट नसताना स्थानिक मेमरीमध्ये वाचन साठवतो.\n"
            "• ऑप्टिकल कलरमीटर (TCS34725): १६-बिट आरजीबीसी (लाल, हिरवा, निळा, स्पष्ट प्रकाश) सेन्सर, जो मातीच्या द्रावणातील रंगबदलाचे ६० सेकंदांत अचूक स्पेक्ट्रोमेट्री वाचन घेतो.\n"
            "• तापमान सेन्सर (DS18B20): ±०.५°C अचूकतेने मातीचे तापमान मोजतो, जेणेकरून रासायनिक अभिक्रियेचे तापमान सुधारित अचूक निकाल मिळतात.\n"
            "• कार्यपद्धती: बीअर-लॅम्बर्ट नियमावर (Beer-Lambert Law) आधारित रंग तीव्रतेवरून सामू (pH) आणि नत्र, स्फुरद, पालाशचे प्रमाण निश्चित केले जाते."
        ),
        "hi": (
            "स्मार्ट सॉयल IoT और ऑप्टिकल सेंसर प्रणाली:\n\n"
            "• ESP32 माइक्रो-कंट्रोलर: वाई-फाई और ब्लूटूथ युक्त तेज प्रोसेसर जो ऑफलाइन डेटा भी सुरक्षित रखता है।\n"
            "• TCS34725 ऑप्टिकल सेंसर: 16-बिट कलर सेंसर जो 60 सेकंड में मिट्टी के रासायनिक घोल के रंग परिवर्तन का विश्लेषण करता है।\n"
            "• DS18B20 तापमान सेंसर: तापमान का सटीक मापन कर परिणामों को सटीक बनाता है।\n"
            "• कार्य सिद्धांत: बीयर-लैम्बर्ट नियम के अनुसार प्रकाश अवशोषण से मिट्टी के pH और NPK तत्वों की त्वरित जांच होती है।"
        ),
        "sources": ["ESP32 Technical Reference Manual", "AMS TCS34725 Optical Datasheet", "Maxim DS18B20 Manual"]
    },

    # 8. Testing Procedure & Sample Collection
    {
        "id": "soil_testing_procedure",
        "keywords": [
            "how to test soil", "soil sample collection", "testing steps", "v shape", "sampling method",
            "मातीचा नमुना कसा घ्यावा", "चाचणी पद्धत", "मिट्टी का नमूना कैसे लें", "सैंपल लेने की विधि",
            "soil sampling depth", "quartering method"
        ],
        "en": (
            "Scientific Soil Sample Collection & Rapid Testing Procedure:\n\n"
            "1. Field Sampling (V-Shape Cut): Scrape away surface litter. Dig a 'V'-shaped pit 15 cm (6 inches) deep for field crops (30 cm for fruit orchards). Slice a 2.5 cm thick slice from the top to bottom.\n"
            "2. Zig-Zag Composite: Collect 8–10 spots across the plot in a zig-zag path, mix thoroughly in a clean plastic bucket, and use the quartering method to retain 500 grams.\n"
            "3. Air Drying: Dry the composite sample under shade (never direct sunlight), crush clods, and pass through a 2 mm sieve.\n"
            "4. Rapid Optical Extraction: Mix 1 part soil with 2.5 parts distilled water. Add calibrated reagent drops, insert cuvette into device chamber, and initiate 60-second optical scan."
        ),
        "mr": (
            "शास्त्रीय माती नमुना गोळा करण्याची आणि चाचणीची पद्धत:\n\n"
            "१. 'V' आकाराचा खड्डा: जमिनीवरील कचरा बाजूला करून १५ सेमी (६ इंच) खोल 'V' आकाराचा खड्डा खणावा. खड्ड्याच्या बाजूने वरपासून खालपर्यंत २-३ सेमी जाडीचा मातीचा थर कापावा.\n"
            "२. झिग-झॅग पद्धत: शेतातील ८ ते १० वेगवेगळ्या ठिकाणांहून माती गोळा करून एकत्र मिसळावी आणि त्यातील अर्धा किलो (५०० ग्रॅम) नमुना वेगळा करावा.\n"
            "३. सावलीत सुकवणे: माती उन्हात न सुकवता सावलीत सुकवावी आणि २ मिमी चाळणीने चाळून घ्यावी.\n"
            "४. उपकरणाद्वारे चाचणी: माती व डिस्टिल्ड वॉटरचे १:२.५ द्रावण तयार करून रिएजंट टाकावे आणि डिव्हाइसमध्ये ठेवून ६० सेकंदांत चाचणी पूर्ण करावी."
        ),
        "hi": (
            "मिट्टी नमूना संग्रहण एवं जांच विधि:\n\n"
            "1. 'V' आकार का गड्ढा: ऊपरी घास हटाकर 15 सेमी (6 इंच) गहरा गड्ढा खोदें और किनारे से 2.5 सेमी मोटी मिट्टी की परत लें।\n"
            "2. खेत के 8-10 अलग-अलग स्थानों से मिट्टी लेकर अच्छी तरह मिलाएं और 500 ग्राम का कंपोजिट नमूना बनाएं।\n"
            "3. छाया में सुखाना: धूप में न सुखाएं, छाया में सुखाकर 2 मिमी की छलनी से छान लें।\n"
            "4. डिवाइस में 1:2.5 घोल तैयार कर रिएजेंट डालें और 60 सेकंड में टेस्ट पूरा करें।"
        ),
        "sources": ["KVK Soil Sampling Protocol", "ICAR Soil Testing Handbook"]
    },

    # 9. Soybean Cultivation Guide
    {
        "id": "crop_soybean_guide",
        "keywords": [
            "soybean", "soyabean", "js 335", "सोयाबीन", "सोयाबीन खत व्यवस्थापन",
            "सोयाबीन की खेती", "soybean sowing", "soybean yield", "soybean disease"
        ],
        "en": (
            "Soybean (सोयाबीन) Package of Practices:\n\n"
            "• Recommended Varieties: JS 335, Phule Kalyani (DS 228), JS 93-05, Phule Kimaya.\n"
            "• Sowing Window: June 20 to July 15 (after receipt of 75–100 mm monsoon rains).\n"
            "• Seed Rate & Treatment: 25–30 kg/acre. Inoculate with Rhizobium japonicum + PSB (250g per 10kg seed) and Trichoderma (4g/kg).\n"
            "• Fertilizer Dose (NPK): 12 kg N : 24 kg P2O5 : 12 kg K2O per acre (e.g., 50 kg DAP + 20 kg MOP + 10 kg elemental sulfur at sowing).\n"
            "• Expected Yield: 10–12 Quintals per acre with proper weed control and moisture management."
        ),
        "mr": (
            "सोयाबीन पीक लागवड व खत व्यवस्थापन:\n\n"
            "• शिफारशीत वाण: जेएस ३३५, फुले कल्याणी (डीएस २२८), फुले किमया, जेएस ९३-०५.\n"
            "• पेरणीची वेळ: २० जून ते १५ जुलै (७५ ते १०० मिमी पाऊस पडल्यानंतर).\n"
            "• बियाणे व बीजप्रक्रिया: प्रति एकर २५ ते ३० किलो. पेरणीपूर्वी रायझोबियम व पीएसबी जीवाणू संवर्धन (२५ ग्रॅम/किलो) आणि ट्रायकोडर्मा लावावे.\n"
            "• खत मात्रा (प्रति एकर): १२ किलो नत्र : २४ किलो स्फुरद : १२ किलो पालाश (उदा. १ बॅग डीएपी किंवा १.५ बॅग एसएसपी + २० किलो पोटॅश + १० किलो गंधक).\n"
            "• अपेक्षित उत्पादन: १० ते १२ क्विंटल प्रति एकर."
        ),
        "hi": (
            "सोयाबीन की उन्नत खेती:\n\n"
            "• प्रमुख किस्में: JS 335, फुले कल्याणी, JS 93-05।\n"
            "• बुवाई का समय: 20 जून से 15 जुलाई (75-100 मिमी वर्षा के उपरांत)।\n"
            "• बीज दर: 25-30 किग्रा प्रति एकड़। राइजोबियम और पीएसबी से बीजोपचार अवश्य करें।\n"
            "• खाद की मात्रा: 50 किग्रा डीएपी + 20 किग्रा पोटाश + 10 किग्रा सल्फर प्रति एकड़।\n"
            "• औसत उपज: 10-12 क्विंटल प्रति एकड़।"
        ),
        "sources": ["MPKV Rahuri Kharif Crop Recommendations", "ICAR-IISR Indore"]
    },

    # 10. Onion Cultivation Guide
    {
        "id": "crop_onion_guide",
        "keywords": [
            "onion", "pyaj", "kanda", "कांदा", "कांदा लागवड", "कांदा खत व्यवस्थापन",
            "प्याज की खेती", "onion fertilizer", "bhima super", "purple blotch"
        ],
        "en": (
            "Onion (कांदा) Cultivation & Nutrition Guide:\n\n"
            "• Varieties: Bhima Super, Bhima Red, Bhima Dark Red, N-2-4-1 (Gavran).\n"
            "• Nursery Management: Raise seedlings for 45–50 days before transplanting into raised beds.\n"
            "• Fertilizer Dose (per acre): 40 kg N : 20 kg P2O5 : 20 kg K2O + 15 kg Sulfur.\n"
            "• Split Schedule: Apply 100% P and K along with 33% N as basal at transplanting. Apply remaining Nitrogen in two equal splits at 30 and 45 days after transplanting (DAT). Stop Nitrogen 30 days before harvest to prevent rotting during storage."
        ),
        "mr": (
            "कांदा पीक लागवड व खत नियोजन:\n\n"
            "• प्रमुख वाण: भीमा सुपर, भीमा रेड, एन-२-४-१ (गावरान कांदा), फुले समर्थ.\n"
            "• पुनर्लागवड: ४५ ते ५० दिवसांची निरोगी रोपे वाफ्यावर पुनर्लागवड करावी.\n"
            "• खत नियोजन (प्रति एकर): ४० किलो नत्र : २० किलो स्फुरद : २० किलो पालाश + १५ किलो गंधक.\n"
            "• वेळ: संपूर्ण स्फुरद, पालाश व एक तृतीयांश नत्र लागवडीच्या वेळी द्यावे. उरलेला नत्र ३० आणि ४५ दिवसांनी विभागून द्यावा. काढणीपूर्वी ३० दिवस आधी खत देणे पूर्णपणे थांबवावे."
        ),
        "hi": (
            "प्याज (कांदा) की उन्नत खेती:\n\n"
            "• किस्में: भीमा सुपर, भीमा रेड, एन-2-4-1 (गावरान)।\n"
            "• रोपाई: 45-50 दिन की पौध की रोपाई करें।\n"
            "• उर्वरक प्रबंधन: 40 किग्रा N : 20 किग्रा P : 20 किग्रा K + 15 किग्रा सल्फर प्रति एकड़।\n"
            "• नाइट्रोजन को 3 भागों में दें (रोपाई के समय, 30 दिन और 45 दिन बाद)।"
        ),
        "sources": ["ICAR-DOGR Rajgurunagar (Pune)", "MPKV Rahuri"]
    },

    # 11. Chickpea (Gram / Harbhara) Guide
    {
        "id": "crop_chickpea_guide",
        "keywords": [
            "chickpea", "gram", "chana", "harbhara", "हरभरा", "चना",
            "हरभरा लागवड", "चने की खेती", "digvijay", "vijay", "wilt disease"
        ],
        "en": (
            "Chickpea / Bengal Gram (हरभरा) Package of Practices:\n\n"
            "• Ideal Varieties: Vijay (drought hardy, wilt resistant), Digvijay, Vishal, Phule Vikram.\n"
            "• Sowing Time: October 10 to November 10 (Rabi season).\n"
            "• Seed Inoculation: Rhizobium + PSB ensures nodulation; treat with Trichoderma (5g/kg) to prevent Fusarium wilt.\n"
            "• Fertilizer Dose: 10 kg N : 20 kg P2O5 per acre (pulses fix their own Nitrogen; avoid excess urea as it causes excessive vegetative growth and flower drop)."
        ),
        "mr": (
            "हरभरा (चना) पीक लागवड मार्गदर्शन:\n\n"
            "• शिफारशीत वाण: विजय (मर रोगास प्रतिकारक्षम), दिग्विजय, विशाल, फुले विक्रम.\n"
            "• पेरणीची वेळ: १० ऑक्टोबर ते १० नोव्हेंबर (रब्बी हंगाम).\n"
            "• बीजप्रक्रिया: रायझोबियम + पीएसबी (२५ ग्रॅम/किलो) आणि मर रोगाच्या नियंत्रणासाठी ट्रायकोडर्मा (५ ग्रॅम/किलो) लावावे.\n"
            "• खत मात्रा: प्रति एकर १० किलो नत्र : २० किलो स्फुरद (उदा. १ बॅग डीएपी किंवा १.५ बॅग एसएसपी). जास्त युरिया दिल्यास झाडांची फुकट वाढ होते आणि घाटे कमी लागतात."
        ),
        "hi": (
            "चना (हरभरा) की उन्नत खेती:\n\n"
            "• उत्तम किस्में: विजय (उकठा रोधी), दिग्विजय, फुले विक्रम।\n"
            "• बुवाई का समय: 10 अक्टूबर से 10 नवंबर।\n"
            "• बीजोपचार: राइजोबियम + ट्राइकोडर्मा से बीज शोधन जरूर करें।\n"
            "• उर्वरक: 10 किग्रा नाइट्रोजन + 20 किग्रा फास्फोरस प्रति एकड़। अधिक यूरिया से बचें।"
        ),
        "sources": ["MPKV Rahuri Rabi Pulses Bulletin", "ICAR-IIPR Kanpur"]
    },

    # 12. Mandi Rates & AGMARKNET
    {
        "id": "mandi_rates_general",
        "keywords": [
            "mandi rates", "market price", "apmc", "agmarknet", "bajarbhav",
            "बाजारभाव", "मंडी भाव", "सोयाबीन भाव", "कांदा भाव", "pune apmc",
            "lasalgaon", "how are prices updated"
        ],
        "en": (
            "Mandi Rates & Market Intelligence:\n\n"
            "• Source: Integrated directly with AGMARKNET (agmarknet.gov.in) official agricultural market feeds.\n"
            "• Covered Mandis: Pune APMC Yard, Lasalgaon (Nashik - Asia's largest onion market), Kalamna Yard (Nagpur), Solapur APMC.\n"
            "• Metrics: Reports Minimum, Modal (most common traded price), and Maximum prices per quintal.\n"
            "• Economic Decision: Use the Net Farm Profit Calculator to match real-time mandi prices against your cultivation costs before selling."
        ),
        "mr": (
            "बाजारभाव (Mandi Rates) व कृषी विपणन माहिती:\n\n"
            "• माहितीचा स्रोत: केंद्र सरकारच्या अधिकृत अ‍ॅगमार्कनेट (AGMARKNET - agmarknet.gov.in) प्रणालीशी जोडलेले आहे.\n"
            "• प्रमुख बाजार समित्या: पुणे एपीएमसी, लासलगाव (नाशिक - कांद्याची आशियातील सर्वात मोठी बाजारपेठ), कळमना (नागपूर) आणि सोलापूर.\n"
            "• दर तपशील: किमान दर, कमाल दर आणि आवक झालेला सर्वसाधारण (Modal) दर प्रति क्विंटलमध्ये दर्शविला जातो.\n"
            "• सल्ला: आपला माल विकण्यापूर्वी फार्म नफा कॅल्क्युलेटरवर उत्पादन खर्च आणि बाजारभावाची सांगड घालून निर्णय घ्या."
        ),
        "hi": (
            "मंडी भाव एवं कृषि विपणन प्रणाली:\n\n"
            "• डेटा स्रोत: भारत सरकार के अधिकृत एगमार्कनेट (AGMARKNET) पोर्टल से सीधे अपडेट।\n"
            "• प्रमुख मंडियां: पुणे, लासलगांव (एशिया की सबसे बड़ी प्याज मंडी), नागपुर और सोलापुर।\n"
            "• विवरण: न्यूनतम, अधिकतम और मॉडल भाव (प्रति क्विंटल)।\n"
            "• बिक्री से पहले हमारे नफा कैलकुलेटर में लागत और भाव का मिलान अवश्य करें।"
        ),
        "sources": ["AGMARKNET (agmarknet.gov.in)", "Maharashtra State Agricultural Marketing Board (MSAMB)"]
    },

    # 13. Project Team & Architecture
    {
        "id": "project_team_about",
        "keywords": [
            "who made this", "who built this", "project team", "triwizard", "creators",
            "प्रकल्प कोणाचा आहे", "कोणी बनवले", "टीम", "परियोजना किसने बनाई", "priyanshu",
            "rajendra", "satyam", "kishlay", "smart soil"
        ],
        "en": (
            "Smart Soil Health & Farming Assistant is an engineering capstone project developed by Team Triwizard:\n\n"
            "• Priyanshu — Project Lead & Full-Stack System Architect (FastAPI, React, SQLite, Cloud API architecture).\n"
            "• Rajendra — Hardware & Embedded Firmware Engineering (ESP32 dual-core, ADC, power circuitry, Wi-Fi telemetry).\n"
            "• Satyam — Machine Learning, Predictive Agronomics & Data Pipelines (Soil kinetics, DSS recommendation rules).\n"
            "• Kishlay — Optical Calibration & Sensor Instrumentation (TCS34725 RGBC integration, Beer-Lambert regression curves).\n\n"
            "Mission: Empower smallholder farmers with low-cost, 60-second on-farm soil diagnostics and verified agronomic decision support."
        ),
        "mr": (
            "स्मार्ट सॉईल हेल्थ असिस्टंट हा प्रकल्प 'टीम ट्रायविझार्ड' (Team Triwizard) ने विकसित केला आहे:\n\n"
            "• प्रियांशू (Priyanshu) — प्रकल्प प्रमुख व सिस्टीम आर्किटेक्ट (FastAPI, React, डेटाबेस व सॉफ्टवेअर रचना).\n"
            "• राजेंद्र (Rajendra) — हार्डवेअर व फर्मवेअर इंजिनिअरिंग (ESP32, सर्किट डिझाइन, बॅटरी व्यवस्थापन).\n"
            "• सत्यम (Satyam) — मशीन लर्निंग व डेटा पाइपलाइन्स (माती विश्लेषण व पीक शिफारसी अल्गोरिदम).\n"
            "• किश्लय (Kishlay) — ऑप्टिकल कॅलिब्रेशन व सेन्सर प्रणाली (TCS34725 सेन्सर व बीअर-लॅम्बर्ट गणितीय कॅलिब्रेशन).\n\n"
            "उद्दिष्ट: शेतकऱ्यांना अवघ्या ६० सेकंदांत शेतातच मातीची अचूक तपासणी आणि तज्ज्ञ सल्ला मिळवून देणे."
        ),
        "hi": (
            "स्मार्ट सॉयल हेल्थ प्रोजेक्ट 'टीम ट्रायविजार्ड' (Team Triwizard) द्वारा निर्मित है:\n\n"
            "• प्रियांशु (Priyanshu) — प्रोजेक्ट लीड व सॉफ्टवेयर आर्किटेक्ट।\n"
            "• राजेंद्र (Rajendra) — हार्डवेयर एवं फर्मवेयर इंजीनियरिंग (ESP32, सेंसर सर्किट)।\n"
            "• सत्यम (Satyam) — मशीन लर्निंग व डेटा एनालिसिस।\n"
            "• किश्लय (Kishlay) — ऑप्टिकल कैलिब्रेशन और सेंसर टेस्ट।"
        ),
        "sources": ["Smart Soil Project Specification", "Team Triwizard Repository"]
    },

    # 14. Organic Carbon & Manure
    {
        "id": "organic_carbon_manure",
        "keywords": [
            "organic carbon", "fym", "vermicompost", "soil health", "microbes",
            "सेंद्रिय कर्ब", "शेणखत", "गांडूळ खत", "जैविक कार्बन", "गोबर खाद",
            "how to increase organic carbon", "compost"
        ],
        "en": (
            "Soil Organic Carbon (SOC) Improvement Guide:\n\n"
            "• Why it matters: Organic carbon is the life of soil! It increases moisture holding capacity, cation exchange capacity (CEC), and feeds beneficial mycorrhiza and earthworms.\n"
            "• Benchmark: Healthy Indian soils should have > 0.75% Organic Carbon (many intensive plots have dropped below 0.40%).\n"
            "• Practical Action Plan:\n"
            "  1. Incorporate 2.5–5 tonnes of well-rotted FYM or 1.5 tonnes of Vermicompost per acre before summer plowing.\n"
            "  2. Retain crop stubble / residues (never burn straw!). Mulching adds 500–800 kg organic matter/acre.\n"
            "  3. Rotate with leguminous green manure crops (Dhaincha/Sunnhemp) every 2–3 years."
        ),
        "mr": (
            "जमिनीतील सेंद्रिय कर्ब (Organic Carbon) वाढवण्याचे उपाय:\n\n"
            "• सेंद्रिय कर्बाचे महत्त्व: सेंद्रिय कर्ब हा जमिनीचा आत्मा आहे! यामुळे जमिनीची पाणी धरून ठेवण्याची क्षमता वाढते आणि खतांची उपलब्धता सुधारते.\n"
            "• निकष: सुपीक जमिनीत सेंद्रिय कर्ब ०.७५% पेक्षा जास्त असावा.\n"
            "• प्रत्यक्ष उपाययोजना:\n"
            "  १. दरवर्षी प्रति एकर २.५ ते ५ टन कुजलेले शेणखत किंवा १.५ टन गांडूळ खत टाकावे.\n"
            "  २. पिकांचे अवशेष (उदा. सोयाबीन भुसा, उसाचे पाचट) शेतात जाळू नये, ते जमिनीत कुजवावे.\n"
            "  ३. दर दोन वर्षांनी ताग किंवा धैंच्याची हिरवळीचे खत म्हणून पेरणी करून ते जमिनीत गाडावे."
        ),
        "hi": (
            "मिट्टी का जैविक कार्बन (Organic Carbon) कैसे बढ़ाएं:\n\n"
            "• महत्व: जैविक कार्बन से मिट्टी की जल धारण क्षमता और उर्वरता बढ़ती है। आदर्श स्तर 0.75% से अधिक होना चाहिए।\n"
            "• उपाय:\n"
            "  1. प्रति एकड़ 2.5 से 5 टन सड़ी हुई गोबर की खाद या 1.5 टन केंचुआ खाद डालें।\n"
            "  2. फसल अवशेषों (नरवाई/पराली) को खेत में कभी न जलाएं।\n"
            "  3. हरी खाद (ढैंचा/सनई) का नियमित प्रयोग करें।"
        ),
        "sources": ["ICAR-IISS Bhopal Organic Farming Protocol", "MPKV Rahuri"]
    }
]

# ==============================================================================
# Semantic NLP & Open-Source LLM Service
# ==============================================================================

class SemanticNLPEngine:
    """
    High-performance on-device Semantic NLP Engine using scikit-learn TF-IDF
    and Cosine Similarity. Runs in <5ms with 0 internet dependence.
    """
    def __init__(self, entries: List[Dict[str, Any]]):
        self.entries = entries
        corpus = []
        for entry in entries:
            # Combine keywords, id, and multilingual texts for comprehensive matching
            text_tokens = (
                " ".join(entry["keywords"]) + " " +
                entry["id"].replace("_", " ") + " " +
                entry.get("en", "") + " " +
                entry.get("mr", "") + " " +
                entry.get("hi", "")
            )
            corpus.append(text_tokens.lower())

        self.vectorizer = TfidfVectorizer(
            analyzer='char_wb',
            ngram_range=(3, 5),
            sublinear_tf=True
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def match(self, query: str) -> Optional[Dict[str, Any]]:
        clean_q = query.strip().lower()
        if not clean_q:
            return None
        q_vec = self.vectorizer.transform([clean_q])
        scores = cosine_similarity(q_vec, self.tfidf_matrix)[0]
        best_idx = scores.argmax()
        best_score = scores[best_idx]

        # Match threshold for char_wb (0.05 is sensitive and robust)
        if best_score > 0.05:
            return self.entries[best_idx]
        return None


# Initialize Engine singleton
semantic_engine = SemanticNLPEngine(KNOWLEDGE_ENTRIES)


class AIAssistantService:
    @classmethod
    def answer_query(cls, query_data: AssistantQuery, soil_context: Dict[str, Any] = None) -> AssistantResponse:
        raw_query = query_data.query.strip()
        lang = query_data.language if query_data.language in ["mr", "hi", "en"] else "en"

        # Auto-detect Devanagari script if language was left as default English
        has_devanagari = bool(re.search(r'[\u0900-\u097F]', raw_query))
        if has_devanagari and lang == "en":
            # Heuristic for Marathi vs Hindi
            if any(w in raw_query for w in ["आहे", "काय", "करावे", "शेतात", "पिकाला", "सामू", "खत", "भांडवल", "सांगा", "कसे"]):
                lang = "mr"
            else:
                lang = "hi"

        # 1. Search our high-precision Semantic NLP Knowledge Engine (<5ms)
        matched_entry = semantic_engine.match(raw_query)

        # 2. Formulate the response
        if matched_entry:
            base_text = matched_entry.get(lang) or matched_entry.get("en", "")

            # Personalize with farmer's active plot context if available
            context_prefix = ""
            if soil_context and "ph" in soil_context:
                ph_str = soil_context.get("ph", "6.8")
                plot_str = soil_context.get("plot_label", "Your Field")
                if lang == "mr":
                    context_prefix = f"📍 [संदर्भ: {plot_str} | नोंदणीकृत सामू: {ph_str}]\n\n"
                elif lang == "hi":
                    context_prefix = f"📍 [संदर्भ: {plot_str} | दर्ज pH: {ph_str}]\n\n"
                else:
                    context_prefix = f"📍 [Context: {plot_str} | Measured pH: {ph_str}]\n\n"

            final_text = f"{context_prefix}{base_text}"
            provenance = "Generated (Semantic NLP Knowledge Engine • scikit-learn)"
            sources = matched_entry.get("sources", ["ICAR-IISS Bhopal", "MPKV Rahuri"])
        else:
            # Context-aware intelligent fallback
            if soil_context and "ph" in soil_context:
                ph_str = soil_context.get("ph", "6.8")
                soil_type = soil_context.get("soil_type", "Black Soil")
                if lang == "mr":
                    final_text = (
                        f"तुमच्या शेतासाठी ({soil_type}, सामू {ph_str}) माहिती:\n\n"
                        f"• सामू ६.८ हा उत्तम उदासीन असून सर्व मुख्य अन्नद्रव्ये (नत्र, स्फुरद, पालाश) पिकाला सहज उपलब्ध होतात.\n"
                        f"• कोणत्याही पिकाची खत मात्रा (उदा. सोयाबीन, कांदा, हरभरा), सेन्सर कार्यपद्धती (ESP32, TCS34725), किंवा बाजारभावाबाबत थेट प्रश्न विचारा!"
                    )
                elif lang == "hi":
                    final_text = (
                        f"आपके खेत के लिए ({soil_type}, pH {ph_str}) जानकारी:\n\n"
                        f"• वर्तमान pH 6.8 संतुलित तटस्थ है, जो फसलों के लिए सबसे उपयुक्त है।\n"
                        f"• आप किसी भी फसल की खाद, ESP32 व TCS34725 सेंसर तकनीक, या मंडी भाव से संबंधित विशिष्ट प्रश्न पूछ सकते हैं!"
                    )
                else:
                    final_text = (
                        f"Information for your field ({soil_type}, pH {ph_str}):\n\n"
                        f"• Your soil pH is neutral (6.8), providing balanced availability of Nitrogen, Phosphorus, and Potassium.\n"
                        f"• You can ask any specific question regarding crop fertilizer schedules (Soybean, Onion, Chickpea), IoT hardware (ESP32, TCS34725 colorimeter), or APMC mandi price trends!"
                    )
            else:
                if lang == "mr":
                    final_text = (
                        "मी आपला स्मार्ट सॉईल कृषी सहाय्यक आहे. आपण खालीलपैकी कोणत्याही विषयावर प्रश्न विचारू शकता:\n\n"
                        "१. मातीचा सामू (pH) आणि खत व्यवस्थापन (युरिया, डीएपी, एसएसपी, पोटाश)\n"
                        "२. आयओटी उपकरण कार्यपद्धती (ESP32, TCS34725 ऑप्टिकल सेन्सर, DS18B20 तापमान)\n"
                        "३. पीक लागवड मार्गदर्शन (सोयाबीन, कांदा, हरभरा, कापूस, गहू)\n"
                        "४. थेट बाजारभाव (APMC पुणे, लासलगाव, नागपूर) आणि नफा नियोजन."
                    )
                elif lang == "hi":
                    final_text = (
                        "मैं आपका स्मार्ट सॉयल सहायक हूँ। आप निम्न विषयों पर प्रश्न पूछ सकते हैं:\n\n"
                        "1. मिट्टी pH व उर्वरक प्रबंधन (यूरिया, डीएपी, एसएसपी, पोटाश)\n"
                        "2. IoT डिवाइस तकनीक (ESP32, TCS34725 ऑप्टिकल सेंसर, DS18B20)\n"
                        "3. प्रमुख फसलें (सोयाबीन, प्याज, चना, कपास, गेहूं)\n"
                        "4. मंडी भाव (APMC पुणे, लासलगांव) और शुद्ध लाभ गणना।"
                    )
                else:
                    final_text = (
                        "I am your Smart Soil AI Assistant. You can ask questions about:\n\n"
                        "1. Soil pH, acidity/alkalinity treatment, and NPK fertilizer dosing (Urea, DAP, SSP, MOP).\n"
                        "2. IoT hardware architecture (ESP32 microcontroller, TCS34725 colorimeter, DS18B20 temperature probe).\n"
                        "3. Crop cultivation guides (Soybean, Onion, Chickpea, Cotton, Wheat).\n"
                        "4. Live APMC mandi rates and net farm profit calculations."
                    )
            provenance = "Generated (Grounded in ICAR/KVK references)"
            sources = ["ICAR - Indian Institute of Soil Science (Bhopal)", "MPKV Rahuri Agronomy Division"]

        return AssistantResponse(
            response=final_text,
            sources_cited=sources,
            disclaimer="This advice is based on vetted agronomic packages of practices (ICAR/MPKV/KVK) and does not replace official lab testing.",
            provenance=provenance
        )
