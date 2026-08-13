import os
import json
import warnings
from io import BytesIO
from PIL import Image
from ultralytics import YOLO
import google.generativeai as genai

warnings.filterwarnings("ignore", category=FutureWarning)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
    genai.configure(api_key=GEMINI_API_KEY)

# Global dictionary to cache loaded models
YOLO_MODELS = {}

def get_yolo_model(model_name: str):
    """
    Loads and caches the specified YOLO model.
    """
    if model_name not in YOLO_MODELS:
        backend_dir = os.path.dirname(os.path.dirname(__file__))
        model_path = os.path.join(backend_dir, "yolomodels", model_name)
        if os.path.exists(model_path):
            print(f"[YOLO] Loading model {model_name} from {model_path}...")
            YOLO_MODELS[model_name] = YOLO(model_path)
        else:
            print(f"[YOLO Error] Model file not found at {model_path}")
            return None
    return YOLO_MODELS[model_name]


# Minimum confidence to report a detection — filters false positives
CONFIDENCE_THRESHOLD = 0.50

# Urban-relevant classes from yolov8n general model (COCO 80 classes)
GENERAL_URBAN_CLASSES = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    6: "train",
    7: "truck",
    9: "traffic light",
    10: "fire hydrant",
    11: "stop sign",
    12: "parking meter",
    13: "bench",
    56: "chair",
    57: "couch",
    59: "potted plant",
    60: "bed",
    61: "dining table",
}

def run_yolo_detection(image_bytes: bytes, category: str) -> list:
    """
    Smart dual-model YOLO detection:
    1. Always runs general YOLOv8n model (detects cars, people, traffic lights etc.)
    2. Also runs category-specific specialized model if available
    3. Merges results, filters below CONFIDENCE_THRESHOLD to avoid false positives
    4. If specialized model finds nothing, general model results are the fallback
    """
    try:
        image = Image.open(BytesIO(image_bytes))
    except Exception as e:
        print(f"[YOLO Error] Cannot open image: {e}")
        return []

    all_detections = []

    # ── STEP 1: Run category-specific specialized model ──────────────────
    specialized_model_name = None
    specialized_class_mapping = {}

    if category == "Safety":
        specialized_model_name = "hemletYoloV8_100epochs.pt"
        specialized_class_mapping = {0: "unprotected head", 1: "helmet (safety gear)", 2: "person"}
    elif category in ["Environment", "Public Spaces"]:
        specialized_model_name = "best_model.pt"
        specialized_class_mapping = {
            0: "Glass waste", 1: "Metal waste",
            2: "Paper waste", 3: "Plastic waste",
            4: "General Waste/Garbage"
        }
    elif category in ["Utilities", "Infrastructure"]:
        specialized_model_name = "best.pt"
        specialized_class_mapping = {0: "Manhole/Sewage inlet"}
    elif category == "Traffic":
        specialized_model_name = "license_plate_detector.pt"
        specialized_class_mapping = {0: "license plate (vehicle)"}

    specialized_detections = []
    specialized_results = None
    if specialized_model_name:
        model = get_yolo_model(specialized_model_name)
        if model:
            try:
                specialized_results = model(image, verbose=False)
                for result in specialized_results:
                    for box in result.boxes:
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        if conf >= CONFIDENCE_THRESHOLD:          # ← filter false positives
                            cls_name = specialized_class_mapping.get(
                                cls_id, result.names.get(cls_id, f"Class {cls_id}")
                            )
                            specialized_detections.append({"class": cls_name, "confidence": conf, "source": "specialized"})
                if specialized_detections:
                    print(f"[YOLO] Specialized model ({specialized_model_name}) found {len(specialized_detections)} detections above {CONFIDENCE_THRESHOLD*100:.0f}% threshold")
                else:
                    print(f"[YOLO] Specialized model ({specialized_model_name}) found nothing above {CONFIDENCE_THRESHOLD*100:.0f}% confidence. Falling back to general model.")
            except Exception as e:
                print(f"[YOLO Error] Specialized model failed: {e}")

    # ── STEP 2: Always run general YOLOv8n model ─────────────────────────
    general_detections = []
    general_results = None
    general_model = get_yolo_model("yolov8n.pt")
    if general_model:
        try:
            general_results = general_model(image, verbose=False)
            for result in general_results:
                for box in result.boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    if conf >= CONFIDENCE_THRESHOLD and cls_id in GENERAL_URBAN_CLASSES:
                        cls_name = GENERAL_URBAN_CLASSES[cls_id]
                        general_detections.append({"class": cls_name, "confidence": conf, "source": "general"})
            if general_detections:
                print(f"[YOLO] General model detected: {[d['class'] for d in general_detections]}")
        except Exception as e:
            print(f"[YOLO Error] General model failed: {e}")

    # ── STEP 3: Merge — specialized detections take priority ─────────────
    # Always include general detections (they tell what's actually in the image)
    # Specialized detections add domain-specific findings
    seen_classes = set()
    merged = []

    for det in specialized_detections:
        key = det["class"].lower()
        if key not in seen_classes:
            seen_classes.add(key)
            merged.append(det)

    for det in general_detections:
        key = det["class"].lower()
        if key not in seen_classes:
            seen_classes.add(key)
            merged.append(det)

    # Sort by confidence descending
    merged.sort(key=lambda x: x["confidence"], reverse=True)

    # Cleaned list to return
    cleaned_detections = [{"class": d["class"], "confidence": d["confidence"]} for d in merged]

    # ── STEP 4: Generate annotated image bytes if detections exist ─────
    annotated_image_bytes = None
    if specialized_detections and specialized_results:
        try:
            plotted = specialized_results[0].plot(conf=True, labels=True)
            # plotted is a numpy array in BGR format
            plotted_rgb = plotted[:, :, ::-1]
            annotated_img = Image.fromarray(plotted_rgb)
            out_io = BytesIO()
            annotated_img.save(out_io, format="JPEG", quality=85)
            annotated_image_bytes = out_io.getvalue()
            print("[YOLO] Generated annotated image using specialized model detections.")
        except Exception as e:
            print(f"[YOLO Error] Failed to generate specialized annotated image: {e}")
    elif general_detections and general_results:
        try:
            plotted = general_results[0].plot(conf=True, labels=True)
            plotted_rgb = plotted[:, :, ::-1]
            annotated_img = Image.fromarray(plotted_rgb)
            out_io = BytesIO()
            annotated_img.save(out_io, format="JPEG", quality=85)
            annotated_image_bytes = out_io.getvalue()
            print("[YOLO] Generated annotated image using general model detections.")
        except Exception as e:
            print(f"[YOLO Error] Failed to generate general annotated image: {e}")

    return cleaned_detections, annotated_image_bytes




