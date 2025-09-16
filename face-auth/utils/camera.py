import cv2

def capture_image(output_path="capture.jpg"):
    """Capture image from webcam"""
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(output_path, frame)
    cap.release()
    return output_path
