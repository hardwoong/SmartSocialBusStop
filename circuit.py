import time
import cv2
import RPi.GPIO as GPIO
from adafruit_htu21d import HTU21D
import busio
import Adafruit_MCP3008

# 특정 LED를 제어하기 위한 함수. led 핀 번호와 on/off 여부를 설정
# on_off 값이 1이면 켜고, 0이면 끔
def controlLED1(on_off):
    global led1
    GPIO.output(led1, on_off)

def controlLED2(on_off):
    global led2
    GPIO.output(led2, on_off)

def controlLED3(on_off):
    global led3
    GPIO.output(led3, on_off)

def controlLED4(on_off):
    global led4
    GPIO.output(led4, on_off)

def controlLED5(on_off):
    global led5
    GPIO.output(led5, on_off)

# 버스정류장쪽 LED를 제어하기 위한 함수
def controlLEDS(on_off):
    global leds
    GPIO.output(leds, on_off)

# 초음파 센서를 제어하여 물체와의 거리를 측정하여 거리 값 리턴하는 함수
def measure_distance():
    global trig, echo
    time.sleep(0.2) # 초음파 센서의 준비 시간을 위해 200밀리초 지연
    GPIO.output(trig, 1) # trig 핀에 1(High) 출력하여 초음파 발사
    GPIO.output(trig, 0) # 즉시 0(Low)로 전환하여 초음파 발사 완료

    while(GPIO.input(echo) == 0): # echo 핀 값이 0에서 1로 바뀔 때까지 대기
        pass

    # 초음파 발사 후 반사 신호 수신 대기
    pulse_start = time.time() # 초음파 발사 시간 기록
    while(GPIO.input(echo) == 1): # echo 핀이 1에서 0으로 바뀔 때까지 대기
        pass

    # 초음파 반사 신호 수신 시간 기록
    pulse_end = time.time() 
    pulse_duration = pulse_end - pulse_start # 초음파의 왕복 시간 계산
    return pulse_duration * 340 * 100 / 2 # 거리를 cm 단위로 계산하여 반환

# 온도 센서로부터 현재 온도를 읽어오는 함수
def getTemperature(sensor):
    return float(sensor.temperature)

# 습도 센서로부터 현재 습도를 읽어오는 함수
def getHumidity(sensor):
    return float(sensor.relative_humidity)

# 특정 핀에 대해 LED의 on/off 상태 설정
# def led_on_off(pin, value):
#     GPIO.output(pin, value)

# 초음파 센서를 다루기 위한 전역 변수 선언 및 초기화
trig = 20 # 초음파 센서의 트리거 핀(GPIO20)
echo = 16 # 초음파 센서의 에코 핀(GPIO16)
GPIO.setmode(GPIO.BCM) # GPIO 핀의 번호 체계를 BCM 방식으로 설정
GPIO.setwarnings(False) # GPIO 경고 메시지 비활성화
GPIO.setup(trig, GPIO.OUT) # trig 핀을 출력으로 설정
GPIO.setup(echo, GPIO.IN) # echo 핀을 입력으로 설정

# 온습도 센서를 다루기 위한 전역 변수 선언 및 초기화
sda = 2 # 온습도 센서의 SDA 핀(GPIO2)
scl = 3 # 온습도 센서의 SCL 핀(GPIO3)
i2c = busio.I2C(scl, sda) # I2C 통신 객체 생성
sensor = HTU21D(i2c) # 온습도 센서 객체 생성

# 조도 센서를 다루기 위한 전역 변수 선언 및 초기화
mcp = Adafruit_MCP3008.MCP3008(clk=11, cs=8, miso=9, mosi=10) # MCP3008 객체 생성 (SPI 핀 설정)

# LED를 다루기 위한 전역 변수 선언 및 초기화
led1 = 5 # LED1(GPIO5)
led2 = 6 # LED2(GPIO6)
led3 = 13 # LED3(GPIO13)
led4 = 19 # LED4(GPIO19)
led5 = 26 # LED5(GPIO26)
leds = 12 # 버스정류장쪽 LED 제어용(GPIO12)
GPIO.setup(led1, GPIO.OUT) # 각 LED 핀을 출력으로 설정
GPIO.setup(led2, GPIO.OUT)
GPIO.setup(led3, GPIO.OUT)
GPIO.setup(led4, GPIO.OUT)
GPIO.setup(led5, GPIO.OUT)
GPIO.setup(leds, GPIO.OUT)

# 카메라 설정
camera = cv2.VideoCapture(0, cv2.CAP_V4L) # 기본 카메라 장치를 열어 캡처 객체 생성
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640) # 카메라 해상도 너비 설정
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480) # 카메라 해상도 높이 설정

buffer_size = 1 # 카메라 버퍼 크기 설정
im_bytes = None # 캡처된 이미지 데이터를 저장할 변수

camera.set(cv2.CAP_PROP_BUFFERSIZE, buffer_size) # 카메라 버퍼 크기 설정

# 사진 촬영 함수, 촬영 후 이미지 데이터를 JPEG 형식으로 인코딩하여 저장
def shoot():
    global im_bytes 
    for i in range(buffer_size + 1):
        ret, frame = camera.read() # 버퍼에 있는 모든 프레임을 읽어 마지막 프레임을 사용
    im_bytes = cv2.imencode('.jpg', frame)[1].tobytes() # 이미지를 JPG 형식으로 인코딩하고 바이트로 변환
