import time
import paho.mqtt.client as mqtt
import circuit 

# MQTT 브로커와 연결이 성공했을 때 호출되는 콜백 함수
def on_connect(client, userdata, flag, rc, prop=None):
    # 각 정류장 및 촬영 명령에 대한 구독 설정
    client.subscribe("stop1")
    client.subscribe("stop2")
    client.subscribe("stop3")
    client.subscribe("stop4")
    client.subscribe("stop5")
    client.subscribe("shoot")

# MQTT 메시지를 수신했을 때 호출되는 콜백 함수
def on_message(client, userdata, msg):
    try:
        if msg.topic == "shoot": # 받은 토픽이 "shoot" 일 때
            circuit.shoot()  # 사진 촬영 함수 호출, im_bytes에 유효한 값 저장
            client.publish("pic", circuit.im_bytes, qos=0)  # 촬영한 이미지 데이터를 "pic" 토픽으로 퍼블리시
        else:
            # LED 제어 명령 처리
            on_off = int(msg.payload)  # 수신된 메시지를 정수로 변환하여 on/off 값으로 사용
            if msg.topic == "stop1":
                circuit.controlLED1(on_off)  # LED1 제어
            elif msg.topic == "stop2":
                circuit.controlLED2(on_off)  # LED2 제어
            elif msg.topic == "stop3":
                circuit.controlLED3(on_off)  # LED3 제어
            elif msg.topic == "stop4":
                circuit.controlLED4(on_off)  # LED4 제어
            elif msg.topic == "stop5":
                circuit.controlLED5(on_off)  # LED5 제어
    except ValueError:
        # 수신된 메시지가 설정된 값 이외일 때
        print("Invalid message received")

# MQTT 브로커 IP 주소 설정
ip = "localhost"  # 현재 브로커는 로컬호스트에 설치되어 있음

# MQTT 클라이언트 객체 생성 및 콜백 함수 설정
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

# MQTT 브로커에 연결
client.connect(ip, 1883)  # 로컬 브로커의 포트는 1883번 사용
client.loop_start()  # 메시지 루프를 실행하는 스레드를 시작하여 비동기적으로 처리

# 센서 데이터 퍼블리시 루프
try:
    while True:
        distance = circuit.measure_distance()  # 초음파 센서로부터 거리 읽기
        client.publish("ultrasonic", distance)  # "ultrasonic" 토픽으로 거리 정보 퍼블리시
        temp = circuit.getTemperature(circuit.sensor)  # 온도 센서로부터 온도 읽기
        client.publish("temperature", temp)  # "temperature" 토픽으로 온도 정보 퍼블리시
        hum = circuit.getHumidity(circuit.sensor)  # 습도 센서로부터 습도 읽기
        client.publish("humidity", hum)  # "humidity" 토픽으로 습도 정보 퍼블리시
        lig = circuit.mcp.read_adc(0)  # 조도 센서 값 읽기 (채널 0 사용)
        # 조도 값에 따라 LED 제어 (조도가 100보다 낮으면 밤으로 판단)
        if lig < 100:
            circuit.controlLEDS(1)  # 조도가 낮으면 LED 켜기
        else:
            circuit.controlLEDS(0)  # 조도가 충분하면 LED 끄기
        client.publish("light", lig)  # "light" 토픽으로 조도 정보 퍼블리시
        time.sleep(1)  # 1초 동안 대기 (주기적으로 데이터 퍼블리시)
except KeyboardInterrupt:
    # 사용자가 프로그램을 종료하면 예외 처리
    pass
finally:
    # 자원 해제 및 정리 작업
    circuit.camera.release()  # 카메라 장치 해제
    client.loop_stop()  # 메시지 루프를 실행하는 스레드 종료
    client.disconnect()  # MQTT 브로커와 연결 종료
    circuit.GPIO.cleanup()  # GPIO 설정 해제
