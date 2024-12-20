let client = null; // MQTT 클라이언트의 역할을 하는 Client 객체를 가리키는 전역변수
let connectionFlag = false; // 연결 상태이면 true
const CLIENT_ID = "client-" + Math.floor((1 + Math.random()) * 0x10000000000).toString(16); // 사용자 ID 랜덤 생성

// 브로커에 접속하는 함수
function connect() {
    if (connectionFlag == true) return; // 현재 연결 상태이므로 다시 연결하지 않음
    
    let url = new String(document.location); // 현재 URL에서 브로커 IP 주소를 추출하기 위한 문자열
    let ip = (url.split("//"))[1]; // ip = "192...:8080/" 형식으로 URL에서 IP 주소 부분 추출
    ip = (ip.split(":"))[0]; // ip = "192..." 형식으로 포트 번호 제거하여 순수 IP 주소만 남김
    let broker = ip; // 브로커의 IP 주소 설정
    let port = 9001; // 웹소켓을 위한 포트 번호 설정

    // MQTT 메시지 전송 기능을 모두 가진 Paho client 객체 생성
    client = new Paho.MQTT.Client(broker, Number(port), CLIENT_ID);

    // client 객체에 콜백 함수 등록 및 연결 설정
    client.onConnectionLost = onConnectionLost; // 접속 끊김 시 onConnectLost() 실행
    client.onMessageArrived = onMessageArrived; // 메시지 도착 시 onMessageArrived() 실행

    // client 객체에게 브로커에 접속 지시
    client.connect({
        onSuccess: onConnect, // 브로커로부터 접속 응답 시 onConnect() 실행
        onFailure: onFailure // 접속 실패 시 onFailure() 실행
    });
}

// 브로커로의 접속이 성공할 때 호출되는 함수
function onConnect() {
    connectionFlag = true; // 연결 상태로 설정
    subscribe("temperature"); // 연결 성공 시 온도 토픽 구독
}

// 브로커로의 접속이 실패할 때 호출되는 함수
function onFailure(responseObject) {
    alert("브로커에 연결할 수 없습니다. 브로커 주소와 포트를 확인하세요."); // 연결 실패 시 사용자에게 알림
}

// 특정 토픽을 구독하는 함수
function subscribe(topic) {
    if (connectionFlag != true) { // 연결되지 않은 경우
        alert("연결되지 않았음"); // 사용자에게 연결되지 않았음을 알림
        return false;
    }

    client.subscribe(topic); // 브로커에 구독 신청
    return true;
}

// 특정 토픽에 메시지를 발행하는 함수
function publish(topic, msg) {
    if (connectionFlag != true) { // 연결되지 않은 경우
        alert("연결되지 않았음"); // 사용자에게 연결되지 않았음을 알림
        return false;
    }
    client.send(topic, msg, 0, false); // 메시지 발행
    return true;
}

// 특정 토픽의 구독을 취소하는 함수
function unsubscribe(topic) {
    if (connectionFlag != true) return; // 연결되지 않은 경우 아무 작업도 하지 않음
    client.unsubscribe(topic, null); // 브로커에 구독 신청 취소
}

// 접속이 끊어졌을 때 호출되는 함수
function onConnectionLost(responseObject) { // responseObject는 응답 패킷
    connectionFlag = false; // 연결되지 않은 상태로 설정
}

// 메시지가 도착할 때 호출되는 함수
function onMessageArrived(msg) { // 매개변수 msg는 도착한 MQTT 메시지를 담고 있는 객체
    const temperature = parseFloat(msg.payloadString); // 수신된 메시지에서 온도 정보를 추출
    decideSeason(temperature); // 온도에 따라 계절 결정
    updateItems(); // 계절에 맞는 항목 업데이트
}

// 연결 해제 버튼이 선택되었을 때 호출되는 함수
function disconnect() {
    if (connectionFlag == false) return; // 연결되지 않은 상태이면 아무 작업도 하지 않음

    client.disconnect(); // 브로커와 접속 해제

    connectionFlag = false; // 연결되지 않은 상태로 설정
}
