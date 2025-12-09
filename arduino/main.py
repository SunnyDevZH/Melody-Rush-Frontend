from keyboard_emulator import KeyboardEmulator                              # Code von Sebastian zur Steuerung der Tastatur
from usb.device.keyboard import KeyCode                                     # Code auf Board zur Tastatursteuerung
from time import sleep_ms                                                   # timer
from modulino import ModulinoDistance, ModulinoPixels                       # Import Modulino Module
from machine import I2C, SoftI2C, Pin                                       # I2C Busse für mehrere Sensoren

# =========================
# Konfiguration
# =========================
MIN_AKTIV_CM = 0                                                            # Untere Grenze für Aktivierung
MAX_AKTIV_CM = 15                                                           # Obere Grenze für Aktivierung
NUM_LEDS = 8                                                                # Anzahl der LEDs auf dem Modulino
LED_FARBE = (0, 0, 255)                                                     # Farbe Blau
LED_AUS = (0, 0, 0)                                                         # LED aus
MAX_GUELTIGE_DISTANZ_CM = MAX_AKTIV_CM                                      # Messwerte darüber ignorieren (Ausreißer)

# =========================
# Initialisierung Module und LEDs aus
# =========================
# Pin-Konfiguration für G1-G4
g1_scl = Pin("RX", Pin.OPEN_DRAIN, Pin.PULL_UP)
g1_sda = Pin("TX", Pin.OPEN_DRAIN, Pin.PULL_UP)

g2_scl = Pin("D8", Pin.OPEN_DRAIN, Pin.PULL_UP)
g2_sda = Pin("D9", Pin.OPEN_DRAIN, Pin.PULL_UP)

g3_scl = Pin("A1", Pin.OPEN_DRAIN, Pin.PULL_UP)
g3_sda = Pin("A0", Pin.OPEN_DRAIN, Pin.PULL_UP)

g4_scl = Pin("A2", Pin.OPEN_DRAIN, Pin.PULL_UP)
g4_sda = Pin("A3", Pin.OPEN_DRAIN, Pin.PULL_UP)

# I2C-Busse erstellen
soft_i2c1 = SoftI2C(scl=g1_scl, sda=g1_sda, freq=100000)  # G1 für Taste A
soft_i2c2 = SoftI2C(scl=g2_scl, sda=g2_sda, freq=100000)  # G2 für Taste S
soft_i2c3 = SoftI2C(scl=g3_scl, sda=g3_sda, freq=100000)  # G3 für Taste D
soft_i2c4 = SoftI2C(scl=g4_scl, sda=g4_sda, freq=100000)  # G4 für Taste F 


# Distanzsensoren initialisieren (mit Fehlerbehandlung)
dist_a = None
dist_s = None
dist_d = None
dist_f = None

try:
    dist_a = ModulinoDistance(soft_i2c1)
except Exception as e:
    pass

try:
    dist_s = ModulinoDistance(soft_i2c2)
except Exception as e:
    pass

try:
    dist_d = ModulinoDistance(soft_i2c3)
except Exception as e:
    pass

try:
    dist_f = ModulinoDistance(soft_i2c4)
except Exception as e:
    pass
        

# Pixels initialisieren (ein Pixels-Modul pro Taste)
pixels_a = None
pixels_s = None
pixels_d = None
pixels_f = None

try:
    pixels_a = ModulinoPixels(soft_i2c1)
    for i in range(NUM_LEDS):
        pixels_a.set_rgb(i, *LED_AUS)
    pixels_a.show()
except Exception as e:
    pass

try:
    pixels_s = ModulinoPixels(soft_i2c2)
    for i in range(NUM_LEDS):
        pixels_s.set_rgb(i, *LED_AUS)
    pixels_s.show()
except Exception as e:
    pass

try:
    pixels_d = ModulinoPixels(soft_i2c3)
    for i in range(NUM_LEDS):
        pixels_d.set_rgb(i, *LED_AUS)
    pixels_d.show()
except Exception as e:
    pass

try:
    pixels_f = ModulinoPixels(soft_i2c4)
    for i in range(NUM_LEDS):
        pixels_f.set_rgb(i, *LED_AUS)
    pixels_f.show()
except Exception as e:
    pass

# =========================
# Prüft ob die Tasten gedrückt werden sollen
# =========================
def distance_to_plate_a():
    if dist_a is None:
        return False
    distance_cm = dist_a.distance
    if distance_cm < 0 or distance_cm > MAX_GUELTIGE_DISTANZ_CM:
        return False
    return (distance_cm >= MIN_AKTIV_CM) and (distance_cm <= MAX_AKTIV_CM)

def distance_to_plate_s():
    if dist_s is None:
        return False
    distance_cm = dist_s.distance
    if distance_cm < 0 or distance_cm > MAX_GUELTIGE_DISTANZ_CM:
        return False
    return (distance_cm >= MIN_AKTIV_CM) and (distance_cm <= MAX_AKTIV_CM)

def distance_to_plate_d():
    if dist_d is None:
        return False
    distance_cm = dist_d.distance
    if distance_cm < 0 or distance_cm > MAX_GUELTIGE_DISTANZ_CM:
        return False
    return (distance_cm >= MIN_AKTIV_CM) and (distance_cm <= MAX_AKTIV_CM)

def distance_to_plate_f():
    if dist_f is None:
        return False
    distance_cm = dist_f.distance
    if distance_cm < 0 or distance_cm > MAX_GUELTIGE_DISTANZ_CM:
        return False
    return (distance_cm >= MIN_AKTIV_CM) and (distance_cm <= MAX_AKTIV_CM)

# =========================
# Prüft ob Taste aktiv sind und aktiviert die LEDs
# =========================
def check_keyboard_and_leds():
    active_a = distance_to_plate_a()
    active_s = distance_to_plate_s()
    active_d = distance_to_plate_d()
    active_f = distance_to_plate_f()
    
    # Pixels A (Taste A)
    if pixels_a is not None:
        farbe = LED_FARBE if active_a else LED_AUS
        for i in range(NUM_LEDS):
            pixels_a.set_rgb(i, *farbe)
        pixels_a.show()
    
    # Pixels S (Taste S)
    if pixels_s is not None:
        farbe = LED_FARBE if active_s else LED_AUS
        for i in range(NUM_LEDS):
            pixels_s.set_rgb(i, *farbe)
        pixels_s.show()
    
    # Pixels D (Taste D)
    if pixels_d is not None:
        farbe = LED_FARBE if active_d else LED_AUS
        for i in range(NUM_LEDS):
            pixels_d.set_rgb(i, *farbe)
        pixels_d.show()
    
    # Pixels F (Taste F)
    if pixels_f is not None:
        farbe = LED_FARBE if active_f else LED_AUS
        for i in range(NUM_LEDS):
            pixels_f.set_rgb(i, *farbe)
        pixels_f.show()

# =========================
# Tastatur starten
# =========================
keyboard = KeyboardEmulator()
keyboard.add_binding(distance_to_plate_a, KeyCode.A)
keyboard.add_binding(distance_to_plate_s, KeyCode.S)
keyboard.add_binding(distance_to_plate_d, KeyCode.D)
keyboard.add_binding(distance_to_plate_f, KeyCode.F)

keyboard.start()

# =========================
# Hauptschleife
# =========================
while True:
    check_keyboard_and_leds()
    keyboard.update()
    sleep_ms(10)
