let ctx = null;
let chart = null;
let config = {
	type: 'line', // 라인그래프
	// data는 차트에 출력될 전체 데이터 표현
	data: {
		// labels는 배열로 데이터의 레이블들
		labels: [],
		// datasets 배열로 이 차트에 그려질 모든 데이터 셋 표현. 그래프 1개만 있음
		datasets: [{
			label: '온도 센서로부터 측정된 실시간 기온', // 데이터셋 레이블
			backgroundColor: 'rgba(255, 99, 132, 0.2)', // 그래프 배경 색상 (연한 빨간색)
			borderColor: 'rgb(255, 69, 0)', // 그래프 선 색상 (오렌지 레드)
			borderWidth: 2, // 그래프 선 두께
			data: [], // 각 레이블에 해당하는 데이터 값
			fill : false, // 채우지 않고 선만 그리기
		}]
	},
	// 차트의 속성 지정
	options: {
		responsive : false, // 크기 조절 금지 (고정된 크기 사용)
		scales: { // x축과 y축 정보
			xAxes: [{
				display: true, // x축 표시 여부
				scaleLabel: { display: true, labelString: '시간(초)' }, // x축 레이블
			}],
			yAxes: [{
				display: true, // y축 표시 여부
				scaleLabel: { display: true, labelString: '섭씨(°C)' }, // y축 레이블
				ticks: {
					min: -15, // y축 최소값 설정
					max: 40 // y축 최대값 설정
				}
			}]
		}
	}
};

let LABEL_SIZE = 20; // 차트에 그려지는 데이터의 개수 
let tick = 0; // 도착한 데이터의 개수. tick의 범위는 0에서 99까지만 유지 

// 차트를 그리기 위한 초기 설정 함수
function drawChart() {
	ctx = document.getElementById('canvas').getContext('2d'); // 캔버스의 2D 컨텍스트 가져오기
	chart = new Chart(ctx, config); // Chart.js를 사용해 차트 생성
	init(); // 초기 레이블 설정 함수 호출
} 

// 차트의 레이블 초기화 함수
function init() { // chart.data.labels의 크기를 LABEL_SIZE로 만들고 0~19까지 레이블 붙이기
	for(let i=0; i<LABEL_SIZE; i++) {
		chart.data.labels[i] = i; // 각 레이블에 숫자 할당
	}
	chart.update(); // 차트 업데이트
}

// 차트에 새로운 데이터를 추가하는 함수
function addChartData(value) {
	let n = chart.data.datasets[0].data.length; // 현재 데이터의 개수 
	if(n < LABEL_SIZE) // 현재 데이터 개수가 LABEL_SIZE보다 작은 경우
		chart.data.datasets[0].data.push(value); // 새 데이터를 data 배열에 추가
	else { // 현재 데이터 개수가 LABEL_SIZE를 넘어서는 경우
		// 새 데이터 value 삽입
		chart.data.datasets[0].data.push(value); // value를 data[]의 맨 끝에 추가
		chart.data.datasets[0].data.shift(); // data[]의 맨 앞에 있는 데이터 제거 (FIFO 방식)
		// 레이블 삽입
		chart.data.labels.push(tick); // tick(인덱스)을 labels[]의 맨 끝에 추가
		chart.data.labels.shift(); // labels[]의 맨 앞에 있는 값 제거
	}
	tick++; // 도착한 데이터의 개수 증가
	tick %= 100; // tick의 범위는 0에서 99까지만 유지. 100보다 크면 다시 0부터 시작
	chart.update(); // 차트 업데이트

	// 상태 표시 업데이트
	let status = document.getElementById("status"); // 상태를 표시할 요소 가져오기
	if(value < 10) { // 기온이 10도 미만인 경우
		status.innerHTML = "매우추움"; // 상태를 '매우추움'으로 설정
		status.style.color = "blue"; // 텍스트 색상을 파란색으로 설정
	}
	else if(value >= 10 && value <= 25) { // 기온이 10도 이상 25도 이하인 경우
		status.innerHTML = "보통"; // 상태를 '보통'으로 설정
		status.style.color = "green"; // 텍스트 색상을 초록색으로 설정
	}
	else { // 기온이 25도보다 큰 경우
		status.innerHTML = "매우더움"; // 상태를 '매우더움'으로 설정
		status.style.color = "red"; // 텍스트 색상을 빨간색으로 설정
	}
}
