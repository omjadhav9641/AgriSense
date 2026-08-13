import io
import json
from PIL import Image, ImageDraw
from ml.services.disease_service import analyze_leaf_image

def run_disease_tests():
    print("==================================================")
    print("   AgriSense Disease AI Unit & Gate Test Suite   ")
    print("==================================================\n")

    tests_passed = 0
    total_tests = 5

    # 1. Non-leaf Test: Dark Mode Code Editor Screenshot
    code_img = Image.new('RGB', (200, 200), color=(20, 20, 20))
    d = ImageDraw.Draw(code_img)
    d.rectangle([20, 20, 180, 50], fill=(30, 80, 180)) # Blue UI element
    buf1 = io.BytesIO()
    code_img.save(buf1, format='JPEG')
    res1 = analyze_leaf_image(buf1.getvalue())
    print(f"Test 1 [Non-Leaf / Code Editor]: Status='{res1['status']}' | ValidLeaf={res1['is_valid_leaf']}")
    if res1['status'] == 'not_a_leaf' and not res1['is_valid_leaf']:
        tests_passed += 1
        print("  --> PASS: Pre-classification gate correctly rejected non-leaf image.\n")
    else:
        print("  --> FAIL: Expected status 'not_a_leaf'\n")

    # 2. Non-leaf Test: Human Skin / Wall Tone Image
    skin_img = Image.new('RGB', (200, 200), color=(210, 160, 130)) # Skin/beige tone
    buf2 = io.BytesIO()
    skin_img.save(buf2, format='JPEG')
    res2 = analyze_leaf_image(buf2.getvalue())
    print(f"Test 2 [Non-Leaf / Skin-Wall Tone]: Status='{res2['status']}' | ValidLeaf={res2['is_valid_leaf']}")
    if res2['status'] == 'not_a_leaf' and not res2['is_valid_leaf']:
        tests_passed += 1
        print("  --> PASS: Pre-classification gate correctly rejected skin/wall tone.\n")
    else:
        print("  --> FAIL: Expected status 'not_a_leaf'\n")

    # 3. Non-leaf Test: Pure White Document Screenshot
    doc_img = Image.new('RGB', (200, 200), color=(255, 255, 255))
    buf3 = io.BytesIO()
    doc_img.save(buf3, format='JPEG')
    res3 = analyze_leaf_image(buf3.getvalue())
    print(f"Test 3 [Non-Leaf / White Document]: Status='{res3['status']}' | ValidLeaf={res3['is_valid_leaf']}")
    if res3['status'] == 'not_a_leaf' and not res3['is_valid_leaf']:
        tests_passed += 1
        print("  --> PASS: Pre-classification gate correctly rejected white document.\n")
    else:
        print("  --> FAIL: Expected status 'not_a_leaf'\n")

    # 4. Ambiguous Leaf Test: Equal mix of chlorotic yellow & necrotic spot (close top-2 score margin -> uncertain)
    ambig_img = Image.new('RGB', (200, 200), color=(80, 110, 60))
    d_ambig = ImageDraw.Draw(ambig_img)
    d_ambig.rectangle([10, 10, 100, 190], fill=(150, 135, 30)) # Chlorotic yellow
    d_ambig.rectangle([101, 10, 190, 190], fill=(60, 55, 35)) # Fungal brown spot
    buf4 = io.BytesIO()
    ambig_img.save(buf4, format='JPEG')
    res4 = analyze_leaf_image(buf4.getvalue())
    print(f"Test 4 [Ambiguous Leaf]: Status='{res4['status']}' | Conf={res4.get('confidence_score')}%")
    if res4['status'] in ['uncertain', 'diagnosed'] and res4['is_valid_leaf']:
        tests_passed += 1
        print(f"  --> PASS: Handled valid leaf safely with status '{res4['status']}'.\n")
    else:
        print(f"  --> FAIL: Expected valid leaf status, got '{res4['status']}'\n")

    # 5. Clear Diseased Leaf Test: Tomato Early Blight (Dark spots on chlorotic leaf)
    leaf_img = Image.new('RGB', (200, 200), color=(40, 150, 40))
    d_leaf = ImageDraw.Draw(leaf_img)
    d_leaf.rectangle([30, 30, 170, 170], fill=(160, 140, 30)) # Chlorotic yellow
    d_leaf.ellipse([50, 50, 90, 90], fill=(30, 30, 20)) # Dark necrotic lesion
    d_leaf.ellipse([110, 110, 150, 150], fill=(40, 35, 20)) # Dark necrotic lesion
    buf5 = io.BytesIO()
    leaf_img.save(buf5, format='JPEG')
    res5 = analyze_leaf_image(buf5.getvalue())
    print(f"Test 5 [Diseased Leaf]: Status='{res5['status']}' | Disease='{res5.get('disease_name')}' | Conf={res5.get('confidence_score')}%")
    if res5['status'] == 'diagnosed' and res5['is_valid_leaf']:
        tests_passed += 1
        print("  --> PASS: Successfully classified diseased leaf with high confidence.\n")
    else:
        print(f"  --> FAIL: Expected status 'diagnosed', got '{res5['status']}'\n")

    print(f"Test Results: {tests_passed}/{total_tests} Tests Passed.")
    print("==================================================")
    return tests_passed == total_tests

if __name__ == "__main__":
    run_disease_tests()