async def analyze_issue_with_ai(image_bytes: bytes | None, description: str, category: str, location: str) -> dict:
    """
    Analyzes an issue's image + description using YOLOv8 object detection and Gemini Vision API.
    Returns structured priority score (1-100), risk assessment, category verification, and SLA hours.
    """
    # Default fallback response
    fallback = {
        "ai_score": 65 if category in ["Utilities", "Safety"] else 45,
        "priority": "critical" if category == "Safety" else ("high" if category == "Utilities" else "medium"),
        "suggested_category": category,
        "summary": f"Civic issue reported in {location} regarding {category.lower()}: {description[:120]}...",
        "risk_assessment": f"Standard civic issue in {category}. Regular dispatch recommended.",
        "citizen_impact_score": 60,
        "recommended_action": f"Deploy {category} maintenance team for inspection within 24 hours.",
        "suggested_sla_hours": 12 if category == "Safety" else 24,
        "yolo_detections": [],
        "full_report": f"A citizen reported a {category} issue at {location}. Based on the description: '{description[:200]}'. The municipal team is advised to investigate and resolve the issue within the standard SLA window."
    }

    yolo_detections = []
    yolo_summary_str = ""
    annotated_image_bytes = None
    
    if image_bytes:
        print(f"[AI Service] Running YOLO detection for category: {category}...")
        detections, ann_bytes = run_yolo_detection(image_bytes, category)
        annotated_image_bytes = ann_bytes
        if detections:
            # Format detections for easy reading
            yolo_detections = detections
            det_strings = [f"{d['class']} ({d['confidence'] * 100:.1f}% confidence)" for d in detections]
            yolo_summary_str = ", ".join(det_strings)
            print(f"[AI Service] YOLO detected: {yolo_summary_str}")
        else:
            print("[AI Service] YOLO detected nothing of interest or failed.")

    if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("[AI Service] Gemini API key not configured. Using rule-based analyzer fallback.")
        fallback["yolo_detections"] = yolo_detections
        if yolo_summary_str:
            fallback["summary"] = f"[YOLO detected: {yolo_summary_str}] " + fallback["summary"]
        return fallback

    try:
        # Using the standard gemini-3.5-flash model
        model = genai.GenerativeModel('gemini-3.5-flash')

        yolo_info_prompt = ""
        if yolo_summary_str:
            yolo_info_prompt = f"A local YOLO Object Detection model ran on this image and detected: {yolo_summary_str}."

        prompt = f"""
        You are an expert Smart City AI Inspector for Urban Eye. Analyze the following civic complaint details and optional image.

        Issue Description: "{description}"
        Reported Category: "{category}"
        Location: "{location}"
        
        {yolo_info_prompt}

        Provide a JSON response ONLY with the following exact keys:
        - "ai_score": integer from 1 to 100 representing hazard severity and urgency
        - "priority": string, one of "critical", "high", "medium", "low"
        - "suggested_category": string, verified category ("Infrastructure", "Utilities", "Safety", "Environment", "Public Spaces")
        - "summary": string, 2-sentence formal technical summary of the issue (incorporate what the citizen reported and what YOLO computer vision detected)
        - "risk_assessment": string, assessment of risk to citizens, traffic, or infrastructure
        - "citizen_impact_score": integer from 1 to 100
        - "recommended_action": string, recommended municipal squad action
        - "suggested_sla_hours": integer (e.g. 4 for critical, 12 for high, 24 for medium, 48 for low)
        - "full_report": string, a detailed 5-7 sentence human-readable report explaining: what was detected by computer vision (if any), what the citizen described, the exact nature of the problem, potential dangers to the public, the recommended course of action, and the expected resolution timeline. Write this as a professional municipal inspection report.
        """

        content = [prompt]

        if image_bytes:
            image = Image.open(BytesIO(image_bytes))
            content.append(image)

        response = model.generate_content(content)
        responseText = response.text.strip()

        # Clean JSON markdown quotes if returned
        if responseText.startswith("```json"):
            responseText = responseText[7:]
        if responseText.endswith("```"):
            responseText = responseText[:-3]

        parsed = json.loads(responseText.strip())
        
        # Attach YOLO detections to the response so the frontend/database can save it
        parsed["yolo_detections"] = yolo_detections
        parsed["annotated_image_bytes"] = annotated_image_bytes
        return parsed

    except Exception as e:
        print(f"[AI Service Error] Gemini Vision analysis failed: {e}. Falling back.")
        fallback["yolo_detections"] = yolo_detections
        fallback["annotated_image_bytes"] = None
        return fallback

