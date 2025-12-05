from keyboard_emulator import KeyboardEmulator                              # Code von Sebastian zur Steuerung der Tastatur
from usb.device.keyboard import KeyCode                                     # Code auf Board zur Tastatursteuerung
from time import sleep_ms                                                   # timer
from modulino import ModulinoDistance, ModulinoPixels                       # Import Modulino Module

# =========================
# Konfiguration
# =========================
ABSTAND_ZU_PLATTE_CM = 10                                                   # Abstand in cm, um die Taste zu aktivieren
NUM_LEDS = 8                                                                # Anzahl der LEDs auf dem Modulino
LED_FARBE = (255, 0, 0)                                                     # Farbe Rot
LED_AUS = (0, 0, 0)                                                         # LED aus

# =========================
# Initialisierung Module und LEDs aus
# =========================
dist_a = ModulinoDistance(0)                                                # Sensor für Taste A (Anschluss 0)
dist_s = ModulinoDistance(1)                                                # Sensor für Taste S (Anschluss 1)
dist_d = ModulinoDistance(2)                                                # Sensor für Taste D (Anschluss 2)
dist_f = ModulinoDistance(3)                                                # Sensor für Taste F (Anschluss 3)
pixels = ModulinoPixels()

for i in range(NUM_LEDS):
    pixels.set_rgb(i, *LED_AUS)
pixels.show()

# =========================
# Prüft ob die Tasten gedrückt werden sollen
# =========================
def distance_to_plate_a():
    distance_cm = dist_a.distance                                           # Berechnet den Abstand von Sensor a
    return distance_cm > 0 and distance_cm <= ABSTAND_ZU_PLATTE_CM          # Prüft ob der Abstand zwischen 0 und 10 cm liegt -> Return True/False

def distance_to_plate_s():
    distance_cm = dist_s.distance                                           # Berechnet den Abstand von Sensor s
    return distance_cm > 0 and distance_cm <= ABSTAND_ZU_PLATTE_CM          # Prüft ob der Abstand zwischen 0 und 10 cm liegt -> Return True/False

def distance_to_plate_d():
    distance_cm = dist_d.distance                                           # Berechnet den Abstand von Sensor d
    return distance_cm > 0 and distance_cm <= ABSTAND_ZU_PLATTE_CM          # Prüft ob der Abstand zwischen 0 und 10 cm liegt -> Return True/False
def distance_to_plate_f():
    distance_cm = dist_f.distance                                           # Berechnet den Abstand von Sensor f
    return distance_cm > 0 and distance_cm <= ABSTAND_ZU_PLATTE_CM          # Prüft ob der Abstand zwischen 0 und 10 cm liegt -> Return True/False

# =========================
# Prüft ob Taste aktiv sind und aktiviert die LEDs
# =========================
def check_keyboard_and_leds():
    any_active = distance_to_plate_a() or distance_to_plate_s() or distance_to_plate_d() or distance_to_plate_f()   # Prüft ob eine Taste aktiv ist
    farbe = LED_FARBE if any_active else LED_AUS                             # Farbe ein falls eine Taste aktiv ist, sonst aus

    for i in range(NUM_LEDS):
        pixels.set_rgb(i, *farbe)
    pixels.show()

# =========================
# Tastatur starten
# =========================
keyboard = KeyboardEmulator()
keyboard.add_binding(should_press_a, KeyCode.A)                             # Lösst die Taste A aus
keyboard.add_binding(should_press_s, KeyCode.S)                             # Lösst die Taste S aus
keyboard.add_binding(should_press_d, KeyCode.D)                             # Lösst die Taste D aus
keyboard.add_binding(should_press_f, KeyCode.F)                             # Lösst die Taste F aus

keyboard.start()

# =========================
# Hauptschleife
# =========================
while True:
    check_keyboard_and_leds()                                               # Prüft ob eine Taste gedrückt ist und aktualisiert die LEDs
    keyboard.update()                                                       # Tastenzustand aktualisieren
    sleep_ms(10)
