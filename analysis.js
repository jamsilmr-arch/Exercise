window.activeTab = 'analysis';

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
    window.scrollTo(0, 0);
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
    
    // [수정됨] 고정 더미 데이터 삭제. 
    // 나중에 localStorage나 DB 연동 시 이 배열 안에 데이터를 푸시하면 자동으로 차트가 그려집니다.
    const history = []; 

    let max1RM = 0;
    let maxVol = 0;
    
    // 데이터 분석 계산
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

    // [신규] 입력된 데이터가 없을 때의 텅 빈 화면(Empty State) 처리
    if (chartData.length === 0) {
        html += `
            <div class="ad-chart-container" style="display:flex; justify-content:center; align-items:center; color:#666; font-size:0.9rem; text-align:center;">
                아직 기록된 데이터가 없습니다.<br>운동을 완료하면 분석 그래프가 나타납니다.
            </div>
            <div class="ad-history-title">최근 운동 기록</div>
            <div class="ad-history-list">
                <div class="ad-history-item" style="justify-content:center; color:#555; font-size:0.9rem;">
                    기록 없음
                </div>
            </div>
        `;
        document.getElementById('ad-render').innerHTML = html;
        return; // 차트 그리기 로직 건너뜀
    }

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

    // 하단 히스토리 내역
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

    // 1RM 선 긋기 애니메이션
    if (currentChartType === '1RM' && chartData.length > 1) {
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
