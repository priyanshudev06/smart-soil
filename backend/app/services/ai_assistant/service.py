from typing import Dict, Any, List
from app.schemas.schemas import AssistantQuery, AssistantResponse

KNOWLEDGE_BASE = {
    "ph_acidic": {
        "en": "For acidic soil (pH < 6.0): Incorporate agricultural lime (CaCO3) or dolomite at 200-400 kg/acre 3 weeks before sowing. Add well-decomposed FYM (Farmyard Manure) to buffer soil acidity. (Source: ICAR-IISS Bhopal).",
        "mr": "सामू (pH) ६.० पेक्षा कमी (आम्लधर्मीय जमीन) असल्यास: पेरणीपूर्वी ३ आठवडे प्रति एकर २०० ते ४०० किलो कृषी चुना किंवा डोलोमाइट जमिनीत मिसळा. चांगले कुजलेले शेणखत (FYM) वापरून जमिनीचा सेंद्रिय कर्ब वाढवा. (संदर्भ: ICAR-IISS भोपाळ).",
        "hi": "अम्लीय मिट्टी (pH < 6.0) के लिए: बुवाई से 3 सप्ताह पहले प्रति एकड़ 200-400 किलोग्राम कृषि चूना या डोलोमाइट मिलाएं। मिट्टी की संरचना सुधारने के लिए गोबर की खाद (FYM) का उपयोग करें। (स्रोत: ICAR-IISS भोपाल)।"
    },
    "ph_alkaline": {
        "en": "For alkaline / sodic soil (pH > 7.8): Apply agricultural gypsum based on exchangeable sodium. Add 5-10 tons/acre of organic compost, green manuring with Sunnhemp (ताग) or Dhaincha to release organic acids that lower rhizosphere pH. (Source: CSSRI Karnal).",
        "mr": "सामू (pH) ७.८ पेक्षा जास्त (क्षारयुक्त / चोपण जमीन) असल्यास: जिप्समचा वापर करा. ताग किंवा धैंच्याचे हिरवळीचे खत जमिनीत गाडून कुजवावे. सेंद्रिय आम्लांमुळे मुळांच्या परिसरातील सामू कमी होतो. (संदर्भ: केंद्रीय क्षारता संशोधन संस्था CSSRI कर्नाल).",
        "hi": "क्षारीय मिट्टी (pH > 7.8) के लिए: मिट्टी की जांच के आधार पर जिप्सम का प्रयोग करें। सनई या ढैंचा की हरी खाद खेत में दबाएं। जैविक खाद से मिट्टी का pH संतुलित होता है। (स्रोत: CSSRI करनाल)।"
    },
    "nitrogen_management": {
        "en": "Nitrogen management: Split application is strongly recommended to prevent leaching. Apply 50% at sowing and 50% at active tillering/vegetative growth. Use Neem-coated urea and biofertilizers like Azotobacter or Rhizobium (for pulses).",
        "mr": "नत्र (Nitrogen) व्यवस्थापन: नत्राची मात्रा विभागून (Split dose) द्यावी—५०% पेरणीच्या वेळी आणि ५०% फुलोऱ्याआधी/वाढीच्या काळात. युरियाचे नुकसान टाळण्यासाठी कडुनिंब अर्क लेपित (Neem Coated) युरिया आणि अझोटोबॅक्टर जीवाणू संवर्धन वापरा. (संदर्भ: महात्मा फुले कृषी विद्यापीठ).",
        "hi": "नाइट्रोजन प्रबंधन: नाइट्रोजन को दो से तीन भागों में बांटकर दें—बुवाई के समय 50% और फसल बढ़वार पर 50%। नीम लेपित यूरिया का प्रयोग करें और दलहनी फसलों में राइजोबियम कल्चर का टीका लगाएं। (स्रोत: ICAR)।"
    },
    "general": {
        "en": "Smart Soil Assistant provides recommendations derived from ICAR and KVK approved agricultural packages. Rapid colorimetric screening should be verified with an accredited laboratory before applying high-dose chemical fertilizers.",
        "mr": "स्मार्ट सॉईल सहाय्यक: आयसीएआर (ICAR) व कृषी विज्ञान केंद्राच्या प्रमाणित पॅकेज ऑफ प्रॅक्टिसेसनुसार सल्ला दिला जातो. रासायनिक खतांचा अतिवापर टाळावा व आवश्यकतेनुसार माती परीक्षण प्रयोगशाळेकडून पडताळणी करावी.",
        "hi": "स्मार्ट सॉयल सहायक: भारतीय कृषि अनुसंधान परिषद (ICAR) और केवीके के दिशानिर्देशों के आधार पर सलाह दी जाती है। रासायनिक खादों के बड़े प्रयोग से पहले प्रयोगशाला जांच जरूर कराएं।"
    }
}

class AIAssistantService:
    @staticmethod
    def answer_query(query_data: AssistantQuery, soil_context: Dict[str, Any] = None) -> AssistantResponse:
        q = query_data.query.lower()
        lang = query_data.language if query_data.language in ["mr", "hi", "en"] else "mr"

        response_text = ""
        sources = ["ICAR - Indian Institute of Soil Science (Bhopal)", "MPKV Rahuri Agronomy Division", "Soil Health Card Scheme Guidelines"]

        if any(w in q for w in ["ph", "सामू", "पीएच", "acid", "आम्ल", "alkaline", "क्षार", "खारा"]):
            if any(w in q for w in ["acid", "कमी", "आम्ल", "कम"]):
                response_text = KNOWLEDGE_BASE["ph_acidic"][lang]
            elif any(w in q for w in ["alkaline", "जास्त", "क्षार", "अधिक"]):
                response_text = KNOWLEDGE_BASE["ph_alkaline"][lang]
            else:
                response_text = (
                    f"{KNOWLEDGE_BASE['ph_acidic'][lang]}\n\n{KNOWLEDGE_BASE['ph_alkaline'][lang]}"
                )
        elif any(w in q for w in ["nitrogen", "नत्र", "युरिया", "urea", "खाद"]):
            response_text = KNOWLEDGE_BASE["nitrogen_management"][lang]
        else:
            # Context-sensitive greeting & advisory
            if soil_context and "ph" in soil_context:
                ph = soil_context["ph"]
                if lang == "mr":
                    response_text = f"तुमच्या शेताचा नोंदवलेला सामू {ph} आहे. जमिनीची सुपीकता टिकवण्यासाठी संतुलित सेंद्रिय खतांचा (शेणखत, गांडूळ खत) वापर करा. कोणत्याही पिकाबाबत किंवा खत व्यवस्थापनाबाबत विचारा!"
                elif lang == "hi":
                    response_text = f"आपके खेत का दर्ज किया गया pH मान {ph} है। मिट्टी के स्वास्थ्य के लिए संतुलित जैविक खाद का प्रयोग करें। किसी भी फसल या उर्वरक प्रबंधन के बारे में पूछें!"
                else:
                    response_text = f"Your recorded plot soil pH is {ph}. Maintain balanced organic inputs (FYM, Vermicompost). Ask any question regarding crop suitability, pH balancing, or fertilizer management!"
            else:
                response_text = KNOWLEDGE_BASE["general"][lang]

        return AssistantResponse(
            response=response_text,
            sources_cited=sources,
            disclaimer="This advice is based on vetted agronomic packages of practices and does not replace official lab soil testing.",
            provenance="Generated (Grounded in ICAR/KVK references)"
        )
