let client = null; // MQTT 클라이언트의 역할을 하는 Client 객체를 가리키는 전역변수
let connectionFlag = false; // 연결 상태를 나타내는 변수. 연결되면 true
const CLIENT_ID = "client-" + Math.floor((1 + Math.random()) * 0x10000000000).toString(16); // 사용자 ID를 랜덤하게 생성하여 고유하게 만듦

// MQTT 브로커에 접속하는 함수
function connect() {
    if (connectionFlag == true) {
        return; // 이미 연결된 상태라면 다시 연결하지 않음
    }
    
    // 현재 페이지 URL에서 브로커의 IP 주소와 포트 번호 추출하기
    let url = new String(document.location);
    let ip = (url.split("//"))[1]; // ip = "192...:8080/"
    ip = (ip.split(":"))[0]; // ip = "192..."
    let broker = ip; // 브로커의 IP 주소
    let port = 9001; // mosquitto를 웹소켓으로 접속할 포트 번호
    
    // MQTT 메시지 전송 기능을 가진 Paho client 객체 생성
    client = new Paho.MQTT.Client(broker, Number(port), CLIENT_ID);

    // client 객체에 콜백 함수 등록
    client.onConnectionLost = onConnectionLost; // 접속 끊김 시 호출되는 함수
    client.onMessageArrived = onMessageArrived; // 메시지 도착 시 호출되는 함수
    
    // client 객체를 통해 브로커에 접속 시도
    client.connect({
        onSuccess: onConnect, // 브로커에 접속이 성공했을 때 호출되는 함수
    });
}

// 브로커로의 접속이 성공할 때 호출되는 함수
function onConnect() {
    connectionFlag = true; // 연결 상태를 true로 설정
}

// 특정 토픽을 구독하는 함수
function subscribe(topic) {
    if (connectionFlag != true) { // 연결되지 않은 경우
        alert("연결되지 않았음");
        return false;
    }

    client.subscribe(topic); // 브로커에 구독 요청
    return true;
}

// 특정 토픽으로 메시지를 발행하는 함수
function publish(topic, msg) {
    if (connectionFlag != true) { // 연결되지 않은 경우
        alert("연결되지 않았음");
        return false;
    }
    client.send(topic, msg, 0, false); // 메시지 발행
    return true;
}

// 특정 토픽에 대한 구독을 취소하는 함수
function unsubscribe(topic) {
    if (connectionFlag != true) return; // 연결되지 않은 경우
    client.unsubscribe(topic, null); // 브로커에 구독 취소 요청
}

// 접속이 끊어졌을 때 호출되는 함수
function onConnectionLost(responseObject) { // responseObject는 응답 패킷을 나타냄
    connectionFlag = false; // 연결되지 않은 상태로 설정
}

// 메시지가 도착할 때 호출되는 함수
function onMessageArrived(msg) { // 매개변수 msg는 도착한 MQTT 메시지를 담고 있는 객체
    console.log("onMessageArrived: " + msg.payloadString); // 수신된 메시지를 콘솔에 출력
    addChartData(parseFloat(msg.payloadString)); // 차트에 새로운 데이터 추가
}

// 브로커와의 연결을 해제하는 함수
function disconnect() {
    if (connectionFlag == false) 
        return; // 연결되지 않은 상태라면 그냥 리턴

    // 켜져 있는 LED 끄기
    if (document.getElementById("ledOn").checked == true) {
        client.send('led', "0", 0, false); // LED를 끄도록 메시지 발행
        document.getElementById("ledOff").checked = true; // LED 끄기 버튼을 선택된 상태로 변경
    }
    client.disconnect(); // 브로커와의 연결 해제
    connectionFlag = false; // 연결되지 않은 상태로 설정
}

// 캔버스 보이기/숨기기 기능을 제공하는 함수
function hideshow() { // 캔버스를 보이거나 숨기는 함수
    let canvas = document.getElementById('canvas'); // canvas DOM 객체 가져오기
    if (canvas.style.display == "none") // canvas 객체가 보이지 않는다면
        canvas.style.display = "inline-block"; // canvas 객체를 보이게 설정
    else 
        canvas.style.display = "none";  // canvas 객체를 보이지 않게 설정
}
