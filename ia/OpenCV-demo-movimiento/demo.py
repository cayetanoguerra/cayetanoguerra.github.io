import cv2


CAMERA_INDEX = 0
PIXEL_THRESHOLD = 25
MIN_BLOB_AREA = 5000
WINDOW_NAME = "Detector de movimiento"


def main() -> None:
    camera = cv2.VideoCapture(CAMERA_INDEX)
    if not camera.isOpened():
        raise RuntimeError(
            f"No se pudo abrir la webcam con índice {CAMERA_INDEX}. "
            "Comprueba que esté conectada y que la aplicación tenga permiso para usarla."
        )

    background = None
    movement_detected = False

    print("Pulsa 'b' para capturar el fondo sin objetos en movimiento.")
    print("Después, pulsa 'r' para volver a capturar el fondo o 'q' para salir.")

    try:
        while True:
            success, frame = camera.read()
            if not success:
                raise RuntimeError("No se pudo leer una imagen de la webcam.")

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (21, 21), 0)
            display = frame.copy()
            mask = gray.copy()
            mask[:] = 0

            if background is None:
                cv2.putText(
                    display,
                    "Deteccion: pulsa 'b' para capturar el fondo",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 255),
                    2,
                )
            else:
                difference = cv2.absdiff(background, gray)
                _, mask = cv2.threshold(
                    difference, PIXEL_THRESHOLD, 255, cv2.THRESH_BINARY
                )
                mask = cv2.morphologyEx(
                    mask,
                    cv2.MORPH_OPEN,
                    None,
                    iterations=2,
                )
                mask = cv2.dilate(mask, None, iterations=2)

                contours, _ = cv2.findContours(
                    mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
                )
                blobs = [
                    contour
                    for contour in contours
                    if cv2.contourArea(contour) >= MIN_BLOB_AREA
                ]

                if blobs and not movement_detected:
                    print("Aviso: movimiento detectado.")
                movement_detected = bool(blobs)

                for contour in blobs:
                    x, y, width, height = cv2.boundingRect(contour)
                    area = cv2.contourArea(contour)
                    cv2.rectangle(
                        display,
                        (x, y),
                        (x + width, y + height),
                        (0, 255, 0),
                        2,
                    )
                    cv2.putText(
                        display,
                        f"{area:.0f} px",
                        (x, max(y - 10, 20)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 0, 255),
                        2,
                    )

                if movement_detected:
                    cv2.putText(
                        display,
                        "MOVIMIENTO DETECTADO",
                        (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.8,
                        (0, 0, 255),
                        2,
                    )

            mask_display = cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR)
            cv2.putText(
                mask_display,
                "Mascara binaria",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2,
            )
            cv2.imshow(WINDOW_NAME, cv2.hconcat([display, mask_display]))
            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break
            if key in (ord("b"), ord("r")):
                background = gray.copy()
                movement_detected = False
                print("Fondo capturado.")
    finally:
        camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
