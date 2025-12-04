from keyboard_emulator import KeyboardEmulator   
from usb.device.keyboard import KeyCode
from time import sleep_ms
from modulino import ModulinoDistance, ModulinoPixels

# =========================
# Konfiguration
# =========================
DRUCK_SCHWELLE_CM = 10
NUM_LEDS = 8
FARBE_TASTENDRUCK = (255, 0, 0)  # Rot
FARBE_BEREIT = (0, 0, 0)         # Aus

# =========================
# Initialisierung
# =========================
dist = ModulinoDistance()
pixels = ModulinoPixels()

for i in range(NUM_LEDS):
    pixels.set_rgb(i, *FARBE_BEREIT)
pixels.show()

# =========================
# Bedingung für F-Taste
# =========================
def should_press_f():
    distance_cm = dist.distance
    
    if 0 < distance_cm <= DRUCK_SCHWELLE_CM:
        return True
    return False

# =========================
# LEDs aktualisieren
# =========================
def update_leds_for_keypress(active):
    farbe = FARBE_TASTENDRUCK if active else FARBE_BEREIT

    for i in range(NUM_LEDS):
        pixels.set_rgb(i, *farbe)
    pixels.show()

# =========================
# Tastatur starten
# =========================
keyboard = KeyboardEmulator()
keyboard.add_binding(should_press_f, KeyCode.F)   # Taste F senden!

keyboard.start()   # ⚠️ Achtung: Trennt die USB-Serielle Verbindung!

# =========================
# Hauptschleife
# =========================
while True:
    trigger = should_press_f()

    update_leds_for_keypress(trigger)

    keyboard.update()   # Tastenzustand aktualisieren
    sleep_ms(10)
