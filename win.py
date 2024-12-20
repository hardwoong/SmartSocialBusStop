import io
import time
import paho.mqtt.client as mqtt

# MQTT 브로커와 연결이 성공했을 때 호출되는 콜백 함수
def on_connect(client, userdata, flag, rc, prop=None):
    client.subscribe("pic")  # "pic" 토픽에 대한 구독 설정

# MQTT 메시지를 수신했을 때 호출되는 콜백 함수
def on_message(client, userdata, msg):
    # 수신한 메시지를 파일로 저장
    filename = './pic/image%d.jpg' % (time.time() * 10)  # 파일명은 현재 시간을 기준으로 생성
    with open(filename, "wb") as file:  # 파일을 쓰기 모드로 열기, 없으면 생성
        file.write(msg.payload)  # 수신한 이미지 데이터를 파일에 기록

# MQTT 브로커 IP 주소 설정
ip = "localhost"

# MQTT 클라이언트 객체 생성 및 콜백 함수 설정
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

# MQTT 브로커에 연결
client.connect(ip, 1883)  # 로컬 브로커의 포트는 1883번 사용
client.loop_forever()  # 메시지 루프 실행하여 지속적으로 메시지 처리
