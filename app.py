from flask import Flask, render_template, request

# Flask 애플리케이션 인스턴스 생성
app = Flask(__name__)

# 자바스크립트 코드나 이미지 파일 등 정적 파일에 대해 
# 브라우저가 캐시된 버전을 사용하지 않고 항상 최신 버전을 사용하도록 설정
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# '/' 경로로 접근할 때 index.html 페이지를 렌더링하여 반환
@app.route('/')
def index():
    return render_template('index.html')

# '/temperature-chart' 경로로 GET 요청이 들어왔을 때
# temperature_chart.html 페이지를 렌더링하여 반환
@app.route('/temperature-chart', methods=['GET'])
def temperature_chart():
    return render_template('temperature_chart.html')

# '/humidity-chart' 경로로 GET 요청이 들어왔을 때
# humidity_chart.html 페이지를 렌더링하여 반환
@app.route('/humidity-chart', methods=['GET'])
def humidity_chart():
    return render_template('humidity_chart.html')

# '/distance-chart' 경로로 GET 요청이 들어왔을 때
# distance_chart.html 페이지를 렌더링하여 반환
@app.route('/distance-chart', methods=['GET'])
def distance_chart():
    return render_template('distance_chart.html')

# '/light-chart' 경로로 GET 요청이 들어왔을 때
# light_chart.html 페이지를 렌더링하여 반환
@app.route('/light-chart', methods=['GET'])
def light_chart():
    return render_template('light_chart.html')

# '/smalltalk' 경로로 GET 요청이 들어왔을 때
# smalltalk.html 페이지를 렌더링하여 반환
@app.route('/smalltalk', methods=['GET'])
def smalltalk():
    return render_template('smalltalk.html')

# 애플리케이션을 실행하는 코드
# 호스트는 '0.0.0.0'으로 설정되어 외부에서 접근 가능하도록 하고
# 포트는 8080번을 사용하며, 디버그 모드를 활성화
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)