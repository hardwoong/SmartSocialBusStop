let client = null; // MQTT 클라이언트를 가리키는 전역 변수
let connectionFlag = false; // 연결 상태를 나타내는 플래그, 연결되면 true
const CLIENT_ID = "client-" + Math.floor((1 + Math.random()) * 0x10000000000).toString(16); // 클라이언트 ID를 랜덤으로 생성

// MQTT 브로커에 연결하는 함수
function connect() {
    if (connectionFlag == true) return; // 이미 연결되어 있으면 함수를 종료

    let url = new String(document.location); // 현재 URL을 문자열로 변환
    let ip = (url.split("//"))[1]; // URL에서 IP 주소 부분 추출 ("192...:8080/")
    ip = (ip.split(":"))[0]; // 포트 번호 제거하여 순수 IP 주소만 남김 ("192...")
    let broker = ip; // 브로커의 IP 주소 설정
    let port = 9001; // 웹소켓을 위한 포트 번호 설정

    client = new Paho.MQTT.Client(broker, Number(port), CLIENT_ID); // MQTT 클라이언트 객체 생성

    // 콜백 함수 등록
    client.onConnectionLost = onConnectionLost; // 연결 끊김 시 호출되는 함수 등록
    client.onMessageArrived = onMessageArrived; // 메시지 도착 시 호출되는 함수 등록

    // 브로커에 연결 요청
    client.connect({
        onSuccess: function() { // 연결 성공 시 실행
            connectionFlag = true; // 연결 상태를 true로 설정
        },
        onFailure: function(e) { // 연결 실패 시 실행
            alert("MQTT 연결 실패: " + e.errorMessage); // 연결 실패 메시지 출력
        }
    });
}

// 특정 토픽을 구독하는 함수
function subscribe(topic) {
    if (connectionFlag != true) { // 연결되지 않은 경우
        alert("연결되지 않았음"); // 연결되지 않았음을 알림
        return false;
    }

    // 구독 신청 정보 출력
    document.getElementById("messages").innerHTML += '<span>구독신청: 토픽 ' + topic + '</span><br/>';
    client.subscribe(topic); // 클라이언트에게 토픽 구독 요청
    return true;
}

// 특정 토픽에 메시지를 발행하는 함수
function publish(topic, msg) {
    if (connectionFlag != true) { // 연결되지 않은 경우
        alert("연결되지 않았음"); // 연결되지 않았음을 알림
        return false;
    }
    client.send(topic, String(msg), 0, false); // 메시지를 문자열로 변환하여 퍼블리시
    // 퍼블리시 정보 출력
    document.getElementById("messages").innerHTML += '<span>퍼블리시: 토픽 ' + topic + ' 메시지: ' + msg + '</span><br/>';
    return true;
}

// 메시지가 도착했을 때 호출되는 함수
function onMessageArrived(msg) {
    console.log("onMessageArrived: " + msg.payloadString); // 도착한 메시지의 내용 출력
    console.log("토픽: " + msg.destinationName); // 도착한 메시지의 토픽 출력
}

// 연결이 끊어졌을 때 호출되는 함수
function onConnectionLost(responseObject) {
    connectionFlag = false; // 연결 상태를 false로 설정
}