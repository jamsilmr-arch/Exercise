window.activeTab = 'analysis';

// 가상의 운동 기록 데이터 (실제 서비스에서는 Firebase에서 불러옴)
const mockHistoryData = {
    '오버헤드 프레스': [
        { date: '08. 25', weight: 40, reps: 8, sets: 4 }, // 1RM: 50.6, Vol: 1280
        { date: '09. 01', weight: 45, reps: 7, sets: 4 }, // 1RM: 55.5, Vol: 1260
        { date: '09. 08', weight: 50, reps: 6, sets: 4 }  // 1RM: 60.0, Vol: 1200
    ],
    '바벨 바이셉 컬': [
        { date: '08. 25', weight: 20, reps: 10, sets: 3 }, // 1RM: 26.6, Vol: 600
        { date: '09. 01', weight: 25, reps: 8, sets: 3 },  // 1RM: 31.6, Vol: 600
        { date: '09. 08', weight: 25, reps: 10, sets: 3 }  // 1RM: 33.3, Vol: 750
    ]
};

// 1RM 계산 공식 (Epley Formula)
function calculate1RM(weight, reps) {
    if(reps === 1) return weight;
    return Math.round(weight * (1 + (reps / 30)) * 10) / 10;
}

let currentChartType = '1RM';
let currentExercise = '';

window.openPerfDetail = function(name) {
    currentExercise = name;
    currentChartType = '1RM'; // 기본 탭은 1RM
    renderAnalysisDetail();
    
    document.getElementById('view-analysis-list').classList.remove('active');
    document.getElementById('view-analysis-list').style.display = 'none';
    document.getElementById('view-analysis-detail').classList.add('active');
    document.getElementById('view-analysis-detail').style.display = 'block';
    
    const mainNav = document.getElementById('main-nav');
    if (mainNav) mainNav.style.display = 'none';
};

window.closePerfDetail = function() {
    document.getElementById('view-analysis-detail').classList.remove('active');
    document.getElementById('view-analysis-detail').style.display = 'none';
    document.getElementById('view-analysis-list').classList.add('active');
    document.getElementById('view-analysis-list').style.display = 'block';
    
    const mainNav = document.getElementById('main-nav');
    if (mainNav) mainNav.style.display = 'flex';
};

window.switchChartType = function(type) {
    currentChartType = type;
    renderAnalysisDetail();
};

function renderAnalysisDetail() {
    document.getElementById('ad-title').innerText = currentExercise;
    
    // 데이터가 없는 종목은 더미 데이터 생성
    const history = mockHistoryData[currentExercise] || [
        { date: '09. 01', weight: 15, reps: 12, sets: 3 },
        { date: '09. 08', weight: 20, reps: 10, sets: 3 }
    ];

    let max1RM = 0;
    let maxVol = 0;
    
    // 데이터 분석
    const chartData = history.map(h => {
        const est1RM = calculate1RM(h.weight, h.reps);
        const volume = h.weight * h.reps * h.sets;
        if(est1RM > max1RM) max1RM = est1RM;
        if(volume > maxVol) maxVol = volume;
        return { date: h.date, rm: est1RM, vol: volume, raw: h };
    });
    
    let html = `
        <div class="ad-top-summary">
            <div class="ad-sum-box highlight">
                <span class="ad-sum-label">최고 추정 1RM</span>
                <span class="ad-sum-val">${max1RM}<span>kg</span></span>
            </div>
            <div class="ad-sum-box">
                <span class="ad-sum-label">최대 볼륨</span>
                <span class="ad-sum-val">${maxVol}<span>kg</span></span>
            </div>
        </div>

        <div class="ad-tabs">
            <button class="ad-tab ${currentChartType === '1RM' ? 'active' : ''}" onclick="switchChartType('1RM')">추정 1RM 추이</button>
            <button class="ad-tab ${currentChartType === 'VOL' ? 'active' : ''}" onclick="switchChartType('VOL')">총 볼륨 추이</button>
        </div>
    `;

    const yMax = currentChartType === '1RM' ? max1RM * 1.2 : maxVol * 1.2;
    const yMid = Math.round(yMax / 2);
    
    let chartHtml = `
        <div class="ad-chart-container">
            <div class="ad-y-axis"><span>${Math.round(yMax)}</span><span>${yMid}</span><span>0</span></div>
            <div class="ad-chart-content" id="chart-line-box">
    `;

    chartData.forEach((d, i) => {
        const value = currentChartType === '1RM' ? d.rm : d.vol;
        const percent = (value / yMax) * 100;
        
        chartHtml += `<div class="ad-col" id="col-${i}">`;
        
        if (currentChartType === '1RM') {
            chartHtml += `<div class="ad-val-label">${value}</div>`;
            chartHtml += `<div class="ad-dot" style="bottom: ${percent}%;"></div>`;
        } else {
            chartHtml += `<div class="ad-val-label">${value}</div>`;
            chartHtml += `<div class="ad-bar" style="height: ${percent}%;"></div>`;
        }
        
        chartHtml += `<div class="ad-x-label">${d.date}</div></div>`;
    });

    chartHtml += `</div></div>`;
    html += chartHtml;

    // 히스토리 내역
    html += `<div class="ad-history-title">최근 운동 기록</div><div class="ad-history-list">`;
    [...chartData].reverse().forEach(d => {
        html += `
            <div class="ad-history-item">
                <span class="ad-h-date">${d.date}</span>
                <span class="ad-h-data">${d.raw.sets}세트 <span>${d.raw.weight}kg × ${d.raw.reps}회</span></span>
            </div>
        `;
    });
    html += `</div>`;

    document.getElementById('ad-render').innerHTML = html;

    // 1RM 선 그리기
    if (currentChartType === '1RM') {
        setTimeout(() => {
            const box = document.getElementById('chart-line-box');
            if(!box) return;
            const dots = box.querySelectorAll('.ad-dot');
            for(let i=0; i<dots.length-1; i++) {
                const d1 = dots[i].getBoundingClientRect();
                const d2 = dots[i+1].getBoundingClientRect();
                const boxRect = box.getBoundingClientRect();
                
                const x1 = d1.left - boxRect.left + (d1.width/2);
                const y1 = d1.top - boxRect.top + (d1.height/2);
                const x2 = d2.left - boxRect.left + (d2.width/2);
                const y2 = d2.top - boxRect.top + (d2.height/2);

                const length = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
                const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;

                const line = document.createElement('div');
                line.className = 'ad-line';
                line.style.width = `${length}px`;
                line.style.left = `${x1}px`;
                line.style.top = `${y1}px`;
                line.style.transform = `rotate(${angle}deg)`;
                
                box.appendChild(line);
            }
        }, 50);
    }
}
